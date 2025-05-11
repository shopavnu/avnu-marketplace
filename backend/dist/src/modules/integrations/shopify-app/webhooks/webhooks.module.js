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
Object.defineProperty(exports, '__esModule', { value: true });
exports.ShopifyWebhooksModule = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const config_1 = require('@nestjs/config');
const merchant_platform_connection_entity_1 = require('../../entities/merchant-platform-connection.entity');
const shopify_config_1 = require('../../../common/config/shopify-config');
const handlers_1 = require('./handlers');
const webhook_registry_1 = require('./webhook-registry');
const webhook_validator_1 = require('./webhook-validator');
const webhook_monitor_service_1 = require('./webhook-monitor.service');
const webhook_retry_service_1 = require('./webhook-retry.service');
const webhook_metrics_service_1 = require('./webhook-metrics.service');
const webhook_queue_module_1 = require('./webhook-queue.module');
const distributed_webhook_processor_1 = require('./distributed-webhook-processor');
const webhook_controller_1 = require('./webhook-controller');
const queue_dashboard_controller_1 = require('./queue-dashboard.controller');
const queue_dashboard_module_1 = require('./queue-dashboard.module');
const scalability_module_1 = require('../utils/scalability.module');
const connection_pool_manager_1 = require('../utils/connection-pool-manager');
const circuit_breaker_1 = require('../utils/circuit-breaker');
const structured_logger_1 = require('../utils/structured-logger');
const cache_manager_1 = require('../utils/cache-manager');
const webhook_deduplicator_1 = require('../utils/webhook-deduplicator');
const shopify_bulk_operation_job_entity_1 = require('../entities/shopify-bulk-operation-job.entity');
let ShopifyWebhooksModule = class ShopifyWebhooksModule {};
exports.ShopifyWebhooksModule = ShopifyWebhooksModule;
exports.ShopifyWebhooksModule = ShopifyWebhooksModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        typeorm_1.TypeOrmModule.forFeature([
          merchant_platform_connection_entity_1.MerchantPlatformConnection,
          shopify_bulk_operation_job_entity_1.ShopifyBulkOperationJob,
        ]),
        config_1.ConfigModule.forFeature(shopify_config_1.shopifyConfig),
        scalability_module_1.ShopifyScalabilityModule,
        webhook_queue_module_1.WebhookQueueModule,
        queue_dashboard_module_1.QueueDashboardModule,
      ],
      controllers: [
        webhook_controller_1.ShopifyWebhookController,
        queue_dashboard_controller_1.QueueDashboardController,
      ],
      providers: [
        webhook_registry_1.WebhookRegistry,
        webhook_validator_1.WebhookValidator,
        webhook_monitor_service_1.WebhookMonitorService,
        webhook_retry_service_1.WebhookRetryService,
        webhook_metrics_service_1.WebhookMetricsService,
        distributed_webhook_processor_1.DistributedWebhookProcessor,
        connection_pool_manager_1.ShopifyConnectionPoolManager,
        circuit_breaker_1.ShopifyCircuitBreaker,
        structured_logger_1.ShopifyStructuredLogger,
        cache_manager_1.ShopifyCacheManager,
        webhook_deduplicator_1.ShopifyWebhookDeduplicator,
        handlers_1.ProductWebhookHandler,
        handlers_1.OrderWebhookHandler,
        handlers_1.AppUninstalledWebhookHandler,
        handlers_1.CustomerWebhookHandler,
        handlers_1.InventoryWebhookHandler,
      ],
      exports: [
        webhook_registry_1.WebhookRegistry,
        webhook_validator_1.WebhookValidator,
        webhook_monitor_service_1.WebhookMonitorService,
        webhook_retry_service_1.WebhookRetryService,
        webhook_metrics_service_1.WebhookMetricsService,
        connection_pool_manager_1.ShopifyConnectionPoolManager,
        circuit_breaker_1.ShopifyCircuitBreaker,
        structured_logger_1.ShopifyStructuredLogger,
        cache_manager_1.ShopifyCacheManager,
        webhook_deduplicator_1.ShopifyWebhookDeduplicator,
      ],
    }),
  ],
  ShopifyWebhooksModule,
);
//# sourceMappingURL=webhooks.module.js.map
