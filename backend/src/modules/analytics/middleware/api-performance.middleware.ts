import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PerformanceMetricsService } from '../services/performance-metrics.service';

@Injectable()
export class ApiPerformanceMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ApiPerformanceMiddleware.name);

  constructor(private readonly performanceMetricsService: PerformanceMetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Record start time
    const startTime = Date.now();

    // Store original end method
    const originalEnd = res.end;

    // Override end method
    res.end = (...args: any[]) => {
      // Calculate response time
      const responseTime = Date.now() - startTime;

      // Get request data
      const endpoint = req.originalUrl || req.url;
      const method = req.method;
      const statusCode = res.statusCode;

      // Get user and session IDs if available
      const userId = (req as any).user?.id;
      const sessionId = req.headers['x-session-id'] as string;

      // Track API response time asynchronously
      this.performanceMetricsService
        .trackApiResponseTime(endpoint, method, responseTime, statusCode, userId, sessionId)
        .catch(error => {
          this.logger.error(`Failed to track API response time: ${error.message}`);
        });

      // Log slow API calls
      if (responseTime > 1000) {
        this.logger.warn(
          `Slow API call detected: ${method} ${endpoint} - ${responseTime}ms (${statusCode})`,
        );
      }

      // Call original end method
      return originalEnd.apply(res, args);
    };

    next();
  }
}
