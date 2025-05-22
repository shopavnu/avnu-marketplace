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
var SearchService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.SearchService = void 0;
const common_1 = require('@nestjs/common');
const elasticsearch_service_1 = require('./services/elasticsearch.service');
const products_service_1 = require('@modules/products/products.service');
const logger_service_1 = require('@common/services/logger.service');
const search_relevance_service_1 = require('./services/search-relevance.service');
const user_preference_service_1 = require('./services/user-preference.service');
const ab_testing_service_1 = require('./services/ab-testing.service');
const google_analytics_service_1 = require('../analytics/services/google-analytics.service');
const nlp_service_1 = require('../nlp/services/nlp.service');
const enhanced_nlp_service_1 = require('../nlp/services/enhanced-nlp.service');
let SearchService = (SearchService_1 = class SearchService {
  constructor(
    elasticsearchService,
    productsService,
    logger,
    searchRelevanceService,
    userPreferenceService,
    abTestingService,
    googleAnalyticsService,
    nlpService,
    enhancedNlpService,
  ) {
    this.elasticsearchService = elasticsearchService;
    this.productsService = productsService;
    this.logger = logger;
    this.searchRelevanceService = searchRelevanceService;
    this.userPreferenceService = userPreferenceService;
    this.abTestingService = abTestingService;
    this.googleAnalyticsService = googleAnalyticsService;
    this.nlpService = nlpService;
    this.enhancedNlpService = enhancedNlpService;
    this.logger.setContext(SearchService_1.name);
  }
  async searchProducts(query, paginationDto, filters, sort, options) {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const {
        enableNlp = false,
        enablePersonalization = false,
        enableABTesting = false,
        enableAnalytics = false,
        personalizationStrength = 1.0,
        clientId = this.googleAnalyticsService.generateClientId(),
        user = undefined,
      } = options || {};
      const searchMetadata = {};
      const startTime = Date.now();
      let nlpData;
      if (enableNlp && query) {
        try {
          const nlpResult = await this.enhancedNlpService.processQuery(query);
          const intent =
            typeof nlpResult.intent === 'string'
              ? nlpResult.intent
              : nlpResult.intent?.primary || 'general';
          const entities = Array.isArray(nlpResult.entities) ? nlpResult.entities : [];
          nlpData = {
            intent,
            entities: entities.map(e => ({
              type: e.type || 'unknown',
              value: e.value || '',
              confidence: e.confidence || 0.5,
            })),
          };
          searchMetadata.nlpProcessed = true;
          searchMetadata.intent = nlpData.intent;
          searchMetadata.entitiesDetected = nlpData.entities.length;
        } catch (nlpError) {
          this.logger.warn(`NLP processing failed: ${nlpError.message}`);
          searchMetadata.nlpProcessed = false;
        }
      }
      let testInfo;
      let scoringProfile = 'standard';
      if (enableABTesting && user) {
        testInfo = this.abTestingService.assignUserToVariant(
          'search-relevance-test-001',
          user.id,
          clientId,
        );
        if (testInfo) {
          scoringProfile = testInfo.algorithm;
          searchMetadata.abTest = {
            testId: testInfo.testId,
            variantId: testInfo.variantId,
            algorithm: testInfo.algorithm,
          };
        }
      }
      const searchQuery = this.elasticsearchService.buildProductSearchQuery(
        query,
        filters,
        page,
        limit,
        sort,
      );
      let enhancedQuery = searchQuery;
      if (enableNlp && nlpData) {
        enhancedQuery = this.searchRelevanceService.applyScoringProfile(
          searchQuery,
          'intent',
          user,
          nlpData.intent,
          nlpData.entities,
        );
        searchMetadata.relevanceProfile = 'intent';
      } else if (enableABTesting && testInfo) {
        enhancedQuery = this.searchRelevanceService.applyScoringProfile(
          searchQuery,
          scoringProfile,
          user,
        );
        searchMetadata.relevanceProfile = scoringProfile;
      } else if (enablePersonalization && user) {
        const userPreferences = await this.userPreferenceService.getUserPreferences(user.id);
        if (userPreferences) {
          enhancedQuery = this.userPreferenceService.applyPreferencesToQuery(
            searchQuery,
            userPreferences,
            personalizationStrength,
          );
          searchMetadata.relevanceProfile = 'personalized';
          searchMetadata.personalizationStrength = personalizationStrength;
        }
      }
      const result = await this.elasticsearchService.performSearch('products', enhancedQuery);
      const productIds = result.items.map(item => item.id);
      if (productIds.length === 0) {
        return { items: [], total: 0 };
      }
      const products = await this.productsService.findByIds(productIds);
      const sortedProducts = productIds
        .map(id => products.find(product => product.id === id))
        .filter(Boolean);
      const endTime = Date.now();
      searchMetadata.searchDuration = endTime - startTime;
      if (enableAnalytics) {
        try {
          await this.googleAnalyticsService.trackSearch(
            clientId,
            query,
            sortedProducts.length,
            testInfo,
            user?.id,
          );
        } catch (analyticsError) {
          this.logger.warn(`Failed to track search in analytics: ${analyticsError.message}`);
        }
      }
      return {
        items: sortedProducts,
        total: result.total,
        metadata: searchMetadata,
      };
    } catch (error) {
      this.logger.error(`Failed to search products: ${error.message}`);
      throw error;
    }
  }
  async getProductSuggestions(query, limit = 5) {
    try {
      return this.elasticsearchService.getProductSuggestions(query, limit);
    } catch (error) {
      this.logger.error(`Failed to get product suggestions: ${error.message}`);
      throw error;
    }
  }
  async getRelatedProducts(productId, limit = 5) {
    try {
      const result = await this.elasticsearchService.getRelatedProducts(productId, limit);
      const productIds = result.map(item => item.id);
      if (productIds.length === 0) {
        return [];
      }
      const products = await this.productsService.findByIds(productIds);
      const sortedProducts = productIds
        .map(id => products.find(product => product.id === id))
        .filter(Boolean);
      return sortedProducts;
    } catch (error) {
      this.logger.error(`Failed to get related products: ${error.message}`);
      throw error;
    }
  }
  async getTrendingProducts(limit = 10) {
    try {
      const result = await this.elasticsearchService.getTrendingProducts(limit);
      const productIds = result.map(item => item.id);
      if (productIds.length === 0) {
        return [];
      }
      const products = await this.productsService.findByIds(productIds);
      const sortedProducts = productIds
        .map(id => products.find(product => product.id === id))
        .filter(Boolean);
      return sortedProducts;
    } catch (error) {
      this.logger.error(`Failed to get trending products: ${error.message}`);
      throw error;
    }
  }
  async getDiscoveryProducts(userId, limit = 10, values) {
    try {
      const result = await this.elasticsearchService.getDiscoveryProducts(userId, limit, values);
      const productIds = result.map(item => item.id);
      if (productIds.length === 0) {
        return [];
      }
      const products = await this.productsService.findByIds(productIds);
      const sortedProducts = productIds
        .map(id => products.find(product => product.id === id))
        .filter(Boolean);
      return sortedProducts;
    } catch (error) {
      this.logger.error(`Failed to get discovery products: ${error.message}`);
      throw error;
    }
  }
  async reindexAllProducts() {
    try {
      const products = await this.productsService.findAllForIndexing();
      await this.elasticsearchService.reindexAllProducts(products);
      this.logger.log(`Reindexed ${products.length} products`);
    } catch (error) {
      this.logger.error(`Failed to reindex all products: ${error.message}`);
      throw error;
    }
  }
  async indexProduct(product) {
    try {
      await this.elasticsearchService.indexProduct(product);
    } catch (error) {
      this.logger.error(`Failed to index product: ${error.message}`);
      throw error;
    }
  }
  async updateProduct(product) {
    try {
      await this.elasticsearchService.updateProduct(product);
    } catch (error) {
      this.logger.error(`Failed to update product in index: ${error.message}`);
      throw error;
    }
  }
  async deleteProduct(productId) {
    try {
      await this.elasticsearchService.deleteProduct(productId);
    } catch (error) {
      this.logger.error(`Failed to delete product from index: ${error.message}`);
      throw error;
    }
  }
  async naturalLanguageSearch(query, paginationDto, user, clientId) {
    try {
      this.logger.log(`Performing natural language search for query: "${query}"`);
      const nlpResult = await this.enhancedNlpService.processQuery(query);
      const intent =
        typeof nlpResult.intent === 'string'
          ? nlpResult.intent
          : nlpResult.intent?.primary || 'general';
      const entities = Array.isArray(nlpResult.entities) ? nlpResult.entities : [];
      this.logger.log(`NLP processing complete. Intent: ${intent}, Entities: ${entities.length}`);
      const filters = {};
      for (const entity of entities) {
        switch (entity.type) {
          case 'category':
            if (!filters.categories) filters.categories = [];
            filters.categories.push(entity.value);
            break;
          case 'brand':
            filters.brandName = entity.value;
            break;
          case 'price':
            if (entity.value.includes('-')) {
              const [min, max] = entity.value.split('-').map(Number);
              filters.priceMin = min;
              filters.priceMax = max;
            }
            break;
          case 'value':
            if (!filters.values) filters.values = [];
            filters.values.push(entity.value);
            break;
        }
      }
      let sort;
      if (intent === 'recommendation') {
        sort = { field: 'rating', order: 'desc' };
      } else if (intent === 'sort' && query.includes('price')) {
        if (query.includes('high to low')) {
          sort = { field: 'price', order: 'desc' };
        } else {
          sort = { field: 'price', order: 'asc' };
        }
      }
      return this.searchProducts(query, paginationDto, filters, sort, {
        enableNlp: true,
        enablePersonalization: !!user,
        enableABTesting: !!user,
        enableAnalytics: true,
        clientId,
        user,
      });
    } catch (error) {
      this.logger.error(`Failed to perform natural language search: ${error.message}`);
      throw error;
    }
  }
  async searchAll(query, paginationDto, user, clientId, options) {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const productsPromise = this.searchProducts(query, { page, limit }, undefined, undefined, {
        enableNlp: options?.enableNlp ?? false,
        enablePersonalization: options?.enablePersonalization ?? false,
        enableABTesting: options?.enableABTesting ?? false,
        enableAnalytics: options?.enableAnalytics ?? false,
        user,
        clientId,
      });
      const merchantsPromise = this.elasticsearchService.searchMerchants(query, page, limit);
      const brandsPromise = this.elasticsearchService.searchBrands(query, page, limit);
      const [products, merchants, brands] = await Promise.all([
        productsPromise,
        merchantsPromise,
        brandsPromise,
      ]);
      return { products, merchants, brands };
    } catch (error) {
      this.logger.error(`Failed to search all entities: ${error.message}`);
      throw error;
    }
  }
});
exports.SearchService = SearchService;
exports.SearchService =
  SearchService =
  SearchService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          elasticsearch_service_1.ElasticsearchService,
          products_service_1.ProductsService,
          logger_service_1.LoggerService,
          search_relevance_service_1.SearchRelevanceService,
          user_preference_service_1.UserPreferenceService,
          ab_testing_service_1.ABTestingService,
          google_analytics_service_1.GoogleAnalyticsService,
          nlp_service_1.NlpService,
          enhanced_nlp_service_1.EnhancedNlpService,
        ]),
      ],
      SearchService,
    );
//# sourceMappingURL=search.service.js.map
