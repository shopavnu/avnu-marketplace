import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from 'nestjs-redis';

// Import our scalability utilities
import { ShopifyConnectionPoolManager } from './connection-pool-manager';
import { ShopifyCircuitBreaker } from './circuit-breaker';
import { ShopifyStructuredLogger } from './structured-logger';
import { ShopifyCacheManager } from './cache-manager';
import { ShopifyWebhookDeduplicator } from './webhook-deduplicator';

// Import the health controller
import { ShopifyHealthController } from '../controllers/health.controller';

// Import entities
import { ShopifyBulkOperationJob } from '../entities/shopify-bulk-operation-job.entity';

// Import existing services that we need
import { ShopifyClientService as _ShopifyClientService } from '../services/shopify-client.service';

/**
 * ShopifyScalabilityModule
 *
 * Provides scalability utilities for the Shopify integration:
 * - Connection Pool Management
 * - Circuit Breaker for API resilience
 * - Structured Logging
 * - Multi-level Caching
 * - Webhook Deduplication
 * - Health Monitoring
 */
@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ShopifyBulkOperationJob]),
    RedisModule.register({
      // These would ideally come from your config service
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      keyPrefix: 'shopify:',
    }),
  ],
  providers: [
    ShopifyConnectionPoolManager,
    ShopifyCircuitBreaker,
    ShopifyStructuredLogger,
    ShopifyCacheManager,
    ShopifyWebhookDeduplicator,
  ],
  controllers: [ShopifyHealthController],
  exports: [
    ShopifyConnectionPoolManager,
    ShopifyCircuitBreaker,
    ShopifyStructuredLogger,
    ShopifyCacheManager,
    ShopifyWebhookDeduplicator,
  ],
})
export class ShopifyScalabilityModule {}
