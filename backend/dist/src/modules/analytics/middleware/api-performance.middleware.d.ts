import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PerformanceMetricsService } from '../services/performance-metrics.service';
export declare class ApiPerformanceMiddleware implements NestMiddleware {
    private readonly performanceMetricsService;
    private readonly logger;
    constructor(performanceMetricsService: PerformanceMetricsService);
    use(req: Request, res: Response, next: NextFunction): void;
}
