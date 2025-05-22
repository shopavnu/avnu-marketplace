import { QueryAnalyticsService } from '../services/query-analytics.service';
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
export declare class QueryAnalyticsResolver {
  private readonly queryAnalyticsService;
  constructor(queryAnalyticsService: QueryAnalyticsService);
  getQueryAnalytics(): Promise<QueryAnalytics[]>;
  getSlowQueries(): Promise<QueryAnalytics[]>;
  getQueryAnalyticsById(queryId: string): Promise<QueryAnalytics | null>;
  getMostFrequentQueries(limit?: number): Promise<QueryAnalytics[]>;
}
export {};
