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
var UserPreferenceService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.UserPreferenceService = exports.UserInteractionType = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const elasticsearch_1 = require('@nestjs/elasticsearch');
var UserInteractionType;
(function (UserInteractionType) {
  UserInteractionType['SEARCH'] = 'search';
  UserInteractionType['VIEW_PRODUCT'] = 'view_product';
  UserInteractionType['ADD_TO_CART'] = 'add_to_cart';
  UserInteractionType['PURCHASE'] = 'purchase';
  UserInteractionType['FILTER_APPLY'] = 'filter_apply';
  UserInteractionType['SORT_APPLY'] = 'sort_apply';
  UserInteractionType['CLICK_CATEGORY'] = 'click_category';
  UserInteractionType['CLICK_BRAND'] = 'click_brand';
  UserInteractionType['SEARCH_RESULT_IMPRESSION'] = 'search_result_impression';
  UserInteractionType['SEARCH_RESULT_DWELL_TIME'] = 'search_result_dwell_time';
})(UserInteractionType || (exports.UserInteractionType = UserInteractionType = {}));
let UserPreferenceService = (UserPreferenceService_1 = class UserPreferenceService {
  constructor(configService, elasticsearchService) {
    this.configService = configService;
    this.elasticsearchService = elasticsearchService;
    this.logger = new common_1.Logger(UserPreferenceService_1.name);
    this.preferencesCache = new Map();
    this.preferencesIndex = this.configService.get(
      'ELASTICSEARCH_USER_PREFERENCES_INDEX',
      'user_preferences',
    );
    this.interactionsIndex = this.configService.get(
      'ELASTICSEARCH_USER_INTERACTIONS_INDEX',
      'user_interactions',
    );
    this.cacheTimeMs = this.configService.get('USER_PREFERENCES_CACHE_TIME_MS', 30 * 60 * 1000);
    this.initializeIndices();
  }
  async initializeIndices() {
    try {
      const preferencesExists = await this.indexExists(this.preferencesIndex);
      if (!preferencesExists) {
        await this.createPreferencesIndex();
      }
      const interactionsExists = await this.indexExists(this.interactionsIndex);
      if (!interactionsExists) {
        await this.createInteractionsIndex();
      }
      this.logger.log('User preference indices initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize user preference indices: ${error.message}`);
    }
  }
  async indexExists(indexName) {
    try {
      const response = await this.elasticsearchService.indices.exists({
        index: indexName,
      });
      if (typeof response === 'boolean') {
        return response;
      }
      return response?.statusCode === 200;
    } catch (error) {
      this.logger.error(`Error checking if index ${indexName} exists: ${error.message}`);
      return false;
    }
  }
  async createPreferencesIndex() {
    try {
      await this.elasticsearchService.indices.create({
        index: this.preferencesIndex,
        body: {
          mappings: {
            properties: {
              userId: { type: 'keyword' },
              categories: { type: 'object' },
              brands: { type: 'object' },
              priceRanges: {
                type: 'nested',
                properties: {
                  min: { type: 'float' },
                  max: { type: 'float' },
                  weight: { type: 'float' },
                },
              },
              values: { type: 'object' },
              recentSearches: {
                type: 'nested',
                properties: {
                  term: { type: 'text' },
                  timestamp: { type: 'long' },
                },
              },
              recentlyViewedProducts: {
                type: 'nested',
                properties: {
                  productId: { type: 'keyword' },
                  timestamp: { type: 'long' },
                },
              },
              purchaseHistory: {
                type: 'nested',
                properties: {
                  productId: { type: 'keyword' },
                  timestamp: { type: 'long' },
                },
              },
              lastUpdated: { type: 'long' },
            },
          },
        },
      });
      this.logger.log(`Created preferences index: ${this.preferencesIndex}`);
    } catch (error) {
      this.logger.error(`Failed to create preferences index: ${error.message}`);
    }
  }
  async createInteractionsIndex() {
    try {
      await this.elasticsearchService.indices.create({
        index: this.interactionsIndex,
        body: {
          mappings: {
            properties: {
              userId: { type: 'keyword' },
              type: { type: 'keyword' },
              timestamp: { type: 'long' },
              data: { type: 'object' },
            },
          },
        },
      });
      this.logger.log(`Created interactions index: ${this.interactionsIndex}`);
    } catch (error) {
      this.logger.error(`Failed to create interactions index: ${error.message}`);
    }
  }
  async getUserPreferences(userId) {
    const cachedPreferences = this.preferencesCache.get(userId);
    const now = Date.now();
    if (cachedPreferences && now - cachedPreferences.lastUpdated < this.cacheTimeMs) {
      return cachedPreferences;
    }
    try {
      const response = await this.elasticsearchService.search({
        index: this.preferencesIndex,
        body: {
          query: {
            term: {
              userId: userId,
            },
          },
        },
      });
      let hits;
      if ('hits' in response) {
        hits = response.hits;
      } else {
        const anyResponse = response;
        hits = anyResponse.body?.hits;
      }
      if (hits?.hits?.length > 0) {
        const preferences = hits.hits[0]._source;
        this.preferencesCache.set(userId, preferences);
        return preferences;
      }
      const defaultPreferences = this.createDefaultPreferences(userId);
      await this.saveUserPreferences(defaultPreferences);
      this.preferencesCache.set(userId, defaultPreferences);
      return defaultPreferences;
    } catch (error) {
      this.logger.error(`Failed to get user preferences for ${userId}: ${error.message}`);
      return null;
    }
  }
  createDefaultPreferences(userId) {
    return {
      userId,
      categories: {},
      brands: {},
      priceRanges: [],
      values: {},
      recentSearches: [],
      recentlyViewedProducts: [],
      purchaseHistory: [],
      lastUpdated: Date.now(),
    };
  }
  async saveUserPreferences(preferences) {
    try {
      preferences.lastUpdated = Date.now();
      const exists = await this.userPreferencesExist(preferences.userId);
      if (exists) {
        await this.elasticsearchService.update({
          index: this.preferencesIndex,
          id: preferences.userId,
          body: {
            doc: preferences,
          },
        });
      } else {
        await this.elasticsearchService.index({
          index: this.preferencesIndex,
          id: preferences.userId,
          body: preferences,
        });
      }
      this.preferencesCache.set(preferences.userId, preferences);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to save user preferences for ${preferences.userId}: ${error.message}`,
      );
      return false;
    }
  }
  async userPreferencesExist(userId) {
    try {
      const response = await this.elasticsearchService.exists({
        index: this.preferencesIndex,
        id: userId,
      });
      if (typeof response === 'boolean') {
        return response;
      }
      return response?.statusCode === 200;
    } catch (error) {
      this.logger.error(`Error checking if user preferences exist for ${userId}: ${error.message}`);
      return false;
    }
  }
  async recordInteraction(interaction) {
    try {
      if (interaction.data.sessionId && !interaction.sessionId) {
        interaction.sessionId = interaction.data.sessionId;
      }
      if (interaction.data.sessionDuration && !interaction.sessionDuration) {
        interaction.sessionDuration = interaction.data.sessionDuration;
      }
      if (interaction.sessionId) {
        this.logger.debug(
          `Recording interaction for user ${interaction.userId} in session ${interaction.sessionId}`,
        );
      }
      await this.elasticsearchService.index({
        index: this.interactionsIndex,
        body: interaction,
      });
      await this.updatePreferencesFromInteraction(interaction);
      return true;
    } catch (error) {
      this.logger.error(`Failed to record user interaction: ${error.message}`);
      return false;
    }
  }
  async updatePreferencesFromInteraction(interaction) {
    try {
      const preferences = await this.getUserPreferences(interaction.userId);
      if (!preferences) return;
      switch (interaction.type) {
        case UserInteractionType.SEARCH:
          this.updateFromSearch(preferences, interaction.data);
          break;
        case UserInteractionType.VIEW_PRODUCT:
          this.updateFromProductView(preferences, interaction.data);
          break;
        case UserInteractionType.ADD_TO_CART:
        case UserInteractionType.PURCHASE:
          this.updateFromPurchaseActivity(preferences, interaction.data, interaction.type);
          break;
        case UserInteractionType.FILTER_APPLY:
          this.updateFromFilterApply(preferences, interaction.data);
          break;
        case UserInteractionType.CLICK_CATEGORY:
        case UserInteractionType.CLICK_BRAND:
          this.updateFromCategoryOrBrandClick(preferences, interaction.data, interaction.type);
          break;
        case UserInteractionType.SEARCH_RESULT_IMPRESSION:
          this.updateFromSearchResultImpression(preferences, interaction.data);
          break;
        case UserInteractionType.SEARCH_RESULT_DWELL_TIME:
          this.updateFromSearchResultDwellTime(preferences, interaction.data);
          break;
      }
      await this.saveUserPreferences(preferences);
    } catch (error) {
      this.logger.error(`Failed to update preferences from interaction: ${error.message}`);
    }
  }
  updateFromSearch(preferences, data) {
    if (!data.searchTerm) return;
    const newSearch = {
      term: data.searchTerm,
      timestamp: Date.now(),
    };
    preferences.recentSearches.unshift(newSearch);
    if (preferences.recentSearches.length > 10) {
      preferences.recentSearches = preferences.recentSearches.slice(0, 10);
    }
    if (data.category) {
      const category = data.category.toLowerCase();
      preferences.categories[category] = (preferences.categories[category] || 0) + 0.2;
    }
    if (data.brand) {
      const brand = data.brand.toLowerCase();
      preferences.brands[brand] = (preferences.brands[brand] || 0) + 0.2;
    }
    if (data.values && Array.isArray(data.values)) {
      data.values.forEach(value => {
        const valueLower = value.toLowerCase();
        preferences.values[valueLower] = (preferences.values[valueLower] || 0) + 0.2;
      });
    }
  }
  updateFromProductView(preferences, data) {
    if (!data.productId) return;
    const newView = {
      productId: data.productId,
      timestamp: Date.now(),
    };
    const existingIndex = preferences.recentlyViewedProducts.findIndex(
      item => item.productId === data.productId,
    );
    if (existingIndex >= 0) {
      preferences.recentlyViewedProducts.splice(existingIndex, 1);
    }
    preferences.recentlyViewedProducts.unshift(newView);
    if (preferences.recentlyViewedProducts.length > 20) {
      preferences.recentlyViewedProducts = preferences.recentlyViewedProducts.slice(0, 20);
    }
    if (data.categories && Array.isArray(data.categories)) {
      data.categories.forEach(category => {
        const categoryLower = category.toLowerCase();
        preferences.categories[categoryLower] = (preferences.categories[categoryLower] || 0) + 0.1;
      });
    }
    if (data.brand) {
      const brand = data.brand.toLowerCase();
      preferences.brands[brand] = (preferences.brands[brand] || 0) + 0.1;
    }
    if (data.values && Array.isArray(data.values)) {
      data.values.forEach(value => {
        const valueLower = value.toLowerCase();
        preferences.values[valueLower] = (preferences.values[valueLower] || 0) + 0.1;
      });
    }
    if (data.price && typeof data.price === 'number') {
      this.updatePriceRangePreference(preferences, data.price, 0.1);
    }
  }
  updateFromPurchaseActivity(preferences, data, type) {
    if (!data.productId) return;
    const weightMultiplier = type === UserInteractionType.PURCHASE ? 0.5 : 0.2;
    if (type === UserInteractionType.PURCHASE) {
      const newPurchase = {
        productId: data.productId,
        timestamp: Date.now(),
      };
      preferences.purchaseHistory.unshift(newPurchase);
      if (preferences.purchaseHistory.length > 50) {
        preferences.purchaseHistory = preferences.purchaseHistory.slice(0, 50);
      }
    }
    if (data.categories && Array.isArray(data.categories)) {
      data.categories.forEach(category => {
        const categoryLower = category.toLowerCase();
        preferences.categories[categoryLower] =
          (preferences.categories[categoryLower] || 0) + weightMultiplier;
      });
    }
    if (data.brand) {
      const brand = data.brand.toLowerCase();
      preferences.brands[brand] = (preferences.brands[brand] || 0) + weightMultiplier;
    }
    if (data.values && Array.isArray(data.values)) {
      data.values.forEach(value => {
        const valueLower = value.toLowerCase();
        preferences.values[valueLower] = (preferences.values[valueLower] || 0) + weightMultiplier;
      });
    }
    if (data.price && typeof data.price === 'number') {
      this.updatePriceRangePreference(preferences, data.price, weightMultiplier);
    }
  }
  updateFromFilterApply(preferences, data) {
    if (data.categories && Array.isArray(data.categories)) {
      data.categories.forEach(category => {
        const categoryLower = category.toLowerCase();
        preferences.categories[categoryLower] = (preferences.categories[categoryLower] || 0) + 0.15;
      });
    }
    if (data.brands && Array.isArray(data.brands)) {
      data.brands.forEach(brand => {
        const brandLower = brand.toLowerCase();
        preferences.brands[brandLower] = (preferences.brands[brandLower] || 0) + 0.15;
      });
    }
    if (data.values && Array.isArray(data.values)) {
      data.values.forEach(value => {
        const valueLower = value.toLowerCase();
        preferences.values[valueLower] = (preferences.values[valueLower] || 0) + 0.15;
      });
    }
    if (data.priceMin !== undefined && data.priceMax !== undefined) {
      const existingRangeIndex = preferences.priceRanges.findIndex(
        range => range.min === data.priceMin && range.max === data.priceMax,
      );
      if (existingRangeIndex >= 0) {
        preferences.priceRanges[existingRangeIndex].weight += 0.15;
      } else {
        preferences.priceRanges.push({
          min: data.priceMin,
          max: data.priceMax,
          weight: 0.15,
        });
        preferences.priceRanges.sort((a, b) => b.weight - a.weight);
        if (preferences.priceRanges.length > 5) {
          preferences.priceRanges = preferences.priceRanges.slice(0, 5);
        }
      }
    }
  }
  updateFromSearchResultDwellTime(preferences, data) {
    try {
      const { resultId, _query, dwellTimeMs } = data;
      if (!resultId || !dwellTimeMs) return;
      const MIN_DWELL_TIME = 5000;
      const OPTIMAL_DWELL_TIME = 60000;
      const MAX_DWELL_TIME = 300000;
      if (dwellTimeMs < MIN_DWELL_TIME) return;
      const cappedDwellTime = Math.min(dwellTimeMs, MAX_DWELL_TIME);
      const baseWeight =
        0.1 +
        0.9 *
          Math.min((cappedDwellTime - MIN_DWELL_TIME) / (OPTIMAL_DWELL_TIME - MIN_DWELL_TIME), 1.0);
      const mockCategories = ['electronics', 'clothing', 'home', 'beauty'];
      const mockBrands = ['apple', 'samsung', 'nike', 'adidas'];
      const randomCategory = mockCategories[Math.floor(Math.random() * mockCategories.length)];
      const randomBrand = mockBrands[Math.floor(Math.random() * mockBrands.length)];
      if (randomCategory) {
        preferences.categories[randomCategory] =
          (preferences.categories[randomCategory] || 0) + baseWeight;
      }
      if (randomBrand) {
        preferences.brands[randomBrand] = (preferences.brands[randomBrand] || 0) + baseWeight;
      }
      this.logger.debug(
        `Dwell time for ${resultId}: ${dwellTimeMs}ms, applied weight: ${baseWeight.toFixed(2)}`,
      );
      preferences.lastUpdated = Date.now();
    } catch (error) {
      this.logger.error(`Error updating preferences from dwell time: ${error.message}`);
    }
  }
  updateFromSearchResultImpression(preferences, data) {
    try {
      const { resultIds, _query } = data;
      if (!resultIds || !Array.isArray(resultIds) || resultIds.length === 0) return;
      const impressionWeight = 0.05;
      const mockCategories = ['electronics', 'clothing', 'home', 'beauty'];
      const mockBrands = ['apple', 'samsung', 'nike', 'adidas'];
      const randomCategory = mockCategories[Math.floor(Math.random() * mockCategories.length)];
      const randomBrand = mockBrands[Math.floor(Math.random() * mockBrands.length)];
      if (randomCategory) {
        preferences.categories[randomCategory] =
          (preferences.categories[randomCategory] || 0) + impressionWeight;
      }
      if (randomBrand) {
        preferences.brands[randomBrand] = (preferences.brands[randomBrand] || 0) + impressionWeight;
      }
      preferences.lastUpdated = Date.now();
    } catch (error) {
      this.logger.error(
        `Error updating preferences from search result impression: ${error.message}`,
      );
    }
  }
  updateFromCategoryOrBrandClick(preferences, data, type) {
    if (type === UserInteractionType.CLICK_CATEGORY && data.category) {
      const category = data.category.toLowerCase();
      preferences.categories[category] = (preferences.categories[category] || 0) + 0.25;
    } else if (type === UserInteractionType.CLICK_BRAND && data.brand) {
      const brand = data.brand.toLowerCase();
      preferences.brands[brand] = (preferences.brands[brand] || 0) + 0.25;
    }
  }
  updatePriceRangePreference(preferences, price, weight) {
    const standardRanges = [
      { min: 0, max: 25 },
      { min: 25, max: 50 },
      { min: 50, max: 100 },
      { min: 100, max: 200 },
      { min: 200, max: 500 },
      { min: 500, max: Number.MAX_SAFE_INTEGER },
    ];
    for (const range of standardRanges) {
      if (price >= range.min && price < range.max) {
        const existingRangeIndex = preferences.priceRanges.findIndex(
          r => r.min === range.min && r.max === range.max,
        );
        if (existingRangeIndex >= 0) {
          preferences.priceRanges[existingRangeIndex].weight += weight;
        } else {
          preferences.priceRanges.push({
            min: range.min,
            max: range.max,
            weight: weight,
          });
        }
        preferences.priceRanges.sort((a, b) => b.weight - a.weight);
        if (preferences.priceRanges.length > 5) {
          preferences.priceRanges = preferences.priceRanges.slice(0, 5);
        }
        break;
      }
    }
  }
  applyPreferencesToQuery(query, preferences, preferenceWeight = 1.0) {
    const enhancedQuery = JSON.parse(JSON.stringify(query));
    if (!enhancedQuery.query.function_score) {
      enhancedQuery.query = {
        function_score: {
          query: enhancedQuery.query,
          functions: [],
          score_mode: 'sum',
          boost_mode: 'multiply',
        },
      };
    }
    const functions = enhancedQuery.query.function_score.functions;
    const topCategories = this.getTopItems(preferences.categories, 5);
    for (const [category, weight] of topCategories) {
      functions.push({
        filter: {
          match: {
            categories: category,
          },
        },
        weight: weight * preferenceWeight,
      });
    }
    const topBrands = this.getTopItems(preferences.brands, 5);
    for (const [brand, weight] of topBrands) {
      functions.push({
        filter: {
          match: {
            brand: brand,
          },
        },
        weight: weight * preferenceWeight,
      });
    }
    const topValues = this.getTopItems(preferences.values, 5);
    for (const [value, weight] of topValues) {
      functions.push({
        filter: {
          match: {
            values: value,
          },
        },
        weight: weight * preferenceWeight,
      });
    }
    for (const range of preferences.priceRanges.slice(0, 3)) {
      functions.push({
        filter: {
          range: {
            price: {
              gte: range.min,
              lte: range.max,
            },
          },
        },
        weight: range.weight * preferenceWeight,
      });
    }
    if (preferences.recentlyViewedProducts.length > 0) {
      const recentProductIds = preferences.recentlyViewedProducts
        .slice(0, 10)
        .map(item => item.productId);
      functions.push({
        filter: {
          terms: {
            _id: recentProductIds,
          },
        },
        weight: 1.0 * preferenceWeight,
      });
    }
    return enhancedQuery;
  }
  getTopItems(items, limit) {
    return Object.entries(items)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }
  clearCache() {
    this.preferencesCache.clear();
    this.logger.log('User preferences cache cleared');
  }
});
exports.UserPreferenceService = UserPreferenceService;
exports.UserPreferenceService =
  UserPreferenceService =
  UserPreferenceService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          config_1.ConfigService,
          elasticsearch_1.ElasticsearchService,
        ]),
      ],
      UserPreferenceService,
    );
//# sourceMappingURL=user-preference.service.js.map
