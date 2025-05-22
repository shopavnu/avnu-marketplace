import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PerformanceMetricsService } from '../services/performance-metrics.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { ApiPerformanceMetric } from '../entities/api-performance-metric.entity';
import { ClientPerformanceMetric } from '../entities/client-performance-metric.entity';
import { QueryPerformanceMetric } from '../entities/query-performance-metric.entity';

@Resolver()
export class PerformanceMetricsResolver {
  constructor(private readonly performanceMetricsService: PerformanceMetricsService) {}

  @Mutation(() => ApiPerformanceMetric)
  async trackApiResponseTime(
    @Args('endpoint') endpoint: string,
    @Args('method') method: string,
    @Args('responseTime', { type: () => Int }) responseTime: number,
    @Args('statusCode', { type: () => Int }) statusCode: number,
    @Args('userId', { nullable: true }) userId?: string,
    @Args('sessionId', { nullable: true }) sessionId?: string,
  ): Promise<ApiPerformanceMetric> {
    return this.performanceMetricsService.trackApiResponseTime(
      endpoint,
      method,
      responseTime,
      statusCode,
      userId,
      sessionId,
    );
  }

  @Mutation(() => ClientPerformanceMetric)
  async trackClientPerformance(
    @Args('data') data: Partial<ClientPerformanceMetric>,
  ): Promise<ClientPerformanceMetric> {
    return this.performanceMetricsService.trackClientPerformance(data);
  }

  @Mutation(() => QueryPerformanceMetric)
  async trackQueryPerformance(
    @Args('queryId') queryId: string,
    @Args('executionTime', { type: () => Int }) executionTime: number,
    @Args('queryType') queryType: string,
    @Args('parameters', { nullable: true }) parameters?: string,
    @Args('resultCount', { type: () => Int, nullable: true }) resultCount?: number,
  ): Promise<QueryPerformanceMetric> {
    return this.performanceMetricsService.trackQueryPerformance(
      queryId,
      executionTime,
      queryType,
      parameters,
      resultCount,
    );
  }

  @Query(() => Object)
  @UseGuards(AdminGuard)
  async apiPerformanceMetrics(
    @Args('period', { type: () => Int, nullable: true, defaultValue: 30 }) period?: number,
    @Args('slowThreshold', { type: () => Int, nullable: true, defaultValue: 1000 })
    slowThreshold?: number,
  ): Promise<any> {
    return this.performanceMetricsService.getApiPerformanceMetrics(period, slowThreshold);
  }

  @Query(() => Object)
  @UseGuards(AdminGuard)
  async clientPerformanceMetrics(
    @Args('period', { type: () => Int, nullable: true, defaultValue: 30 }) period?: number,
  ): Promise<any> {
    return this.performanceMetricsService.getClientPerformanceMetrics(period);
  }

  @Query(() => Object)
  @UseGuards(AdminGuard)
  async slowQueryMetrics(
    @Args('period', { type: () => Int, nullable: true, defaultValue: 30 }) period?: number,
    @Args('slowThreshold', { type: () => Int, nullable: true, defaultValue: 500 })
    slowThreshold?: number,
  ): Promise<any> {
    return this.performanceMetricsService.getSlowQueryMetrics(period, slowThreshold);
  }
}
