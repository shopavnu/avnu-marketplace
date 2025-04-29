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
exports.MerchantAdMetrics = exports.HistoricalMetricPoint = exports.AdCampaign = exports.AdPerformanceMetric = void 0;
const graphql_1 = require("@nestjs/graphql");
let AdPerformanceMetric = class AdPerformanceMetric {
};
exports.AdPerformanceMetric = AdPerformanceMetric;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdPerformanceMetric.prototype, "date", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AdPerformanceMetric.prototype, "impressions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AdPerformanceMetric.prototype, "clicks", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AdPerformanceMetric.prototype, "clickThroughRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AdPerformanceMetric.prototype, "conversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AdPerformanceMetric.prototype, "conversionRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AdPerformanceMetric.prototype, "revenue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AdPerformanceMetric.prototype, "cost", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AdPerformanceMetric.prototype, "roi", void 0);
exports.AdPerformanceMetric = AdPerformanceMetric = __decorate([
    (0, graphql_1.ObjectType)()
], AdPerformanceMetric);
let AdCampaign = class AdCampaign {
};
exports.AdCampaign = AdCampaign;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdCampaign.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdCampaign.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdCampaign.prototype, "merchantId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdCampaign.prototype, "merchantName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdCampaign.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdCampaign.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AdCampaign.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AdCampaign.prototype, "totalImpressions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AdCampaign.prototype, "totalClicks", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AdCampaign.prototype, "clickThroughRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AdCampaign.prototype, "totalConversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AdCampaign.prototype, "conversionRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AdCampaign.prototype, "totalRevenue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AdCampaign.prototype, "totalCost", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AdCampaign.prototype, "roi", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AdPerformanceMetric]),
    __metadata("design:type", Array)
], AdCampaign.prototype, "dailyMetrics", void 0);
exports.AdCampaign = AdCampaign = __decorate([
    (0, graphql_1.ObjectType)()
], AdCampaign);
let HistoricalMetricPoint = class HistoricalMetricPoint {
};
exports.HistoricalMetricPoint = HistoricalMetricPoint;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], HistoricalMetricPoint.prototype, "date", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], HistoricalMetricPoint.prototype, "totalRevenue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], HistoricalMetricPoint.prototype, "totalCost", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], HistoricalMetricPoint.prototype, "platformAdRevenue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], HistoricalMetricPoint.prototype, "productSalesFromAds", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], HistoricalMetricPoint.prototype, "totalImpressions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], HistoricalMetricPoint.prototype, "totalClicks", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], HistoricalMetricPoint.prototype, "totalConversions", void 0);
exports.HistoricalMetricPoint = HistoricalMetricPoint = __decorate([
    (0, graphql_1.ObjectType)()
], HistoricalMetricPoint);
let MerchantAdMetrics = class MerchantAdMetrics {
};
exports.MerchantAdMetrics = MerchantAdMetrics;
__decorate([
    (0, graphql_1.Field)(() => [AdCampaign]),
    __metadata("design:type", Array)
], MerchantAdMetrics.prototype, "campaigns", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MerchantAdMetrics.prototype, "totalRevenue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MerchantAdMetrics.prototype, "totalCost", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MerchantAdMetrics.prototype, "totalRoi", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MerchantAdMetrics.prototype, "totalImpressions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MerchantAdMetrics.prototype, "totalClicks", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MerchantAdMetrics.prototype, "averageClickThroughRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MerchantAdMetrics.prototype, "totalConversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MerchantAdMetrics.prototype, "averageConversionRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MerchantAdMetrics.prototype, "platformAdRevenue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MerchantAdMetrics.prototype, "productSalesFromAds", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MerchantAdMetrics.prototype, "returnOnAdSpend", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MerchantAdMetrics.prototype, "averageConversionValue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MerchantAdMetrics.prototype, "costPerAcquisition", void 0);
__decorate([
    (0, graphql_1.Field)(() => [HistoricalMetricPoint]),
    __metadata("design:type", Array)
], MerchantAdMetrics.prototype, "historicalMetrics", void 0);
exports.MerchantAdMetrics = MerchantAdMetrics = __decorate([
    (0, graphql_1.ObjectType)()
], MerchantAdMetrics);
//# sourceMappingURL=merchant-ad-metrics.dto.js.map