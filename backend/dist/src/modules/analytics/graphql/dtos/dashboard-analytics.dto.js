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
Object.defineProperty(exports, '__esModule', { value: true });
exports.DashboardAnalyticsDto = void 0;
const graphql_1 = require('@nestjs/graphql');
const business_metrics_summary_dto_1 = require('./business-metrics-summary.dto');
const search_analytics_summary_dto_1 = require('./search-analytics-summary.dto');
const user_engagement_summary_dto_1 = require('./user-engagement-summary.dto');
let DashboardAnalyticsDto = class DashboardAnalyticsDto {};
exports.DashboardAnalyticsDto = DashboardAnalyticsDto;
__decorate(
  [
    (0, graphql_1.Field)(() => business_metrics_summary_dto_1.BusinessMetricsSummaryDto, {
      nullable: true,
    }),
    __metadata('design:type', business_metrics_summary_dto_1.BusinessMetricsSummaryDto),
  ],
  DashboardAnalyticsDto.prototype,
  'businessMetrics',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => search_analytics_summary_dto_1.SearchAnalyticsSummaryDto, {
      nullable: true,
    }),
    __metadata('design:type', search_analytics_summary_dto_1.SearchAnalyticsSummaryDto),
  ],
  DashboardAnalyticsDto.prototype,
  'searchAnalytics',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => user_engagement_summary_dto_1.UserEngagementSummaryDto, {
      nullable: true,
    }),
    __metadata('design:type', user_engagement_summary_dto_1.UserEngagementSummaryDto),
  ],
  DashboardAnalyticsDto.prototype,
  'userEngagement',
  void 0,
);
exports.DashboardAnalyticsDto = DashboardAnalyticsDto = __decorate(
  [(0, graphql_1.ObjectType)()],
  DashboardAnalyticsDto,
);
//# sourceMappingURL=dashboard-analytics.dto.js.map
