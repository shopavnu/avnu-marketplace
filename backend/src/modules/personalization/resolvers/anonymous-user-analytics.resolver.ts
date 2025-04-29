import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../../common/guards/admin.guard';
import { AnonymousUserAnalyticsService } from '../services/anonymous-user-analytics.service';
import { AnonymousUserMetricsDto } from '../dto/anonymous-user-metrics.dto';

@Resolver()
export class AnonymousUserAnalyticsResolver {
  constructor(private readonly anonymousUserAnalyticsService: AnonymousUserAnalyticsService) {}

  @Query(() => AnonymousUserMetricsDto, { name: 'anonymousUserMetrics' })
  @UseGuards(AdminGuard)
  async getAnonymousUserMetrics(
    @Args('period', { type: () => Int, nullable: true }) period?: number,
  ): Promise<AnonymousUserMetricsDto> {
    return this.anonymousUserAnalyticsService.getAnonymousUserMetrics(period || 30);
  }
}
