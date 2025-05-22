import { Injectable, Logger } from '@nestjs/common';
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
  frequency: number; // executions per hour
  isSlowQuery: boolean;
  commonFilters: Record<string, number>; // filter name -> frequency
  resultSizes: number[]; // last 10 result sizes
}

@Injectable()
export class QueryAnalyticsService {
  private readonly logger = new Logger(QueryAnalyticsService.name);
  private readonly ANALYTICS_CACHE_KEY = 'query:analytics';
  private readonly SLOW_QUERY_THRESHOLD: number;
  private readonly MAX_STORED_QUERIES = 100;
  private readonly ANALYTICS_TTL = 60 * 60 * 24 * 7; // 7 days
  private readonly METRICS_RETENTION_PERIOD = 60 * 60 * 24 * 2; // 2 days in seconds

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
    private readonly cacheService: ResilientCacheService,
  ) {
    // Get slow query threshold from config or use default (500ms)
    this.SLOW_QUERY_THRESHOLD = this.configService.get<number>('SLOW_QUERY_THRESHOLD_MS', 500);

    // Listen for query execution events
    this.eventEmitter.on('query.executed', (metrics: QueryMetrics) => {
      this.recordQueryMetrics(metrics).catch(err =>
        this.logger.error(`Error recording query metrics: ${err.message}`, err.stack),
      );
    });

    // Schedule regular analytics processing
    setInterval(() => this.processQueryAnalytics(), 60 * 60 * 1000); // Every hour
  }

  /**
   * Record metrics for an executed query
   */
  async recordQueryMetrics(metrics: QueryMetrics): Promise<void> {
    try {
      // Generate a cache key for this specific query pattern
      const metricsKey = `query:metrics:${metrics.queryId}`;

      // Get existing metrics for this query
      let queryMetrics: QueryMetrics[] =
        (await this.cacheService.get<QueryMetrics[]>(metricsKey)) || [];

      // Add new metrics
      queryMetrics.push(metrics);

      // Keep only recent metrics (last 2 days)
      const cutoffTime = Date.now() - this.METRICS_RETENTION_PERIOD * 1000;
      queryMetrics = queryMetrics.filter(m => m.timestamp >= cutoffTime);

      // Store updated metrics
      await this.cacheService.set(metricsKey, queryMetrics, this.ANALYTICS_TTL);

      // Check if this is a slow query and emit an event if it is
      if (metrics.executionTime > this.SLOW_QUERY_THRESHOLD) {
        this.logger.warn(
          `Slow query detected: ${metrics.queryPattern} (${metrics.executionTime}ms)`,
        );
        this.eventEmitter.emit('query.slow', metrics);
      }
    } catch (error) {
      this.logger.error(`Error recording query metrics: ${error.message}`, error.stack);
    }
  }

  /**
   * Process query metrics to generate analytics
   */
  async processQueryAnalytics(): Promise<void> {
    try {
      this.logger.log('Processing query analytics...');

      // Get all query metric keys
      const metricKeys = (await this.cacheService.get<string[]>('query:metric:keys')) || [];

      // Process each query's metrics
      const analytics: Record<string, QueryAnalytics> = {};

      for (const key of metricKeys) {
        const queryId = key.replace('query:metrics:', '');
        const metrics = (await this.cacheService.get<QueryMetrics[]>(key)) || [];

        if (metrics.length === 0) continue;

        // Calculate analytics
        const executionTimes = metrics.map(m => m.executionTime);
        const totalExecutions = metrics.length;
        const averageExecutionTime = executionTimes.reduce((a, b) => a + b, 0) / totalExecutions;
        const minExecutionTime = Math.min(...executionTimes);
        const maxExecutionTime = Math.max(...executionTimes);
        const lastExecuted = Math.max(...metrics.map(m => m.timestamp));
        const lastExecutionTime =
          metrics.find(m => m.timestamp === lastExecuted)?.executionTime || 0;

        // Calculate frequency (executions per hour)
        const hourMs = 60 * 60 * 1000;
        const now = Date.now();
        const lastHourExecutions = metrics.filter(m => m.timestamp >= now - hourMs).length;
        const frequency = lastHourExecutions;

        // Identify common filters
        const commonFilters: Record<string, number> = {};
        metrics.forEach(m => {
          Object.keys(m.filters || {}).forEach(filter => {
            commonFilters[filter] = (commonFilters[filter] || 0) + 1;
          });
        });

        // Get last 10 result sizes
        const resultSizes = metrics
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10)
          .map(m => m.resultCount);

        // Determine if this is a slow query
        const isSlowQuery = averageExecutionTime > this.SLOW_QUERY_THRESHOLD;

        // Store analytics
        analytics[queryId] = {
          queryId,
          queryPattern: metrics[0].queryPattern,
          averageExecutionTime,
          minExecutionTime,
          maxExecutionTime,
          totalExecutions,
          lastExecutionTime,
          lastExecuted,
          frequency,
          isSlowQuery,
          commonFilters,
          resultSizes,
        };
      }

      // Store analytics in cache
      await this.cacheService.set(this.ANALYTICS_CACHE_KEY, analytics, this.ANALYTICS_TTL);

      this.logger.log(`Processed analytics for ${Object.keys(analytics).length} queries`);
    } catch (error) {
      this.logger.error(`Error processing query analytics: ${error.message}`, error.stack);
    }
  }

  /**
   * Get analytics for all queries
   */
  async getQueryAnalytics(): Promise<QueryAnalytics[]> {
    const analytics =
      (await this.cacheService.get<Record<string, QueryAnalytics>>(this.ANALYTICS_CACHE_KEY)) || {};
    return Object.values(analytics);
  }

  /**
   * Get analytics for slow queries
   */
  async getSlowQueries(): Promise<QueryAnalytics[]> {
    const analytics = await this.getQueryAnalytics();
    return analytics.filter(a => a.isSlowQuery);
  }

  /**
   * Get analytics for a specific query
   */
  async getQueryAnalyticsById(queryId: string): Promise<QueryAnalytics | null> {
    const analytics =
      (await this.cacheService.get<Record<string, QueryAnalytics>>(this.ANALYTICS_CACHE_KEY)) || {};
    return analytics[queryId] || null;
  }

  /**
   * Get the most frequently executed queries
   */
  async getMostFrequentQueries(limit = 10): Promise<QueryAnalytics[]> {
    const analytics = await this.getQueryAnalytics();
    return analytics.sort((a, b) => b.frequency - a.frequency).slice(0, limit);
  }

  /**
   * Generate a unique query ID based on the query pattern and filters
   */
  generateQueryId(queryPattern: string, filters: Record<string, any>): string {
    // Sort filter keys for consistent ID generation
    const sortedFilters = Object.keys(filters || {})
      .sort()
      .reduce((obj, key) => {
        obj[key] = filters[key];
        return obj;
      }, {});

    // Create a string representation of the query
    const queryString = `${queryPattern}:${JSON.stringify(sortedFilters)}`;

    // Generate a hash of the query string
    let hash = 0;
    for (let i = 0; i < queryString.length; i++) {
      const char = queryString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return `q${Math.abs(hash).toString(36)}`;
  }

  /**
   * Record a query metric when a query is executed
   */
  recordQuery(
    queryPattern: string,
    filters: Record<string, any>,
    executionTime: number,
    resultCount: number,
  ): void {
    const queryId = this.generateQueryId(queryPattern, filters);

    // Store this query ID in the list of metric keys
    this.cacheService
      .get<string[]>('query:metric:keys')
      .then(keys => {
        const metricKey = `query:metrics:${queryId}`;
        if (!keys) {
          this.cacheService.set('query:metric:keys', [metricKey], this.ANALYTICS_TTL);
        } else if (!keys.includes(metricKey)) {
          // Only keep track of the most recent MAX_STORED_QUERIES
          if (keys.length >= this.MAX_STORED_QUERIES) {
            keys.shift(); // Remove oldest
          }
          keys.push(metricKey);
          this.cacheService.set('query:metric:keys', keys, this.ANALYTICS_TTL);
        }
      })
      .catch(err => this.logger.error(`Error updating metric keys: ${err.message}`));

    // Emit the query executed event
    this.eventEmitter.emit('query.executed', {
      queryId,
      queryPattern,
      filters,
      executionTime,
      timestamp: Date.now(),
      resultCount,
    });
  }
}
