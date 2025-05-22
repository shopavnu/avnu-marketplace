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
var MerchantDemographicAnalyticsService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.MerchantDemographicAnalyticsService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const merchant_analytics_entity_1 = require('../entities/merchant-analytics.entity');
let MerchantDemographicAnalyticsService =
  (MerchantDemographicAnalyticsService_1 = class MerchantDemographicAnalyticsService {
    constructor(analyticsRepository) {
      this.analyticsRepository = analyticsRepository;
      this.logger = new common_1.Logger(MerchantDemographicAnalyticsService_1.name);
      this.logger = new common_1.Logger(MerchantDemographicAnalyticsService_1.name);
    }
    async getDemographicAnalytics(merchantId, timeFrame = 'monthly', startDate, endDate, filters) {
      try {
        if (!startDate) {
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 6);
        }
        if (!endDate) {
          endDate = new Date();
        }
        const analytics = await this.analyticsRepository.find({
          where: {
            merchantId,
            timeFrame,
            date: (0, typeorm_2.Between)(startDate, endDate),
            productId: (0, typeorm_2.IsNull)(),
            categoryId: (0, typeorm_2.IsNull)(),
          },
          order: { date: 'ASC' },
        });
        const filteredAnalytics =
          filters && filters.length > 0
            ? this.applyDemographicFilters(analytics, filters)
            : analytics;
        return {
          ageGroups: this.processAgeGroupData(filteredAnalytics),
          location: this.processLocationData(filteredAnalytics),
          devices: this.processDeviceData(filteredAnalytics),
          gender: this.processGenderData(filteredAnalytics),
          interests: this.processInterestData(filteredAnalytics),
        };
      } catch (error) {
        this.logger.error(`Failed to get demographic analytics: ${error.message}`);
        throw error;
      }
    }
    applyDemographicFilters(analytics, filters) {
      return analytics.filter(record => {
        if (!record.demographics || record.demographics.length === 0) {
          return false;
        }
        return filters.every(filter => {
          const demographicValues = this.extractDemographicValues(record.demographics, filter.key);
          return filter.values.some(value => demographicValues.includes(value));
        });
      });
    }
    extractDemographicValues(demographics, key) {
      const prefix = `${key}:`;
      return demographics
        .filter(item => item.startsWith(prefix))
        .map(item => item.substring(prefix.length));
    }
    processAgeGroupData(analytics) {
      const ageGroups = {
        '18-24': 0,
        '25-34': 0,
        '35-44': 0,
        '45-54': 0,
        '55-64': 0,
        '65+': 0,
      };
      let totalCount = 0;
      let weightedAgeSum = 0;
      analytics.forEach(record => {
        if (!record.demographics) return;
        record.demographics.forEach(demo => {
          if (demo.startsWith('age:')) {
            const ageGroup = demo.substring(4);
            if (ageGroups[ageGroup] !== undefined) {
              ageGroups[ageGroup]++;
              totalCount++;
              const midpoint = this.getAgeGroupMidpoint(ageGroup);
              weightedAgeSum += midpoint;
            }
          }
        });
      });
      const distribution = Object.entries(ageGroups).map(([key, value]) => ({
        key,
        value,
        percentage: totalCount > 0 ? (value / totalCount) * 100 : 0,
      }));
      let dominantAgeGroup = null;
      let maxCount = 0;
      Object.entries(ageGroups).forEach(([group, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominantAgeGroup = group;
        }
      });
      return {
        distribution,
        averageAge: totalCount > 0 ? weightedAgeSum / totalCount : null,
        dominantAgeGroup,
      };
    }
    getAgeGroupMidpoint(ageGroup) {
      if (ageGroup === '65+') return 70;
      const [min, max] = ageGroup.split('-').map(Number);
      return (min + max) / 2;
    }
    processLocationData(analytics) {
      const countries = {};
      const regions = {};
      const cities = {};
      analytics.forEach(record => {
        if (!record.demographics) return;
        record.demographics.forEach(demo => {
          if (demo.startsWith('country:')) {
            const country = demo.substring(8);
            countries[country] = (countries[country] || 0) + 1;
          } else if (demo.startsWith('region:')) {
            const region = demo.substring(7);
            regions[region] = (regions[region] || 0) + 1;
          } else if (demo.startsWith('city:')) {
            const city = demo.substring(5);
            cities[city] = (cities[city] || 0) + 1;
          }
        });
      });
      const countryTotal = Object.values(countries).reduce((sum, val) => sum + val, 0);
      const regionTotal = Object.values(regions).reduce((sum, val) => sum + val, 0);
      const cityTotal = Object.values(cities).reduce((sum, val) => sum + val, 0);
      return {
        countries: this.convertToDataPoints(countries, countryTotal),
        regions: this.convertToDataPoints(regions, regionTotal),
        cities: this.convertToDataPoints(cities, cityTotal),
      };
    }
    processDeviceData(analytics) {
      const deviceTypes = {};
      const browsers = {};
      const operatingSystems = {};
      analytics.forEach(record => {
        if (!record.demographics) return;
        record.demographics.forEach(demo => {
          if (demo.startsWith('device:')) {
            const device = demo.substring(7);
            deviceTypes[device] = (deviceTypes[device] || 0) + 1;
          } else if (demo.startsWith('browser:')) {
            const browser = demo.substring(8);
            browsers[browser] = (browsers[browser] || 0) + 1;
          } else if (demo.startsWith('os:')) {
            const os = demo.substring(3);
            operatingSystems[os] = (operatingSystems[os] || 0) + 1;
          }
        });
      });
      const deviceTotal = Object.values(deviceTypes).reduce((sum, val) => sum + val, 0);
      const browserTotal = Object.values(browsers).reduce((sum, val) => sum + val, 0);
      const osTotal = Object.values(operatingSystems).reduce((sum, val) => sum + val, 0);
      return {
        deviceTypes: this.convertToDataPoints(deviceTypes, deviceTotal),
        browsers: this.convertToDataPoints(browsers, browserTotal),
        operatingSystems: this.convertToDataPoints(operatingSystems, osTotal),
      };
    }
    processGenderData(analytics) {
      const genders = {};
      analytics.forEach(record => {
        if (!record.demographics) return;
        record.demographics.forEach(demo => {
          if (demo.startsWith('gender:')) {
            const gender = demo.substring(7);
            genders[gender] = (genders[gender] || 0) + 1;
          }
        });
      });
      const total = Object.values(genders).reduce((sum, val) => sum + val, 0);
      return this.convertToDataPoints(genders, total);
    }
    processInterestData(analytics) {
      const interests = {};
      analytics.forEach(record => {
        if (!record.demographics) return;
        record.demographics.forEach(demo => {
          if (demo.startsWith('interest:')) {
            const interest = demo.substring(9);
            interests[interest] = (interests[interest] || 0) + 1;
          }
        });
      });
      const total = Object.values(interests).reduce((sum, val) => sum + val, 0);
      return this.convertToDataPoints(interests, total);
    }
    convertToDataPoints(countObj, total) {
      return Object.entries(countObj)
        .map(([key, value]) => ({
          key,
          value,
          percentage: total > 0 ? (value / total) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value);
    }
    async recordDemographicData(merchantId, demographics) {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await this.updateDemographicRecord(merchantId, today, 'daily', demographics);
        await this.updateTimeFrameAggregates(merchantId, today, demographics);
      } catch (error) {
        this.logger.error(`Failed to record demographic data: ${error.message}`);
        throw error;
      }
    }
    async updateDemographicRecord(merchantId, date, timeFrame, demographics) {
      let record = await this.analyticsRepository.findOne({
        where: {
          merchantId,
          date,
          timeFrame,
          productId: (0, typeorm_2.IsNull)(),
          categoryId: (0, typeorm_2.IsNull)(),
        },
      });
      if (!record) {
        record = this.analyticsRepository.create({
          merchantId,
          date,
          timeFrame,
          productId: null,
          categoryId: null,
          revenue: 0,
          orders: 0,
          productViews: 0,
          organicImpressions: 0,
          paidImpressions: 0,
          clicks: 0,
          addToCarts: 0,
          abandonedCarts: 0,
          conversionRate: 0,
          clickThroughRate: 0,
          demographics: [],
        });
      }
      if (demographics && demographics.length > 0) {
        if (!record.demographics) {
          record.demographics = [];
        }
        record.demographics = [...record.demographics, ...demographics];
      }
      await this.analyticsRepository.save(record);
    }
    async updateTimeFrameAggregates(merchantId, date, demographics) {
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      await this.updateDemographicRecord(merchantId, weekStart, 'weekly', demographics);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      await this.updateDemographicRecord(merchantId, monthStart, 'monthly', demographics);
      const quarter = Math.floor(date.getMonth() / 3);
      const quarterStart = new Date(date.getFullYear(), quarter * 3, 1);
      await this.updateDemographicRecord(merchantId, quarterStart, 'quarterly', demographics);
      const yearStart = new Date(date.getFullYear(), 0, 1);
      await this.updateDemographicRecord(merchantId, yearStart, 'yearly', demographics);
    }
  });
exports.MerchantDemographicAnalyticsService = MerchantDemographicAnalyticsService;
exports.MerchantDemographicAnalyticsService =
  MerchantDemographicAnalyticsService =
  MerchantDemographicAnalyticsService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(merchant_analytics_entity_1.MerchantAnalytics)),
        __metadata('design:paramtypes', [typeorm_2.Repository]),
      ],
      MerchantDemographicAnalyticsService,
    );
//# sourceMappingURL=merchant-demographic-analytics.service.js.map
