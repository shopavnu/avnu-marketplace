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
var SearchApiResolver_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.SearchApiResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const common_1 = require('@nestjs/common');
const nlp_search_service_1 = require('../services/nlp-search.service');
const simple_search_service_1 = require('../services/simple-search.service');
const search_options_dto_1 = require('../dto/search-options.dto');
const search_response_dto_1 = require('../dto/search-response.dto');
const gql_auth_guard_1 = require('../../auth/guards/gql-auth.guard');
const current_user_decorator_1 = require('../../auth/decorators/current-user.decorator');
const user_entity_1 = require('../../users/entities/user.entity');
const analytics_service_1 = require('../../analytics/services/analytics.service');
const search_entity_type_enum_1 = require('../enums/search-entity-type.enum');
let SearchApiResolver = (SearchApiResolver_1 = class SearchApiResolver {
  constructor(nlpSearchService, simpleSearchService, analyticsService) {
    this.nlpSearchService = nlpSearchService;
    this.simpleSearchService = simpleSearchService;
    this.analyticsService = analyticsService;
    this.logger = new common_1.Logger(SearchApiResolver_1.name);
  }
  async search(input, user) {
    this.logger.log(`Search query: ${input.query} by user: ${user?.id}`);
    const results = await this.simpleSearchService.searchAsync(input, user);
    this.analyticsService.trackSearch({
      query: input.query,
      resultCount: results.pagination.total,
      isNlpEnhanced: input.enableNlp ?? false,
      userId: user?.id,
      filters: input.filters ? JSON.stringify(input.filters) : undefined,
      metadata: {
        ...(input.sort && { sortBy: JSON.stringify(input.sort) }),
        ...(input.page !== undefined && { page: input.page }),
        ...(input.limit !== undefined && { limit: input.limit }),
      },
    });
    return results;
  }
  async searchProducts(input, user) {
    this.logger.log(`Product search query: ${input.query} by user: ${user?.id}`);
    const options = { ...input, entityType: search_entity_type_enum_1.SearchEntityType.PRODUCT };
    return this.simpleSearchService.searchAsync(options, user);
  }
  async searchMerchants(input, user) {
    this.logger.log(`Merchant search query: ${input.query} by user: ${user?.id}`);
    const options = { ...input, entityType: search_entity_type_enum_1.SearchEntityType.MERCHANT };
    return this.simpleSearchService.searchAsync(options, user);
  }
  async searchBrands(input, user) {
    this.logger.log(`Brand search query: ${input.query} by user: ${user?.id}`);
    const options = { ...input, entityType: search_entity_type_enum_1.SearchEntityType.BRAND };
    return this.simpleSearchService.searchAsync(options, user);
  }
  async searchAll(input, user) {
    this.logger.log(`Search query: ${input.query} by user: ${user?.id}`);
    const options = { ...input, entityType: search_entity_type_enum_1.SearchEntityType.ALL };
    return this.simpleSearchService.searchAsync(options, user);
  }
  async processQuery(query, user) {
    return this.simpleSearchService.searchAsync({ query }, user);
  }
  products(searchResponse) {
    return searchResponse.products;
  }
  merchants(searchResponse) {
    return searchResponse.merchants;
  }
  brands(searchResponse) {
    return searchResponse.brands;
  }
  pagination(searchResponse) {
    return searchResponse.pagination;
  }
  facets(searchResponse) {
    return searchResponse.facets;
  }
});
exports.SearchApiResolver = SearchApiResolver;
__decorate(
  [
    (0, graphql_1.Query)(() => search_response_dto_1.SearchResponseDto, {
      description: 'Search across products, merchants, and brands',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [search_options_dto_1.SearchOptionsInput, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  SearchApiResolver.prototype,
  'search',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => search_response_dto_1.SearchResponseDto, {
      description: 'Search products only',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [search_options_dto_1.SearchOptionsInput, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  SearchApiResolver.prototype,
  'searchProducts',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => search_response_dto_1.SearchResponseDto, {
      description: 'Search merchants only',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [search_options_dto_1.SearchOptionsInput, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  SearchApiResolver.prototype,
  'searchMerchants',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => search_response_dto_1.SearchResponseDto, {
      description: 'Search brands only',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [search_options_dto_1.SearchOptionsInput, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  SearchApiResolver.prototype,
  'searchBrands',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => search_response_dto_1.SearchResponseDto, {
      description: 'Search all entity types',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [search_options_dto_1.SearchOptionsInput, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  SearchApiResolver.prototype,
  'searchAll',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => search_response_dto_1.SearchResponseDto, {
      description: 'Process a query with NLP',
    }),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('query')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  SearchApiResolver.prototype,
  'processQuery',
  null,
);
__decorate(
  [
    (0, graphql_1.ResolveField)(() => [search_response_dto_1.ProductSearchResult], {
      nullable: true,
    }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [search_response_dto_1.SearchResponseDto]),
    __metadata('design:returntype', Array),
  ],
  SearchApiResolver.prototype,
  'products',
  null,
);
__decorate(
  [
    (0, graphql_1.ResolveField)(() => [search_response_dto_1.MerchantSearchResult], {
      nullable: true,
    }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [search_response_dto_1.SearchResponseDto]),
    __metadata('design:returntype', Array),
  ],
  SearchApiResolver.prototype,
  'merchants',
  null,
);
__decorate(
  [
    (0, graphql_1.ResolveField)(() => [search_response_dto_1.BrandSearchResult], {
      nullable: true,
    }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [search_response_dto_1.SearchResponseDto]),
    __metadata('design:returntype', Array),
  ],
  SearchApiResolver.prototype,
  'brands',
  null,
);
__decorate(
  [
    (0, graphql_1.ResolveField)(() => search_response_dto_1.PaginationInfo),
    __param(0, (0, graphql_1.Parent)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [search_response_dto_1.SearchResponseDto]),
    __metadata('design:returntype', search_response_dto_1.PaginationInfo),
  ],
  SearchApiResolver.prototype,
  'pagination',
  null,
);
__decorate(
  [
    (0, graphql_1.ResolveField)(() => search_response_dto_1.SearchFacets),
    __param(0, (0, graphql_1.Parent)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [search_response_dto_1.SearchResponseDto]),
    __metadata('design:returntype', search_response_dto_1.SearchFacets),
  ],
  SearchApiResolver.prototype,
  'facets',
  null,
);
exports.SearchApiResolver =
  SearchApiResolver =
  SearchApiResolver_1 =
    __decorate(
      [
        (0, graphql_1.Resolver)(() => search_response_dto_1.SearchResponseDto),
        __metadata('design:paramtypes', [
          nlp_search_service_1.NlpSearchService,
          simple_search_service_1.SimpleSearchService,
          analytics_service_1.AnalyticsService,
        ]),
      ],
      SearchApiResolver,
    );
//# sourceMappingURL=search-api.resolver.js.map
