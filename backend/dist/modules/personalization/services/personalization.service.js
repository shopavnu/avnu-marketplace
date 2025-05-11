'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var PersonalizationService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.PersonalizationService = void 0;
const common_1 = require('@nestjs/common');
const user_preferences_service_1 = require('./user-preferences.service');
const user_behavior_service_1 = require('./user-behavior.service');
const user_behavior_entity_1 = require('../entities/user-behavior.entity');
const session_service_1 = require('./session.service');
let PersonalizationService = (PersonalizationService_1 = class PersonalizationService {
  constructor(userPreferencesService, userBehaviorService, sessionService) {
    this.userPreferencesService = userPreferencesService;
    this.userBehaviorService = userBehaviorService;
    this.sessionService = sessionService;
    this.logger = new common_1.Logger(PersonalizationService_1.name);
  }
  async generatePersonalizedSearchParams(userId, baseQuery = '', sessionId) {
    try {
      const personalizationParams = {
        query: baseQuery,
        preferences: {},
        behavior: {},
        session: {},
      };
      if (sessionId) {
        try {
          this.logger.log(`Generating session-based personalization for session ${sessionId}`);
          const sessionWeights = await this.sessionService.calculateSessionWeights(sessionId);
          personalizationParams.session = {
            sessionId,
            weights: sessionWeights,
            weightFactors: {
              entities: 1.0,
              categories: 0.8,
              brands: 0.8,
              queries: 0.7,
              filters: 0.6,
            },
          };
        } catch (sessionError) {
          this.logger.error(`Failed to get session personalization: ${sessionError.message}`);
        }
      }
      if (userId) {
        try {
          this.logger.log(`Generating user-based personalization for user ${userId}`);
          const preferences = await this.userPreferencesService.findOrCreate(userId);
          const recentViews = await this.userBehaviorService.getUserBehaviorsByType(
            userId,
            user_behavior_entity_1.BehaviorType.VIEW,
            20,
          );
          const recentSearches = await this.userBehaviorService.getUserBehaviorsByType(
            userId,
            user_behavior_entity_1.BehaviorType.SEARCH,
            10,
          );
          const favoriteProducts = await this.userBehaviorService.getUserBehaviorsByType(
            userId,
            user_behavior_entity_1.BehaviorType.FAVORITE,
            10,
          );
          const purchases = await this.userBehaviorService.getUserBehaviorsByType(
            userId,
            user_behavior_entity_1.BehaviorType.PURCHASE,
            10,
          );
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
      return { query: baseQuery };
    }
  }
  async generatePersonalizedFilters(userId) {
    try {
      const preferences = await this.userPreferencesService.findOrCreate(userId);
      const filters = {};
      if (preferences.favoriteCategories && preferences.favoriteCategories.length > 0) {
        filters['categories'] = preferences.favoriteCategories;
      }
      if (preferences.favoriteBrands && preferences.favoriteBrands.length > 0) {
        filters['brands'] = preferences.favoriteBrands;
      }
      if (preferences.preferSustainable) {
        filters['sustainable'] = true;
      }
      if (preferences.preferEthical) {
        filters['ethical'] = true;
      }
      if (preferences.preferLocalBrands) {
        filters['local'] = true;
      }
      if (preferences.preferredSizes && preferences.preferredSizes.length > 0) {
        filters['sizes'] = preferences.preferredSizes;
      }
      if (preferences.preferredColors && preferences.preferredColors.length > 0) {
        filters['colors'] = preferences.preferredColors;
      }
      if (preferences.preferredMaterials && preferences.preferredMaterials.length > 0) {
        filters['materials'] = preferences.preferredMaterials;
      }
      return filters;
    } catch (error) {
      this.logger.error(`Failed to generate personalized filters: ${error.message}`);
      return {};
    }
  }
  async generatePersonalizedBoosts(userId) {
    try {
      const preferences = await this.userPreferencesService.findOrCreate(userId);
      const mostViewedProducts = await this.userBehaviorService.getMostViewedProducts(userId, 50);
      const favoriteProducts = await this.userBehaviorService.getFavoriteProducts(userId, 20);
      const viewedProductIds = mostViewedProducts.map(view => view.entityId);
      const favoriteProductIds = favoriteProducts.map(fav => fav.entityId);
      const boosts = {
        categoryBoosts:
          preferences.favoriteCategories?.reduce((acc, category) => {
            acc[category] = 1.5;
            return acc;
          }, {}) || {},
        brandBoosts:
          preferences.favoriteBrands?.reduce((acc, brand) => {
            acc[brand] = 1.5;
            return acc;
          }, {}) || {},
        valueBoosts: {},
        productBoosts: {},
      };
      if (preferences.preferSustainable) {
        boosts.valueBoosts['sustainable'] = 2.0;
      }
      if (preferences.preferEthical) {
        boosts.valueBoosts['ethical'] = 2.0;
      }
      if (preferences.preferLocalBrands) {
        boosts.valueBoosts['local'] = 1.8;
      }
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
  async generatePersonalizedRecommendations(userId, limit = 10) {
    try {
      const viewedProducts = await this.userBehaviorService.getMostViewedProducts(userId, 20);
      const favoriteProducts = await this.userBehaviorService.getFavoriteProducts(userId, 10);
      const purchasedProducts = await this.userBehaviorService.getPurchaseHistory(userId, 10);
      const viewedProductIds = viewedProducts.map(view => view.entityId);
      const favoriteProductIds = favoriteProducts.map(fav => fav.entityId);
      const purchasedProductIds = purchasedProducts.map(purchase => purchase.entityId);
      const weightedProductIds = [
        ...purchasedProductIds.map(id => ({ id, weight: 3 })),
        ...favoriteProductIds.map(id => ({ id, weight: 2 })),
        ...viewedProductIds.map(id => ({ id, weight: 1 })),
      ];
      const uniqueWeightedProductIds = weightedProductIds.reduce((acc, { id, weight }) => {
        if (!acc[id] || acc[id] < weight) {
          acc[id] = weight;
        }
        return acc;
      }, {});
      const sortedProductIds = Object.entries(uniqueWeightedProductIds)
        .map(([id, weight]) => ({ id, weight: Number(weight) }))
        .sort((a, b) => b.weight - a.weight)
        .map(({ id }) => id);
      return sortedProductIds.slice(0, limit);
    } catch (error) {
      this.logger.error(`Failed to generate personalized recommendations: ${error.message}`);
      return [];
    }
  }
  async getPersonalizedSuggestions(query, userId, limit = 5, categories) {
    try {
      const _preferences = await this.userPreferencesService.findOrCreate(userId);
      const recentSearches = await this.userBehaviorService.getUserBehaviorsByType(
        userId,
        user_behavior_entity_1.BehaviorType.SEARCH,
        20,
      );
      const matchingSearches = recentSearches
        .filter(search => {
          const searchQuery = search.metadata || '';
          return searchQuery.toLowerCase().startsWith(query.toLowerCase());
        })
        .map(search => ({
          text: search.metadata || '',
          relevance: search.count * 10,
          recency: new Date(search.lastInteractionAt).getTime(),
          type: 'search',
        }));
      const recentViews = await this.userBehaviorService.getUserBehaviorsByType(
        userId,
        user_behavior_entity_1.BehaviorType.VIEW,
        50,
      );
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
              relevance: view.count * 5,
              recency: new Date(view.lastInteractionAt).getTime(),
              category,
              type: view.entityType,
            };
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);
      const allSuggestions = [...matchingSearches, ...viewSuggestions]
        .sort((a, b) => {
          const relevanceDiff = b.relevance - a.relevance;
          if (relevanceDiff !== 0) return relevanceDiff;
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
        PersonalizationService_1.name,
      );
      return [];
    }
  }
  async enhanceSearchWithPersonalization(userId, searchQuery, searchParams = {}) {
    try {
      const personalizedParams = await this.generatePersonalizedSearchParams(userId, searchQuery);
      const personalizedFilters = await this.generatePersonalizedFilters(userId);
      const personalizedBoosts = await this.generatePersonalizedBoosts(userId);
      const enhancedParams = {
        ...searchParams,
        query: searchQuery,
        personalization: {
          userId,
          preferences: personalizedParams.preferences,
          behavior: personalizedParams.behavior,
        },
        filters: {
          ...(searchParams.filters || {}),
          ...personalizedFilters,
        },
        boosts: personalizedBoosts,
      };
      return enhancedParams;
    } catch (error) {
      this.logger.error(`Failed to enhance search with personalization: ${error.message}`);
      return {
        ...searchParams,
        query: searchQuery,
      };
    }
  }
  async trackInteractionAndUpdatePreferences(
    userId,
    interactionType,
    entityId,
    entityType,
    metadata,
  ) {
    try {
      await this.userBehaviorService.trackBehavior(
        userId,
        entityId,
        entityType,
        interactionType,
        metadata,
      );
      if (
        entityType === 'category' &&
        interactionType === user_behavior_entity_1.BehaviorType.VIEW
      ) {
        const categoryBehaviors = await this.userBehaviorService.getUserBehaviorsByEntityType(
          userId,
          'category',
        );
        const thisCategoryBehavior = categoryBehaviors.find(b => b.entityId === entityId);
        if (thisCategoryBehavior && thisCategoryBehavior.count >= 5) {
          await this.userPreferencesService.addFavoriteCategory(userId, entityId);
        }
      } else if (
        entityType === 'brand' &&
        interactionType === user_behavior_entity_1.BehaviorType.VIEW
      ) {
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
});
exports.PersonalizationService = PersonalizationService;
exports.PersonalizationService =
  PersonalizationService =
  PersonalizationService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          user_preferences_service_1.UserPreferencesService,
          user_behavior_service_1.UserBehaviorService,
          session_service_1.SessionService,
        ]),
      ],
      PersonalizationService,
    );
//# sourceMappingURL=personalization.service.js.map
