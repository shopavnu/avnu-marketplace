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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const analytics_service_1 = require("./services/analytics.service");
const search_analytics_service_1 = require("./services/search-analytics.service");
const user_engagement_service_1 = require("./services/user-engagement.service");
const business_metrics_service_1 = require("./services/business-metrics.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const business_metrics_entity_1 = require("./entities/business-metrics.entity");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService, searchAnalyticsService, userEngagementService, businessMetricsService) {
        this.analyticsService = analyticsService;
        this.searchAnalyticsService = searchAnalyticsService;
        this.userEngagementService = userEngagementService;
        this.businessMetricsService = businessMetricsService;
    }
    async trackSearch(data) {
        return this.analyticsService.trackSearch(data);
    }
    async trackEngagement(data) {
        return this.analyticsService.trackEngagement(data);
    }
    async trackPageView(body) {
        return this.userEngagementService.trackPageView(body.userId || null, body.sessionId, body.pagePath, body.referrer, body.deviceType, body.platform, body.userAgent, body.ipAddress);
    }
    async trackProductView(body) {
        return this.userEngagementService.trackProductView(body.userId || null, body.sessionId, body.productId, body.pagePath, body.referrer, body.deviceType, body.platform);
    }
    async trackAddToCart(body) {
        return this.userEngagementService.trackAddToCart(body.userId || null, body.sessionId, body.productId, body.quantity, body.pagePath, body.deviceType, body.platform);
    }
    async trackCheckoutComplete(body) {
        await this.analyticsService.trackOrder(body.orderId, body.userId || null, body.sessionId, body.orderItems, body.totalAmount, body.merchantId);
        return { success: true };
    }
    async getDashboardAnalytics(period = 30) {
        return this.analyticsService.getDashboardAnalytics(period);
    }
    async getSearchAnalytics(period = 30) {
        return this.analyticsService.getSearchAnalytics(period);
    }
    async getTopSearchQueries(limit = 10, period = 30) {
        return this.searchAnalyticsService.getTopSearchQueries(limit, period);
    }
    async getZeroResultQueries(limit = 10, period = 30) {
        return this.searchAnalyticsService.getZeroResultQueries(limit, period);
    }
    async getNlpVsRegularSearchAnalytics(period = 30) {
        return this.searchAnalyticsService.getNlpVsRegularSearchAnalytics(period);
    }
    async getPersonalizedVsRegularSearchAnalytics(period = 30) {
        return this.searchAnalyticsService.getPersonalizedVsRegularSearchAnalytics(period);
    }
    async getUserEngagementAnalytics(period = 30) {
        return this.analyticsService.getUserEngagementAnalytics(period);
    }
    async getUserEngagementByType(period = 30) {
        return this.userEngagementService.getUserEngagementByType(period);
    }
    async getTopViewedProducts(limit = 10, period = 30) {
        return this.userEngagementService.getTopViewedProducts(limit, period);
    }
    async getUserEngagementFunnel(period = 30) {
        return this.userEngagementService.getUserEngagementFunnel(period);
    }
    async getBusinessMetricsAnalytics(period = 30) {
        return this.analyticsService.getBusinessMetricsAnalytics(period);
    }
    async getBusinessMetricsSummary(period = 30) {
        return this.businessMetricsService.getMetricsSummary(period);
    }
    async getRevenueMetrics(period = 30, granularity = business_metrics_entity_1.TimeGranularity.DAILY) {
        return this.businessMetricsService.getRevenueMetrics(period, granularity);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Post)('track/search'),
    (0, swagger_1.ApiOperation)({ summary: 'Track search query' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Search query tracked successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "trackSearch", null);
__decorate([
    (0, common_1.Post)('track/engagement'),
    (0, swagger_1.ApiOperation)({ summary: 'Track user engagement' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User engagement tracked successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "trackEngagement", null);
__decorate([
    (0, common_1.Post)('track/page-view'),
    (0, swagger_1.ApiOperation)({ summary: 'Track page view' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Page view tracked successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "trackPageView", null);
__decorate([
    (0, common_1.Post)('track/product-view'),
    (0, swagger_1.ApiOperation)({ summary: 'Track product view' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Product view tracked successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "trackProductView", null);
__decorate([
    (0, common_1.Post)('track/add-to-cart'),
    (0, swagger_1.ApiOperation)({ summary: 'Track add to cart' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Add to cart tracked successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "trackAddToCart", null);
__decorate([
    (0, common_1.Post)('track/checkout-complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Track checkout complete' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Checkout complete tracked successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "trackCheckoutComplete", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard analytics retrieved successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDashboardAnalytics", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get search analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Search analytics retrieved successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSearchAnalytics", null);
__decorate([
    (0, common_1.Get)('search/top-queries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get top search queries' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Top search queries retrieved successfully' }),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTopSearchQueries", null);
__decorate([
    (0, common_1.Get)('search/zero-result-queries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get zero result search queries' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Zero result search queries retrieved successfully' }),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getZeroResultQueries", null);
__decorate([
    (0, common_1.Get)('search/nlp-comparison'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get NLP vs regular search analytics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'NLP vs regular search analytics retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getNlpVsRegularSearchAnalytics", null);
__decorate([
    (0, common_1.Get)('search/personalization-comparison'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get personalized vs regular search analytics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Personalized vs regular search analytics retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getPersonalizedVsRegularSearchAnalytics", null);
__decorate([
    (0, common_1.Get)('engagement'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user engagement analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User engagement analytics retrieved successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getUserEngagementAnalytics", null);
__decorate([
    (0, common_1.Get)('engagement/by-type'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user engagement by type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User engagement by type retrieved successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getUserEngagementByType", null);
__decorate([
    (0, common_1.Get)('engagement/top-products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get top viewed products' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Top viewed products retrieved successfully' }),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTopViewedProducts", null);
__decorate([
    (0, common_1.Get)('engagement/funnel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user engagement funnel' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User engagement funnel retrieved successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getUserEngagementFunnel", null);
__decorate([
    (0, common_1.Get)('business'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get business metrics analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Business metrics analytics retrieved successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getBusinessMetricsAnalytics", null);
__decorate([
    (0, common_1.Get)('business/summary'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get business metrics summary' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Business metrics summary retrieved successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getBusinessMetricsSummary", null);
__decorate([
    (0, common_1.Get)('business/revenue'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get revenue metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Revenue metrics retrieved successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('granularity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getRevenueMetrics", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('analytics'),
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService,
        search_analytics_service_1.SearchAnalyticsService,
        user_engagement_service_1.UserEngagementService,
        business_metrics_service_1.BusinessMetricsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map