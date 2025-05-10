# Phase 4A: Order Management - Webhook Handlers

## Objectives

- Implement order webhook handlers for Shopify order events
- Create the foundation for order data synchronization
- Ensure reliable and idempotent order processing

## Timeline: Weeks 14-15 (First part of Phase 4)

## Tasks & Implementation Details

### 1. Order Webhook Controller

Create a controller to handle order-related webhooks:

```typescript
// src/modules/integrations/shopify-app/controllers/shopify-order-webhook.controller.ts

import { Controller, Post, Headers, Body, Logger } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ShopifyOrderService } from '../services/shopify-order.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Controller('webhooks/shopify/orders')
@SkipThrottle() // Skip rate limiting for webhooks
export class ShopifyOrderWebhookController {
  private readonly logger = new Logger(ShopifyOrderWebhookController.name);

  constructor(
    private readonly shopifyOrderService: ShopifyOrderService,
    @InjectQueue('shopify-orders') private orderQueue: Queue,
  ) {}

  @Post('create')
  async handleOrderCreation(
    @Headers('x-shopify-shop-domain') shop: string,
    @Headers('x-shopify-topic') topic: string,
    @Body() data: any,
  ) {
    this.logger.log(`Received ${topic} webhook from ${shop}`);
    
    try {
      // Process order creation
      await this.shopifyOrderService.processNewOrder(shop, data);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing order creation: ${error.message}`, error.stack);
      
      // Queue for retry
      await this.orderQueue.add('retry-order-creation', {
        shop,
        data,
        attempts: 1,
        timestamp: new Date().toISOString()
      }, {
        delay: 60000, // Retry after 1 minute
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 60000
        }
      });
      
      return { success: false, queued: true };
    }
  }

  @Post('updated')
  async handleOrderUpdate(
    @Headers('x-shopify-shop-domain') shop: string,
    @Headers('x-shopify-topic') topic: string,
    @Body() data: any,
  ) {
    this.logger.log(`Received ${topic} webhook from ${shop}`);
    
    try {
      // Process order update
      await this.shopifyOrderService.processOrderUpdate(shop, data);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing order update: ${error.message}`, error.stack);
      
      // Queue for retry
      await this.orderQueue.add('retry-order-update', {
        shop,
        data,
        attempts: 1,
        timestamp: new Date().toISOString()
      }, {
        delay: 60000,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 60000
        }
      });
      
      return { success: false, queued: true };
    }
  }

  @Post('cancelled')
  async handleOrderCancellation(
    @Headers('x-shopify-shop-domain') shop: string,
    @Headers('x-shopify-topic') topic: string,
    @Body() data: any,
  ) {
    this.logger.log(`Received ${topic} webhook from ${shop}`);
    
    try {
      // Process order cancellation
      await this.shopifyOrderService.processOrderCancellation(shop, data);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing order cancellation: ${error.message}`, error.stack);
      
      // Queue for retry
      await this.orderQueue.add('retry-order-cancellation', {
        shop,
        data,
        attempts: 1,
        timestamp: new Date().toISOString()
      }, {
        delay: 60000,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 60000
        }
      });
      
      return { success: false, queued: true };
    }
  }

  @Post('paid')
  async handleOrderPaid(
    @Headers('x-shopify-shop-domain') shop: string,
    @Headers('x-shopify-topic') topic: string,
    @Body() data: any,
  ) {
    this.logger.log(`Received ${topic} webhook from ${shop}`);
    
    try {
      // Process order payment
      await this.shopifyOrderService.processOrderPayment(shop, data);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing order payment: ${error.message}`, error.stack);
      
      // Queue for retry
      await this.orderQueue.add('retry-order-payment', {
        shop,
        data,
        attempts: 1,
        timestamp: new Date().toISOString()
      }, {
        delay: 60000,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 60000
        }
      });
      
      return { success: false, queued: true };
    }
  }
}
```

### 2. Register Webhook Topics

Update the webhook registration to include order topics:

```typescript
// Add to src/modules/integrations/shopify-app/services/shopify-auth.service.ts in the registerWebhooks method

const webhooks = [
  // Existing product webhooks
  // ...
  
  // Order webhooks
  { topic: 'ORDERS_CREATE', address: `${this.config.appUrl}/webhooks/shopify/orders/create` },
  { topic: 'ORDERS_UPDATED', address: `${this.config.appUrl}/webhooks/shopify/orders/updated` },
  { topic: 'ORDERS_CANCELLED', address: `${this.config.appUrl}/webhooks/shopify/orders/cancelled` },
  { topic: 'ORDERS_PAID', address: `${this.config.appUrl}/webhooks/shopify/orders/paid` },
];
```

### 3. Create Order Queue Processor

Create a processor for order webhook retries:

```typescript
// src/modules/integrations/shopify-app/processors/shopify-order.processor.ts

import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ShopifyOrderService } from '../services/shopify-order.service';

@Processor('shopify-orders')
export class ShopifyOrderProcessor {
  private readonly logger = new Logger(ShopifyOrderProcessor.name);

  constructor(private readonly shopifyOrderService: ShopifyOrderService) {}

  @Process('retry-order-creation')
  async processOrderCreationRetry(job: Job) {
    const { shop, data, attempts } = job.data;
    
    this.logger.log(`Processing order creation retry ${attempts} for shop ${shop}`);
    
    try {
      await this.shopifyOrderService.processNewOrder(shop, data);
      
      this.logger.log(`Successfully processed order creation retry for ${shop}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing order creation retry: ${error.message}`, error.stack);
      
      // If max retries reached, log but don't rethrow
      if (attempts >= 5) {
        this.logger.error(`Max retries reached for order creation from ${shop}, giving up`);
        return { success: false, error: error.message, maxRetriesReached: true };
      }
      
      // Otherwise, throw to trigger a retry
      throw error;
    }
  }

  @Process('retry-order-update')
  async processOrderUpdateRetry(job: Job) {
    const { shop, data, attempts } = job.data;
    
    this.logger.log(`Processing order update retry ${attempts} for shop ${shop}`);
    
    try {
      await this.shopifyOrderService.processOrderUpdate(shop, data);
      
      this.logger.log(`Successfully processed order update retry for ${shop}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing order update retry: ${error.message}`, error.stack);
      
      if (attempts >= 5) {
        this.logger.error(`Max retries reached for order update from ${shop}, giving up`);
        return { success: false, error: error.message, maxRetriesReached: true };
      }
      
      throw error;
    }
  }

  @Process('retry-order-cancellation')
  async processOrderCancellationRetry(job: Job) {
    const { shop, data, attempts } = job.data;
    
    this.logger.log(`Processing order cancellation retry ${attempts} for shop ${shop}`);
    
    try {
      await this.shopifyOrderService.processOrderCancellation(shop, data);
      
      this.logger.log(`Successfully processed order cancellation retry for ${shop}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing order cancellation retry: ${error.message}`, error.stack);
      
      if (attempts >= 5) {
        this.logger.error(`Max retries reached for order cancellation from ${shop}, giving up`);
        return { success: false, error: error.message, maxRetriesReached: true };
      }
      
      throw error;
    }
  }

  @Process('retry-order-payment')
  async processOrderPaymentRetry(job: Job) {
    const { shop, data, attempts } = job.data;
    
    this.logger.log(`Processing order payment retry ${attempts} for shop ${shop}`);
    
    try {
      await this.shopifyOrderService.processOrderPayment(shop, data);
      
      this.logger.log(`Successfully processed order payment retry for ${shop}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing order payment retry: ${error.message}`, error.stack);
      
      if (attempts >= 5) {
        this.logger.error(`Max retries reached for order payment from ${shop}, giving up`);
        return { success: false, error: error.message, maxRetriesReached: true };
      }
      
      throw error;
    }
  }
}
```

### 4. Update Module Configuration

Update the Shopify module to include the new components:

```typescript
// Update src/modules/integrations/shopify-app/shopify.module.ts

import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { ShopifyOrderWebhookController } from './controllers/shopify-order-webhook.controller';
import { ShopifyOrderProcessor } from './processors/shopify-order.processor';

@Module({
  imports: [
    // Existing imports
    BullModule.registerQueue({
      name: 'shopify-sync',
    }),
    BullModule.registerQueue({
      name: 'shopify-orders',
    }),
    // Other imports
  ],
  providers: [
    // Existing providers
    ShopifyOrderProcessor,
  ],
  controllers: [
    // Existing controllers
    ShopifyOrderWebhookController,
  ],
  exports: [
    // Existing exports
  ],
})
export class ShopifyModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ShopifyWebhookMiddleware)
      .forRoutes(
        { path: 'webhooks/shopify/*', method: RequestMethod.POST }
      );
  }
}
```

## Dependencies & Prerequisites

- Completed Phase 3 (Product Synchronization)
- Bull queue for order processing
- Shopify webhooks registration for order events

## Testing Guidelines

1. **Webhook Registration:**
   - Verify all order webhook topics are registered with Shopify
   - Test webhook URL endpoints are accessible and properly authenticated

2. **Order Processing:**
   - Test each webhook type with sample order payloads
   - Verify retry mechanism for failed order processing
   - Test error handling and queue operations

3. **Idempotency:**
   - Test processing the same order webhook multiple times
   - Verify no duplicate orders are created

## Next Phase

Once the order webhook handlers are implemented, proceed to [Phase 4B: Order Entities](./shopify-app-phase4b-order-entities.md) to implement the database structure for storing order data.
