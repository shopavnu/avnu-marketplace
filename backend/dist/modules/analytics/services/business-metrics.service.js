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
var BusinessMetricsService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.BusinessMetricsService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const business_metrics_entity_1 = require('../entities/business-metrics.entity');
let BusinessMetricsService = (BusinessMetricsService_1 = class BusinessMetricsService {
  constructor(businessMetricsRepository) {
    this.businessMetricsRepository = businessMetricsRepository;
    this.logger = new common_1.Logger(BusinessMetricsService_1.name);
  }
  async recordMetric(data) {
    try {
      const businessMetric = this.businessMetricsRepository.create(data);
      return this.businessMetricsRepository.save(businessMetric);
    } catch (error) {
      this.logger.error(`Failed to record business metric: ${error.message}`);
      throw error;
    }
  }
  async recordRevenue(
    value,
    periodStart,
    periodEnd,
    timeGranularity = business_metrics_entity_1.TimeGranularity.DAILY,
    dimension1,
    dimension2,
    dimension3,
  ) {
    return this.recordMetric({
      metricType: business_metrics_entity_1.MetricType.REVENUE,
      value,
      periodStart,
      periodEnd,
      timeGranularity,
      dimension1,
      dimension2,
      dimension3,
    });
  }
  async recordOrders(
    count,
    periodStart,
    periodEnd,
    timeGranularity = business_metrics_entity_1.TimeGranularity.DAILY,
    dimension1,
    dimension2,
    dimension3,
  ) {
    return this.recordMetric({
      metricType: business_metrics_entity_1.MetricType.ORDERS,
      value: 0,
      count,
      periodStart,
      periodEnd,
      timeGranularity,
      dimension1,
      dimension2,
      dimension3,
    });
  }
  async recordAverageOrderValue(
    value,
    periodStart,
    periodEnd,
    timeGranularity = business_metrics_entity_1.TimeGranularity.DAILY,
    dimension1,
    dimension2,
    dimension3,
  ) {
    return this.recordMetric({
      metricType: business_metrics_entity_1.MetricType.AOV,
      value,
      periodStart,
      periodEnd,
      timeGranularity,
      dimension1,
      dimension2,
      dimension3,
    });
  }
  async recordConversionRate(
    value,
    periodStart,
    periodEnd,
    timeGranularity = business_metrics_entity_1.TimeGranularity.DAILY,
    dimension1,
    dimension2,
    dimension3,
  ) {
    return this.recordMetric({
      metricType: business_metrics_entity_1.MetricType.CONVERSION_RATE,
      value,
      periodStart,
      periodEnd,
      timeGranularity,
      dimension1,
      dimension2,
      dimension3,
    });
  }
  async recordSearchConversion(
    value,
    periodStart,
    periodEnd,
    timeGranularity = business_metrics_entity_1.TimeGranularity.DAILY,
    dimension1,
    dimension2,
    dimension3,
  ) {
    return this.recordMetric({
      metricType: business_metrics_entity_1.MetricType.SEARCH_CONVERSION,
      value,
      periodStart,
      periodEnd,
      timeGranularity,
      dimension1,
      dimension2,
      dimension3,
    });
  }
  async getMetricsByTypeAndPeriod(
    metricType,
    startDate,
    endDate,
    timeGranularity = business_metrics_entity_1.TimeGranularity.DAILY,
  ) {
    try {
      return this.businessMetricsRepository.find({
        where: {
          metricType,
          timeGranularity,
          periodStart: (0, typeorm_2.Between)(startDate, endDate),
        },
        order: {
          periodStart: 'ASC',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get metrics by type and period: ${error.message}`);
      throw error;
    }
  }
  async getRevenueMetrics(
    period = 30,
    timeGranularity = business_metrics_entity_1.TimeGranularity.DAILY,
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    return this.getMetricsByTypeAndPeriod(
      business_metrics_entity_1.MetricType.REVENUE,
      startDate,
      endDate,
      timeGranularity,
    );
  }
  async getOrderMetrics(
    period = 30,
    timeGranularity = business_metrics_entity_1.TimeGranularity.DAILY,
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    return this.getMetricsByTypeAndPeriod(
      business_metrics_entity_1.MetricType.ORDERS,
      startDate,
      endDate,
      timeGranularity,
    );
  }
  async getAverageOrderValueMetrics(
    period = 30,
    timeGranularity = business_metrics_entity_1.TimeGranularity.DAILY,
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    return this.getMetricsByTypeAndPeriod(
      business_metrics_entity_1.MetricType.AOV,
      startDate,
      endDate,
      timeGranularity,
    );
  }
  async getConversionRateMetrics(
    period = 30,
    timeGranularity = business_metrics_entity_1.TimeGranularity.DAILY,
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    return this.getMetricsByTypeAndPeriod(
      business_metrics_entity_1.MetricType.CONVERSION_RATE,
      startDate,
      endDate,
      timeGranularity,
    );
  }
  async getSearchConversionMetrics(
    period = 30,
    timeGranularity = business_metrics_entity_1.TimeGranularity.DAILY,
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    return this.getMetricsByTypeAndPeriod(
      business_metrics_entity_1.MetricType.SEARCH_CONVERSION,
      startDate,
      endDate,
      timeGranularity,
    );
  }
  async getMetricsSummary(period = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);
      const previousEndDate = new Date(startDate);
      const previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - period);
      const currentRevenue = await this.getTotalMetricValue(
        business_metrics_entity_1.MetricType.REVENUE,
        startDate,
        endDate,
      );
      const currentOrders = await this.getTotalMetricCount(
        business_metrics_entity_1.MetricType.ORDERS,
        startDate,
        endDate,
      );
      const currentAOV = currentOrders > 0 ? currentRevenue / currentOrders : 0;
      const currentConversionRate = await this.getAverageMetricValue(
        business_metrics_entity_1.MetricType.CONVERSION_RATE,
        startDate,
        endDate,
      );
      const currentSearchConversion = await this.getAverageMetricValue(
        business_metrics_entity_1.MetricType.SEARCH_CONVERSION,
        startDate,
        endDate,
      );
      const previousRevenue = await this.getTotalMetricValue(
        business_metrics_entity_1.MetricType.REVENUE,
        previousStartDate,
        previousEndDate,
      );
      const previousOrders = await this.getTotalMetricCount(
        business_metrics_entity_1.MetricType.ORDERS,
        previousStartDate,
        previousEndDate,
      );
      const previousAOV = previousOrders > 0 ? previousRevenue / previousOrders : 0;
      const previousConversionRate = await this.getAverageMetricValue(
        business_metrics_entity_1.MetricType.CONVERSION_RATE,
        previousStartDate,
        previousEndDate,
      );
      const previousSearchConversion = await this.getAverageMetricValue(
        business_metrics_entity_1.MetricType.SEARCH_CONVERSION,
        previousStartDate,
        previousEndDate,
      );
      const revenueChange =
        previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const ordersChange =
        previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0;
      const aovChange = previousAOV > 0 ? ((currentAOV - previousAOV) / previousAOV) * 100 : 0;
      const conversionRateChange =
        previousConversionRate > 0
          ? ((currentConversionRate - previousConversionRate) / previousConversionRate) * 100
          : 0;
      const searchConversionChange =
        previousSearchConversion > 0
          ? ((currentSearchConversion - previousSearchConversion) / previousSearchConversion) * 100
          : 0;
      return {
        revenue: {
          current: currentRevenue,
          previous: previousRevenue,
          change: revenueChange,
        },
        orders: {
          current: currentOrders,
          previous: previousOrders,
          change: ordersChange,
        },
        averageOrderValue: {
          current: currentAOV,
          previous: previousAOV,
          change: aovChange,
        },
        conversionRate: {
          current: currentConversionRate,
          previous: previousConversionRate,
          change: conversionRateChange,
        },
        searchConversion: {
          current: currentSearchConversion,
          previous: previousSearchConversion,
          change: searchConversionChange,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get metrics summary: ${error.message}`);
      throw error;
    }
  }
  async getTotalMetricValue(metricType, startDate, endDate) {
    try {
      const result = await this.businessMetricsRepository
        .createQueryBuilder('metric')
        .select('SUM(metric.value)', 'total')
        .where('metric.metricType = :metricType', { metricType })
        .andWhere('metric.periodStart >= :startDate', { startDate })
        .andWhere('metric.periodEnd <= :endDate', { endDate })
        .getRawOne();
      return parseFloat(result?.total || '0');
    } catch (error) {
      this.logger.error(`Failed to get total metric value: ${error.message}`);
      return 0;
    }
  }
  async getTotalMetricCount(metricType, startDate, endDate) {
    try {
      const result = await this.businessMetricsRepository
        .createQueryBuilder('metric')
        .select('SUM(metric.count)', 'total')
        .where('metric.metricType = :metricType', { metricType })
        .andWhere('metric.periodStart >= :startDate', { startDate })
        .andWhere('metric.periodEnd <= :endDate', { endDate })
        .getRawOne();
      return parseInt(result?.total || '0');
    } catch (error) {
      this.logger.error(`Failed to get total metric count: ${error.message}`);
      return 0;
    }
  }
  async getAverageMetricValue(metricType, startDate, endDate) {
    try {
      const result = await this.businessMetricsRepository
        .createQueryBuilder('metric')
        .select('AVG(metric.value)', 'average')
        .where('metric.metricType = :metricType', { metricType })
        .andWhere('metric.periodStart >= :startDate', { startDate })
        .andWhere('metric.periodEnd <= :endDate', { endDate })
        .getRawOne();
      return parseFloat(result?.average || '0');
    } catch (error) {
      this.logger.error(`Failed to get average metric value: ${error.message}`);
      return 0;
    }
  }
});
exports.BusinessMetricsService = BusinessMetricsService;
exports.BusinessMetricsService =
  BusinessMetricsService =
  BusinessMetricsService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(business_metrics_entity_1.BusinessMetrics)),
        __metadata('design:paramtypes', [typeorm_2.Repository]),
      ],
      BusinessMetricsService,
    );
//# sourceMappingURL=business-metrics.service.js.map
