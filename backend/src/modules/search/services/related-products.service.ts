import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';
import { PersonalizationService } from '../../personalization/services/personalization.service';
import { Product } from '../../products/entities/product.entity';

@Injectable()
export class RelatedProductsService {
  private readonly logger = new Logger(RelatedProductsService.name);

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly personalizationService: PersonalizationService,
  ) {}

  /**
   * Get related products based on a product's categories, tags, and values
   *
   * @param productId Product ID to find related products for
   * @param userId Optional user ID for personalization
   * @param options Additional options for related products
   */
  async getRelatedProducts(
    productId: string,
    userId?: string,
    options: {
      limit?: number;
      categoryWeight?: number;
      tagWeight?: number;
      valueWeight?: number;
      brandWeight?: number;
      priceRangeWeight?: number;
      includeOutOfStock?: boolean;
    } = {},
  ): Promise<any> {
    try {
      // Set default options
      const limit = options.limit || 10;
      const categoryWeight = options.categoryWeight || 2.0;
      const tagWeight = options.tagWeight || 1.5;
      const valueWeight = options.valueWeight || 2.5; // Higher weight for values
      const brandWeight = options.brandWeight || 1.0;
      const priceRangeWeight = options.priceRangeWeight || 0.5;
      const includeOutOfStock = options.includeOutOfStock || false;

      // Get the source product
      const productResponse = await (this.elasticsearchService as any).client
        .get({
          index: 'products',
          id: productId,
        })
        .catch(() => null);

      if (!productResponse || !productResponse._source) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      const product = productResponse._source as Product;

      // Build query for related products
      const should = [];
      const must = [];
      const mustNot = [];

      // Don't include the source product
      mustNot.push({
        term: {
          id: productId,
        },
      });

      // Only include in-stock products unless specified otherwise
      if (!includeOutOfStock) {
        must.push({
          term: {
            inStock: true,
          },
        });
      }

      // Match by categories with boosting
      if (product.categories && product.categories.length > 0) {
        should.push({
          terms: {
            'categories.keyword': product.categories,
            boost: categoryWeight,
          },
        });
      }

      // Match by tags with boosting
      if (product.tags && product.tags.length > 0) {
        should.push({
          terms: {
            'tags.keyword': product.tags,
            boost: tagWeight,
          },
        });
      }

      // Match by values with boosting (higher weight for value alignment)
      if (product.values && product.values.length > 0) {
        should.push({
          terms: {
            'values.keyword': product.values,
            boost: valueWeight,
          },
        });
      }

      // Match by brand with boosting
      if (product.brandName) {
        should.push({
          term: {
            'brandName.keyword': {
              value: product.brandName,
              boost: brandWeight,
            },
          },
        });
      }

      // Match by price range with boosting
      if (product.price) {
        const minPrice = Math.max(0, product.price * 0.7); // 30% lower
        const maxPrice = product.price * 1.3; // 30% higher

        should.push({
          range: {
            price: {
              gte: minPrice,
              lte: maxPrice,
              boost: priceRangeWeight,
            },
          },
        });
      }

      // Execute search
      const searchResponse = await (this.elasticsearchService as any).client.search({
        index: 'products',
        body: {
          size: limit * 2, // Get more results than needed for post-processing
          query: {
            bool: {
              must,
              must_not: mustNot,
              should,
              minimum_should_match: 1,
            },
          },
        },
      });

      // Extract and process results
      const hits = searchResponse.hits.hits;

      // Process hits
      let relatedProducts = hits.map(hit => ({
        ...(hit._source as object),
        score: hit._score,
        matchedOn: this.determineMatchFactors(hit._source as Product, product),
      }));

      // Apply personalization if user ID is provided
      if (userId) {
        relatedProducts = await this.applyPersonalization(relatedProducts, userId);
      }

      // Ensure diversity in results
      relatedProducts = this.ensureDiversity(relatedProducts);

      return {
        items: relatedProducts.slice(0, limit),
        total: relatedProducts.length,
        sourceProduct: {
          id: product.id,
          title: product.title,
          categories: product.categories,
          tags: product.tags,
          values: product.values,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get related products: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get complementary products that pair well with the given product
   *
   * @param productId Product ID to find complementary products for
   * @param userId Optional user ID for personalization
   * @param limit Number of complementary products to return
   */
  async getComplementaryProducts(productId: string, userId?: string, limit = 5): Promise<any> {
    try {
      // Get the source product
      const productResponse = await (this.elasticsearchService as any).client
        .get({
          index: 'products',
          id: productId,
        })
        .catch(() => null);

      if (!productResponse || !productResponse._source) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      const product = productResponse._source as Product;

      // Get category-based complementary mappings
      // In a real implementation, this would come from a complementary products database
      const complementaryCategories = this.getComplementaryCategories(product.categories || []);

      // Build query for complementary products
      const should = [];
      const must = [];
      const mustNot = [];

      // Don't include the source product
      mustNot.push({
        term: {
          id: productId,
        },
      });

      // Only include in-stock products
      must.push({
        term: {
          inStock: true,
        },
      });

      // Match by complementary categories with high boosting
      if (complementaryCategories.length > 0) {
        should.push({
          terms: {
            'categories.keyword': complementaryCategories,
            boost: 3.0,
          },
        });
      }

      // Match by values with boosting (for value alignment)
      if (product.values && product.values.length > 0) {
        should.push({
          terms: {
            'values.keyword': product.values,
            boost: 2.0,
          },
        });
      }

      // Execute search
      const searchResponse = await (this.elasticsearchService as any).client.search({
        index: 'products',
        body: {
          size: limit * 2,
          query: {
            bool: {
              must,
              must_not: mustNot,
              should,
              minimum_should_match: 1,
            },
          },
        },
      });

      // Extract and process results
      const hits = searchResponse.hits.hits;

      // Process hits
      let complementaryProducts = hits.map(hit => ({
        ...(hit._source as object),
        score: hit._score,
        matchedOn: ['complementary'],
      }));

      // Apply personalization if user ID is provided
      if (userId) {
        complementaryProducts = await this.applyPersonalization(complementaryProducts, userId);
      }

      return {
        items: complementaryProducts.slice(0, limit),
        total: complementaryProducts.length,
        sourceProduct: {
          id: product.id,
          title: product.title,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get complementary products: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get products frequently bought together with the given product
   *
   * @param productId Product ID
   * @param limit Number of products to return
   */
  async getFrequentlyBoughtTogether(productId: string, limit = 3): Promise<any> {
    try {
      // In a real implementation, this would use order history data
      // For now, we'll simulate with a simple product lookup
      return this.getRelatedProducts(productId, undefined, {
        limit,
        categoryWeight: 3.0, // Higher weight for categories in "bought together" context
        brandWeight: 0.5, // Lower weight for brand (diversity)
      });
    } catch (error) {
      this.logger.error(
        `Failed to get frequently bought together products: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Apply personalization to product results
   *
   * @param products Products to personalize
   * @param userId User ID
   */
  private async applyPersonalization(products: any[], userId: string): Promise<any[]> {
    try {
      // Get personalization boosts
      const personalizedBoosts =
        await this.personalizationService.generatePersonalizedBoosts(userId);

      // Apply personalization boosts to reorder products
      const boostedProducts = products.map(product => {
        let boostFactor = 1.0;

        // Apply category boosts
        if (product.categories && personalizedBoosts.categoryBoosts) {
          for (const category of product.categories) {
            if (personalizedBoosts.categoryBoosts[category]) {
              boostFactor += personalizedBoosts.categoryBoosts[category];
            }
          }
        }

        // Apply brand boosts
        if (product.brandName && personalizedBoosts.brandBoosts) {
          if (personalizedBoosts.brandBoosts[product.brandName]) {
            boostFactor += personalizedBoosts.brandBoosts[product.brandName];
          }
        }

        // Apply value boosts (higher weight for value alignment)
        if (product.values && personalizedBoosts.valueBoosts) {
          for (const value of product.values) {
            if (personalizedBoosts.valueBoosts[value]) {
              boostFactor += personalizedBoosts.valueBoosts[value] * 1.5;
            }
          }
        }

        return {
          ...product,
          boostFactor,
          finalScore: product.score * boostFactor,
        };
      });

      // Sort by final score
      boostedProducts.sort((a, b) => b.finalScore - a.finalScore);

      return boostedProducts;
    } catch (error) {
      this.logger.error(
        `Failed to apply personalization: ${error instanceof Error ? error.message : String(error)}`,
      );
      return products; // Return original products if personalization fails
    }
  }

  /**
   * Determine which factors matched between the source product and related product
   */
  private determineMatchFactors(relatedProduct: Product, sourceProduct: Product): string[] {
    const matchFactors = [];

    // Check categories
    if (sourceProduct.categories && relatedProduct.categories) {
      const hasMatchingCategory = sourceProduct.categories.some(category =>
        relatedProduct.categories.includes(category),
      );
      if (hasMatchingCategory) {
        matchFactors.push('category');
      }
    }

    // Check tags
    if (sourceProduct.tags && relatedProduct.tags) {
      const hasMatchingTag = sourceProduct.tags.some(tag => relatedProduct.tags.includes(tag));
      if (hasMatchingTag) {
        matchFactors.push('tag');
      }
    }

    // Check values
    if (sourceProduct.values && relatedProduct.values) {
      const hasMatchingValue = sourceProduct.values.some(value =>
        relatedProduct.values.includes(value),
      );
      if (hasMatchingValue) {
        matchFactors.push('value');
      }
    }

    // Check brand
    if (sourceProduct.brandName === relatedProduct.brandName) {
      matchFactors.push('brand');
    }

    // Check price range
    if (sourceProduct.price && relatedProduct.price) {
      const minPrice = sourceProduct.price * 0.7;
      const maxPrice = sourceProduct.price * 1.3;
      if (relatedProduct.price >= minPrice && relatedProduct.price <= maxPrice) {
        matchFactors.push('price');
      }
    }

    return matchFactors;
  }

  /**
   * Ensure diversity in results by mixing different match factors
   */
  private ensureDiversity(products: any[]): any[] {
    // Group products by primary match factor
    const categorizedProducts = {
      category: [],
      tag: [],
      value: [],
      brand: [],
      price: [],
      other: [],
    };

    // Categorize products
    for (const product of products) {
      if (!product.matchedOn || product.matchedOn.length === 0) {
        categorizedProducts.other.push(product);
        continue;
      }

      // Determine primary match factor (first in the array)
      const primaryFactor = product.matchedOn[0];

      if (primaryFactor === 'category') {
        categorizedProducts.category.push(product);
      } else if (primaryFactor === 'tag') {
        categorizedProducts.tag.push(product);
      } else if (primaryFactor === 'value') {
        categorizedProducts.value.push(product);
      } else if (primaryFactor === 'brand') {
        categorizedProducts.brand.push(product);
      } else if (primaryFactor === 'price') {
        categorizedProducts.price.push(product);
      } else {
        categorizedProducts.other.push(product);
      }
    }

    // Create a diverse mix
    const diverseResults = [];

    // Prioritize value matches (for value-aligned marketplace)
    diverseResults.push(...categorizedProducts.value.slice(0, 3));

    // Add category matches
    diverseResults.push(...categorizedProducts.category.slice(0, 3));

    // Add tag matches
    diverseResults.push(...categorizedProducts.tag.slice(0, 2));

    // Add brand matches
    diverseResults.push(...categorizedProducts.brand.slice(0, 1));

    // Add remaining products by score until we have all products
    const remainingProducts = products
      .filter(product => !diverseResults.some(p => p.id === product.id))
      .sort((a, b) => b.score - a.score);

    diverseResults.push(...remainingProducts);

    return diverseResults;
  }

  /**
   * Get complementary categories for given categories
   * In a real implementation, this would be based on purchase data or a curated mapping
   */
  private getComplementaryCategories(categories: string[]): string[] {
    if (!categories || categories.length === 0) {
      return [];
    }

    // Simple complementary category mappings
    const complementaryMap: Record<string, string[]> = {
      clothing: ['accessories', 'jewelry', 'shoes'],
      tops: ['bottoms', 'accessories', 'outerwear'],
      bottoms: ['tops', 'shoes', 'belts'],
      dresses: ['shoes', 'jewelry', 'bags'],
      shoes: ['socks', 'shoe-care', 'insoles'],
      skincare: ['makeup', 'tools', 'haircare'],
      makeup: ['skincare', 'tools', 'accessories'],
      furniture: ['decor', 'lighting', 'textiles'],
      kitchenware: ['tableware', 'food', 'drinkware'],
      jewelry: ['accessories', 'clothing', 'gift-boxes'],
    };

    // Collect all complementary categories
    const complementaryCategories = new Set<string>();

    for (const category of categories) {
      const lowerCategory = category.toLowerCase();
      if (complementaryMap[lowerCategory]) {
        for (const complementary of complementaryMap[lowerCategory]) {
          complementaryCategories.add(complementary);
        }
      }
    }

    return Array.from(complementaryCategories);
  }
}
