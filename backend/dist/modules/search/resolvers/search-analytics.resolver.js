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
var SearchAnalyticsResolver_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.SearchAnalyticsResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const common_1 = require('@nestjs/common');
const search_analytics_service_1 = require('../services/search-analytics.service');
const search_event_input_1 = require('../graphql/search-event.input');
const current_user_decorator_1 = require('../../auth/decorators/current-user.decorator');
const user_entity_1 = require('../../users/entities/user.entity');
let TrackSearchEventResponse = class TrackSearchEventResponse {};
__decorate(
  [(0, graphql_1.Field)(() => Boolean), __metadata('design:type', Boolean)],
  TrackSearchEventResponse.prototype,
  'success',
  void 0,
);
TrackSearchEventResponse = __decorate([(0, graphql_1.ObjectType)()], TrackSearchEventResponse);
let SearchAnalyticsResolver = (SearchAnalyticsResolver_1 = class SearchAnalyticsResolver {
  constructor(searchAnalyticsService) {
    this.searchAnalyticsService = searchAnalyticsService;
    this.logger = new common_1.Logger(SearchAnalyticsResolver_1.name);
  }
  async trackSearchEvent(event, user) {
    try {
      const success = await this.searchAnalyticsService.trackEvent(
        event.eventType,
        event.data || {},
        user,
      );
      return { success };
    } catch (error) {
      this.logger.error(`Failed to track search event: ${error.message}`, error.stack);
      return { success: false };
    }
  }
});
exports.SearchAnalyticsResolver = SearchAnalyticsResolver;
__decorate(
  [
    (0, graphql_1.Mutation)(() => TrackSearchEventResponse),
    __param(0, (0, graphql_1.Args)('event')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [search_event_input_1.SearchEventInput, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  SearchAnalyticsResolver.prototype,
  'trackSearchEvent',
  null,
);
exports.SearchAnalyticsResolver =
  SearchAnalyticsResolver =
  SearchAnalyticsResolver_1 =
    __decorate(
      [
        (0, graphql_1.Resolver)(),
        __metadata('design:paramtypes', [search_analytics_service_1.SearchAnalyticsService]),
      ],
      SearchAnalyticsResolver,
    );
//# sourceMappingURL=search-analytics.resolver.js.map
