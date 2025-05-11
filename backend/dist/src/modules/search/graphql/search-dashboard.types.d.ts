import { ExperimentStatus } from '../../ab-testing/entities/experiment.entity';
export declare class PerformanceMetricsType {
  averageResponseTime: number;
  totalSearches: number;
  slowSearches: number;
  responseTimeDistribution: TimeSeriesDataPoint[];
  searchVolumeByHour: TimeSeriesDataPoint[];
  p95ResponseTime: number;
  p99ResponseTime: number;
}
export declare class RelevanceMetricsType {
  averageRelevanceScore: number;
  clickThroughRate: number;
  zeroResultRate: number;
  entityRelevanceScores: EntityRelevanceScore[];
  relevanceScoreByDay: TimeSeriesDataPoint[];
  averageResultCount: number;
}
export declare class EntityRelevanceScore {
  entityType: string;
  averageScore: number;
}
export declare class TimeSeriesDataPoint {
  timestamp: string;
  value: number;
}
export declare class PopularSearchType {
  query: string;
  count: number;
  conversionRate: number;
  clickThroughRate?: number;
  averageResultCount?: number;
}
export declare class ZeroResultSearchType {
  query: string;
  count: number;
  suggestedAlternatives?: string[];
  lastSearched: Date;
}
export declare class DashboardEntityDistributionType {
  products: number;
  merchants: number;
  brands: number;
  byPopularQueries?: EntityDistributionByQuery[];
}
export declare class EntityDistributionByQuery {
  query: string;
  products: number;
  merchants: number;
  brands: number;
}
export declare class ConversionRateType {
  overall: number;
  fromProductSearch: number;
  fromMerchantSearch: number;
  fromBrandSearch: number;
  byDay: TimeSeriesDataPoint[];
}
export declare class DashboardExperimentVariant {
  id: string;
  name: string;
  description: string;
  trafficPercentage: number;
}
export declare class ExperimentType {
  id: string;
  name: string;
  description: string;
  status: ExperimentStatus;
  startDate: Date;
  endDate?: Date;
  variants: DashboardExperimentVariant[];
  targetAudience?: string;
  metadata?: string;
}
export declare class VariantResult {
  variantId: string;
  variantName: string;
  impressions: number;
  clicks: number;
  conversions: number;
  clickThroughRate: number;
  conversionRate: number;
  averageRelevanceScore?: number;
  averageResponseTime?: number;
}
export declare class ExperimentResultType {
  experimentId: string;
  experimentName: string;
  results: VariantResult[];
  winningVariantId?: string;
  confidenceLevel?: number;
  hasStatisticalSignificance: boolean;
}
export declare class HealthStatusType {
  isHealthy: boolean;
  alerts?: SystemAlert[];
  uptime: number;
  activeConnections: number;
  cacheHitRate: number;
  indexingLatency: number;
}
export declare class SystemAlert {
  type: string;
  message: string;
  severity: string;
  timestamp: Date;
}
export declare class SearchPathType {
  userId?: string;
  sessionId: string;
  steps: SearchStep[];
  resultedInPurchase: boolean;
  startTime: Date;
  endTime?: Date;
}
export declare class SearchStep {
  query: string;
  resultCount: number;
  clickedResults?: string[];
  timestamp: Date;
  durationSeconds?: number;
}
export declare class SearchRefinementType {
  originalQuery: string;
  refinedQuery: string;
  occurrences: number;
  successRate: number;
}
export declare class ValueAlignmentMetricsType {
  searchesByValue: ValueSearchMetric[];
  valueAlignedSearchPercentage: number;
  valueAlignedConversionRate: number;
  nonValueAlignedConversionRate: number;
}
export declare class ValueSearchMetric {
  value: string;
  searchCount: number;
  conversionRate: number;
}
