# Phase 3: Advanced Patterns & Best Practices

## Objectives

- Implement advanced techniques for robust Shopify integration
- Add rate limiting and throttling strategies
- Ensure data consistency with atomic operations
- Enhance error recovery and resilience
- Implement performance monitoring

## Timeline: Throughout Phase 3 Implementation (Weeks 8-13)

## Tasks & Implementation Details

### 1. Rate Limiting and Throttling Strategy

Implement a service to handle Shopify API rate limits:

```typescript
// src/modules/integrations/shopify-app/services/shopify-rate-limit.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis, Redis } from '@nestjs/redis';

@Injectable()
export class ShopifyRateLimitService {
  private readonly logger = new Logger(ShopifyRateLimitService.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * Attempt to acquire a token for API call
   * @param shop Shopify shop domain
   * @param costPoints Cost of the operation in rate limit points (default: 1)
   * @returns boolean indicating if token was acquired
   */
  async acquireToken(shop: string, costPoints: number = 1): Promise<boolean> {
    const key = `shopify:ratelimit:${shop}`;
    const now = Date.now();
    const windowSize = 60000; // 1 minute in milliseconds
    const maxPoints = 80; // Shopify default limit is ~80 points per minute

    // Implement sliding window rate limiting
    const result = await this.redis.eval(
      `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local windowSize = tonumber(ARGV[2])
      local maxPoints = tonumber(ARGV[3])
      local costPoints = tonumber(ARGV[4])
      
      -- Clean up old requests
      redis.call('ZREMRANGEBYSCORE', key, 0, now - windowSize)
      
      -- Count current points in window
      local currentPoints = redis.call('ZCARD', key)
      
      -- Check if adding cost would exceed limit
      if currentPoints + costPoints > maxPoints then
        return 0
      end
      
      -- Add the new request
      redis.call('ZADD', key, now, now .. ':' .. math.random())
      -- Set expiration on the key
      redis.call('EXPIRE', key, windowSize / 1000 * 2)
      
      return 1
      `,
      1,
      key,
      now.toString(),
      windowSize.toString(),
      maxPoints.toString(),
      costPoints.toString()
    );

    return result === 1;
  }

  /**
   * Wait for a token to become available with exponential backoff
   * @param shop Shopify shop domain
   * @param costPoints Cost of the operation in rate limit points
   * @param maxRetries Maximum number of retries
   * @returns boolean indicating if token was eventually acquired
   */
  async waitForToken(shop: string, costPoints: number = 1, maxRetries: number = 5): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      const acquired = await this.acquireToken(shop, costPoints);
      if (acquired) return true;
      
      // Exponential backoff
      const delay = Math.pow(2, i) * 1000;
      this.logger.log(`Rate limited for shop ${shop}, waiting ${delay}ms before retry ${i+1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    return false;
  }
}
```

Update the `ShopifyClientService` to use rate limiting:

```typescript
// Enhance src/modules/integrations/shopify-app/services/shopify-client.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ShopifyRateLimitService } from './shopify-rate-limit.service';

@Injectable()
export class ShopifyClientService {
  private readonly logger = new Logger(ShopifyClientService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly rateLimitService: ShopifyRateLimitService
  ) {}

  /**
   * Execute a GraphQL query with rate limiting
   */
  async query(shop: string, accessToken: string, query: string, variables?: any): Promise<any> {
    // Estimate cost (simple version, real implementation would parse query)
    const estimatedCost = this.estimateQueryCost(query);
    
    // Wait for rate limit token
    const acquired = await this.rateLimitService.waitForToken(shop, estimatedCost);
    if (!acquired) {
      throw new Error('Rate limit exceeded, could not acquire token after retries');
    }
    
    // Make the API call
    try {
      const url = `https://${shop}/admin/api/2023-04/graphql.json`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken
        },
        body: JSON.stringify({
          query,
          variables
        })
      });
      
      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Check for errors
      if (data.errors && data.errors.length > 0) {
        const errorMessage = data.errors.map(e => e.message).join('; ');
        throw new Error(`GraphQL errors: ${errorMessage}`);
      }
      
      return data;
    } catch (error) {
      this.logger.error(`Error executing query for ${shop}: ${error.message}`, error);
      throw error;
    }
  }
  
  /**
   * Estimate the cost of a GraphQL query
   * Real implementation would use more sophisticated parsing
   */
  private estimateQueryCost(query: string): number {
    if (query.includes('bulkOperationRunQuery')) {
      return 10; // Bulk operations are expensive
    } else if (query.includes('products(')) {
      return 5; // Product queries
    } else if (query.includes('inventoryItems(')) {
      return 3; // Inventory queries
    }
    
    return 1; // Default cost
  }
}
```

### 2. Error Recovery and Resilience

Create utility functions for resilient operations:

```typescript
// src/modules/integrations/shopify-app/utils/resilience.util.ts

