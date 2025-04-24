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
exports.MerchantDashboardAnalyticsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const merchant_dashboard_analytics_service_1 = require("../services/merchant-dashboard-analytics.service");
const merchant_data_aggregation_service_1 = require("../services/merchant-data-aggregation.service");
const merchant_analytics_filter_service_1 = require("../services/merchant-analytics-filter.service");
const merchant_revenue_analytics_service_1 = require("../services/merchant-revenue-analytics.service");
const merchant_demographic_analytics_service_1 = require("../services/merchant-demographic-analytics.service");
const merchant_auth_guard_1 = require("../../auth/guards/merchant-auth.guard");
const current_merchant_decorator_1 = require("../../../modules/auth/decorators/current-merchant.decorator");
const merchant_entity_1 = require("../entities/merchant.entity");
const graphql_type_json_1 = require("graphql-type-json");
const demographic_filter_input_1 = require("../graphql/inputs/demographic-filter.input");
const analytics_dashboard_type_1 = require("../graphql/types/analytics-dashboard.type");
let MerchantDashboardAnalyticsResolver = class MerchantDashboardAnalyticsResolver {
    constructor(dashboardAnalyticsService, dataAggregationService, analyticsFilterService, revenueAnalyticsService, demographicAnalyticsService) {
        this.dashboardAnalyticsService = dashboardAnalyticsService;
        this.dataAggregationService = dataAggregationService;
        this.analyticsFilterService = analyticsFilterService;
        this.revenueAnalyticsService = revenueAnalyticsService;
        this.demographicAnalyticsService = demographicAnalyticsService;
    }
    async merchantDashboardAnalytics(merchant, timeFrame, startDate, endDate, _productIds, _categoryIds, _sortBy, _sortOrder, _page, _limit) {
        return this.dashboardAnalyticsService.getDashboardAnalytics(merchant.id, timeFrame, startDate, endDate);
    }
    async merchantPeriodComparison(merchant, currentPeriodStart, currentPeriodEnd, previousPeriodStart, previousPeriodEnd, productIds, categoryIds) {
        return this.dashboardAnalyticsService.getPeriodComparisonData(merchant.id, currentPeriodStart, currentPeriodEnd, previousPeriodStart, previousPeriodEnd, productIds, categoryIds);
    }
    async merchantPerformanceOverTime(merchant, metricName, timeFrame, startDate, endDate) {
        return this.dashboardAnalyticsService.getPerformanceOverTime(merchant.id, timeFrame, startDate, endDate);
    }
    async merchantConversionFunnel(merchant, timeFrame, startDate, endDate) {
        return this.dashboardAnalyticsService.getConversionFunnel(merchant.id, timeFrame, startDate, endDate);
    }
    async merchantOrganicVsPaidPerformance(merchant, timeFrame, startDate, endDate) {
        return this.dashboardAnalyticsService.getOrganicVsPaidPerformance(merchant.id, timeFrame, startDate, endDate);
    }
    async merchantMetricAggregation(merchant, metricName, timeFrame, aggregationFunction, startDate, endDate, productId, categoryId) {
        return this.dataAggregationService.aggregateMetric(merchant.id, metricName, timeFrame, aggregationFunction, startDate, endDate, productId, categoryId);
    }
    async merchantCompareTimePeriods(merchant, metricName, currentStartDate, currentEndDate, previousStartDate, previousEndDate, productId, categoryId) {
        return this.dataAggregationService.compareTimePeriods(merchant.id, metricName, {
            startDate: currentStartDate,
            endDate: currentEndDate,
        }, {
            startDate: previousStartDate,
            endDate: previousEndDate,
        }, productId, categoryId);
    }
    async merchantTimeSeriesData(merchant, metricName, timeFrame, startDate, endDate, productId, categoryId) {
        return this.dataAggregationService.getTimeSeriesData(merchant.id, metricName, timeFrame, startDate, endDate, productId, categoryId);
    }
    async merchantRollingAverages(merchant, metricName, windowSize, startDate, endDate, productId, categoryId) {
        return this.dataAggregationService.getRollingAverages(merchant.id, metricName, windowSize, startDate, endDate, productId, categoryId);
    }
    async merchantFilteredAnalytics(merchant, timeFrame, startDate, endDate, productIds, categoryIds, sortBy, sortOrder, page, limit) {
        return this.analyticsFilterService.getFilteredAnalytics(merchant.id, {
            timeFrame: timeFrame,
            startDate,
            endDate,
            productIds,
            categoryIds,
            sortBy,
            sortOrder: sortOrder,
            page,
            limit,
        });
    }
    async merchantTopPerformingProducts(merchant, metric, timeFrame, limit, startDate, endDate, categoryIds) {
        return this.analyticsFilterService.getTopPerformingProducts(merchant.id, metric, timeFrame, limit, startDate, endDate, categoryIds);
    }
    async merchantCategoryPerformance(merchant, metric, timeFrame, startDate, endDate) {
        return this.analyticsFilterService.getCategoryPerformance(merchant.id, metric, timeFrame, startDate, endDate);
    }
    async merchantProductPerformanceOverTime(merchant, productId, metric, timeFrame, startDate, endDate) {
        return this.analyticsFilterService.getProductPerformanceOverTime(merchant.id, productId, metric, timeFrame, startDate, endDate);
    }
    async merchantCategoryPerformanceOverTime(merchant, categoryId, metric, timeFrame, startDate, endDate) {
        return this.analyticsFilterService.getCategoryPerformanceOverTime(merchant.id, categoryId, metric, timeFrame, startDate, endDate);
    }
    async merchantCompareProducts(merchant, productIds, metric, timeFrame, startDate, endDate) {
        return this.analyticsFilterService.compareProducts(merchant.id, productIds, metric, timeFrame, startDate, endDate);
    }
    async merchantRevenueAnalytics(merchant, startDate, endDate) {
        const weekly = await this.revenueAnalyticsService.getRevenueByTimeFrame(merchant.id, 'weekly', startDate, endDate);
        const monthly = await this.revenueAnalyticsService.getRevenueByTimeFrame(merchant.id, 'monthly', startDate, endDate);
        const quarterly = await this.revenueAnalyticsService.getRevenueByTimeFrame(merchant.id, 'quarterly', startDate, endDate);
        const yearly = await this.revenueAnalyticsService.getRevenueByTimeFrame(merchant.id, 'yearly', startDate, endDate);
        return {
            weekly,
            monthly,
            quarterly,
            yearly,
        };
    }
    async merchantConversionAnalytics(merchant, timeFrame, startDate, endDate) {
        const conversionRateOverTime = await this.dashboardAnalyticsService.getPerformanceOverTime(merchant.id, timeFrame, startDate, endDate);
        const clickThroughRateOverTime = await this.dashboardAnalyticsService.getPerformanceOverTime(merchant.id, timeFrame, startDate, endDate);
        const cartAbandonmentRateOverTime = await this.revenueAnalyticsService.getCartAbandonmentRateOverTime(merchant.id, timeFrame, startDate, endDate);
        return {
            conversionRateOverTime,
            clickThroughRateOverTime,
            cartAbandonmentRateOverTime,
        };
    }
    async merchantImpressionAnalytics(merchant, timeFrame, startDate, endDate) {
        const impressionsOverTime = await this.revenueAnalyticsService.getImpressionsBySourceOverTime(merchant.id, timeFrame, startDate, endDate);
        return {
            impressionsOverTime,
        };
    }
    async merchantDemographicAnalytics(merchant, timeFrame, startDate, endDate, filters) {
        return this.demographicAnalyticsService.getDemographicAnalytics(merchant.id, timeFrame, startDate, endDate, filters);
    }
    async merchantEnhancedDashboardAnalytics(merchant, timeFrame, startDate, endDate, demographicFilters) {
        const baseAnalytics = await this.dashboardAnalyticsService.getDashboardAnalytics(merchant.id, timeFrame, startDate, endDate);
        const revenueAnalytics = await this.merchantRevenueAnalytics(merchant, startDate, endDate);
        const conversionAnalytics = await this.merchantConversionAnalytics(merchant, timeFrame, startDate, endDate);
        const impressionAnalytics = await this.merchantImpressionAnalytics(merchant, timeFrame, startDate, endDate);
        const demographicAnalytics = await this.demographicAnalyticsService.getDemographicAnalytics(merchant.id, timeFrame, startDate, endDate, demographicFilters);
        return {
            ...baseAnalytics,
            revenueAnalytics,
            conversionAnalytics,
            impressionAnalytics,
            demographicAnalytics,
        };
    }
};
exports.MerchantDashboardAnalyticsResolver = MerchantDashboardAnalyticsResolver;
__decorate([
    (0, graphql_1.Query)(() => analytics_dashboard_type_1.MerchantDashboardAnalytics),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('timeFrame', { nullable: true })),
    __param(2, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(3, (0, graphql_1.Args)('endDate', { nullable: true })),
    __param(4, (0, graphql_1.Args)('productIds', { type: () => [String], nullable: true })),
    __param(5, (0, graphql_1.Args)('categoryIds', { type: () => [String], nullable: true })),
    __param(6, (0, graphql_1.Args)('sortBy', { nullable: true })),
    __param(7, (0, graphql_1.Args)('sortOrder', { nullable: true })),
    __param(8, (0, graphql_1.Args)('page', { nullable: true })),
    __param(9, (0, graphql_1.Args)('limit', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant, String, Date,
        Date, Array, Array, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantDashboardAnalytics", null);
__decorate([
    (0, graphql_1.Query)(() => analytics_dashboard_type_1.PeriodComparisonData),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('currentPeriodStart', { nullable: false })),
    __param(2, (0, graphql_1.Args)('currentPeriodEnd', { nullable: false })),
    __param(3, (0, graphql_1.Args)('previousPeriodStart', { nullable: false })),
    __param(4, (0, graphql_1.Args)('previousPeriodEnd', { nullable: false })),
    __param(5, (0, graphql_1.Args)('productIds', { type: () => [String], nullable: true })),
    __param(6, (0, graphql_1.Args)('categoryIds', { type: () => [String], nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant,
        Date,
        Date,
        Date,
        Date, Array, Array]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantPeriodComparison", null);
__decorate([
    (0, graphql_1.Query)(() => [analytics_dashboard_type_1.TimeSeriesDataPoint]),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('metricName', { nullable: false })),
    __param(2, (0, graphql_1.Args)('timeFrame', { nullable: true })),
    __param(3, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(4, (0, graphql_1.Args)('endDate', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant, String, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantPerformanceOverTime", null);
__decorate([
    (0, graphql_1.Query)(() => analytics_dashboard_type_1.ConversionFunnel),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('timeFrame', { nullable: true })),
    __param(2, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(3, (0, graphql_1.Args)('endDate', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantConversionFunnel", null);
__decorate([
    (0, graphql_1.Query)(() => analytics_dashboard_type_1.OrganicVsPaidPerformance),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('timeFrame', { nullable: true })),
    __param(2, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(3, (0, graphql_1.Args)('endDate', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantOrganicVsPaidPerformance", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('metricName')),
    __param(2, (0, graphql_1.Args)('timeFrame', { nullable: true })),
    __param(3, (0, graphql_1.Args)('aggregationFunction', { nullable: true })),
    __param(4, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(5, (0, graphql_1.Args)('endDate', { nullable: true })),
    __param(6, (0, graphql_1.Args)('productId', { nullable: true })),
    __param(7, (0, graphql_1.Args)('categoryId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant, String, String, String, Date,
        Date, String, String]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantMetricAggregation", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('metricName')),
    __param(2, (0, graphql_1.Args)('currentStartDate')),
    __param(3, (0, graphql_1.Args)('currentEndDate')),
    __param(4, (0, graphql_1.Args)('previousStartDate')),
    __param(5, (0, graphql_1.Args)('previousEndDate')),
    __param(6, (0, graphql_1.Args)('productId', { nullable: true })),
    __param(7, (0, graphql_1.Args)('categoryId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant, String, Date,
        Date,
        Date,
        Date, String, String]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantCompareTimePeriods", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('metricName')),
    __param(2, (0, graphql_1.Args)('timeFrame', { nullable: true })),
    __param(3, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(4, (0, graphql_1.Args)('endDate', { nullable: true })),
    __param(5, (0, graphql_1.Args)('productId', { nullable: true })),
    __param(6, (0, graphql_1.Args)('categoryId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant, String, String, Date,
        Date, String, String]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantTimeSeriesData", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('metricName')),
    __param(2, (0, graphql_1.Args)('windowSize', { type: () => graphql_1.Int, nullable: true })),
    __param(3, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(4, (0, graphql_1.Args)('endDate', { nullable: true })),
    __param(5, (0, graphql_1.Args)('productId', { nullable: true })),
    __param(6, (0, graphql_1.Args)('categoryId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant, String, Number, Date,
        Date, String, String]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantRollingAverages", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('timeFrame', { nullable: true })),
    __param(2, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(3, (0, graphql_1.Args)('endDate', { nullable: true })),
    __param(4, (0, graphql_1.Args)('productIds', { type: () => [String], nullable: true })),
    __param(5, (0, graphql_1.Args)('categoryIds', { type: () => [String], nullable: true })),
    __param(6, (0, graphql_1.Args)('sortBy', { nullable: true })),
    __param(7, (0, graphql_1.Args)('sortOrder', { nullable: true })),
    __param(8, (0, graphql_1.Args)('page', { type: () => graphql_1.Int, nullable: true })),
    __param(9, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant, String, Date,
        Date, Array, Array, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantFilteredAnalytics", null);
__decorate([
    (0, graphql_1.Query)(() => [analytics_dashboard_type_1.TopProduct]),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('metric', { nullable: true })),
    __param(2, (0, graphql_1.Args)('timeFrame', { nullable: true })),
    __param(3, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __param(4, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(5, (0, graphql_1.Args)('endDate', { nullable: true })),
    __param(6, (0, graphql_1.Args)('categoryIds', { type: () => [String], nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant, String, String, Number, Date,
        Date, Array]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantTopPerformingProducts", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('metric', { nullable: true })),
    __param(2, (0, graphql_1.Args)('timeFrame', { nullable: true })),
    __param(3, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(4, (0, graphql_1.Args)('endDate', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant, String, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantCategoryPerformance", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('productId')),
    __param(2, (0, graphql_1.Args)('metric', { nullable: true })),
    __param(3, (0, graphql_1.Args)('timeFrame', { nullable: true })),
    __param(4, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(5, (0, graphql_1.Args)('endDate', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant, String, String, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantProductPerformanceOverTime", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('categoryId')),
    __param(2, (0, graphql_1.Args)('metric', { nullable: true })),
    __param(3, (0, graphql_1.Args)('timeFrame', { nullable: true })),
    __param(4, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(5, (0, graphql_1.Args)('endDate', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant, String, String, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantCategoryPerformanceOverTime", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('productIds', { type: () => [String] })),
    __param(2, (0, graphql_1.Args)('metric', { nullable: true })),
    __param(3, (0, graphql_1.Args)('timeFrame', { nullable: true })),
    __param(4, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(5, (0, graphql_1.Args)('endDate', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant, Array, String, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantCompareProducts", null);
__decorate([
    (0, graphql_1.Query)(() => analytics_dashboard_type_1.RevenueAnalytics),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(2, (0, graphql_1.Args)('endDate', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant,
        Date,
        Date]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantRevenueAnalytics", null);
__decorate([
    (0, graphql_1.Query)(() => analytics_dashboard_type_1.ConversionAnalytics),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('timeFrame', { nullable: true })),
    __param(2, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(3, (0, graphql_1.Args)('endDate', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantConversionAnalytics", null);
__decorate([
    (0, graphql_1.Query)(() => analytics_dashboard_type_1.ImpressionAnalytics),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('timeFrame', { nullable: true })),
    __param(2, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(3, (0, graphql_1.Args)('endDate', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantImpressionAnalytics", null);
__decorate([
    (0, graphql_1.Query)(() => analytics_dashboard_type_1.DemographicAnalytics),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('timeFrame', { nullable: true })),
    __param(2, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(3, (0, graphql_1.Args)('endDate', { nullable: true })),
    __param(4, (0, graphql_1.Args)('filters', { type: () => [demographic_filter_input_1.DemographicFilterInput], nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant, String, Date,
        Date, Array]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantDemographicAnalytics", null);
__decorate([
    (0, graphql_1.Query)(() => analytics_dashboard_type_1.MerchantDashboardAnalytics),
    __param(0, (0, current_merchant_decorator_1.CurrentMerchant)()),
    __param(1, (0, graphql_1.Args)('timeFrame', { nullable: true })),
    __param(2, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(3, (0, graphql_1.Args)('endDate', { nullable: true })),
    __param(4, (0, graphql_1.Args)('demographicFilters', { type: () => [demographic_filter_input_1.DemographicFilterInput], nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_entity_1.Merchant, String, Date,
        Date, Array]),
    __metadata("design:returntype", Promise)
], MerchantDashboardAnalyticsResolver.prototype, "merchantEnhancedDashboardAnalytics", null);
exports.MerchantDashboardAnalyticsResolver = MerchantDashboardAnalyticsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(merchant_auth_guard_1.MerchantAuthGuard),
    __metadata("design:paramtypes", [merchant_dashboard_analytics_service_1.MerchantDashboardAnalyticsService,
        merchant_data_aggregation_service_1.MerchantDataAggregationService,
        merchant_analytics_filter_service_1.MerchantAnalyticsFilterService,
        merchant_revenue_analytics_service_1.MerchantRevenueAnalyticsService,
        merchant_demographic_analytics_service_1.MerchantDemographicAnalyticsService])
], MerchantDashboardAnalyticsResolver);
//# sourceMappingURL=merchant-dashboard-analytics.resolver.js.map