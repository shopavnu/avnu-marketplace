import { AnalyticsService } from './services/analytics.service';
import { SearchAnalyticsService } from './services/search-analytics.service';
import { UserEngagementService } from './services/user-engagement.service';
import { BusinessMetricsService } from './services/business-metrics.service';
import { SearchAnalytics } from './entities/search-analytics.entity';
import { TrackSearchInput } from './graphql/inputs/track-search.input';
import { TrackEngagementInput } from './graphql/inputs/track-engagement.input';
import { UserEngagement } from './entities/user-engagement.entity';
import { BusinessMetrics, TimeGranularity } from './entities/business-metrics.entity';
import { OrderItemInput } from './graphql/inputs/order-item.input';
import { DashboardAnalyticsDto } from './graphql/dtos/dashboard-analytics.dto';
import { SearchAnalyticsSummaryDto } from './graphql/dtos/search-analytics-summary.dto';
import { QueryCountDto } from './graphql/dtos/query-count.dto';
import { UserEngagementSummaryDto } from './graphql/dtos/user-engagement-summary.dto';
export declare class AnalyticsResolver {
  private readonly analyticsService;
  private readonly searchAnalyticsService;
  private readonly userEngagementService;
  private readonly businessMetricsService;
  constructor(
    analyticsService: AnalyticsService,
    searchAnalyticsService: SearchAnalyticsService,
    userEngagementService: UserEngagementService,
    businessMetricsService: BusinessMetricsService,
  );
  trackSearch(data: TrackSearchInput): Promise<SearchAnalytics>;
  trackEngagement(data: TrackEngagementInput): Promise<UserEngagement>;
  trackPageView(
    userId: string,
    sessionId: string,
    pagePath: string,
    referrer: string,
    deviceType: string,
    platform: string,
  ): Promise<UserEngagement>;
  trackProductView(
    userId: string,
    sessionId: string,
    productId: string,
    pagePath: string,
    referrer: string,
    deviceType: string,
    platform: string,
  ): Promise<UserEngagement>;
  trackAddToCart(
    userId: string,
    sessionId: string,
    productId: string,
    quantity: number,
    pagePath: string,
    deviceType: string,
    platform: string,
  ): Promise<UserEngagement>;
  trackCheckoutComplete(
    userId: string,
    sessionId: string,
    orderId: string,
    orderItems: OrderItemInput[],
    totalAmount: number,
    pagePath: string,
    deviceType: string,
    platform: string,
    merchantId: string,
  ): Promise<boolean>;
  dashboardAnalytics(period: number, _context: any): Promise<DashboardAnalyticsDto>;
  searchAnalytics(period: number, _context: any): Promise<SearchAnalyticsSummaryDto>;
  topSearchQueries(limit: number, period: number, _context: any): Promise<QueryCountDto[]>;
  zeroResultQueries(limit: number, period: number, _context: any): Promise<QueryCountDto[]>;
  nlpVsRegularSearchAnalytics(period: number, _context: any): Promise<any>;
  personalizedVsRegularSearchAnalytics(period: number, _context: any): Promise<any>;
  userEngagementAnalytics(period: number, _context: any): Promise<UserEngagementSummaryDto>;
  getUserEngagementByTypeQuery(period: number, _context: any): Promise<any[]>;
  topViewedProducts(limit: number, period: number, _context: any): Promise<any[]>;
  userEngagementFunnel(period: number, _context: any): Promise<any>;
  businessMetricsAnalytics(period: number, _context: any): Promise<any>;
  businessMetricsSummary(period: number, _context: any): Promise<any>;
  revenueMetrics(
    period: number,
    granularity: TimeGranularity,
    _context: any,
  ): Promise<BusinessMetrics[]>;
}
