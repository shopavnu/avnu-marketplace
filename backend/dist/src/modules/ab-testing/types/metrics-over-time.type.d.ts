export declare class PeriodMetricsType {
  period: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
}
export declare class VariantMetricsOverTimeType {
  variantId: string;
  variantName: string;
  isControl?: boolean;
  metricsOverTime: PeriodMetricsType[];
}
export declare class MetricsOverTimeType {
  experimentId: string;
  experimentName: string;
  interval: string;
  variantMetrics: VariantMetricsOverTimeType[];
}
