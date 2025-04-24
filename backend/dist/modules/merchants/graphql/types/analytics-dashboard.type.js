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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodComparisonData = exports.PeriodMetrics = exports.MerchantDashboardAnalytics = exports.DemographicAnalytics = exports.DeviceData = exports.LocationData = exports.AgeGroupData = exports.DemographicDataPoint = exports.ImpressionAnalytics = exports.ConversionAnalytics = exports.RevenueAnalytics = exports.OrganicVsPaidPerformance = exports.ChannelMetrics = exports.ConversionFunnel = exports.ConversionRates = exports.ConversionFunnelStage = exports.DualChannelTimeSeriesPoint = exports.TimeSeriesDataPoint = exports.TopProduct = exports.AnalyticsSummary = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
let AnalyticsSummary = class AnalyticsSummary {
};
exports.AnalyticsSummary = AnalyticsSummary;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AnalyticsSummary.prototype, "totalRevenue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AnalyticsSummary.prototype, "totalOrders", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AnalyticsSummary.prototype, "totalViews", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AnalyticsSummary.prototype, "totalClicks", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AnalyticsSummary.prototype, "averageOrderValue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AnalyticsSummary.prototype, "overallConversionRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AnalyticsSummary.prototype, "overallClickThroughRate", void 0);
exports.AnalyticsSummary = AnalyticsSummary = __decorate([
    (0, graphql_1.ObjectType)()
], AnalyticsSummary);
let TopProduct = class TopProduct {
};
exports.TopProduct = TopProduct;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TopProduct.prototype, "productId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TopProduct.prototype, "productName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TopProduct.prototype, "productImage", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], TopProduct.prototype, "revenue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], TopProduct.prototype, "orders", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], TopProduct.prototype, "views", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], TopProduct.prototype, "clicks", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], TopProduct.prototype, "conversionRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], TopProduct.prototype, "clickThroughRate", void 0);
exports.TopProduct = TopProduct = __decorate([
    (0, graphql_1.ObjectType)()
], TopProduct);
let TimeSeriesDataPoint = class TimeSeriesDataPoint {
};
exports.TimeSeriesDataPoint = TimeSeriesDataPoint;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], TimeSeriesDataPoint.prototype, "date", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], TimeSeriesDataPoint.prototype, "value", void 0);
exports.TimeSeriesDataPoint = TimeSeriesDataPoint = __decorate([
    (0, graphql_1.ObjectType)()
], TimeSeriesDataPoint);
let DualChannelTimeSeriesPoint = class DualChannelTimeSeriesPoint {
};
exports.DualChannelTimeSeriesPoint = DualChannelTimeSeriesPoint;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], DualChannelTimeSeriesPoint.prototype, "date", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], DualChannelTimeSeriesPoint.prototype, "organic", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], DualChannelTimeSeriesPoint.prototype, "paid", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], DualChannelTimeSeriesPoint.prototype, "total", void 0);
exports.DualChannelTimeSeriesPoint = DualChannelTimeSeriesPoint = __decorate([
    (0, graphql_1.ObjectType)()
], DualChannelTimeSeriesPoint);
let ConversionFunnelStage = class ConversionFunnelStage {
};
exports.ConversionFunnelStage = ConversionFunnelStage;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ConversionFunnelStage.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ConversionFunnelStage.prototype, "count", void 0);
exports.ConversionFunnelStage = ConversionFunnelStage = __decorate([
    (0, graphql_1.ObjectType)()
], ConversionFunnelStage);
let ConversionRates = class ConversionRates {
};
exports.ConversionRates = ConversionRates;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ConversionRates.prototype, "viewToClickRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ConversionRates.prototype, "clickToCartRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ConversionRates.prototype, "cartToOrderRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ConversionRates.prototype, "abandonmentRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ConversionRates.prototype, "overallConversionRate", void 0);
exports.ConversionRates = ConversionRates = __decorate([
    (0, graphql_1.ObjectType)()
], ConversionRates);
let ConversionFunnel = class ConversionFunnel {
};
exports.ConversionFunnel = ConversionFunnel;
__decorate([
    (0, graphql_1.Field)(() => [ConversionFunnelStage]),
    __metadata("design:type", Array)
], ConversionFunnel.prototype, "stages", void 0);
__decorate([
    (0, graphql_1.Field)(() => ConversionRates),
    __metadata("design:type", ConversionRates)
], ConversionFunnel.prototype, "conversionRates", void 0);
exports.ConversionFunnel = ConversionFunnel = __decorate([
    (0, graphql_1.ObjectType)()
], ConversionFunnel);
let ChannelMetrics = class ChannelMetrics {
};
exports.ChannelMetrics = ChannelMetrics;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ChannelMetrics.prototype, "organic", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ChannelMetrics.prototype, "paid", void 0);
exports.ChannelMetrics = ChannelMetrics = __decorate([
    (0, graphql_1.ObjectType)()
], ChannelMetrics);
let OrganicVsPaidPerformance = class OrganicVsPaidPerformance {
};
exports.OrganicVsPaidPerformance = OrganicVsPaidPerformance;
__decorate([
    (0, graphql_1.Field)(() => ChannelMetrics),
    __metadata("design:type", ChannelMetrics)
], OrganicVsPaidPerformance.prototype, "impressions", void 0);
__decorate([
    (0, graphql_1.Field)(() => ChannelMetrics),
    __metadata("design:type", ChannelMetrics)
], OrganicVsPaidPerformance.prototype, "clicks", void 0);
__decorate([
    (0, graphql_1.Field)(() => ChannelMetrics),
    __metadata("design:type", ChannelMetrics)
], OrganicVsPaidPerformance.prototype, "conversionRates", void 0);
__decorate([
    (0, graphql_1.Field)(() => ChannelMetrics),
    __metadata("design:type", ChannelMetrics)
], OrganicVsPaidPerformance.prototype, "revenue", void 0);
exports.OrganicVsPaidPerformance = OrganicVsPaidPerformance = __decorate([
    (0, graphql_1.ObjectType)()
], OrganicVsPaidPerformance);
let RevenueAnalytics = class RevenueAnalytics {
};
exports.RevenueAnalytics = RevenueAnalytics;
__decorate([
    (0, graphql_1.Field)(() => [TimeSeriesDataPoint]),
    __metadata("design:type", Array)
], RevenueAnalytics.prototype, "weekly", void 0);
__decorate([
    (0, graphql_1.Field)(() => [TimeSeriesDataPoint]),
    __metadata("design:type", Array)
], RevenueAnalytics.prototype, "monthly", void 0);
__decorate([
    (0, graphql_1.Field)(() => [TimeSeriesDataPoint]),
    __metadata("design:type", Array)
], RevenueAnalytics.prototype, "quarterly", void 0);
__decorate([
    (0, graphql_1.Field)(() => [TimeSeriesDataPoint]),
    __metadata("design:type", Array)
], RevenueAnalytics.prototype, "yearly", void 0);
exports.RevenueAnalytics = RevenueAnalytics = __decorate([
    (0, graphql_1.ObjectType)()
], RevenueAnalytics);
let ConversionAnalytics = class ConversionAnalytics {
};
exports.ConversionAnalytics = ConversionAnalytics;
__decorate([
    (0, graphql_1.Field)(() => [TimeSeriesDataPoint]),
    __metadata("design:type", Array)
], ConversionAnalytics.prototype, "conversionRateOverTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => [TimeSeriesDataPoint]),
    __metadata("design:type", Array)
], ConversionAnalytics.prototype, "clickThroughRateOverTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => [TimeSeriesDataPoint]),
    __metadata("design:type", Array)
], ConversionAnalytics.prototype, "cartAbandonmentRateOverTime", void 0);
exports.ConversionAnalytics = ConversionAnalytics = __decorate([
    (0, graphql_1.ObjectType)()
], ConversionAnalytics);
let ImpressionAnalytics = class ImpressionAnalytics {
};
exports.ImpressionAnalytics = ImpressionAnalytics;
__decorate([
    (0, graphql_1.Field)(() => [DualChannelTimeSeriesPoint]),
    __metadata("design:type", Array)
], ImpressionAnalytics.prototype, "impressionsOverTime", void 0);
exports.ImpressionAnalytics = ImpressionAnalytics = __decorate([
    (0, graphql_1.ObjectType)()
], ImpressionAnalytics);
let DemographicDataPoint = class DemographicDataPoint {
};
exports.DemographicDataPoint = DemographicDataPoint;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DemographicDataPoint.prototype, "key", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], DemographicDataPoint.prototype, "value", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], DemographicDataPoint.prototype, "percentage", void 0);
exports.DemographicDataPoint = DemographicDataPoint = __decorate([
    (0, graphql_1.ObjectType)()
], DemographicDataPoint);
let AgeGroupData = class AgeGroupData {
};
exports.AgeGroupData = AgeGroupData;
__decorate([
    (0, graphql_1.Field)(() => [DemographicDataPoint]),
    __metadata("design:type", Array)
], AgeGroupData.prototype, "distribution", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], AgeGroupData.prototype, "averageAge", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], AgeGroupData.prototype, "dominantAgeGroup", void 0);
exports.AgeGroupData = AgeGroupData = __decorate([
    (0, graphql_1.ObjectType)()
], AgeGroupData);
let LocationData = class LocationData {
};
exports.LocationData = LocationData;
__decorate([
    (0, graphql_1.Field)(() => [DemographicDataPoint]),
    __metadata("design:type", Array)
], LocationData.prototype, "countries", void 0);
__decorate([
    (0, graphql_1.Field)(() => [DemographicDataPoint]),
    __metadata("design:type", Array)
], LocationData.prototype, "regions", void 0);
__decorate([
    (0, graphql_1.Field)(() => [DemographicDataPoint]),
    __metadata("design:type", Array)
], LocationData.prototype, "cities", void 0);
exports.LocationData = LocationData = __decorate([
    (0, graphql_1.ObjectType)()
], LocationData);
let DeviceData = class DeviceData {
};
exports.DeviceData = DeviceData;
__decorate([
    (0, graphql_1.Field)(() => [DemographicDataPoint]),
    __metadata("design:type", Array)
], DeviceData.prototype, "deviceTypes", void 0);
__decorate([
    (0, graphql_1.Field)(() => [DemographicDataPoint]),
    __metadata("design:type", Array)
], DeviceData.prototype, "browsers", void 0);
__decorate([
    (0, graphql_1.Field)(() => [DemographicDataPoint]),
    __metadata("design:type", Array)
], DeviceData.prototype, "operatingSystems", void 0);
exports.DeviceData = DeviceData = __decorate([
    (0, graphql_1.ObjectType)()
], DeviceData);
let DemographicAnalytics = class DemographicAnalytics {
};
exports.DemographicAnalytics = DemographicAnalytics;
__decorate([
    (0, graphql_1.Field)(() => AgeGroupData),
    __metadata("design:type", AgeGroupData)
], DemographicAnalytics.prototype, "ageGroups", void 0);
__decorate([
    (0, graphql_1.Field)(() => LocationData),
    __metadata("design:type", LocationData)
], DemographicAnalytics.prototype, "location", void 0);
__decorate([
    (0, graphql_1.Field)(() => DeviceData),
    __metadata("design:type", DeviceData)
], DemographicAnalytics.prototype, "devices", void 0);
__decorate([
    (0, graphql_1.Field)(() => [DemographicDataPoint]),
    __metadata("design:type", Array)
], DemographicAnalytics.prototype, "gender", void 0);
__decorate([
    (0, graphql_1.Field)(() => [DemographicDataPoint]),
    __metadata("design:type", Array)
], DemographicAnalytics.prototype, "interests", void 0);
exports.DemographicAnalytics = DemographicAnalytics = __decorate([
    (0, graphql_1.ObjectType)()
], DemographicAnalytics);
let MerchantDashboardAnalytics = class MerchantDashboardAnalytics {
};
exports.MerchantDashboardAnalytics = MerchantDashboardAnalytics;
__decorate([
    (0, graphql_1.Field)(() => AnalyticsSummary),
    __metadata("design:type", AnalyticsSummary)
], MerchantDashboardAnalytics.prototype, "summary", void 0);
__decorate([
    (0, graphql_1.Field)(() => [TopProduct]),
    __metadata("design:type", Array)
], MerchantDashboardAnalytics.prototype, "topProducts", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { deprecationReason: 'Use demographicAnalytics instead' }),
    __metadata("design:type", Object)
], MerchantDashboardAnalytics.prototype, "demographics", void 0);
__decorate([
    (0, graphql_1.Field)(() => [TimeSeriesDataPoint]),
    __metadata("design:type", Array)
], MerchantDashboardAnalytics.prototype, "performanceOverTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => ConversionFunnel),
    __metadata("design:type", ConversionFunnel)
], MerchantDashboardAnalytics.prototype, "conversionFunnel", void 0);
__decorate([
    (0, graphql_1.Field)(() => OrganicVsPaidPerformance),
    __metadata("design:type", OrganicVsPaidPerformance)
], MerchantDashboardAnalytics.prototype, "organicVsPaidPerformance", void 0);
__decorate([
    (0, graphql_1.Field)(() => RevenueAnalytics, { nullable: true }),
    __metadata("design:type", RevenueAnalytics)
], MerchantDashboardAnalytics.prototype, "revenueAnalytics", void 0);
__decorate([
    (0, graphql_1.Field)(() => ConversionAnalytics, { nullable: true }),
    __metadata("design:type", ConversionAnalytics)
], MerchantDashboardAnalytics.prototype, "conversionAnalytics", void 0);
__decorate([
    (0, graphql_1.Field)(() => ImpressionAnalytics, { nullable: true }),
    __metadata("design:type", ImpressionAnalytics)
], MerchantDashboardAnalytics.prototype, "impressionAnalytics", void 0);
__decorate([
    (0, graphql_1.Field)(() => DemographicAnalytics, { nullable: true }),
    __metadata("design:type", DemographicAnalytics)
], MerchantDashboardAnalytics.prototype, "demographicAnalytics", void 0);
exports.MerchantDashboardAnalytics = MerchantDashboardAnalytics = __decorate([
    (0, graphql_1.ObjectType)()
], MerchantDashboardAnalytics);
let PeriodMetrics = class PeriodMetrics {
};
exports.PeriodMetrics = PeriodMetrics;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], PeriodMetrics.prototype, "label", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], PeriodMetrics.prototype, "revenue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PeriodMetrics.prototype, "orders", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PeriodMetrics.prototype, "views", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], PeriodMetrics.prototype, "conversionRate", void 0);
exports.PeriodMetrics = PeriodMetrics = __decorate([
    (0, graphql_1.ObjectType)()
], PeriodMetrics);
let PeriodComparisonData = class PeriodComparisonData {
};
exports.PeriodComparisonData = PeriodComparisonData;
__decorate([
    (0, graphql_1.Field)(() => PeriodMetrics),
    __metadata("design:type", PeriodMetrics)
], PeriodComparisonData.prototype, "currentPeriod", void 0);
__decorate([
    (0, graphql_1.Field)(() => PeriodMetrics),
    __metadata("design:type", PeriodMetrics)
], PeriodComparisonData.prototype, "previousPeriod", void 0);
__decorate([
    (0, graphql_1.Field)(() => [TimeSeriesDataPoint]),
    __metadata("design:type", Array)
], PeriodComparisonData.prototype, "currentPeriodTimeSeries", void 0);
__decorate([
    (0, graphql_1.Field)(() => [TimeSeriesDataPoint]),
    __metadata("design:type", Array)
], PeriodComparisonData.prototype, "previousPeriodTimeSeries", void 0);
exports.PeriodComparisonData = PeriodComparisonData = __decorate([
    (0, graphql_1.ObjectType)()
], PeriodComparisonData);
//# sourceMappingURL=analytics-dashboard.type.js.map