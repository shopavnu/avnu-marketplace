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
var SearchResolverStrict_1;
var _a, _b;
Object.defineProperty(exports, '__esModule', { value: true });
exports.SearchResolverStrict = void 0;
const graphql_1 = require('@nestjs/graphql');
const search_service_fixed_v4_1 = require('../services/search.service.fixed.v4');
const search_response_type_1 = require('../types/search-response.type');
const search_options_dto_1 = require('../dto/search-options.dto');
const common_1 = require('@nestjs/common');
const product_type_1 = require('../../products/types/product.type');
const merchant_type_1 = require('../../merchants/types/merchant.type');
const category_type_1 = require('../../categories/types/category.type');
let SearchResolverStrict = (SearchResolverStrict_1 = class SearchResolverStrict {
  constructor(searchService) {
    this.searchService = searchService;
    this.logger = new common_1.Logger(SearchResolverStrict_1.name);
  }
  async search(query, options) {
    this.logger.log(`GraphQL Search query: ${query}`);
    const result = await this.searchService.search(query, options || {});
    const response = new search_response_type_1.SearchResponseType();
    response.query = result.query;
    response.totalHits = result.totalHits;
    response.took = result.took;
    const productEntities = result.products ? result.products : [];
    const merchantEntities = result.merchants ? result.merchants : [];
    const categoryEntities = result.categories ? result.categories : [];
    response.products = this.mapProductsToProductType(productEntities);
    response.merchants = this.mapMerchantsToMerchantType(merchantEntities);
    response.categories = this.mapCategoriesToCategoryType(categoryEntities);
    response.facets = result.facets || {};
    return response;
  }
  async searchSuggestions(prefix, limit) {
    this.logger.log(`GraphQL SearchSuggestions query: ${prefix}`);
    return this.searchService.getSuggestions(prefix, limit);
  }
  mapProductsToProductType(products) {
    return products.map(product => {
      const productType = new product_type_1.ProductType();
      productType.id = String(product.id);
      productType.name = product.name || '';
      productType.description = product.description || '';
      productType.price = product.price || 0;
      productType.inStock = product.quantity ? product.quantity > 0 : false;
      productType.merchantId = product.merchantId ? String(product.merchantId) : '';
      if (Array.isArray(product.categories)) {
        productType.categoryIds = product.categories
          .filter(cat => cat && typeof cat === 'object' && 'id' in cat)
          .map(cat => String(cat.id));
      } else {
        productType.categoryIds = [];
      }
      productType.tags = Array.isArray(product.tags) ? product.tags : [];
      productType.createdAt = product.createdAt || new Date();
      productType.updatedAt = product.updatedAt || new Date();
      return productType;
    });
  }
  mapMerchantsToMerchantType(merchants) {
    return merchants.map(merchant => {
      const merchantType = new merchant_type_1.MerchantType();
      merchantType.id = String(merchant.id);
      merchantType.name = merchant.name || '';
      merchantType.description = merchant.description || '';
      merchantType.websiteUrl = merchant.website || '';
      merchantType.logoUrl = merchant.logo || '';
      merchantType.isActive = merchant.isActive ?? true;
      merchantType.tags = [];
      const merchantAny = merchant;
      if (merchantAny.tags && Array.isArray(merchantAny.tags)) {
        merchantType.tags = merchantAny.tags;
      }
      merchantType.createdAt = merchant.createdAt || new Date();
      merchantType.updatedAt = merchant.updatedAt || new Date();
      return merchantType;
    });
  }
  mapCategoriesToCategoryType(categories) {
    return categories.map(category => {
      const categoryType = new category_type_1.CategoryType();
      categoryType.id = String(category.id);
      categoryType.name = category.name || '';
      categoryType.description = category.description || '';
      categoryType.parentId = category.parentId ? String(category.parentId) : undefined;
      categoryType.createdAt = category.createdAt || new Date();
      categoryType.updatedAt = category.updatedAt || new Date();
      return categoryType;
    });
  }
});
exports.SearchResolverStrict = SearchResolverStrict;
__decorate(
  [
    (0, graphql_1.Query)(() => search_response_type_1.SearchResponseType),
    __param(0, (0, graphql_1.Args)('query')),
    __param(1, (0, graphql_1.Args)('options', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      String,
      typeof (_b =
        typeof search_options_dto_1.SearchOptions !== 'undefined' &&
        search_options_dto_1.SearchOptions) === 'function'
        ? _b
        : Object,
    ]),
    __metadata('design:returntype', Promise),
  ],
  SearchResolverStrict.prototype,
  'search',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [String]),
    __param(0, (0, graphql_1.Args)('prefix')),
    __param(1, (0, graphql_1.Args)('limit', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Number]),
    __metadata('design:returntype', Promise),
  ],
  SearchResolverStrict.prototype,
  'searchSuggestions',
  null,
);
exports.SearchResolverStrict =
  SearchResolverStrict =
  SearchResolverStrict_1 =
    __decorate(
      [
        (0, graphql_1.Resolver)(),
        __metadata('design:paramtypes', [
          typeof (_a =
            typeof search_service_fixed_v4_1.SearchService !== 'undefined' &&
            search_service_fixed_v4_1.SearchService) === 'function'
            ? _a
            : Object,
        ]),
      ],
      SearchResolverStrict,
    );
//# sourceMappingURL=search.resolver.strict.js.map
