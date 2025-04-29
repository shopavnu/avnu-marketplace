import { Repository } from 'typeorm';
import { ApiPerformanceMetric } from '../entities/api-performance-metric.entity';
import { ClientPerformanceMetric } from '../entities/client-performance-metric.entity';
import { QueryPerformanceMetric } from '../entities/query-performance-metric.entity';
export declare class PerformanceMetricsService {
    private readonly apiMetricRepository;
    private readonly clientMetricRepository;
    private readonly queryMetricRepository;
    private readonly logger;
    constructor(apiMetricRepository: Repository<ApiPerformanceMetric>, clientMetricRepository: Repository<ClientPerformanceMetric>, queryMetricRepository: Repository<QueryPerformanceMetric>);
    trackApiResponseTime(endpoint: string, method: string, responseTime: number, statusCode: number, userId?: string, sessionId?: string): Promise<ApiPerformanceMetric>;
    trackClientPerformance(data: Partial<ClientPerformanceMetric>): Promise<ClientPerformanceMetric>;
    trackQueryPerformance(queryId: string, executionTime: number, queryType: string, parameters: string, resultCount: number): Promise<QueryPerformanceMetric>;
    getApiPerformanceMetrics(period?: number, slowThreshold?: number): Promise<any>;
    getClientPerformanceMetrics(period?: number): Promise<any>;
    getSlowQueryMetrics(period?: number, slowThreshold?: number): Promise<any>;
}
