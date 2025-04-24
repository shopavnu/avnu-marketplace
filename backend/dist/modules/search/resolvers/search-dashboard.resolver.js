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
var SearchDashboardResolver_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchDashboardResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const search_monitoring_service_1 = require("../services/search-monitoring.service");
const search_analytics_service_1 = require("../../analytics/services/search-analytics.service");
const search_experiment_service_1 = require("../services/search-experiment.service");
const search_entity_type_enum_1 = require("../enums/search-entity-type.enum");
const search_dashboard_types_1 = require("../graphql/search-dashboard.types");
let SearchDashboardResolver = SearchDashboardResolver_1 = class SearchDashboardResolver {
    constructor(searchMonitoringService, searchAnalyticsService, searchExperimentService) {
        this.searchMonitoringService = searchMonitoringService;
        this.searchAnalyticsService = searchAnalyticsService;
        this.searchExperimentService = searchExperimentService;
        this.logger = new common_1.Logger(SearchDashboardResolver_1.name);
    }
    async searchPerformanceMetrics(timeframe) {
        this.logger.log(`Fetching search performance metrics for timeframe: ${timeframe || 'default'}`);
        try {
            const periodInMinutes = parseInt(timeframe?.replace('d', '') || '60');
            const stats = await this.searchMonitoringService.getPerformanceStats(periodInMinutes);
            return {
                averageResponseTime: stats.averageDuration,
                totalSearches: stats.totalSearches,
                slowSearches: stats.warningCount + stats.criticalCount,
                p95ResponseTime: stats.p95Duration,
                p99ResponseTime: stats.p99Duration,
                responseTimeDistribution: [],
                searchVolumeByHour: [],
            };
        }
        catch (error) {
            this.logger.error(`Error fetching performance metrics: ${error.message}`, error.stack);
            throw error;
        }
    }
    async searchRelevanceMetrics(timeframe) {
        this.logger.log(`Fetching search relevance metrics for timeframe: ${timeframe || 'default'}`);
        try {
            const periodInMinutes = parseInt(timeframe?.replace('d', '') || '60');
            const stats = await this.searchMonitoringService.getRelevanceStats(periodInMinutes);
            return {
                averageRelevanceScore: stats.averageRelevance,
                zeroResultRate: stats.zeroResultsRate,
                entityRelevanceScores: Object.entries(stats.entityDistribution || {}).map(([type, score]) => ({
                    entityType: type,
                    averageScore: score,
                })),
                clickThroughRate: 0,
                relevanceScoreByDay: [],
                averageResultCount: 0,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching relevance metrics: ${error.message}`, error.stack);
            throw error;
        }
    }
    async popularSearches(limit, timeframe) {
        this.logger.log(`Fetching popular searches with limit: ${limit} for timeframe: ${timeframe || 'default'}`);
        try {
            const periodInDays = parseInt(timeframe?.replace('d', '') || '30');
            const popular = await this.searchAnalyticsService.getTopSearchQueries(limit, periodInDays);
            return popular.map(p => ({
                query: p.query,
                count: p.count,
                conversionRate: p.conversionRate ?? 0,
                clickThroughRate: p.clickThroughRate,
                averageResultCount: p.averageResultCount,
            }));
        }
        catch (error) {
            this.logger.error(`Error fetching popular searches: ${error.message}`, error.stack);
            throw error;
        }
    }
    async zeroResultSearches(limit) {
        this.logger.log(`Fetching zero-result searches for limit: ${limit || 'default'}`);
        try {
            return await this.searchAnalyticsService.getZeroResultQueries(limit);
        }
        catch (error) {
            this.logger.error(`Error fetching zero-result searches: ${error.message}`, error.stack);
            throw error;
        }
    }
    async searchEntityDistribution(timeframe) {
        this.logger.log(`Fetching entity distribution for timeframe: ${timeframe || 'default'}`);
        try {
            const periodInDays = parseInt(timeframe?.replace('d', '') || '30');
            const [productsData, merchantsData, brandsData] = await Promise.all([
                this.searchAnalyticsService.getEntitySearchAnalytics(search_entity_type_enum_1.SearchEntityType.PRODUCT, periodInDays),
                this.searchAnalyticsService.getEntitySearchAnalytics(search_entity_type_enum_1.SearchEntityType.MERCHANT, periodInDays),
                this.searchAnalyticsService.getEntitySearchAnalytics(search_entity_type_enum_1.SearchEntityType.BRAND, periodInDays),
            ]);
            return {
                products: productsData.searches || 0,
                merchants: merchantsData.searches || 0,
                brands: brandsData.searches || 0,
                byPopularQueries: [],
            };
        }
        catch (error) {
            this.logger.error(`Error fetching entity distribution: ${error.message}`, error.stack);
            throw error;
        }
    }
    async searchConversionRate(timeframe) {
        this.logger.log(`Fetching search conversion rate for timeframe: ${timeframe || 'default'}`);
        try {
            const periodInDays = parseInt(timeframe) || 30;
            const overallRate = await this.searchAnalyticsService.getSearchConversionRate(periodInDays);
            return {
                overall: overallRate,
                fromProductSearch: 0,
                fromMerchantSearch: 0,
                fromBrandSearch: 0,
                byDay: [],
            };
        }
        catch (error) {
            this.logger.error(`Error fetching conversion rate: ${error.message}`, error.stack);
            throw error;
        }
    }
    async searchExperiments() {
        this.logger.log(`Fetching search experiments`);
        try {
            return await this.searchExperimentService.getExperiments();
        }
        catch (error) {
            this.logger.error(`Error fetching experiments: ${error.message}`, error.stack);
            throw error;
        }
    }
    async searchExperimentById(id) {
        this.logger.log(`Fetching search experiment by id: ${id}`);
        try {
            const experiments = await this.searchExperimentService.getExperiments();
            const experiment = experiments.find(exp => exp.id === id);
            if (!experiment) {
                throw new Error(`Experiment with ID ${id} not found`);
            }
            return experiment;
        }
        catch (error) {
            this.logger.error(`Error fetching experiment by id: ${error.message}`, error.stack);
            throw error;
        }
    }
    async searchExperimentResults(id) {
        this.logger.log(`Fetching search experiment results by id: ${id}`);
        try {
            const experiments = await this.searchExperimentService.getExperiments();
            const experiment = experiments.find(exp => exp.id === id);
            if (!experiment) {
                throw new Error(`Experiment with ID ${id} not found`);
            }
            return experiment;
        }
        catch (error) {
            this.logger.error(`Error fetching experiment results: ${error.message}`, error.stack);
            throw error;
        }
    }
    async searchHealthStatus() {
        this.logger.log('Fetching search system health status');
        try {
            const health = await this.searchMonitoringService.getSearchHealthStatus();
            return {
                isHealthy: health.status === 'healthy',
                alerts: [],
                uptime: 0,
                activeConnections: 0,
                cacheHitRate: 0,
                indexingLatency: 0,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching health status: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SearchDashboardResolver = SearchDashboardResolver;
__decorate([
    (0, graphql_1.Query)(() => search_dashboard_types_1.PerformanceMetricsType),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('timeframe', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SearchDashboardResolver.prototype, "searchPerformanceMetrics", null);
__decorate([
    (0, graphql_1.Query)(() => search_dashboard_types_1.RelevanceMetricsType),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('timeframe', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SearchDashboardResolver.prototype, "searchRelevanceMetrics", null);
__decorate([
    (0, graphql_1.Query)(() => [search_dashboard_types_1.PopularSearchType]),
    __param(0, (0, graphql_1.Args)('limit', { nullable: true, type: () => graphql_1.Int, defaultValue: 10 })),
    __param(1, (0, graphql_1.Args)('timeframe', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], SearchDashboardResolver.prototype, "popularSearches", null);
__decorate([
    (0, graphql_1.Query)(() => [search_dashboard_types_1.ZeroResultSearchType]),
    __param(0, (0, graphql_1.Args)('limit', { nullable: true, type: () => graphql_1.Int, defaultValue: 10 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SearchDashboardResolver.prototype, "zeroResultSearches", null);
__decorate([
    (0, graphql_1.Query)(() => search_dashboard_types_1.DashboardEntityDistributionType),
    __param(0, (0, graphql_1.Args)('timeframe', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SearchDashboardResolver.prototype, "searchEntityDistribution", null);
__decorate([
    (0, graphql_1.Query)(() => search_dashboard_types_1.ConversionRateType),
    __param(0, (0, graphql_1.Args)('timeframe', { nullable: true, defaultValue: 'day' })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SearchDashboardResolver.prototype, "searchConversionRate", null);
__decorate([
    (0, graphql_1.Query)(() => [search_dashboard_types_1.ExperimentType]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SearchDashboardResolver.prototype, "searchExperiments", null);
__decorate([
    (0, graphql_1.Query)(() => search_dashboard_types_1.ExperimentType, { nullable: true }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SearchDashboardResolver.prototype, "searchExperimentById", null);
__decorate([
    (0, graphql_1.Query)(() => search_dashboard_types_1.ExperimentResultType, { nullable: true }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SearchDashboardResolver.prototype, "searchExperimentResults", null);
__decorate([
    (0, graphql_1.Query)(() => search_dashboard_types_1.HealthStatusType),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SearchDashboardResolver.prototype, "searchHealthStatus", null);
exports.SearchDashboardResolver = SearchDashboardResolver = SearchDashboardResolver_1 = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __metadata("design:paramtypes", [search_monitoring_service_1.SearchMonitoringService,
        search_analytics_service_1.SearchAnalyticsService,
        search_experiment_service_1.SearchExperimentService])
], SearchDashboardResolver);
function _parseTimeframeToDaysHelper(timeframe) {
    if (!timeframe)
        return 30;
    const match = timeframe.toString().match(/^(\d+)(d|h|m)$/);
    if (!match)
        return 30;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
        case 'd':
            return value;
        case 'h':
            return Math.ceil(value / 24);
        case 'm':
            return Math.ceil(value / (24 * 60));
        default:
            return 30;
    }
}
//# sourceMappingURL=search-dashboard.resolver.js.map