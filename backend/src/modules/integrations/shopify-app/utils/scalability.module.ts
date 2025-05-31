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
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST');
        const port = configService.get<number>('REDIS_PORT');
        const username = configService.get<string>('REDIS_USERNAME');
        const password = configService.get<string>('REDIS_PASSWORD');
        const tlsEnabledStr = configService.get<string>('REDIS_TLS_ENABLED', 'false');
        const enableTls = tlsEnabledStr?.toLowerCase().trim() === 'true';
        const db = configService.get<number>('REDIS_CACHE_DB', 0); // Using a different DB for cache if needed, else 0

        // Log the connection parameters (excluding password for security)
        console.log(`[@nestjs-modules/ioredis] Connecting to Redis: host=${host}, port=${port}, username=${username}, tls=${enableTls}, db=${db}`);

        return {
          type: 'single',
          options: {
            host: host,
            port: port,
            username: username, // Will be 'default'
            password: password,
            db: db,
            tls: enableTls ? {} : undefined,
            // Add any other ioredis options needed, e.g., commandTimeout
            // commandTimeout: configService.get<number>('REDIS_COMMAND_TIMEOUT', 5000),
          },
        };
      },
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
