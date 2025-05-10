# Phase 4D-3: Fulfillment Service - Core Implementation

## Objectives

- Implement core fulfillment processing functionality
- Create methods for handling webhook data
- Support bidirectional fulfillment synchronization

## Timeline: Week 17

## Tasks & Implementation Details

### 1. Fulfillment Service Interface

Define the interface for the fulfillment service:

```typescript
// src/modules/integrations/shopify-app/interfaces/shopify-fulfillment-service.interface.ts

import { Fulfillment } from '../../../entities/fulfillment.entity';
import { CreateFulfillmentDto, UpdateFulfillmentDto, AddTrackingDto } from '../dtos/fulfillment.dto';

export interface IShopifyFulfillmentService {
  // Webhook handling
  processNewFulfillment(shop: string, fulfillmentData: any): Promise<Fulfillment>;
  processFulfillmentUpdate(shop: string, fulfillmentData: any): Promise<Fulfillment>;
  processFulfillmentCancellation(shop: string, fulfillmentData: any): Promise<Fulfillment>;
  processTrackingUpdate(shop: string, trackingData: any): Promise<Fulfillment>;
  
  // API operations
  createFulfillment(merchantId: string, createDto: CreateFulfillmentDto): Promise<Fulfillment>;
  updateFulfillment(fulfillmentId: string, updateDto: UpdateFulfillmentDto): Promise<Fulfillment>;
  cancelFulfillment(fulfillmentId: string, reason?: string): Promise<Fulfillment>;
  addTracking(fulfillmentId: string, trackingDto: AddTrackingDto): Promise<Fulfillment>;
  
  // Query operations
  getFulfillmentsForOrder(orderId: string): Promise<Fulfillment[]>;
  getFulfillmentById(fulfillmentId: string): Promise<Fulfillment>;
}
```

### 2. Core Fulfillment Service Implementation

Implement the core functionality of the fulfillment service:

