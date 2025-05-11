'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var SearchDashboardController_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.SearchDashboardController = void 0;
const common_1 = require('@nestjs/common');
const swagger_1 = require('@nestjs/swagger');
const jwt_auth_guard_1 = require('../../auth/guards/jwt-auth.guard');
const search_monitoring_service_1 = require('../services/search-monitoring.service');
const search_analytics_service_1 = require('../../analytics/services/search-analytics.service');
const search_experiment_service_1 = require('../services/search-experiment.service');
const timeframe_enum_1 = require('../enums/timeframe.enum');
function parseTimeframeToMinutes(timeframe) {
  if (!timeframe) return 60 * 24 * 30;
  const match = timeframe.toString().match(/^(\d+)(d|h|m)$/);
  if (!match) return 60 * 24 * 30;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 'd':
      return value * 24 * 60;
    case 'h':
      return value * 60;
    case 'm':
      return value;
    default:
      return 60 * 24 * 30;
  }
}
function parseTimeframeToDays(timeframe) {
  if (!timeframe) return 30;
  const match = timeframe.toString().match(/^(\d+)(d|h|m)$/);
  if (!match) return 30;
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
let SearchDashboardController = (SearchDashboardController_1 = class SearchDashboardController {
  constructor(searchMonitoringService, searchAnalyticsService, searchExperimentService) {
    this.searchMonitoringService = searchMonitoringService;
    this.searchAnalyticsService = searchAnalyticsService;
    this.searchExperimentService = searchExperimentService;
    this.logger = new common_1.Logger(SearchDashboardController_1.name);
  }
  async getPerformanceStats(timeframe = 'day') {
    const periodInMinutes = parseTimeframeToMinutes(timeframe);
    return this.searchMonitoringService.getPerformanceStats(periodInMinutes);
  }
  async getRelevanceMetrics(_timeframe = 'day') {
    return { message: 'Endpoint not implemented yet.' };
  }
  async getTopSearchQueries(limit, timeframe) {
    this.logger.log(
      `Fetching top search queries for timeframe: ${timeframe || 'default'}, limit: ${limit || 'default'}`,
    );
    try {
      const periodInDays = parseTimeframeToDays(timeframe);
      return await this.searchAnalyticsService.getTopSearchQueries(limit, periodInDays);
    } catch (error) {
      this.logger.error(`Error fetching top search queries: ${error.message}`, error.stack);
      throw error;
    }
  }
  async getZeroResultQueries(limit, timeframe) {
    this.logger.log(
      `Fetching zero-result queries for timeframe: ${timeframe || 'default'}, limit: ${limit || 'default'}`,
    );
    try {
      const periodInDays = parseTimeframeToDays(timeframe);
      return await this.searchAnalyticsService.getZeroResultQueries(limit, periodInDays);
    } catch (error) {
      this.logger.error(`Error fetching zero-result queries: ${error.message}`, error.stack);
      throw error;
    }
  }
  async getEntityDistribution(_timeframe = 'day') {
    return { message: 'Endpoint not implemented yet.' };
  }
  async getSearchConversionRate(timeframe) {
    this.logger.log(`Fetching search conversion rate for timeframe: ${timeframe || 'default'}`);
    try {
      const periodInDays = parseTimeframeToDays(timeframe);
      return await this.searchAnalyticsService.getSearchConversionRate(periodInDays);
    } catch (error) {
      this.logger.error(`Error fetching conversion rate: ${error.message}`, error.stack);
      throw error;
    }
  }
  async getExperiments() {
    return this.searchExperimentService.getExperiments();
  }
  async getExperiment(id) {
    this.logger.log(`Fetching experiment with ID: ${id}`);
    return this.searchExperimentService.getExperiment(id);
  }
  async getExperimentResults(id) {
    this.logger.log(`Fetching results for experiment ID: ${id}`);
    return { message: `Results for experiment ${id} - Not implemented yet` };
  }
  async getHealthStatus() {
    return { message: 'Endpoint not implemented yet.' };
  }
  async getSearchPaths(_limit = 10) {
    this.logger.warn('getSearchPaths endpoint called but not implemented.');
    return { message: 'Endpoint not implemented yet.' };
  }
  async getSearchRefinements(_limit = 10) {
    return { message: 'Endpoint not implemented yet.' };
  }
  async getValueAlignmentMetrics() {
    return { message: 'Endpoint not implemented yet.' };
  }
});
exports.SearchDashboardController = SearchDashboardController;
__decorate(
  [
    (0, common_1.Get)('performance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get search performance stats' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns search performance stats' }),
    (0, swagger_1.ApiQuery)({ name: 'timeframe', enum: ['day', 'week', 'month'], required: false }),
    __param(0, (0, common_1.Query)('timeframe')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  SearchDashboardController.prototype,
  'getPerformanceStats',
  null,
);
__decorate(
  [
    (0, common_1.Get)('relevance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get search relevance metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns search relevance metrics' }),
    (0, swagger_1.ApiQuery)({ name: 'timeframe', enum: ['day', 'week', 'month'], required: false }),
    __param(0, (0, common_1.Query)('timeframe')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  SearchDashboardController.prototype,
  'getRelevanceMetrics',
  null,
);
__decorate(
  [
    (0, common_1.Get)('top-search-queries'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top search queries' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns top search queries' }),
    (0, swagger_1.ApiQuery)({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of queries to return',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'timeframe',
      required: false,
      enum: timeframe_enum_1.Timeframe,
      description: 'Time period (e.g., 7d, 30d)',
    }),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('timeframe')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, String]),
    __metadata('design:returntype', Promise),
  ],
  SearchDashboardController.prototype,
  'getTopSearchQueries',
  null,
);
__decorate(
  [
    (0, common_1.Get)('zero-results'),
    (0, swagger_1.ApiOperation)({ summary: 'Get queries with zero results' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns queries with zero results' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'timeframe', enum: ['day', 'week', 'month'], required: false }),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('timeframe')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, String]),
    __metadata('design:returntype', Promise),
  ],
  SearchDashboardController.prototype,
  'getZeroResultQueries',
  null,
);
__decorate(
  [
    (0, common_1.Get)('entity-distribution'),
    (0, swagger_1.ApiOperation)({ summary: 'Get entity distribution in search results' }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: 'Returns entity distribution in search results',
    }),
    (0, swagger_1.ApiQuery)({ name: 'timeframe', enum: ['day', 'week', 'month'], required: false }),
    __param(0, (0, common_1.Query)('timeframe')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  SearchDashboardController.prototype,
  'getEntityDistribution',
  null,
);
__decorate(
  [
    (0, common_1.Get)('conversion-rate'),
    (0, swagger_1.ApiOperation)({ summary: 'Get search to conversion rate' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns search to conversion rate' }),
    (0, swagger_1.ApiQuery)({ name: 'timeframe', enum: ['day', 'week', 'month'], required: false }),
    __param(0, (0, common_1.Query)('timeframe')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  SearchDashboardController.prototype,
  'getSearchConversionRate',
  null,
);
__decorate(
  [
    (0, common_1.Get)('experiments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all search experiments' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns all search experiments' }),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  SearchDashboardController.prototype,
  'getExperiments',
  null,
);
__decorate(
  [
    (0, common_1.Get)('experiments/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get search experiment by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns search experiment by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  SearchDashboardController.prototype,
  'getExperiment',
  null,
);
__decorate(
  [
    (0, common_1.Get)('experiments/:id/results'),
    (0, swagger_1.ApiOperation)({ summary: 'Get results for a specific search experiment' }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: 'Returns results for the specified search experiment',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  SearchDashboardController.prototype,
  'getExperimentResults',
  null,
);
__decorate(
  [
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get search system health status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns search system health status' }),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  SearchDashboardController.prototype,
  'getHealthStatus',
  null,
);
__decorate(
  [
    (0, common_1.Get)('analytics/search-paths'),
    (0, swagger_1.ApiOperation)({ summary: 'Get common user search paths/journeys' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns common search paths' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  SearchDashboardController.prototype,
  'getSearchPaths',
  null,
);
__decorate(
  [
    (0, common_1.Get)('analytics/search-refinements'),
    (0, swagger_1.ApiOperation)({ summary: 'Get search refinement patterns' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns search refinement patterns' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  SearchDashboardController.prototype,
  'getSearchRefinements',
  null,
);
__decorate(
  [
    (0, common_1.Get)('analytics/value-alignment'),
    (0, swagger_1.ApiOperation)({ summary: 'Get value alignment metrics in search' }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: 'Returns value alignment metrics in search',
    }),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  SearchDashboardController.prototype,
  'getValueAlignmentMetrics',
  null,
);
exports.SearchDashboardController =
  SearchDashboardController =
  SearchDashboardController_1 =
    __decorate(
      [
        (0, swagger_1.ApiTags)('Search Dashboard'),
        (0, common_1.Controller)('api/search/dashboard'),
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
        __metadata('design:paramtypes', [
          search_monitoring_service_1.SearchMonitoringService,
          search_analytics_service_1.SearchAnalyticsService,
          search_experiment_service_1.SearchExperimentService,
        ]),
      ],
      SearchDashboardController,
    );
//# sourceMappingURL=search-dashboard.controller.js.map
