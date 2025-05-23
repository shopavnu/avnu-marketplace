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
exports.PerformanceMetricsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const performance_metrics_service_1 = require("../services/performance-metrics.service");
const admin_guard_1 = require("../../auth/guards/admin.guard");
const api_performance_metric_entity_1 = require("../entities/api-performance-metric.entity");
const client_performance_metric_entity_1 = require("../entities/client-performance-metric.entity");
const query_performance_metric_entity_1 = require("../entities/query-performance-metric.entity");
let PerformanceMetricsController = class PerformanceMetricsController {
    constructor(performanceMetricsService) {
        this.performanceMetricsService = performanceMetricsService;
    }
    async trackApiResponseTime(data) {
        return this.performanceMetricsService.trackApiResponseTime(data.endpoint, data.method, data.responseTime, data.statusCode, data.userId, data.sessionId);
    }
    async trackClientPerformance(data) {
        return this.performanceMetricsService.trackClientPerformance(data);
    }
    async trackQueryPerformance(data) {
        return this.performanceMetricsService.trackQueryPerformance(data.queryId, data.executionTime, data.queryType, data.parameters, data.resultCount);
    }
    async getApiPerformanceMetrics(period, slowThreshold) {
        return this.performanceMetricsService.getApiPerformanceMetrics(period || 30, slowThreshold || 1000);
    }
    async getClientPerformanceMetrics(period) {
        return this.performanceMetricsService.getClientPerformanceMetrics(period || 30);
    }
    async getSlowQueryMetrics(period, slowThreshold) {
        return this.performanceMetricsService.getSlowQueryMetrics(period || 30, slowThreshold || 500);
    }
};
exports.PerformanceMetricsController = PerformanceMetricsController;
__decorate([
    (0, common_1.Post)('api'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Track API response time' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'API response time tracked successfully',
    }),
    (0, swagger_1.ApiBody)({ type: api_performance_metric_entity_1.ApiPerformanceMetric }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PerformanceMetricsController.prototype, "trackApiResponseTime", null);
__decorate([
    (0, common_1.Post)('client'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Track client-side performance metrics' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Client performance metrics tracked successfully',
    }),
    (0, swagger_1.ApiBody)({ type: client_performance_metric_entity_1.ClientPerformanceMetric }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PerformanceMetricsController.prototype, "trackClientPerformance", null);
__decorate([
    (0, common_1.Post)('query'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Track query performance' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Query performance tracked successfully',
    }),
    (0, swagger_1.ApiBody)({ type: query_performance_metric_entity_1.QueryPerformanceMetric }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PerformanceMetricsController.prototype, "trackQueryPerformance", null);
__decorate([
    (0, common_1.Get)('api'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get API performance metrics' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'API performance metrics retrieved successfully',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'period',
        required: false,
        type: Number,
        description: 'Period in days (default: 30)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'slowThreshold',
        required: false,
        type: Number,
        description: 'Threshold in ms to consider an API call slow (default: 1000)',
    }),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('slowThreshold')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PerformanceMetricsController.prototype, "getApiPerformanceMetrics", null);
__decorate([
    (0, common_1.Get)('client'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get client performance metrics' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Client performance metrics retrieved successfully',
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
], PerformanceMetricsController.prototype, "getClientPerformanceMetrics", null);
__decorate([
    (0, common_1.Get)('query'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get slow query metrics' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Slow query metrics retrieved successfully' }),
    (0, swagger_1.ApiQuery)({
        name: 'period',
        required: false,
        type: Number,
        description: 'Period in days (default: 30)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'slowThreshold',
        required: false,
        type: Number,
        description: 'Threshold in ms to consider a query slow (default: 500)',
    }),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('slowThreshold')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PerformanceMetricsController.prototype, "getSlowQueryMetrics", null);
exports.PerformanceMetricsController = PerformanceMetricsController = __decorate([
    (0, swagger_1.ApiTags)('performance-metrics'),
    (0, common_1.Controller)('analytics/performance'),
    __metadata("design:paramtypes", [performance_metrics_service_1.PerformanceMetricsService])
], PerformanceMetricsController);
//# sourceMappingURL=performance-metrics.controller.js.map