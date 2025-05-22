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
var AnalyticsScheduler_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.AnalyticsScheduler = void 0;
const common_1 = require('@nestjs/common');
const schedule_1 = require('@nestjs/schedule');
const analytics_service_1 = require('./services/analytics.service');
const business_metrics_service_1 = require('./services/business-metrics.service');
const business_metrics_entity_1 = require('./entities/business-metrics.entity');
let AnalyticsScheduler = (AnalyticsScheduler_1 = class AnalyticsScheduler {
  constructor(analyticsService, businessMetricsService) {
    this.analyticsService = analyticsService;
    this.businessMetricsService = businessMetricsService;
    this.logger = new common_1.Logger(AnalyticsScheduler_1.name);
  }
  async calculateHourlyConversionRates() {
    this.logger.log('Calculating hourly conversion rates');
    try {
      await this.analyticsService.calculateAndRecordConversionRates();
    } catch (error) {
      this.logger.error(`Failed to calculate hourly conversion rates: ${error.message}`);
    }
  }
  async calculateWeeklyMetrics() {
    this.logger.log('Calculating weekly metrics');
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(now);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      const startDate = new Date(weekStart);
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date(weekEnd);
      endDate.setDate(endDate.getDate() - 7);
      const revenueMetrics = await this.businessMetricsService.getRevenueMetrics(
        7,
        business_metrics_entity_1.TimeGranularity.DAILY,
      );
      const totalRevenue = revenueMetrics.reduce((sum, metric) => sum + metric.value, 0);
      await this.businessMetricsService.recordRevenue(
        totalRevenue,
        weekStart,
        weekEnd,
        business_metrics_entity_1.TimeGranularity.WEEKLY,
      );
      const orderMetrics = await this.businessMetricsService.getOrderMetrics(
        7,
        business_metrics_entity_1.TimeGranularity.DAILY,
      );
      const totalOrders = orderMetrics.reduce((sum, metric) => sum + (metric.count || 0), 0);
      await this.businessMetricsService.recordOrders(
        totalOrders,
        weekStart,
        weekEnd,
        business_metrics_entity_1.TimeGranularity.WEEKLY,
      );
      const weeklyAOV = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      await this.businessMetricsService.recordAverageOrderValue(
        weeklyAOV,
        weekStart,
        weekEnd,
        business_metrics_entity_1.TimeGranularity.WEEKLY,
      );
      const conversionRateMetrics = await this.businessMetricsService.getConversionRateMetrics(
        7,
        business_metrics_entity_1.TimeGranularity.DAILY,
      );
      const avgConversionRate =
        conversionRateMetrics.length > 0
          ? conversionRateMetrics.reduce((sum, metric) => sum + metric.value, 0) /
            conversionRateMetrics.length
          : 0;
      await this.businessMetricsService.recordConversionRate(
        avgConversionRate,
        weekStart,
        weekEnd,
        business_metrics_entity_1.TimeGranularity.WEEKLY,
      );
      const searchConversionMetrics = await this.businessMetricsService.getSearchConversionMetrics(
        7,
        business_metrics_entity_1.TimeGranularity.DAILY,
      );
      const avgSearchConversion =
        searchConversionMetrics.length > 0
          ? searchConversionMetrics.reduce((sum, metric) => sum + metric.value, 0) /
            searchConversionMetrics.length
          : 0;
      await this.businessMetricsService.recordSearchConversion(
        avgSearchConversion,
        weekStart,
        weekEnd,
        business_metrics_entity_1.TimeGranularity.WEEKLY,
      );
    } catch (error) {
      this.logger.error(`Failed to calculate weekly metrics: ${error.message}`);
    }
  }
  async calculateMonthlyMetrics() {
    this.logger.log('Calculating monthly metrics');
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      const startDate = new Date(monthStart);
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date(monthEnd);
      endDate.setMonth(endDate.getMonth() - 1);
      const revenueMetrics = await this.businessMetricsService.getRevenueMetrics(
        30,
        business_metrics_entity_1.TimeGranularity.DAILY,
      );
      const totalRevenue = revenueMetrics.reduce((sum, metric) => sum + metric.value, 0);
      await this.businessMetricsService.recordRevenue(
        totalRevenue,
        monthStart,
        monthEnd,
        business_metrics_entity_1.TimeGranularity.MONTHLY,
      );
      const orderMetrics = await this.businessMetricsService.getOrderMetrics(
        30,
        business_metrics_entity_1.TimeGranularity.DAILY,
      );
      const totalOrders = orderMetrics.reduce((sum, metric) => sum + (metric.count || 0), 0);
      await this.businessMetricsService.recordOrders(
        totalOrders,
        monthStart,
        monthEnd,
        business_metrics_entity_1.TimeGranularity.MONTHLY,
      );
      const monthlyAOV = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      await this.businessMetricsService.recordAverageOrderValue(
        monthlyAOV,
        monthStart,
        monthEnd,
        business_metrics_entity_1.TimeGranularity.MONTHLY,
      );
      const conversionRateMetrics = await this.businessMetricsService.getConversionRateMetrics(
        30,
        business_metrics_entity_1.TimeGranularity.DAILY,
      );
      const avgConversionRate =
        conversionRateMetrics.length > 0
          ? conversionRateMetrics.reduce((sum, metric) => sum + metric.value, 0) /
            conversionRateMetrics.length
          : 0;
      await this.businessMetricsService.recordConversionRate(
        avgConversionRate,
        monthStart,
        monthEnd,
        business_metrics_entity_1.TimeGranularity.MONTHLY,
      );
      const searchConversionMetrics = await this.businessMetricsService.getSearchConversionMetrics(
        30,
        business_metrics_entity_1.TimeGranularity.DAILY,
      );
      const avgSearchConversion =
        searchConversionMetrics.length > 0
          ? searchConversionMetrics.reduce((sum, metric) => sum + metric.value, 0) /
            searchConversionMetrics.length
          : 0;
      await this.businessMetricsService.recordSearchConversion(
        avgSearchConversion,
        monthStart,
        monthEnd,
        business_metrics_entity_1.TimeGranularity.MONTHLY,
      );
    } catch (error) {
      this.logger.error(`Failed to calculate monthly metrics: ${error.message}`);
    }
  }
});
exports.AnalyticsScheduler = AnalyticsScheduler;
__decorate(
  [
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsScheduler.prototype,
  'calculateHourlyConversionRates',
  null,
);
__decorate(
  [
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_WEEK),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsScheduler.prototype,
  'calculateWeeklyMetrics',
  null,
);
__decorate(
  [
    (0, schedule_1.Cron)('0 0 1 * *'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsScheduler.prototype,
  'calculateMonthlyMetrics',
  null,
);
exports.AnalyticsScheduler =
  AnalyticsScheduler =
  AnalyticsScheduler_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          analytics_service_1.AnalyticsService,
          business_metrics_service_1.BusinessMetricsService,
        ]),
      ],
      AnalyticsScheduler,
    );
//# sourceMappingURL=analytics.scheduler.js.map
