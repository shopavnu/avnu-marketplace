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
var MerchantDashboardAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantDashboardAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const merchant_analytics_service_1 = require("./merchant-analytics.service");
const services_1 = require("../../products/services");
let MerchantDashboardAnalyticsService = MerchantDashboardAnalyticsService_1 = class MerchantDashboardAnalyticsService {
    constructor(analyticsRepository, merchantAnalyticsService, productService) {
        this.analyticsRepository = analyticsRepository;
        this.merchantAnalyticsService = merchantAnalyticsService;
        this.productService = productService;
        this.logger = new common_1.Logger(MerchantDashboardAnalyticsService_1.name);
    }
    async getDashboardAnalytics(merchantId, timeFrame = 'monthly', startDate, endDate) {
        try {
            const overallAnalytics = await this.merchantAnalyticsService.getOverallAnalytics(merchantId, timeFrame, startDate, endDate);
            const topProducts = await this.merchantAnalyticsService.getTopProducts(merchantId, 10, timeFrame);
            const demographics = await this.merchantAnalyticsService.getDemographicData(merchantId, timeFrame);
            const performanceOverTime = await this.getPerformanceOverTime(merchantId, timeFrame, startDate, endDate);
            const conversionFunnel = await this.getConversionFunnel(merchantId, timeFrame, startDate, endDate);
            const organicVsPaidPerformance = await this.getOrganicVsPaidPerformance(merchantId, timeFrame, startDate, endDate);
            return {
                summary: this.calculateSummaryMetrics(overallAnalytics),
                topProducts,
                demographics,
                performanceOverTime,
                conversionFunnel,
                organicVsPaidPerformance,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get merchant dashboard analytics: ${error.message}`);
            throw error;
        }
    }
    calculateSummaryMetrics(analytics) {
        const summary = {
            totalRevenue: 0,
            totalOrders: 0,
            totalViews: 0,
            totalClicks: 0,
            averageOrderValue: 0,
            overallConversionRate: 0,
            overallClickThroughRate: 0,
        };
        analytics.forEach(record => {
            summary.totalRevenue += record.revenue;
            summary.totalOrders += record.orders;
            summary.totalViews += record.productViews;
            summary.totalClicks += record.clicks;
        });
        if (summary.totalOrders > 0) {
            summary.averageOrderValue = summary.totalRevenue / summary.totalOrders;
        }
        if (summary.totalClicks > 0) {
            summary.overallConversionRate = summary.totalOrders / summary.totalClicks;
        }
        if (summary.totalViews > 0) {
            summary.overallClickThroughRate = summary.totalClicks / summary.totalViews;
        }
        return summary;
    }
    async getPerformanceOverTime(merchantId, timeFrame = 'monthly', startDate, endDate) {
        const analytics = await this.merchantAnalyticsService.getOverallAnalytics(merchantId, timeFrame, startDate, endDate);
        return analytics.map(record => ({
            date: record.date,
            revenue: record.revenue,
            orders: record.orders,
            views: record.productViews,
            clicks: record.clicks,
            conversionRate: record.conversionRate,
            clickThroughRate: record.clickThroughRate,
        }));
    }
    async getConversionFunnel(merchantId, timeFrame = 'monthly', startDate, endDate) {
        const analytics = await this.merchantAnalyticsService.getOverallAnalytics(merchantId, timeFrame, startDate, endDate);
        let totalViews = 0;
        let totalClicks = 0;
        let totalAddToCarts = 0;
        let totalAbandonedCarts = 0;
        let totalOrders = 0;
        analytics.forEach(record => {
            totalViews += record.productViews;
            totalClicks += record.clicks;
            totalAddToCarts += record.addToCarts;
            totalAbandonedCarts += record.abandonedCarts;
            totalOrders += record.orders;
        });
        const viewToClickRate = totalViews > 0 ? totalClicks / totalViews : 0;
        const clickToCartRate = totalClicks > 0 ? totalAddToCarts / totalClicks : 0;
        const cartToOrderRate = totalAddToCarts > 0 ? totalOrders / totalAddToCarts : 0;
        const abandonmentRate = totalAddToCarts > 0 ? totalAbandonedCarts / totalAddToCarts : 0;
        return {
            stages: [
                { name: 'Product Views', count: totalViews },
                { name: 'Clicks', count: totalClicks },
                { name: 'Add to Cart', count: totalAddToCarts },
                { name: 'Orders', count: totalOrders },
            ],
            conversionRates: {
                viewToClickRate,
                clickToCartRate,
                cartToOrderRate,
                abandonmentRate,
                overallConversionRate: totalViews > 0 ? totalOrders / totalViews : 0,
            },
        };
    }
    async getOrganicVsPaidPerformance(merchantId, timeFrame = 'monthly', startDate, endDate) {
        const analytics = await this.merchantAnalyticsService.getOverallAnalytics(merchantId, timeFrame, startDate, endDate);
        const result = {
            impressions: {
                organic: 0,
                paid: 0,
            },
            clicks: {
                organic: 0,
                paid: 0,
            },
            conversionRates: {
                organic: 0,
                paid: 0,
            },
            revenue: {
                organic: 0,
                paid: 0,
            },
        };
        analytics.forEach(record => {
            const totalImpressions = record.organicImpressions + record.paidImpressions;
            result.impressions.organic += record.organicImpressions;
            result.impressions.paid += record.paidImpressions;
            if (totalImpressions > 0) {
                const organicRatio = record.organicImpressions / totalImpressions;
                const paidRatio = record.paidImpressions / totalImpressions;
                result.clicks.organic += record.clicks * organicRatio;
                result.clicks.paid += record.clicks * paidRatio;
                result.revenue.organic += record.revenue * organicRatio;
                result.revenue.paid += record.revenue * paidRatio;
            }
        });
        if (result.clicks.organic > 0) {
            result.conversionRates.organic = result.revenue.organic / result.clicks.organic;
        }
        if (result.clicks.paid > 0) {
            result.conversionRates.paid = result.revenue.paid / result.clicks.paid;
        }
        return result;
    }
    async getPeriodComparisonData(merchantId, currentPeriodStart, currentPeriodEnd, previousPeriodStart, previousPeriodEnd, productIds, categoryIds) {
        try {
            const currentPeriodAnalytics = await this.merchantAnalyticsService.getAnalytics(merchantId, 'custom', currentPeriodStart, currentPeriodEnd, productIds?.length > 0 ? productIds[0] : undefined, categoryIds?.length > 0 ? categoryIds[0] : undefined);
            const previousPeriodAnalytics = await this.merchantAnalyticsService.getAnalytics(merchantId, 'custom', previousPeriodStart, previousPeriodEnd, productIds?.length > 0 ? productIds[0] : undefined, categoryIds?.length > 0 ? categoryIds[0] : undefined);
            const currentPeriodSummary = this.calculateSummaryMetrics(currentPeriodAnalytics);
            const currentPeriodLabel = `${currentPeriodStart.toISOString().split('T')[0]} to ${currentPeriodEnd.toISOString().split('T')[0]}`;
            const previousPeriodSummary = this.calculateSummaryMetrics(previousPeriodAnalytics);
            const previousPeriodLabel = `${previousPeriodStart.toISOString().split('T')[0]} to ${previousPeriodEnd.toISOString().split('T')[0]}`;
            const currentPeriodTimeSeries = await this.getPerformanceOverTime(merchantId, 'custom', currentPeriodStart, currentPeriodEnd);
            const previousPeriodTimeSeries = await this.getPerformanceOverTime(merchantId, 'custom', previousPeriodStart, previousPeriodEnd);
            return {
                currentPeriod: {
                    label: currentPeriodLabel,
                    revenue: currentPeriodSummary.totalRevenue,
                    orders: currentPeriodSummary.totalOrders,
                    views: currentPeriodSummary.totalViews,
                    conversionRate: currentPeriodSummary.overallConversionRate,
                },
                previousPeriod: {
                    label: previousPeriodLabel,
                    revenue: previousPeriodSummary.totalRevenue,
                    orders: previousPeriodSummary.totalOrders,
                    views: previousPeriodSummary.totalViews,
                    conversionRate: previousPeriodSummary.overallConversionRate,
                },
                currentPeriodTimeSeries,
                previousPeriodTimeSeries,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get period comparison data: ${error.message}`);
            throw error;
        }
    }
};
exports.MerchantDashboardAnalyticsService = MerchantDashboardAnalyticsService;
exports.MerchantDashboardAnalyticsService = MerchantDashboardAnalyticsService = MerchantDashboardAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('MerchantAnalyticsRepository')),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        merchant_analytics_service_1.MerchantAnalyticsService,
        services_1.ProductService])
], MerchantDashboardAnalyticsService);
//# sourceMappingURL=merchant-dashboard-analytics.service.js.map