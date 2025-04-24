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
var MerchantRevenueAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantRevenueAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const merchant_analytics_entity_1 = require("../entities/merchant-analytics.entity");
let MerchantRevenueAnalyticsService = MerchantRevenueAnalyticsService_1 = class MerchantRevenueAnalyticsService {
    constructor(analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
        this.logger = new common_1.Logger(MerchantRevenueAnalyticsService_1.name);
        this.logger = new common_1.Logger(MerchantRevenueAnalyticsService_1.name);
    }
    async getRevenueByTimeFrame(merchantId, timeFrame = 'monthly', startDate, endDate) {
        try {
            if (!startDate) {
                startDate = new Date();
                switch (timeFrame) {
                    case 'weekly':
                        startDate.setDate(startDate.getDate() - 12 * 7);
                        break;
                    case 'monthly':
                        startDate.setMonth(startDate.getMonth() - 12);
                        break;
                    case 'quarterly':
                        startDate.setMonth(startDate.getMonth() - 12 * 4);
                        break;
                    case 'yearly':
                        startDate.setFullYear(startDate.getFullYear() - 5);
                        break;
                    default:
                        startDate.setMonth(startDate.getMonth() - 6);
                }
            }
            if (!endDate) {
                endDate = new Date();
            }
            const analytics = await this.analyticsRepository.find({
                where: {
                    merchantId,
                    timeFrame,
                    date: (0, typeorm_2.Between)(startDate, endDate),
                    productId: null,
                    categoryId: null,
                },
                order: { date: 'ASC' },
            });
            return analytics.map(record => ({
                date: record.date,
                value: record.revenue,
            }));
        }
        catch (error) {
            this.logger.error(`Failed to get revenue by time frame: ${error.message}`);
            throw error;
        }
    }
    async getCartAbandonmentRateOverTime(merchantId, timeFrame = 'monthly', startDate, endDate) {
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
                    productId: null,
                    categoryId: null,
                },
                order: { date: 'ASC' },
            });
            return analytics.map(record => {
                const totalCarts = record.addToCarts || 0;
                const abandonedCarts = record.abandonedCarts || 0;
                const abandonmentRate = totalCarts > 0 ? (abandonedCarts / totalCarts) * 100 : 0;
                return {
                    date: record.date,
                    value: abandonmentRate,
                };
            });
        }
        catch (error) {
            this.logger.error(`Failed to get cart abandonment rate over time: ${error.message}`);
            throw error;
        }
    }
    async getImpressionsBySourceOverTime(merchantId, timeFrame = 'monthly', startDate, endDate) {
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
                    productId: null,
                    categoryId: null,
                },
                order: { date: 'ASC' },
            });
            return analytics.map(record => ({
                date: record.date,
                organic: record.organicImpressions || 0,
                paid: record.paidImpressions || 0,
                total: (record.organicImpressions || 0) + (record.paidImpressions || 0),
            }));
        }
        catch (error) {
            this.logger.error(`Failed to get impressions by source over time: ${error.message}`);
            throw error;
        }
    }
};
exports.MerchantRevenueAnalyticsService = MerchantRevenueAnalyticsService;
exports.MerchantRevenueAnalyticsService = MerchantRevenueAnalyticsService = MerchantRevenueAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(merchant_analytics_entity_1.MerchantAnalytics)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MerchantRevenueAnalyticsService);
//# sourceMappingURL=merchant-revenue-analytics.service.js.map