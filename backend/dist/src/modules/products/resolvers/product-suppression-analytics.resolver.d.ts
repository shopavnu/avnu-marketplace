import { ProductSuppressionAnalyticsService } from '../services/product-suppression-analytics.service';
export declare class ProductSuppressionAnalyticsResolver {
    private readonly productSuppressionAnalyticsService;
    constructor(productSuppressionAnalyticsService: ProductSuppressionAnalyticsService);
    suppressionMetrics(period?: number, merchantId?: string): Promise<{
        overview: {
            totalSuppressedProducts: number;
            totalActiveSuppressedProducts: number;
            totalResolvedSuppressions: number;
            avgResolutionTimeHours: number;
            suppressionRate: number;
        };
        byMerchant: {
            merchantId: any;
            merchantName: string;
            suppressedCount: number;
            resolvedCount: number;
            avgResolutionTimeHours: number;
            suppressionRate: number;
        }[];
        byCategory: {
            categoryId: any;
            categoryName: string;
            suppressedCount: number;
            resolvedCount: number;
            avgResolutionTimeHours: number;
            suppressionRate: number;
        }[];
        byTimeframe: {
            date: any;
            suppressedCount: number;
            resolvedCount: number;
            avgResolutionTimeHours: number;
            suppressionRate: number;
        }[];
        resolutionTimeDistribution: {
            timeRange: any;
            count: number;
            percentage: number;
        }[];
    }>;
}
