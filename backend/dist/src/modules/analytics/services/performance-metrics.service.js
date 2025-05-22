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
var PerformanceMetricsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMetricsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const api_performance_metric_entity_1 = require("../entities/api-performance-metric.entity");
const client_performance_metric_entity_1 = require("../entities/client-performance-metric.entity");
const query_performance_metric_entity_1 = require("../entities/query-performance-metric.entity");
let PerformanceMetricsService = PerformanceMetricsService_1 = class PerformanceMetricsService {
    constructor(apiMetricRepository, clientMetricRepository, queryMetricRepository) {
        this.apiMetricRepository = apiMetricRepository;
        this.clientMetricRepository = clientMetricRepository;
        this.queryMetricRepository = queryMetricRepository;
        this.logger = new common_1.Logger(PerformanceMetricsService_1.name);
    }
    async trackApiResponseTime(endpoint, method, responseTime, statusCode, userId, sessionId) {
        try {
            const metric = this.apiMetricRepository.create({
                endpoint,
                method,
                responseTime,
                statusCode,
                userId,
                sessionId,
            });
            return this.apiMetricRepository.save(metric);
        }
        catch (error) {
            this.logger.error(`Failed to track API response time: ${error.message}`);
            throw error;
        }
    }
    async trackClientPerformance(data) {
        try {
            const metric = this.clientMetricRepository.create(data);
            return this.clientMetricRepository.save(metric);
        }
        catch (error) {
            this.logger.error(`Failed to track client performance: ${error.message}`);
            throw error;
        }
    }
    async trackQueryPerformance(queryId, executionTime, queryType, parameters, resultCount) {
        try {
            const metric = this.queryMetricRepository.create({
                queryId,
                executionTime,
                queryType,
                parameters,
                resultCount,
            });
            return this.queryMetricRepository.save(metric);
        }
        catch (error) {
            this.logger.error(`Failed to track query performance: ${error.message}`);
            throw error;
        }
    }
    async getApiPerformanceMetrics(period = 30, slowThreshold = 1000) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - period);
            const averageResponseTimes = await this.apiMetricRepository
                .createQueryBuilder('metric')
                .select('metric.endpoint', 'endpoint')
                .addSelect('metric.method', 'method')
                .addSelect('AVG(metric.responseTime)', 'averageResponseTime')
                .addSelect('COUNT(metric.id)', 'requestCount')
                .where('metric.timestamp >= :startDate', { startDate })
                .groupBy('metric.endpoint')
                .addGroupBy('metric.method')
                .orderBy('averageResponseTime', 'DESC')
                .getRawMany();
            const slowApiCalls = await this.apiMetricRepository
                .createQueryBuilder('metric')
                .select('metric.endpoint', 'endpoint')
                .addSelect('metric.method', 'method')
                .addSelect('metric.responseTime', 'responseTime')
                .addSelect('metric.statusCode', 'statusCode')
                .addSelect('metric.timestamp', 'timestamp')
                .where('metric.timestamp >= :startDate', { startDate })
                .andWhere('metric.responseTime >= :slowThreshold', { slowThreshold })
                .orderBy('metric.responseTime', 'DESC')
                .limit(100)
                .getRawMany();
            const errorRates = await this.apiMetricRepository
                .createQueryBuilder('metric')
                .select('metric.endpoint', 'endpoint')
                .addSelect('metric.method', 'method')
                .addSelect('COUNT(metric.id)', 'totalRequests')
                .addSelect('SUM(CASE WHEN metric.statusCode >= 400 THEN 1 ELSE 0 END)', 'errorCount')
                .addSelect('CAST(SUM(CASE WHEN metric.statusCode >= 400 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(metric.id)', 'errorRate')
                .where('metric.timestamp >= :startDate', { startDate })
                .groupBy('metric.endpoint')
                .addGroupBy('metric.method')
                .having('COUNT(metric.id) > 10')
                .orderBy('errorRate', 'DESC')
                .getRawMany();
            const performanceTrends = await this.apiMetricRepository
                .createQueryBuilder('metric')
                .select('DATE(metric.timestamp)', 'date')
                .addSelect('AVG(metric.responseTime)', 'averageResponseTime')
                .addSelect('COUNT(metric.id)', 'requestCount')
                .where('metric.timestamp >= :startDate', { startDate })
                .groupBy('DATE(metric.timestamp)')
                .orderBy('date', 'ASC')
                .getRawMany();
            return {
                averageResponseTimes,
                slowApiCalls,
                errorRates,
                performanceTrends,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get API performance metrics: ${error.message}`);
            throw error;
        }
    }
    async getClientPerformanceMetrics(period = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - period);
            const averageMetricsByPage = await this.clientMetricRepository
                .createQueryBuilder('metric')
                .select('metric.pagePath', 'pagePath')
                .addSelect('AVG(metric.firstContentfulPaint)', 'avgFCP')
                .addSelect('AVG(metric.largestContentfulPaint)', 'avgLCP')
                .addSelect('AVG(metric.firstInputDelay)', 'avgFID')
                .addSelect('AVG(metric.cumulativeLayoutShift)', 'avgCLS')
                .addSelect('AVG(metric.timeToInteractive)', 'avgTTI')
                .addSelect('AVG(metric.totalBlockingTime)', 'avgTBT')
                .addSelect('COUNT(metric.id)', 'sampleCount')
                .where('metric.timestamp >= :startDate', { startDate })
                .groupBy('metric.pagePath')
                .orderBy('sampleCount', 'DESC')
                .getRawMany();
            const averageMetricsByDevice = await this.clientMetricRepository
                .createQueryBuilder('metric')
                .select('metric.deviceType', 'deviceType')
                .addSelect('AVG(metric.firstContentfulPaint)', 'avgFCP')
                .addSelect('AVG(metric.largestContentfulPaint)', 'avgLCP')
                .addSelect('AVG(metric.firstInputDelay)', 'avgFID')
                .addSelect('AVG(metric.cumulativeLayoutShift)', 'avgCLS')
                .addSelect('AVG(metric.timeToInteractive)', 'avgTTI')
                .addSelect('AVG(metric.totalBlockingTime)', 'avgTBT')
                .addSelect('COUNT(metric.id)', 'sampleCount')
                .where('metric.timestamp >= :startDate', { startDate })
                .groupBy('metric.deviceType')
                .orderBy('sampleCount', 'DESC')
                .getRawMany();
            const performanceTrends = await this.clientMetricRepository
                .createQueryBuilder('metric')
                .select('DATE(metric.timestamp)', 'date')
                .addSelect('AVG(metric.firstContentfulPaint)', 'avgFCP')
                .addSelect('AVG(metric.largestContentfulPaint)', 'avgLCP')
                .addSelect('AVG(metric.firstInputDelay)', 'avgFID')
                .addSelect('AVG(metric.cumulativeLayoutShift)', 'avgCLS')
                .addSelect('COUNT(metric.id)', 'sampleCount')
                .where('metric.timestamp >= :startDate', { startDate })
                .groupBy('DATE(metric.timestamp)')
                .orderBy('date', 'ASC')
                .getRawMany();
            return {
                averageMetricsByPage,
                averageMetricsByDevice,
                performanceTrends,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get client performance metrics: ${error.message}`);
            throw error;
        }
    }
    async getSlowQueryMetrics(period = 30, slowThreshold = 500) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - period);
            const slowQueries = await this.queryMetricRepository
                .createQueryBuilder('metric')
                .select('metric.queryType', 'queryType')
                .addSelect('AVG(metric.executionTime)', 'avgExecutionTime')
                .addSelect('MAX(metric.executionTime)', 'maxExecutionTime')
                .addSelect('COUNT(metric.id)', 'executionCount')
                .where('metric.timestamp >= :startDate', { startDate })
                .andWhere('metric.executionTime >= :slowThreshold', { slowThreshold })
                .groupBy('metric.queryType')
                .orderBy('avgExecutionTime', 'DESC')
                .getRawMany();
            const slowQueryDetails = await this.queryMetricRepository
                .createQueryBuilder('metric')
                .select('metric.queryId', 'queryId')
                .addSelect('metric.queryType', 'queryType')
                .addSelect('metric.executionTime', 'executionTime')
                .addSelect('metric.parameters', 'parameters')
                .addSelect('metric.resultCount', 'resultCount')
                .addSelect('metric.timestamp', 'timestamp')
                .where('metric.timestamp >= :startDate', { startDate })
                .andWhere('metric.executionTime >= :slowThreshold', { slowThreshold })
                .orderBy('metric.executionTime', 'DESC')
                .limit(100)
                .getRawMany();
            const queryPerformanceTrends = await this.queryMetricRepository
                .createQueryBuilder('metric')
                .select('DATE(metric.timestamp)', 'date')
                .addSelect('metric.queryType', 'queryType')
                .addSelect('AVG(metric.executionTime)', 'avgExecutionTime')
                .addSelect('COUNT(metric.id)', 'executionCount')
                .where('metric.timestamp >= :startDate', { startDate })
                .groupBy('DATE(metric.timestamp)')
                .addGroupBy('metric.queryType')
                .orderBy('date', 'ASC')
                .addOrderBy('queryType', 'ASC')
                .getRawMany();
            return {
                slowQueries,
                slowQueryDetails,
                queryPerformanceTrends,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get slow query metrics: ${error.message}`);
            throw error;
        }
    }
};
exports.PerformanceMetricsService = PerformanceMetricsService;
exports.PerformanceMetricsService = PerformanceMetricsService = PerformanceMetricsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(api_performance_metric_entity_1.ApiPerformanceMetric)),
    __param(1, (0, typeorm_1.InjectRepository)(client_performance_metric_entity_1.ClientPerformanceMetric)),
    __param(2, (0, typeorm_1.InjectRepository)(query_performance_metric_entity_1.QueryPerformanceMetric)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PerformanceMetricsService);
//# sourceMappingURL=performance-metrics.service.js.map