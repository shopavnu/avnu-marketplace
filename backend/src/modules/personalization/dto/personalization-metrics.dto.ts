import { Field, ObjectType, Float } from '@nestjs/graphql';

@ObjectType()
export class MetricComparisonDto {
  @Field(() => Float)
  personalized: number;

  @Field(() => Float)
  nonPersonalized: number;

  @Field(() => Float)
  improvement: number;

  @Field(() => Float)
  trend: number;
}

@ObjectType()
export class HistoricalDataDto {
  @Field(() => [String])
  dates: string[];

  @Field(() => [Float])
  personalized: number[];

  @Field(() => [Float])
  nonPersonalized: number[];
}

@ObjectType()
export class CategoryPercentageDto {
  @Field()
  name: string;

  @Field(() => Float)
  percentage: number;
}

@ObjectType()
export class PersonalizationMetricsDto {
  @Field(() => MetricComparisonDto)
  conversionRate: MetricComparisonDto;

  @Field(() => MetricComparisonDto)
  clickThroughRate: MetricComparisonDto;

  @Field(() => MetricComparisonDto)
  averageOrderValue: MetricComparisonDto;

  @Field(() => MetricComparisonDto)
  timeOnSite: MetricComparisonDto;

  @Field(() => Float)
  recommendationAccuracy: number;

  @Field(() => Float)
  userSatisfaction: number;

  @Field(() => HistoricalDataDto)
  historicalData: HistoricalDataDto;

  @Field(() => [CategoryPercentageDto])
  topRecommendationCategories: CategoryPercentageDto[];
}
