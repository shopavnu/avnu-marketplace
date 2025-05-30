import { BullModule } from '@nestjs/bullmq'; // bullmq uses different import
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common'; // Import Logger

// Keep existing imports for processors, services etc.
import { DistributedWebhookProcessor } from './distributed-webhook-processor'; // Assuming this is the correct processor for bullmq
import { ShopifyWebhooksModule } from './webhooks.module';
// Remove unused imports if any, or ensure they are compatible with bullmq
// import { WebhookRegistry as _WebhookRegistry } from './webhook-registry';
// import { WebhookValidator as _WebhookValidator } from './webhook-validator';
// import { ShopifyWebhookDeduplicator as _ShopifyWebhookDeduplicator } from '../utils/webhook-deduplicator';
// import { ShopifyStructuredLogger as _ShopifyStructuredLogger } from '../utils/structured-logger';

@Module({
  imports: [
    forwardRef(() => ShopifyWebhooksModule),
    ConfigModule, // Ensure ConfigModule is available
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('WebhookQueueModule'); // Instantiate Logger

        // Raw environment variables for BullMQ connection
        const rawRedisHost = configService.get<string>('REDIS_HOST');
        const rawRedisPort = configService.get<string>('REDIS_PORT');
        const rawRedisUsername = configService.get<string>('REDIS_USERNAME');
        const rawRedisPassword = configService.get<string>('REDIS_PASSWORD');
        const rawRedisTlsEnabled = configService.get<string>('REDIS_TLS_ENABLED');

        logger.log(`BullMQ Raw REDIS_HOST: ${rawRedisHost}`);
        logger.log(`BullMQ Raw REDIS_PORT: ${rawRedisPort}`);
        logger.log(`BullMQ Raw REDIS_USERNAME: ${rawRedisUsername}`);
        logger.log(`BullMQ Raw REDIS_PASSWORD is set: ${!!rawRedisPassword}`);
        logger.log(
          `BullMQ Raw REDIS_TLS_ENABLED: "${rawRedisTlsEnabled}", type: ${typeof rawRedisTlsEnabled}`,
        );

        // Robust parsing for REDIS_TLS_ENABLED
        const enableTls =
          typeof rawRedisTlsEnabled === 'string' &&
          rawRedisTlsEnabled.toLowerCase().trim() === 'true';

        logger.log(`BullMQ Parsed enableTls: ${enableTls}`);

        const connectionOptions = {
          host: rawRedisHost,
          port: Number(rawRedisPort),
          username: rawRedisUsername || 'default',
          password: rawRedisPassword,
          tls: enableTls ? {} : undefined, // Explicitly set TLS options for BullMQ
        };

        // Log the connection options that will be used (mask password)
        const loggableConnectionOptions = {
          ...connectionOptions,
          password: connectionOptions.password ? '********' : undefined,
        };
        logger.log('BullMQ attempting to connect to Redis with options:');
        logger.log(JSON.stringify(loggableConnectionOptions, null, 2));

        return {
          connection: connectionOptions,
          defaultJobOptions: {
            attempts: 3, // Number of times to retry a job if it fails
            backoff: {
              type: 'exponential',
              delay: 1000, // Initial delay in ms
            },
            removeOnComplete: true, // Remove job from queue once completed
            removeOnFail: 100, // Keep 100 failed jobs
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: 'shopify-webhooks', // Ensure this name matches your processor
      // BullMQ specific limiter options might differ from bull
      // Example limiter for BullMQ (adjust as needed):
      // limiter: {
      //   max: 200,
      //   duration: 1000,
      // },
    }),
  ],
  providers: [DistributedWebhookProcessor], // Ensure processor is correctly set up for bullmq
  exports: [BullModule, DistributedWebhookProcessor], // Export BullModule and DistributedWebhookProcessor
})
export class WebhookQueueModule {}
