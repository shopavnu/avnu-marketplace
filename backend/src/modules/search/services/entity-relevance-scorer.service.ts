import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchEntityType } from '../enums/search-entity-type.enum';
import { EntityBoostingDto } from '../dto/entity-specific-filters.dto';

/**
 * Service for scoring and boosting entity relevance in multi-entity searches
 */
@Injectable()
export class EntityRelevanceScorerService {
  private readonly logger = new Logger(EntityRelevanceScorerService.name);
  private readonly defaultProductBoost: number;
  private readonly defaultMerchantBoost: number;
  private readonly defaultBrandBoost: number;
  private readonly userHistoryBoostFactor: number;
  private readonly userPreferencesBoostFactor: number;

  constructor(private readonly configService: ConfigService) {
    this.defaultProductBoost = this.configService.get<number>('SEARCH_DEFAULT_PRODUCT_BOOST', 1.0);
    this.defaultMerchantBoost = this.configService.get<number>(
      'SEARCH_DEFAULT_MERCHANT_BOOST',
      0.8,
    );
    this.defaultBrandBoost = this.configService.get<number>('SEARCH_DEFAULT_BRAND_BOOST', 0.8);
    this.userHistoryBoostFactor = this.configService.get<number>(
      'SEARCH_USER_HISTORY_BOOST_FACTOR',
      1.2,
    );
    this.userPreferencesBoostFactor = this.configService.get<number>(
      'SEARCH_USER_PREFERENCES_BOOST_FACTOR',
      1.5,
    );
  }

  /**
   * Apply entity-specific boosting to search results
   * @param results Search results from Elasticsearch
   * @param entityType Entity type
   * @param entityBoosting Entity boosting factors
   * @returns Boosted search results
   */
  applyEntityBoosting(
    results: any,
    entityType: SearchEntityType,
    entityBoosting?: EntityBoostingDto,
  ): any {
    // If we're searching a specific entity type, no need for entity boosting
    if (entityType !== SearchEntityType.ALL) {
      return results;
    }

    // Get boosting factors
    const productBoost = entityBoosting?.productBoost ?? this.defaultProductBoost;
    const merchantBoost = entityBoosting?.merchantBoost ?? this.defaultMerchantBoost;
    const brandBoost = entityBoosting?.brandBoost ?? this.defaultBrandBoost;

    // Apply boosting to each hit
    if (results.hits && results.hits.hits) {
      results.hits.hits.forEach(hit => {
        const index = hit._index;
        let boostFactor = 1.0;

        // Apply entity-specific boost
        if (index === 'products') {
          boostFactor = productBoost;
        } else if (index === 'merchants') {
          boostFactor = merchantBoost;
        } else if (index === 'brands') {
          boostFactor = brandBoost;
        }

        // Apply boost to score
        hit._score = hit._score * boostFactor;
      });

      // Re-sort hits by score
      results.hits.hits.sort((a, b) => b._score - a._score);
    }

    return results;
  }

  /**
   * Calculate user-specific entity boosts based on history and preferences
   * @param user User
   * @returns User-specific entity boosts
   */
  private calculateUserEntityBoosts(): {
    productBoost: number;
    merchantBoost: number;
    brandBoost: number;
  } {
    // Default boosts
    const boosts = {
      productBoost: 1.0,
      merchantBoost: 1.0,
      brandBoost: 1.0,
    };

    return boosts;
  }

