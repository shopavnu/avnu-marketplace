export declare class AdPerformanceMetric {
    date: string;
    impressions: number;
    clicks: number;
    clickThroughRate: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    cost: number;
    roi: number;
}
export declare class AdCampaign {
    id: string;
    name: string;
    merchantId: string;
    merchantName: string;
    status: string;
    startDate: string;
    endDate?: string;
    totalImpressions: number;
    totalClicks: number;
    clickThroughRate: number;
    totalConversions: number;
    conversionRate: number;
    totalRevenue: number;
    totalCost: number;
    roi: number;
    dailyMetrics: AdPerformanceMetric[];
}
export declare class HistoricalMetricPoint {
    date: string;
    totalRevenue: number;
    totalCost: number;
    platformAdRevenue: number;
    productSalesFromAds: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
}
export declare class MerchantAdMetrics {
    campaigns: AdCampaign[];
    totalRevenue: number;
    totalCost: number;
    totalRoi: number;
    totalImpressions: number;
    totalClicks: number;
    averageClickThroughRate: number;
    totalConversions: number;
    averageConversionRate: number;
    platformAdRevenue: number;
    productSalesFromAds: number;
    returnOnAdSpend: number;
    averageConversionValue: number;
    costPerAcquisition: number;
    historicalMetrics: HistoricalMetricPoint[];
}
