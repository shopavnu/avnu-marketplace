import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { shopifyConfig } from '../../../common/config/shopify-config';

// Import handlers
import {
  ProductWebhookHandler,
  OrderWebhookHandler,
  AppUninstalledWebhookHandler,
  CustomerWebhookHandler,
  InventoryWebhookHandler,
} from './handlers';
import { WebhookRegistry } from './webhook-registry';
import { WebhookValidator } from './webhook-validator';
import { WebhookMonitorService } from './webhook-monitor.service';
import { WebhookRetryService } from './webhook-retry.service';
import { WebhookMetricsService } from './webhook-metrics.service';
import { WebhookQueueModule } from './webhook-queue.module';
import { DistributedWebhookProcessor } from './distributed-webhook-processor';
import { ShopifyWebhookController } from './webhook-controller';
import { QueueDashboardController } from './queue-dashboard.controller';
import { QueueDashboardModule } from './queue-dashboard.module';

// Import scalability components
import { ShopifyScalabilityModule } from '../utils/scalability.module';
import { ShopifyConnectionPoolManager } from '../utils/connection-pool-manager';
import { ShopifyCircuitBreaker } from '../utils/circuit-breaker';
import { ShopifyStructuredLogger } from '../utils/structured-logger';
import { ShopifyCacheManager } from '../utils/cache-manager';
import { ShopifyWebhookDeduplicator } from '../utils/webhook-deduplicator';
import { ShopifyBulkOperationJob } from '../entities/shopify-bulk-operation-job.entity';

/**
 * ShopifyWebhooksModule - Module for the enhanced webhook system
 *
 * This module provides:
 * - Registry pattern for webhook handler management
 * - Advanced HMAC verification
 * - Standardized error handling for webhooks
 * - Proper separation of concerns between webhook processing components
 * - Scalability components for multi-tenant deployments:
 *   - Connection pool management
 *   - Circuit breaker for API resilience
 *   - Webhook deduplication
 *   - Multi-level caching
 *   - Structured logging
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([MerchantPlatformConnection, ShopifyBulkOperationJob]),
    ConfigModule.forFeature(shopifyConfig),
    ShopifyScalabilityModule,
    forwardRef(() => WebhookQueueModule),
    QueueDashboardModule,
  ],
  controllers: [ShopifyWebhookController, QueueDashboardController],
  providers: [
    // Core webhook infrastructure
    WebhookRegistry,
    WebhookValidator,
    WebhookMonitorService,
    WebhookRetryService,
    WebhookMetricsService,

    // Scalability utilities
    ShopifyConnectionPoolManager,
    ShopifyCircuitBreaker,
    ShopifyStructuredLogger,
    ShopifyCacheManager,
    ShopifyWebhookDeduplicator,

    // Webhook handlers
    ProductWebhookHandler,
    OrderWebhookHandler,
    AppUninstalledWebhookHandler,
    CustomerWebhookHandler,
    InventoryWebhookHandler,
  ],
  exports: [
    // Core webhook infrastructure
    WebhookRegistry,
    WebhookValidator,
    WebhookMonitorService,
    WebhookRetryService,
    WebhookMetricsService,
    // DistributedWebhookProcessor is now provided and exported by WebhookQueueModule

    // Scalability utilities
    ShopifyConnectionPoolManager,
    ShopifyCircuitBreaker,
    ShopifyStructuredLogger,
    ShopifyCacheManager,
    ShopifyWebhookDeduplicator,

    // Webhook handlers
    ProductWebhookHandler,
    OrderWebhookHandler,
    AppUninstalledWebhookHandler,
    CustomerWebhookHandler,
    InventoryWebhookHandler,
  ],
})
export class ShopifyWebhooksModule {}