import { Logger } from '@nestjs/common';

const logger = new Logger('ResilienceUtil');

/**
 * Execute an operation with retry for transient failures
 * @param operation Function to execute
 * @param maxRetries Maximum number of retries
 * @param retryableErrors Array of error strings to retry on
 * @returns Promise of operation result
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  retryableErrors: string[] = ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', '429', '503']
): Promise<T> {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const errorString = error.toString();
      const isRetryable = retryableErrors.some(retryableError => 
        errorString.includes(retryableError)
      );
      
      if (!isRetryable) throw error;
      
      // Calculate backoff time: 2^attempt * 100ms + random jitter
      const backoffTime = Math.pow(2, attempt) * 100 + Math.random() * 100;
      
      logger.warn(
        `Retryable error encountered (${attempt}/${maxRetries}), retrying in ${backoffTime}ms`,
        error
      );
      
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      lastError = error;
    }
  }
  
  throw lastError;
}

/**
 * Execute an operation with a circuit breaker pattern
 * @param operation Function to execute
 * @param circuitKey Key for the circuit
 * @param options Circuit breaker options
 * @returns Promise of operation result
 */
export async function withCircuitBreaker<T>(
  operation: () => Promise<T>,
  circuitKey: string,
  options: {
    failureThreshold: number;
    resetTimeout: number;
    redis: any;
  }
): Promise<T> {
  const { failureThreshold, resetTimeout, redis } = options;
  const circuitBreakerKey = `circuit:${circuitKey}`;
  
  // Check if circuit is open
  const circuitState = await redis.get(circuitBreakerKey);
  if (circuitState === 'open') {
    throw new Error(`Circuit ${circuitKey} is open`);
  }
  
  try {
    const result = await operation();
    
    // Reset failure count on success
    await redis.del(`${circuitBreakerKey}:failures`);
    
    return result;
  } catch (error) {
    // Increment failure count
    const failures = await redis.incr(`${circuitBreakerKey}:failures`);
    
    // Check if threshold exceeded
    if (failures >= failureThreshold) {
      logger.warn(`Circuit ${circuitKey} opened after ${failures} failures`);
      
      // Open the circuit
      await redis.set(circuitBreakerKey, 'open', 'EX', Math.floor(resetTimeout / 1000));
    }
    
    throw error;
  }
}
```

Apply resilience patterns to webhook handling:

```typescript
// Update webhook handling in src/modules/integrations/shopify-app/controllers/shopify-webhook.controller.ts

import { withRetry } from '../utils/resilience.util';

