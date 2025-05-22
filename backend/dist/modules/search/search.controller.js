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
exports.SearchController = void 0;
const common_1 = require('@nestjs/common');
const swagger_1 = require('@nestjs/swagger');
const search_service_1 = require('./search.service');
const jwt_auth_guard_1 = require('../auth/guards/jwt-auth.guard');
const pagination_dto_1 = require('../../common/dto/pagination.dto');
let SearchController = class SearchController {
  constructor(searchService) {
    this.searchService = searchService;
  }
  searchProducts(
    query,
    paginationDto,
    categories,
    priceMin,
    priceMax,
    merchantId,
    inStock,
    values,
    brandName,
    sortField,
    sortOrder,
  ) {
    const filters = {
      categories,
      priceMin,
      priceMax,
      merchantId,
      inStock,
      values,
      brandName,
    };
    const sort = sortField ? { field: sortField, order: sortOrder || 'asc' } : undefined;
    return this.searchService.searchProducts(query, paginationDto, filters, sort);
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
    return this.searchService.naturalLanguageSearch(query, paginationDto);
  }
  searchAll(query, paginationDto) {
    return this.searchService.searchAll(query, paginationDto);
  }
  reindexAllProducts() {
    return this.searchService.reindexAllProducts();
  }
};
exports.SearchController = SearchController;
__decorate(
  [
    (0, common_1.Get)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'Search products with advanced filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns search results' }),
    (0, swagger_1.ApiQuery)({ name: 'query', required: false, description: 'Search query' }),
    (0, swagger_1.ApiQuery)({
      name: 'categories',
      required: false,
      isArray: true,
      description: 'Filter by categories',
    }),
    (0, swagger_1.ApiQuery)({ name: 'priceMin', required: false, description: 'Minimum price' }),
    (0, swagger_1.ApiQuery)({ name: 'priceMax', required: false, description: 'Maximum price' }),
    (0, swagger_1.ApiQuery)({
      name: 'merchantId',
      required: false,
      description: 'Filter by merchant ID',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'inStock',
      required: false,
      description: 'Filter by stock status',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'values',
      required: false,
      isArray: true,
      description: 'Filter by values',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'brandName',
      required: false,
      description: 'Filter by brand name',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'sortField',
      required: false,
      description: 'Field to sort by',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'sortOrder',
      required: false,
      enum: ['asc', 'desc'],
      description: 'Sort order',
    }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Query)('categories')),
    __param(3, (0, common_1.Query)('priceMin')),
    __param(4, (0, common_1.Query)('priceMax')),
    __param(5, (0, common_1.Query)('merchantId')),
    __param(6, (0, common_1.Query)('inStock')),
    __param(7, (0, common_1.Query)('values')),
    __param(8, (0, common_1.Query)('brandName')),
    __param(9, (0, common_1.Query)('sortField')),
    __param(10, (0, common_1.Query)('sortOrder')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      String,
      pagination_dto_1.PaginationDto,
      Array,
      Number,
      Number,
      String,
      Boolean,
      Array,
      String,
      String,
      String,
    ]),
    __metadata('design:returntype', void 0),
  ],
  SearchController.prototype,
  'searchProducts',
  null,
);
__decorate(
  [
    (0, common_1.Get)('products/suggestions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product suggestions for autocomplete' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns suggestions' }),
    (0, swagger_1.ApiQuery)({ name: 'query', required: true, description: 'Search query' }),
    (0, swagger_1.ApiQuery)({
      name: 'limit',
      required: false,
      description: 'Number of suggestions to return',
    }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Number]),
    __metadata('design:returntype', void 0),
  ],
  SearchController.prototype,
  'getProductSuggestions',
  null,
);
__decorate(
  [
    (0, common_1.Get)('products/related/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get related products' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns related products' }),
    (0, swagger_1.ApiQuery)({
      name: 'limit',
      required: false,
      description: 'Number of products to return',
    }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Number]),
    __metadata('design:returntype', void 0),
  ],
  SearchController.prototype,
  'getRelatedProducts',
  null,
);
__decorate(
  [
    (0, common_1.Get)('products/trending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get trending products' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns trending products' }),
    (0, swagger_1.ApiQuery)({
      name: 'limit',
      required: false,
      description: 'Number of products to return',
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', void 0),
  ],
  SearchController.prototype,
  'getTrendingProducts',
  null,
);
__decorate(
  [
    (0, common_1.Get)('products/discovery'),
    (0, swagger_1.ApiOperation)({ summary: 'Get discovery products' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns discovery products' }),
    (0, swagger_1.ApiQuery)({
      name: 'userId',
      required: false,
      description: 'User ID for personalization',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'limit',
      required: false,
      description: 'Number of products to return',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'values',
      required: false,
      isArray: true,
      description: 'Values to prioritize',
    }),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('values')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Number, Array]),
    __metadata('design:returntype', void 0),
  ],
  SearchController.prototype,
  'getDiscoveryProducts',
  null,
);
__decorate(
  [
    (0, common_1.Get)('natural'),
    (0, swagger_1.ApiOperation)({ summary: 'Natural language search' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns search results' }),
    (0, swagger_1.ApiQuery)({
      name: 'query',
      required: true,
      description: 'Natural language query',
    }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, pagination_dto_1.PaginationDto]),
    __metadata('design:returntype', void 0),
  ],
  SearchController.prototype,
  'naturalLanguageSearch',
  null,
);
__decorate(
  [
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({ summary: 'Search across all entities' }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: 'Returns search results for products, merchants, and brands',
    }),
    (0, swagger_1.ApiQuery)({ name: 'query', required: true, description: 'Search query' }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, pagination_dto_1.PaginationDto]),
    __metadata('design:returntype', void 0),
  ],
  SearchController.prototype,
  'searchAll',
  null,
);
__decorate(
  [
    (0, common_1.Get)('reindex'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Reindex all products' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Products reindexed successfully' }),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  SearchController.prototype,
  'reindexAllProducts',
  null,
);
exports.SearchController = SearchController = __decorate(
  [
    (0, swagger_1.ApiTags)('search'),
    (0, common_1.Controller)('search'),
    __metadata('design:paramtypes', [search_service_1.SearchService]),
  ],
  SearchController,
);
//# sourceMappingURL=search.controller.js.map
