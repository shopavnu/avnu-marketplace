import { AnalyticsService } from './services/analytics.service';
import { SearchAnalyticsService } from './services/search-analytics.service';
import { UserEngagementService } from './services/user-engagement.service';
import { BusinessMetricsService } from './services/business-metrics.service';
import { SearchAnalytics } from './entities/search-analytics.entity';
import { UserEngagement } from './entities/user-engagement.entity';
import { TimeGranularity } from './entities/business-metrics.entity';
export declare class AnalyticsController {
    private readonly analyticsService;
    private readonly searchAnalyticsService;
    private readonly userEngagementService;
    private readonly businessMetricsService;
    constructor(analyticsService: AnalyticsService, searchAnalyticsService: SearchAnalyticsService, userEngagementService: UserEngagementService, businessMetricsService: BusinessMetricsService);
    trackSearch(data: Partial<SearchAnalytics>): Promise<SearchAnalytics>;
    trackEngagement(data: Partial<UserEngagement>): Promise<UserEngagement>;
    trackPageView(body: {
        userId?: string;
        sessionId: string;
        pagePath: string;
        referrer?: string;
        deviceType?: string;
        platform?: string;
        userAgent?: string;
        ipAddress?: string;
    }): Promise<UserEngagement>;
    trackProductView(body: {
        userId?: string;
        sessionId: string;
        productId: string;
        pagePath: string;
        referrer?: string;
        deviceType?: string;
        platform?: string;
    }): Promise<UserEngagement>;
    trackAddToCart(body: {
        userId?: string;
        sessionId: string;
        productId: string;
        quantity: number;
        pagePath: string;
        deviceType?: string;
        platform?: string;
    }): Promise<UserEngagement>;
    trackCheckoutComplete(body: {
        userId?: string;
        sessionId: string;
        orderId: string;
        orderItems: any[];
        totalAmount: number;
        pagePath: string;
        deviceType?: string;
        platform?: string;
        merchantId?: string;
    }): Promise<{
        success: boolean;
    }>;
    getDashboardAnalytics(period?: number): Promise<any>;
    getSearchAnalytics(period?: number): Promise<any>;
    getTopSearchQueries(limit?: number, period?: number): Promise<any[]>;
    getZeroResultQueries(limit?: number, period?: number): Promise<any[]>;
    getNlpVsRegularSearchAnalytics(period?: number): Promise<any>;
    getPersonalizedVsRegularSearchAnalytics(period?: number): Promise<any>;
    getUserEngagementAnalytics(period?: number): Promise<any>;
    getUserEngagementByType(period?: number): Promise<any[]>;
    getTopViewedProducts(limit?: number, period?: number): Promise<any[]>;
    getUserEngagementFunnel(period?: number): Promise<any>;
    getBusinessMetricsAnalytics(period?: number): Promise<any>;
    getBusinessMetricsSummary(period?: number): Promise<any>;
    getRevenueMetrics(period?: number, granularity?: TimeGranularity): Promise<import("./entities/business-metrics.entity").BusinessMetrics[]>;
}
