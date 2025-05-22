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
Object.defineProperty(exports, '__esModule', { value: true });
exports.SearchResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const common_1 = require('@nestjs/common');
const search_service_1 = require('./search.service');
const gql_auth_guard_1 = require('../auth/guards/gql-auth.guard');
const pagination_dto_1 = require('../../common/dto/pagination.dto');
const search_response_dto_1 = require('./dto/search-response.dto');
const product_paginated_dto_1 = require('../products/dto/product-paginated.dto');
let SearchFiltersInput = class SearchFiltersInput {};
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  SearchFiltersInput.prototype,
  'categories',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  SearchFiltersInput.prototype,
  'priceMin',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  SearchFiltersInput.prototype,
  'priceMax',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  SearchFiltersInput.prototype,
  'merchantId',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', Boolean)],
  SearchFiltersInput.prototype,
  'inStock',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  SearchFiltersInput.prototype,
  'values',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  SearchFiltersInput.prototype,
  'brandName',
  void 0,
);
SearchFiltersInput = __decorate([(0, graphql_1.InputType)()], SearchFiltersInput);
let SortInput = class SortInput {};
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  SortInput.prototype,
  'field',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  SortInput.prototype,
  'order',
  void 0,
);
SortInput = __decorate([(0, graphql_1.InputType)()], SortInput);
let MerchantPaginatedResponse = class MerchantPaginatedResponse {};
__decorate(
  [
    (0, graphql_1.Field)(() => [search_response_dto_1.MerchantSearchResult]),
    __metadata('design:type', Array),
  ],
  MerchantPaginatedResponse.prototype,
  'items',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  MerchantPaginatedResponse.prototype,
  'total',
  void 0,
);
MerchantPaginatedResponse = __decorate([(0, graphql_1.ObjectType)()], MerchantPaginatedResponse);
let BrandPaginatedResponse = class BrandPaginatedResponse {};
__decorate(
  [
    (0, graphql_1.Field)(() => [search_response_dto_1.BrandSearchResult]),
    __metadata('design:type', Array),
  ],
  BrandPaginatedResponse.prototype,
  'items',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  BrandPaginatedResponse.prototype,
  'total',
  void 0,
);
BrandPaginatedResponse = __decorate([(0, graphql_1.ObjectType)()], BrandPaginatedResponse);
let AllSearchResults = class AllSearchResults {};
__decorate(
  [
    (0, graphql_1.Field)(() => product_paginated_dto_1.ProductPaginatedResponse),
    __metadata('design:type', product_paginated_dto_1.ProductPaginatedResponse),
  ],
  AllSearchResults.prototype,
  'products',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => MerchantPaginatedResponse),
    __metadata('design:type', MerchantPaginatedResponse),
  ],
  AllSearchResults.prototype,
  'merchants',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => BrandPaginatedResponse),
    __metadata('design:type', BrandPaginatedResponse),
  ],
  AllSearchResults.prototype,
  'brands',
  void 0,
);
AllSearchResults = __decorate([(0, graphql_1.ObjectType)()], AllSearchResults);
let SearchResolver = class SearchResolver {
  constructor(searchService) {
    this.searchService = searchService;
  }
  searchProducts(query, paginationDto, filters, sort) {
    return this.searchService.searchProducts(
      query,
      paginationDto || { page: 1, limit: 10 },
      filters,
      sort,
    );
  }
  getProductSuggestions(query, limit) {
    return this.searchService.getProductSuggestions(query, limit);
  }
  getRelatedProducts(productId, limit) {
    return this.searchService.getRelatedProducts(productId, limit);
  }
  getTrendingProducts(limit) {
    return this.searchService.getTrendingProducts(limit);
  }
  getDiscoveryProducts(userId, limit, values) {
    return this.searchService.getDiscoveryProducts(userId, limit, values);
  }
  naturalLanguageSearch(query, paginationDto) {
    return this.searchService.naturalLanguageSearch(query, paginationDto || { page: 1, limit: 10 });
  }
  searchAll(query, paginationDto) {
    return this.searchService.searchAll(query, paginationDto || { page: 1, limit: 10 });
  }
  async reindexAllProducts() {
    await this.searchService.reindexAllProducts();
    return true;
  }
};
exports.SearchResolver = SearchResolver;
__decorate(
  [
    (0, graphql_1.Query)(() => product_paginated_dto_1.ProductPaginatedResponse, {
      name: 'searchProducts',
    }),
    __param(0, (0, graphql_1.Args)('query', { nullable: true })),
    __param(1, (0, graphql_1.Args)('pagination', { nullable: true })),
    __param(2, (0, graphql_1.Args)('filters', { nullable: true })),
    __param(3, (0, graphql_1.Args)('sort', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      String,
      pagination_dto_1.PaginationDto,
      SearchFiltersInput,
      SortInput,
    ]),
    __metadata('design:returntype', void 0),
  ],
  SearchResolver.prototype,
  'searchProducts',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [String], { name: 'productSuggestions' }),
    __param(0, (0, graphql_1.Args)('query')),
    __param(1, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Number]),
    __metadata('design:returntype', void 0),
  ],
  SearchResolver.prototype,
  'getProductSuggestions',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [search_response_dto_1.ProductSearchResult], {
      name: 'relatedProducts',
    }),
    __param(0, (0, graphql_1.Args)('productId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Number]),
    __metadata('design:returntype', void 0),
  ],
  SearchResolver.prototype,
  'getRelatedProducts',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [search_response_dto_1.ProductSearchResult], {
      name: 'trendingProducts',
    }),
    __param(0, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', void 0),
  ],
  SearchResolver.prototype,
  'getTrendingProducts',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [search_response_dto_1.ProductSearchResult], {
      name: 'discoveryProducts',
    }),
    __param(0, (0, graphql_1.Args)('userId', { nullable: true })),
    __param(1, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __param(2, (0, graphql_1.Args)('values', { type: () => [String], nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Number, Array]),
    __metadata('design:returntype', void 0),
  ],
  SearchResolver.prototype,
  'getDiscoveryProducts',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => product_paginated_dto_1.ProductPaginatedResponse, {
      name: 'naturalLanguageSearch',
    }),
    __param(0, (0, graphql_1.Args)('query')),
    __param(1, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, pagination_dto_1.PaginationDto]),
    __metadata('design:returntype', void 0),
  ],
  SearchResolver.prototype,
  'naturalLanguageSearch',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => AllSearchResults, { name: 'searchAll' }),
    __param(0, (0, graphql_1.Args)('query')),
    __param(1, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, pagination_dto_1.PaginationDto]),
    __metadata('design:returntype', void 0),
  ],
  SearchResolver.prototype,
  'searchAll',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => Boolean, { name: 'reindexAllProducts' }),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  SearchResolver.prototype,
  'reindexAllProducts',
  null,
);
exports.SearchResolver = SearchResolver = __decorate(
  [(0, graphql_1.Resolver)(), __metadata('design:paramtypes', [search_service_1.SearchService])],
  SearchResolver,
);
//# sourceMappingURL=search.resolver.js.map
