import { Field, ObjectType, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class AdPerformanceMetric {
  @Field()
  date: string;

  @Field(() => Int)
  impressions: number;

  @Field(() => Int)
  clicks: number;

  @Field(() => Float)
  clickThroughRate: number;

  @Field(() => Int)
  conversions: number;

  @Field(() => Float)
  conversionRate: number;

  @Field(() => Float)
  revenue: number;

  @Field(() => Float)
  cost: number;

  @Field(() => Float)
  roi: number;
}

@ObjectType()
export class AdCampaign {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  merchantId: string;

  @Field()
  merchantName: string;

  @Field()
  status: string;

  @Field()
  startDate: string;

  @Field({ nullable: true })
  endDate?: string;

  @Field(() => Int)
  totalImpressions: number;

  @Field(() => Int)
  totalClicks: number;

  @Field(() => Float)
  clickThroughRate: number;

  @Field(() => Int)
  totalConversions: number;

  @Field(() => Float)
  conversionRate: number;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Float)
  totalCost: number;

  @Field(() => Float)
  roi: number;

  @Field(() => [AdPerformanceMetric])
  dailyMetrics: AdPerformanceMetric[];
}

@ObjectType()
export class HistoricalMetricPoint {
  @Field()
  date: string;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Float)
  totalCost: number;

  @Field(() => Float)
  platformAdRevenue: number;

  @Field(() => Float)
  productSalesFromAds: number;

  @Field(() => Int)
  totalImpressions: number;

  @Field(() => Int)
  totalClicks: number;

  @Field(() => Int)
  totalConversions: number;
}

@ObjectType()
export class MerchantAdMetrics {
  @Field(() => [AdCampaign])
  campaigns: AdCampaign[];

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Float)
  totalCost: number;

  @Field(() => Float)
  totalRoi: number;

  @Field(() => Int)
  totalImpressions: number;

  @Field(() => Int)
  totalClicks: number;

  @Field(() => Float)
  averageClickThroughRate: number;

  @Field(() => Int)
  totalConversions: number;

  @Field(() => Float)
  averageConversionRate: number;
  
  // Platform revenue (what Avnu makes from ads)
  @Field(() => Float)
  platformAdRevenue: number;

  // Product sales revenue (dollars sold because of ads)
  @Field(() => Float)
  productSalesFromAds: number;

  // Return on ad spend (ROAS) - product sales / ad spend
  @Field(() => Float)
  returnOnAdSpend: number;

  // Conversion value - average revenue per conversion
  @Field(() => Float)
  averageConversionValue: number;

  // Cost per acquisition
  @Field(() => Float)
  costPerAcquisition: number;

  // Historical metrics for trend tracking
  @Field(() => [HistoricalMetricPoint])
  historicalMetrics: HistoricalMetricPoint[];
}
