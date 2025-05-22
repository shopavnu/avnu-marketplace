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
exports.PerformanceMetricsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const performance_metrics_service_1 = require("../services/performance-metrics.service");
const admin_guard_1 = require("../../auth/guards/admin.guard");
const api_performance_metric_entity_1 = require("../entities/api-performance-metric.entity");
const client_performance_metric_entity_1 = require("../entities/client-performance-metric.entity");
const query_performance_metric_entity_1 = require("../entities/query-performance-metric.entity");
let PerformanceMetricsResolver = class PerformanceMetricsResolver {
    constructor(performanceMetricsService) {
        this.performanceMetricsService = performanceMetricsService;
    }
    async trackApiResponseTime(endpoint, method, responseTime, statusCode, userId, sessionId) {
        return this.performanceMetricsService.trackApiResponseTime(endpoint, method, responseTime, statusCode, userId, sessionId);
    }
    async trackClientPerformance(data) {
        return this.performanceMetricsService.trackClientPerformance(data);
    }
    async trackQueryPerformance(queryId, executionTime, queryType, parameters, resultCount) {
        return this.performanceMetricsService.trackQueryPerformance(queryId, executionTime, queryType, parameters, resultCount);
    }
    async apiPerformanceMetrics(period, slowThreshold) {
        return this.performanceMetricsService.getApiPerformanceMetrics(period, slowThreshold);
    }
    async clientPerformanceMetrics(period) {
        return this.performanceMetricsService.getClientPerformanceMetrics(period);
    }
    async slowQueryMetrics(period, slowThreshold) {
        return this.performanceMetricsService.getSlowQueryMetrics(period, slowThreshold);
    }
};
exports.PerformanceMetricsResolver = PerformanceMetricsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => api_performance_metric_entity_1.ApiPerformanceMetric),
    __param(0, (0, graphql_1.Args)('endpoint')),
    __param(1, (0, graphql_1.Args)('method')),
    __param(2, (0, graphql_1.Args)('responseTime', { type: () => graphql_1.Int })),
    __param(3, (0, graphql_1.Args)('statusCode', { type: () => graphql_1.Int })),
    __param(4, (0, graphql_1.Args)('userId', { nullable: true })),
    __param(5, (0, graphql_1.Args)('sessionId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], PerformanceMetricsResolver.prototype, "trackApiResponseTime", null);
__decorate([
    (0, graphql_1.Mutation)(() => client_performance_metric_entity_1.ClientPerformanceMetric),
    __param(0, (0, graphql_1.Args)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PerformanceMetricsResolver.prototype, "trackClientPerformance", null);
__decorate([
    (0, graphql_1.Mutation)(() => query_performance_metric_entity_1.QueryPerformanceMetric),
    __param(0, (0, graphql_1.Args)('queryId')),
    __param(1, (0, graphql_1.Args)('executionTime', { type: () => graphql_1.Int })),
    __param(2, (0, graphql_1.Args)('queryType')),
    __param(3, (0, graphql_1.Args)('parameters', { nullable: true })),
    __param(4, (0, graphql_1.Args)('resultCount', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String, String, Number]),
    __metadata("design:returntype", Promise)
], PerformanceMetricsResolver.prototype, "trackQueryPerformance", null);
__decorate([
    (0, graphql_1.Query)(() => Object),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, graphql_1.Args)('period', { type: () => graphql_1.Int, nullable: true, defaultValue: 30 })),
    __param(1, (0, graphql_1.Args)('slowThreshold', { type: () => graphql_1.Int, nullable: true, defaultValue: 1000 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PerformanceMetricsResolver.prototype, "apiPerformanceMetrics", null);
__decorate([
    (0, graphql_1.Query)(() => Object),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, graphql_1.Args)('period', { type: () => graphql_1.Int, nullable: true, defaultValue: 30 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PerformanceMetricsResolver.prototype, "clientPerformanceMetrics", null);
__decorate([
    (0, graphql_1.Query)(() => Object),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, graphql_1.Args)('period', { type: () => graphql_1.Int, nullable: true, defaultValue: 30 })),
    __param(1, (0, graphql_1.Args)('slowThreshold', { type: () => graphql_1.Int, nullable: true, defaultValue: 500 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PerformanceMetricsResolver.prototype, "slowQueryMetrics", null);
exports.PerformanceMetricsResolver = PerformanceMetricsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [performance_metrics_service_1.PerformanceMetricsService])
], PerformanceMetricsResolver);
//# sourceMappingURL=performance-metrics.resolver.js.map