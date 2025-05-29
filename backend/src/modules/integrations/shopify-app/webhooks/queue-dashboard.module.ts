import { Module } from '@nestjs/common';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { RouterModule } from '@nestjs/core';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
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
        console.log('[Bull Redis] REDIS_HOST:', configService.get('REDIS_HOST'));
        console.log('[Bull Redis] REDIS_PORT:', configService.get('REDIS_PORT'));
        console.log('[Bull Redis] REDIS_PASSWORD is set:', !!configService.get('REDIS_PASSWORD'));
        return {
          redis: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
            password: configService.get('REDIS_PASSWORD'), // do not default to empty string
            db: configService.get('REDIS_QUEUE_DB', 1),
          },
          prefix: 'shopify:',
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
          queues: [new BullAdapter(shopifyWebhooksQueue)],
          serverAdapter,
        });

        return serverAdapter;
      },
      inject: [getQueueToken('shopify-webhooks')],
    },
  ],
})
export class QueueDashboardModule {}
