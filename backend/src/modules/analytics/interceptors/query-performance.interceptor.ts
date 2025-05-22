import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { PerformanceMetricsService } from '../services/performance-metrics.service';

/**
 * Interceptor to track query performance metrics
 *
 * This interceptor can be applied to resolver methods or controllers
 * to track the performance of database queries.
 */
@Injectable()
export class QueryPerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(QueryPerformanceInterceptor.name);

  constructor(private readonly performanceMetricsService: PerformanceMetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const queryId = uuidv4();

    // Get information about the query
    const handler = context.getHandler();
    const className = context.getClass().name;
    const methodName = handler.name;
    const queryType = `${className}.${methodName}`;

    // Get query parameters
    let parameters = {};

    if (context.getType() === 'http') {
      // For REST endpoints
      const request = context.switchToHttp().getRequest();
      parameters = {
        ...request.params,
        ...request.query,
        ...request.body,
      };
    } else if (context.getType() === ('graphql' as any)) {
      // For GraphQL resolvers
      const _gqlContext = context.getArgByIndex(2);
      const info = context.getArgByIndex(3);
      const args = context.getArgByIndex(1);

      parameters = {
        operation: info?.operation?.operation,
        fieldName: info?.fieldName,
        args,
      };
    }

    return next.handle().pipe(
      tap({
        next: data => {
          const executionTime = Date.now() - startTime;

          // Track query performance
          this.trackQueryPerformance(queryId, executionTime, queryType, parameters, data);

          // Log slow queries
          if (executionTime > 500) {
            this.logger.warn(`Slow query detected: ${queryType} - ${executionTime}ms`, {
              queryId,
              parameters,
            });
          }
        },
        error: error => {
          const executionTime = Date.now() - startTime;

          // Track failed query
          this.trackQueryPerformance(queryId, executionTime, queryType, parameters, null, error);

          this.logger.error(`Query error: ${queryType} - ${error.message}`, {
            queryId,
            parameters,
            error: error.stack,
          });
        },
      }),
    );
  }

  /**
   * Track query performance metrics
   */
  private trackQueryPerformance(
    queryId: string,
    executionTime: number,
    queryType: string,
    parameters: any,
    result: any,
    error?: any,
  ): void {
    try {
      // Determine result count
      let resultCount = 0;

      if (result) {
        if (Array.isArray(result)) {
          resultCount = result.length;
        } else if (typeof result === 'object' && result !== null) {
          // Check if it's a paginated result
          if (Array.isArray(result.items)) {
            resultCount = result.items.length;
          } else if (typeof result.count === 'number') {
            resultCount = result.count;
          } else if (typeof result.total === 'number') {
            resultCount = result.total;
          } else {
            resultCount = 1; // Single object result
          }
        }
      }

      // Add error information to parameters if there was an error
      if (error) {
        parameters = {
          ...parameters,
          error: {
            message: error.message,
            name: error.name,
          },
        };
      }

      // Track query performance
      this.performanceMetricsService
        .trackQueryPerformance(
          queryId,
          executionTime,
          queryType,
          JSON.stringify(parameters),
          resultCount,
        )
        .catch(trackingError => {
          this.logger.error(`Failed to track query performance: ${trackingError.message}`, {
            queryId,
            queryType,
          });
        });
    } catch (error) {
      this.logger.error(`Error in trackQueryPerformance: ${error.message}`, { queryId, queryType });
    }
  }
}
