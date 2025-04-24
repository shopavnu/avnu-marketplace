import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
// import { RolesGuard } from '../../auth/guards/roles.guard'; // TODO: Implement or restore RolesGuard
// import { Roles } from '../../auth/decorators/roles.decorator'; // TODO: Implement or restore Roles decorator
// import { CurrentUser } from '../../auth/decorators/current-user.decorator'; // TODO: Implement or restore CurrentUser decorator
import {} from /* User */ '../../users/entities/user.entity';
import {} from /* UserRole */ '../../users/entities/user.entity'; // Corrected path
import { SearchMonitoringService } from '../services/search-monitoring.service';
import { SearchAnalyticsService } from '../../analytics/services/search-analytics.service';
import { SearchExperimentService } from '../services/search-experiment.service';
import { SearchEntityType } from '../enums/search-entity-type.enum'; // Updated import path

import {
  PerformanceMetricsType,
  RelevanceMetricsType,
  PopularSearchType,
  ZeroResultSearchType,
  DashboardEntityDistributionType,
  ConversionRateType,
  ExperimentType,
  ExperimentResultType,
  HealthStatusType,
  SearchPathType as _SearchPathType,
  SearchRefinementType as _SearchRefinementType,
  ValueAlignmentMetricsType as _ValueAlignmentMetricsType,
} from '../graphql/search-dashboard.types';

@Resolver()
@UseGuards(GqlAuthGuard)
// @UseGuards(GqlJwtAuthGuard, RolesGuard) // TODO: RolesGuard missing
export class SearchDashboardResolver {
  private readonly logger = new Logger(SearchDashboardResolver.name);

  constructor(
    private readonly searchMonitoringService: SearchMonitoringService,
    private readonly searchAnalyticsService: SearchAnalyticsService,
    private readonly searchExperimentService: SearchExperimentService,
  ) {}

