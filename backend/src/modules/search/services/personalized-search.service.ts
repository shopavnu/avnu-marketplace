import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';
import { NaturalLanguageSearchService } from '../../nlp/services/natural-language-search.service';
import { PersonalizationService } from '../../personalization/services/personalization.service';
import { BehaviorType } from '../../personalization/entities/user-behavior.entity';

@Injectable()
export class PersonalizedSearchService {
  private readonly logger = new Logger(PersonalizedSearchService.name);

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly naturalLanguageSearchService: NaturalLanguageSearchService,
    private readonly personalizationService: PersonalizationService,
  ) {}

  /**
   * Perform a personalized search with natural language processing
   * @param userId User ID
   * @param query Search query
   * @param options Search options
   */
  async personalizedSearch(userId: string, query: string, options: any = {}): Promise<any> {
    try {
      // Step 1: Process the natural language query using NLP service
      const processedQuery = await this.naturalLanguageSearchService.searchProducts(query, {
        page: 1,
        limit: 10,
      });
      const enhancedQuery = processedQuery.enhancedQuery;
      const detectedFilters = processedQuery.detectedFilters;

      // Step 2: Enhance the search with personalization
      const enhancedParams = await this.personalizationService.enhanceSearchWithPersonalization(
        userId,
        enhancedQuery,
        {
          ...options,
          filters: {
            ...(options.filters || {}),
            ...detectedFilters,
          },
        },
      );

      // Step 3: Execute the search with enhanced parameters
      const searchResults = await this.elasticsearchService.searchProducts(
        enhancedParams.query,
        enhancedParams.filters,
        options.page || 1,
        options.limit || 20,
        options.sort,
      );

      // Step 4: Track the search query
      this.personalizationService
        .trackInteractionAndUpdatePreferences(userId, BehaviorType.SEARCH, query, 'search', query)
        .catch(error => {
          this.logger.error(`Failed to track search: ${error.message}`);
        });

      // Return the results with metadata about how the search was enhanced
      return {
        ...searchResults,
        metadata: {
          originalQuery: query,
          processedQuery: enhancedQuery,
          extractedFilters: detectedFilters,
          personalizedFilters: enhancedParams.filters,
          personalizedBoosts: enhancedParams.boosts,
          userPreferences: enhancedParams.personalization?.preferences,
        },
      };
    } catch (error) {
      this.logger.error(`Personalized search failed: ${error.message}`);

      // Fallback to basic search if personalization fails
      return this.elasticsearchService.searchProducts(
        query,
        options.filters,
        options.page || 1,
        options.limit || 20,
        options.sort,
      );
    }
  }

  /**
   * Get personalized recommendations for a user
   * @param userId User ID
   * @param limit Number of recommendations to return
   */
  async getPersonalizedRecommendations(userId: string, limit = 10): Promise<any> {
    try {
      // Get recommended product IDs from personalization service
      const productIds = await this.personalizationService.generatePersonalizedRecommendations(
        userId,
        limit,
      );

      if (productIds.length === 0) {
        // If no personalized recommendations, return trending products
        const trendingProducts = await this.elasticsearchService.getTrendingProducts(limit);
        return {
          items: trendingProducts,
          total: trendingProducts.length,
          page: 1,
          limit,
        };
      }

      // Fetch full product details for the recommended IDs
      // Since getProductsByIds doesn't exist, use searchProducts with a custom filter
      // Create a filter to search for products with IDs in the productIds array
      const searchResults = await this.elasticsearchService.searchProducts(
        '',
        {
          // We'll use an empty filter object since the standard filters don't support ID lists
          // The actual filtering will be done in memory
        },
        1,
        limit * 2, // Fetch more than needed to ensure we have enough after filtering
      );

      // Filter the results to only include products with IDs in the productIds array
      const products = searchResults.items
        .filter(product => productIds.includes(product.id))
        .slice(0, limit);

      return {
        items: products,
        total: products.length,
        page: 1,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to get personalized recommendations: ${error.message}`);

      // Fallback to trending products
      const trendingProducts = await this.elasticsearchService.getTrendingProducts(limit);
      return {
        items: trendingProducts,
        total: trendingProducts.length,
        page: 1,
        limit,
      };
    }
  }

  /**
   * Get discovery feed with mixed results (trending, new, personalized)
   * @param userId User ID
   * @param options Options for the discovery feed
   */
  async getDiscoveryFeed(userId: string, options: any = {}): Promise<any> {
    try {
      const limit = options.limit || 20;
      const personalizedLimit = Math.floor(limit * 0.6); // 60% personalized
      const trendingLimit = Math.floor(limit * 0.2); // 20% trending

      // Get personalized recommendations
      const personalizedResults = await this.getPersonalizedRecommendations(
        userId,
        personalizedLimit,
      );

      // Get trending products
      const trendingResults = await this.elasticsearchService.searchProducts(
        '',
        {},
        1,
        trendingLimit,
        { field: 'popularity', order: 'desc' },
      );

      // Get new products
      const newResults = await this.elasticsearchService.searchProducts(
        '',
        {},
        1,
        options.limit || 20,
        { field: 'createdAt', order: 'desc' },
      );

      // Combine results, ensuring no duplicates
      const seenIds = new Set();
      const combinedItems = [];

      // Helper function to add items without duplicates
      const addItemsNoDuplicates = items => {
        for (const item of items) {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            combinedItems.push({
              ...item,
              discoverySource: item.discoverySource || 'mixed',
            });
          }
        }
      };

      // Add personalized items first (marked as personalized)
      addItemsNoDuplicates(
        personalizedResults.items.map(item => ({
          ...item,
          discoverySource: 'personalized',
        })),
      );

      // Add trending items
      addItemsNoDuplicates(
        trendingResults.items.map(item => ({
          ...item,
          discoverySource: 'trending',
        })),
      );

      // Add new items
      addItemsNoDuplicates(
        newResults.items.map(item => ({
          ...item,
          discoverySource: 'new',
        })),
      );

      return {
        items: combinedItems.slice(0, limit),
        total: combinedItems.length,
        page: 1,
        limit,
        metadata: {
          personalized: personalizedResults.items.length,
          trending: trendingResults.items.length,
          new: newResults.items.length,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get discovery feed: ${error.message}`);

      // Fallback to basic search
      const trendingProducts = await this.elasticsearchService.getTrendingProducts(
        options.limit || 20,
      );
      return {
        items: trendingProducts,
        total: trendingProducts.length,
        page: 1,
        limit: options.limit || 20,
      };
    }
  }

  /**
   * Get similar products based on a product ID
   * @param productId Product ID
   * @param userId Optional user ID for personalization
   * @param limit Number of similar products to return
   */
  async getSimilarProducts(productId: string, userId?: string, limit = 10): Promise<any> {
    try {
      // Get similar products from Elasticsearch
      const similarProducts = await this.elasticsearchService.getRelatedProducts(productId, limit);

      // If user ID is provided, enhance with personalization
      if (userId) {
        // Get personalization boosts
        const personalizedBoosts =
          await this.personalizationService.generatePersonalizedBoosts(userId);

        // Apply personalization boosts to reorder similar products
        // Make sure we have a proper structure with items property
        const productItems = Array.isArray(similarProducts)
          ? similarProducts
          : similarProducts &&
              typeof similarProducts === 'object' &&
              Object.prototype.hasOwnProperty.call(similarProducts, 'items')
            ? (similarProducts as any).items
            : [];

        const boostedProducts = productItems.map(product => {
          let _boostFactor = 1.0;

          // Apply category boosts
          if (product.categories && personalizedBoosts.categoryBoosts) {
            for (const category of product.categories) {
              if (personalizedBoosts.categoryBoosts[category]) {
                _boostFactor *= personalizedBoosts.categoryBoosts[category];
              }
            }
          }

          // Apply brand boosts
          if (
            product.brand &&
            personalizedBoosts.brandBoosts &&
            personalizedBoosts.brandBoosts[product.brand]
          ) {
            _boostFactor *= personalizedBoosts.brandBoosts[product.brand];
          }

          // Apply product-specific boosts
          if (personalizedBoosts.productBoosts && personalizedBoosts.productBoosts[product.id]) {
            _boostFactor *= personalizedBoosts.productBoosts[product.id];
          }

          return {
            ...product,
            _boostFactor,
          };
        });

        // Sort by boost factor
        boostedProducts.sort((a, b) => b._boostFactor - a._boostFactor);

        // Remove boost factor from results
        const reorderedProducts = boostedProducts.map(({ _boostFactor, ...product }) => product);

        // Create a properly structured response
        return {
          items: reorderedProducts,
          total: reorderedProducts.length,
          productId,
          personalized: true,
        };
      }

      return similarProducts;
    } catch (error) {
      this.logger.error(`Failed to get similar products: ${error.message}`);

      // Fallback to basic similar products
      const relatedProducts = await this.elasticsearchService.getRelatedProducts(productId, limit);
      return {
        items: relatedProducts,
        total: relatedProducts.length,
        productId,
      };
    }
  }

  /**
   * Apply value alignment boosts to search results
   * @param results Search results
   * @param userValues User values
   * @param _boostFactor Boost factor
   */
  private applyValueAlignmentBoost(
    results: any[],
    userValues: string[],
    _boostFactor: number,
  ): any[] {
    if (!userValues || userValues.length === 0 || !results || results.length === 0) {
      return results;
    }

    // TO DO: implement value alignment logic
    return results;
  }
}
