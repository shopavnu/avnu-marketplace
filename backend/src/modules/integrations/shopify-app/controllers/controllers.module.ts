import { Module } from '@nestjs/common';
import { ShopifyWebhooksController } from './webhooks.controller';
import { ShopifyMetricsController } from './metrics.controller';
import { ShopifyWebhooksModule } from '../webhooks/webhooks.module';

/**
 * Module for all Shopify controllers
 */
@Module({
  imports: [ShopifyWebhooksModule],
  controllers: [ShopifyWebhooksController, ShopifyMetricsController],
})
export class ShopifyControllersModule {}
