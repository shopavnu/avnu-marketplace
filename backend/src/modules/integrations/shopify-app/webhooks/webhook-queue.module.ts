import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DistributedWebhookProcessor } from './distributed-webhook-processor';
import { ShopifyWebhooksModule } from './webhooks.module';
import { WebhookRegistry as _WebhookRegistry } from './webhook-registry';
import { WebhookValidator as _WebhookValidator } from './webhook-validator';
import { ShopifyWebhookDeduplicator as _ShopifyWebhookDeduplicator } from '../utils/webhook-deduplicator';
import { ShopifyStructuredLogger as _ShopifyStructuredLogger } from '../utils/structured-logger';

/**
 * Module for distributed webhook processing using Bull queue
 *
 * This module sets up Bull queue with Redis for reliable webhook processing
 * across multiple instances.
 */
@Module({
  imports: [
    forwardRef(() => ShopifyWebhooksModule), // Added to provide WebhookRegistry and other dependencies
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST');
        const port = parseInt(configService.get<string>('REDIS_PORT') || '6379', 10);
        const username = configService.get<string>('REDIS_USERNAME') || 'default';
        const password = configService.get<string>('REDIS_PASSWORD');

        console.log('[Bull Redis] Attempting to connect with options:');
        console.log(`[Bull Redis]   Host: ${host}`);
        console.log(`[Bull Redis]   Port: ${port}`);
        console.log(`[Bull Redis]   Username: ${username}`);
        console.log(`[Bull Redis]   Password is set: ${!!password}`);
        // DO NOT log the actual password value here in production code

        const redisOptions: any = {
          host,
          port,
        };

        if (username) {
          redisOptions.username = username;
        }
        if (password) {
          redisOptions.password = password;
        }

        // Add TLS option if REDIS_TLS_ENABLED is true
        const tlsEnabled = configService.get<string>('REDIS_TLS_ENABLED');
        if (tlsEnabled === 'true') {
          redisOptions.tls = {}; // Enable TLS, ioredis will use default TLS options
          // or you can specify certs etc. if needed: { ca: fs.readFileSync('path/to/ca.crt') }
          console.log('[Bull Redis]   TLS: enabled');
        } else {
          console.log('[Bull Redis]   TLS: disabled');
        }

        return {
          connection: redisOptions, // Changed from 'redis' to 'connection' for BullMQ v5+
          defaultJobOptions: {
            removeOnComplete: 100, // Keep only the latest 100 completed jobs
            removeOnFail: 1000, // Keep the latest 1000 failed jobs for debugging
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: 'shopify-webhooks',
      limiter: {
        max: 200, // Max 200 jobs processed per time window
        duration: 1000, // Per 1 second (effectively 200 jobs/sec)
        bounceBack: false, // Don't bounce jobs back to queue
      },
    }),
  ],
  providers: [DistributedWebhookProcessor],
  exports: [DistributedWebhookProcessor],
})
export class WebhookQueueModule {}
