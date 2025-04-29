import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { ApiPerformanceMetric } from '../entities/api-performance-metric.entity';
import { ClientPerformanceMetric } from '../entities/client-performance-metric.entity';
import { QueryPerformanceMetric } from '../entities/query-performance-metric.entity';

@Injectable()
export class PerformanceMetricsService {
  private readonly logger = new Logger(PerformanceMetricsService.name);

  constructor(
    @InjectRepository(ApiPerformanceMetric)
    private readonly apiMetricRepository: Repository<ApiPerformanceMetric>,
    @InjectRepository(ClientPerformanceMetric)
    private readonly clientMetricRepository: Repository<ClientPerformanceMetric>,
    @InjectRepository(QueryPerformanceMetric)
    private readonly queryMetricRepository: Repository<QueryPerformanceMetric>,
  ) {}

  /**
   * Track API response time
   * @param endpoint API endpoint
   * @param method HTTP method
   * @param responseTime Response time in milliseconds
   * @param statusCode HTTP status code
   * @param userId Optional user ID
   * @param sessionId Optional session ID
   */
  async trackApiResponseTime(
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    userId?: string,
    sessionId?: string,
  ): Promise<ApiPerformanceMetric> {
    try {
      const metric = this.apiMetricRepository.create({
        endpoint,
        method,
        responseTime,
        statusCode,
        userId,
        sessionId,
      });
      return this.apiMetricRepository.save(metric);
    } catch (error) {
      this.logger.error(`Failed to track API response time: ${error.message}`);
      throw error;
    }
  }

