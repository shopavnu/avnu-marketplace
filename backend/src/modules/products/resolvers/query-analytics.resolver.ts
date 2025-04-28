import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { QueryAnalyticsService } from '../services/query-analytics.service';
import { AdminGuard } from '../../../common/guards/admin.guard';

// Define interface for QueryAnalytics to avoid TypeScript errors
interface QueryAnalytics {
  queryId: string;
  queryPattern: string;
  averageExecutionTime: number;
  minExecutionTime: number;
  maxExecutionTime: number;
  totalExecutions: number;
  lastExecutionTime: number;
  lastExecuted: number;
  frequency: number;
  isSlowQuery: boolean;
  commonFilters: Record<string, number>;
  resultSizes: number[];
}

@Resolver('QueryAnalytics')
@UseGuards(AdminGuard)
export class QueryAnalyticsResolver {
  constructor(private readonly queryAnalyticsService: QueryAnalyticsService) {}

  @Query('queryAnalytics')
  async getQueryAnalytics(): Promise<QueryAnalytics[]> {
    return this.queryAnalyticsService.getQueryAnalytics();
  }

  @Query('slowQueries')
  async getSlowQueries(): Promise<QueryAnalytics[]> {
    return this.queryAnalyticsService.getSlowQueries();
  }

  @Query('queryAnalyticsById')
  async getQueryAnalyticsById(@Args('queryId') queryId: string): Promise<QueryAnalytics | null> {
    return this.queryAnalyticsService.getQueryAnalyticsById(queryId);
  }

  @Query('mostFrequentQueries')
  async getMostFrequentQueries(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<QueryAnalytics[]> {
    return this.queryAnalyticsService.getMostFrequentQueries(limit);
  }
}
