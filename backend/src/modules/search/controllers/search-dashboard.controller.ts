import { Controller, Get, Query, UseGuards, Logger, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../../auth/guards/roles.guard'; // TODO: Implement or restore RolesGuard
// import { Roles } from '../../auth/decorators/roles.decorator'; // TODO: Implement or restore Roles decorator
import {} from /* UserRole */ '../../users/entities/user.entity'; // Corrected import path
import { SearchMonitoringService, PerformanceStats } from '../services/search-monitoring.service';
import { SearchAnalyticsService } from '../../analytics/services/search-analytics.service';
import { SearchExperimentService } from '../services/search-experiment.service';
import { Timeframe } from '../enums/timeframe.enum'; // Corrected import path

// Helper function to parse timeframe string (e.g., "7d", "30d") to minutes
function parseTimeframeToMinutes(timeframe?: Timeframe | string): number {
  if (!timeframe) return 60 * 24 * 30; // Default to 30 days in minutes

  const match = timeframe.toString().match(/^(\d+)(d|h|m)$/);
  if (!match) return 60 * 24 * 30; // Default if format is invalid

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

// Helper function to parse timeframe string (e.g., "7d", "30d") to days
function parseTimeframeToDays(timeframe?: Timeframe | string): number {
  if (!timeframe) return 30; // Default to 30 days

  const match = timeframe.toString().match(/^(\d+)(d|h|m)$/);
  if (!match) return 30; // Default if format is invalid

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'd':
      return value;
    case 'h':
      return Math.ceil(value / 24); // Convert hours to days (rounding up)
    case 'm':
      return Math.ceil(value / (24 * 60)); // Convert minutes to days (rounding up)
    default:
      return 30;
  }
}

@ApiTags('Search Dashboard')
@Controller('api/search/dashboard')
@UseGuards(JwtAuthGuard)
// @UseGuards(JwtAuthGuard, RolesGuard) // TODO: Implement or restore RolesGuard
// @Roles(UserRole.ADMIN, UserRole.MERCHANT) // TODO: Requires Roles decorator/guard
export class SearchDashboardController {
  private readonly logger = new Logger(SearchDashboardController.name);

  constructor(
    private readonly searchMonitoringService: SearchMonitoringService,
    private readonly searchAnalyticsService: SearchAnalyticsService,
    private readonly searchExperimentService: SearchExperimentService,
  ) {}

  @Get('performance')
  @ApiOperation({ summary: 'Get search performance stats' })
  @ApiResponse({ status: 200, description: 'Returns search performance stats' })
  @ApiQuery({ name: 'timeframe', enum: ['day', 'week', 'month'], required: false })
  async getPerformanceStats(@Query('timeframe') timeframe = 'day'): Promise<PerformanceStats> {
    const periodInMinutes = parseTimeframeToMinutes(timeframe);
    return this.searchMonitoringService.getPerformanceStats(periodInMinutes);
  }

  @Get('relevance')
  @ApiOperation({ summary: 'Get search relevance metrics' })
  @ApiResponse({ status: 200, description: 'Returns search relevance metrics' })
  @ApiQuery({ name: 'timeframe', enum: ['day', 'week', 'month'], required: false })
  async getRelevanceMetrics(@Query('timeframe') _timeframe = 'day') {
    // TODO: Method getRelevanceMetrics missing from SearchMonitoringService
    // return this.searchMonitoringService.getRelevanceMetrics(timeframe);
    return { message: 'Endpoint not implemented yet.' };
  }

  @Get('top-search-queries')
  @ApiOperation({ summary: 'Get top search queries' })
  @ApiResponse({ status: 200, description: 'Returns top search queries' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of queries to return',
  })
  @ApiQuery({
    name: 'timeframe',
    required: false,
    enum: Timeframe,
    description: 'Time period (e.g., 7d, 30d)',
  })
  async getTopSearchQueries(
    @Query('limit') limit?: number,
    @Query('timeframe') timeframe?: Timeframe,
  ) {
    this.logger.log(
      `Fetching top search queries for timeframe: ${timeframe || 'default'}, limit: ${limit || 'default'}`,
    );
    try {
      const periodInDays = parseTimeframeToDays(timeframe);
      // Default limit can be handled in the service or controller, let's assume service handles default
      return await this.searchAnalyticsService.getTopSearchQueries(limit, periodInDays);
    } catch (error) {
      this.logger.error(`Error fetching top search queries: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('zero-results')
  @ApiOperation({ summary: 'Get queries with zero results' })
  @ApiResponse({ status: 200, description: 'Returns queries with zero results' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'timeframe', enum: ['day', 'week', 'month'], required: false })
  async getZeroResultQueries(
    @Query('limit') limit?: number,
    @Query('timeframe') timeframe?: Timeframe,
  ) {
    this.logger.log(
      `Fetching zero-result queries for timeframe: ${timeframe || 'default'}, limit: ${limit || 'default'}`,
    );
    try {
      const periodInDays = parseTimeframeToDays(timeframe); // Use days helper
      return await this.searchAnalyticsService.getZeroResultQueries(limit, periodInDays); // Pass period in days
    } catch (error) {
      this.logger.error(`Error fetching zero-result queries: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('entity-distribution')
  @ApiOperation({ summary: 'Get entity distribution in search results' })
  @ApiResponse({ status: 200, description: 'Returns entity distribution in search results' })
  @ApiQuery({ name: 'timeframe', enum: ['day', 'week', 'month'], required: false })
  async getEntityDistribution(@Query('timeframe') _timeframe = 'day') {
    // TODO: Method getEntityDistribution missing from SearchAnalyticsService
    // return this.searchAnalyticsService.getEntityDistribution(timeframe);
    return { message: 'Endpoint not implemented yet.' };
  }

  @Get('conversion-rate')
  @ApiOperation({ summary: 'Get search to conversion rate' })
  @ApiResponse({ status: 200, description: 'Returns search to conversion rate' })
  @ApiQuery({ name: 'timeframe', enum: ['day', 'week', 'month'], required: false })
  async getSearchConversionRate(@Query('timeframe') timeframe?: Timeframe) {
    this.logger.log(`Fetching search conversion rate for timeframe: ${timeframe || 'default'}`);
    try {
      const periodInDays = parseTimeframeToDays(timeframe); // Use days helper
      return await this.searchAnalyticsService.getSearchConversionRate(periodInDays); // Pass period in days
    } catch (error) {
      this.logger.error(`Error fetching conversion rate: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('experiments')
  @ApiOperation({ summary: 'Get all search experiments' })
  @ApiResponse({ status: 200, description: 'Returns all search experiments' })
  async getExperiments() {
    return this.searchExperimentService.getExperiments();
  }

  @Get('experiments/:id')
  @ApiOperation({ summary: 'Get search experiment by ID' })
  @ApiResponse({ status: 200, description: 'Returns search experiment by ID' })
  async getExperiment(@Param('id') id: string) {
    this.logger.log(`Fetching experiment with ID: ${id}`);
    // Assuming getExperiment exists and takes id. If not, this needs adjusting.
    // Let's assume the correct method is getExperiment based on previous edits/intent.
    return this.searchExperimentService.getExperiment(id);
  }

  @Get('experiments/:id/results')
  @ApiOperation({ summary: 'Get results for a specific search experiment' })
  @ApiResponse({ status: 200, description: 'Returns results for the specified search experiment' })
  async getExperimentResults(@Param('id') id: string) {
    this.logger.log(`Fetching results for experiment ID: ${id}`);
    // TODO: Verify/implement getExperimentResults(id: string) in SearchExperimentService
    // return this.searchExperimentService.getExperimentResults(id);
    return { message: `Results for experiment ${id} - Not implemented yet` };
  }

  @Get('health')
  @ApiOperation({ summary: 'Get search system health status' })
  @ApiResponse({ status: 200, description: 'Returns search system health status' })
  async getHealthStatus() {
    // TODO: Method getHealthStatus missing from SearchMonitoringService
    // return this.searchMonitoringService.getHealthStatus();
    return { message: 'Endpoint not implemented yet.' };
  }

  @Get('analytics/search-paths')
  @ApiOperation({ summary: 'Get common user search paths/journeys' })
  @ApiResponse({ status: 200, description: 'Returns common search paths' })
  @ApiQuery({ name: 'limit', required: false })
  async getSearchPaths(@Query('limit') _limit = 10) {
    this.logger.warn('getSearchPaths endpoint called but not implemented.');
    return { message: 'Endpoint not implemented yet.' };
  }

  @Get('analytics/search-refinements')
  @ApiOperation({ summary: 'Get search refinement patterns' })
  @ApiResponse({ status: 200, description: 'Returns search refinement patterns' })
  @ApiQuery({ name: 'limit', required: false })
  async getSearchRefinements(@Query('limit') _limit = 10) {
    // TODO: Method getSearchRefinements missing from SearchAnalyticsService
    // return this.searchAnalyticsService.getSearchRefinements(limit);
    return { message: 'Endpoint not implemented yet.' };
  }

  @Get('analytics/value-alignment')
  @ApiOperation({ summary: 'Get value alignment metrics in search' })
  @ApiResponse({ status: 200, description: 'Returns value alignment metrics in search' })
  async getValueAlignmentMetrics() {
    // TODO: Method getValueAlignmentMetrics missing from SearchAnalyticsService
    // return this.searchAnalyticsService.getValueAlignmentMetrics();
    return { message: 'Endpoint not implemented yet.' };
  }
}
