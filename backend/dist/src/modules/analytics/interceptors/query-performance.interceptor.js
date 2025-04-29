"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var QueryPerformanceInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryPerformanceInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const uuid_1 = require("uuid");
const performance_metrics_service_1 = require("../services/performance-metrics.service");
let QueryPerformanceInterceptor = QueryPerformanceInterceptor_1 = class QueryPerformanceInterceptor {
    constructor(performanceMetricsService) {
        this.performanceMetricsService = performanceMetricsService;
        this.logger = new common_1.Logger(QueryPerformanceInterceptor_1.name);
    }
    intercept(context, next) {
        const startTime = Date.now();
        const queryId = (0, uuid_1.v4)();
        const handler = context.getHandler();
        const className = context.getClass().name;
        const methodName = handler.name;
        const queryType = `${className}.${methodName}`;
        let parameters = {};
        if (context.getType() === 'http') {
            const request = context.switchToHttp().getRequest();
            parameters = {
                ...request.params,
                ...request.query,
                ...request.body,
            };
        }
        else if (context.getType() === 'graphql') {
            const gqlContext = context.getArgByIndex(2);
            const info = context.getArgByIndex(3);
            const args = context.getArgByIndex(1);
            parameters = {
                operation: info?.operation?.operation,
                fieldName: info?.fieldName,
                args,
            };
        }
        return next.handle().pipe((0, operators_1.tap)({
            next: (data) => {
                const executionTime = Date.now() - startTime;
                this.trackQueryPerformance(queryId, executionTime, queryType, parameters, data);
                if (executionTime > 500) {
                    this.logger.warn(`Slow query detected: ${queryType} - ${executionTime}ms`, { queryId, parameters });
                }
            },
            error: (error) => {
                const executionTime = Date.now() - startTime;
                this.trackQueryPerformance(queryId, executionTime, queryType, parameters, null, error);
                this.logger.error(`Query error: ${queryType} - ${error.message}`, { queryId, parameters, error: error.stack });
            },
        }));
    }
    trackQueryPerformance(queryId, executionTime, queryType, parameters, result, error) {
        try {
            let resultCount = 0;
            if (result) {
                if (Array.isArray(result)) {
                    resultCount = result.length;
                }
                else if (typeof result === 'object' && result !== null) {
                    if (Array.isArray(result.items)) {
                        resultCount = result.items.length;
                    }
                    else if (typeof result.count === 'number') {
                        resultCount = result.count;
                    }
                    else if (typeof result.total === 'number') {
                        resultCount = result.total;
                    }
                    else {
                        resultCount = 1;
                    }
                }
            }
            if (error) {
                parameters = {
                    ...parameters,
                    error: {
                        message: error.message,
                        name: error.name,
                    },
                };
            }
            this.performanceMetricsService
                .trackQueryPerformance(queryId, executionTime, queryType, JSON.stringify(parameters), resultCount)
                .catch((trackingError) => {
                this.logger.error(`Failed to track query performance: ${trackingError.message}`, { queryId, queryType });
            });
        }
        catch (error) {
            this.logger.error(`Error in trackQueryPerformance: ${error.message}`, { queryId, queryType });
        }
    }
};
exports.QueryPerformanceInterceptor = QueryPerformanceInterceptor;
exports.QueryPerformanceInterceptor = QueryPerformanceInterceptor = QueryPerformanceInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [performance_metrics_service_1.PerformanceMetricsService])
], QueryPerformanceInterceptor);
//# sourceMappingURL=query-performance.interceptor.js.map