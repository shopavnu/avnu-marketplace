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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const merchant_analytics_entity_1 = require("../entities/merchant-analytics.entity");
let MerchantAnalyticsService = class MerchantAnalyticsService {
    constructor(analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }
    async getAnalytics(merchantId, timeFrame = 'monthly', startDate, endDate, productId, categoryId) {
        if (!startDate) {
            startDate = new Date();
            switch (timeFrame) {
                case 'daily':
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case 'weekly':
                    startDate.setDate(startDate.getDate() - 28);
                    break;
                case 'monthly':
                    startDate.setMonth(startDate.getMonth() - 6);
                    break;
                case 'quarterly':
                    startDate.setMonth(startDate.getMonth() - 12);
                    break;
                case 'yearly':
                    startDate.setFullYear(startDate.getFullYear() - 3);
                    break;
            }
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
        return this.analyticsRepository.find({
            where: whereConditions,
            order: { date: 'ASC' },
        });
    }
    async getProductAnalytics(merchantId, productId, timeFrame = 'monthly', startDate, endDate) {
        return this.getAnalytics(merchantId, timeFrame, startDate, endDate, productId);
    }
    async getCategoryAnalytics(merchantId, categoryId, timeFrame = 'monthly', startDate, endDate) {
        return this.getAnalytics(merchantId, timeFrame, startDate, endDate, undefined, categoryId);
    }
    async getOverallAnalytics(merchantId, timeFrame = 'monthly', startDate, endDate) {
        if (!startDate) {
            startDate = new Date();
            switch (timeFrame) {
                case 'daily':
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case 'weekly':
                    startDate.setDate(startDate.getDate() - 28);
                    break;
                case 'monthly':
                    startDate.setMonth(startDate.getMonth() - 6);
                    break;
                case 'quarterly':
                    startDate.setMonth(startDate.getMonth() - 12);
                    break;
                case 'yearly':
                    startDate.setFullYear(startDate.getFullYear() - 3);
                    break;
            }
        }
        if (!endDate) {
            endDate = new Date();
        }
        return this.analyticsRepository.find({
            where: {
                merchantId,
                timeFrame,
                date: (0, typeorm_2.Between)(startDate, endDate),
                productId: (0, typeorm_2.IsNull)(),
                categoryId: (0, typeorm_2.IsNull)(),
            },
            order: { date: 'ASC' },
        });
    }
    async getDemographicData(merchantId, timeFrame = 'monthly') {
        const analytics = await this.getOverallAnalytics(merchantId, timeFrame);
        const demographicCounts = {};
        analytics.forEach(record => {
            if (record.demographics) {
                record.demographics.forEach(demo => {
                    if (!demographicCounts[demo]) {
                        demographicCounts[demo] = 0;
                    }
                    demographicCounts[demo]++;
                });
            }
        });
        return demographicCounts;
    }
    async getTopProducts(merchantId, limit = 10, timeFrame = 'monthly') {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        const productAnalytics = await this.analyticsRepository.find({
            where: {
                merchantId,
                timeFrame,
                date: (0, typeorm_2.Between)(startDate, new Date()),
                productId: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()),
            },
        });
        const productMap = {};
        productAnalytics.forEach(record => {
            if (record.productId) {
                if (!productMap[record.productId]) {
                    productMap[record.productId] = { revenue: 0, orders: 0 };
                }
                productMap[record.productId].revenue += record.revenue;
                productMap[record.productId].orders += record.orders;
            }
        });
        const products = Object.entries(productMap).map(([productId, data]) => ({
            productId,
            revenue: data.revenue,
            orders: data.orders,
        }));
        return products.sort((a, b) => b.revenue - a.revenue).slice(0, limit);
    }
    async recordProductView(merchantId, productId, isOrganic = true, demographics = []) {
        await this.updateDailyAnalytics(merchantId, productId, {
            productViews: 1,
            organicImpressions: isOrganic ? 1 : 0,
            paidImpressions: isOrganic ? 0 : 1,
            demographics,
        });
    }
    async recordProductClick(merchantId, productId, _isOrganic = true, demographics = []) {
        await this.updateDailyAnalytics(merchantId, productId, {
            clicks: 1,
            demographics,
        });
    }
    async recordAddToCart(merchantId, productId, demographics = []) {
        await this.updateDailyAnalytics(merchantId, productId, {
            addToCarts: 1,
            demographics,
        });
    }
    async recordAbandonedCart(merchantId, productId, demographics = []) {
        await this.updateDailyAnalytics(merchantId, productId, {
            abandonedCarts: 1,
            demographics,
        });
    }
    async recordPurchase(merchantId, productId, revenue, demographics = []) {
        await this.updateDailyAnalytics(merchantId, productId, {
            revenue,
            orders: 1,
            demographics,
        });
    }
    async updateDailyAnalytics(merchantId, productId, data) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const categoryId = await this.getCategoryForProduct(productId);
        await this.updateAnalyticsRecord(merchantId, today, 'daily', data, productId);
        if (categoryId) {
            await this.updateAnalyticsRecord(merchantId, today, 'daily', data, null, categoryId);
        }
        await this.updateAnalyticsRecord(merchantId, today, 'daily', data);
        await this.updateTimeFrameAggregates(merchantId, today, data, productId, categoryId);
    }
    async updateAnalyticsRecord(merchantId, date, timeFrame, data, productId = null, categoryId = null) {
        let record = await this.analyticsRepository.findOne({
            where: {
                merchantId,
                date,
                timeFrame,
                productId: productId || (0, typeorm_2.IsNull)(),
                categoryId: categoryId || (0, typeorm_2.IsNull)(),
            },
        });
        if (!record) {
            record = this.analyticsRepository.create({
                merchantId,
                date,
                timeFrame,
                productId,
                categoryId,
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
        if (data.revenue)
            record.revenue += data.revenue;
        if (data.orders)
            record.orders += data.orders;
        if (data.productViews)
            record.productViews += data.productViews;
        if (data.organicImpressions)
            record.organicImpressions += data.organicImpressions;
        if (data.paidImpressions)
            record.paidImpressions += data.paidImpressions;
        if (data.clicks)
            record.clicks += data.clicks;
        if (data.addToCarts)
            record.addToCarts += data.addToCarts;
        if (data.abandonedCarts)
            record.abandonedCarts += data.abandonedCarts;
        if (record.productViews > 0) {
            record.clickThroughRate = record.clicks / record.productViews;
        }
        if (record.clicks > 0) {
            record.conversionRate = record.orders / record.clicks;
        }
        if (data.demographics && data.demographics.length > 0) {
            if (!record.demographics) {
                record.demographics = [];
            }
            record.demographics = [...record.demographics, ...data.demographics];
        }
        await this.analyticsRepository.save(record);
    }
    async updateTimeFrameAggregates(merchantId, date, data, productId = null, categoryId = null) {
        const weekStart = new Date(date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        await this.updateAnalyticsRecord(merchantId, weekStart, 'weekly', data, productId, categoryId);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        await this.updateAnalyticsRecord(merchantId, monthStart, 'monthly', data, productId, categoryId);
        const quarter = Math.floor(date.getMonth() / 3);
        const quarterStart = new Date(date.getFullYear(), quarter * 3, 1);
        await this.updateAnalyticsRecord(merchantId, quarterStart, 'quarterly', data, productId, categoryId);
        const yearStart = new Date(date.getFullYear(), 0, 1);
        await this.updateAnalyticsRecord(merchantId, yearStart, 'yearly', data, productId, categoryId);
    }
    async getCategoryForProduct(_productId) {
        return null;
    }
};
exports.MerchantAnalyticsService = MerchantAnalyticsService;
exports.MerchantAnalyticsService = MerchantAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(merchant_analytics_entity_1.MerchantAnalytics)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MerchantAnalyticsService);
//# sourceMappingURL=merchant-analytics.service.js.map