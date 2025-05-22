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
exports.AnonymousUserAnalyticsResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const common_1 = require('@nestjs/common');
const admin_guard_1 = require('../../../common/guards/admin.guard');
const anonymous_user_analytics_service_1 = require('../services/anonymous-user-analytics.service');
const anonymous_user_metrics_dto_1 = require('../dto/anonymous-user-metrics.dto');
let AnonymousUserAnalyticsResolver = class AnonymousUserAnalyticsResolver {
  constructor(anonymousUserAnalyticsService) {
    this.anonymousUserAnalyticsService = anonymousUserAnalyticsService;
  }
  async getAnonymousUserMetrics(period) {
    return this.anonymousUserAnalyticsService.getAnonymousUserMetrics(period || 30);
  }
};
exports.AnonymousUserAnalyticsResolver = AnonymousUserAnalyticsResolver;
__decorate(
  [
    (0, graphql_1.Query)(() => anonymous_user_metrics_dto_1.AnonymousUserMetricsDto, {
      name: 'anonymousUserMetrics',
    }),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, graphql_1.Args)('period', { type: () => graphql_1.Int, nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  AnonymousUserAnalyticsResolver.prototype,
  'getAnonymousUserMetrics',
  null,
);
exports.AnonymousUserAnalyticsResolver = AnonymousUserAnalyticsResolver = __decorate(
  [
    (0, graphql_1.Resolver)(),
    __metadata('design:paramtypes', [
      anonymous_user_analytics_service_1.AnonymousUserAnalyticsService,
    ]),
  ],
  AnonymousUserAnalyticsResolver,
);
//# sourceMappingURL=anonymous-user-analytics.resolver.js.map
