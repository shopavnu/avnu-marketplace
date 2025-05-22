'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require('@nestjs/common');
const logger_service_1 = require('@common/services/logger.service');
const search_exceptions_1 = require('@common/exceptions/search-exceptions');
let GlobalExceptionFilter = class GlobalExceptionFilter {
  constructor(logger) {
    this.logger = logger;
    this.logger.setContext('GlobalExceptionFilter');
  }
  catch(exception, host) {
    const contextType = host.getType();
    const errorRef = this.generateErrorRef();
    let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let path = 'unknown';
    if (exception instanceof common_1.HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = exceptionResponse.message || message;
        error = exceptionResponse.error || error;
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }
    }
    let logMessage = {
      errorRef,
      status,
      message,
      contextType,
    };
    if (contextType === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();
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
      path = 'GraphQL query';
      logMessage.path = path;
      if (exception instanceof Error) {
        const gqlError = exception;
        if (gqlError.path) {
          logMessage.graphqlPath = gqlError.path;
        }
        if (gqlError.locations) {
          logMessage.graphqlLocations = gqlError.locations;
        }
      }
    }
    if (exception instanceof search_exceptions_1.SearchException) {
      if (exception.getResponse() && typeof exception.getResponse() === 'object') {
        const searchResponse = exception.getResponse();
        if (searchResponse.query) {
          logMessage['searchQuery'] = searchResponse.query;
        }
      }
    }
    if (status >= 500) {
      this.logger.error(logMessage, exception instanceof Error ? exception.stack : undefined);
    } else if (status >= 400) {
      this.logger.warn(logMessage);
    } else {
      this.logger.debug(logMessage);
    }
    if (contextType === 'graphql') {
      throw exception;
    }
  }
  generateErrorRef() {
    return `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate(
  [(0, common_1.Catch)(), __metadata('design:paramtypes', [logger_service_1.LoggerService])],
  GlobalExceptionFilter,
);
//# sourceMappingURL=global-exception.filter.js.map
