import { SearchAnalyticsService } from './search-analytics.service';
import { SessionAnalyticsService } from './session-analytics.service';
import { UserPreferenceService } from '../../search/services/user-preference.service';
import { ABTestingService } from '../../search/services/ab-testing.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
export declare class AnalyticsDashboardService {
  private readonly searchAnalyticsService;
  private readonly sessionAnalyticsService;
  private readonly userPreferenceService;
  private readonly abTestingService;
  private readonly elasticsearchService;
  private readonly configService;
  private readonly logger;
  private readonly preferencesIndex;
  private readonly interactionsIndex;
  constructor(
    searchAnalyticsService: SearchAnalyticsService,
    sessionAnalyticsService: SessionAnalyticsService,
    userPreferenceService: UserPreferenceService,
    abTestingService: ABTestingService,
    elasticsearchService: ElasticsearchService,
    configService: ConfigService,
  );
  getSearchPerformanceOverview(period?: number): Promise<any>;
  getEntitySearchPerformance(period?: number): Promise<any>;
  getUserPreferenceAnalytics(limit?: number): Promise<any>;
  getABTestingAnalytics(): Promise<any>;
  getPersonalizationEffectiveness(period?: number): Promise<any>;
  getDashboardOverview(period?: number): Promise<any>;
  private getTopPreferenceValues;
  private getPriceRangeDistribution;
  private getUserInteractionStats;
  private getPreferenceSourceDistribution;
  private getPersonalizationUsageStats;
  private getCollaborativeFilteringStats;
  private getUserPreferenceMetrics;
  private getABTestingSummary;
}
