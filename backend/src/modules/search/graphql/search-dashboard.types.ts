import { ObjectType, Field, Int, Float, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { ExperimentStatus } from '../../ab-testing/entities/experiment.entity';

@ObjectType()
export class PerformanceMetricsType {
  @Field(() => Float)
  averageResponseTime: number;

  @Field(() => Int)
  totalSearches: number;

  @Field(() => Int)
  slowSearches: number;

  @Field(() => [TimeSeriesDataPoint])
  responseTimeDistribution: TimeSeriesDataPoint[];

  @Field(() => [TimeSeriesDataPoint])
  searchVolumeByHour: TimeSeriesDataPoint[];

  @Field(() => Float)
  p95ResponseTime: number;

  @Field(() => Float)
  p99ResponseTime: number;
}

@ObjectType()
export class RelevanceMetricsType {
  @Field(() => Float)
  averageRelevanceScore: number;

  @Field(() => Float)
  clickThroughRate: number;

  @Field(() => Float)
  zeroResultRate: number;

  @Field(() => [EntityRelevanceScore])
  entityRelevanceScores: EntityRelevanceScore[];

  @Field(() => [TimeSeriesDataPoint])
  relevanceScoreByDay: TimeSeriesDataPoint[];

  @Field(() => Float)
  averageResultCount: number;
}

@ObjectType()
export class EntityRelevanceScore {
  @Field()
  entityType: string;

  @Field(() => Float)
  averageScore: number;
}

@ObjectType()
export class TimeSeriesDataPoint {
  @Field()
  timestamp: string;

  @Field(() => Float)
  value: number;
}

@ObjectType()
export class PopularSearchType {
  @Field()
  query: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  conversionRate: number;

  @Field(() => Float, { nullable: true })
  clickThroughRate?: number;

  @Field(() => Float, { nullable: true })
  averageResultCount?: number;
}

@ObjectType()
export class ZeroResultSearchType {
  @Field()
  query: string;

  @Field(() => Int)
  count: number;

  @Field(() => [String], { nullable: true })
  suggestedAlternatives?: string[];

  @Field(() => GraphQLISODateTime)
  lastSearched: Date;
}

@ObjectType()
export class DashboardEntityDistributionType {
  @Field(() => Int)
  products: number;

  @Field(() => Int)
  merchants: number;

  @Field(() => Int)
  brands: number;

  @Field(() => [EntityDistributionByQuery], { nullable: true })
  byPopularQueries?: EntityDistributionByQuery[];
}

@ObjectType()
export class EntityDistributionByQuery {
  @Field()
  query: string;

  @Field(() => Int)
  products: number;

  @Field(() => Int)
  merchants: number;

  @Field(() => Int)
  brands: number;
}

@ObjectType()
export class ConversionRateType {
  @Field(() => Float)
  overall: number;

  @Field(() => Float)
  fromProductSearch: number;

  @Field(() => Float)
  fromMerchantSearch: number;

  @Field(() => Float)
  fromBrandSearch: number;

  @Field(() => [TimeSeriesDataPoint])
  byDay: TimeSeriesDataPoint[];
}

@ObjectType()
export class DashboardExperimentVariant {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Float)
  trafficPercentage: number;

  // NOTE: Does not include fields like configuration, isControl, results etc.
  // as they are not readily available from the SearchExperimentService.
}

@ObjectType()
export class ExperimentType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => ExperimentStatus)
  status: ExperimentStatus;

  @Field(() => GraphQLISODateTime)
  startDate: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  endDate?: Date;

  @Field(() => [DashboardExperimentVariant]) // Use the simpler dashboard-specific type
  variants: DashboardExperimentVariant[];

  @Field(() => String, { nullable: true })
  targetAudience?: string;

  @Field(() => String, { nullable: true })
  metadata?: string;
}

@ObjectType()
export class VariantResult {
  @Field(() => ID)
  variantId: string;

  @Field()
  variantName: string;

  @Field(() => Int)
  impressions: number;

  @Field(() => Int)
  clicks: number;

  @Field(() => Int)
  conversions: number;

  @Field(() => Float)
  clickThroughRate: number;

  @Field(() => Float)
  conversionRate: number;

  @Field(() => Float, { nullable: true })
  averageRelevanceScore?: number;

  @Field(() => Float, { nullable: true })
  averageResponseTime?: number;
}

@ObjectType()
export class ExperimentResultType {
  @Field(() => ID)
  experimentId: string;

  @Field()
  experimentName: string;

  @Field(() => [VariantResult])
  results: VariantResult[];

  @Field(() => String, { nullable: true })
  winningVariantId?: string;

  @Field(() => Float, { nullable: true })
  confidenceLevel?: number;

  @Field(() => Boolean)
  hasStatisticalSignificance: boolean;
}

@ObjectType()
export class HealthStatusType {
  @Field(() => Boolean)
  isHealthy: boolean;

  @Field(() => [SystemAlert], { nullable: true })
  alerts?: SystemAlert[];

  @Field(() => Float)
  uptime: number;

  @Field(() => Int)
  activeConnections: number;

  @Field(() => Float)
  cacheHitRate: number;

  @Field(() => Float)
  indexingLatency: number;
}

@ObjectType()
export class SystemAlert {
  @Field()
  type: string;

  @Field()
  message: string;

  @Field()
  severity: string;

  @Field(() => GraphQLISODateTime)
  timestamp: Date;
}

@ObjectType()
export class SearchPathType {
  @Field(() => ID, { nullable: true })
  userId?: string;

  @Field(() => ID)
  sessionId: string;

  @Field(() => [SearchStep])
  steps: SearchStep[];

  @Field(() => Boolean)
  resultedInPurchase: boolean;

  @Field(() => GraphQLISODateTime)
  startTime: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  endTime?: Date;
}

@ObjectType()
export class SearchStep {
  @Field()
  query: string;

  @Field(() => Int)
  resultCount: number;

  @Field(() => [String], { nullable: true })
  clickedResults?: string[];

  @Field(() => GraphQLISODateTime)
  timestamp: Date;

  @Field(() => Int, { nullable: true })
  durationSeconds?: number;
}

@ObjectType()
export class SearchRefinementType {
  @Field()
  originalQuery: string;

  @Field()
  refinedQuery: string;

  @Field(() => Int)
  occurrences: number;

  @Field(() => Float)
  successRate: number;
}

@ObjectType()
export class ValueAlignmentMetricsType {
  @Field(() => [ValueSearchMetric])
  searchesByValue: ValueSearchMetric[];

  @Field(() => Float)
  valueAlignedSearchPercentage: number;

  @Field(() => Float)
  valueAlignedConversionRate: number;

  @Field(() => Float)
  nonValueAlignedConversionRate: number;
}

@ObjectType()
export class ValueSearchMetric {
  @Field()
  value: string;

  @Field(() => Int)
  searchCount: number;

  @Field(() => Float)
  conversionRate: number;
}