```typescript
// src/modules/integrations/shopify-app/services/shopify-fulfillment.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Fulfillment } from '../../../entities/fulfillment.entity';
import { FulfillmentLineItem } from '../../../entities/fulfillment-line-item.entity';
import { FulfillmentTracking } from '../../../entities/fulfillment-tracking.entity';
import { Order } from '../../../entities/order.entity';
import { OrderLineItem } from '../../../entities/order-line-item.entity';
import { MerchantPlatformConnection } from '../../../entities/merchant-platform-connection.entity';
import { ShopifyApiService } from './shopify-api.service';
import { ShopifyTransformService } from './shopify-transform.service';
import { IShopifyFulfillmentService } from '../interfaces/shopify-fulfillment-service.interface';
import { CreateFulfillmentDto, UpdateFulfillmentDto, AddTrackingDto } from '../dtos/fulfillment.dto';

@Injectable()
export class ShopifyFulfillmentService implements IShopifyFulfillmentService {
  private readonly logger = new Logger(ShopifyFulfillmentService.name);

  constructor(
    @InjectRepository(Fulfillment)
    private readonly fulfillmentRepository: Repository<Fulfillment>,
    @InjectRepository(FulfillmentLineItem)
    private readonly lineItemRepository: Repository<FulfillmentLineItem>,
    @InjectRepository(FulfillmentTracking)
    private readonly trackingRepository: Repository<FulfillmentTracking>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderLineItem)
    private readonly orderLineItemRepository: Repository<OrderLineItem>,
    @InjectRepository(MerchantPlatformConnection)
    private readonly connectionRepository: Repository<MerchantPlatformConnection>,
    private readonly shopifyApiService: ShopifyApiService,
    private readonly shopifyTransformService: ShopifyTransformService,
    private readonly connection: Connection,
  ) {}

  /**
   * Process a new fulfillment from Shopify webhook
   */
  async processNewFulfillment(shop: string, fulfillmentData: any): Promise<Fulfillment> {
    // Find merchant connection
    const connection = await this.connectionRepository.findOne({
      where: { shopDomain: shop, platform: 'shopify' },
      relations: ['merchant'],
    });
    
    if (!connection) {
      throw new Error(`No connection found for shop ${shop}`);
    }
    
    const merchantId = connection.merchant.id;
    
    // Find associated order
    const order = await this.orderRepository.findOne({
      where: { 
        merchantId,
        externalId: fulfillmentData.order_id.toString() 
      }
    });
    
    if (!order) {
      throw new Error(`Order ${fulfillmentData.order_id} not found for fulfillment ${fulfillmentData.id}`);
    }
    
    // Check if fulfillment already exists (idempotency)
    const existingFulfillment = await this.fulfillmentRepository.findOne({
      where: { 
        orderId: order.id,
        externalId: fulfillmentData.id.toString() 
      }
    });
    
    if (existingFulfillment) {
      this.logger.log(`Fulfillment ${fulfillmentData.id} already exists, updating instead`);
      return this.processFulfillmentUpdate(shop, fulfillmentData);
    }
    
    // Start a transaction for atomicity
    return this.connection.transaction(async (transactionManager) => {
      // Transform fulfillment data to our format
      const fulfillmentTransformed = this.shopifyTransformService.transformShopifyFulfillment(
        fulfillmentData, 
        order.id
      );
      
      // Create fulfillment
      const fulfillment = transactionManager.create(Fulfillment, fulfillmentTransformed);
      const savedFulfillment = await transactionManager.save(fulfillment);
      
      // Process line items
      if (fulfillmentData.line_items && fulfillmentData.line_items.length > 0) {
        await this.processLineItems(
          transactionManager,
          savedFulfillment.id,
          order.id,
          fulfillmentData.line_items
        );
      }
      
      // Process tracking info
      if (fulfillmentData.tracking_info) {
        await this.processTrackingInfo(
          transactionManager,
          savedFulfillment.id,
          fulfillmentData.tracking_info
        );
      }
      
      // Update order fulfillment status
      await this.updateOrderFulfillmentStatus(transactionManager, order.id);
      
      // Reload fulfillment with relationships
      return this.fulfillmentRepository.findOne({
        where: { id: savedFulfillment.id },
        relations: ['lineItems', 'trackingInfo'],
      });
    });
  }

  /**
   * Process a fulfillment update from Shopify
   */
  async processFulfillmentUpdate(shop: string, fulfillmentData: any): Promise<Fulfillment> {
    // Find merchant connection
    const connection = await this.connectionRepository.findOne({
      where: { shopDomain: shop, platform: 'shopify' },
      relations: ['merchant'],
    });
    
    if (!connection) {
      throw new Error(`No connection found for shop ${shop}`);
    }
    
    const merchantId = connection.merchant.id;
    
    // Find associated order
    const order = await this.orderRepository.findOne({
      where: { 
        merchantId,
        externalId: fulfillmentData.order_id.toString() 
      }
    });
    
    if (!order) {
      throw new Error(`Order ${fulfillmentData.order_id} not found for fulfillment ${fulfillmentData.id}`);
    }
    
    // Find existing fulfillment
    const existingFulfillment = await this.fulfillmentRepository.findOne({
      where: { 
        orderId: order.id,
        externalId: fulfillmentData.id.toString() 
      },
      relations: ['lineItems', 'trackingInfo'],
    });
    
    if (!existingFulfillment) {
      this.logger.log(`Fulfillment ${fulfillmentData.id} not found, creating new fulfillment`);
      return this.processNewFulfillment(shop, fulfillmentData);
    }
    
    // Start a transaction for atomicity
    return this.connection.transaction(async (transactionManager) => {
      // Update fulfillment fields
      const fulfillmentUpdated = this.shopifyTransformService.transformShopifyFulfillmentUpdate(
        fulfillmentData,
        existingFulfillment
      );
      
      const savedFulfillment = await transactionManager.save(Fulfillment, fulfillmentUpdated);
      
      // Update tracking info if changed
      if (fulfillmentData.tracking_info) {
        if (existingFulfillment.trackingInfo && existingFulfillment.trackingInfo.length > 0) {
          // Update existing tracking info
          for (const trackingInfo of existingFulfillment.trackingInfo) {
            const updatedTracking = this.shopifyTransformService.transformShopifyTrackingUpdate(
              fulfillmentData.tracking_info,
              trackingInfo
            );
            await transactionManager.save(FulfillmentTracking, updatedTracking);
          }
        } else {
          // Create new tracking info
          await this.processTrackingInfo(
            transactionManager,
            savedFulfillment.id,
            fulfillmentData.tracking_info
          );
        }
      }
      
      // Update order fulfillment status
      await this.updateOrderFulfillmentStatus(transactionManager, order.id);
      
      // Reload fulfillment with relationships
      return this.fulfillmentRepository.findOne({
        where: { id: savedFulfillment.id },
        relations: ['lineItems', 'trackingInfo'],
      });
    });
  }

  /**
   * Process a fulfillment cancellation from Shopify
   */
  async processFulfillmentCancellation(shop: string, fulfillmentData: any): Promise<Fulfillment> {
    // Find merchant connection and order similar to the above methods
    const connection = await this.connectionRepository.findOne({
      where: { shopDomain: shop, platform: 'shopify' },
      relations: ['merchant'],
    });
    
    if (!connection) {
      throw new Error(`No connection found for shop ${shop}`);
    }
    
    const merchantId = connection.merchant.id;
    
    // Find associated order
    const order = await this.orderRepository.findOne({
      where: { 
        merchantId,
        externalId: fulfillmentData.order_id.toString() 
      }
    });
    
    if (!order) {
      throw new Error(`Order ${fulfillmentData.order_id} not found for fulfillment ${fulfillmentData.id}`);
    }
    
    // Find existing fulfillment
    const existingFulfillment = await this.fulfillmentRepository.findOne({
      where: { 
        orderId: order.id,
        externalId: fulfillmentData.id.toString() 
      }
    });
    
    if (!existingFulfillment) {
      throw new Error(`Fulfillment ${fulfillmentData.id} not found for cancellation`);
    }
    
    // Start a transaction for atomicity
    return this.connection.transaction(async (transactionManager) => {
      // Update fulfillment status to cancelled
      existingFulfillment.status = 'cancelled';
      
      const savedFulfillment = await transactionManager.save(existingFulfillment);
      
      // Update order fulfillment status
      await this.updateOrderFulfillmentStatus(transactionManager, order.id);
      
      return savedFulfillment;
    });
  }

  /**
   * Process a tracking update from Shopify
   */
  async processTrackingUpdate(shop: string, trackingData: any): Promise<Fulfillment> {
    // Implementation for tracking updates
    // This would be similar to the fulfillment update method above
    // but focused on updating the tracking information
    
    return null; // Placeholder - implement full logic in next document
  }

  // Additional service method stubs to be implemented in the next document:
  
  /**
   * Create a new fulfillment in Shopify via API
   */
  async createFulfillment(merchantId: string, createDto: CreateFulfillmentDto): Promise<Fulfillment> {
    // Implementation will be in next document
    return null;
  }

  /**
   * Update an existing fulfillment
   */
  async updateFulfillment(fulfillmentId: string, updateDto: UpdateFulfillmentDto): Promise<Fulfillment> {
    // Implementation will be in next document
    return null;
  }

  /**
   * Cancel a fulfillment
   */
  async cancelFulfillment(fulfillmentId: string, reason?: string): Promise<Fulfillment> {
    // Implementation will be in next document
    return null;
  }

  /**
   * Add tracking information to a fulfillment
   */
  async addTracking(fulfillmentId: string, trackingDto: AddTrackingDto): Promise<Fulfillment> {
    // Implementation will be in next document
    return null;
  }

  /**
   * Get all fulfillments for an order
   */
  async getFulfillmentsForOrder(orderId: string): Promise<Fulfillment[]> {
    return this.fulfillmentRepository.find({
      where: { orderId },
      relations: ['lineItems', 'trackingInfo'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Get a fulfillment by ID
   */
  async getFulfillmentById(fulfillmentId: string): Promise<Fulfillment> {
    const fulfillment = await this.fulfillmentRepository.findOne({
      where: { id: fulfillmentId },
      relations: ['lineItems', 'trackingInfo', 'order'],
    });
    
    if (!fulfillment) {
      throw new NotFoundException(`Fulfillment with ID ${fulfillmentId} not found`);
    }
    
    return fulfillment;
  }

  // Helper methods to be implemented later
  private async processLineItems(transactionManager: any, fulfillmentId: string, orderId: string, lineItems: any[]): Promise<any> {
    // Implementation will be in next document
    return null;
  }

  private async processTrackingInfo(transactionManager: any, fulfillmentId: string, trackingInfo: any): Promise<any> {
    // Implementation will be in next document
    return null;
  }

  private async updateOrderFulfillmentStatus(transactionManager: any, orderId: string): Promise<void> {
    // Implementation will be in next document
  }
}
```

