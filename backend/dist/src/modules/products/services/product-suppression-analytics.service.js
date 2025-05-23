"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProductSuppressionAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSuppressionAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../entities/product.entity");
const merchant_entity_1 = require("../../merchants/entities/merchant.entity");
const category_entity_1 = require("../../categories/entities/category.entity");
const date_fns_1 = require("date-fns");
let ProductSuppressionAnalyticsService = ProductSuppressionAnalyticsService_1 = class ProductSuppressionAnalyticsService {
    constructor(productRepository, merchantRepository, categoryRepository) {
        this.productRepository = productRepository;
        this.merchantRepository = merchantRepository;
        this.categoryRepository = categoryRepository;
        this.logger = new common_1.Logger(ProductSuppressionAnalyticsService_1.name);
    }
    async getSuppressionMetrics(period = 30, merchantId) {
        try {
            const startDate = (0, date_fns_1.subDays)(new Date(), period);
            const baseQuery = this.productRepository
                .createQueryBuilder('product')
                .where('product.suppressedAt IS NOT NULL')
                .andWhere('product.suppressedAt >= :startDate', { startDate });
            if (merchantId) {
                baseQuery.andWhere('product.merchantId = :merchantId', { merchantId });
            }
            const overview = await this.getOverviewMetrics(period, merchantId);
            const byMerchant = await this.getMerchantMetrics(period, merchantId);
            const byCategory = await this.getCategoryMetrics(period, merchantId);
            const byTimeframe = await this.getTimeframeMetrics(period, merchantId);
            const resolutionTimeDistribution = await this.getResolutionTimeDistribution(period, merchantId);
            return {
                overview,
                byMerchant,
                byCategory,
                byTimeframe,
                resolutionTimeDistribution,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get suppression metrics: ${error.message}`);
            throw error;
        }
    }
    async getOverviewMetrics(period, merchantId) {
        try {
            const startDate = (0, date_fns_1.subDays)(new Date(), period);
            const baseQuery = this.productRepository.createQueryBuilder('product');
            if (merchantId) {
                baseQuery.andWhere('product.merchantId = :merchantId', { merchantId });
            }
            const totalProducts = await baseQuery.clone().getCount();
            const totalSuppressedProducts = await baseQuery
                .clone()
                .where('product.suppressedAt IS NOT NULL')
                .andWhere('product.suppressedAt >= :startDate', { startDate })
                .getCount();
            const totalActiveSuppressedProducts = await baseQuery
                .clone()
                .where('product.suppressedAt IS NOT NULL')
                .andWhere('product.suppressedAt >= :startDate', { startDate })
                .andWhere('product.unsuppressedAt IS NULL')
                .getCount();
            const totalResolvedSuppressions = await baseQuery
                .clone()
                .where('product.suppressedAt IS NOT NULL')
                .andWhere('product.suppressedAt >= :startDate', { startDate })
                .andWhere('product.unsuppressedAt IS NOT NULL')
                .getCount();
            const resolutionTimes = await baseQuery
                .clone()
                .select('EXTRACT(EPOCH FROM (product.unsuppressedAt - product.suppressedAt)) / 3600', 'resolutionTimeHours')
                .where('product.suppressedAt IS NOT NULL')
                .andWhere('product.suppressedAt >= :startDate', { startDate })
                .andWhere('product.unsuppressedAt IS NOT NULL')
                .getRawMany();
            const totalResolutionTime = resolutionTimes.reduce((sum, item) => sum + parseFloat(item.resolutionTimeHours), 0);
            const avgResolutionTimeHours = resolutionTimes.length > 0 ? totalResolutionTime / resolutionTimes.length : 0;
            const suppressionRate = totalProducts > 0 ? totalSuppressedProducts / totalProducts : 0;
            return {
                totalSuppressedProducts,
                totalActiveSuppressedProducts,
                totalResolvedSuppressions,
                avgResolutionTimeHours,
                suppressionRate,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get overview metrics: ${error.message}`);
            throw error;
        }
    }
    async getMerchantMetrics(period, merchantId) {
        try {
            const startDate = (0, date_fns_1.subDays)(new Date(), period);
            let query = this.productRepository
                .createQueryBuilder('product')
                .select('product.merchantId', 'merchantId')
                .addSelect('COUNT(product.id) FILTER (WHERE product.suppressedAt IS NOT NULL AND product.suppressedAt >= :startDate)', 'suppressedCount')
                .addSelect('COUNT(product.id) FILTER (WHERE product.suppressedAt IS NOT NULL AND product.suppressedAt >= :startDate AND product.unsuppressedAt IS NOT NULL)', 'resolvedCount')
                .addSelect('AVG(EXTRACT(EPOCH FROM (product.unsuppressedAt - product.suppressedAt)) / 3600) FILTER (WHERE product.suppressedAt IS NOT NULL AND product.suppressedAt >= :startDate AND product.unsuppressedAt IS NOT NULL)', 'avgResolutionTimeHours')
                .addSelect('COUNT(product.id) FILTER (WHERE product.suppressedAt IS NOT NULL AND product.suppressedAt >= :startDate) / COUNT(product.id)::float', 'suppressionRate')
                .setParameter('startDate', startDate)
                .groupBy('product.merchantId');
            if (merchantId) {
                query = query.andWhere('product.merchantId = :merchantId', { merchantId });
            }
            const results = await query.getRawMany();
            const merchantIds = results.map(result => result.merchantId);
            const merchants = await this.merchantRepository.find({
                where: { id: (0, typeorm_2.In)(merchantIds) },
                select: ['id', 'name'],
            });
            const merchantMap = new Map(merchants.map(merchant => [merchant.id, merchant.name]));
            return results.map(result => ({
                merchantId: result.merchantId,
                merchantName: merchantMap.get(result.merchantId) || 'Unknown Merchant',
                suppressedCount: parseInt(result.suppressedCount) || 0,
                resolvedCount: parseInt(result.resolvedCount) || 0,
                avgResolutionTimeHours: parseFloat(result.avgResolutionTimeHours) || 0,
                suppressionRate: parseFloat(result.suppressionRate) || 0,
            }));
        }
        catch (error) {
            this.logger.error(`Failed to get merchant metrics: ${error.message}`);
            throw error;
        }
    }
    async getCategoryMetrics(period, merchantId) {
        try {
            const startDate = (0, date_fns_1.subDays)(new Date(), period);
            let query = this.productRepository
                .createQueryBuilder('product')
                .select('unnest(product.categories)', 'categoryId')
                .addSelect('COUNT(product.id) FILTER (WHERE product.suppressedAt IS NOT NULL AND product.suppressedAt >= :startDate)', 'suppressedCount')
                .addSelect('COUNT(product.id) FILTER (WHERE product.suppressedAt IS NOT NULL AND product.suppressedAt >= :startDate AND product.unsuppressedAt IS NOT NULL)', 'resolvedCount')
                .addSelect('AVG(EXTRACT(EPOCH FROM (product.unsuppressedAt - product.suppressedAt)) / 3600) FILTER (WHERE product.suppressedAt IS NOT NULL AND product.suppressedAt >= :startDate AND product.unsuppressedAt IS NOT NULL)', 'avgResolutionTimeHours')
                .addSelect('COUNT(product.id) FILTER (WHERE product.suppressedAt IS NOT NULL AND product.suppressedAt >= :startDate) / COUNT(product.id)::float', 'suppressionRate')
                .setParameter('startDate', startDate)
                .groupBy('categoryId');
            if (merchantId) {
                query = query.andWhere('product.merchantId = :merchantId', { merchantId });
            }
            const results = await query.getRawMany();
            const categoryIds = results.map(result => result.categoryId);
            const categories = await this.categoryRepository.find({
                where: { id: (0, typeorm_2.In)(categoryIds) },
                select: ['id', 'name'],
            });
            const categoryMap = new Map(categories.map(category => [category.id, category.name]));
            return results.map(result => ({
                categoryId: result.categoryId,
                categoryName: categoryMap.get(result.categoryId) || 'Unknown Category',
                suppressedCount: parseInt(result.suppressedCount) || 0,
                resolvedCount: parseInt(result.resolvedCount) || 0,
                avgResolutionTimeHours: parseFloat(result.avgResolutionTimeHours) || 0,
                suppressionRate: parseFloat(result.suppressionRate) || 0,
            }));
        }
        catch (error) {
            this.logger.error(`Failed to get category metrics: ${error.message}`);
            throw error;
        }
    }
    async getTimeframeMetrics(period, merchantId) {
        try {
            const startDate = (0, date_fns_1.subDays)(new Date(), period);
            const dateFormat = period <= 30 ? 'yyyy-MM-dd' : 'yyyy-MM';
            let query = this.productRepository
                .createQueryBuilder('product')
                .select(`TO_CHAR(product.suppressedAt, '${dateFormat}')`, 'date')
                .addSelect('COUNT(product.id) FILTER (WHERE product.suppressedAt IS NOT NULL)', 'suppressedCount')
                .addSelect('COUNT(product.id) FILTER (WHERE product.unsuppressedAt IS NOT NULL)', 'resolvedCount')
                .addSelect('AVG(EXTRACT(EPOCH FROM (product.unsuppressedAt - product.suppressedAt)) / 3600) FILTER (WHERE product.suppressedAt IS NOT NULL AND product.unsuppressedAt IS NOT NULL)', 'avgResolutionTimeHours')
                .addSelect('COUNT(product.id) FILTER (WHERE product.suppressedAt IS NOT NULL) / COUNT(product.id)::float', 'suppressionRate')
                .where('product.suppressedAt >= :startDate', { startDate })
                .groupBy('date')
                .orderBy('date', 'ASC');
            if (merchantId) {
                query = query.andWhere('product.merchantId = :merchantId', { merchantId });
            }
            const results = await query.getRawMany();
            return results.map(result => ({
                date: result.date,
                suppressedCount: parseInt(result.suppressedCount) || 0,
                resolvedCount: parseInt(result.resolvedCount) || 0,
                avgResolutionTimeHours: parseFloat(result.avgResolutionTimeHours) || 0,
                suppressionRate: parseFloat(result.suppressionRate) || 0,
            }));
        }
        catch (error) {
            this.logger.error(`Failed to get timeframe metrics: ${error.message}`);
            throw error;
        }
    }
    async getResolutionTimeDistribution(period, merchantId) {
        try {
            const startDate = (0, date_fns_1.subDays)(new Date(), period);
            let query = this.productRepository
                .createQueryBuilder('product')
                .select('CASE ' +
                "WHEN EXTRACT(EPOCH FROM (product.unsuppressedAt - product.suppressedAt)) / 3600 < 24 THEN '< 24 hours' " +
                "WHEN EXTRACT(EPOCH FROM (product.unsuppressedAt - product.suppressedAt)) / 3600 < 48 THEN '24-48 hours' " +
                "WHEN EXTRACT(EPOCH FROM (product.unsuppressedAt - product.suppressedAt)) / 3600 < 72 THEN '48-72 hours' " +
                "WHEN EXTRACT(EPOCH FROM (product.unsuppressedAt - product.suppressedAt)) / 3600 < 168 THEN '3-7 days' " +
                "ELSE '> 7 days' " +
                'END', 'timeRange')
                .addSelect('COUNT(product.id)', 'count')
                .where('product.suppressedAt IS NOT NULL')
                .andWhere('product.suppressedAt >= :startDate', { startDate })
                .andWhere('product.unsuppressedAt IS NOT NULL')
                .groupBy('timeRange')
                .orderBy('CASE ' +
                "WHEN timeRange = '< 24 hours' THEN 1 " +
                "WHEN timeRange = '24-48 hours' THEN 2 " +
                "WHEN timeRange = '48-72 hours' THEN 3 " +
                "WHEN timeRange = '3-7 days' THEN 4 " +
                'ELSE 5 ' +
                'END', 'ASC');
            if (merchantId) {
                query = query.andWhere('product.merchantId = :merchantId', { merchantId });
            }
            const results = await query.getRawMany();
            const totalCount = results.reduce((sum, item) => sum + parseInt(item.count), 0);
            return results.map(result => ({
                timeRange: result.timeRange,
                count: parseInt(result.count),
                percentage: totalCount > 0 ? parseInt(result.count) / totalCount : 0,
            }));
        }
        catch (error) {
            this.logger.error(`Failed to get resolution time distribution: ${error.message}`);
            throw error;
        }
    }
};
exports.ProductSuppressionAnalyticsService = ProductSuppressionAnalyticsService;
exports.ProductSuppressionAnalyticsService = ProductSuppressionAnalyticsService = ProductSuppressionAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(merchant_entity_1.Merchant)),
    __param(2, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductSuppressionAnalyticsService);
//# sourceMappingURL=product-suppression-analytics.service.js.map