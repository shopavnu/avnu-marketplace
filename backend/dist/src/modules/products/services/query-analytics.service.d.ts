import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { ResilientCacheService } from '../../../common/services/resilient-cache.service';
interface QueryMetrics {
  queryId: string;
  queryPattern: string;
  filters: Record<string, any>;
  executionTime: number;
  timestamp: number;
  resultCount: number;
}
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
export declare class QueryAnalyticsService {
  private readonly eventEmitter;
  private readonly configService;
  private readonly cacheService;
  private readonly logger;
  private readonly ANALYTICS_CACHE_KEY;
  private readonly SLOW_QUERY_THRESHOLD;
  private readonly MAX_STORED_QUERIES;
  private readonly ANALYTICS_TTL;
  private readonly METRICS_RETENTION_PERIOD;
  constructor(
    eventEmitter: EventEmitter2,
    configService: ConfigService,
    cacheService: ResilientCacheService,
  );
  recordQueryMetrics(metrics: QueryMetrics): Promise<void>;
  processQueryAnalytics(): Promise<void>;
  getQueryAnalytics(): Promise<QueryAnalytics[]>;
  getSlowQueries(): Promise<QueryAnalytics[]>;
  getQueryAnalyticsById(queryId: string): Promise<QueryAnalytics | null>;
  getMostFrequentQueries(limit?: number): Promise<QueryAnalytics[]>;
  generateQueryId(queryPattern: string, filters: Record<string, any>): string;
  recordQuery(
    queryPattern: string,
    filters: Record<string, any>,
    executionTime: number,
    resultCount: number,
  ): void;
}
export {};
