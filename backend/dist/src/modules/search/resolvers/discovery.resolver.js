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
exports.DiscoveryResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const common_1 = require('@nestjs/common');
const discovery_search_service_1 = require('../services/discovery-search.service');
const search_options_dto_1 = require('../dto/search-options.dto');
const discovery_response_type_1 = require('../graphql/discovery-response.type');
const optional_auth_guard_1 = require('../../auth/guards/optional-auth.guard');
const current_user_decorator_1 = require('../../auth/decorators/current-user.decorator');
const user_entity_1 = require('../../users/entities/user.entity');
let DiscoveryResolver = class DiscoveryResolver {
  constructor(discoverySearchService) {
    this.discoverySearchService = discoverySearchService;
  }
  async discoveryHomepage(user, sessionId, options) {
    return this.discoverySearchService.getDiscoveryHomepage(user?.id, sessionId, options);
  }
};
exports.DiscoveryResolver = DiscoveryResolver;
__decorate(
  [
    (0, graphql_1.Query)(() => discovery_response_type_1.DiscoveryHomepageResponse),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('sessionId', { type: () => graphql_1.ID, nullable: true })),
    __param(2, (0, graphql_1.Args)('options', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      user_entity_1.User,
      String,
      search_options_dto_1.SearchOptionsInput,
    ]),
    __metadata('design:returntype', Promise),
  ],
  DiscoveryResolver.prototype,
  'discoveryHomepage',
  null,
);
exports.DiscoveryResolver = DiscoveryResolver = __decorate(
  [
    (0, graphql_1.Resolver)(),
    __metadata('design:paramtypes', [discovery_search_service_1.DiscoverySearchService]),
  ],
  DiscoveryResolver,
);
//# sourceMappingURL=discovery.resolver.js.map
