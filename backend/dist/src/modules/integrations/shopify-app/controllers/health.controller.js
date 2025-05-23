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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ShopifyHealthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyHealthController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../auth/guards/jwt-auth.guard");
const shopify_client_service_1 = require("../services/shopify-client.service");
const circuit_breaker_1 = require("../utils/circuit-breaker");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shopify_bulk_operation_job_entity_1 = require("../entities/shopify-bulk-operation-job.entity");
const shopify_client_extensions_1 = require("../services/shopify-client-extensions");
const shopify_bulk_operation_job_entity_2 = require("../entities/shopify-bulk-operation-job.entity");
let ShopifyHealthController = ShopifyHealthController_1 = class ShopifyHealthController {
    constructor(shopifyClientService, shopifyClientExtensions, circuitBreaker, configService, bulkJobRepository) {
        this.shopifyClientService = shopifyClientService;
        this.shopifyClientExtensions = shopifyClientExtensions;
        this.circuitBreaker = circuitBreaker;
        this.configService = configService;
        this.bulkJobRepository = bulkJobRepository;
        this.logger = new common_1.Logger(ShopifyHealthController_1.name);
    }
    async getHealth() {
        const [shopifyApiHealth, databaseHealth, bulkOperationsHealth] = await Promise.all([
            this.checkShopifyApiHealth(),
            this.checkDatabaseHealth(),
            this.checkBulkOperationsHealth(),
        ]);
        const servicesHealthy = [shopifyApiHealth, databaseHealth, bulkOperationsHealth];
        const status = this.determineOverallStatus(servicesHealthy);
        const metrics = await this.getHealthMetrics();
        return {
            status,
            timestamp: new Date().toISOString(),
            environment: this.configService.get('NODE_ENV', 'development'),
            services: {
                shopifyApi: shopifyApiHealth,
                database: databaseHealth,
                bulkOperations: bulkOperationsHealth,
            },
            metrics,
        };
    }
    async getDiagnostics(merchantId) {
        const diagnosticsData = {
            timestamp: new Date().toISOString(),
            system: {
                nodeVersion: process.version,
                memory: process.memoryUsage(),
                uptime: process.uptime(),
            },
        };
        diagnosticsData.circuits = await this.getCircuitBreakerStatus();
        diagnosticsData.jobs = await this.getJobStatistics(merchantId);
        return diagnosticsData;
    }
    async checkShopifyApiHealth() {
        try {
            const isShopifyReachable = await this.shopifyClientExtensions.isShopifyReachable();
            return {
                healthy: isShopifyReachable,
                status: isShopifyReachable ? 'connected' : 'disconnected',
                lastChecked: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Shopify API health check failed: ${error.message}`);
            return {
                healthy: false,
                status: 'error',
                error: error.message,
                lastChecked: new Date().toISOString(),
            };
        }
    }
    async checkDatabaseHealth() {
        try {
            const queryResult = await this.bulkJobRepository.query('SELECT 1 as health');
            const isHealthy = Array.isArray(queryResult) && queryResult.length > 0 && queryResult[0].health === 1;
            return {
                healthy: isHealthy,
                status: isHealthy ? 'connected' : 'disconnected',
                lastChecked: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Database health check failed: ${error.message}`);
            return {
                healthy: false,
                status: 'error',
                error: error.message,
                lastChecked: new Date().toISOString(),
            };
        }
    }
    async checkBulkOperationsHealth() {
        try {
            const twoHoursAgo = new Date();
            twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
            const stuckJobs = await this.bulkJobRepository.count({
                where: {
                    status: shopify_bulk_operation_job_entity_2.BulkOperationJobStatus.RUNNING,
                    updatedAt: (0, typeorm_2.LessThan)(twoHoursAgo),
                },
            });
            const isHealthy = stuckJobs === 0;
            return {
                healthy: isHealthy,
                status: isHealthy ? 'operational' : 'degraded',
                details: { stuckJobs },
                lastChecked: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Bulk operations health check failed: ${error.message}`);
            return {
                healthy: false,
                status: 'error',
                error: error.message,
                lastChecked: new Date().toISOString(),
            };
        }
    }
    async getCircuitBreakerStatus() {
        try {
            const allCircuits = await this.circuitBreaker.getAllCircuits();
            const openCircuits = allCircuits.filter(c => c.state === circuit_breaker_1.CircuitState.OPEN);
            return {
                total: allCircuits.length,
                open: openCircuits.length,
                openCircuits: openCircuits.map(c => ({
                    key: c.key,
                    failureCount: c.failureCount,
                    nextAttemptTime: new Date(c.nextAttemptTime).toISOString(),
                })),
            };
        }
        catch (error) {
            this.logger.error(`Failed to get circuit breaker status: ${error.message}`);
            return { error: error.message };
        }
    }
    async getJobStatistics(merchantId) {
        try {
            let query = this.bulkJobRepository.createQueryBuilder('job');
            if (merchantId) {
                query = query.where('job.merchantId = :merchantId', { merchantId });
            }
            const statusCounts = await query
                .select('job.status', 'status')
                .addSelect('COUNT(*)', 'count')
                .groupBy('job.status')
                .getRawMany();
            const formattedCounts = statusCounts.reduce((acc, curr) => {
                acc[curr.status.toLowerCase()] = parseInt(curr.count, 10);
                return acc;
            }, {});
            const recentFailedJobs = await this.bulkJobRepository.find({
                where: { status: shopify_bulk_operation_job_entity_2.BulkOperationJobStatus.FAILED },
                order: { updatedAt: 'DESC' },
                take: 5,
                select: [
                    'id',
                    'merchantId',
                    'description',
                    'errorCode',
                    'errorDetails',
                    'createdAt',
                    'updatedAt',
                ],
            });
            return {
                counts: formattedCounts,
                recentFailures: recentFailedJobs,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get job statistics: ${error.message}`);
            return { error: error.message };
        }
    }
    async getHealthMetrics() {
        try {
            return {
                activeConnections: 0,
                openCircuits: 0,
                pendingJobs: await this.bulkJobRepository.count({
                    where: { status: shopify_bulk_operation_job_entity_2.BulkOperationJobStatus.RUNNING },
                }),
                failedJobs: await this.bulkJobRepository.count({
                    where: { status: shopify_bulk_operation_job_entity_2.BulkOperationJobStatus.FAILED },
                }),
                averageResponseTime: 0,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get health metrics: ${error.message}`);
            return {};
        }
    }
    determineOverallStatus(services) {
        const unhealthyCount = services.filter(s => !s.healthy).length;
        if (unhealthyCount === 0) {
            return 'healthy';
        }
        else if (unhealthyCount < services.length / 2) {
            return 'degraded';
        }
        else {
            return 'unhealthy';
        }
    }
};
exports.ShopifyHealthController = ShopifyHealthController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShopifyHealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('diagnostics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopifyHealthController.prototype, "getDiagnostics", null);
exports.ShopifyHealthController = ShopifyHealthController = ShopifyHealthController_1 = __decorate([
    (0, common_1.Controller)('integrations/shopify/health'),
    __param(4, (0, typeorm_1.InjectRepository)(shopify_bulk_operation_job_entity_1.ShopifyBulkOperationJob)),
    __metadata("design:paramtypes", [shopify_client_service_1.ShopifyClientService,
        shopify_client_extensions_1.ShopifyClientExtensions,
        circuit_breaker_1.ShopifyCircuitBreaker,
        config_1.ConfigService,
        typeorm_2.Repository])
], ShopifyHealthController);
//# sourceMappingURL=health.controller.js.map