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
exports.RecommendationResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const common_1 = require('@nestjs/common');
const product_similarity_service_1 = require('../services/product-similarity.service');
const enhanced_personalization_service_1 = require('../services/enhanced-personalization.service');
const product_similarity_entity_1 = require('../entities/product-similarity.entity');
const product_entity_1 = require('../../products/entities/product.entity');
const jwt_auth_guard_1 = require('../../auth/guards/jwt-auth.guard');
const optional_auth_guard_1 = require('../../auth/guards/optional-auth.guard');
let RecommendationResolver = class RecommendationResolver {
  constructor(productSimilarityService, enhancedPersonalizationService) {
    this.productSimilarityService = productSimilarityService;
    this.enhancedPersonalizationService = enhancedPersonalizationService;
  }
  async getSimilarProducts(productId, type, limit) {
    return this.productSimilarityService.getSimilarProducts(productId, type, limit);
  }
  async getPersonalizedRecommendations(context, limit, refresh) {
    const userId = context.req.user?.id;
    return this.enhancedPersonalizationService.getPersonalizedRecommendations(
      userId,
      limit,
      refresh,
    );
  }
  async getTrendingProducts(context, limit) {
    const userId = context.req.user?.id || 'anonymous';
    return this.enhancedPersonalizationService.getTrendingProducts(userId, limit);
  }
  async trackImpression(_recommendationId) {
    return true;
  }
  async trackClick(_recommendationId) {
    return true;
  }
  async trackConversion(_recommendationId) {
    return true;
  }
  async updateProductSimilarities(productId) {
    await this.productSimilarityService.updateProductSimilarities(productId);
    return true;
  }
  async batchUpdateSimilarities(productIds) {
    await this.productSimilarityService.batchUpdateSimilarities(productIds);
    return true;
  }
};
exports.RecommendationResolver = RecommendationResolver;
__decorate(
  [
    (0, graphql_1.Query)(() => [product_entity_1.Product], { name: 'similarProducts' }),
    __param(0, (0, graphql_1.Args)('productId')),
    __param(
      1,
      (0, graphql_1.Args)('type', {
        type: () => String,
        nullable: true,
        defaultValue: product_similarity_entity_1.SimilarityType.HYBRID,
      }),
    ),
    __param(
      2,
      (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true, defaultValue: 10 }),
    ),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, Number]),
    __metadata('design:returntype', Promise),
  ],
  RecommendationResolver.prototype,
  'getSimilarProducts',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [product_entity_1.Product], { name: 'personalizedRecommendations' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __param(
      1,
      (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true, defaultValue: 10 }),
    ),
    __param(
      2,
      (0, graphql_1.Args)('refresh', { type: () => Boolean, nullable: true, defaultValue: false }),
    ),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, Number, Boolean]),
    __metadata('design:returntype', Promise),
  ],
  RecommendationResolver.prototype,
  'getPersonalizedRecommendations',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [product_entity_1.Product], { name: 'trendingProducts' }),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __param(
      1,
      (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true, defaultValue: 10 }),
    ),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, Number]),
    __metadata('design:returntype', Promise),
  ],
  RecommendationResolver.prototype,
  'getTrendingProducts',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => Boolean, { name: 'trackRecommendationImpression' }),
    __param(0, (0, graphql_1.Args)('recommendationId')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  RecommendationResolver.prototype,
  'trackImpression',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => Boolean, { name: 'trackRecommendationClick' }),
    __param(0, (0, graphql_1.Args)('recommendationId')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  RecommendationResolver.prototype,
  'trackClick',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => Boolean, { name: 'trackRecommendationConversion' }),
    __param(0, (0, graphql_1.Args)('recommendationId')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  RecommendationResolver.prototype,
  'trackConversion',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => Boolean, { name: 'updateProductSimilarities' }),
    __param(0, (0, graphql_1.Args)('productId')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  RecommendationResolver.prototype,
  'updateProductSimilarities',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => Boolean, { name: 'batchUpdateSimilarities' }),
    __param(0, (0, graphql_1.Args)('productIds', { type: () => [String] })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Array]),
    __metadata('design:returntype', Promise),
  ],
  RecommendationResolver.prototype,
  'batchUpdateSimilarities',
  null,
);
exports.RecommendationResolver = RecommendationResolver = __decorate(
  [
    (0, graphql_1.Resolver)(),
    __metadata('design:paramtypes', [
      product_similarity_service_1.ProductSimilarityService,
      enhanced_personalization_service_1.EnhancedPersonalizationService,
    ]),
  ],
  RecommendationResolver,
);
//# sourceMappingURL=recommendation.resolver.js.map
