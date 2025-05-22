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
var DiscoverySearchService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.DiscoverySearchService = void 0;
const common_1 = require('@nestjs/common');
const elasticsearch_service_1 = require('./elasticsearch.service');
const natural_language_search_service_1 = require('../../nlp/services/natural-language-search.service');
const personalization_service_1 = require('../../personalization/services/personalization.service');
const ab_testing_service_1 = require('../../ab-testing/services/ab-testing.service');
const experiment_entity_1 = require('../../ab-testing/entities/experiment.entity');
const search_analytics_service_1 = require('../../analytics/services/search-analytics.service');
const transformFiltersForElastic = filters => {
  const elasticFilters = {};
  if (filters?.categories) elasticFilters.categories = filters.categories;
  if (filters?.priceMin) elasticFilters.priceMin = filters.priceMin;
  if (filters?.priceMax) elasticFilters.priceMax = filters.priceMax;
  if (filters?.merchantId) elasticFilters.merchantId = filters.merchantId;
  if (filters?.inStock) elasticFilters.inStock = filters.inStock;
  if (filters?.values && Array.isArray(filters.values)) {
    elasticFilters.values = filters.values.map(v => (typeof v === 'string' ? v : String(v)));
  }
  if (filters?.brandName) elasticFilters.brandName = filters.brandName;
  return elasticFilters;
};
let DiscoverySearchService = (DiscoverySearchService_1 = class DiscoverySearchService {
  constructor(
    elasticsearchService,
    naturalLanguageSearchService,
    personalizationService,
    abTestingService,
    searchAnalyticsService,
  ) {
    this.elasticsearchService = elasticsearchService;
    this.naturalLanguageSearchService = naturalLanguageSearchService;
    this.personalizationService = personalizationService;
    this.abTestingService = abTestingService;
    this.searchAnalyticsService = searchAnalyticsService;
    this.logger = new common_1.Logger(DiscoverySearchService_1.name);
  }
  async discoverySearch(query, userId, sessionId, options) {
    try {
      const elasticFilters = transformFiltersForElastic(options?.filters);
      const page = options?.page || 1;
      const limit = options?.limit || 20;
      const _searchStartTime = Date.now();
      const _searchId = `search_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const experimentConfig = await this.abTestingService.getVariantConfiguration(
        experiment_entity_1.ExperimentType.SEARCH_ALGORITHM,
        userId,
        sessionId,
      );
      const _discoveryParams = {
        queryWeight: 1.0,
        trendingWeight: 0.5,
        newProductsWeight: 0.5,
        personalizedWeight: 1.0,
        diversityFactor: 0.7,
        emergingBrandsBoost: 1.2,
        valueAlignmentBoost: 1.5,
        randomizationFactor: 0.3,
        includeAds: true,
        adRatio: 0.1,
        maxAdCount: 2,
      };
      const processedQuery = {
        processedQuery: query,
        entities: [],
        intents: [],
        sentiment: 'neutral',
      };
      const userPreferences = {
        categories: [],
        brands: [],
        values: [],
        priceRange: null,
      };
      const valueAlignment = userPreferences.values || [];
      const queryResults = query
        ? await this.elasticsearchService.searchProducts(
            processedQuery.processedQuery,
            elasticFilters,
            page,
            limit,
            options?.sort?.[0]?.field
              ? { field: options.sort[0].field, order: options.sort[0].order || 'desc' }
              : { field: '_score', order: 'desc' },
          )
        : { items: [], total: 0 };
      const _trendingResults = await this.elasticsearchService.getTrendingProducts(
        Math.ceil(limit * 0.3),
      );
      const personalizedProducts = { items: [], total: 0 };
      if (userId) {
        try {
          const recommendedIds =
            await this.personalizationService.generatePersonalizedRecommendations(
              userId,
              Math.ceil(limit * 0.5),
            );
          if (recommendedIds.length > 0) {
            const results = await this.elasticsearchService.searchProducts(
              '',
              elasticFilters,
              1,
              Math.ceil(limit * 0.5),
            );
            personalizedProducts.items = results.items;
            personalizedProducts.total = results.total;
          }
        } catch (error) {
          this.logger.error(`Failed to get personalized recommendations: ${error.message}`);
        }
      }
      const _newProducts = await this.elasticsearchService.searchProducts(
        '',
        elasticFilters,
        1,
        Math.ceil(limit * 0.2),
        {
          field: 'createdAt',
          order: 'desc',
        },
      );
      const _emergingBrands = await this.getEmergingBrandsProducts(Math.ceil(limit * 0.1));
      const _sponsoredProducts = await this.getSponsoredProducts(
        elasticFilters,
        Math.min(3, Math.ceil(limit * 0.1)),
        valueAlignment,
      );
      const finalResults = queryResults.items.map(item => {
        if (item.title && item.price !== undefined)
          return { ...item, __typename: 'ProductResultType' };
        if (item.foundedYear) return { ...item, __typename: 'BrandResultType' };
        if (item.merchantName) return { ...item, __typename: 'MerchantResultType' };
        return { ...item, __typename: 'ProductResultType' };
      });
      const totalPages = Math.ceil(queryResults.total / limit);
      const response = {
        query: processedQuery.processedQuery,
        pagination: {
          page,
          limit,
          total: queryResults.total,
          totalPages,
        },
        results: finalResults,
        facets: [],
        isNlpEnabled: !!(query && query.trim()),
        highlightsEnabled: false,
        isPersonalized: !!userId,
        experimentId: experimentConfig ? Object.keys(experimentConfig)[0] : undefined,
      };
      return response;
    } catch (error) {
      this.logger.error(`Discovery search failed: ${error.message}`, error.stack);
      try {
        const fallbackPage = options?.page || 1;
        const fallbackLimit = options?.limit || 20;
        let fallbackSortField = 'relevance';
        let fallbackSortOrder = 'desc';
        if (Array.isArray(options?.sort) && options.sort.length > 0 && options.sort[0].field) {
          fallbackSortField = options.sort[0].field;
          fallbackSortOrder = options.sort[0].order || 'desc';
        }
        const fallbackResult = await this.elasticsearchService.searchProducts(
          query,
          transformFiltersForElastic(options?.filters),
          fallbackPage,
          fallbackLimit,
          { field: fallbackSortField, order: fallbackSortOrder },
        );
        const response = {
          query: query,
          pagination: {
            page: fallbackPage,
            limit: fallbackLimit,
            total: fallbackResult.total,
            totalPages: Math.ceil(fallbackResult.total / fallbackLimit),
          },
          results: fallbackResult.items.map(item => ({ ...item, __typename: 'ProductResultType' })),
          highlightsEnabled: false,
          isPersonalized: false,
          isNlpEnabled: false,
        };
        return response;
      } catch (fallbackError) {
        this.logger.error(
          `Fallback search also failed: ${fallbackError?.message ?? 'Unknown error'}`,
        );
        return {
          query: query,
          pagination: {
            page: options?.page || 1,
            limit: options?.limit || 20,
            total: 0,
            totalPages: 0,
          },
          results: [],
          highlightsEnabled: false,
          isPersonalized: false,
          isNlpEnabled: false,
        };
      }
    }
  }
  async getEmergingBrandsProducts(limit, filters = {}) {
    try {
      const response = await this.elasticsearchService.searchProducts('', filters, 1, limit, {
        field: 'createdAt',
        order: 'desc',
      });
      return response.items.map(item => ({
        ...item,
        discoverySource: 'emerging_brand',
      }));
    } catch (error) {
      this.logger.error(`Failed to get emerging brands products: ${error.message}`);
      return [];
    }
  }
  async getSponsoredProducts(filters = {}, limit, values = []) {
    try {
      const adFilters = { ...filters };
      delete adFilters.priceMin;
      delete adFilters.priceMax;
      if (values.length > 0) {
        adFilters.values = values;
      }
      const response = await this.elasticsearchService.searchProducts('', adFilters, 1, limit, {
        field: '_score',
        order: 'desc',
      });
      return response.items.map(item => ({
        ...item,
        discoverySource: 'sponsored',
        isSponsored: true,
      }));
    } catch (error) {
      this.logger.error(`Failed to get sponsored products: ${error.message}`);
      return [];
    }
  }
  async getDiscoverySuggestions(query, userId, limit = 10) {
    try {
      const elasticsearchServiceAny = this.elasticsearchService;
      const prefixResponse = await elasticsearchServiceAny.search({
        index: 'search_suggestions',
        body: {
          suggest: {
            completion: {
              prefix: query,
              completion: {
                field: 'suggest',
                size: limit,
              },
            },
          },
        },
      });
      const prefixResults = [];
      if (prefixResponse?.suggest?.completion?.[0]?.options) {
        for (const option of prefixResponse.suggest.completion[0].options) {
          prefixResults.push({
            text: option._source.text,
            score: option._source.score || 1,
            category: option._source.category,
            type: option._source.type,
          });
        }
      }
      const personalizedSuggestions = userId
        ? await this.personalizationService
            .generatePersonalizedRecommendations(userId, Math.ceil(limit * 0.3))
            .then(recommendations =>
              recommendations.map(text => ({
                text,
                score: 10,
                isPersonalized: true,
              })),
            )
        : [];
      const allSuggestions = [...prefixResults];
      for (const suggestion of personalizedSuggestions) {
        if (!allSuggestions.some(s => s.text.toLowerCase() === suggestion.text.toLowerCase())) {
          allSuggestions.push({
            ...suggestion,
            isPersonalized: true,
          });
        }
      }
      const sortedSuggestions = allSuggestions.sort((a, b) => b.score - a.score).slice(0, limit);
      return {
        query,
        suggestions: sortedSuggestions,
        total: sortedSuggestions.length,
        isPersonalized: !!userId,
      };
    } catch (error) {
      this.logger.error(`Failed to get discovery suggestions: ${error.message}`);
      return {
        query,
        suggestions: [],
        total: 0,
        isPersonalized: false,
      };
    }
  }
  async getDiscoveryHomepage(userId, sessionId, options) {
    try {
      const limit = options?.limit || 20;
      const valueAlignment = userId ? ['sustainable', 'ethical', 'handmade'] : [];
      const trendingProducts = await this.elasticsearchService.getTrendingProducts(
        Math.ceil(limit * 0.3),
      );
      const personalizedProducts = userId
        ? await this.personalizationService
            .generatePersonalizedRecommendations(userId, Math.ceil(limit * 0.5))
            .then(productIds =>
              productIds.length > 0
                ? this.elasticsearchService
                    .searchProducts('', {}, 1, limit)
                    .then(result => result.items || [])
                : [],
            )
        : [];
      const newProducts = await this.elasticsearchService.searchProducts(
        '',
        {},
        1,
        Math.ceil(limit * 0.2),
        { field: 'createdAt', order: 'desc' },
      );
      const emergingBrands = await this.getEmergingBrandsProducts(Math.ceil(limit * 0.1));
      const sponsoredProducts = await this.getSponsoredProducts(
        {},
        Math.min(3, Math.ceil(limit * 0.1)),
        valueAlignment,
      );
      const sections = [
        {
          id: 'trending',
          title: 'Trending Now',
          description: 'What everyone is loving',
          items: trendingProducts,
          type: 'trending',
        },
      ];
      if (personalizedProducts.length > 0) {
        sections.unshift({
          id: 'for_you',
          title: 'For You',
          description: 'Products selected just for you',
          items: personalizedProducts,
          type: 'personalized',
        });
      }
      if (newProducts.items.length > 0) {
        sections.push({
          id: 'new_arrivals',
          title: 'Just Arrived',
          description: 'The latest additions to our marketplace',
          items: newProducts.items,
          type: 'new',
        });
      }
      if (emergingBrands.length > 0) {
        sections.push({
          id: 'emerging_brands',
          title: 'Emerging Brands',
          description: 'Discover up-and-coming creators',
          items: emergingBrands,
          type: 'emerging_brands',
        });
      }
      if (sponsoredProducts.length > 0) {
        sections.push({
          id: 'sponsored',
          title: 'Featured Products',
          description: 'Sponsored products you might like',
          items: sponsoredProducts,
          type: 'sponsored',
        });
      }
      return {
        sections,
        metadata: {
          personalizedCount: personalizedProducts.length,
          trendingCount: trendingProducts.length,
          newArrivalsCount: newProducts.items.length,
          emergingBrandsCount: emergingBrands.length,
          sponsoredCount: sponsoredProducts.length,
        },
        highlightsEnabled: false,
      };
    } catch (error) {
      this.logger.error(`Failed to get discovery homepage: ${error.message}`);
      const trendingProducts = await this.elasticsearchService.getTrendingProducts(20);
      return {
        sections: [
          {
            id: 'trending',
            title: 'Trending Now',
            description: 'What everyone is loving',
            items: trendingProducts,
            type: 'trending',
          },
        ],
        highlightsEnabled: false,
      };
    }
  }
});
exports.DiscoverySearchService = DiscoverySearchService;
exports.DiscoverySearchService =
  DiscoverySearchService =
  DiscoverySearchService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          elasticsearch_service_1.ElasticsearchService,
          natural_language_search_service_1.NaturalLanguageSearchService,
          personalization_service_1.PersonalizationService,
          ab_testing_service_1.AbTestingService,
          search_analytics_service_1.SearchAnalyticsService,
        ]),
      ],
      DiscoverySearchService,
    );
//# sourceMappingURL=discovery-search.service.js.map
