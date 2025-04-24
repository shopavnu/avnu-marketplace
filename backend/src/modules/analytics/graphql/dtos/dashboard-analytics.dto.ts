import { ObjectType, Field } from '@nestjs/graphql';
import { BusinessMetricsSummaryDto } from './business-metrics-summary.dto';
import { SearchAnalyticsSummaryDto } from './search-analytics-summary.dto';
import { UserEngagementSummaryDto } from './user-engagement-summary.dto';

@ObjectType()
export class DashboardAnalyticsDto {
  @Field(() => BusinessMetricsSummaryDto, { nullable: true })
  businessMetrics?: BusinessMetricsSummaryDto;

  @Field(() => SearchAnalyticsSummaryDto, { nullable: true })
  searchAnalytics?: SearchAnalyticsSummaryDto;

  @Field(() => UserEngagementSummaryDto, { nullable: true })
  userEngagement?: UserEngagementSummaryDto;
}
