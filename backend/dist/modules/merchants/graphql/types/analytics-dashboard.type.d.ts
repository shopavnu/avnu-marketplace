export declare class AnalyticsSummary {
    totalRevenue: number;
    totalOrders: number;
    totalViews: number;
    totalClicks: number;
    averageOrderValue: number;
    overallConversionRate: number;
    overallClickThroughRate: number;
}
export declare class TopProduct {
    productId: string;
    productName: string;
    productImage: string;
    revenue: number;
    orders: number;
    views: number;
    clicks: number;
    conversionRate: number;
    clickThroughRate: number;
}
export declare class TimeSeriesDataPoint {
    date: Date;
    value: number;
}
export declare class DualChannelTimeSeriesPoint {
    date: Date;
    organic: number;
    paid: number;
    total: number;
}
export declare class ConversionFunnelStage {
    name: string;
    count: number;
}
export declare class ConversionRates {
    viewToClickRate: number;
    clickToCartRate: number;
    cartToOrderRate: number;
    abandonmentRate: number;
    overallConversionRate: number;
}
export declare class ConversionFunnel {
    stages: ConversionFunnelStage[];
    conversionRates: ConversionRates;
}
export declare class ChannelMetrics {
    organic: number;
    paid: number;
}
export declare class OrganicVsPaidPerformance {
    impressions: ChannelMetrics;
    clicks: ChannelMetrics;
    conversionRates: ChannelMetrics;
    revenue: ChannelMetrics;
}
export declare class RevenueAnalytics {
    weekly: TimeSeriesDataPoint[];
    monthly: TimeSeriesDataPoint[];
    quarterly: TimeSeriesDataPoint[];
    yearly: TimeSeriesDataPoint[];
}
export declare class ConversionAnalytics {
    conversionRateOverTime: TimeSeriesDataPoint[];
    clickThroughRateOverTime: TimeSeriesDataPoint[];
    cartAbandonmentRateOverTime: TimeSeriesDataPoint[];
}
export declare class ImpressionAnalytics {
    impressionsOverTime: DualChannelTimeSeriesPoint[];
}
export declare class DemographicDataPoint {
    key: string;
    value: number;
    percentage?: number;
}
export declare class AgeGroupData {
    distribution: DemographicDataPoint[];
    averageAge?: number;
    dominantAgeGroup?: string;
}
export declare class LocationData {
    countries: DemographicDataPoint[];
    regions: DemographicDataPoint[];
    cities: DemographicDataPoint[];
}
export declare class DeviceData {
    deviceTypes: DemographicDataPoint[];
    browsers: DemographicDataPoint[];
    operatingSystems: DemographicDataPoint[];
}
export declare class DemographicAnalytics {
    ageGroups: AgeGroupData;
    location: LocationData;
    devices: DeviceData;
    gender: DemographicDataPoint[];
    interests: DemographicDataPoint[];
}
export declare class MerchantDashboardAnalytics {
    summary: AnalyticsSummary;
    topProducts: TopProduct[];
    demographics: any;
    performanceOverTime: TimeSeriesDataPoint[];
    conversionFunnel: ConversionFunnel;
    organicVsPaidPerformance: OrganicVsPaidPerformance;
    revenueAnalytics?: RevenueAnalytics;
    conversionAnalytics?: ConversionAnalytics;
    impressionAnalytics?: ImpressionAnalytics;
    demographicAnalytics?: DemographicAnalytics;
}
export declare class PeriodMetrics {
    label: string;
    revenue: number;
    orders: number;
    views: number;
    conversionRate: number;
}
export declare class PeriodComparisonData {
    currentPeriod: PeriodMetrics;
    previousPeriod: PeriodMetrics;
    currentPeriodTimeSeries: TimeSeriesDataPoint[];
    previousPeriodTimeSeries: TimeSeriesDataPoint[];
}
