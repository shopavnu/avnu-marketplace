import { Module } from '@nestjs/common';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RouterModule } from '@nestjs/core';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ShopifyScalabilityModule } from '../utils/scalability.module';

/**
 * Queue dashboard module for monitoring and managing webhook processing
 *
 * This provides a web UI to:
 * - Monitor queue performance and status
 * - View failed jobs and error details
 * - Manually retry or remove jobs
 * - Monitor queue metrics for thousands of merchants
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Debug log to verify Redis password is set (does not print actual password)
        console.log('[BullMQ Dashboard Redis] REDIS_HOST:', configService.get('REDIS_HOST'));
        console.log('[BullMQ Dashboard Redis] REDIS_PORT:', configService.get('REDIS_PORT'));
        console.log('[BullMQ Dashboard Redis] REDIS_USERNAME:', configService.get('REDIS_USERNAME')); // Added log for username
        console.log(
          '[BullMQ Dashboard Redis] REDIS_PASSWORD is set:',
          !!configService.get('REDIS_PASSWORD'),
        );
        return {
          connection: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
            password: configService.get('REDIS_PASSWORD'), // do not default to empty string
            username: configService.get('REDIS_USERNAME'), // Add username
            db: configService.get('REDIS_QUEUE_DB', 0), // Default to DB 0
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: 'shopify-webhooks',
    }),
    RouterModule.register([
      {
        path: 'admin/queues',
        module: QueueDashboardModule,
      },
    ]),
    ShopifyScalabilityModule,
  ],
  controllers: [],
  providers: [
    {
      provide: 'BULL_BOARD_ADAPTER', // Renamed for clarity
      useFactory: (shopifyWebhooksQueue: Queue) => {
        // Create Express server for Bull Board UI
        const serverAdapter = new ExpressAdapter();
        serverAdapter.setBasePath('/admin/queues');

        // Create Bull Board with queues
        createBullBoard({
          queues: [new BullMQAdapter(shopifyWebhooksQueue)],
          serverAdapter,
        });

        return serverAdapter;
      },
      inject: [getQueueToken('shopify-webhooks')],
    },
  ],
})
export class QueueDashboardModule {}
