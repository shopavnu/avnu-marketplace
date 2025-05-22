# Phase 5A-2: Analytics & Reporting - Collection Service

## Objectives

- Implement a service for collecting analytics events
- Create tracking mechanisms for user activity and system events
- Ensure efficient data collection with minimal performance impact

## Timeline: Week 19

## Tasks & Implementation Details

### 1. Analytics Service Interface

Define the interface for the analytics service:

```typescript
// src/modules/analytics/interfaces/analytics-service.interface.ts

export interface IAnalyticsService {
  // Event tracking
  trackEvent(params: {
    merchantId: string;
    eventType: string;
    eventData: Record<string, any>;
    sourceId?: string;
    sourceType?: string;
    userId?: string;
    sessionId?: string;
    referenceDate?: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void>;
  
  // User activity tracking
  trackActivity(params: {
    merchantId: string;
    userId?: string;
    sessionId: string;
    activityType: string;
    activityData: Record<string, any>;
    page?: string;
    action?: string;
    objectId?: string;
    objectType?: string;
    contextData?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    duration?: number;
  }): Promise<void>;
  
  // Batch tracking
  trackEventsBatch(events: Array<{
    merchantId: string;
    eventType: string;
    eventData: Record<string, any>;
    sourceId?: string;
    sourceType?: string;
    userId?: string;
    sessionId?: string;
    referenceDate?: Date;
    ipAddress?: string;
    userAgent?: string;
  }>): Promise<void>;
  
  // Get recent events
  getRecentEvents(merchantId: string, options?: {
    eventType?: string;
    sourceType?: string;
    limit?: number;
  }): Promise<any[]>;
}
```

### 2. Analytics Service Implementation

Implement the analytics collection service:

```typescript
// src/modules/analytics/services/analytics.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { AnalyticsEvent } from '../../entities/analytics-event.entity';
import { UserActivity } from '../../entities/user-activity.entity';
import { IAnalyticsService } from '../interfaces/analytics-service.interface';

@Injectable()
export class AnalyticsService implements IAnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsEventRepository: Repository<AnalyticsEvent>,
    @InjectRepository(UserActivity)
    private readonly userActivityRepository: Repository<UserActivity>,
    @InjectQueue('analytics')
    private readonly analyticsQueue: Queue,
  ) {}

  /**
   * Track a single analytics event
   */
  async trackEvent(params: {
    merchantId: string;
    eventType: string;
    eventData: Record<string, any>;
    sourceId?: string;
    sourceType?: string;
    userId?: string;
    sessionId?: string;
    referenceDate?: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      // Queue the event for processing instead of direct DB write
      // This improves performance and reduces impact on main application flow
      await this.analyticsQueue.add('process-event', params, {
        removeOnComplete: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      });
    } catch (error) {
      this.logger.error(`Error queueing analytics event: ${error.message}`, error.stack);
      // Fall back to direct write in case of queue failure
      await this.saveEvent(params);
    }
  }

  /**
   * Track user activity
   */
  async trackActivity(params: {
    merchantId: string;
    userId?: string;
    sessionId: string;
    activityType: string;
    activityData: Record<string, any>;
    page?: string;
    action?: string;
    objectId?: string;
    objectType?: string;
    contextData?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    duration?: number;
  }): Promise<void> {
    try {
      // Queue the activity for processing
      await this.analyticsQueue.add('process-activity', params, {
        removeOnComplete: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      });
    } catch (error) {
      this.logger.error(`Error queueing user activity: ${error.message}`, error.stack);
      // Fall back to direct write
      await this.saveActivity(params);
    }
  }

  /**
   * Track multiple events in a batch
   */
  async trackEventsBatch(events: Array<{
    merchantId: string;
    eventType: string;
    eventData: Record<string, any>;
    sourceId?: string;
    sourceType?: string;
    userId?: string;
    sessionId?: string;
    referenceDate?: Date;
    ipAddress?: string;
    userAgent?: string;
  }>): Promise<void> {
    try {
      // Queue the batch for processing
      await this.analyticsQueue.add('process-event-batch', { events }, {
        removeOnComplete: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      });
    } catch (error) {
      this.logger.error(`Error queueing analytics batch: ${error.message}`, error.stack);
      // Fall back to direct write
      for (const event of events) {
        await this.saveEvent(event).catch(err => {
          this.logger.error(`Error saving batch event: ${err.message}`, err.stack);
        });
      }
    }
  }

  /**
   * Get recent events for a merchant
   */
  async getRecentEvents(merchantId: string, options: {
    eventType?: string;
    sourceType?: string;
    limit?: number;
  } = {}): Promise<AnalyticsEvent[]> {
    const { eventType, sourceType, limit = 100 } = options;
    
    const queryBuilder = this.analyticsEventRepository.createQueryBuilder('event')
      .where('event.merchantId = :merchantId', { merchantId })
      .orderBy('event.createdAt', 'DESC')
      .take(limit);
    
    if (eventType) {
      queryBuilder.andWhere('event.eventType = :eventType', { eventType });
    }
    
    if (sourceType) {
      queryBuilder.andWhere('event.sourceType = :sourceType', { sourceType });
    }
    
    return queryBuilder.getMany();
  }

  /**
   * Direct save of event (used as fallback when queue fails)
   */
  private async saveEvent(params: {
    merchantId: string;
    eventType: string;
    eventData: Record<string, any>;
    sourceId?: string;
    sourceType?: string;
    userId?: string;
    sessionId?: string;
    referenceDate?: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AnalyticsEvent> {
    const event = this.analyticsEventRepository.create({
      merchantId: params.merchantId,
      eventType: params.eventType,
      eventData: params.eventData,
      sourceId: params.sourceId,
      sourceType: params.sourceType,
      userId: params.userId,
      sessionId: params.sessionId,
      referenceDate: params.referenceDate,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
    
    return this.analyticsEventRepository.save(event);
  }

  /**
   * Direct save of activity (used as fallback when queue fails)
   */
  private async saveActivity(params: {
    merchantId: string;
    userId?: string;
    sessionId: string;
    activityType: string;
    activityData: Record<string, any>;
    page?: string;
    action?: string;
    objectId?: string;
    objectType?: string;
    contextData?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    duration?: number;
  }): Promise<UserActivity> {
    const activity = this.userActivityRepository.create({
      merchantId: params.merchantId,
      userId: params.userId,
      sessionId: params.sessionId,
      activityType: params.activityType,
      activityData: params.activityData,
      page: params.page,
      action: params.action,
      objectId: params.objectId,
      objectType: params.objectType,
      contextData: params.contextData,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      duration: params.duration,
    });
    
    return this.userActivityRepository.save(activity);
  }
}
```

