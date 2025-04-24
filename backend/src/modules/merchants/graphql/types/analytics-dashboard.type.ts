import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class AnalyticsSummary {
  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Int)
  totalOrders: number;

  @Field(() => Int)
  totalViews: number;

  @Field(() => Int)
  totalClicks: number;

  @Field(() => Float)
  averageOrderValue: number;

  @Field(() => Float)
  overallConversionRate: number;

  @Field(() => Float)
  overallClickThroughRate: number;
}

@ObjectType()
export class TopProduct {
  @Field()
  productId: string;

  @Field()
  productName: string;

  @Field()
  productImage: string;

  @Field(() => Float)
  revenue: number;

  @Field(() => Int)
  orders: number;

  @Field(() => Int)
  views: number;

  @Field(() => Int)
  clicks: number;

  @Field(() => Float)
  conversionRate: number;

  @Field(() => Float)
  clickThroughRate: number;
}

@ObjectType()
export class TimeSeriesDataPoint {
  @Field()
  date: Date;

  @Field(() => Float)
  value: number;
}

@ObjectType()
export class DualChannelTimeSeriesPoint {
  @Field()
  date: Date;

  @Field(() => Float)
  organic: number;

  @Field(() => Float)
  paid: number;

  @Field(() => Float)
  total: number;
}

@ObjectType()
export class ConversionFunnelStage {
  @Field()
  name: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class ConversionRates {
  @Field(() => Float)
  viewToClickRate: number;

  @Field(() => Float)
  clickToCartRate: number;

  @Field(() => Float)
  cartToOrderRate: number;

  @Field(() => Float)
  abandonmentRate: number;

  @Field(() => Float)
  overallConversionRate: number;
}

@ObjectType()
export class ConversionFunnel {
  @Field(() => [ConversionFunnelStage])
  stages: ConversionFunnelStage[];

  @Field(() => ConversionRates)
  conversionRates: ConversionRates;
}

@ObjectType()
export class ChannelMetrics {
  @Field(() => Int)
  organic: number;

  @Field(() => Int)
  paid: number;
}

@ObjectType()
export class OrganicVsPaidPerformance {
  @Field(() => ChannelMetrics)
  impressions: ChannelMetrics;

  @Field(() => ChannelMetrics)
  clicks: ChannelMetrics;

  @Field(() => ChannelMetrics)
  conversionRates: ChannelMetrics;

  @Field(() => ChannelMetrics)
  revenue: ChannelMetrics;
}

@ObjectType()
export class RevenueAnalytics {
  @Field(() => [TimeSeriesDataPoint])
  weekly: TimeSeriesDataPoint[];

  @Field(() => [TimeSeriesDataPoint])
  monthly: TimeSeriesDataPoint[];

  @Field(() => [TimeSeriesDataPoint])
  quarterly: TimeSeriesDataPoint[];

  @Field(() => [TimeSeriesDataPoint])
  yearly: TimeSeriesDataPoint[];
}

@ObjectType()
export class ConversionAnalytics {
  @Field(() => [TimeSeriesDataPoint])
  conversionRateOverTime: TimeSeriesDataPoint[];

  @Field(() => [TimeSeriesDataPoint])
  clickThroughRateOverTime: TimeSeriesDataPoint[];

  @Field(() => [TimeSeriesDataPoint])
  cartAbandonmentRateOverTime: TimeSeriesDataPoint[];
}

@ObjectType()
export class ImpressionAnalytics {
  @Field(() => [DualChannelTimeSeriesPoint])
  impressionsOverTime: DualChannelTimeSeriesPoint[];
}

@ObjectType()
export class DemographicDataPoint {
  @Field()
  key: string;

  @Field(() => Float)
  value: number;

  @Field(() => Float, { nullable: true })
  percentage?: number;
}

@ObjectType()
export class AgeGroupData {
  @Field(() => [DemographicDataPoint])
  distribution: DemographicDataPoint[];

  @Field(() => Float, { nullable: true })
  averageAge?: number;

  @Field(() => String, { nullable: true })
  dominantAgeGroup?: string;
}

@ObjectType()
export class LocationData {
  @Field(() => [DemographicDataPoint])
  countries: DemographicDataPoint[];

  @Field(() => [DemographicDataPoint])
  regions: DemographicDataPoint[];

  @Field(() => [DemographicDataPoint])
  cities: DemographicDataPoint[];
}

@ObjectType()
export class DeviceData {
  @Field(() => [DemographicDataPoint])
  deviceTypes: DemographicDataPoint[];

  @Field(() => [DemographicDataPoint])
  browsers: DemographicDataPoint[];

  @Field(() => [DemographicDataPoint])
  operatingSystems: DemographicDataPoint[];
}

@ObjectType()
export class DemographicAnalytics {
  @Field(() => AgeGroupData)
  ageGroups: AgeGroupData;

  @Field(() => LocationData)
  location: LocationData;

  @Field(() => DeviceData)
  devices: DeviceData;

  @Field(() => [DemographicDataPoint])
  gender: DemographicDataPoint[];

  @Field(() => [DemographicDataPoint])
  interests: DemographicDataPoint[];
}

@ObjectType()
export class MerchantDashboardAnalytics {
  @Field(() => AnalyticsSummary)
  summary: AnalyticsSummary;

  @Field(() => [TopProduct])
  topProducts: TopProduct[];

  @Field(() => GraphQLJSON, { deprecationReason: 'Use demographicAnalytics instead' })
  demographics: any;

  @Field(() => [TimeSeriesDataPoint])
  performanceOverTime: TimeSeriesDataPoint[];

  @Field(() => ConversionFunnel)
  conversionFunnel: ConversionFunnel;

  @Field(() => OrganicVsPaidPerformance)
  organicVsPaidPerformance: OrganicVsPaidPerformance;

  @Field(() => RevenueAnalytics, { nullable: true })
  revenueAnalytics?: RevenueAnalytics;

  @Field(() => ConversionAnalytics, { nullable: true })
  conversionAnalytics?: ConversionAnalytics;

  @Field(() => ImpressionAnalytics, { nullable: true })
  impressionAnalytics?: ImpressionAnalytics;

  @Field(() => DemographicAnalytics, { nullable: true })
  demographicAnalytics?: DemographicAnalytics;
}

@ObjectType()
export class PeriodMetrics {
  @Field()
  label: string;

  @Field(() => Float)
  revenue: number;

  @Field(() => Int)
  orders: number;

  @Field(() => Int)
  views: number;

  @Field(() => Float)
  conversionRate: number;
}

@ObjectType()
export class PeriodComparisonData {
  @Field(() => PeriodMetrics)
  currentPeriod: PeriodMetrics;

  @Field(() => PeriodMetrics)
  previousPeriod: PeriodMetrics;

  @Field(() => [TimeSeriesDataPoint])
  currentPeriodTimeSeries: TimeSeriesDataPoint[];

  @Field(() => [TimeSeriesDataPoint])
  previousPeriodTimeSeries: TimeSeriesDataPoint[];
}
