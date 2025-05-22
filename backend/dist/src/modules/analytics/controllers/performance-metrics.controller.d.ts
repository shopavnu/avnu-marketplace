import { PerformanceMetricsService } from '../services/performance-metrics.service';
import { ApiPerformanceMetric } from '../entities/api-performance-metric.entity';
import { ClientPerformanceMetric } from '../entities/client-performance-metric.entity';
import { QueryPerformanceMetric } from '../entities/query-performance-metric.entity';
export declare class PerformanceMetricsController {
    private readonly performanceMetricsService;
    constructor(performanceMetricsService: PerformanceMetricsService);
    trackApiResponseTime(data: Partial<ApiPerformanceMetric>): Promise<ApiPerformanceMetric>;
    trackClientPerformance(data: Partial<ClientPerformanceMetric>): Promise<ClientPerformanceMetric>;
    trackQueryPerformance(data: Partial<QueryPerformanceMetric>): Promise<QueryPerformanceMetric>;
    getApiPerformanceMetrics(period?: number, slowThreshold?: number): Promise<any>;
    getClientPerformanceMetrics(period?: number): Promise<any>;
    getSlowQueryMetrics(period?: number, slowThreshold?: number): Promise<any>;
}
