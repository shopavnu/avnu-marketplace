import { BusinessMetricsSummaryDto } from './business-metrics-summary.dto';
import { SearchAnalyticsSummaryDto } from './search-analytics-summary.dto';
import { UserEngagementSummaryDto } from './user-engagement-summary.dto';
export declare class DashboardAnalyticsDto {
    businessMetrics?: BusinessMetricsSummaryDto;
    searchAnalytics?: SearchAnalyticsSummaryDto;
    userEngagement?: UserEngagementSummaryDto;
}
