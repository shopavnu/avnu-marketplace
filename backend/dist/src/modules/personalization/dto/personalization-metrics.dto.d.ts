export declare class MetricComparisonDto {
  personalized: number;
  nonPersonalized: number;
  improvement: number;
  trend: number;
}
export declare class HistoricalDataDto {
  dates: string[];
  personalized: number[];
  nonPersonalized: number[];
}
export declare class CategoryPercentageDto {
  name: string;
  percentage: number;
}
export declare class PersonalizationMetricsDto {
  conversionRate: MetricComparisonDto;
  clickThroughRate: MetricComparisonDto;
  averageOrderValue: MetricComparisonDto;
  timeOnSite: MetricComparisonDto;
  recommendationAccuracy: number;
  userSatisfaction: number;
  historicalData: HistoricalDataDto;
  topRecommendationCategories: CategoryPercentageDto[];
}
