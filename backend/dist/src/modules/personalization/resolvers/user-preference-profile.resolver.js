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
exports.UserPreferenceProfileResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const common_1 = require('@nestjs/common');
const user_preference_profile_service_1 = require('../services/user-preference-profile.service');
const user_preference_profile_entity_1 = require('../entities/user-preference-profile.entity');
const gql_auth_guard_1 = require('../../auth/guards/gql-auth.guard');
const current_user_decorator_1 = require('../../auth/decorators/current-user.decorator');
const user_entity_1 = require('../../users/entities/user.entity');
let UserPreferenceProfileResolver = class UserPreferenceProfileResolver {
  constructor(userPreferenceProfileService) {
    this.userPreferenceProfileService = userPreferenceProfileService;
  }
  async userPreferenceProfile(user) {
    return this.userPreferenceProfileService.getUserPreferenceProfile(user.id);
  }
  async updateUserPreferenceProfileFromSession(user, sessionId) {
    return this.userPreferenceProfileService.updateProfileFromSession(user.id, sessionId);
  }
  async personalizedRecommendations(user, limit) {
    return this.userPreferenceProfileService.getPersonalizedRecommendations(user.id, limit);
  }
};
exports.UserPreferenceProfileResolver = UserPreferenceProfileResolver;
__decorate(
  [
    (0, graphql_1.Query)(() => user_preference_profile_entity_1.UserPreferenceProfile),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  UserPreferenceProfileResolver.prototype,
  'userPreferenceProfile',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => user_preference_profile_entity_1.UserPreferenceProfile),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('sessionId', { type: () => graphql_1.ID })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [user_entity_1.User, String]),
    __metadata('design:returntype', Promise),
  ],
  UserPreferenceProfileResolver.prototype,
  'updateUserPreferenceProfileFromSession',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [String]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('limit', { type: () => Number, nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [user_entity_1.User, Number]),
    __metadata('design:returntype', Promise),
  ],
  UserPreferenceProfileResolver.prototype,
  'personalizedRecommendations',
  null,
);
exports.UserPreferenceProfileResolver = UserPreferenceProfileResolver = __decorate(
  [
    (0, graphql_1.Resolver)(() => user_preference_profile_entity_1.UserPreferenceProfile),
    __metadata('design:paramtypes', [
      user_preference_profile_service_1.UserPreferenceProfileService,
    ]),
  ],
  UserPreferenceProfileResolver,
);
//# sourceMappingURL=user-preference-profile.resolver.js.map