### 3. Update Module Configuration

Update the Shopify module to include the fulfillment service:

```typescript
// Update src/modules/integrations/shopify-app/shopify.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopifyFulfillmentService } from './services/shopify-fulfillment.service';
import { Fulfillment } from '../../entities/fulfillment.entity';
import { FulfillmentLineItem } from '../../entities/fulfillment-line-item.entity';
import { FulfillmentTracking } from '../../entities/fulfillment-tracking.entity';

@Module({
  imports: [
    // Existing imports
    TypeOrmModule.forFeature([
      // Existing entities
      Fulfillment,
      FulfillmentLineItem,
      FulfillmentTracking,
    ]),
    // Other imports
  ],
  providers: [
    // Existing providers
    ShopifyFulfillmentService,
  ],
  exports: [
    // Existing exports
    ShopifyFulfillmentService,
  ],
})
export class ShopifyModule {
  // Rest of the module configuration
}
```

## Dependencies & Prerequisites

- Completed Phase 4D-1 and 4D-2
- TypeORM for database interactions
- Transaction support for data consistency

## Testing Guidelines

1. **Service Methods:**
   - Test each public method with various input scenarios
   - Verify error handling and exception cases
   - Test transaction rollback on failures

2. **Data Consistency:**
   - Verify order status updates after fulfillment changes
   - Test synchronization between fulfillment and line item statuses
   - Ensure all related entities are updated atomically

## Next Phase

Continue to [Phase 4D-4: Fulfillment Service Helpers](./shopify-app-phase4d4-fulfillment-helpers.md) to implement the helper methods for fulfillment processing.