### 3. Analytics Queue Processor

Create a processor for the analytics queue:

```typescript
// src/modules/analytics/processors/analytics.processor.ts

import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bull';
import { AnalyticsEvent } from '../../entities/analytics-event.entity';
import { UserActivity } from '../../entities/user-activity.entity';

@Processor('analytics')
export class AnalyticsProcessor {
  private readonly logger = new Logger(AnalyticsProcessor.name);

  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsEventRepository: Repository<AnalyticsEvent>,
    @InjectRepository(UserActivity)
    private readonly userActivityRepository: Repository<UserActivity>,
  ) {}

  @Process('process-event')
  async processEvent(job: Job): Promise<void> {
    try {
      const params = job.data;
      
      const event = this.analyticsEventRepository.create({
        merchantId: params.merchantId,
        eventType: params.eventType,
        eventData: params.eventData,
        sourceId: params.sourceId,
        sourceType: params.sourceType,
        userId: params.userId,
        sessionId: params.sessionId,
        referenceDate: params.referenceDate,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });
      
      await this.analyticsEventRepository.save(event);
    } catch (error) {
      this.logger.error(`Error processing analytics event: ${error.message}`, error.stack);
      throw error; // Rethrow to trigger Bull retry mechanism
    }
  }

  @Process('process-activity')
  async processActivity(job: Job): Promise<void> {
    try {
      const params = job.data;
      
      const activity = this.userActivityRepository.create({
        merchantId: params.merchantId,
        userId: params.userId,
        sessionId: params.sessionId,
        activityType: params.activityType,
        activityData: params.activityData,
        page: params.page,
        action: params.action,
        objectId: params.objectId,
        objectType: params.objectType,
        contextData: params.contextData,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        duration: params.duration,
      });
      
      await this.userActivityRepository.save(activity);
    } catch (error) {
      this.logger.error(`Error processing user activity: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('process-event-batch')
  async processEventBatch(job: Job): Promise<void> {
    try {
      const { events } = job.data;
      
      if (!events || events.length === 0) {
        return;
      }
      
      // Create entity objects
      const eventEntities = events.map(params => this.analyticsEventRepository.create({
        merchantId: params.merchantId,
        eventType: params.eventType,
        eventData: params.eventData,
        sourceId: params.sourceId,
        sourceType: params.sourceType,
        userId: params.userId,
        sessionId: params.sessionId,
        referenceDate: params.referenceDate,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      }));
      
      // Use bulk insert for efficiency
      await this.analyticsEventRepository.save(eventEntities);
    } catch (error) {
      this.logger.error(`Error processing analytics batch: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### 4. Event Tracking Decorators

Create decorators for easy tracking in services and controllers:

```typescript
// src/modules/analytics/decorators/track-event.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AnalyticsService } from '../services/analytics.service';

// Decorator for controller methods to track events
export function TrackEvent(options: {
  eventType: string;
  sourceType?: string;
  getData?: (req: any, res: any, body: any) => Record<string, any>;
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      try {
        // Store reference to original result
        const result = await originalMethod.apply(this, args);
        
        // Get the request and response objects
        const req = args[0]?.request || args[0];
        const res = args[0]?.response || args[1];
        const body = req?.body;
        const params = req?.params;
        const query = req?.query;
        
        // Get moduleRef from controller instance
        const moduleRef = (this as any).moduleRef as ModuleRef;
        
        if (moduleRef) {
          // Get the analytics service
          const analyticsService = moduleRef.get(AnalyticsService, { strict: false });
          
          if (analyticsService) {
            // Extract merchant ID from request
            const merchantId = req?.user?.merchantId || 
                              body?.merchantId || 
                              params?.merchantId ||
                              query?.merchantId;
            
            // Only track if we have a merchant ID
            if (merchantId) {
              // Extract data based on provided function or use default
              const eventData = options.getData ? 
                options.getData(req, res, body) : 
                { ...body, ...params, ...query, result };
              
              // Extract source ID if available
              const sourceId = params?.id || body?.id || null;
              
              // Track the event
              analyticsService.trackEvent({
                merchantId,
                eventType: options.eventType,
                eventData,
                sourceId,
                sourceType: options.sourceType,
                userId: req?.user?.id,
                sessionId: req?.sessionID,
                ipAddress: req?.ip,
                userAgent: req?.headers?.['user-agent'],
              }).catch(err => {
                console.error('Failed to track event:', err);
              });
            }
          }
        }
        
        return result;
      } catch (error) {
        // Don't let analytics tracking failure impact the main flow
        console.error('Error in TrackEvent decorator:', error);
        return originalMethod.apply(this, args);
      }
    };
    
    return descriptor;
  };
}

// Param decorator to extract tracking data from request
export const TrackingData = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      merchantId: request?.user?.merchantId,
      userId: request?.user?.id,
      sessionId: request?.sessionID,
      ipAddress: request?.ip,
      userAgent: request?.headers?.['user-agent'],
    };
  },
);
```

### 5. Update Analytics Module

Update the analytics module with the new components:

```typescript
// src/modules/analytics/analytics.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AnalyticsEvent } from '../entities/analytics-event.entity';
import { AnalyticsAggregate } from '../entities/analytics-aggregate.entity';
import { UserActivity } from '../entities/user-activity.entity';
import { ReportDefinition } from '../entities/report-definition.entity';
import { ReportResult } from '../entities/report-result.entity';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsProcessor } from './processors/analytics.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsEvent,
      AnalyticsAggregate,
      UserActivity,
      ReportDefinition,
      ReportResult,
    ]),
    BullModule.registerQueue({
      name: 'analytics',
    }),
  ],
  providers: [
    AnalyticsService,
    AnalyticsProcessor,
  ],
  exports: [
    AnalyticsService,
  ],
})
export class AnalyticsModule {}
```

### 6. Example Usage

Example of how to use the analytics service in other modules:

```typescript
// Example usage in a service