  /**
   * Track client-side performance metrics
   * @param data Client performance data
   */
  async trackClientPerformance(data: Partial<ClientPerformanceMetric>): Promise<ClientPerformanceMetric> {
    try {
      const metric = this.clientMetricRepository.create(data);
      return this.clientMetricRepository.save(metric);
    } catch (error) {
      this.logger.error(`Failed to track client performance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Track query performance
   * @param queryId Query identifier
   * @param executionTime Execution time in milliseconds
   * @param queryType Type of query (e.g., 'product_search', 'user_lookup')
   * @param parameters Query parameters (JSON string)
   * @param resultCount Number of results returned
   */
  async trackQueryPerformance(
    queryId: string,
    executionTime: number,
    queryType: string,
    parameters: string,
    resultCount: number,
  ): Promise<QueryPerformanceMetric> {
    try {
      const metric = this.queryMetricRepository.create({
        queryId,
        executionTime,
        queryType,
        parameters,
        resultCount,
      });
      return this.queryMetricRepository.save(metric);
    } catch (error) {
      this.logger.error(`Failed to track query performance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get API performance metrics
   * @param period Period in days
   * @param slowThreshold Threshold in ms to consider an API call slow
   */
  async getApiPerformanceMetrics(period = 30, slowThreshold = 1000): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      // Get average response time by endpoint
      const averageResponseTimes = await this.apiMetricRepository
        .createQueryBuilder('metric')
        .select('metric.endpoint', 'endpoint')
        .addSelect('metric.method', 'method')
        .addSelect('AVG(metric.responseTime)', 'averageResponseTime')
        .addSelect('COUNT(metric.id)', 'requestCount')
        .where('metric.timestamp >= :startDate', { startDate })
        .groupBy('metric.endpoint')
        .addGroupBy('metric.method')
        .orderBy('averageResponseTime', 'DESC')
        .getRawMany();

      // Get slow API calls
      const slowApiCalls = await this.apiMetricRepository
        .createQueryBuilder('metric')
        .select('metric.endpoint', 'endpoint')
        .addSelect('metric.method', 'method')
        .addSelect('metric.responseTime', 'responseTime')
        .addSelect('metric.statusCode', 'statusCode')
        .addSelect('metric.timestamp', 'timestamp')
        .where('metric.timestamp >= :startDate', { startDate })
        .andWhere('metric.responseTime >= :slowThreshold', { slowThreshold })
        .orderBy('metric.responseTime', 'DESC')
        .limit(100)
        .getRawMany();

      // Get error rate by endpoint
      const errorRates = await this.apiMetricRepository
        .createQueryBuilder('metric')
        .select('metric.endpoint', 'endpoint')
        .addSelect('metric.method', 'method')
        .addSelect('COUNT(metric.id)', 'totalRequests')
        .addSelect(
          'SUM(CASE WHEN metric.statusCode >= 400 THEN 1 ELSE 0 END)',
          'errorCount',
        )
        .addSelect(
          'CAST(SUM(CASE WHEN metric.statusCode >= 400 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(metric.id)',
          'errorRate',
        )
        .where('metric.timestamp >= :startDate', { startDate })
        .groupBy('metric.endpoint')
        .addGroupBy('metric.method')
        .having('COUNT(metric.id) > 10') // Only include endpoints with significant traffic
        .orderBy('errorRate', 'DESC')
        .getRawMany();

      // Get performance trends over time (daily averages)
      const performanceTrends = await this.apiMetricRepository
        .createQueryBuilder('metric')
        .select('DATE(metric.timestamp)', 'date')
        .addSelect('AVG(metric.responseTime)', 'averageResponseTime')
        .addSelect('COUNT(metric.id)', 'requestCount')
        .where('metric.timestamp >= :startDate', { startDate })
        .groupBy('DATE(metric.timestamp)')
        .orderBy('date', 'ASC')
        .getRawMany();

      return {
        averageResponseTimes,
        slowApiCalls,
        errorRates,
        performanceTrends,
      };
    } catch (error) {
      this.logger.error(`Failed to get API performance metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get client performance metrics
   * @param period Period in days
   */
  async getClientPerformanceMetrics(period = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      // Get average metrics by page
      const averageMetricsByPage = await this.clientMetricRepository
        .createQueryBuilder('metric')
        .select('metric.pagePath', 'pagePath')
        .addSelect('AVG(metric.firstContentfulPaint)', 'avgFCP')
        .addSelect('AVG(metric.largestContentfulPaint)', 'avgLCP')
        .addSelect('AVG(metric.firstInputDelay)', 'avgFID')
        .addSelect('AVG(metric.cumulativeLayoutShift)', 'avgCLS')
        .addSelect('AVG(metric.timeToInteractive)', 'avgTTI')
        .addSelect('AVG(metric.totalBlockingTime)', 'avgTBT')
        .addSelect('COUNT(metric.id)', 'sampleCount')
        .where('metric.timestamp >= :startDate', { startDate })
        .groupBy('metric.pagePath')
        .orderBy('sampleCount', 'DESC')
        .getRawMany();

      // Get average metrics by device type
      const averageMetricsByDevice = await this.clientMetricRepository
        .createQueryBuilder('metric')
        .select('metric.deviceType', 'deviceType')
        .addSelect('AVG(metric.firstContentfulPaint)', 'avgFCP')
        .addSelect('AVG(metric.largestContentfulPaint)', 'avgLCP')
        .addSelect('AVG(metric.firstInputDelay)', 'avgFID')
        .addSelect('AVG(metric.cumulativeLayoutShift)', 'avgCLS')
        .addSelect('AVG(metric.timeToInteractive)', 'avgTTI')
        .addSelect('AVG(metric.totalBlockingTime)', 'avgTBT')
        .addSelect('COUNT(metric.id)', 'sampleCount')
        .where('metric.timestamp >= :startDate', { startDate })
        .groupBy('metric.deviceType')
        .orderBy('sampleCount', 'DESC')
        .getRawMany();

      // Get performance trends over time (daily averages)
      const performanceTrends = await this.clientMetricRepository
        .createQueryBuilder('metric')
        .select('DATE(metric.timestamp)', 'date')
        .addSelect('AVG(metric.firstContentfulPaint)', 'avgFCP')
        .addSelect('AVG(metric.largestContentfulPaint)', 'avgLCP')
        .addSelect('AVG(metric.firstInputDelay)', 'avgFID')
        .addSelect('AVG(metric.cumulativeLayoutShift)', 'avgCLS')
        .addSelect('COUNT(metric.id)', 'sampleCount')
        .where('metric.timestamp >= :startDate', { startDate })
        .groupBy('DATE(metric.timestamp)')
        .orderBy('date', 'ASC')
        .getRawMany();

      return {
        averageMetricsByPage,
        averageMetricsByDevice,
        performanceTrends,
      };
    } catch (error) {
      this.logger.error(`Failed to get client performance metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get slow query metrics
   * @param period Period in days
   * @param slowThreshold Threshold in ms to consider a query slow
   */
  async getSlowQueryMetrics(period = 30, slowThreshold = 500): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      // Get slow queries
      const slowQueries = await this.queryMetricRepository
        .createQueryBuilder('metric')
        .select('metric.queryType', 'queryType')
        .addSelect('AVG(metric.executionTime)', 'avgExecutionTime')
        .addSelect('MAX(metric.executionTime)', 'maxExecutionTime')
        .addSelect('COUNT(metric.id)', 'executionCount')
        .where('metric.timestamp >= :startDate', { startDate })
        .andWhere('metric.executionTime >= :slowThreshold', { slowThreshold })
        .groupBy('metric.queryType')
        .orderBy('avgExecutionTime', 'DESC')
        .getRawMany();

      // Get slow query details
      const slowQueryDetails = await this.queryMetricRepository
        .createQueryBuilder('metric')
        .select('metric.queryId', 'queryId')
        .addSelect('metric.queryType', 'queryType')
        .addSelect('metric.executionTime', 'executionTime')
        .addSelect('metric.parameters', 'parameters')
        .addSelect('metric.resultCount', 'resultCount')
        .addSelect('metric.timestamp', 'timestamp')
        .where('metric.timestamp >= :startDate', { startDate })
        .andWhere('metric.executionTime >= :slowThreshold', { slowThreshold })
        .orderBy('metric.executionTime', 'DESC')
        .limit(100)
        .getRawMany();

      // Get query performance trends over time (daily averages)
      const queryPerformanceTrends = await this.queryMetricRepository
        .createQueryBuilder('metric')
        .select('DATE(metric.timestamp)', 'date')
        .addSelect('metric.queryType', 'queryType')
        .addSelect('AVG(metric.executionTime)', 'avgExecutionTime')
        .addSelect('COUNT(metric.id)', 'executionCount')
        .where('metric.timestamp >= :startDate', { startDate })
        .groupBy('DATE(metric.timestamp)')
        .addGroupBy('metric.queryType')
        .orderBy('date', 'ASC')
        .addOrderBy('queryType', 'ASC')
        .getRawMany();

      return {
        slowQueries,
        slowQueryDetails,
        queryPerformanceTrends,
      };
    } catch (error) {
      this.logger.error(`Failed to get slow query metrics: ${error.message}`);
      throw error;
    }
  }
}
