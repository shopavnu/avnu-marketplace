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
var MerchantAnalyticsFilterService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.MerchantAnalyticsFilterService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const merchant_analytics_entity_1 = require('../entities/merchant-analytics.entity');
const services_1 = require('../../products/services');
let MerchantAnalyticsFilterService =
  (MerchantAnalyticsFilterService_1 = class MerchantAnalyticsFilterService {
    constructor(analyticsRepository, productService, categoryService) {
      this.analyticsRepository = analyticsRepository;
      this.productService = productService;
      this.categoryService = categoryService;
      this.logger = new common_1.Logger(MerchantAnalyticsFilterService_1.name);
    }
    async getFilteredAnalytics(merchantId, filters) {
      try {
        const {
          timeFrame = 'monthly',
          startDate,
          endDate,
          productIds,
          categoryIds,
          sortBy = 'date',
          sortOrder = 'desc',
          page = 1,
          limit = 10,
        } = filters;
        const whereConditions = {
          merchantId,
          timeFrame,
        };
        if (startDate && endDate) {
          whereConditions.date = (0, typeorm_2.Between)(startDate, endDate);
        }
        if (productIds && productIds.length > 0) {
          whereConditions.productId = (0, typeorm_2.In)(productIds);
        }
        if (categoryIds && categoryIds.length > 0) {
          whereConditions.categoryId = (0, typeorm_2.In)(categoryIds);
        }
        const skip = (page - 1) * limit;
        const [data, total] = await this.analyticsRepository.findAndCount({
          where: whereConditions,
          order: { [sortBy]: sortOrder },
          skip,
          take: limit,
        });
        return {
          data,
          total,
          page,
          limit,
        };
      } catch (error) {
        this.logger.error(
          `Failed to get filtered analytics for merchant ${merchantId}: ${error.message}`,
        );
        throw error;
      }
    }
    async getTopPerformingProducts(
      merchantId,
      metric = 'revenue',
      timeFrame = 'monthly',
      limit = 10,
      startDate,
      endDate,
      categoryIds,
    ) {
      try {
        const whereConditions = {
          merchantId,
          timeFrame,
          productId: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()),
        };
        if (startDate && endDate) {
          whereConditions.date = (0, typeorm_2.Between)(startDate, endDate);
        }
        if (categoryIds && categoryIds.length > 0) {
          whereConditions.categoryId = (0, typeorm_2.In)(categoryIds);
        }
        const productAnalytics = await this.analyticsRepository.find({
          where: whereConditions,
        });
        const productPerformance = {};
        productAnalytics.forEach(record => {
          const productId = record.productId;
          if (!productPerformance[productId]) {
            productPerformance[productId] = {
              productId,
              revenue: 0,
              orders: 0,
              views: record.productViews || 0,
              clicks: record.clicks || 0,
              conversionRate: 0,
              clickThroughRate: 0,
            };
          }
          productPerformance[productId].revenue += record.revenue || 0;
          productPerformance[productId].orders += record.orders || 0;
          productPerformance[productId].views += record.productViews || 0;
          productPerformance[productId].clicks += record.clicks || 0;
        });
        Object.values(productPerformance).forEach(product => {
          if (product.clicks > 0) {
            product.conversionRate = product.orders / product.clicks;
          }
          if (product.views > 0) {
            product.clickThroughRate = product.clicks / product.views;
          }
        });
        const sortedProducts = Object.values(productPerformance)
          .sort((a, b) => b[metric] - a[metric])
          .slice(0, limit);
        const productIds = sortedProducts.map(product => product.productId);
        const productDetails = await this.productService.findByIds(productIds);
        return sortedProducts.map(performance => {
          const product = productDetails.find(p => p.id === performance.productId);
          return {
            ...performance,
            productName: product?.title || 'Unknown Product',
            productImage: product?.thumbnail || product?.images?.[0] || '',
            productPrice: product?.price || 0,
          };
        });
      } catch (error) {
        this.logger.error(
          `Failed to get top performing products for merchant ${merchantId}: ${error.message}`,
        );
        throw error;
      }
    }
    async getCategoryPerformance(
      merchantId,
      metric = 'revenue',
      timeFrame = 'monthly',
      startDate,
      endDate,
    ) {
      try {
        const whereConditions = {
          merchantId,
          timeFrame,
          categoryId: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()),
        };
        if (startDate && endDate) {
          whereConditions.date = (0, typeorm_2.Between)(startDate, endDate);
        }
        const categoryAnalytics = await this.analyticsRepository.find({
          where: whereConditions,
        });
        const categoryPerformance = {};
        categoryAnalytics.forEach(record => {
          const categoryId = record.categoryId;
          if (!categoryPerformance[categoryId]) {
            categoryPerformance[categoryId] = {
              categoryId,
              revenue: 0,
              orders: 0,
              views: 0,
              clicks: 0,
            };
          }
          categoryPerformance[categoryId].revenue += record.revenue || 0;
          categoryPerformance[categoryId].orders += record.orders || 0;
          categoryPerformance[categoryId].views += record.productViews || 0;
          categoryPerformance[categoryId].clicks += record.clicks || 0;
        });
        const categoryIds = Object.keys(categoryPerformance);
        const categoryDetails = await this.categoryService.findByIds(categoryIds);
        return Object.values(categoryPerformance)
          .map(performance => {
            const category = categoryDetails.find(c => c.id === performance.categoryId);
            return {
              ...performance,
              categoryName: category?.name || 'Unknown Category',
              [metric]: performance[metric] || 0,
            };
          })
          .sort((a, b) => b[metric] - a[metric]);
      } catch (error) {
        this.logger.error(
          `Failed to get category performance for merchant ${merchantId}: ${error.message}`,
        );
        throw error;
      }
    }
    async getProductPerformanceOverTime(
      merchantId,
      productId,
      metric = 'revenue',
      timeFrame = 'daily',
      startDate,
      endDate,
    ) {
      try {
        const whereConditions = {
          merchantId,
          productId,
          timeFrame,
        };
        if (startDate && endDate) {
          whereConditions.date = (0, typeorm_2.Between)(startDate, endDate);
        }
        const productAnalytics = await this.analyticsRepository.find({
          where: whereConditions,
          order: { date: 'ASC' },
        });
        return productAnalytics.map(record => ({
          date: record.date,
          value: record[metric] || 0,
        }));
      } catch (error) {
        this.logger.error(
          `Failed to get product performance over time for merchant ${merchantId} and product ${productId}: ${error.message}`,
        );
        throw error;
      }
    }
    async getCategoryPerformanceOverTime(
      merchantId,
      categoryId,
      metric = 'revenue',
      timeFrame = 'daily',
      startDate,
      endDate,
    ) {
      try {
        const whereConditions = {
          merchantId,
          categoryId,
          timeFrame,
        };
        if (startDate && endDate) {
          whereConditions.date = (0, typeorm_2.Between)(startDate, endDate);
        }
        const categoryAnalytics = await this.analyticsRepository.find({
          where: whereConditions,
          order: { date: 'ASC' },
        });
        return categoryAnalytics.map(record => ({
          date: record.date,
          value: record[metric] || 0,
        }));
      } catch (error) {
        this.logger.error(
          `Failed to get category performance over time for merchant ${merchantId} and category ${categoryId}: ${error.message}`,
        );
        throw error;
      }
    }
    async compareProducts(
      merchantId,
      productIds,
      metric = 'revenue',
      timeFrame = 'monthly',
      startDate,
      endDate,
    ) {
      try {
        const result = {};
        const productDetails = await this.productService.findByIds(productIds);
        for (const productId of productIds) {
          const productAnalytics = await this.getProductPerformanceOverTime(
            merchantId,
            productId,
            metric,
            timeFrame,
            startDate,
            endDate,
          );
          const product = productDetails.find(p => p.id === productId);
          result[productId] = {
            productId,
            productName: product?.title || 'Unknown Product',
            data: productAnalytics,
            total: productAnalytics.reduce((sum, item) => sum + item.value, 0),
          };
        }
        return result;
      } catch (error) {
        this.logger.error(
          `Failed to compare products for merchant ${merchantId}: ${error.message}`,
        );
        throw error;
      }
    }
  });
exports.MerchantAnalyticsFilterService = MerchantAnalyticsFilterService;
exports.MerchantAnalyticsFilterService =
  MerchantAnalyticsFilterService =
  MerchantAnalyticsFilterService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(merchant_analytics_entity_1.MerchantAnalytics)),
        __metadata('design:paramtypes', [
          typeorm_2.Repository,
          services_1.ProductService,
          services_1.CategoryService,
        ]),
      ],
      MerchantAnalyticsFilterService,
    );
//# sourceMappingURL=merchant-analytics-filter.service.js.map