  /**
   * Build Elasticsearch query with entity boosting
   * @param baseQuery Base Elasticsearch query
   * @param entityType Entity type
   * @param entityBoosting Entity boosting factors
   * @returns Enhanced Elasticsearch query with entity boosting
   */
  enhanceQueryWithEntityBoosting(
    baseQuery: any,
    entityType: SearchEntityType,
    entityBoosting?: EntityBoostingDto,
  ): any {
    // If we're searching a specific entity type, no need for entity boosting
    if (entityType !== SearchEntityType.ALL) {
      return baseQuery;
    }

    // Get boosting factors
    const productBoost = entityBoosting?.productBoost ?? this.defaultProductBoost;
    const merchantBoost = entityBoosting?.merchantBoost ?? this.defaultMerchantBoost;
    const brandBoost = entityBoosting?.brandBoost ?? this.defaultBrandBoost;

    // Create function score query with entity boosting
    return {
      function_score: {
        query: baseQuery,
        functions: [
          {
            filter: { term: { _index: 'products' } },
            weight: productBoost,
          },
          {
            filter: { term: { _index: 'merchants' } },
            weight: merchantBoost,
          },
          {
            filter: { term: { _index: 'brands' } },
            weight: brandBoost,
          },
        ],
        score_mode: 'multiply',
        boost_mode: 'multiply',
      },
    };
  }

  /**
   * Normalize scores across different entity types
   * @param results Combined search results
   * @returns Normalized search results
   */
  normalizeScores(results: any): any {
    if (!results.hits || !results.hits.hits || results.hits.hits.length === 0) {
      return results;
    }

    // Group hits by entity type
    const hitsByType = {
      products: [],
      merchants: [],
      brands: [],
    };

    // Group and find max scores by type
    const maxScoreByType = {
      products: 0,
      merchants: 0,
      brands: 0,
    };

    results.hits.hits.forEach(hit => {
      const index = hit._index;
      if (index === 'products') {
        hitsByType.products.push(hit);
        maxScoreByType.products = Math.max(maxScoreByType.products, hit._score);
      } else if (index === 'merchants') {
        hitsByType.merchants.push(hit);
        maxScoreByType.merchants = Math.max(maxScoreByType.merchants, hit._score);
      } else if (index === 'brands') {
        hitsByType.brands.push(hit);
        maxScoreByType.brands = Math.max(maxScoreByType.brands, hit._score);
      }
    });

    // Normalize scores within each entity type
    Object.keys(hitsByType).forEach(type => {
      const hits = hitsByType[type];
      const maxScore = maxScoreByType[type];

      if (maxScore > 0) {
        hits.forEach(hit => {
          // Normalize to 0-1 range
          hit._normalized_score = hit._score / maxScore;
        });
      }
    });

    // Combine all hits and sort by normalized score
    const normalizedHits = [
      ...hitsByType.products,
      ...hitsByType.merchants,
      ...hitsByType.brands,
    ].sort((a, b) => (b._normalized_score || 0) - (a._normalized_score || 0));

    // Replace original hits with normalized hits
    results.hits.hits = normalizedHits;

    return results;
  }

  /**
   * Calculate relevance score for entity in multi-entity search
   * @param entityType Entity type
   * @param query Search query
   * @param source Entity source data
   * @returns Relevance score (0-1)
   */
  calculateEntityRelevance(entityType: SearchEntityType, query: string, source: any): number {
    if (!query || !source) {
      return 0.5; // Default middle relevance
    }

    const queryTerms = query.toLowerCase().split(/\s+/);
    let relevanceScore = 0;

    switch (entityType) {
      case SearchEntityType.PRODUCT:
        // Calculate product relevance
        relevanceScore = this.calculateProductRelevance(queryTerms, source);
        break;
      case SearchEntityType.MERCHANT:
        // Calculate merchant relevance
        relevanceScore = this.calculateMerchantRelevance(queryTerms, source);
        break;
      case SearchEntityType.BRAND:
        // Calculate brand relevance
        relevanceScore = this.calculateBrandRelevance(queryTerms, source);
        break;
      default:
        relevanceScore = 0.5;
    }

    return Math.min(1, Math.max(0, relevanceScore));
  }

