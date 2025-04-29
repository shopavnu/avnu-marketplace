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
exports.UserBehaviorAnalyticsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const user_behavior_analytics_service_1 = require("../services/user-behavior-analytics.service");
const admin_guard_1 = require("../../auth/guards/admin.guard");
const scroll_analytics_entity_1 = require("../entities/scroll-analytics.entity");
const heatmap_data_entity_1 = require("../entities/heatmap-data.entity");
let UserBehaviorAnalyticsResolver = class UserBehaviorAnalyticsResolver {
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
    async verticalScrollingAnalytics(period) {
        return this.userBehaviorAnalyticsService.getVerticalScrollingAnalytics(period);
    }
    async heatmapAnalytics(pagePath, period, interactionType) {
        return this.userBehaviorAnalyticsService.getHeatmapAnalytics(pagePath, period, interactionType);
    }
    async verticalNavigationFunnel(period) {
        return this.userBehaviorAnalyticsService.getVerticalNavigationFunnel(period);
    }
};
exports.UserBehaviorAnalyticsResolver = UserBehaviorAnalyticsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => scroll_analytics_entity_1.ScrollAnalytics),
    __param(0, (0, graphql_1.Args)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserBehaviorAnalyticsResolver.prototype, "trackScrolling", null);
__decorate([
    (0, graphql_1.Mutation)(() => heatmap_data_entity_1.HeatmapData),
    __param(0, (0, graphql_1.Args)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserBehaviorAnalyticsResolver.prototype, "trackHeatmapData", null);
__decorate([
    (0, graphql_1.Mutation)(() => [heatmap_data_entity_1.HeatmapData]),
    __param(0, (0, graphql_1.Args)('dataItems', { type: () => [heatmap_data_entity_1.HeatmapData] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], UserBehaviorAnalyticsResolver.prototype, "trackBatchHeatmapData", null);
__decorate([
    (0, graphql_1.Query)(() => Object),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, graphql_1.Args)('period', { type: () => graphql_1.Int, nullable: true, defaultValue: 30 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserBehaviorAnalyticsResolver.prototype, "verticalScrollingAnalytics", null);
__decorate([
    (0, graphql_1.Query)(() => Object),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, graphql_1.Args)('pagePath')),
    __param(1, (0, graphql_1.Args)('period', { type: () => graphql_1.Int, nullable: true, defaultValue: 30 })),
    __param(2, (0, graphql_1.Args)('interactionType', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], UserBehaviorAnalyticsResolver.prototype, "heatmapAnalytics", null);
__decorate([
    (0, graphql_1.Query)(() => Object),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, graphql_1.Args)('period', { type: () => graphql_1.Int, nullable: true, defaultValue: 30 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserBehaviorAnalyticsResolver.prototype, "verticalNavigationFunnel", null);
exports.UserBehaviorAnalyticsResolver = UserBehaviorAnalyticsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [user_behavior_analytics_service_1.UserBehaviorAnalyticsService])
], UserBehaviorAnalyticsResolver);
//# sourceMappingURL=user-behavior-analytics.resolver.js.map