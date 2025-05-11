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
exports.PersonalizationResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const common_1 = require('@nestjs/common');
const personalization_service_1 = require('./services/personalization.service');
const user_preferences_service_1 = require('./services/user-preferences.service');
const user_behavior_service_1 = require('./services/user-behavior.service');
const user_preferences_entity_1 = require('./entities/user-preferences.entity');
const user_behavior_entity_1 = require('./entities/user-behavior.entity');
const create_user_preferences_dto_1 = require('./dto/create-user-preferences.dto');
const update_user_preferences_dto_1 = require('./dto/update-user-preferences.dto');
const gql_auth_guard_1 = require('../auth/guards/gql-auth.guard');
const user_behavior_entity_2 = require('./entities/user-behavior.entity');
let PersonalizationResolver = class PersonalizationResolver {
  constructor(personalizationService, userPreferencesService, userBehaviorService) {
    this.personalizationService = personalizationService;
    this.userPreferencesService = userPreferencesService;
    this.userBehaviorService = userBehaviorService;
  }
  async createUserPreferences(createUserPreferencesDto, context) {
    createUserPreferencesDto.userId = context.req.user.id;
    return this.userPreferencesService.create(createUserPreferencesDto);
  }
  async getUserPreferences(context) {
    return this.userPreferencesService.findByUserId(context.req.user.id);
  }
  async updateUserPreferences(updateUserPreferencesDto, context) {
    return this.userPreferencesService.update(context.req.user.id, updateUserPreferencesDto);
  }
  async trackEntityView(entityType, entityId, context) {
    await this.personalizationService.trackInteractionAndUpdatePreferences(
      context.req.user.id,
      user_behavior_entity_2.BehaviorType.VIEW,
      entityId,
      entityType,
    );
    return true;
  }
  async trackEntityFavorite(entityType, entityId, context) {
    await this.personalizationService.trackInteractionAndUpdatePreferences(
      context.req.user.id,
      user_behavior_entity_2.BehaviorType.FAVORITE,
      entityId,
      entityType,
    );
    return true;
  }
  async trackSearch(query, context) {
    await this.personalizationService.trackInteractionAndUpdatePreferences(
      context.req.user.id,
      user_behavior_entity_2.BehaviorType.SEARCH,
      query,
      'search',
      query,
    );
    return true;
  }
  async trackAddToCart(context, productId, quantity) {
    const metadata = quantity ? JSON.stringify({ quantity }) : undefined;
    await this.personalizationService.trackInteractionAndUpdatePreferences(
      context.req.user.id,
      user_behavior_entity_2.BehaviorType.ADD_TO_CART,
      productId,
      'product',
      metadata,
    );
    return true;
  }
  async trackPurchase(context, productId, quantity, price) {
    const metadata = JSON.stringify({
      quantity: quantity || 1,
      price,
    });
    await this.personalizationService.trackInteractionAndUpdatePreferences(
      context.req.user.id,
      user_behavior_entity_2.BehaviorType.PURCHASE,
      productId,
      'product',
      metadata,
    );
    return true;
  }
  async getPersonalizedRecommendations(context, limit) {
    return this.personalizationService.generatePersonalizedRecommendations(
      context.req.user.id,
      limit || 10,
    );
  }
  async getMostViewedProducts(context) {
    return this.userBehaviorService.getMostViewedProducts(context.req.user.id);
  }
  async getFavoriteProducts(context) {
    return this.userBehaviorService.getFavoriteProducts(context.req.user.id);
  }
  async getRecentSearches(context) {
    return this.userBehaviorService.getMostSearchedQueries(context.req.user.id);
  }
};
exports.PersonalizationResolver = PersonalizationResolver;
__decorate(
  [
    (0, graphql_1.Mutation)(() => user_preferences_entity_1.UserPreferences),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      create_user_preferences_dto_1.CreateUserPreferencesDto,
      Object,
    ]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationResolver.prototype,
  'createUserPreferences',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => user_preferences_entity_1.UserPreferences),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationResolver.prototype,
  'getUserPreferences',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => user_preferences_entity_1.UserPreferences),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      update_user_preferences_dto_1.UpdateUserPreferencesDto,
      Object,
    ]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationResolver.prototype,
  'updateUserPreferences',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('entityType')),
    __param(1, (0, graphql_1.Args)('entityId')),
    __param(2, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, Object]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationResolver.prototype,
  'trackEntityView',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('entityType')),
    __param(1, (0, graphql_1.Args)('entityId')),
    __param(2, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, Object]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationResolver.prototype,
  'trackEntityFavorite',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('query')),
    __param(1, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Object]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationResolver.prototype,
  'trackSearch',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __param(1, (0, graphql_1.Args)('productId')),
    __param(2, (0, graphql_1.Args)('quantity', { type: () => graphql_1.Int, nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, String, Number]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationResolver.prototype,
  'trackAddToCart',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __param(1, (0, graphql_1.Args)('productId')),
    __param(2, (0, graphql_1.Args)('quantity', { type: () => graphql_1.Int, nullable: true })),
    __param(3, (0, graphql_1.Args)('price', { type: () => graphql_1.Float, nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, String, Number, Number]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationResolver.prototype,
  'trackPurchase',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [String]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __param(1, (0, graphql_1.Args)('limit', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, Number]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationResolver.prototype,
  'getPersonalizedRecommendations',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [user_behavior_entity_1.UserBehavior]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationResolver.prototype,
  'getMostViewedProducts',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [user_behavior_entity_1.UserBehavior]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationResolver.prototype,
  'getFavoriteProducts',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [user_behavior_entity_1.UserBehavior]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationResolver.prototype,
  'getRecentSearches',
  null,
);
exports.PersonalizationResolver = PersonalizationResolver = __decorate(
  [
    (0, graphql_1.Resolver)(),
    __metadata('design:paramtypes', [
      personalization_service_1.PersonalizationService,
      user_preferences_service_1.UserPreferencesService,
      user_behavior_service_1.UserBehaviorService,
    ]),
  ],
  PersonalizationResolver,
);
//# sourceMappingURL=personalization.resolver.js.map
