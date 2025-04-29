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
var QueryAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const config_1 = require("@nestjs/config");
const resilient_cache_service_1 = require("../../../common/services/resilient-cache.service");
let QueryAnalyticsService = QueryAnalyticsService_1 = class QueryAnalyticsService {
    constructor(eventEmitter, configService, cacheService) {
        this.eventEmitter = eventEmitter;
        this.configService = configService;
        this.cacheService = cacheService;
        this.logger = new common_1.Logger(QueryAnalyticsService_1.name);
        this.ANALYTICS_CACHE_KEY = 'query:analytics';
        this.MAX_STORED_QUERIES = 100;
        this.ANALYTICS_TTL = 60 * 60 * 24 * 7;
        this.METRICS_RETENTION_PERIOD = 60 * 60 * 24 * 2;
        this.SLOW_QUERY_THRESHOLD = this.configService.get('SLOW_QUERY_THRESHOLD_MS', 500);
        this.eventEmitter.on('query.executed', (metrics) => {
            this.recordQueryMetrics(metrics).catch(err => this.logger.error(`Error recording query metrics: ${err.message}`, err.stack));
        });
        setInterval(() => this.processQueryAnalytics(), 60 * 60 * 1000);
    }
    async recordQueryMetrics(metrics) {
        try {
            const metricsKey = `query:metrics:${metrics.queryId}`;
            let queryMetrics = (await this.cacheService.get(metricsKey)) || [];
            queryMetrics.push(metrics);
            const cutoffTime = Date.now() - this.METRICS_RETENTION_PERIOD * 1000;
            queryMetrics = queryMetrics.filter(m => m.timestamp >= cutoffTime);
            await this.cacheService.set(metricsKey, queryMetrics, this.ANALYTICS_TTL);
            if (metrics.executionTime > this.SLOW_QUERY_THRESHOLD) {
                this.logger.warn(`Slow query detected: ${metrics.queryPattern} (${metrics.executionTime}ms)`);
                this.eventEmitter.emit('query.slow', metrics);
            }
        }
        catch (error) {
            this.logger.error(`Error recording query metrics: ${error.message}`, error.stack);
        }
    }
    async processQueryAnalytics() {
        try {
            this.logger.log('Processing query analytics...');
            const metricKeys = (await this.cacheService.get('query:metric:keys')) || [];
            const analytics = {};
            for (const key of metricKeys) {
                const queryId = key.replace('query:metrics:', '');
                const metrics = (await this.cacheService.get(key)) || [];
                if (metrics.length === 0)
                    continue;
                const executionTimes = metrics.map(m => m.executionTime);
                const totalExecutions = metrics.length;
                const averageExecutionTime = executionTimes.reduce((a, b) => a + b, 0) / totalExecutions;
                const minExecutionTime = Math.min(...executionTimes);
                const maxExecutionTime = Math.max(...executionTimes);
                const lastExecuted = Math.max(...metrics.map(m => m.timestamp));
                const lastExecutionTime = metrics.find(m => m.timestamp === lastExecuted)?.executionTime || 0;
                const hourMs = 60 * 60 * 1000;
                const now = Date.now();
                const lastHourExecutions = metrics.filter(m => m.timestamp >= now - hourMs).length;
                const frequency = lastHourExecutions;
                const commonFilters = {};
                metrics.forEach(m => {
                    Object.keys(m.filters || {}).forEach(filter => {
                        commonFilters[filter] = (commonFilters[filter] || 0) + 1;
                    });
                });
                const resultSizes = metrics
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 10)
                    .map(m => m.resultCount);
                const isSlowQuery = averageExecutionTime > this.SLOW_QUERY_THRESHOLD;
                analytics[queryId] = {
                    queryId,
                    queryPattern: metrics[0].queryPattern,
                    averageExecutionTime,
                    minExecutionTime,
                    maxExecutionTime,
                    totalExecutions,
                    lastExecutionTime,
                    lastExecuted,
                    frequency,
                    isSlowQuery,
                    commonFilters,
                    resultSizes,
                };
            }
            await this.cacheService.set(this.ANALYTICS_CACHE_KEY, analytics, this.ANALYTICS_TTL);
            this.logger.log(`Processed analytics for ${Object.keys(analytics).length} queries`);
        }
        catch (error) {
            this.logger.error(`Error processing query analytics: ${error.message}`, error.stack);
        }
    }
    async getQueryAnalytics() {
        const analytics = (await this.cacheService.get(this.ANALYTICS_CACHE_KEY)) || {};
        return Object.values(analytics);
    }
    async getSlowQueries() {
        const analytics = await this.getQueryAnalytics();
        return analytics.filter(a => a.isSlowQuery);
    }
    async getQueryAnalyticsById(queryId) {
        const analytics = (await this.cacheService.get(this.ANALYTICS_CACHE_KEY)) || {};
        return analytics[queryId] || null;
    }
    async getMostFrequentQueries(limit = 10) {
        const analytics = await this.getQueryAnalytics();
        return analytics.sort((a, b) => b.frequency - a.frequency).slice(0, limit);
    }
    generateQueryId(queryPattern, filters) {
        const sortedFilters = Object.keys(filters || {})
            .sort()
            .reduce((obj, key) => {
            obj[key] = filters[key];
            return obj;
        }, {});
        const queryString = `${queryPattern}:${JSON.stringify(sortedFilters)}`;
        let hash = 0;
        for (let i = 0; i < queryString.length; i++) {
            const char = queryString.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return `q${Math.abs(hash).toString(36)}`;
    }
    recordQuery(queryPattern, filters, executionTime, resultCount) {
        const queryId = this.generateQueryId(queryPattern, filters);
        this.cacheService
            .get('query:metric:keys')
            .then(keys => {
            const metricKey = `query:metrics:${queryId}`;
            if (!keys) {
                this.cacheService.set('query:metric:keys', [metricKey], this.ANALYTICS_TTL);
            }
            else if (!keys.includes(metricKey)) {
                if (keys.length >= this.MAX_STORED_QUERIES) {
                    keys.shift();
                }
                keys.push(metricKey);
                this.cacheService.set('query:metric:keys', keys, this.ANALYTICS_TTL);
            }
        })
            .catch(err => this.logger.error(`Error updating metric keys: ${err.message}`));
        this.eventEmitter.emit('query.executed', {
            queryId,
            queryPattern,
            filters,
            executionTime,
            timestamp: Date.now(),
            resultCount,
        });
    }
};
exports.QueryAnalyticsService = QueryAnalyticsService;
exports.QueryAnalyticsService = QueryAnalyticsService = QueryAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2,
        config_1.ConfigService,
        resilient_cache_service_1.ResilientCacheService])
], QueryAnalyticsService);
//# sourceMappingURL=query-analytics.service.js.map