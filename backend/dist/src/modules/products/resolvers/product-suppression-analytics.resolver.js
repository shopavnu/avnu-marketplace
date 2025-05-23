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
exports.ProductSuppressionAnalyticsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const user_entity_1 = require("../../users/entities/user.entity");
const product_suppression_analytics_service_1 = require("../services/product-suppression-analytics.service");
let ProductSuppressionAnalyticsResolver = class ProductSuppressionAnalyticsResolver {
    constructor(productSuppressionAnalyticsService) {
        this.productSuppressionAnalyticsService = productSuppressionAnalyticsService;
    }
    async suppressionMetrics(period, merchantId) {
        return this.productSuppressionAnalyticsService.getSuppressionMetrics(period, merchantId);
    }
};
exports.ProductSuppressionAnalyticsResolver = ProductSuppressionAnalyticsResolver;
__decorate([
    (0, graphql_1.Query)(() => SuppressionMetricsResponse),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('period', { type: () => graphql_1.Int, nullable: true })),
    __param(1, (0, graphql_1.Args)('merchantId', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ProductSuppressionAnalyticsResolver.prototype, "suppressionMetrics", null);
exports.ProductSuppressionAnalyticsResolver = ProductSuppressionAnalyticsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [product_suppression_analytics_service_1.ProductSuppressionAnalyticsService])
], ProductSuppressionAnalyticsResolver);
const graphql_2 = require("@nestjs/graphql");
let SuppressionOverview = class SuppressionOverview {
};
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], SuppressionOverview.prototype, "totalSuppressedProducts", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], SuppressionOverview.prototype, "totalActiveSuppressedProducts", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], SuppressionOverview.prototype, "totalResolvedSuppressions", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Float),
    __metadata("design:type", Number)
], SuppressionOverview.prototype, "avgResolutionTimeHours", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Float),
    __metadata("design:type", Number)
], SuppressionOverview.prototype, "suppressionRate", void 0);
SuppressionOverview = __decorate([
    (0, graphql_2.ObjectType)()
], SuppressionOverview);
let MerchantSuppressionMetrics = class MerchantSuppressionMetrics {
};
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], MerchantSuppressionMetrics.prototype, "merchantId", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], MerchantSuppressionMetrics.prototype, "merchantName", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], MerchantSuppressionMetrics.prototype, "suppressedCount", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], MerchantSuppressionMetrics.prototype, "resolvedCount", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Float),
    __metadata("design:type", Number)
], MerchantSuppressionMetrics.prototype, "avgResolutionTimeHours", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Float),
    __metadata("design:type", Number)
], MerchantSuppressionMetrics.prototype, "suppressionRate", void 0);
MerchantSuppressionMetrics = __decorate([
    (0, graphql_2.ObjectType)()
], MerchantSuppressionMetrics);
let CategorySuppressionMetrics = class CategorySuppressionMetrics {
};
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], CategorySuppressionMetrics.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], CategorySuppressionMetrics.prototype, "categoryName", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], CategorySuppressionMetrics.prototype, "suppressedCount", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], CategorySuppressionMetrics.prototype, "resolvedCount", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Float),
    __metadata("design:type", Number)
], CategorySuppressionMetrics.prototype, "avgResolutionTimeHours", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Float),
    __metadata("design:type", Number)
], CategorySuppressionMetrics.prototype, "suppressionRate", void 0);
CategorySuppressionMetrics = __decorate([
    (0, graphql_2.ObjectType)()
], CategorySuppressionMetrics);
let TimeframeSuppressionMetrics = class TimeframeSuppressionMetrics {
};
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], TimeframeSuppressionMetrics.prototype, "date", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], TimeframeSuppressionMetrics.prototype, "suppressedCount", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], TimeframeSuppressionMetrics.prototype, "resolvedCount", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Float),
    __metadata("design:type", Number)
], TimeframeSuppressionMetrics.prototype, "avgResolutionTimeHours", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Float),
    __metadata("design:type", Number)
], TimeframeSuppressionMetrics.prototype, "suppressionRate", void 0);
TimeframeSuppressionMetrics = __decorate([
    (0, graphql_2.ObjectType)()
], TimeframeSuppressionMetrics);
let ResolutionTimeDistribution = class ResolutionTimeDistribution {
};
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], ResolutionTimeDistribution.prototype, "timeRange", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], ResolutionTimeDistribution.prototype, "count", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Float),
    __metadata("design:type", Number)
], ResolutionTimeDistribution.prototype, "percentage", void 0);
ResolutionTimeDistribution = __decorate([
    (0, graphql_2.ObjectType)()
], ResolutionTimeDistribution);
let SuppressionMetricsResponse = class SuppressionMetricsResponse {
};
__decorate([
    (0, graphql_2.Field)(() => SuppressionOverview),
    __metadata("design:type", SuppressionOverview)
], SuppressionMetricsResponse.prototype, "overview", void 0);
__decorate([
    (0, graphql_2.Field)(() => [MerchantSuppressionMetrics]),
    __metadata("design:type", Array)
], SuppressionMetricsResponse.prototype, "byMerchant", void 0);
__decorate([
    (0, graphql_2.Field)(() => [CategorySuppressionMetrics]),
    __metadata("design:type", Array)
], SuppressionMetricsResponse.prototype, "byCategory", void 0);
__decorate([
    (0, graphql_2.Field)(() => [TimeframeSuppressionMetrics]),
    __metadata("design:type", Array)
], SuppressionMetricsResponse.prototype, "byTimeframe", void 0);
__decorate([
    (0, graphql_2.Field)(() => [ResolutionTimeDistribution]),
    __metadata("design:type", Array)
], SuppressionMetricsResponse.prototype, "resolutionTimeDistribution", void 0);
SuppressionMetricsResponse = __decorate([
    (0, graphql_2.ObjectType)()
], SuppressionMetricsResponse);
//# sourceMappingURL=product-suppression-analytics.resolver.js.map