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
exports.RelatedProductsResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const related_products_service_1 = require('../services/related-products.service');
const search_response_type_1 = require('../graphql/search-response.type');
const current_user_decorator_1 = require('../../auth/decorators/current-user.decorator');
const user_entity_1 = require('../../users/entities/user.entity');
let RelatedProductsResolver = class RelatedProductsResolver {
  constructor(relatedProductsService) {
    this.relatedProductsService = relatedProductsService;
  }
  async getRelatedProducts(productId, limit, user) {
    const userId = user?.id;
    return this.relatedProductsService.getRelatedProducts(productId, userId, { limit });
  }
  async getComplementaryProducts(productId, limit, user) {
    const userId = user?.id;
    return this.relatedProductsService.getComplementaryProducts(productId, userId, limit);
  }
  async getFrequentlyBoughtTogether(productId, limit) {
    return this.relatedProductsService.getFrequentlyBoughtTogether(productId, limit);
  }
};
exports.RelatedProductsResolver = RelatedProductsResolver;
__decorate(
  [
    (0, graphql_1.Query)(() => search_response_type_1.SearchResponseType, {
      name: 'relatedProducts',
    }),
    __param(0, (0, graphql_1.Args)('productId')),
    __param(1, (0, graphql_1.Args)('limit', { nullable: true })),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Number, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  RelatedProductsResolver.prototype,
  'getRelatedProducts',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => search_response_type_1.SearchResponseType, {
      name: 'complementaryProducts',
    }),
    __param(0, (0, graphql_1.Args)('productId')),
    __param(1, (0, graphql_1.Args)('limit', { nullable: true })),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Number, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  RelatedProductsResolver.prototype,
  'getComplementaryProducts',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => search_response_type_1.SearchResponseType, {
      name: 'frequentlyBoughtTogether',
    }),
    __param(0, (0, graphql_1.Args)('productId')),
    __param(1, (0, graphql_1.Args)('limit', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Number]),
    __metadata('design:returntype', Promise),
  ],
  RelatedProductsResolver.prototype,
  'getFrequentlyBoughtTogether',
  null,
);
exports.RelatedProductsResolver = RelatedProductsResolver = __decorate(
  [
    (0, graphql_1.Resolver)(),
    __metadata('design:paramtypes', [related_products_service_1.RelatedProductsService]),
  ],
  RelatedProductsResolver,
);
//# sourceMappingURL=related-products.resolver.js.map
