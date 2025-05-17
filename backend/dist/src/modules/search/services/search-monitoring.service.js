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
var SearchMonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchMonitoringService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const search_entity_type_enum_1 = require("../enums/search-entity-type.enum");
let SearchMonitoringService = SearchMonitoringService_1 = class SearchMonitoringService {
    constructor(configService, eventEmitter) {
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(SearchMonitoringService_1.name);
        this.enabled = this.configService.get('SEARCH_MONITORING_ENABLED', true);
        this.sampleRate = this.configService.get('SEARCH_MONITORING_SAMPLE_RATE', 0.1);
        this.performanceThresholds = {
            warning: this.configService.get('SEARCH_PERFORMANCE_WARNING_THRESHOLD', 500),
            critical: this.configService.get('SEARCH_PERFORMANCE_CRITICAL_THRESHOLD', 1000),
        };
        this.relevanceThresholds = {
            zeroResults: this.configService.get('SEARCH_RELEVANCE_ZERO_RESULTS_THRESHOLD', 0.05),
            lowRelevance: this.configService.get('SEARCH_RELEVANCE_LOW_THRESHOLD', 0.3),
        };
    }
    trackSearch(_options, results, duration) {
        if (!this.enabled || Math.random() > this.sampleRate) {
            return;
        }
        this.trackPerformance(_options, duration);
        this.trackRelevance(_options, results);
        this.trackEntityDistribution(_options, results);
        this.trackSearchMetrics(_options, results, duration);
    }
    trackPerformance(_options, duration) {
        this.eventEmitter.emit('search.performance', {
            query: _options.query,
            entityType: _options.entityType,
            duration,
            timestamp: new Date(),
        });
        if (duration > this.performanceThresholds.critical) {
            this.logger.warn(`Critical search performance: ${duration}ms for query "${_options.query}" (${_options.entityType})`);
            this.eventEmitter.emit('search.performance.critical', {
                query: _options.query,
                entityType: _options.entityType,
                duration,
                timestamp: new Date(),
            });
        }
        else if (duration > this.performanceThresholds.warning) {
            this.logger.debug(`Warning search performance: ${duration}ms for query "${_options.query}" (${_options.entityType})`);
            this.eventEmitter.emit('search.performance.warning', {
                query: _options.query,
                entityType: _options.entityType,
                duration,
                timestamp: new Date(),
            });
        }
    }
    trackRelevance(_options, results) {
        const { query, entityType } = _options;
        const { pagination } = results;
        if (pagination.total === 0 && query && query.trim().length > 0) {
            this.logger.debug(`Zero results for query "${query}" (${entityType})`);
            this.eventEmitter.emit('search.relevance.zero_results', {
                query,
                entityType,
                timestamp: new Date(),
            });
            this.trackZeroResultsRate(_options);
        }
        if (results.relevanceScores) {
            const relevanceScore = this.calculateOverallRelevanceScore(results.relevanceScores);
            this.eventEmitter.emit('search.relevance', {
                query,
                entityType,
                relevanceScore,
                timestamp: new Date(),
            });
            if (relevanceScore < this.relevanceThresholds.lowRelevance && pagination.total > 0) {
                this.logger.debug(`Low relevance (${relevanceScore.toFixed(2)}) for query "${query}" (${entityType})`);
                this.eventEmitter.emit('search.relevance.low', {
                    query,
                    entityType,
                    relevanceScore,
                    timestamp: new Date(),
                });
            }
        }
    }
    trackEntityDistribution(_options, results) {
        if (_options.entityType !== search_entity_type_enum_1.SearchEntityType.ALL || !results.entityDistribution) {
            return;
        }
        this.eventEmitter.emit('search.entity_distribution', {
            query: _options.query,
            distribution: results.entityDistribution,
            timestamp: new Date(),
        });
    }
    trackSearchMetrics(_options, results, duration) {
        const metrics = {
            query: _options.query,
            entityType: _options.entityType,
            resultCount: results.pagination.total,
            duration,
            timestamp: new Date(),
            enableNlp: _options.enableNlp,
            personalized: _options.personalized,
            filterCount: (_options.filters?.length || 0) + (_options.rangeFilters?.length || 0),
            experimentId: _options.experimentId,
        };
        if (results.entityDistribution) {
            metrics['entityDistribution'] = results.entityDistribution;
        }
        if (results.relevanceScores) {
            metrics['relevanceScores'] = results.relevanceScores;
        }
        this.eventEmitter.emit('search.metrics', metrics);
    }
    trackZeroResultsRate(_options) {
    }
    calculateOverallRelevanceScore(relevanceScores) {
        const { products, merchants, brands } = relevanceScores;
        const weights = {
            products: 0.6,
            merchants: 0.2,
            brands: 0.2,
        };
        let weightedSum = 0;
        let totalWeight = 0;
        if (products !== undefined) {
            weightedSum += products * weights.products;
            totalWeight += weights.products;
        }
        if (merchants !== undefined) {
            weightedSum += merchants * weights.merchants;
            totalWeight += weights.merchants;
        }
        if (brands !== undefined) {
            weightedSum += brands * weights.brands;
            totalWeight += weights.brands;
        }
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }
    async getPerformanceStats(_period = 60) {
        return {
            averageDuration: 150,
            p95Duration: 450,
            p99Duration: 800,
            maxDuration: 1200,
            criticalCount: 5,
            warningCount: 25,
            totalSearches: 1000,
            timestamp: new Date(),
        };
    }
    async getRelevanceStats(_period = 60) {
        return {
            averageRelevance: 0.75,
            zeroResultsRate: 0.03,
            lowRelevanceRate: 0.12,
            entityDistribution: {
                products: 0.65,
                merchants: 0.2,
                brands: 0.15,
            },
            timestamp: new Date(),
        };
    }
    async getSearchHealthStatus() {
        const performanceStats = await this.getPerformanceStats();
        const relevanceStats = await this.getRelevanceStats();
        const performanceStatus = this.determinePerformanceStatus(performanceStats);
        const relevanceStatus = this.determineRelevanceStatus(relevanceStats);
        const overallStatus = performanceStatus === 'critical' || relevanceStatus === 'critical'
            ? 'critical'
            : performanceStatus === 'warning' || relevanceStatus === 'warning'
                ? 'warning'
                : 'healthy';
        return {
            status: overallStatus,
            performance: {
                status: performanceStatus,
                stats: performanceStats,
            },
            relevance: {
                status: relevanceStatus,
                stats: relevanceStats,
            },
            timestamp: new Date(),
        };
    }
    determinePerformanceStatus(stats) {
        if (stats.p95Duration > this.performanceThresholds.critical) {
            return 'critical';
        }
        else if (stats.p95Duration > this.performanceThresholds.warning) {
            return 'warning';
        }
        else {
            return 'healthy';
        }
    }
    determineRelevanceStatus(stats) {
        if (stats.zeroResultsRate > this.relevanceThresholds.zeroResults) {
            return 'critical';
        }
        else if (stats.lowRelevanceRate > this.relevanceThresholds.lowRelevance) {
            return 'warning';
        }
        else {
            return 'healthy';
        }
    }
};
exports.SearchMonitoringService = SearchMonitoringService;
exports.SearchMonitoringService = SearchMonitoringService = SearchMonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        event_emitter_1.EventEmitter2])
], SearchMonitoringService);
//# sourceMappingURL=search-monitoring.service.js.map