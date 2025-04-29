import { PerformanceMetricsService } from '../services/performance-metrics.service';
import { ApiPerformanceMetric } from '../entities/api-performance-metric.entity';
import { ClientPerformanceMetric } from '../entities/client-performance-metric.entity';
import { QueryPerformanceMetric } from '../entities/query-performance-metric.entity';
export declare class PerformanceMetricsResolver {
    private readonly performanceMetricsService;
    constructor(performanceMetricsService: PerformanceMetricsService);
    trackApiResponseTime(endpoint: string, method: string, responseTime: number, statusCode: number, userId?: string, sessionId?: string): Promise<ApiPerformanceMetric>;
    trackClientPerformance(data: Partial<ClientPerformanceMetric>): Promise<ClientPerformanceMetric>;
    trackQueryPerformance(queryId: string, executionTime: number, queryType: string, parameters?: string, resultCount?: number): Promise<QueryPerformanceMetric>;
    apiPerformanceMetrics(period?: number, slowThreshold?: number): Promise<any>;
    clientPerformanceMetrics(period?: number): Promise<any>;
    slowQueryMetrics(period?: number, slowThreshold?: number): Promise<any>;
}
