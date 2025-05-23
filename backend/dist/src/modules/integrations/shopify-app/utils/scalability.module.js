"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyScalabilityModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("@nestjs-modules/ioredis");
const connection_pool_manager_1 = require("./connection-pool-manager");
const circuit_breaker_1 = require("./circuit-breaker");
const structured_logger_1 = require("./structured-logger");
const cache_manager_1 = require("./cache-manager");
const webhook_deduplicator_1 = require("./webhook-deduplicator");
const health_controller_1 = require("../controllers/health.controller");
const shopify_bulk_operation_job_entity_1 = require("../entities/shopify-bulk-operation-job.entity");
let ShopifyScalabilityModule = class ShopifyScalabilityModule {
};
exports.ShopifyScalabilityModule = ShopifyScalabilityModule;
exports.ShopifyScalabilityModule = ShopifyScalabilityModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([shopify_bulk_operation_job_entity_1.ShopifyBulkOperationJob]),
            ioredis_1.RedisModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'single',
                    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${parseInt(process.env.REDIS_PORT || '6379', 10)}`,
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [
            connection_pool_manager_1.ShopifyConnectionPoolManager,
            circuit_breaker_1.ShopifyCircuitBreaker,
            structured_logger_1.ShopifyStructuredLogger,
            cache_manager_1.ShopifyCacheManager,
            webhook_deduplicator_1.ShopifyWebhookDeduplicator,
        ],
        controllers: [health_controller_1.ShopifyHealthController],
        exports: [
            connection_pool_manager_1.ShopifyConnectionPoolManager,
            circuit_breaker_1.ShopifyCircuitBreaker,
            structured_logger_1.ShopifyStructuredLogger,
            cache_manager_1.ShopifyCacheManager,
            webhook_deduplicator_1.ShopifyWebhookDeduplicator,
        ],
    })
], ShopifyScalabilityModule);
//# sourceMappingURL=scalability.module.js.map