@Post('products')
async handleProductWebhook(
  @Headers('x-shopify-shop-domain') shop: string,
  @Headers('x-shopify-topic') topic: string,
  @Body() data: any,
) {
  this.logger.log(`Received ${topic} webhook from ${shop}`);
  
  // Process based on specific event type
  const eventType = topic.split('/')[1];
  
  try {
    // Use the resilience pattern for webhook processing
    await withRetry(async () => {
      switch (eventType) {
        case 'CREATE':
          await this.shopifySyncService.handleProductCreated(shop, data);
          break;
        case 'UPDATE':
          await this.shopifySyncService.handleProductUpdated(shop, data);
          break;
        case 'DELETE':
          await this.shopifySyncService.handleProductDeleted(shop, data);
          break;
        default:
          this.logger.warn(`Unknown product event type: ${eventType}`);
      }
    }, 3, ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'Database connection error']);
    
    return { success: true };
  } catch (error) {
    this.logger.error(`Error processing ${topic} webhook: ${error.message}`, error.stack);
    
    // Queue for retry
    await this.syncQueue.add('retry-product-webhook', {
      shop,
      topic,
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
```

### 3. Atomic Operations and Data Consistency

Enhance the sync service with transaction support:

```typescript
// Update src/modules/integrations/shopify-app/services/shopify-sync.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { MerchantPlatformConnection } from '../../../entities/merchant-platform-connection.entity';
import { Product } from '../../../entities/product.entity';
import { ProductVariant } from '../../../entities/product-variant.entity';

@Injectable()
export class ShopifySyncService {
  private readonly logger = new Logger(ShopifySyncService.name);

  constructor(
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantConnectionRepository: Repository<MerchantPlatformConnection>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    private readonly connection: Connection, // Add connection for transactions
  ) {}

  /**
   * Handle product update webhook with transaction support
   */
  async handleProductUpdated(shop: string, productData: any): Promise<void> {
    const merchantConnection = await this.getMerchantConnection(shop);
    
    // Start a database transaction
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Get repositories within the transaction
      const productRepo = queryRunner.manager.getRepository(Product);
      const variantRepo = queryRunner.manager.getRepository(ProductVariant);
      
      // Check if this product is selected for sync
      if (!await this.isProductSelected(merchantConnection, productData.id)) {
        // If product exists but is no longer selected, unpublish it
        const existingProduct = await productRepo.findOne({
          where: {
            externalId: productData.id,
            merchantId: merchantConnection.merchantId
          }
        });
        
        if (existingProduct) {
          existingProduct.status = 'INACTIVE';
          await productRepo.save(existingProduct);
          this.logger.log(`Product ${productData.id} unpublished (no longer selected)`);
        }
        
        // Commit the transaction
        await queryRunner.commitTransaction();
        return;
      }
      
      // Find existing product
      const existingProduct = await productRepo.findOne({
        where: {
          externalId: productData.id,
          merchantId: merchantConnection.merchantId
        },
        relations: ['variants']
      });
      
      // Transform Shopify product to Avnu product
      const avnuProduct = this.transformShopifyProduct(productData, merchantConnection);
      
      if (existingProduct) {
        // Update existing product
        avnuProduct.id = existingProduct.id;
        
        // Handle variant updates within transaction
        await this.handleVariantUpdatesInTransaction(
          queryRunner,
          existingProduct,
          avnuProduct
        );
      }
      
      // Save to database
      await productRepo.save(avnuProduct);
      
      // Commit the transaction
      await queryRunner.commitTransaction();
      
      this.logger.log(`Product updated: ${productData.id} (${productData.title})`);
    } catch (error) {
      // Rollback on error
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to update product ${productData.id}: ${error.message}`, error.stack);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
  
  /**
   * Handle variant updates within a transaction
   */
  private async handleVariantUpdatesInTransaction(
    queryRunner: any,
    existingProduct: Product,
    updatedProduct: Product
  ): Promise<void> {
    const variantRepo = queryRunner.manager.getRepository(ProductVariant);
    
    // Get existing variant IDs
    const existingVariantIds = existingProduct.variants.map(v => v.externalId);
    
    // Get updated variant IDs
    const updatedVariantIds = updatedProduct.variants.map(v => v.externalId);
    
    // Find variants to delete (in existing but not in updated)
    const variantsToDelete = existingProduct.variants.filter(
      v => !updatedVariantIds.includes(v.externalId)
    );
    
    // Delete variants that are no longer present
    if (variantsToDelete.length > 0) {
      await variantRepo.remove(variantsToDelete);
    }
    
    // Set existing variant IDs on updated variants to maintain relationships
    for (const variant of updatedProduct.variants) {
      const existingVariant = existingProduct.variants.find(
        v => v.externalId === variant.externalId
      );
      
      if (existingVariant) {
        variant.id = existingVariant.id;
      }
    }
  }
}
```

### 4. Performance Monitoring

Create a metrics service for monitoring:

```typescript
// src/modules/integrations/shopify-app/services/shopify-metrics.service.ts

import { Injectable } from '@nestjs/common';
import { Registry, Counter, Histogram } from 'prom-client';

@Injectable()
export class ShopifyMetricsService {
  private registry: Registry;
  private webhookCounter: Counter;
  private syncDuration: Histogram;
  private syncErrorCounter: Counter;
  private rateLimitCounter: Counter;

  constructor() {
    this.registry = new Registry();
    
    this.webhookCounter = new Counter({
      name: 'shopify_webhooks_total',
      help: 'Total number of Shopify webhooks received',
      labelNames: ['shop', 'type', 'status'],
      registers: [this.registry]
    });
    
    this.syncDuration = new Histogram({
      name: 'shopify_sync_duration_seconds',
      help: 'Duration of Shopify sync operations',
      labelNames: ['shop', 'operation_type'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120],
      registers: [this.registry]
    });
    
    this.syncErrorCounter = new Counter({
      name: 'shopify_sync_errors_total',
      help: 'Total number of Shopify sync errors',
      labelNames: ['shop', 'operation_type', 'error_type'],
      registers: [this.registry]
    });
    
    this.rateLimitCounter = new Counter({
      name: 'shopify_rate_limit_hits_total',
      help: 'Total number of Shopify API rate limit hits',
      labelNames: ['shop'],
      registers: [this.registry]
    });
  }

  /**
   * Increment webhook counter
   */
  incrementWebhook(shop: string, type: string, status: 'success' | 'error'): void {
    this.webhookCounter.labels(shop, type, status).inc();
  }
  
  /**
   * Record sync operation duration
   */
  observeSyncDuration(shop: string, operationType: string, durationMs: number): void {
    this.syncDuration.labels(shop, operationType).observe(durationMs / 1000);
  }
  
  /**
   * Increment sync error counter
   */
  incrementSyncError(shop: string, operationType: string, errorType: string): void {
    this.syncErrorCounter.labels(shop, operationType, errorType).inc();
  }
  
  /**
   * Increment rate limit counter
   */
  incrementRateLimit(shop: string): void {
    this.rateLimitCounter.labels(shop).inc();
  }
  
  /**
   * Get metrics in Prometheus format
   */
  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
```

Create a metrics endpoint:

```typescript
// src/modules/integrations/shopify-app/controllers/shopify-metrics.controller.ts

import { Controller, Get, Header } from '@nestjs/common';
import { ShopifyMetricsService } from '../services/shopify-metrics.service';

@Controller('metrics/shopify')
export class ShopifyMetricsController {
  constructor(private readonly metricsService: ShopifyMetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
```

Update webhook handlers to record metrics:

```typescript
// Update webhook handling to record metrics

@Post('products')
async handleProductWebhook(
  @Headers('x-shopify-shop-domain') shop: string,
  @Headers('x-shopify-topic') topic: string,
  @Body() data: any,
) {
  this.logger.log(`Received ${topic} webhook from ${shop}`);
  
  const startTime = Date.now();
  const eventType = topic.split('/')[1];
  
  try {
    // Process webhook
    // ...
    
    // Record success metric
    const duration = Date.now() - startTime;
    this.metricsService.incrementWebhook(shop, eventType, 'success');
    this.metricsService.observeSyncDuration(shop, `webhook_${eventType.toLowerCase()}`, duration);
    
    return { success: true };
  } catch (error) {
    // Record error metric
    this.metricsService.incrementWebhook(shop, eventType, 'error');
    this.metricsService.incrementSyncError(
      shop, 
      `webhook_${eventType.toLowerCase()}`, 
      error.name || 'unknown'
    );
    
    // Queue for retry
    // ...
    
    return { success: false, queued: true };
  }
}
```

### 5. Enhanced Webhook Authentication

Improve the webhook middleware for better security:

```typescript
// src/modules/integrations/shopify-app/middleware/shopify-webhook.middleware.ts

import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { ConfigService } from '@nestjs/config';
import * as getRawBody from 'raw-body';

@Injectable()
export class ShopifyWebhookMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const shopifyHmac = req.headers['x-shopify-hmac-sha256'] as string;
    const shopifyDomain = req.headers['x-shopify-shop-domain'] as string;
    const shopifyTopic = req.headers['x-shopify-topic'] as string;
    
    if (!shopifyHmac) {
      throw new UnauthorizedException('Missing HMAC signature');
    }
    
    if (!shopifyDomain) {
      throw new UnauthorizedException('Missing shop domain header');
    }
    
    if (!shopifyTopic) {
      throw new UnauthorizedException('Missing topic header');
    }
    
    // Get raw body as buffer for HMAC calculation
    // Need to use raw-body package to get the unparsed request body
    const rawBody = await getRawBody(req);
    
    // Calculate HMAC
    const shopifyApiSecret = this.configService.get<string>('shopify.apiSecret');
    const calculatedHmac = createHmac('sha256', shopifyApiSecret)
      .update(rawBody)
      .digest('base64');
    
    // Use timing-safe compare to prevent timing attacks
    const hmacBuffer = Buffer.from(shopifyHmac, 'utf8');
    const calculatedHmacBuffer = Buffer.from(calculatedHmac, 'utf8');
    
    if (
      hmacBuffer.length !== calculatedHmacBuffer.length ||
      !timingSafeEqual(hmacBuffer, calculatedHmacBuffer)
    ) {
      throw new UnauthorizedException('Invalid HMAC signature');
    }
    
    // Set body for controllers to use
    req.body = JSON.parse(rawBody.toString('utf8'));
    
    next();
  }
}
```

Update module configuration to include the new middleware setup:

```typescript
// Update src/modules/modules/integrations/shopify-app/shopify.module.ts

import { Module, MiddlewareConsumer, RequestMethod, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { ShopifyWebhookMiddleware } from './middleware/shopify-webhook.middleware';
import { ShopifyMetricsService } from './services/shopify-metrics.service';
import { ShopifyRateLimitService } from './services/shopify-rate-limit.service';
import { ShopifyMetricsController } from './controllers/shopify-metrics.controller';

@Module({
  imports: [
    // Existing imports...
  ],
  providers: [
    // Existing providers...
    ShopifyMetricsService,
    ShopifyRateLimitService,
  ],
  controllers: [
    // Existing controllers...
    ShopifyMetricsController,
  ],
  exports: [
    // Existing exports...
    ShopifyMetricsService,
    ShopifyRateLimitService,
  ],
})
export class ShopifyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // This ensures the raw body is available for HMAC verification
    consumer
      .apply(ShopifyWebhookMiddleware)
      .forRoutes(
        { path: 'webhooks/shopify/*', method: RequestMethod.POST }
      );
  }
}
```

## Dependencies & Prerequisites

- Redis for rate limiting and circuit breaker
- Prometheus client for metrics
- TypeORM for transaction support
- Raw-body package for webhook payload verification

## Integration with Phase 3A-3C

1. **Update Phase 3A (Webhook Handlers):**
   - Use the enhanced webhook authentication middleware
   - Apply resilience patterns to webhook processing
   - Record metrics for all webhook operations

2. **Update Phase 3B (Bulk Operations):**
   - Implement rate limiting for bulk operations
   - Use transactions for consistent data updates
   - Add performance monitoring for bulk sync operations

3. **Update Phase 3C (Background Jobs):**
   - Apply circuit breakers for external API calls
   - Add metrics tracking for scheduled jobs
   - Implement graceful degradation for non-critical services

## Testing Guidelines

1. **Rate Limiting:**
   - Test with concurrent requests to verify token bucket behavior
   - Verify backoff strategy works correctly
   - Test recovery after rate limit window expires

2. **Resilience Patterns:**
   - Simulate network failures to test retry behavior
   - Test circuit breaker tripping and recovery
   - Verify transaction rollback on errors

3. **Performance Monitoring:**
   - Verify metrics are correctly recorded
   - Test Prometheus endpoint format
   - Simulate high load to observe histogram distributions
