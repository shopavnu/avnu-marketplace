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
exports.AnonymousUserController = void 0;
const common_1 = require('@nestjs/common');
const anonymous_user_service_1 = require('../services/anonymous-user.service');
const products_service_1 = require('../../products/products.service');
const optional_auth_guard_1 = require('../../auth/guards/optional-auth.guard');
let AnonymousUserController = class AnonymousUserController {
  constructor(anonymousUserService, productsService) {
    this.anonymousUserService = anonymousUserService;
    this.productsService = productsService;
  }
  async trackInteraction(type, data, durationMs, req, res) {
    const interactionType = type;
    await this.anonymousUserService.trackInteraction(req, res, interactionType, data, durationMs);
    return { success: true };
  }
  async getRecentSearches(req, res, limit) {
    if (req.user) {
      return { searches: [] };
    }
    const limitNumber = limit ? Number(limit) : 5;
    const searches = await this.anonymousUserService.getRecentSearches(req, res, limitNumber);
    return { searches };
  }
  async getRecentlyViewedProducts(req, res, limit) {
    if (req.user) {
      return { products: [] };
    }
    const limitNumber = limit ? Number(limit) : 10;
    const recentlyViewed = await this.anonymousUserService.getRecentlyViewedProducts(
      req,
      res,
      limitNumber,
    );
    const productIds = recentlyViewed.map(item => item.productId);
    const products = await this.productsService.findByIds(productIds);
    const productsWithViewData = products.map(product => {
      const viewData = recentlyViewed.find(item => item.productId === product.id);
      return {
        ...product,
        viewedAt: viewData?.timestamp,
        viewTimeSeconds: viewData?.viewTimeSeconds,
      };
    });
    return { products: productsWithViewData };
  }
  async getPersonalizedRecommendations(req, res, limit) {
    if (req.user) {
      return { products: [] };
    }
    const weights = await this.anonymousUserService.getPersonalizationWeights(req, res);
    const preferredCategories = Object.entries(weights.categories || {})
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 3)
      .map(([id]) => id);
    const preferredBrands = Object.entries(weights.brands || {})
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 3)
      .map(([id]) => id);
    const limitNumber = limit ? Number(limit) : 10;
    const virtualUserId = `anon_${preferredCategories[0] || ''}_${preferredBrands[0] || ''}`;
    const recommendedProducts = await this.productsService.getRecommendedProducts(
      virtualUserId,
      limitNumber,
    );
    return { products: recommendedProducts };
  }
  clearAnonymousUserData(req, res) {
    this.anonymousUserService.clearAnonymousUserData(req, res);
    return { success: true };
  }
};
exports.AnonymousUserController = AnonymousUserController;
__decorate(
  [
    (0, common_1.Post)('track'),
    __param(0, (0, common_1.Body)('type')),
    __param(1, (0, common_1.Body)('data')),
    __param(2, (0, common_1.Body)('durationMs')),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Res)({ passthrough: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Object, Number, Object, Object]),
    __metadata('design:returntype', Promise),
  ],
  AnonymousUserController.prototype,
  'trackInteraction',
  null,
);
__decorate(
  [
    (0, common_1.Get)('recent-searches'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Query)('limit')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, Object, Number]),
    __metadata('design:returntype', Promise),
  ],
  AnonymousUserController.prototype,
  'getRecentSearches',
  null,
);
__decorate(
  [
    (0, common_1.Get)('recently-viewed'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Query)('limit')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, Object, Number]),
    __metadata('design:returntype', Promise),
  ],
  AnonymousUserController.prototype,
  'getRecentlyViewedProducts',
  null,
);
__decorate(
  [
    (0, common_1.Get)('recommendations'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Query)('limit')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, Object, Number]),
    __metadata('design:returntype', Promise),
  ],
  AnonymousUserController.prototype,
  'getPersonalizedRecommendations',
  null,
);
__decorate(
  [
    (0, common_1.Post)('clear'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, Object]),
    __metadata('design:returntype', Object),
  ],
  AnonymousUserController.prototype,
  'clearAnonymousUserData',
  null,
);
exports.AnonymousUserController = AnonymousUserController = __decorate(
  [
    (0, common_1.Controller)('api/personalization'),
    __metadata('design:paramtypes', [
      anonymous_user_service_1.AnonymousUserService,
      products_service_1.ProductsService,
    ]),
  ],
  AnonymousUserController,
);
//# sourceMappingURL=anonymous-user.controller.js.map