import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../../analytics/services/analytics.service';

@Injectable()
export class ShopifySyncService {
  constructor(
    private readonly analyticsService: AnalyticsService,
  ) {}
  
  async handleProductUpdated(shop: string, productData: any): Promise<void> {
    // Business logic to handle product update
    
    // Track the event
    await this.analyticsService.trackEvent({
      merchantId: 'merchant-id-here',
      eventType: 'product_updated',
      eventData: {
        productId: productData.id,
        title: productData.title,
        updatedFields: ['price', 'inventory'],
        // Other relevant data
      },
      sourceId: productData.id.toString(),
      sourceType: 'product',
    });
  }
}
```

Example of using the decorator in a controller:

```typescript
// Example usage in a controller

import { Controller, Post, Body, Req } from '@nestjs/common';
import { TrackEvent } from '../../analytics/decorators/track-event.decorator';
import { OrderService } from '../services/order.service';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
  ) {}
  
  @Post()
  @TrackEvent({
    eventType: 'order_created',
    sourceType: 'order',
    getData: (req, res, body) => ({
      orderId: body.id,
      total: body.total,
      items: body.items.length,
      currency: body.currency,
    }),
  })
  async createOrder(@Body() orderData: any, @Req() req: any) {
    return this.orderService.createOrder(orderData);
  }
}
```

## Dependencies & Prerequisites

- Completed Phase 5A-1 (Analytics Models)
- Bull queue for asynchronous processing
- TypeORM for database interactions
- NestJS module system

## Testing Guidelines

1. **Service Methods:**
   - Test event tracking with various data payloads
   - Verify queue system handles load appropriately
   - Test fallback mechanisms when queue is unavailable

2. **Performance:**
   - Benchmark impact on API request times
   - Measure queue processing throughput
   - Test with high volume of events

3. **Error Handling:**
   - Verify failed events are properly retried
   - Test queue recovery after system failures
   - Verify decorators don't impact main application flow on errors

## Next Phase

Continue to [Phase 5A-3: Analytics Aggregation Service](./shopify-app-phase5a3-analytics-aggregation.md) to implement the service for analyzing and aggregating analytics data.
