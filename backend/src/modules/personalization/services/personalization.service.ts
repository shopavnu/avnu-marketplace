import { Injectable, Logger } from '@nestjs/common';
import { UserPreferencesService } from './user-preferences.service';
import { UserBehaviorService } from './user-behavior.service';
import { BehaviorType } from '../entities/user-behavior.entity';
import { SessionService } from './session.service';

@Injectable()
export class PersonalizationService {
  private readonly logger = new Logger(PersonalizationService.name);

  constructor(
    private readonly userPreferencesService: UserPreferencesService,
    private readonly userBehaviorService: UserBehaviorService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Generate personalized search parameters based on user preferences and behavior
   * @param userId User ID
   * @param baseQuery Base search query
   * @param sessionId Optional session ID for session-based personalization
   */
  async generatePersonalizedSearchParams(
    userId: string,
    baseQuery: string = '',
    sessionId?: string,
  ): Promise<any> {
    try {
      // Initialize personalization parameters
      const personalizationParams: any = {
        // Base query
        query: baseQuery,
        // Initialize with empty values
        preferences: {},
        behavior: {},
        session: {},
      };

      // Get session-based personalization if sessionId is provided
      if (sessionId) {
        try {
          this.logger.log(`Generating session-based personalization for session ${sessionId}`);
          const sessionWeights = await this.sessionService.calculateSessionWeights(sessionId);

          // Add session weights to personalization params
          personalizationParams.session = {
            sessionId,
            weights: sessionWeights,
            // Add weight scaling factors (can be tuned)
            weightFactors: {
              entities: 1.0, // Full weight for entity boosts
              categories: 0.8, // 80% weight for category boosts
              brands: 0.8, // 80% weight for brand boosts
              queries: 0.7, // 70% weight for query boosts
              filters: 0.6, // 60% weight for filter boosts
            },
          };
        } catch (sessionError) {
          this.logger.error(`Failed to get session personalization: ${sessionError.message}`);
          // Continue with user-based personalization even if session fails
        }
      }

      // Get user-based personalization if userId is provided
      if (userId) {
        try {
          this.logger.log(`Generating user-based personalization for user ${userId}`);

          // Get user preferences
          const preferences = await this.userPreferencesService.findOrCreate(userId);

          // Get recent user behaviors
          const recentViews = await this.userBehaviorService.getUserBehaviorsByType(
            userId,
            BehaviorType.VIEW,
            20,
          );

          const recentSearches = await this.userBehaviorService.getUserBehaviorsByType(
            userId,
            BehaviorType.SEARCH,
            10,
          );

          const favoriteProducts = await this.userBehaviorService.getUserBehaviorsByType(
            userId,
            BehaviorType.FAVORITE,
            10,
          );

          const purchases = await this.userBehaviorService.getUserBehaviorsByType(
            userId,
            BehaviorType.PURCHASE,
            10,
          );

          // Add user preferences to personalization params
          personalizationParams.preferences = {
            favoriteCategories: preferences.favoriteCategories || [],
            favoriteValues: preferences.favoriteValues || [],
            favoriteBrands: preferences.favoriteBrands || [],
            priceSensitivity: preferences.priceSensitivity || 'medium',
            preferSustainable: preferences.preferSustainable || false,
            preferEthical: preferences.preferEthical || false,
            preferLocalBrands: preferences.preferLocalBrands || false,
            preferredSizes: preferences.preferredSizes || [],
            preferredColors: preferences.preferredColors || [],
            preferredMaterials: preferences.preferredMaterials || [],
          };

          // Add user behavior data to personalization params
          personalizationParams.behavior = {
            recentlyViewed: recentViews.map(view => ({
              entityId: view.entityId,
              entityType: view.entityType,
              count: view.count,
              lastInteraction: view.lastInteractionAt,
            })),
            recentSearches: recentSearches.map(search => ({
              query: search.metadata,
              count: search.count,
              lastInteraction: search.lastInteractionAt,
            })),
            favorites: favoriteProducts.map(fav => ({
              entityId: fav.entityId,
              entityType: fav.entityType,
              lastInteraction: fav.lastInteractionAt,
            })),
            purchases: purchases.map(purchase => ({
              entityId: purchase.entityId,
              entityType: purchase.entityType,
              metadata: purchase.metadata,
              lastInteraction: purchase.lastInteractionAt,
            })),
          };
        } catch (userError) {
          this.logger.error(`Failed to get user personalization: ${userError.message}`);
        }
      }

      return personalizationParams;
    } catch (error) {
      this.logger.error(`Failed to generate personalized search params: ${error.message}`);
      // Return empty personalization params if there's an error
      return { query: baseQuery };
    }
  }

  /**
   * Generate personalized search filters
   * @param userId User ID
   */
  async generatePersonalizedFilters(userId: string): Promise<any> {
    try {
      // Get user preferences
      const preferences = await this.userPreferencesService.findOrCreate(userId);

      // Build filters based on preferences
      const filters = {};

      // Add category filters if user has favorite categories
      if (preferences.favoriteCategories && preferences.favoriteCategories.length > 0) {
        filters['categories'] = preferences.favoriteCategories;
      }

      // Add brand filters if user has favorite brands
      if (preferences.favoriteBrands && preferences.favoriteBrands.length > 0) {
        filters['brands'] = preferences.favoriteBrands;
      }

      // Add value-based filters
      if (preferences.preferSustainable) {
        filters['sustainable'] = true;
      }

      if (preferences.preferEthical) {
        filters['ethical'] = true;
      }

      if (preferences.preferLocalBrands) {
        filters['local'] = true;
      }

      // Add size filters if user has preferred sizes
      if (preferences.preferredSizes && preferences.preferredSizes.length > 0) {
        filters['sizes'] = preferences.preferredSizes;
      }

      // Add color filters if user has preferred colors
      if (preferences.preferredColors && preferences.preferredColors.length > 0) {
        filters['colors'] = preferences.preferredColors;
      }

      // Add material filters if user has preferred materials
      if (preferences.preferredMaterials && preferences.preferredMaterials.length > 0) {
        filters['materials'] = preferences.preferredMaterials;
      }

      return filters;
    } catch (error) {
      this.logger.error(`Failed to generate personalized filters: ${error.message}`);
      return {};
    }
  }

  /**
   * Generate personalized boosting factors for search
   * @param userId User ID
   */
  async generatePersonalizedBoosts(userId: string): Promise<any> {
    try {
      // Get user preferences
      const preferences = await this.userPreferencesService.findOrCreate(userId);

      // Get user behaviors
      const mostViewedProducts = await this.userBehaviorService.getMostViewedProducts(userId, 50);
      const favoriteProducts = await this.userBehaviorService.getFavoriteProducts(userId, 20);

      // Extract product IDs from behaviors
      const viewedProductIds = mostViewedProducts.map(view => view.entityId);
      const favoriteProductIds = favoriteProducts.map(fav => fav.entityId);

      // Build boosting factors
      const boosts = {
        // Boost factors for categories
        categoryBoosts:
          preferences.favoriteCategories?.reduce((acc, category) => {
            acc[category] = 1.5; // Boost favorite categories by 1.5x
            return acc;
          }, {}) || {},

        // Boost factors for brands
        brandBoosts:
          preferences.favoriteBrands?.reduce((acc, brand) => {
            acc[brand] = 1.5; // Boost favorite brands by 1.5x
            return acc;
          }, {}) || {},

        // Boost factors for values
        valueBoosts: {},

        // Boost factors for specific products
        productBoosts: {},
      };

      // Add value-based boosts
      if (preferences.preferSustainable) {
        boosts.valueBoosts['sustainable'] = 2.0;
      }

      if (preferences.preferEthical) {
        boosts.valueBoosts['ethical'] = 2.0;
      }

      if (preferences.preferLocalBrands) {
        boosts.valueBoosts['local'] = 1.8;
      }

      // Add product-specific boosts based on user behavior
      viewedProductIds.forEach(productId => {
        boosts.productBoosts[productId] = (boosts.productBoosts[productId] || 1.0) + 0.2;
      });

      favoriteProductIds.forEach(productId => {
        boosts.productBoosts[productId] = (boosts.productBoosts[productId] || 1.0) + 0.5;
      });

      return boosts;
    } catch (error) {
      this.logger.error(`Failed to generate personalized boosts: ${error.message}`);
      return {};
    }
  }

  /**
   * Generate personalized recommendations for a user
   * @param userId User ID
   * @param limit Number of recommendations to return
   */
  async generatePersonalizedRecommendations(userId: string, limit = 10): Promise<string[]> {
    try {
      // Get user behaviors
      const viewedProducts = await this.userBehaviorService.getMostViewedProducts(userId, 20);
      const favoriteProducts = await this.userBehaviorService.getFavoriteProducts(userId, 10);
      const purchasedProducts = await this.userBehaviorService.getPurchaseHistory(userId, 10);

      // Extract product IDs
      const viewedProductIds = viewedProducts.map(view => view.entityId);
      const favoriteProductIds = favoriteProducts.map(fav => fav.entityId);
      const purchasedProductIds = purchasedProducts.map(purchase => purchase.entityId);

      // Combine all product IDs with different weights
      const weightedProductIds = [
        ...purchasedProductIds.map(id => ({ id, weight: 3 })), // Highest weight for purchased products
        ...favoriteProductIds.map(id => ({ id, weight: 2 })), // Medium weight for favorited products
        ...viewedProductIds.map(id => ({ id, weight: 1 })), // Lowest weight for viewed products
      ];

      // Remove duplicates, keeping the highest weight
      const uniqueWeightedProductIds = weightedProductIds.reduce((acc, { id, weight }) => {
        if (!acc[id] || acc[id] < weight) {
          acc[id] = weight;
        }
        return acc;
      }, {});

      // Convert back to array and sort by weight
      const sortedProductIds = Object.entries(uniqueWeightedProductIds)
        .map(([id, weight]) => ({ id, weight: Number(weight) })) // Cast weight to number
        .sort((a, b) => b.weight - a.weight)
        .map(({ id }) => id);

      // Return the top N product IDs
      return sortedProductIds.slice(0, limit);
    } catch (error) {
      this.logger.error(`Failed to generate personalized recommendations: ${error.message}`);
      return [];
    }
  }

  /**
   * Enhance search query with personalization
   * @param userId User ID
   * @param searchQuery Original search query
   * @param searchParams Original search parameters
   */
  /**
   * Get personalized search suggestions based on user behavior and preferences
   * @param query The query prefix
   * @param userId User ID
   * @param limit Maximum number of suggestions
   * @param categories Optional category filter
   * @returns Array of personalized suggestions
   */
  async getPersonalizedSuggestions(
    query: string,
    userId: string,
    limit: number = 5,
    categories?: string[],
  ): Promise<Array<{ text: string; relevance: number; category?: string; type: string }>> {
    try {
      // Get user preferences and behavior data
      const _preferences = await this.userPreferencesService.findOrCreate(userId);

      // Get recent searches by the user
      const recentSearches = await this.userBehaviorService.getUserBehaviorsByType(
        userId,
        BehaviorType.SEARCH,
        20,
      );

      // Filter searches that start with the query prefix (case insensitive)
      const matchingSearches = recentSearches
        .filter(search => {
          const searchQuery = search.metadata || '';
          return searchQuery.toLowerCase().startsWith(query.toLowerCase());
        })
        .map(search => ({
          text: search.metadata || '',
          relevance: search.count * 10, // Boost by frequency
          recency: new Date(search.lastInteractionAt).getTime(),
          type: 'search',
        }));

      // Get viewed products/categories that match the query
      const recentViews = await this.userBehaviorService.getUserBehaviorsByType(
        userId,
        BehaviorType.VIEW,
        50,
      );

      // Filter views by category if categories are provided
      const filteredViews =
        categories && categories.length > 0
          ? recentViews.filter(view => {
              try {
                const metadata = JSON.parse(view.metadata || '{}');
                return categories.some(cat => metadata.categories?.includes(cat));
              } catch (e) {
                return false;
              }
            })
          : recentViews;

      // Extract entity names and match with query
      const viewSuggestions = filteredViews
        .filter(view => {
          try {
            const metadata = JSON.parse(view.metadata || '{}');
            const name = metadata.name || metadata.title || '';
            return name.toLowerCase().includes(query.toLowerCase());
          } catch (e) {
            return false;
          }
        })
        .map(view => {
          try {
            const metadata = JSON.parse(view.metadata || '{}');
            const name = metadata.name || metadata.title || '';
            const category = metadata.categories?.[0] || undefined;
            return {
              text: name,
              relevance: view.count * 5, // Boost by view count
              recency: new Date(view.lastInteractionAt).getTime(),
              category,
              type: view.entityType,
            };
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);

      // Combine suggestions and sort by relevance and recency
      const allSuggestions = [...matchingSearches, ...viewSuggestions]
        .sort((a, b) => {
          // First sort by relevance
          const relevanceDiff = b.relevance - a.relevance;
          if (relevanceDiff !== 0) return relevanceDiff;

          // Then by recency
          return b.recency - a.recency;
        })
        .slice(0, limit)
        .map(suggestion => ({
          text: suggestion.text,
          relevance: suggestion.relevance,
          category: 'category' in suggestion ? suggestion.category : undefined,
          type: suggestion.type,
        }));

      return allSuggestions;
    } catch (error) {
      this.logger.error(
        `Failed to get personalized suggestions for user ${userId}: ${error.message}`,
        error.stack,
        PersonalizationService.name,
      );
      return [];
    }
  }

  async enhanceSearchWithPersonalization(
    userId: string,
    searchQuery: string,
    searchParams: any = {},
  ): Promise<any> {
    try {
      // Generate personalized parameters
      const personalizedParams = await this.generatePersonalizedSearchParams(userId, searchQuery);
      const personalizedFilters = await this.generatePersonalizedFilters(userId);
      const personalizedBoosts = await this.generatePersonalizedBoosts(userId);

      // Merge original search parameters with personalized ones
      const enhancedParams = {
        ...searchParams,
        query: searchQuery,

        // Add personalization data
        personalization: {
          userId,
          preferences: personalizedParams.preferences,
          behavior: personalizedParams.behavior,
        },

        // Merge filters
        filters: {
          ...(searchParams.filters || {}),
          ...personalizedFilters,
        },

        // Add boosting factors
        boosts: personalizedBoosts,
      };

      return enhancedParams;
    } catch (error) {
      this.logger.error(`Failed to enhance search with personalization: ${error.message}`);
      // Return original parameters if there's an error
      return {
        ...searchParams,
        query: searchQuery,
      };
    }
  }

  /**
   * Track user interaction and update preferences
   * @param userId User ID
   * @param interactionType Type of interaction
   * @param entityId Entity ID
   * @param entityType Entity type
   * @param metadata Additional metadata
   */
  async trackInteractionAndUpdatePreferences(
    userId: string,
    interactionType: BehaviorType,
    entityId: string,
    entityType: 'product' | 'category' | 'brand' | 'merchant' | 'search',
    metadata?: string,
  ): Promise<void> {
    try {
      // Track the behavior
      await this.userBehaviorService.trackBehavior(
        userId,
        entityId,
        entityType,
        interactionType,
        metadata,
      );

      // Update preferences based on interaction
      if (entityType === 'category' && interactionType === BehaviorType.VIEW) {
        // Add category to favorite categories if viewed multiple times
        const categoryBehaviors = await this.userBehaviorService.getUserBehaviorsByEntityType(
          userId,
          'category',
        );

        const thisCategoryBehavior = categoryBehaviors.find(b => b.entityId === entityId);

        if (thisCategoryBehavior && thisCategoryBehavior.count >= 5) {
          await this.userPreferencesService.addFavoriteCategory(userId, entityId);
        }
      } else if (entityType === 'brand' && interactionType === BehaviorType.VIEW) {
        // Add brand to favorite brands if viewed multiple times
        const brandBehaviors = await this.userBehaviorService.getUserBehaviorsByEntityType(
          userId,
          'brand',
        );

        const thisBrandBehavior = brandBehaviors.find(b => b.entityId === entityId);

        if (thisBrandBehavior && thisBrandBehavior.count >= 5) {
          await this.userPreferencesService.addFavoriteBrand(userId, entityId);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to track interaction and update preferences: ${error.message}`);
    }
  }
}