  /**
   * Calculate product relevance score
   * @param queryTerms Query terms
   * @param product Product data
   * @returns Relevance score (0-1)
   */
  private calculateProductRelevance(queryTerms: string[], product: any): number {
    let score = 0;
    const maxScore = 10;

    // Check title for exact matches
    const title = (product.title || '').toLowerCase();
    queryTerms.forEach(term => {
      if (title.includes(term)) {
        score += 2;
      }
    });

    // Check description
    const description = (product.description || '').toLowerCase();
    queryTerms.forEach(term => {
      if (description.includes(term)) {
        score += 1;
      }
    });

    // Check categories
    const categories = product.categories || [];
    categories.forEach(category => {
      const categoryName = category.toLowerCase();
      queryTerms.forEach(term => {
        if (categoryName.includes(term)) {
          score += 1.5;
        }
      });
    });

    // Check tags
    const tags = product.tags || [];
    tags.forEach(tag => {
      const tagName = tag.toLowerCase();
      queryTerms.forEach(term => {
        if (tagName.includes(term)) {
          score += 1;
        }
      });
    });

    // Check brand name
    const brandName = (product.brandName || '').toLowerCase();
    queryTerms.forEach(term => {
      if (brandName.includes(term)) {
        score += 1;
      }
    });

    // Normalize score to 0-1 range
    return Math.min(1, score / maxScore);
  }

  /**
   * Calculate merchant relevance score
   * @param queryTerms Query terms
   * @param merchant Merchant data
   * @returns Relevance score (0-1)
   */
  private calculateMerchantRelevance(queryTerms: string[], merchant: any): number {
    let score = 0;
    const maxScore = 10;

    // Check name for exact matches
    const name = (merchant.name || '').toLowerCase();
    queryTerms.forEach(term => {
      if (name.includes(term)) {
        score += 3;
      }
    });

    // Check description
    const description = (merchant.description || '').toLowerCase();
    queryTerms.forEach(term => {
      if (description.includes(term)) {
        score += 1;
      }
    });

    // Check categories
    const categories = merchant.categories || [];
    categories.forEach(category => {
      const categoryName = category.toLowerCase();
      queryTerms.forEach(term => {
        if (categoryName.includes(term)) {
          score += 1.5;
        }
      });
    });

    // Check values
    const values = merchant.values || [];
    values.forEach(value => {
      const valueName = value.toLowerCase();
      queryTerms.forEach(term => {
        if (valueName.includes(term)) {
          score += 1.5;
        }
      });
    });

    // Check location
    const location = (merchant.location || '').toLowerCase();
    queryTerms.forEach(term => {
      if (location.includes(term)) {
        score += 1;
      }
    });

    // Normalize score to 0-1 range
    return Math.min(1, score / maxScore);
  }

  /**
   * Calculate brand relevance score
   * @param queryTerms Query terms
   * @param brand Brand data
   * @returns Relevance score (0-1)
   */
  private calculateBrandRelevance(queryTerms: string[], brand: any): number {
    let score = 0;
    const maxScore = 10;

    // Check name for exact matches
    const name = (brand.name || '').toLowerCase();
    queryTerms.forEach(term => {
      if (name.includes(term)) {
        score += 3;
      }
    });

    // Check description
    const description = (brand.description || '').toLowerCase();
    queryTerms.forEach(term => {
      if (description.includes(term)) {
        score += 1;
      }
    });

    // Check categories
    const categories = brand.categories || [];
    categories.forEach(category => {
      const categoryName = category.toLowerCase();
      queryTerms.forEach(term => {
        if (categoryName.includes(term)) {
          score += 1.5;
        }
      });
    });

    // Check values
    const values = brand.values || [];
    values.forEach(value => {
      const valueName = value.toLowerCase();
      queryTerms.forEach(term => {
        if (valueName.includes(term)) {
          score += 1.5;
        }
      });
    });

    // Check location
    const location = (brand.location || '').toLowerCase();
    queryTerms.forEach(term => {
      if (location.includes(term)) {
        score += 1;
      }
    });

    // Check story
    const story = (brand.story || '').toLowerCase();
    queryTerms.forEach(term => {
      if (story.includes(term)) {
        score += 0.5;
      }
    });

    // Normalize score to 0-1 range
    return Math.min(1, score / maxScore);
  }
}
