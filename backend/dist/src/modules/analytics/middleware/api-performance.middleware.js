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
var ApiPerformanceMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiPerformanceMiddleware = void 0;
const common_1 = require("@nestjs/common");
const performance_metrics_service_1 = require("../services/performance-metrics.service");
let ApiPerformanceMiddleware = ApiPerformanceMiddleware_1 = class ApiPerformanceMiddleware {
    constructor(performanceMetricsService) {
        this.performanceMetricsService = performanceMetricsService;
        this.logger = new common_1.Logger(ApiPerformanceMiddleware_1.name);
    }
    use(req, res, next) {
        const startTime = Date.now();
        const originalEnd = res.end;
        res.end = (...args) => {
            const responseTime = Date.now() - startTime;
            const endpoint = req.originalUrl || req.url;
            const method = req.method;
            const statusCode = res.statusCode;
            const userId = req.user?.id;
            const sessionId = req.headers['x-session-id'];
            this.performanceMetricsService
                .trackApiResponseTime(endpoint, method, responseTime, statusCode, userId, sessionId)
                .catch(error => {
                this.logger.error(`Failed to track API response time: ${error.message}`);
            });
            if (responseTime > 1000) {
                this.logger.warn(`Slow API call detected: ${method} ${endpoint} - ${responseTime}ms (${statusCode})`);
            }
            return originalEnd.apply(res, args);
        };
        next();
    }
};
exports.ApiPerformanceMiddleware = ApiPerformanceMiddleware;
exports.ApiPerformanceMiddleware = ApiPerformanceMiddleware = ApiPerformanceMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [performance_metrics_service_1.PerformanceMetricsService])
], ApiPerformanceMiddleware);
//# sourceMappingURL=api-performance.middleware.js.map