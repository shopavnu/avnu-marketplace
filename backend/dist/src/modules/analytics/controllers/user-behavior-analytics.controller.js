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
exports.UserBehaviorAnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const user_behavior_analytics_service_1 = require("../services/user-behavior-analytics.service");
const admin_guard_1 = require("../../auth/guards/admin.guard");
const scroll_analytics_entity_1 = require("../entities/scroll-analytics.entity");
const heatmap_data_entity_1 = require("../entities/heatmap-data.entity");
let UserBehaviorAnalyticsController = class UserBehaviorAnalyticsController {
    constructor(userBehaviorAnalyticsService) {
        this.userBehaviorAnalyticsService = userBehaviorAnalyticsService;
    }
    async trackScrolling(data) {
        return this.userBehaviorAnalyticsService.trackScrolling(data);
    }
    async trackHeatmapData(data) {
        return this.userBehaviorAnalyticsService.trackHeatmapData(data);
    }
    async trackBatchHeatmapData(dataItems) {
        return this.userBehaviorAnalyticsService.trackBatchHeatmapData(dataItems);
    }
    async getVerticalScrollingAnalytics(period) {
        return this.userBehaviorAnalyticsService.getVerticalScrollingAnalytics(period || 30);
    }
    async getHeatmapAnalytics(pagePath, period, interactionType) {
        return this.userBehaviorAnalyticsService.getHeatmapAnalytics(pagePath, period || 30, interactionType);
    }
    async getVerticalNavigationFunnel(period) {
        return this.userBehaviorAnalyticsService.getVerticalNavigationFunnel(period || 30);
    }
};
exports.UserBehaviorAnalyticsController = UserBehaviorAnalyticsController;
__decorate([
    (0, common_1.Post)('scroll'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Track vertical scrolling patterns' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Scrolling patterns tracked successfully',
    }),
    (0, swagger_1.ApiBody)({ type: scroll_analytics_entity_1.ScrollAnalytics }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserBehaviorAnalyticsController.prototype, "trackScrolling", null);
__decorate([
    (0, common_1.Post)('heatmap'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Track heatmap data' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Heatmap data tracked successfully' }),
    (0, swagger_1.ApiBody)({ type: heatmap_data_entity_1.HeatmapData }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserBehaviorAnalyticsController.prototype, "trackHeatmapData", null);
__decorate([
    (0, common_1.Post)('heatmap/batch'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Track batch heatmap data' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Batch heatmap data tracked successfully',
    }),
    (0, swagger_1.ApiBody)({ type: [heatmap_data_entity_1.HeatmapData] }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], UserBehaviorAnalyticsController.prototype, "trackBatchHeatmapData", null);
__decorate([
    (0, common_1.Get)('scroll'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get vertical scrolling analytics' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Vertical scrolling analytics retrieved successfully',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'period',
        required: false,
        type: Number,
        description: 'Period in days (default: 30)',
    }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserBehaviorAnalyticsController.prototype, "getVerticalScrollingAnalytics", null);
__decorate([
    (0, common_1.Get)('heatmap'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get heatmap analytics' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Heatmap analytics retrieved successfully' }),
    (0, swagger_1.ApiQuery)({
        name: 'pagePath',
        required: true,
        type: String,
        description: 'Page path to get heatmap data for',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'period',
        required: false,
        type: Number,
        description: 'Period in days (default: 30)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'interactionType',
        required: false,
        enum: heatmap_data_entity_1.InteractionType,
        description: 'Interaction type filter',
    }),
    __param(0, (0, common_1.Query)('pagePath')),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Query)('interactionType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], UserBehaviorAnalyticsController.prototype, "getHeatmapAnalytics", null);
__decorate([
    (0, common_1.Get)('vertical-funnel'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get vertical navigation conversion funnel' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Vertical navigation funnel retrieved successfully',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'period',
        required: false,
        type: Number,
        description: 'Period in days (default: 30)',
    }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserBehaviorAnalyticsController.prototype, "getVerticalNavigationFunnel", null);
exports.UserBehaviorAnalyticsController = UserBehaviorAnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('user-behavior-analytics'),
    (0, common_1.Controller)('analytics/user-behavior'),
    __metadata("design:paramtypes", [user_behavior_analytics_service_1.UserBehaviorAnalyticsService])
], UserBehaviorAnalyticsController);
//# sourceMappingURL=user-behavior-analytics.controller.js.map