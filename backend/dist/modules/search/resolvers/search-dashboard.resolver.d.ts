import { SearchMonitoringService } from '../services/search-monitoring.service';
import { SearchAnalyticsService } from '../../analytics/services/search-analytics.service';
import { SearchExperimentService } from '../services/search-experiment.service';
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
} from '../graphql/search-dashboard.types';
export declare class SearchDashboardResolver {
  private readonly searchMonitoringService;
  private readonly searchAnalyticsService;
  private readonly searchExperimentService;
  private readonly logger;
  constructor(
    searchMonitoringService: SearchMonitoringService,
    searchAnalyticsService: SearchAnalyticsService,
    searchExperimentService: SearchExperimentService,
  );
  searchPerformanceMetrics(timeframe?: string): Promise<PerformanceMetricsType>;
  searchRelevanceMetrics(timeframe?: string): Promise<RelevanceMetricsType>;
  popularSearches(limit: number, timeframe?: string): Promise<PopularSearchType[]>;
  zeroResultSearches(limit: number): Promise<ZeroResultSearchType[]>;
  searchEntityDistribution(timeframe?: string): Promise<DashboardEntityDistributionType>;
  searchConversionRate(timeframe: string): Promise<ConversionRateType>;
  searchExperiments(): Promise<ExperimentType[]>;
  searchExperimentById(id: string): Promise<ExperimentType | null>;
  searchExperimentResults(id: string): Promise<ExperimentResultType | null>;
  searchHealthStatus(): Promise<HealthStatusType>;
}
