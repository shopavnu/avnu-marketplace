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
var AnalyticsService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.AnalyticsService = void 0;
const common_1 = require('@nestjs/common');
const search_analytics_service_1 = require('./search-analytics.service');
const user_engagement_service_1 = require('./user-engagement.service');
const business_metrics_service_1 = require('./business-metrics.service');
const business_metrics_entity_1 = require('../entities/business-metrics.entity');
let AnalyticsService = (AnalyticsService_1 = class AnalyticsService {
  constructor(searchAnalyticsService, userEngagementService, businessMetricsService) {
    this.searchAnalyticsService = searchAnalyticsService;
    this.userEngagementService = userEngagementService;
    this.businessMetricsService = businessMetricsService;
    this.logger = new common_1.Logger(AnalyticsService_1.name);
  }
  async trackSearch(data) {
    return this.searchAnalyticsService.trackSearch(data);
  }
  async trackEngagement(data) {
    return this.userEngagementService.trackEngagement(data);
  }
  async recordMetric(data) {
    return this.businessMetricsService.recordMetric(data);
  }
  async getDashboardAnalytics(period = 30) {
    try {
      const businessMetrics = await this.businessMetricsService.getMetricsSummary(period);
      const topSearchQueries = await this.searchAnalyticsService.getTopSearchQueries(10, period);
      const zeroResultQueries = await this.searchAnalyticsService.getZeroResultQueries(10, period);
      const searchConversionRate =
        await this.searchAnalyticsService.getSearchConversionRate(period);
      const searchClickThroughRate =
        await this.searchAnalyticsService.getSearchClickThroughRate(period);
      const nlpVsRegularSearchAnalytics =
        await this.searchAnalyticsService.getNlpVsRegularSearchAnalytics(period);
      const personalizedVsRegularSearchAnalytics =
        await this.searchAnalyticsService.getPersonalizedVsRegularSearchAnalytics(period);
      const userEngagementByType = await this.userEngagementService.getUserEngagementByType(period);
      const topViewedProducts = await this.userEngagementService.getTopViewedProducts(10, period);
      const topFavoritedProducts = await this.userEngagementService.getTopFavoritedProducts(
        10,
        period,
      );
      const userEngagementFunnel = await this.userEngagementService.getUserEngagementFunnel(period);
      const userRetentionMetrics = await this.userEngagementService.getUserRetentionMetrics(period);
      return {
        businessMetrics,
        searchAnalytics: {
          topSearchQueries,
          zeroResultQueries,
          searchConversionRate,
          searchClickThroughRate,
          nlpVsRegularSearchAnalytics,
          personalizedVsRegularSearchAnalytics,
        },
        userEngagement: {
          userEngagementByType,
          topViewedProducts,
          topFavoritedProducts,
          userEngagementFunnel,
          userRetentionMetrics,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get dashboard analytics: ${error.message}`);
      throw error;
    }
  }
  async getSearchAnalytics(period = 30) {
    try {
      const topSearchQueries = await this.searchAnalyticsService.getTopSearchQueries(20, period);
      const zeroResultQueries = await this.searchAnalyticsService.getZeroResultQueries(20, period);
      const searchConversionRate =
        await this.searchAnalyticsService.getSearchConversionRate(period);
      const searchClickThroughRate =
        await this.searchAnalyticsService.getSearchClickThroughRate(period);
      const searchAnalyticsByTime =
        await this.searchAnalyticsService.getSearchAnalyticsByTimePeriod(period, 'day');
      const nlpVsRegularSearchAnalytics =
        await this.searchAnalyticsService.getNlpVsRegularSearchAnalytics(period);
      const personalizedVsRegularSearchAnalytics =
        await this.searchAnalyticsService.getPersonalizedVsRegularSearchAnalytics(period);
      return {
        topSearchQueries,
        zeroResultQueries,
        searchConversionRate,
        searchClickThroughRate,
        searchAnalyticsByTime,
        nlpVsRegularSearchAnalytics,
        personalizedVsRegularSearchAnalytics,
      };
    } catch (error) {
      this.logger.error(`Failed to get search analytics: ${error.message}`);
      throw error;
    }
  }
  async getUserEngagementAnalytics(period = 30) {
    try {
      const userEngagementByType = await this.userEngagementService.getUserEngagementByType(period);
      const userEngagementByTime = await this.userEngagementService.getUserEngagementByTimePeriod(
        period,
        'day',
      );
      const topViewedProducts = await this.userEngagementService.getTopViewedProducts(20, period);
      const topFavoritedProducts = await this.userEngagementService.getTopFavoritedProducts(
        20,
        period,
      );
      const userEngagementFunnel = await this.userEngagementService.getUserEngagementFunnel(period);
      const userRetentionMetrics = await this.userEngagementService.getUserRetentionMetrics(period);
      return {
        userEngagementByType,
        userEngagementByTime,
        topViewedProducts,
        topFavoritedProducts,
        userEngagementFunnel,
        userRetentionMetrics,
      };
    } catch (error) {
      this.logger.error(`Failed to get user engagement analytics: ${error.message}`);
      throw error;
    }
  }
  async getBusinessMetricsAnalytics(period = 30) {
    try {
      const metricsSummary = await this.businessMetricsService.getMetricsSummary(period);
      const revenueMetrics = await this.businessMetricsService.getRevenueMetrics(
        period,
        business_metrics_entity_1.TimeGranularity.DAILY,
      );
      const orderMetrics = await this.businessMetricsService.getOrderMetrics(
        period,
        business_metrics_entity_1.TimeGranularity.DAILY,
      );
      const aovMetrics = await this.businessMetricsService.getAverageOrderValueMetrics(
        period,
        business_metrics_entity_1.TimeGranularity.DAILY,
      );
      const conversionRateMetrics = await this.businessMetricsService.getConversionRateMetrics(
        period,
        business_metrics_entity_1.TimeGranularity.DAILY,
      );
      const searchConversionMetrics = await this.businessMetricsService.getSearchConversionMetrics(
        period,
        business_metrics_entity_1.TimeGranularity.DAILY,
      );
      return {
        metricsSummary,
        revenueMetrics,
        orderMetrics,
        aovMetrics,
        conversionRateMetrics,
        searchConversionMetrics,
      };
    } catch (error) {
      this.logger.error(`Failed to get business metrics analytics: ${error.message}`);
      throw error;
    }
  }
  async trackOrder(orderId, userId, sessionId, orderItems, totalAmount, merchantId) {
    try {
      await this.userEngagementService.trackCheckoutComplete(
        userId,
        sessionId,
        orderId,
        orderItems,
        totalAmount,
        '/checkout/complete',
      );
      const now = new Date();
      const periodStart = new Date(now);
      periodStart.setHours(0, 0, 0, 0);
      const periodEnd = new Date(now);
      periodEnd.setHours(23, 59, 59, 999);
      await this.businessMetricsService.recordRevenue(
        totalAmount,
        periodStart,
        periodEnd,
        business_metrics_entity_1.TimeGranularity.DAILY,
        merchantId,
      );
      await this.businessMetricsService.recordOrders(
        1,
        periodStart,
        periodEnd,
        business_metrics_entity_1.TimeGranularity.DAILY,
        merchantId,
      );
      const orderMetrics = await this.businessMetricsService.getOrderMetrics(
        1,
        business_metrics_entity_1.TimeGranularity.DAILY,
      );
      const revenueMetrics = await this.businessMetricsService.getRevenueMetrics(
        1,
        business_metrics_entity_1.TimeGranularity.DAILY,
      );
      if (orderMetrics.length > 0 && revenueMetrics.length > 0) {
        const totalOrders = orderMetrics.reduce((sum, metric) => sum + (metric.count || 0), 0);
        const totalRevenue = revenueMetrics.reduce((sum, metric) => sum + metric.value, 0);
        if (totalOrders > 0) {
          const aov = totalRevenue / totalOrders;
          await this.businessMetricsService.recordAverageOrderValue(
            aov,
            periodStart,
            periodEnd,
            business_metrics_entity_1.TimeGranularity.DAILY,
            merchantId,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Failed to track order: ${error.message}`);
    }
  }
  async getPopularSearches(prefix, limit = 10, categories, days = 30) {
    try {
      const topSearches = await this.searchAnalyticsService.getTopSearchQueries(100, days);
      const prefixMatches = topSearches
        .filter(search => {
          const query = search.query.toLowerCase();
          return query.startsWith(prefix.toLowerCase());
        })
        .filter(search => {
          if (!categories || categories.length === 0) return true;
          try {
            const metadata = search.metadata ? JSON.parse(search.metadata) : {};
            if (!metadata.categories) return false;
            return categories.some(category => metadata.categories.includes(category));
          } catch (e) {
            return false;
          }
        })
        .map(search => {
          let category;
          try {
            const metadata = search.metadata ? JSON.parse(search.metadata) : {};
            category = metadata.categories?.[0];
          } catch (e) {}
          return {
            query: search.query,
            count: search.count,
            category,
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
      return prefixMatches;
    } catch (error) {
      this.logger.error(
        `Failed to get popular searches for prefix "${prefix}": ${error.message}`,
        error.stack,
        AnalyticsService_1.name,
      );
      return [];
    }
  }
  async calculateAndRecordConversionRates() {
    try {
      const now = new Date();
      const periodStart = new Date(now);
      periodStart.setHours(0, 0, 0, 0);
      const periodEnd = new Date(now);
      periodEnd.setHours(23, 59, 59, 999);
      const userEngagementFunnel = await this.userEngagementService.getUserEngagementFunnel(1);
      if (userEngagementFunnel.conversionRates.overallConversionRate !== undefined) {
        await this.businessMetricsService.recordConversionRate(
          userEngagementFunnel.conversionRates.overallConversionRate,
          periodStart,
          periodEnd,
          business_metrics_entity_1.TimeGranularity.DAILY,
        );
      }
      const searchConversionRate = await this.searchAnalyticsService.getSearchConversionRate(1);
      await this.businessMetricsService.recordSearchConversion(
        searchConversionRate,
        periodStart,
        periodEnd,
        business_metrics_entity_1.TimeGranularity.DAILY,
      );
    } catch (error) {
      this.logger.error(`Failed to calculate and record conversion rates: ${error.message}`);
    }
  }
});
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService =
  AnalyticsService =
  AnalyticsService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          search_analytics_service_1.SearchAnalyticsService,
          user_engagement_service_1.UserEngagementService,
          business_metrics_service_1.BusinessMetricsService,
        ]),
      ],
      AnalyticsService,
    );
//# sourceMappingURL=analytics.service.js.map
