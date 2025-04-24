import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '@common/services/logger.service';
import { SearchException } from '@common/exceptions/search-exceptions';
import { GqlContextType } from '@nestjs/graphql';

/**
 * Global exception filter to handle all exceptions in a consistent way
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('GlobalExceptionFilter');
  }

  catch(exception: unknown, host: ArgumentsHost) {
    // Check the context type (HTTP or GraphQL)
    const contextType = host.getType<GqlContextType>();

    // Generate a unique error reference ID
    const errorRef = this.generateErrorRef();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let path = 'unknown';

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }
    }

    // Create a log message with available information
    let logMessage: Record<string, any> = {
      errorRef,
      status,
      message,
      contextType,
    };

    // Add HTTP-specific information if available
    if (contextType === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();

      // Only add request properties if they exist
      if (request) {
        path = request.url || 'unknown';
        logMessage = {
          ...logMessage,
          path,
          method: request.method,
          body: request.body,
          query: request.query,
          ip: request.ip,
          userAgent: request.headers?.['user-agent'],
        };

        // Send HTTP response
        response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path,
          error,
          message,
          errorRef,
        });
      }
    } else if (contextType === 'graphql') {
      // For GraphQL, we just log the error
      // The GraphQL server will format the response
      path = 'GraphQL query';
      logMessage.path = path;

      // If it's a GraphQL error, we can get more info
      if (exception instanceof Error) {
        // Add GraphQL-specific info if available
        const gqlError = exception as any;
        if (gqlError.path) {
          logMessage.graphqlPath = gqlError.path;
        }
        if (gqlError.locations) {
          logMessage.graphqlLocations = gqlError.locations;
        }
      }
    }

    // Special handling for search exceptions
    if (exception instanceof SearchException) {
      // Additional search-specific logging or handling can be done here
      if (exception.getResponse() && typeof exception.getResponse() === 'object') {
        const searchResponse = exception.getResponse() as any;
        if (searchResponse.query) {
          logMessage['searchQuery'] = searchResponse.query;
        }
      }
    }

    // Log the exception with appropriate level
    if (status >= 500) {
      this.logger.error(logMessage, exception instanceof Error ? exception.stack : undefined);
    } else if (status >= 400) {
      this.logger.warn(logMessage);
    } else {
      this.logger.debug(logMessage);
    }

    // For GraphQL, we need to rethrow the exception
    // so that the GraphQL server can format it properly
    if (contextType === 'graphql') {
      throw exception;
    }
  }

  /**
   * Generate a unique error reference ID
   * @returns A unique error reference ID
   */
  private generateErrorRef(): string {
    return `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
