# Phase 4D-2: Fulfillment Management - Webhook Handlers

## Objectives

- Implement webhook handlers for Shopify fulfillment events
- Process fulfillment creation, updates, and cancellations
- Ensure reliable tracking data synchronization

## Timeline: Week 16-17

## Tasks & Implementation Details

### 1. Fulfillment Webhook Controller

Create a controller to handle fulfillment-related webhooks:

```typescript
// src/modules/integrations/shopify-app/controllers/shopify-fulfillment-webhook.controller.ts

import { Controller, Post, Headers, Body, Logger } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ShopifyFulfillmentService } from '../services/shopify-fulfillment.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Controller('webhooks/shopify/fulfillments')
@SkipThrottle() // Skip rate limiting for webhooks
export class ShopifyFulfillmentWebhookController {
  private readonly logger = new Logger(ShopifyFulfillmentWebhookController.name);

  constructor(
    private readonly shopifyFulfillmentService: ShopifyFulfillmentService,
    @InjectQueue('shopify-fulfillments') private fulfillmentQueue: Queue,
  ) {}

  @Post('create')
  async handleFulfillmentCreation(
    @Headers('x-shopify-shop-domain') shop: string,
    @Headers('x-shopify-topic') topic: string,
    @Body() data: any,
  ) {
    this.logger.log(`Received ${topic} webhook from ${shop}`);
    
    try {
      // Process fulfillment creation
      await this.shopifyFulfillmentService.processNewFulfillment(shop, data);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing fulfillment creation: ${error.message}`, error.stack);
      
      // Queue for retry
      await this.fulfillmentQueue.add('retry-fulfillment-creation', {
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

  @Post('update')
  async handleFulfillmentUpdate(
    @Headers('x-shopify-shop-domain') shop: string,
    @Headers('x-shopify-topic') topic: string,
    @Body() data: any,
  ) {
    this.logger.log(`Received ${topic} webhook from ${shop}`);
    
    try {
      // Process fulfillment update
      await this.shopifyFulfillmentService.processFulfillmentUpdate(shop, data);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing fulfillment update: ${error.message}`, error.stack);
      
      // Queue for retry
      await this.fulfillmentQueue.add('retry-fulfillment-update', {
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
  async handleFulfillmentCancellation(
    @Headers('x-shopify-shop-domain') shop: string,
    @Headers('x-shopify-topic') topic: string,
    @Body() data: any,
  ) {
    this.logger.log(`Received ${topic} webhook from ${shop}`);
    
    try {
      // Process fulfillment cancellation
      await this.shopifyFulfillmentService.processFulfillmentCancellation(shop, data);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing fulfillment cancellation: ${error.message}`, error.stack);
      
      // Queue for retry
      await this.fulfillmentQueue.add('retry-fulfillment-cancellation', {
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

  @Post('tracking')
  async handleFulfillmentTracking(
    @Headers('x-shopify-shop-domain') shop: string,
    @Headers('x-shopify-topic') topic: string,
    @Body() data: any,
  ) {
    this.logger.log(`Received ${topic} webhook from ${shop}`);
    
    try {
      // Process tracking update
      await this.shopifyFulfillmentService.processTrackingUpdate(shop, data);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing tracking update: ${error.message}`, error.stack);
      
      // Queue for retry
      await this.fulfillmentQueue.add('retry-tracking-update', {
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

Update the webhook registration to include fulfillment topics:

```typescript
// Add to src/modules/integrations/shopify-app/services/shopify-auth.service.ts in the registerWebhooks method

const webhooks = [
  // Existing product and order webhooks
  // ...
  
  // Fulfillment webhooks
  { topic: 'FULFILLMENTS_CREATE', address: `${this.config.appUrl}/webhooks/shopify/fulfillments/create` },
  { topic: 'FULFILLMENTS_UPDATE', address: `${this.config.appUrl}/webhooks/shopify/fulfillments/update` },
  { topic: 'FULFILLMENTS_CANCELLED', address: `${this.config.appUrl}/webhooks/shopify/fulfillments/cancelled` },
];
```

### 3. Create Fulfillment Queue Processor

Create a processor for fulfillment webhook retries:

```typescript
// src/modules/integrations/shopify-app/processors/shopify-fulfillment.processor.ts

import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ShopifyFulfillmentService } from '../services/shopify-fulfillment.service';

@Processor('shopify-fulfillments')
export class ShopifyFulfillmentProcessor {
  private readonly logger = new Logger(ShopifyFulfillmentProcessor.name);

  constructor(private readonly shopifyFulfillmentService: ShopifyFulfillmentService) {}

  @Process('retry-fulfillment-creation')
  async processFulfillmentCreationRetry(job: Job) {
    const { shop, data, attempts } = job.data;
    
    this.logger.log(`Processing fulfillment creation retry ${attempts} for shop ${shop}`);
    
    try {
      await this.shopifyFulfillmentService.processNewFulfillment(shop, data);
      
      this.logger.log(`Successfully processed fulfillment creation retry for ${shop}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing fulfillment creation retry: ${error.message}`, error.stack);
      
      // If max retries reached, log but don't rethrow
      if (attempts >= 5) {
        this.logger.error(`Max retries reached for fulfillment creation from ${shop}, giving up`);
        return { success: false, error: error.message, maxRetriesReached: true };
      }
      
      // Otherwise, throw to trigger a retry
      throw error;
    }
  }

  @Process('retry-fulfillment-update')
  async processFulfillmentUpdateRetry(job: Job) {
    const { shop, data, attempts } = job.data;
    
    this.logger.log(`Processing fulfillment update retry ${attempts} for shop ${shop}`);
    
    try {
      await this.shopifyFulfillmentService.processFulfillmentUpdate(shop, data);
      
      this.logger.log(`Successfully processed fulfillment update retry for ${shop}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing fulfillment update retry: ${error.message}`, error.stack);
      
      if (attempts >= 5) {
        this.logger.error(`Max retries reached for fulfillment update from ${shop}, giving up`);
        return { success: false, error: error.message, maxRetriesReached: true };
      }
      
      throw error;
    }
  }

  @Process('retry-fulfillment-cancellation')
  async processFulfillmentCancellationRetry(job: Job) {
    const { shop, data, attempts } = job.data;
    
    this.logger.log(`Processing fulfillment cancellation retry ${attempts} for shop ${shop}`);
    
    try {
      await this.shopifyFulfillmentService.processFulfillmentCancellation(shop, data);
      
      this.logger.log(`Successfully processed fulfillment cancellation retry for ${shop}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing fulfillment cancellation retry: ${error.message}`, error.stack);
      
      if (attempts >= 5) {
        this.logger.error(`Max retries reached for fulfillment cancellation from ${shop}, giving up`);
        return { success: false, error: error.message, maxRetriesReached: true };
      }
      
      throw error;
    }
  }

  @Process('retry-tracking-update')
  async processTrackingUpdateRetry(job: Job) {
    const { shop, data, attempts } = job.data;
    
    this.logger.log(`Processing tracking update retry ${attempts} for shop ${shop}`);
    
    try {
      await this.shopifyFulfillmentService.processTrackingUpdate(shop, data);
      
      this.logger.log(`Successfully processed tracking update retry for ${shop}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing tracking update retry: ${error.message}`, error.stack);
      
      if (attempts >= 5) {
        this.logger.error(`Max retries reached for tracking update from ${shop}, giving up`);
        return { success: false, error: error.message, maxRetriesReached: true };
      }
      
      throw error;
    }
  }
}
```

### 4. Implement Idempotency Middleware

Create middleware to ensure webhook idempotency:

```typescript
// src/modules/integrations/shopify-app/middleware/webhook-idempotency.middleware.ts

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookProcessingRecord } from '../../../entities/webhook-processing-record.entity';

@Injectable()
export class WebhookIdempotencyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(WebhookIdempotencyMiddleware.name);

  constructor(
    @InjectRepository(WebhookProcessingRecord)
    private readonly processingRepository: Repository<WebhookProcessingRecord>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const idempotencyKey = req.headers['x-shopify-webhook-id'] as string;
    
    if (!idempotencyKey) {
      this.logger.warn('No idempotency key found in webhook request');
      return next();
    }
    
    try {
      // Check if we've already processed this webhook
      const existingRecord = await this.processingRepository.findOne({
        where: { idempotencyKey }
      });
      
      if (existingRecord) {
        this.logger.log(`Webhook ${idempotencyKey} already processed, returning cached response`);
        return res.status(200).json({ 
          success: true, 
          message: 'Already processed'
        });
      }
      
      // Store the processing record before proceeding
      await this.processingRepository.save({
        idempotencyKey,
        topic: req.headers['x-shopify-topic'] as string,
        shopDomain: req.headers['x-shopify-shop-domain'] as string,
        processedAt: new Date(),
      });
      
      return next();
    } catch (error) {
      this.logger.error(`Error in idempotency middleware: ${error.message}`, error.stack);
      return next();
    }
  }
}
```

### 5. Create Webhook Processing Record Entity

Create an entity to track processed webhooks:

```typescript
// src/modules/entities/webhook-processing-record.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('webhook_processing_records')
export class WebhookProcessingRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index({ unique: true })
  idempotencyKey: string;

  @Column()
  topic: string;

  @Column()
  shopDomain: string;

  @Column()
  processedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
```

### 6. Update Module Configuration

Update the Shopify module to include the new components:

```typescript
// Update src/modules/integrations/shopify-app/shopify.module.ts

import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { ShopifyFulfillmentWebhookController } from './controllers/shopify-fulfillment-webhook.controller';
import { ShopifyFulfillmentProcessor } from './processors/shopify-fulfillment.processor';
import { WebhookIdempotencyMiddleware } from './middleware/webhook-idempotency.middleware';
import { WebhookProcessingRecord } from '../../entities/webhook-processing-record.entity';

@Module({
  imports: [
    // Existing imports
    TypeOrmModule.forFeature([
      // Existing entities
      WebhookProcessingRecord,
    ]),
    BullModule.registerQueue({
      name: 'shopify-fulfillments',
    }),
    // Other imports
  ],
  providers: [
    // Existing providers
    ShopifyFulfillmentProcessor,
  ],
  controllers: [
    // Existing controllers
    ShopifyFulfillmentWebhookController,
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
      
    consumer
      .apply(WebhookIdempotencyMiddleware)
      .forRoutes(
        { path: 'webhooks/shopify/*', method: RequestMethod.POST }
      );
  }
}
```

### 7. Database Migration for Webhook Processing Records

Create a migration for the webhook processing record entity:

```typescript
// Create with: npx typeorm migration:create -n WebhookProcessingRecords

import { MigrationInterface, QueryRunner } from 'typeorm';

export class WebhookProcessingRecords1684500003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "webhook_processing_records" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "idempotency_key" varchar NOT NULL,
        "topic" varchar NOT NULL,
        "shop_domain" varchar NOT NULL,
        "processed_at" timestamp NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "uq_webhook_processing_records_idempotency_key" UNIQUE ("idempotency_key")
      );
      
      CREATE INDEX "idx_webhook_processing_records_idempotency_key" ON "webhook_processing_records"("idempotency_key");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "webhook_processing_records"`);
  }
}
```

## Dependencies & Prerequisites

- Completed Phase 4D-1 (Fulfillment Entities)
- Bull queue for webhook processing and retries
- Shopify webhook authentication middleware

## Testing Guidelines

1. **Webhook Registration:**
   - Verify all fulfillment webhook topics are registered with Shopify
   - Test webhook URL endpoints are accessible and properly authenticated

2. **Webhook Processing:**
   - Test each webhook type with sample fulfillment payloads
   - Verify retry mechanism for failed webhook processing
   - Test error handling and queue operations

3. **Idempotency:**
   - Test processing the same webhook multiple times with the same idempotency key
   - Verify no duplicate fulfillments are created

4. **Security:**
   - Verify webhook HMAC validation is performed
   - Test authentication failures are properly handled

## Next Phase

Once the fulfillment webhook handlers are implemented, proceed to [Phase 4D-3: Fulfillment Service](./shopify-app-phase4d3-fulfillment-service.md) to implement the core fulfillment processing service.
