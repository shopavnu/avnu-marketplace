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
exports.AnonymousUserMetricsDto = exports.TimeframeMetricsDto = exports.SearchTermDto = exports.BrandPreferenceDto = exports.CategoryPreferenceDto = exports.InteractionTypeMetricsDto = exports.AnonymousUserOverviewDto = void 0;
const graphql_1 = require("@nestjs/graphql");
let AnonymousUserOverviewDto = class AnonymousUserOverviewDto {
};
exports.AnonymousUserOverviewDto = AnonymousUserOverviewDto;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AnonymousUserOverviewDto.prototype, "totalAnonymousUsers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AnonymousUserOverviewDto.prototype, "activeAnonymousUsers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AnonymousUserOverviewDto.prototype, "conversionRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AnonymousUserOverviewDto.prototype, "avgSessionDuration", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AnonymousUserOverviewDto.prototype, "returningUserRate", void 0);
exports.AnonymousUserOverviewDto = AnonymousUserOverviewDto = __decorate([
    (0, graphql_1.ObjectType)()
], AnonymousUserOverviewDto);
let InteractionTypeMetricsDto = class InteractionTypeMetricsDto {
};
exports.InteractionTypeMetricsDto = InteractionTypeMetricsDto;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], InteractionTypeMetricsDto.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], InteractionTypeMetricsDto.prototype, "count", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], InteractionTypeMetricsDto.prototype, "percentage", void 0);
exports.InteractionTypeMetricsDto = InteractionTypeMetricsDto = __decorate([
    (0, graphql_1.ObjectType)()
], InteractionTypeMetricsDto);
let CategoryPreferenceDto = class CategoryPreferenceDto {
};
exports.CategoryPreferenceDto = CategoryPreferenceDto;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CategoryPreferenceDto.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CategoryPreferenceDto.prototype, "categoryName", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CategoryPreferenceDto.prototype, "weight", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CategoryPreferenceDto.prototype, "interactionCount", void 0);
exports.CategoryPreferenceDto = CategoryPreferenceDto = __decorate([
    (0, graphql_1.ObjectType)()
], CategoryPreferenceDto);
let BrandPreferenceDto = class BrandPreferenceDto {
};
exports.BrandPreferenceDto = BrandPreferenceDto;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BrandPreferenceDto.prototype, "brandId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BrandPreferenceDto.prototype, "brandName", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], BrandPreferenceDto.prototype, "weight", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BrandPreferenceDto.prototype, "interactionCount", void 0);
exports.BrandPreferenceDto = BrandPreferenceDto = __decorate([
    (0, graphql_1.ObjectType)()
], BrandPreferenceDto);
let SearchTermDto = class SearchTermDto {
};
exports.SearchTermDto = SearchTermDto;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SearchTermDto.prototype, "query", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SearchTermDto.prototype, "count", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], SearchTermDto.prototype, "conversionRate", void 0);
exports.SearchTermDto = SearchTermDto = __decorate([
    (0, graphql_1.ObjectType)()
], SearchTermDto);
let TimeframeMetricsDto = class TimeframeMetricsDto {
};
exports.TimeframeMetricsDto = TimeframeMetricsDto;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TimeframeMetricsDto.prototype, "date", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], TimeframeMetricsDto.prototype, "anonymousUsers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], TimeframeMetricsDto.prototype, "newUsers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], TimeframeMetricsDto.prototype, "returningUsers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], TimeframeMetricsDto.prototype, "avgSessionDuration", void 0);
exports.TimeframeMetricsDto = TimeframeMetricsDto = __decorate([
    (0, graphql_1.ObjectType)()
], TimeframeMetricsDto);
let AnonymousUserMetricsDto = class AnonymousUserMetricsDto {
};
exports.AnonymousUserMetricsDto = AnonymousUserMetricsDto;
__decorate([
    (0, graphql_1.Field)(() => AnonymousUserOverviewDto),
    __metadata("design:type", AnonymousUserOverviewDto)
], AnonymousUserMetricsDto.prototype, "overview", void 0);
__decorate([
    (0, graphql_1.Field)(() => [InteractionTypeMetricsDto]),
    __metadata("design:type", Array)
], AnonymousUserMetricsDto.prototype, "interactionsByType", void 0);
__decorate([
    (0, graphql_1.Field)(() => [CategoryPreferenceDto]),
    __metadata("design:type", Array)
], AnonymousUserMetricsDto.prototype, "topCategoryPreferences", void 0);
__decorate([
    (0, graphql_1.Field)(() => [BrandPreferenceDto]),
    __metadata("design:type", Array)
], AnonymousUserMetricsDto.prototype, "topBrandPreferences", void 0);
__decorate([
    (0, graphql_1.Field)(() => [SearchTermDto]),
    __metadata("design:type", Array)
], AnonymousUserMetricsDto.prototype, "topSearchTerms", void 0);
__decorate([
    (0, graphql_1.Field)(() => [TimeframeMetricsDto]),
    __metadata("design:type", Array)
], AnonymousUserMetricsDto.prototype, "byTimeframe", void 0);
exports.AnonymousUserMetricsDto = AnonymousUserMetricsDto = __decorate([
    (0, graphql_1.ObjectType)()
], AnonymousUserMetricsDto);
//# sourceMappingURL=anonymous-user-metrics.dto.js.map