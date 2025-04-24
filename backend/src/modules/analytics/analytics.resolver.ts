import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AnalyticsService } from './services/analytics.service';
import { SearchAnalyticsService } from './services/search-analytics.service';
import { UserEngagementService } from './services/user-engagement.service';
import { BusinessMetricsService } from './services/business-metrics.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { SearchAnalytics } from './entities/search-analytics.entity';
import { TrackSearchInput } from './graphql/inputs/track-search.input';
import { TrackEngagementInput } from './graphql/inputs/track-engagement.input';
import { UserEngagement } from './entities/user-engagement.entity';
import { BusinessMetrics, TimeGranularity } from './entities/business-metrics.entity';
import { OrderItemInput } from './graphql/inputs/order-item.input';
import { DashboardAnalyticsDto } from './graphql/dtos/dashboard-analytics.dto';
import { SearchAnalyticsSummaryDto } from './graphql/dtos/search-analytics-summary.dto';
import { QueryCountDto } from './graphql/dtos/query-count.dto';
import { GraphQLJSONObject } from 'graphql-type-json';
import { UserEngagementSummaryDto } from './graphql/dtos/user-engagement-summary.dto';
import { EngagementTypeCount } from './graphql/dtos/engagement-type-count.dto';
import { ProductInteractionCount } from './graphql/dtos/product-interaction-count.dto';

