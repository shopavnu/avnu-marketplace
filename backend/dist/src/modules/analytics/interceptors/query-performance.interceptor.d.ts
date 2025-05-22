import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PerformanceMetricsService } from '../services/performance-metrics.service';
export declare class QueryPerformanceInterceptor implements NestInterceptor {
    private readonly performanceMetricsService;
    private readonly logger;
    constructor(performanceMetricsService: PerformanceMetricsService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private trackQueryPerformance;
}
