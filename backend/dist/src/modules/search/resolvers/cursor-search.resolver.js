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
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var CursorSearchResolver_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.CursorSearchResolver = void 0;
const common_1 = require('@nestjs/common');
const graphql_1 = require('@nestjs/graphql');
const user_entity_1 = require('../../users/entities/user.entity');
const current_user_decorator_1 = require('../../auth/decorators/current-user.decorator');
const nlp_search_service_1 = require('../services/nlp-search.service');
const analytics_service_1 = require('../../analytics/services/analytics.service');
const personalization_service_1 = require('../../personalization/services/personalization.service');
const user_behavior_entity_1 = require('../../personalization/entities/user-behavior.entity');
const cursor_search_response_type_1 = require('../graphql/cursor-search-response.type');
const search_entity_type_enum_1 = require('../enums/search-entity-type.enum');
class _CursorSearchInput {}
let CursorSearchResolver = (CursorSearchResolver_1 = class CursorSearchResolver {
  constructor(logger, nlpSearchService, analyticsService, personalizationService) {
    this.logger = logger;
    this.nlpSearchService = nlpSearchService;
    this.analyticsService = analyticsService;
    this.personalizationService = personalizationService;
  }
  transformFacets(searchFacets) {
    if (!searchFacets) {
      return [];
    }
    const facetMap = new Map();
    const categories = searchFacets.categories;
    const valueFacets = searchFacets.values;
    const priceFacet = searchFacets.price;
    if (categories?.length) {
      facetMap.set('category', {
        name: 'category',
        displayName: 'Category',
        values: categories.map(cat => ({
          value: cat.name,
          count: cat.count,
        })),
      });
    }
    if (valueFacets?.length) {
      valueFacets.forEach(valueFacet => {
        let groupName = valueFacet.name;
        let valueName = valueFacet.name;
        const separatorIndex = valueFacet.name.indexOf(':');
        if (separatorIndex !== -1) {
          groupName = valueFacet.name.substring(0, separatorIndex);
          valueName = valueFacet.name.substring(separatorIndex + 1).trim();
        }
        const mapKey = groupName.toLowerCase().replace(/\s+/g, '_');
        if (!facetMap.has(mapKey)) {
          facetMap.set(mapKey, {
            name: mapKey,
            displayName: groupName,
            values: [],
          });
        }
        facetMap.get(mapKey)?.values.push({
          value: valueName,
          count: valueFacet.count,
        });
      });
    }
    if (priceFacet) {
      facetMap.set('price', {
        name: 'price',
        displayName: 'Price',
        values: priceFacet.ranges.map(range => ({
          value: `$${range.min.toFixed(0)}-$${range.max.toFixed(0)}`,
          count: range.count,
        })),
      });
    }
    return Array.from(facetMap.values());
  }
  generateCursor(item, index) {
    const cursorData = {
      id: item.id,
      index: index,
      timestamp: Date.now(),
    };
    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
  }
  decodeCursor(cursor) {
    if (!cursor) return null;
    try {
      const decodedString = Buffer.from(cursor, 'base64').toString('utf-8');
      return JSON.parse(decodedString);
    } catch (error) {
      this.logger.error(`Failed to decode cursor: ${error.message}`, error.stack);
      return null;
    }
  }
  async cursorSearch(query, cursor, limit, sessionId, user) {
    this.logger.log(
      `Received cursor-based search request: query=${query}, cursor=${cursor}, limit=${limit}, sessionId=${sessionId || 'none'}`,
      CursorSearchResolver_1.name,
    );
    const startTime = Date.now();
    try {
      let page = 0;
      let decodedCursor = null;
      if (cursor) {
        decodedCursor = this.decodeCursor(cursor);
        if (decodedCursor) {
          page = Math.floor(decodedCursor.index / limit) + 1;
        }
      }
      const _searchInput = {
        query,
        page,
        limit,
        enableNlp: true,
        personalized: !!user,
        includeSponsoredContent: true,
        boostByValues: false,
      };
      const searchOptions = {
        query: query || '',
        page,
        limit,
        filters: [],
        entityTypes: [
          search_entity_type_enum_1.SearchEntityType.PRODUCT,
          search_entity_type_enum_1.SearchEntityType.MERCHANT,
          search_entity_type_enum_1.SearchEntityType.BRAND,
        ],
        enableNlp: true,
        enableHighlighting: false,
        sessionId,
      };
      const searchResponse = await this.nlpSearchService.searchAsync(
        searchOptions,
        user,
        sessionId,
      );
      const results = [];
      if (searchResponse.products && searchResponse.products.length > 0) {
        searchResponse.products.forEach(product => {
          results.push({
            id: product.id,
            type: search_entity_type_enum_1.SearchEntityType.PRODUCT,
            title: product.title,
            description: product.description || '',
            price: product.price,
            currency: 'USD',
            rating: product.rating || 0,
            reviewCount: product.reviewCount || 0,
            categories: product.categories || [],
            values: product.values || [],
            brandName: product.brandName || '',
            score: product.score || 0,
            isSponsored: product.isSponsored || false,
            inStock: true,
          });
        });
      }
      if (searchResponse.merchants && searchResponse.merchants.length > 0) {
        searchResponse.merchants.forEach(merchant => {
          results.push({
            id: merchant.id,
            type: search_entity_type_enum_1.SearchEntityType.MERCHANT,
            name: merchant.name,
            description: merchant.description || '',
            logo: merchant.logo || '',
            categories: merchant.categories || [],
            values: merchant.values || [],
            location: merchant.location || '',
            rating: merchant.rating || 0,
            reviewCount: merchant.reviewCount || 0,
            score: merchant.score || 0,
            isSponsored: merchant.isSponsored || false,
            inStock: true,
          });
        });
      }
      if (searchResponse.brands && searchResponse.brands.length > 0) {
        searchResponse.brands.forEach(brand => {
          results.push({
            id: brand.id,
            type: search_entity_type_enum_1.SearchEntityType.BRAND,
            name: brand.name,
            description: brand.description || '',
            logo: brand.logo || '',
            categories: brand.categories || [],
            values: brand.values || [],
            location: brand.location || '',
            foundedYear: brand.foundedYear,
            score: brand.score || 0,
            isSponsored: brand.isSponsored || false,
            inStock: true,
          });
        });
      }
      const hasMore = page < searchResponse.pagination.totalPages - 1;
      let nextCursor = null;
      if (hasMore && results.length > 0) {
        const lastItem = results[results.length - 1];
        const lastIndex = page * limit + results.length - 1;
        nextCursor = this.generateCursor(lastItem, lastIndex);
      }
      this.analyticsService
        .trackSearch({
          query,
          userId: user?.id,
          sessionId: undefined,
          resultCount: searchResponse.pagination.total,
          hasFilters: false,
          categoryContext: undefined,
          deviceType: undefined,
          platform: undefined,
          isNlpEnhanced: true,
          isPersonalized: false,
          experimentId: undefined,
          filterCount: 0,
          highlightsEnabled: searchResponse.highlightsEnabled,
          metadata: {
            responseTimeMs: Date.now() - startTime,
            cursorBased: true,
            hasNextCursor: !!nextCursor,
          },
        })
        .catch(error => {
          this.logger.error(
            `Failed to track search analytics: ${error.message}`,
            error.stack,
            CursorSearchResolver_1.name,
          );
        });
      if (user && query) {
        this.personalizationService
          .trackInteractionAndUpdatePreferences(
            user.id,
            user_behavior_entity_1.BehaviorType.SEARCH,
            query,
            'search',
            query,
          )
          .catch(error => {
            this.logger.error(
              `Failed to track search behavior: ${error.message}`,
              error.stack,
              CursorSearchResolver_1.name,
            );
          });
      }
      return {
        query,
        pagination: {
          total: searchResponse.pagination.total,
          nextCursor,
          hasMore,
        },
        results,
        highlightsEnabled: false,
        facets: this.transformFacets(searchResponse.facets),
        isPersonalized: false,
        experimentId: undefined,
        appliedFilters: [],
      };
    } catch (error) {
      this.logger.error(
        `Cursor-based search failed for query "${query}": ${error.message}`,
        error.stack,
        CursorSearchResolver_1.name,
      );
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      this.logger.log(
        `Finished processing cursor-based search for query "${query}" in ${duration}ms.`,
        CursorSearchResolver_1.name,
      );
    }
  }
});
exports.CursorSearchResolver = CursorSearchResolver;
__decorate(
  [
    (0, graphql_1.Query)(() => cursor_search_response_type_1.CursorSearchResponseType, {
      name: 'search',
    }),
    __param(0, (0, graphql_1.Args)('query', { nullable: true })),
    __param(1, (0, graphql_1.Args)('cursor', { nullable: true })),
    __param(2, (0, graphql_1.Args)('limit', { nullable: true, defaultValue: 20 })),
    __param(3, (0, graphql_1.Args)('sessionId', { nullable: true })),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, Number, String, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  CursorSearchResolver.prototype,
  'cursorSearch',
  null,
);
exports.CursorSearchResolver =
  CursorSearchResolver =
  CursorSearchResolver_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        (0, graphql_1.Resolver)(() => cursor_search_response_type_1.CursorSearchResponseType),
        __metadata('design:paramtypes', [
          common_1.Logger,
          nlp_search_service_1.NlpSearchService,
          analytics_service_1.AnalyticsService,
          personalization_service_1.PersonalizationService,
        ]),
      ],
      CursorSearchResolver,
    );
//# sourceMappingURL=cursor-search.resolver.js.map
