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
exports.PersonalizationMetricsDto = exports.CategoryPercentageDto = exports.HistoricalDataDto = exports.MetricComparisonDto = void 0;
const graphql_1 = require("@nestjs/graphql");
let MetricComparisonDto = class MetricComparisonDto {
};
exports.MetricComparisonDto = MetricComparisonDto;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MetricComparisonDto.prototype, "personalized", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MetricComparisonDto.prototype, "nonPersonalized", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MetricComparisonDto.prototype, "improvement", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MetricComparisonDto.prototype, "trend", void 0);
exports.MetricComparisonDto = MetricComparisonDto = __decorate([
    (0, graphql_1.ObjectType)()
], MetricComparisonDto);
let HistoricalDataDto = class HistoricalDataDto {
};
exports.HistoricalDataDto = HistoricalDataDto;
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], HistoricalDataDto.prototype, "dates", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.Float]),
    __metadata("design:type", Array)
], HistoricalDataDto.prototype, "personalized", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.Float]),
    __metadata("design:type", Array)
], HistoricalDataDto.prototype, "nonPersonalized", void 0);
exports.HistoricalDataDto = HistoricalDataDto = __decorate([
    (0, graphql_1.ObjectType)()
], HistoricalDataDto);
let CategoryPercentageDto = class CategoryPercentageDto {
};
exports.CategoryPercentageDto = CategoryPercentageDto;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CategoryPercentageDto.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CategoryPercentageDto.prototype, "percentage", void 0);
exports.CategoryPercentageDto = CategoryPercentageDto = __decorate([
    (0, graphql_1.ObjectType)()
], CategoryPercentageDto);
let PersonalizationMetricsDto = class PersonalizationMetricsDto {
};
exports.PersonalizationMetricsDto = PersonalizationMetricsDto;
__decorate([
    (0, graphql_1.Field)(() => MetricComparisonDto),
    __metadata("design:type", MetricComparisonDto)
], PersonalizationMetricsDto.prototype, "conversionRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => MetricComparisonDto),
    __metadata("design:type", MetricComparisonDto)
], PersonalizationMetricsDto.prototype, "clickThroughRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => MetricComparisonDto),
    __metadata("design:type", MetricComparisonDto)
], PersonalizationMetricsDto.prototype, "averageOrderValue", void 0);
__decorate([
    (0, graphql_1.Field)(() => MetricComparisonDto),
    __metadata("design:type", MetricComparisonDto)
], PersonalizationMetricsDto.prototype, "timeOnSite", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], PersonalizationMetricsDto.prototype, "recommendationAccuracy", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], PersonalizationMetricsDto.prototype, "userSatisfaction", void 0);
__decorate([
    (0, graphql_1.Field)(() => HistoricalDataDto),
    __metadata("design:type", HistoricalDataDto)
], PersonalizationMetricsDto.prototype, "historicalData", void 0);
__decorate([
    (0, graphql_1.Field)(() => [CategoryPercentageDto]),
    __metadata("design:type", Array)
], PersonalizationMetricsDto.prototype, "topRecommendationCategories", void 0);
exports.PersonalizationMetricsDto = PersonalizationMetricsDto = __decorate([
    (0, graphql_1.ObjectType)()
], PersonalizationMetricsDto);
//# sourceMappingURL=personalization-metrics.dto.js.map