  @Query(() => PerformanceMetricsType)
  @UseGuards(GqlAuthGuard)
  async searchPerformanceMetrics(
    @Args('timeframe', { type: () => String, nullable: true }) timeframe?: string,
  ): Promise<PerformanceMetricsType> {
    this.logger.log(`Fetching search performance metrics for timeframe: ${timeframe || 'default'}`);
    try {
      // TODO: Parse timeframe string (e.g., '7d', '30d') into number of days/minutes expected by service
      const periodInMinutes = parseInt(timeframe?.replace('d', '') || '60'); // Basic placeholder parsing
      const stats = await this.searchMonitoringService.getPerformanceStats(periodInMinutes);

      // Map PerformanceStats to PerformanceMetricsType
      return {
        averageResponseTime: stats.averageDuration,
        totalSearches: stats.totalSearches,
        slowSearches: stats.warningCount + stats.criticalCount,
        p95ResponseTime: stats.p95Duration,
        p99ResponseTime: stats.p99Duration,
        // Return empty arrays for fields not available in PerformanceStats
        responseTimeDistribution: [],
        searchVolumeByHour: [],
      };
    } catch (error) {
      this.logger.error(`Error fetching performance metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Query(() => RelevanceMetricsType)
  @UseGuards(GqlAuthGuard)
  async searchRelevanceMetrics(
    @Args('timeframe', { type: () => String, nullable: true }) timeframe?: string,
  ): Promise<RelevanceMetricsType> {
    this.logger.log(`Fetching search relevance metrics for timeframe: ${timeframe || 'default'}`);
    try {
      // TODO: Parse timeframe string into period expected by service
      const periodInMinutes = parseInt(timeframe?.replace('d', '') || '60');
      const stats = await this.searchMonitoringService.getRelevanceStats(periodInMinutes);

      // Map RelevanceStats to RelevanceMetricsType
      return {
        averageRelevanceScore: stats.averageRelevance,
        zeroResultRate: stats.zeroResultsRate,
        entityRelevanceScores: Object.entries(stats.entityDistribution || {}).map(
          ([type, score]) => ({
            entityType: type,
            averageScore: score,
          }),
        ),
        // Return default/empty values for fields not available in RelevanceStats
        clickThroughRate: 0,
        relevanceScoreByDay: [],
        averageResultCount: 0, // Might need calculation if data becomes available
      };
    } catch (error) {
      this.logger.error(`Error fetching relevance metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Query(() => [PopularSearchType])
  // @Roles(UserRole.ADMIN, UserRole.MERCHANT) // TODO: Roles decorator missing
  async popularSearches(
    @Args('limit', { nullable: true, type: () => Int, defaultValue: 10 }) limit: number,
    @Args('timeframe', { type: () => String, nullable: true }) timeframe?: string,
  ): Promise<PopularSearchType[]> {
    this.logger.log(
      `Fetching popular searches with limit: ${limit} for timeframe: ${timeframe || 'default'}`,
    );
    try {
      // TODO: Parse timeframe string into period expected by service
      const periodInDays = parseInt(timeframe?.replace('d', '') || '30');
      const popular = await this.searchAnalyticsService.getTopSearchQueries(limit, periodInDays);
      // Map the result (any[]) to PopularSearchType[]
      return popular.map(p => ({
        query: p.query,
        count: p.count,
        // Assume conversionRate and potentially others are available or default them
        conversionRate: p.conversionRate ?? 0,
        clickThroughRate: p.clickThroughRate,
        averageResultCount: p.averageResultCount,
      }));
    } catch (error) {
      this.logger.error(`Error fetching popular searches: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Query(() => [ZeroResultSearchType])
  // @Roles(UserRole.ADMIN, UserRole.MERCHANT) // TODO: Roles decorator missing
  async zeroResultSearches(
    @Args('limit', { nullable: true, type: () => Int, defaultValue: 10 }) limit: number,
    // @CurrentUser() user: User // TODO: CurrentUser decorator missing
  ): Promise<ZeroResultSearchType[]> {
    this.logger.log(`Fetching zero-result searches for limit: ${limit || 'default'}`);
    try {
      return await this.searchAnalyticsService.getZeroResultQueries(limit);
    } catch (error) {
      this.logger.error(`Error fetching zero-result searches: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Query(() => DashboardEntityDistributionType)
  // @Roles(UserRole.ADMIN, UserRole.MERCHANT) // TODO: Roles decorator missing
  async searchEntityDistribution(
    @Args('timeframe', { type: () => String, nullable: true }) timeframe?: string,
  ): Promise<DashboardEntityDistributionType> {
    this.logger.log(`Fetching entity distribution for timeframe: ${timeframe || 'default'}`);
    try {
      const periodInDays = parseInt(timeframe?.replace('d', '') || '30');

      // Fetch analytics for each entity type
      const [productsData, merchantsData, brandsData] = await Promise.all([
        this.searchAnalyticsService.getEntitySearchAnalytics(
          SearchEntityType.PRODUCT,
          periodInDays,
        ),
        this.searchAnalyticsService.getEntitySearchAnalytics(
          SearchEntityType.MERCHANT,
          periodInDays,
        ),
        this.searchAnalyticsService.getEntitySearchAnalytics(SearchEntityType.BRAND, periodInDays),
      ]);

      // Combine results into DashboardEntityDistributionType
      return {
        products: productsData.searches || 0,
        merchants: merchantsData.searches || 0,
        brands: brandsData.searches || 0,
        // byPopularQueries is not directly available from this service method
        byPopularQueries: [],
      };
    } catch (error) {
      this.logger.error(`Error fetching entity distribution: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Query(() => ConversionRateType)
  // @Roles(UserRole.ADMIN, UserRole.MERCHANT) // TODO: Roles decorator missing
  async searchConversionRate(
    @Args('timeframe', { nullable: true, defaultValue: 'day' }) timeframe: string,
    // @CurrentUser() user: User // TODO: CurrentUser decorator missing
  ): Promise<ConversionRateType> {
    this.logger.log(`Fetching search conversion rate for timeframe: ${timeframe || 'default'}`);
    try {
      // TODO: Parse timeframe string (e.g., '7d', '30d') into number of days
      const periodInDays = parseInt(timeframe) || 30; // Placeholder parsing
      const overallRate = await this.searchAnalyticsService.getSearchConversionRate(periodInDays);
      // Construct the full ConversionRateType object as expected by GraphQL
      return {
        overall: overallRate,
        // TODO: Implement data fetching for these specific conversion rates
        fromProductSearch: 0, // Placeholder
        fromMerchantSearch: 0, // Placeholder
        fromBrandSearch: 0, // Placeholder
        // TODO: Implement data fetching for time series conversion data
        byDay: [], // Placeholder
      };
    } catch (error) {
      this.logger.error(`Error fetching conversion rate: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Query(() => [ExperimentType])
  // @Roles(UserRole.ADMIN, UserRole.MERCHANT) // TODO: Roles decorator missing
  async searchExperiments() // @CurrentUser() user: User // TODO: CurrentUser decorator missing
  : Promise<ExperimentType[]> {
    this.logger.log(`Fetching search experiments`);
    try {
      // Return directly - GraphQL type ExperimentType (with DashboardExperimentVariant)
      // should be compatible with SearchExperiment (with SearchExperimentVariant)
      return await this.searchExperimentService.getExperiments();
    } catch (error) {
      this.logger.error(`Error fetching experiments: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Query(() => ExperimentType, { nullable: true })
  // @Roles(UserRole.ADMIN, UserRole.MERCHANT) // TODO: Roles decorator missing
  async searchExperimentById(
    @Args('id') id: string,
    // @CurrentUser() user: User // TODO: CurrentUser decorator missing
  ): Promise<ExperimentType | null> {
    this.logger.log(`Fetching search experiment by id: ${id}`);
    try {
      const experiments = await this.searchExperimentService.getExperiments();
      const experiment = experiments.find(exp => exp.id === id);
      if (!experiment) {
        throw new Error(`Experiment with ID ${id} not found`);
      }
      // Need to map SearchExperiment to ExperimentType if they differ
      return experiment as unknown as ExperimentType; // Placeholder cast
    } catch (error) {
      this.logger.error(`Error fetching experiment by id: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Query(() => ExperimentResultType, { nullable: true })
  // @Roles(UserRole.ADMIN, UserRole.MERCHANT) // TODO: Roles decorator missing
  async searchExperimentResults(
    @Args('id') id: string,
    // @CurrentUser() user: User // TODO: CurrentUser decorator missing
  ): Promise<ExperimentResultType | null> {
    this.logger.log(`Fetching search experiment results by id: ${id}`);
    try {
      const experiments = await this.searchExperimentService.getExperiments();
      const experiment = experiments.find(exp => exp.id === id);
      if (!experiment) {
        throw new Error(`Experiment with ID ${id} not found`);
      }
      // Need to map SearchExperiment to ExperimentType if they differ
      return experiment as unknown as ExperimentResultType; // Placeholder cast
    } catch (error) {
      this.logger.error(`Error fetching experiment results: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Query(() => HealthStatusType)
  @UseGuards(GqlAuthGuard)
  async searchHealthStatus(): Promise<HealthStatusType> {
    this.logger.log('Fetching search system health status');
    try {
      const health = await this.searchMonitoringService.getSearchHealthStatus();

      // Map SearchHealthStatus to HealthStatusType (simplified mapping)
      return {
        isHealthy: health.status === 'healthy',
        // Return default/empty values for fields not available in SearchHealthStatus
        alerts: [], // Assuming no direct alert info here
        uptime: 0, // Placeholder
        activeConnections: 0, // Placeholder
        cacheHitRate: 0, // Placeholder
        indexingLatency: 0, // Placeholder
      };
    } catch (error) {
      this.logger.error(`Error fetching health status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /* // Commenting out as getSearchPaths doesn't exist in SearchAnalyticsService
  @Query(() => [SearchPathType])
  @UseGuards(GqlAuthGuard)
  // @Roles(UserRole.ADMIN, UserRole.MERCHANT)
  async searchPaths(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
    @Args('userId', { type: () => ID, nullable: true }) userId?: string,
  ): Promise<SearchPathType[]> {
    this.logger.log(`Fetching search paths with limit: ${limit}, userId: ${userId || 'any'}`);
    try {
      // return await this.searchAnalyticsService.getSearchPaths(limit, userId);
      return []; // Return empty array for now
    } catch (error) {
      this.logger.error(`Error fetching search paths: ${error.message}`, error.stack);
      throw error;
    }
  }
  */

  /* // Commenting out as getSearchRefinements doesn't exist in SearchAnalyticsService
  @Query(() => [SearchRefinementType])
  @UseGuards(GqlAuthGuard)
  // @Roles(UserRole.ADMIN, UserRole.MERCHANT) // TODO: Roles decorator missing
  async searchRefinements(
    @Args('limit', { nullable: true, type: () => Int, defaultValue: 10 }) limit: number,
    // @CurrentUser() user: User // TODO: CurrentUser decorator missing
  ): Promise<SearchRefinementType[]> {
    this.logger.log(`Fetching search refinements for limit: ${limit || 'default'}`);
    try {
      return await this.searchAnalyticsService.getSearchRefinements(limit);
    } catch (error) {
      this.logger.error(`Error fetching search refinements: ${error.message}`, error.stack);
      throw error;
    }
  }
  */

  /* // Commenting out as getValueAlignmentMetrics doesn't exist in SearchAnalyticsService
  @Query(() => ValueAlignmentMetricsType)
  // @Roles(UserRole.ADMIN, UserRole.MERCHANT) // TODO: Roles decorator missing
  async searchValueAlignmentMetrics(
    // @CurrentUser() user: User // TODO: CurrentUser decorator missing
  ): Promise<ValueAlignmentMetricsType> {
    this.logger.log(`Fetching search value alignment metrics`);
    try {
      return await this.searchAnalyticsService.getValueAlignmentMetrics();
    } catch (error) {
      this.logger.error(`Error fetching value alignment metrics: ${error.message}`, error.stack);
      throw error;
    }
  }
  */

  // --- Mutations ---
}

function _parseTimeframeToDaysHelper(timeframe?: string): number {
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
