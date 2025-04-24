import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class PeriodMetricsType {
  @Field()
  period: string;

  @Field(() => Int)
  impressions: number;

  @Field(() => Int)
  conversions: number;

  @Field(() => Float)
  conversionRate: number;
}

@ObjectType()
export class VariantMetricsOverTimeType {
  @Field()
  variantId: string;

  @Field()
  variantName: string;

  @Field({ nullable: true })
  isControl?: boolean;

  @Field(() => [PeriodMetricsType])
  metricsOverTime: PeriodMetricsType[];
}

@ObjectType()
export class MetricsOverTimeType {
  @Field()
  experimentId: string;

  @Field()
  experimentName: string;

  @Field()
  interval: string;

  @Field(() => [VariantMetricsOverTimeType])
  variantMetrics: VariantMetricsOverTimeType[];
}