@Resolver()
export class AnalyticsResolver {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly searchAnalyticsService: SearchAnalyticsService,
    private readonly userEngagementService: UserEngagementService,
    private readonly businessMetricsService: BusinessMetricsService,
  ) {}

  @Mutation(() => SearchAnalytics)
  async trackSearch(@Args('data', { type: () => TrackSearchInput }) data: TrackSearchInput) {
    return this.analyticsService.trackSearch(data);
  }

  @Mutation(() => UserEngagement)
  async trackEngagement(
    @Args('data', { type: () => TrackEngagementInput }) data: TrackEngagementInput,
  ) {
    return this.analyticsService.trackEngagement(data);
  }

  @Mutation(() => UserEngagement)
  async trackPageView(
    @Args('userId', { nullable: true }) userId: string,
    @Args('sessionId') sessionId: string,
    @Args('pagePath') pagePath: string,
    @Args('referrer', { nullable: true }) referrer: string,
    @Args('deviceType', { nullable: true }) deviceType: string,
    @Args('platform', { nullable: true }) platform: string,
  ) {
    return this.userEngagementService.trackPageView(
      userId,
      sessionId,
      pagePath,
      referrer,
      deviceType,
      platform,
    );
  }

  @Mutation(() => UserEngagement)
  async trackProductView(
    @Args('userId', { nullable: true }) userId: string,
    @Args('sessionId') sessionId: string,
    @Args('productId') productId: string,
    @Args('pagePath') pagePath: string,
    @Args('referrer', { nullable: true }) referrer: string,
    @Args('deviceType', { nullable: true }) deviceType: string,
    @Args('platform', { nullable: true }) platform: string,
  ) {
    return this.userEngagementService.trackProductView(
      userId,
      sessionId,
      productId,
      pagePath,
      referrer,
      deviceType,
      platform,
    );
  }

  @Mutation(() => UserEngagement)
  async trackAddToCart(
    @Args('userId', { nullable: true }) userId: string,
    @Args('sessionId') sessionId: string,
    @Args('productId') productId: string,
    @Args('quantity', { type: () => Int }) quantity: number,
    @Args('pagePath') pagePath: string,
    @Args('deviceType', { nullable: true }) deviceType: string,
    @Args('platform', { nullable: true }) platform: string,
  ) {
    return this.userEngagementService.trackAddToCart(
      userId,
      sessionId,
      productId,
      quantity,
      pagePath,
      deviceType,
      platform,
    );
  }

  @Mutation(() => Boolean)
  async trackCheckoutComplete(
    @Args('userId', { nullable: true }) userId: string,
    @Args('sessionId') sessionId: string,
    @Args('orderId') orderId: string,
    @Args('orderItems', { type: () => [OrderItemInput] }) orderItems: OrderItemInput[],
    @Args('totalAmount') totalAmount: number,
    @Args('pagePath') pagePath: string,
    @Args('deviceType', { nullable: true }) deviceType: string,
    @Args('platform', { nullable: true }) platform: string,
    @Args('merchantId', { nullable: true }) merchantId: string,
  ) {
    // Track the complete order
    await this.analyticsService.trackOrder(
      orderId,
      userId,
      sessionId,
      orderItems,
      totalAmount,
      merchantId,
    );

    return true;
  }

  @Query(() => DashboardAnalyticsDto)
  @UseGuards(GqlAuthGuard)
  async dashboardAnalytics(
    @Args('period', { type: () => Int, nullable: true, defaultValue: 30 }) period: number,
    @Context() _context,
  ): Promise<DashboardAnalyticsDto> {
    return this.analyticsService.getDashboardAnalytics(period);
  }

  @Query(() => SearchAnalyticsSummaryDto)
  @UseGuards(GqlAuthGuard)
  async searchAnalytics(
    @Args('period', { type: () => Int, nullable: true, defaultValue: 30 }) period: number,
    @Context() _context,
  ): Promise<SearchAnalyticsSummaryDto> {
    return this.analyticsService.getSearchAnalytics(period);
  }

  @Query(() => [QueryCountDto])
  @UseGuards(GqlAuthGuard)
  async topSearchQueries(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
    @Args('period', { type: () => Int, nullable: true, defaultValue: 30 }) period: number,
    @Context() _context,
  ): Promise<QueryCountDto[]> {
    return this.searchAnalyticsService.getTopSearchQueries(limit, period);
  }

  @Query(() => [QueryCountDto])
  @UseGuards(GqlAuthGuard)
  async zeroResultQueries(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
    @Args('period', { type: () => Int, nullable: true, defaultValue: 30 }) period: number,
    @Context() _context,
  ): Promise<QueryCountDto[]> {
    return this.searchAnalyticsService.getZeroResultQueries(limit, period);
  }

  @Query(() => GraphQLJSONObject)
  @UseGuards(GqlAuthGuard)
  async nlpVsRegularSearchAnalytics(
    @Args('period', { type: () => Int, nullable: true, defaultValue: 30 }) period: number,
    @Context() _context,
  ): Promise<any> {
    return this.searchAnalyticsService.getNlpVsRegularSearchAnalytics(period);
  }

  @Query(() => GraphQLJSONObject)
  @UseGuards(GqlAuthGuard)
  async personalizedVsRegularSearchAnalytics(
    @Args('period', { type: () => Int, nullable: true, defaultValue: 30 }) period: number,
    @Context() _context,
  ): Promise<any> {
    return this.searchAnalyticsService.getPersonalizedVsRegularSearchAnalytics(period);
  }

  @Query(() => UserEngagementSummaryDto)
  @UseGuards(GqlAuthGuard)
  async userEngagementAnalytics(
    @Args('period', { type: () => Int, nullable: true, defaultValue: 30 }) period: number,
    @Context() _context,
  ): Promise<UserEngagementSummaryDto> {
    return this.analyticsService.getUserEngagementAnalytics(period);
  }

  @Query(() => [EngagementTypeCount])
  @UseGuards(GqlAuthGuard)
  async getUserEngagementByTypeQuery(
    @Args('period', { type: () => Int, nullable: true, defaultValue: 30 }) period: number,
    @Context() _context,
  ) {
    return this.userEngagementService.getUserEngagementByType(period);
  }

  @Query(() => [ProductInteractionCount])
  @UseGuards(GqlAuthGuard)
  async topViewedProducts(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
    @Args('period', { type: () => Int, nullable: true, defaultValue: 30 }) period: number,
    @Context() _context,
  ) {
    return this.userEngagementService.getTopViewedProducts(limit, period);
  }

  @Query(() => GraphQLJSONObject)
  @UseGuards(GqlAuthGuard)
  async userEngagementFunnel(
    @Args('period', { type: () => Int, nullable: true, defaultValue: 30 }) period: number,
    @Context() _context,
  ) {
    return this.userEngagementService.getUserEngagementFunnel(period);
  }

  @Query(() => GraphQLJSONObject)
  @UseGuards(GqlAuthGuard)
  async businessMetricsAnalytics(
    @Args('period', { type: () => Int, nullable: true, defaultValue: 30 }) period: number,
    @Context() _context,
  ) {
    return this.analyticsService.getBusinessMetricsAnalytics(period);
  }

  @Query(() => GraphQLJSONObject)
  @UseGuards(GqlAuthGuard)
  async businessMetricsSummary(
    @Args('period', { type: () => Int, nullable: true, defaultValue: 30 }) period: number,
    @Context() _context,
  ) {
    return this.businessMetricsService.getMetricsSummary(period);
  }

  @Query(() => [BusinessMetrics])
  @UseGuards(GqlAuthGuard)
  async revenueMetrics(
    @Args('period', { type: () => Int, nullable: true, defaultValue: 30 }) period: number,
    @Args('granularity', { nullable: true, defaultValue: TimeGranularity.DAILY })
    granularity: TimeGranularity,
    @Context() _context,
  ) {
    return this.businessMetricsService.getRevenueMetrics(period, granularity);
  }
}
