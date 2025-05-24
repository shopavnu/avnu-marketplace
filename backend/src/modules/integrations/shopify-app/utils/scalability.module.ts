import { Module, Global, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ShopifyAppModule } from '../shopify-app.module'; // Added import

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
    forwardRef(() => ShopifyAppModule), // Used forwardRef
    ConfigModule,
    TypeOrmModule.forFeature([ShopifyBulkOperationJob]),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (_configService: ConfigService) => ({
        type: 'single',
        url: `redis://${process.env.REDIS_HOST || 'localhost'}:${parseInt(process.env.REDIS_PORT || '6379', 10)}`,
      }),
      inject: [ConfigService],
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
