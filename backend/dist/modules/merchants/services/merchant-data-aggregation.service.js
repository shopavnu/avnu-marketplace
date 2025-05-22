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
var MerchantDataAggregationService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.MerchantDataAggregationService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const merchant_analytics_entity_1 = require('../entities/merchant-analytics.entity');
const merchant_analytics_service_1 = require('./merchant-analytics.service');
let MerchantDataAggregationService =
  (MerchantDataAggregationService_1 = class MerchantDataAggregationService {
    constructor(analyticsRepository, merchantAnalyticsService) {
      this.analyticsRepository = analyticsRepository;
      this.merchantAnalyticsService = merchantAnalyticsService;
      this.logger = new common_1.Logger(MerchantDataAggregationService_1.name);
    }
    async aggregateMetric(
      merchantId,
      metricName,
      timeFrame = 'monthly',
      aggregationFunction = 'sum',
      startDate,
      endDate,
      productId,
      categoryId,
    ) {
      try {
        if (!startDate) {
          startDate = this.getDefaultStartDate(timeFrame);
        }
        if (!endDate) {
          endDate = new Date();
        }
        const whereConditions = {
          merchantId,
          timeFrame,
          date: (0, typeorm_2.Between)(startDate, endDate),
        };
        if (productId) {
          whereConditions.productId = productId;
        }
        if (categoryId) {
          whereConditions.categoryId = categoryId;
        }
        const analytics = await this.analyticsRepository.find({
          where: whereConditions,
          order: { date: 'ASC' },
        });
        return this.applyAggregation(analytics, metricName, aggregationFunction);
      } catch (error) {
        this.logger.error(
          `Failed to aggregate metric ${metricName} for merchant ${merchantId}: ${error.message}`,
        );
        throw error;
      }
    }
    async compareTimePeriods(
      merchantId,
      metricName,
      currentTimeFrame,
      previousTimeFrame,
      productId,
      categoryId,
    ) {
      try {
        const currentPeriodData = await this.aggregateMetric(
          merchantId,
          metricName,
          'daily',
          'sum',
          currentTimeFrame.startDate,
          currentTimeFrame.endDate,
          productId,
          categoryId,
        );
        const previousPeriodData = await this.aggregateMetric(
          merchantId,
          metricName,
          'daily',
          'sum',
          previousTimeFrame.startDate,
          previousTimeFrame.endDate,
          productId,
          categoryId,
        );
        const currentTotal = currentPeriodData.reduce((sum, item) => sum + item.value, 0);
        const previousTotal = previousPeriodData.reduce((sum, item) => sum + item.value, 0);
        const absoluteChange = currentTotal - previousTotal;
        const percentageChange =
          previousTotal !== 0 ? (absoluteChange / previousTotal) * 100 : currentTotal > 0 ? 100 : 0;
        return {
          currentPeriod: {
            startDate: currentTimeFrame.startDate,
            endDate: currentTimeFrame.endDate,
            total: currentTotal,
            data: currentPeriodData,
          },
          previousPeriod: {
            startDate: previousTimeFrame.startDate,
            endDate: previousTimeFrame.endDate,
            total: previousTotal,
            data: previousPeriodData,
          },
          change: {
            absolute: absoluteChange,
            percentage: percentageChange,
          },
        };
      } catch (error) {
        this.logger.error(
          `Failed to compare time periods for metric ${metricName} for merchant ${merchantId}: ${error.message}`,
        );
        throw error;
      }
    }
    async getTimeSeriesData(
      merchantId,
      metricName,
      timeFrame = 'daily',
      startDate,
      endDate,
      productId,
      categoryId,
    ) {
      try {
        if (!startDate) {
          startDate = this.getDefaultStartDate(timeFrame);
        }
        if (!endDate) {
          endDate = new Date();
        }
        const whereConditions = {
          merchantId,
          timeFrame,
          date: (0, typeorm_2.Between)(startDate, endDate),
        };
        if (productId) {
          whereConditions.productId = productId;
        }
        if (categoryId) {
          whereConditions.categoryId = categoryId;
        }
        const analytics = await this.analyticsRepository.find({
          where: whereConditions,
          order: { date: 'ASC' },
        });
        return analytics.map(record => ({
          date: record.date,
          value: record[metricName] || 0,
        }));
      } catch (error) {
        this.logger.error(
          `Failed to get time series data for metric ${metricName} for merchant ${merchantId}: ${error.message}`,
        );
        throw error;
      }
    }
    async getRollingAverages(
      merchantId,
      metricName,
      windowSize = 7,
      startDate,
      endDate,
      productId,
      categoryId,
    ) {
      try {
        const dailyData = await this.getTimeSeriesData(
          merchantId,
          metricName,
          'daily',
          startDate,
          endDate,
          productId,
          categoryId,
        );
        const rollingAverages = [];
        for (let i = windowSize - 1; i < dailyData.length; i++) {
          const windowData = dailyData.slice(i - windowSize + 1, i + 1);
          const sum = windowData.reduce((total, item) => total + item.value, 0);
          const average = sum / windowSize;
          rollingAverages.push({
            date: dailyData[i].date,
            value: average,
            rawValue: dailyData[i].value,
          });
        }
        return rollingAverages;
      } catch (error) {
        this.logger.error(
          `Failed to get rolling averages for metric ${metricName} for merchant ${merchantId}: ${error.message}`,
        );
        throw error;
      }
    }
    getDefaultStartDate(timeFrame) {
      const startDate = new Date();
      switch (timeFrame) {
        case 'daily':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case 'weekly':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case 'monthly':
          startDate.setMonth(startDate.getMonth() - 12);
          break;
        case 'quarterly':
          startDate.setMonth(startDate.getMonth() - 24);
          break;
        case 'yearly':
          startDate.setFullYear(startDate.getFullYear() - 5);
          break;
      }
      return startDate;
    }
    applyAggregation(data, metricName, aggregationFunction) {
      const groupedByDate = data.reduce((groups, item) => {
        const date = item.date.toISOString().split('T')[0];
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(item);
        return groups;
      }, {});
      return Object.entries(groupedByDate)
        .map(([date, items]) => {
          const values = items.map(item => item[metricName] || 0);
          let aggregatedValue = 0;
          switch (aggregationFunction) {
            case 'sum':
              aggregatedValue = values.reduce((sum, val) => sum + val, 0);
              break;
            case 'avg':
              aggregatedValue =
                values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
              break;
            case 'min':
              aggregatedValue = values.length > 0 ? Math.min(...values) : 0;
              break;
            case 'max':
              aggregatedValue = values.length > 0 ? Math.max(...values) : 0;
              break;
            case 'count':
              aggregatedValue = values.length;
              break;
          }
          return {
            date: new Date(date),
            value: aggregatedValue,
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    }
  });
exports.MerchantDataAggregationService = MerchantDataAggregationService;
exports.MerchantDataAggregationService =
  MerchantDataAggregationService =
  MerchantDataAggregationService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(merchant_analytics_entity_1.MerchantAnalytics)),
        __metadata('design:paramtypes', [
          typeorm_2.Repository,
          merchant_analytics_service_1.MerchantAnalyticsService,
        ]),
      ],
      MerchantDataAggregationService,
    );
//# sourceMappingURL=merchant-data-aggregation.service.js.map
