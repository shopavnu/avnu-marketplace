import { Module } from '@nestjs/common';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RouterModule } from '@nestjs/core';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { ConfigModule } from '@nestjs/config';
import { WebhookQueueModule } from './webhook-queue.module'; // Added import
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
    WebhookQueueModule, // Use BullModule config from WebhookQueueModule
    BullModule.registerQueue({ // Register the specific queue for the dashboard
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
