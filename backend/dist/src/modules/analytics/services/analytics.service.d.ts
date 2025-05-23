import { SearchAnalyticsService } from './search-analytics.service';
import { UserEngagementService } from './user-engagement.service';
import { BusinessMetricsService } from './business-metrics.service';
import { SearchAnalytics } from '../entities/search-analytics.entity';
import { UserEngagement } from '../entities/user-engagement.entity';
import { BusinessMetrics } from '../entities/business-metrics.entity';
export declare class AnalyticsService {
    private readonly searchAnalyticsService;
    private readonly userEngagementService;
    private readonly businessMetricsService;
    private readonly logger;
    constructor(searchAnalyticsService: SearchAnalyticsService, userEngagementService: UserEngagementService, businessMetricsService: BusinessMetricsService);
    trackSearch(data: Partial<SearchAnalytics>): Promise<SearchAnalytics>;
    trackEngagement(data: Partial<UserEngagement>): Promise<UserEngagement>;
    recordMetric(data: Partial<BusinessMetrics>): Promise<BusinessMetrics>;
    getDashboardAnalytics(period?: number): Promise<any>;
    getSearchAnalytics(period?: number): Promise<any>;
    getUserEngagementAnalytics(period?: number): Promise<any>;
    getBusinessMetricsAnalytics(period?: number): Promise<any>;
    trackOrder(orderId: string, userId: string | null, sessionId: string, orderItems: any[], totalAmount: number, merchantId?: string): Promise<void>;
    getPopularSearches(prefix: string, limit?: number, categories?: string[], days?: number): Promise<Array<{
        query: string;
        count: number;
        category?: string;
    }>>;
    calculateAndRecordConversionRates(): Promise<void>;
}
