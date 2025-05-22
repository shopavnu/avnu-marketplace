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
exports.PersonalizationController = void 0;
const common_1 = require('@nestjs/common');
const swagger_1 = require('@nestjs/swagger');
const personalization_service_1 = require('./services/personalization.service');
const user_preferences_service_1 = require('./services/user-preferences.service');
const user_behavior_service_1 = require('./services/user-behavior.service');
const create_user_preferences_dto_1 = require('./dto/create-user-preferences.dto');
const update_user_preferences_dto_1 = require('./dto/update-user-preferences.dto');
const jwt_auth_guard_1 = require('../auth/guards/jwt-auth.guard');
const user_behavior_entity_1 = require('./entities/user-behavior.entity');
let PersonalizationController = class PersonalizationController {
  constructor(personalizationService, userPreferencesService, userBehaviorService) {
    this.personalizationService = personalizationService;
    this.userPreferencesService = userPreferencesService;
    this.userBehaviorService = userBehaviorService;
  }
  async createPreferences(req, createUserPreferencesDto) {
    createUserPreferencesDto.userId = req.user.id;
    return this.userPreferencesService.create(createUserPreferencesDto);
  }
  async getPreferences(req) {
    return this.userPreferencesService.findByUserId(req.user.id);
  }
  async updatePreferences(req, updateUserPreferencesDto) {
    return this.userPreferencesService.update(req.user.id, updateUserPreferencesDto);
  }
  async trackView(req, entityType, entityId) {
    await this.personalizationService.trackInteractionAndUpdatePreferences(
      req.user.id,
      user_behavior_entity_1.BehaviorType.VIEW,
      entityId,
      entityType,
    );
    return { success: true };
  }
  async trackFavorite(req, entityType, entityId) {
    await this.personalizationService.trackInteractionAndUpdatePreferences(
      req.user.id,
      user_behavior_entity_1.BehaviorType.FAVORITE,
      entityId,
      entityType,
    );
    return { success: true };
  }
  async trackSearch(req, body) {
    await this.personalizationService.trackInteractionAndUpdatePreferences(
      req.user.id,
      user_behavior_entity_1.BehaviorType.SEARCH,
      body.query,
      'search',
      body.query,
    );
    return { success: true };
  }
  async trackAddToCart(req, productId, body) {
    const metadata = body.quantity ? JSON.stringify({ quantity: body.quantity }) : undefined;
    await this.personalizationService.trackInteractionAndUpdatePreferences(
      req.user.id,
      user_behavior_entity_1.BehaviorType.ADD_TO_CART,
      productId,
      'product',
      metadata,
    );
    return { success: true };
  }
  async trackPurchase(req, productId, body) {
    const metadata = JSON.stringify({
      quantity: body.quantity || 1,
      price: body.price,
    });
    await this.personalizationService.trackInteractionAndUpdatePreferences(
      req.user.id,
      user_behavior_entity_1.BehaviorType.PURCHASE,
      productId,
      'product',
      metadata,
    );
    return { success: true };
  }
  async getRecommendations(req) {
    const productIds = await this.personalizationService.generatePersonalizedRecommendations(
      req.user.id,
    );
    return { productIds };
  }
  async enhanceSearch(req, body) {
    return this.personalizationService.enhanceSearchWithPersonalization(
      req.user.id,
      body.query,
      body.params,
    );
  }
  async getMostViewedProducts(req) {
    return this.userBehaviorService.getMostViewedProducts(req.user.id);
  }
  async getFavoriteProducts(req) {
    return this.userBehaviorService.getFavoriteProducts(req.user.id);
  }
  async getRecentSearches(req) {
    return this.userBehaviorService.getMostSearchedQueries(req.user.id);
  }
};
exports.PersonalizationController = PersonalizationController;
__decorate(
  [
    (0, common_1.Post)('preferences'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create user preferences' }),
    (0, swagger_1.ApiResponse)({
      status: 201,
      description: 'User preferences created successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      Object,
      create_user_preferences_dto_1.CreateUserPreferencesDto,
    ]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationController.prototype,
  'createPreferences',
  null,
);
__decorate(
  [
    (0, common_1.Get)('preferences'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user preferences' }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: 'User preferences retrieved successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationController.prototype,
  'getPreferences',
  null,
);
__decorate(
  [
    (0, common_1.Put)('preferences'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update user preferences' }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: 'User preferences updated successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      Object,
      update_user_preferences_dto_1.UpdateUserPreferencesDto,
    ]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationController.prototype,
  'updatePreferences',
  null,
);
__decorate(
  [
    (0, common_1.Post)('track/view/:entityType/:entityId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Track entity view' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'View tracked successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('entityType')),
    __param(2, (0, common_1.Param)('entityId')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, String, String]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationController.prototype,
  'trackView',
  null,
);
__decorate(
  [
    (0, common_1.Post)('track/favorite/:entityType/:entityId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Track entity favorite' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Favorite tracked successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('entityType')),
    __param(2, (0, common_1.Param)('entityId')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, String, String]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationController.prototype,
  'trackFavorite',
  null,
);
__decorate(
  [
    (0, common_1.Post)('track/search'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Track search query' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Search tracked successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, Object]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationController.prototype,
  'trackSearch',
  null,
);
__decorate(
  [
    (0, common_1.Post)('track/add-to-cart/:productId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Track add to cart' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Add to cart tracked successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('productId')),
    __param(2, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, String, Object]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationController.prototype,
  'trackAddToCart',
  null,
);
__decorate(
  [
    (0, common_1.Post)('track/purchase/:productId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Track purchase' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Purchase tracked successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('productId')),
    __param(2, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, String, Object]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationController.prototype,
  'trackPurchase',
  null,
);
__decorate(
  [
    (0, common_1.Get)('recommendations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get personalized recommendations' }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: 'Recommendations retrieved successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationController.prototype,
  'getRecommendations',
  null,
);
__decorate(
  [
    (0, common_1.Post)('enhance-search'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Enhance search with personalization' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Search enhanced successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, Object]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationController.prototype,
  'enhanceSearch',
  null,
);
__decorate(
  [
    (0, common_1.Get)('behavior/viewed-products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get most viewed products' }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: 'Most viewed products retrieved successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationController.prototype,
  'getMostViewedProducts',
  null,
);
__decorate(
  [
    (0, common_1.Get)('behavior/favorite-products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get favorite products' }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: 'Favorite products retrieved successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationController.prototype,
  'getFavoriteProducts',
  null,
);
__decorate(
  [
    (0, common_1.Get)('behavior/recent-searches'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent searches' }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: 'Recent searches retrieved successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationController.prototype,
  'getRecentSearches',
  null,
);
exports.PersonalizationController = PersonalizationController = __decorate(
  [
    (0, swagger_1.ApiTags)('personalization'),
    (0, common_1.Controller)('personalization'),
    __metadata('design:paramtypes', [
      personalization_service_1.PersonalizationService,
      user_preferences_service_1.UserPreferencesService,
      user_behavior_service_1.UserBehaviorService,
    ]),
  ],
  PersonalizationController,
);
//# sourceMappingURL=personalization.controller.js.map
