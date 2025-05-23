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
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD', ''),
          db: configService.get('REDIS_QUEUE_DB', 1), // Use a separate DB from cache
        },
        prefix: 'shopify:', // Prefix for queue names
        defaultJobOptions: {
          removeOnComplete: 100, // Keep only the latest 100 completed jobs
          removeOnFail: 1000, // Keep the latest 1000 failed jobs for debugging
        },
      }),
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
