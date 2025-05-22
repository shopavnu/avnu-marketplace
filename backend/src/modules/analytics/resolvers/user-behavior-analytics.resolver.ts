import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserBehaviorAnalyticsService } from '../services/user-behavior-analytics.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { ScrollAnalytics } from '../entities/scroll-analytics.entity';
import { HeatmapData, InteractionType } from '../entities/heatmap-data.entity';

@Resolver()
export class UserBehaviorAnalyticsResolver {
  constructor(private readonly userBehaviorAnalyticsService: UserBehaviorAnalyticsService) {}

  @Mutation(() => ScrollAnalytics)
  async trackScrolling(@Args('data') data: Partial<ScrollAnalytics>): Promise<ScrollAnalytics> {
    return this.userBehaviorAnalyticsService.trackScrolling(data);
  }

  @Mutation(() => HeatmapData)
  async trackHeatmapData(@Args('data') data: Partial<HeatmapData>): Promise<HeatmapData> {
    return this.userBehaviorAnalyticsService.trackHeatmapData(data);
  }

  @Mutation(() => [HeatmapData])
  async trackBatchHeatmapData(
    @Args('dataItems', { type: () => [HeatmapData] }) dataItems: Partial<HeatmapData>[],
  ): Promise<HeatmapData[]> {
    return this.userBehaviorAnalyticsService.trackBatchHeatmapData(dataItems);
  }

  @Query(() => Object)
  @UseGuards(AdminGuard)
  async verticalScrollingAnalytics(
    @Args('period', { type: () => Int, nullable: true, defaultValue: 30 }) period?: number,
  ): Promise<any> {
    return this.userBehaviorAnalyticsService.getVerticalScrollingAnalytics(period);
  }

  @Query(() => Object)
  @UseGuards(AdminGuard)
  async heatmapAnalytics(
    @Args('pagePath') pagePath: string,
    @Args('period', { type: () => Int, nullable: true, defaultValue: 30 }) period?: number,
    @Args('interactionType', { nullable: true }) interactionType?: InteractionType,
  ): Promise<any> {
    return this.userBehaviorAnalyticsService.getHeatmapAnalytics(pagePath, period, interactionType);
  }

  @Query(() => Object)
  @UseGuards(AdminGuard)
  async verticalNavigationFunnel(
    @Args('period', { type: () => Int, nullable: true, defaultValue: 30 }) period?: number,
  ): Promise<any> {
    return this.userBehaviorAnalyticsService.getVerticalNavigationFunnel(period);
  }
}
