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
exports.MerchantAnalyticsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const merchant_analytics_service_1 = require("../services/merchant-analytics.service");
const merchant_service_1 = require("../services/merchant.service");
const merchant_analytics_entity_1 = require("../entities/merchant-analytics.entity");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const merchant_only_decorator_1 = require("../../auth/decorators/merchant-only.decorator");
const user_entity_1 = require("../../users/entities/user.entity");
const graphql_2 = require("@nestjs/graphql");
let MerchantAnalyticsResolver = class MerchantAnalyticsResolver {
    constructor(analyticsService, merchantService) {
        this.analyticsService = analyticsService;
        this.merchantService = merchantService;
    }
    async merchantAnalytics(merchantId, user, timeFrame, startDate, endDate, productId, categoryId) {
        await this.validateMerchantAccess(user, merchantId);
        return this.analyticsService.getAnalytics(merchantId, timeFrame, startDate, endDate, productId, categoryId);
    }
    async merchantProductAnalytics(merchantId, productId, user, timeFrame, startDate, endDate) {
        await this.validateMerchantAccess(user, merchantId);
        return this.analyticsService.getProductAnalytics(merchantId, productId, timeFrame, startDate, endDate);
    }
    async merchantCategoryAnalytics(merchantId, categoryId, user, timeFrame, startDate, endDate) {
        await this.validateMerchantAccess(user, merchantId);
        return this.analyticsService.getCategoryAnalytics(merchantId, categoryId, timeFrame, startDate, endDate);
    }
    async merchantOverallAnalytics(merchantId, user, timeFrame, startDate, endDate) {
        await this.validateMerchantAccess(user, merchantId);
        return this.analyticsService.getOverallAnalytics(merchantId, timeFrame, startDate, endDate);
    }
    async merchantDemographicData(merchantId, timeFrame, user) {
        await this.validateMerchantAccess(user, merchantId);
        return this.analyticsService.getDemographicData(merchantId, timeFrame);
    }
    async merchantTopProducts(merchantId, limit, timeFrame, user) {
        await this.validateMerchantAccess(user, merchantId);
        return this.analyticsService.getTopProducts(merchantId, limit, timeFrame);
    }
    async validateMerchantAccess(user, merchantId) {
        if (user.role === user_entity_1.UserRole.ADMIN) {
            return;
        }
        const merchants = await this.merchantService.findByUserId(user.id);
        const hasAccess = merchants.some(m => m.id === merchantId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have permission to access this merchant');
        }
    }
};
exports.MerchantAnalyticsResolver = MerchantAnalyticsResolver;
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Query)(() => [merchant_analytics_entity_1.MerchantAnalytics]),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, graphql_1.Args)('timeFrame', { defaultValue: 'monthly' })),
    __param(3, (0, graphql_1.Args)('startDate', { type: () => graphql_2.GraphQLISODateTime, nullable: true })),
    __param(4, (0, graphql_1.Args)('endDate', { type: () => graphql_2.GraphQLISODateTime, nullable: true })),
    __param(5, (0, graphql_1.Args)('productId', { type: () => graphql_1.ID, nullable: true })),
    __param(6, (0, graphql_1.Args)('categoryId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User, String, Date,
        Date, String, String]),
    __metadata("design:returntype", Promise)
], MerchantAnalyticsResolver.prototype, "merchantAnalytics", null);
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Query)(() => [merchant_analytics_entity_1.MerchantAnalytics]),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('productId', { type: () => graphql_1.ID })),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, graphql_1.Args)('timeFrame', { defaultValue: 'monthly' })),
    __param(4, (0, graphql_1.Args)('startDate', { type: () => graphql_2.GraphQLISODateTime, nullable: true })),
    __param(5, (0, graphql_1.Args)('endDate', { type: () => graphql_2.GraphQLISODateTime, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_1.User, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], MerchantAnalyticsResolver.prototype, "merchantProductAnalytics", null);
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Query)(() => [merchant_analytics_entity_1.MerchantAnalytics]),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('categoryId', { type: () => graphql_1.ID })),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, graphql_1.Args)('timeFrame', { defaultValue: 'monthly' })),
    __param(4, (0, graphql_1.Args)('startDate', { type: () => graphql_2.GraphQLISODateTime, nullable: true })),
    __param(5, (0, graphql_1.Args)('endDate', { type: () => graphql_2.GraphQLISODateTime, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_1.User, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], MerchantAnalyticsResolver.prototype, "merchantCategoryAnalytics", null);
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Query)(() => [merchant_analytics_entity_1.MerchantAnalytics]),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, graphql_1.Args)('timeFrame', { defaultValue: 'monthly' })),
    __param(3, (0, graphql_1.Args)('startDate', { type: () => graphql_2.GraphQLISODateTime, nullable: true })),
    __param(4, (0, graphql_1.Args)('endDate', { type: () => graphql_2.GraphQLISODateTime, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], MerchantAnalyticsResolver.prototype, "merchantOverallAnalytics", null);
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Query)(() => Object),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('timeFrame', { defaultValue: 'monthly' })),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MerchantAnalyticsResolver.prototype, "merchantDemographicData", null);
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Query)(() => [Object]),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('limit', { defaultValue: 10 })),
    __param(2, (0, graphql_1.Args)('timeFrame', { defaultValue: 'monthly' })),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MerchantAnalyticsResolver.prototype, "merchantTopProducts", null);
exports.MerchantAnalyticsResolver = MerchantAnalyticsResolver = __decorate([
    (0, graphql_1.Resolver)(() => merchant_analytics_entity_1.MerchantAnalytics),
    __metadata("design:paramtypes", [merchant_analytics_service_1.MerchantAnalyticsService,
        merchant_service_1.MerchantService])
], MerchantAnalyticsResolver);
//# sourceMappingURL=merchant-analytics.resolver.js.map