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
exports.QueryAnalyticsResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const common_1 = require('@nestjs/common');
const query_analytics_service_1 = require('../services/query-analytics.service');
const admin_guard_1 = require('../../../common/guards/admin.guard');
let QueryAnalyticsResolver = class QueryAnalyticsResolver {
  constructor(queryAnalyticsService) {
    this.queryAnalyticsService = queryAnalyticsService;
  }
  async getQueryAnalytics() {
    return this.queryAnalyticsService.getQueryAnalytics();
  }
  async getSlowQueries() {
    return this.queryAnalyticsService.getSlowQueries();
  }
  async getQueryAnalyticsById(queryId) {
    return this.queryAnalyticsService.getQueryAnalyticsById(queryId);
  }
  async getMostFrequentQueries(limit) {
    return this.queryAnalyticsService.getMostFrequentQueries(limit);
  }
};
exports.QueryAnalyticsResolver = QueryAnalyticsResolver;
__decorate(
  [
    (0, graphql_1.Query)('queryAnalytics'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  QueryAnalyticsResolver.prototype,
  'getQueryAnalytics',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)('slowQueries'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  QueryAnalyticsResolver.prototype,
  'getSlowQueries',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)('queryAnalyticsById'),
    __param(0, (0, graphql_1.Args)('queryId')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  QueryAnalyticsResolver.prototype,
  'getQueryAnalyticsById',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)('mostFrequentQueries'),
    __param(0, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  QueryAnalyticsResolver.prototype,
  'getMostFrequentQueries',
  null,
);
exports.QueryAnalyticsResolver = QueryAnalyticsResolver = __decorate(
  [
    (0, graphql_1.Resolver)('QueryAnalytics'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata('design:paramtypes', [query_analytics_service_1.QueryAnalyticsService]),
  ],
  QueryAnalyticsResolver,
);
//# sourceMappingURL=query-analytics.resolver.js.map
