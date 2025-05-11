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
exports.AnalyticsResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const common_1 = require('@nestjs/common');
const analytics_service_1 = require('./services/analytics.service');
const search_analytics_service_1 = require('./services/search-analytics.service');
const user_engagement_service_1 = require('./services/user-engagement.service');
const business_metrics_service_1 = require('./services/business-metrics.service');
const gql_auth_guard_1 = require('../auth/guards/gql-auth.guard');
const search_analytics_entity_1 = require('./entities/search-analytics.entity');
const track_search_input_1 = require('./graphql/inputs/track-search.input');
const track_engagement_input_1 = require('./graphql/inputs/track-engagement.input');
const user_engagement_entity_1 = require('./entities/user-engagement.entity');
const business_metrics_entity_1 = require('./entities/business-metrics.entity');
const order_item_input_1 = require('./graphql/inputs/order-item.input');
const dashboard_analytics_dto_1 = require('./graphql/dtos/dashboard-analytics.dto');
const search_analytics_summary_dto_1 = require('./graphql/dtos/search-analytics-summary.dto');
const query_count_dto_1 = require('./graphql/dtos/query-count.dto');
const graphql_type_json_1 = require('graphql-type-json');
const user_engagement_summary_dto_1 = require('./graphql/dtos/user-engagement-summary.dto');
const engagement_type_count_dto_1 = require('./graphql/dtos/engagement-type-count.dto');
const product_interaction_count_dto_1 = require('./graphql/dtos/product-interaction-count.dto');
let AnalyticsResolver = class AnalyticsResolver {
  constructor(
    analyticsService,
    searchAnalyticsService,
    userEngagementService,
    businessMetricsService,
  ) {
    this.analyticsService = analyticsService;
    this.searchAnalyticsService = searchAnalyticsService;
    this.userEngagementService = userEngagementService;
    this.businessMetricsService = businessMetricsService;
  }
  async trackSearch(data) {
    return this.analyticsService.trackSearch(data);
  }
  async trackEngagement(data) {
    return this.analyticsService.trackEngagement(data);
  }
  async trackPageView(userId, sessionId, pagePath, referrer, deviceType, platform) {
    return this.userEngagementService.trackPageView(
      userId,
      sessionId,
      pagePath,
      referrer,
      deviceType,
      platform,
    );
  }
  async trackProductView(userId, sessionId, productId, pagePath, referrer, deviceType, platform) {
    return this.userEngagementService.trackProductView(
      userId,
      sessionId,
      productId,
      pagePath,
      referrer,
      deviceType,
      platform,
    );
  }
  async trackAddToCart(userId, sessionId, productId, quantity, pagePath, deviceType, platform) {
    return this.userEngagementService.trackAddToCart(
      userId,
      sessionId,
      productId,
      quantity,
      pagePath,
      deviceType,
      platform,
    );
  }
  async trackCheckoutComplete(
    userId,
    sessionId,
    orderId,
    orderItems,
    totalAmount,
    pagePath,
    deviceType,
    platform,
    merchantId,
  ) {
    await this.analyticsService.trackOrder(
      orderId,
      userId,
      sessionId,
      orderItems,
      totalAmount,
      merchantId,
    );
    return true;
  }
  async dashboardAnalytics(period, _context) {
    return this.analyticsService.getDashboardAnalytics(period);
  }
  async searchAnalytics(period, _context) {
    return this.analyticsService.getSearchAnalytics(period);
  }
  async topSearchQueries(limit, period, _context) {
    return this.searchAnalyticsService.getTopSearchQueries(limit, period);
  }
  async zeroResultQueries(limit, period, _context) {
    return this.searchAnalyticsService.getZeroResultQueries(limit, period);
  }
  async nlpVsRegularSearchAnalytics(period, _context) {
    return this.searchAnalyticsService.getNlpVsRegularSearchAnalytics(period);
  }
  async personalizedVsRegularSearchAnalytics(period, _context) {
    return this.searchAnalyticsService.getPersonalizedVsRegularSearchAnalytics(period);
  }
  async userEngagementAnalytics(period, _context) {
    return this.analyticsService.getUserEngagementAnalytics(period);
  }
  async getUserEngagementByTypeQuery(period, _context) {
    return this.userEngagementService.getUserEngagementByType(period);
  }
  async topViewedProducts(limit, period, _context) {
    return this.userEngagementService.getTopViewedProducts(limit, period);
  }
  async userEngagementFunnel(period, _context) {
    return this.userEngagementService.getUserEngagementFunnel(period);
  }
  async businessMetricsAnalytics(period, _context) {
    return this.analyticsService.getBusinessMetricsAnalytics(period);
  }
  async businessMetricsSummary(period, _context) {
    return this.businessMetricsService.getMetricsSummary(period);
  }
  async revenueMetrics(period, granularity, _context) {
    return this.businessMetricsService.getRevenueMetrics(period, granularity);
  }
};
exports.AnalyticsResolver = AnalyticsResolver;
__decorate(
  [
    (0, graphql_1.Mutation)(() => search_analytics_entity_1.SearchAnalytics),
    __param(0, (0, graphql_1.Args)('data', { type: () => track_search_input_1.TrackSearchInput })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [track_search_input_1.TrackSearchInput]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsResolver.prototype,
  'trackSearch',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => user_engagement_entity_1.UserEngagement),
    __param(
      0,
      (0, graphql_1.Args)('data', { type: () => track_engagement_input_1.TrackEngagementInput }),
    ),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [track_engagement_input_1.TrackEngagementInput]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsResolver.prototype,
  'trackEngagement',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => user_engagement_entity_1.UserEngagement),
    __param(0, (0, graphql_1.Args)('userId', { nullable: true })),
    __param(1, (0, graphql_1.Args)('sessionId')),
    __param(2, (0, graphql_1.Args)('pagePath')),
    __param(3, (0, graphql_1.Args)('referrer', { nullable: true })),
    __param(4, (0, graphql_1.Args)('deviceType', { nullable: true })),
    __param(5, (0, graphql_1.Args)('platform', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, String, String, String, String]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsResolver.prototype,
  'trackPageView',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => user_engagement_entity_1.UserEngagement),
    __param(0, (0, graphql_1.Args)('userId', { nullable: true })),
    __param(1, (0, graphql_1.Args)('sessionId')),
    __param(2, (0, graphql_1.Args)('productId')),
    __param(3, (0, graphql_1.Args)('pagePath')),
    __param(4, (0, graphql_1.Args)('referrer', { nullable: true })),
    __param(5, (0, graphql_1.Args)('deviceType', { nullable: true })),
    __param(6, (0, graphql_1.Args)('platform', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, String, String, String, String, String]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsResolver.prototype,
  'trackProductView',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => user_engagement_entity_1.UserEngagement),
    __param(0, (0, graphql_1.Args)('userId', { nullable: true })),
    __param(1, (0, graphql_1.Args)('sessionId')),
    __param(2, (0, graphql_1.Args)('productId')),
    __param(3, (0, graphql_1.Args)('quantity', { type: () => graphql_1.Int })),
    __param(4, (0, graphql_1.Args)('pagePath')),
    __param(5, (0, graphql_1.Args)('deviceType', { nullable: true })),
    __param(6, (0, graphql_1.Args)('platform', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, String, Number, String, String, String]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsResolver.prototype,
  'trackAddToCart',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('userId', { nullable: true })),
    __param(1, (0, graphql_1.Args)('sessionId')),
    __param(2, (0, graphql_1.Args)('orderId')),
    __param(
      3,
      (0, graphql_1.Args)('orderItems', { type: () => [order_item_input_1.OrderItemInput] }),
    ),
    __param(4, (0, graphql_1.Args)('totalAmount')),
    __param(5, (0, graphql_1.Args)('pagePath')),
    __param(6, (0, graphql_1.Args)('deviceType', { nullable: true })),
    __param(7, (0, graphql_1.Args)('platform', { nullable: true })),
    __param(8, (0, graphql_1.Args)('merchantId', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      String,
      String,
      String,
      Array,
      Number,
      String,
      String,
      String,
      String,
    ]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsResolver.prototype,
  'trackCheckoutComplete',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => dashboard_analytics_dto_1.DashboardAnalyticsDto),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(
      0,
      (0, graphql_1.Args)('period', {
        type: () => graphql_1.Int,
        nullable: true,
        defaultValue: 30,
      }),
    ),
    __param(1, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsResolver.prototype,
  'dashboardAnalytics',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => search_analytics_summary_dto_1.SearchAnalyticsSummaryDto),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(
      0,
      (0, graphql_1.Args)('period', {
        type: () => graphql_1.Int,
        nullable: true,
        defaultValue: 30,
      }),
    ),
    __param(1, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsResolver.prototype,
  'searchAnalytics',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [query_count_dto_1.QueryCountDto]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(
      0,
      (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true, defaultValue: 10 }),
    ),
    __param(
      1,
      (0, graphql_1.Args)('period', {
        type: () => graphql_1.Int,
        nullable: true,
        defaultValue: 30,
      }),
    ),
    __param(2, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsResolver.prototype,
  'topSearchQueries',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [query_count_dto_1.QueryCountDto]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(
      0,
      (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true, defaultValue: 10 }),
    ),
    __param(
      1,
      (0, graphql_1.Args)('period', {
        type: () => graphql_1.Int,
        nullable: true,
        defaultValue: 30,
      }),
    ),
    __param(2, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsResolver.prototype,
  'zeroResultQueries',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(
      0,
      (0, graphql_1.Args)('period', {
        type: () => graphql_1.Int,
        nullable: true,
        defaultValue: 30,
      }),
    ),
    __param(1, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsResolver.prototype,
  'nlpVsRegularSearchAnalytics',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(
      0,
      (0, graphql_1.Args)('period', {
        type: () => graphql_1.Int,
        nullable: true,
        defaultValue: 30,
      }),
    ),
    __param(1, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsResolver.prototype,
  'personalizedVsRegularSearchAnalytics',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => user_engagement_summary_dto_1.UserEngagementSummaryDto),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(
      0,
      (0, graphql_1.Args)('period', {
        type: () => graphql_1.Int,
        nullable: true,
        defaultValue: 30,
      }),
    ),
    __param(1, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsResolver.prototype,
  'userEngagementAnalytics',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [engagement_type_count_dto_1.EngagementTypeCount]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(
      0,
      (0, graphql_1.Args)('period', {
        type: () => graphql_1.Int,
        nullable: true,
        defaultValue: 30,
      }),
    ),
    __param(1, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsResolver.prototype,
  'getUserEngagementByTypeQuery',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [product_interaction_count_dto_1.ProductInteractionCount]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(
      0,
      (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true, defaultValue: 10 }),
    ),
    __param(
      1,
      (0, graphql_1.Args)('period', {
        type: () => graphql_1.Int,
        nullable: true,
        defaultValue: 30,
      }),
    ),
    __param(2, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsResolver.prototype,
  'topViewedProducts',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(
      0,
      (0, graphql_1.Args)('period', {
        type: () => graphql_1.Int,
        nullable: true,
        defaultValue: 30,
      }),
    ),
    __param(1, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsResolver.prototype,
  'userEngagementFunnel',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(
      0,
      (0, graphql_1.Args)('period', {
        type: () => graphql_1.Int,
        nullable: true,
        defaultValue: 30,
      }),
    ),
    __param(1, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsResolver.prototype,
  'businessMetricsAnalytics',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(
      0,
      (0, graphql_1.Args)('period', {
        type: () => graphql_1.Int,
        nullable: true,
        defaultValue: 30,
      }),
    ),
    __param(1, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsResolver.prototype,
  'businessMetricsSummary',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [business_metrics_entity_1.BusinessMetrics]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(
      0,
      (0, graphql_1.Args)('period', {
        type: () => graphql_1.Int,
        nullable: true,
        defaultValue: 30,
      }),
    ),
    __param(
      1,
      (0, graphql_1.Args)('granularity', {
        nullable: true,
        defaultValue: business_metrics_entity_1.TimeGranularity.DAILY,
      }),
    ),
    __param(2, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, String, Object]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsResolver.prototype,
  'revenueMetrics',
  null,
);
exports.AnalyticsResolver = AnalyticsResolver = __decorate(
  [
    (0, graphql_1.Resolver)(),
    __metadata('design:paramtypes', [
      analytics_service_1.AnalyticsService,
      search_analytics_service_1.SearchAnalyticsService,
      user_engagement_service_1.UserEngagementService,
      business_metrics_service_1.BusinessMetricsService,
    ]),
  ],
  AnalyticsResolver,
);
//# sourceMappingURL=analytics.resolver.js.map
