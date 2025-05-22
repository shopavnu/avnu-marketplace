# Phase 4C: Order Management - Order Service

## Objectives

- Implement the core order service for processing Shopify orders
- Create data transformation functions between Shopify and Avnu formats
- Implement idempotent order operations

## Timeline: Weeks 15-16

## Tasks & Implementation Details

### 1. Shopify Order Service

Create the service to process order data from Shopify:

```typescript
// src/modules/integrations/shopify-app/services/shopify-order.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection, In } from 'typeorm';
import { Order } from '../../../entities/order.entity';
import { OrderLineItem } from '../../../entities/order-line-item.entity';
import { Customer } from '../../../entities/customer.entity';
import { Merchant } from '../../../entities/merchant.entity';
import { MerchantPlatformConnection } from '../../../entities/merchant-platform-connection.entity';
import { ShopifyApiService } from './shopify-api.service';
import { ShopifyTransformService } from './shopify-transform.service';

@Injectable()
export class ShopifyOrderService {
  private readonly logger = new Logger(ShopifyOrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderLineItem)
    private readonly lineItemRepository: Repository<OrderLineItem>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(MerchantPlatformConnection)
    private readonly connectionRepository: Repository<MerchantPlatformConnection>,
    private readonly shopifyApiService: ShopifyApiService,
    private readonly shopifyTransformService: ShopifyTransformService,
    private readonly connection: Connection,
  ) {}

  /**
   * Process a new order from Shopify
   */
  async processNewOrder(shop: string, orderData: any): Promise<Order> {
    // Find merchant connection
    const connection = await this.connectionRepository.findOne({
      where: { shopDomain: shop, platform: 'shopify' },
      relations: ['merchant'],
    });
    
    if (!connection) {
      throw new Error(`No connection found for shop ${shop}`);
    }
    
    const merchantId = connection.merchant.id;
    
    // Check if order already exists (idempotency)
    const existingOrder = await this.orderRepository.findOne({
      where: { 
        merchantId,
        externalId: orderData.id.toString() 
      }
    });
    
    if (existingOrder) {
      this.logger.log(`Order ${orderData.id} already exists, updating instead`);
      return this.processOrderUpdate(shop, orderData);
    }
    
    // Start a transaction for atomicity
    return this.connection.transaction(async (transactionManager) => {
      // Process customer first if exists
      let customer = null;
      if (orderData.customer) {
        customer = await this.processCustomer(
          transactionManager,
          merchantId, 
          orderData.customer
        );
      }
      
      // Transform order data to our format
      const orderTransformed = this.shopifyTransformService.transformShopifyOrder(
        orderData, 
        merchantId,
        customer?.id
      );
      
      // Create order
      const order = transactionManager.create(Order, orderTransformed);
      const savedOrder = await transactionManager.save(order);
      
      // Process line items
      if (orderData.line_items && orderData.line_items.length > 0) {
        await this.processLineItems(
          transactionManager,
          savedOrder.id,
          orderData.line_items
        );
      }
      
      // Reload order with relationships
      return this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['lineItems', 'customer'],
      });
    });
  }

  /**
   * Process an order update from Shopify
   */
  async processOrderUpdate(shop: string, orderData: any): Promise<Order> {
    // Find merchant connection
    const connection = await this.connectionRepository.findOne({
      where: { shopDomain: shop, platform: 'shopify' },
      relations: ['merchant'],
    });
    
    if (!connection) {
      throw new Error(`No connection found for shop ${shop}`);
    }
    
    const merchantId = connection.merchant.id;
    
    // Find existing order
    const existingOrder = await this.orderRepository.findOne({
      where: { 
        merchantId,
        externalId: orderData.id.toString() 
      },
      relations: ['lineItems'],
    });
    
    if (!existingOrder) {
      this.logger.log(`Order ${orderData.id} not found, creating new order`);
      return this.processNewOrder(shop, orderData);
    }
    
    // Start a transaction for atomicity
    return this.connection.transaction(async (transactionManager) => {
      // Process customer if exists
      if (orderData.customer) {
        await this.processCustomer(
          transactionManager,
          merchantId, 
          orderData.customer
        );
      }
      
      // Update order fields
      const orderUpdated = this.shopifyTransformService.transformShopifyOrderUpdate(
        orderData,
        existingOrder
      );
      
      const savedOrder = await transactionManager.save(Order, orderUpdated);
      
      // Process line items - this is more complex for updates
      // We need to add new items, update existing, and remove deleted
      if (orderData.line_items && orderData.line_items.length > 0) {
        // Get existing line item IDs
        const existingLineItemIds = existingOrder.lineItems.map(item => 
          item.externalId
        );
        
        // Get incoming line item IDs
        const incomingLineItemIds = orderData.line_items.map(item => 
          item.id.toString()
        );
        
        // Find items to delete (in existing but not in incoming)
        const itemsToDelete = existingOrder.lineItems.filter(
          item => !incomingLineItemIds.includes(item.externalId)
        );
        
        if (itemsToDelete.length > 0) {
          await transactionManager.remove(itemsToDelete);
        }
        
        // Process all line items (create new ones, update existing)
        await this.processLineItems(
          transactionManager,
          savedOrder.id,
          orderData.line_items
        );
      }
      
      // Reload order with relationships
      return this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['lineItems', 'customer'],
      });
    });
  }

  /**
   * Process an order cancellation from Shopify
   */
  async processOrderCancellation(shop: string, orderData: any): Promise<Order> {
    // Similar to update, but set cancelled status, date, and reason
    const connection = await this.connectionRepository.findOne({
      where: { shopDomain: shop, platform: 'shopify' },
      relations: ['merchant'],
    });
    
    if (!connection) {
      throw new Error(`No connection found for shop ${shop}`);
    }
    
    const merchantId = connection.merchant.id;
    
    // Find existing order
    const existingOrder = await this.orderRepository.findOne({
      where: { 
        merchantId,
        externalId: orderData.id.toString() 
      }
    });
    
    if (!existingOrder) {
      this.logger.log(`Order ${orderData.id} not found, creating new cancelled order`);
      return this.processNewOrder(shop, orderData);
    }
    
    // Update cancel fields
    existingOrder.status = 'cancelled';
    existingOrder.cancelledAt = new Date(orderData.cancelled_at);
    existingOrder.cancelReason = orderData.cancel_reason;
    
    return this.orderRepository.save(existingOrder);
  }

  /**
   * Process an order payment from Shopify
   */
  async processOrderPayment(shop: string, orderData: any): Promise<Order> {
    // Update financial status to paid
    const connection = await this.connectionRepository.findOne({
      where: { shopDomain: shop, platform: 'shopify' },
      relations: ['merchant'],
    });
    
    if (!connection) {
      throw new Error(`No connection found for shop ${shop}`);
    }
    
    const merchantId = connection.merchant.id;
    
    // Find existing order
    const existingOrder = await this.orderRepository.findOne({
      where: { 
        merchantId,
        externalId: orderData.id.toString() 
      }
    });
    
    if (!existingOrder) {
      this.logger.log(`Order ${orderData.id} not found, creating new paid order`);
      return this.processNewOrder(shop, orderData);
    }
    
    // Update payment status
    existingOrder.financialStatus = 'paid';
    
    return this.orderRepository.save(existingOrder);
  }

  /**
   * Process customer data
   */
  private async processCustomer(
    transactionManager: any,
    merchantId: string,
    customerData: any
  ): Promise<Customer> {
    // Check if customer exists
    let customer = await this.customerRepository.findOne({
      where: { 
        merchantId,
        externalId: customerData.id.toString()
      }
    });
    
    // Transform customer data
    const customerTransformed = this.shopifyTransformService.transformShopifyCustomer(
      customerData,
      merchantId
    );
    
    if (customer) {
      // Update existing customer
      Object.assign(customer, customerTransformed);
    } else {
      // Create new customer
      customer = transactionManager.create(Customer, customerTransformed);
    }
    
    return transactionManager.save(customer);
  }

  /**
   * Process line items
   */
  private async processLineItems(
    transactionManager: any,
    orderId: string,
    lineItemsData: any[]
  ): Promise<OrderLineItem[]> {
    const lineItems: OrderLineItem[] = [];
    
    // Get existing line items for this order
    const existingLineItems = await this.lineItemRepository.find({
      where: { orderId }
    });
    
    const existingLineItemMap = new Map<string, OrderLineItem>();
    existingLineItems.forEach(item => {
      existingLineItemMap.set(item.externalId, item);
    });
    
    for (const lineItemData of lineItemsData) {
      const lineItemTransformed = this.shopifyTransformService.transformShopifyLineItem(
        lineItemData,
        orderId
      );
      
      const externalId = lineItemData.id.toString();
      
      // Check if line item exists
      if (existingLineItemMap.has(externalId)) {
        // Update existing
        const existingItem = existingLineItemMap.get(externalId);
        Object.assign(existingItem, lineItemTransformed);
        lineItems.push(await transactionManager.save(existingItem));
      } else {
        // Create new
        const newLineItem = transactionManager.create(OrderLineItem, lineItemTransformed);
        lineItems.push(await transactionManager.save(newLineItem));
      }
    }
    
    return lineItems;
  }

  /**
   * Fetch orders for a merchant
   */
  async getOrdersForMerchant(
    merchantId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    } = {}
  ): Promise<{ orders: Order[]; total: number }> {
    const { page = 1, limit = 10, status, search } = options;
    
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.lineItems', 'lineItems')
      .leftJoinAndSelect('order.customer', 'customer')
      .where('order.merchantId = :merchantId', { merchantId });
    
    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }
    
    if (search) {
      queryBuilder.andWhere(
        '(order.orderNumber LIKE :search OR customer.email LIKE :search OR customer.firstName LIKE :search OR customer.lastName LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    const total = await queryBuilder.getCount();
    
    const orders = await queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    
    return { orders, total };
  }

  /**
   * Get a single order by ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    return this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['lineItems', 'customer'],
    });
  }
}
```

### 2. Shopify Transform Service

Create a service for transforming Shopify data to Avnu format:

```typescript
// src/modules/integrations/shopify-app/services/shopify-transform.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Order } from '../../../entities/order.entity';
import { Customer } from '../../../entities/customer.entity';

@Injectable()
export class ShopifyTransformService {
  private readonly logger = new Logger(ShopifyTransformService.name);

  /**
   * Transform Shopify order to Avnu order format
   */
  transformShopifyOrder(
    shopifyOrder: any,
    merchantId: string,
    customerId?: string
  ): Partial<Order> {
    try {
      return {
        merchantId,
        customerId,
        externalId: shopifyOrder.id.toString(),
        orderNumber: shopifyOrder.name || shopifyOrder.order_number.toString(),
        status: this.mapOrderStatus(shopifyOrder),
        financialStatus: this.mapFinancialStatus(shopifyOrder.financial_status),
        fulfillmentStatus: this.mapFulfillmentStatus(shopifyOrder.fulfillment_status),
        totalPrice: Number(shopifyOrder.total_price) || 0,
        subtotalPrice: Number(shopifyOrder.subtotal_price) || 0,
        totalTax: Number(shopifyOrder.total_tax) || 0,
        totalDiscounts: Number(shopifyOrder.total_discounts) || 0,
        totalShipping: this.calculateTotalShipping(shopifyOrder),
        email: shopifyOrder.email,
        phone: shopifyOrder.phone,
        currency: shopifyOrder.currency,
        billingAddress: shopifyOrder.billing_address ? {
          firstName: shopifyOrder.billing_address.first_name,
          lastName: shopifyOrder.billing_address.last_name,
          address1: shopifyOrder.billing_address.address1,
          address2: shopifyOrder.billing_address.address2,
          city: shopifyOrder.billing_address.city,
          province: shopifyOrder.billing_address.province,
          country: shopifyOrder.billing_address.country,
          zip: shopifyOrder.billing_address.zip,
          phone: shopifyOrder.billing_address.phone,
        } : null,
        shippingAddress: shopifyOrder.shipping_address ? {
          firstName: shopifyOrder.shipping_address.first_name,
          lastName: shopifyOrder.shipping_address.last_name,
          address1: shopifyOrder.shipping_address.address1,
          address2: shopifyOrder.shipping_address.address2,
          city: shopifyOrder.shipping_address.city,
          province: shopifyOrder.shipping_address.province,
          country: shopifyOrder.shipping_address.country,
          zip: shopifyOrder.shipping_address.zip,
          phone: shopifyOrder.shipping_address.phone,
        } : null,
        note: shopifyOrder.note,
        metafields: shopifyOrder.metafields || {},
        cancelledAt: shopifyOrder.cancelled_at ? new Date(shopifyOrder.cancelled_at) : null,
        cancelReason: shopifyOrder.cancel_reason,
        tags: shopifyOrder.tags ? shopifyOrder.tags.split(',').map(tag => tag.trim()) : [],
        shippingLines: shopifyOrder.shipping_lines || [],
        taxLines: shopifyOrder.tax_lines || [],
        discountApplications: shopifyOrder.discount_applications || [],
        synced: true,
        syncedAt: new Date(),
        externalCreatedAt: shopifyOrder.created_at ? new Date(shopifyOrder.created_at) : null,
      };
    } catch (error) {
      this.logger.error(`Error transforming Shopify order: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Transform Shopify order update data
   */
  transformShopifyOrderUpdate(
    shopifyOrder: any,
    existingOrder: Order
  ): Order {
    try {
      // Only update fields that may have changed
      existingOrder.status = this.mapOrderStatus(shopifyOrder);
      existingOrder.financialStatus = this.mapFinancialStatus(shopifyOrder.financial_status);
      existingOrder.fulfillmentStatus = this.mapFulfillmentStatus(shopifyOrder.fulfillment_status);
      existingOrder.totalPrice = Number(shopifyOrder.total_price) || existingOrder.totalPrice;
      existingOrder.subtotalPrice = Number(shopifyOrder.subtotal_price) || existingOrder.subtotalPrice;
      existingOrder.totalTax = Number(shopifyOrder.total_tax) || existingOrder.totalTax;
      existingOrder.totalDiscounts = Number(shopifyOrder.total_discounts) || existingOrder.totalDiscounts;
      existingOrder.totalShipping = this.calculateTotalShipping(shopifyOrder);
      existingOrder.note = shopifyOrder.note;
      existingOrder.cancelledAt = shopifyOrder.cancelled_at ? new Date(shopifyOrder.cancelled_at) : existingOrder.cancelledAt;
      existingOrder.cancelReason = shopifyOrder.cancel_reason || existingOrder.cancelReason;
      existingOrder.tags = shopifyOrder.tags ? shopifyOrder.tags.split(',').map(tag => tag.trim()) : existingOrder.tags;
      existingOrder.shippingLines = shopifyOrder.shipping_lines || existingOrder.shippingLines;
      existingOrder.taxLines = shopifyOrder.tax_lines || existingOrder.taxLines;
      existingOrder.discountApplications = shopifyOrder.discount_applications || existingOrder.discountApplications;
      existingOrder.synced = true;
      existingOrder.syncedAt = new Date();
      
      return existingOrder;
    } catch (error) {
      this.logger.error(`Error transforming Shopify order update: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Transform Shopify customer to Avnu customer format
   */
  transformShopifyCustomer(
    shopifyCustomer: any,
    merchantId: string
  ): Partial<Customer> {
    try {
      return {
        merchantId,
        externalId: shopifyCustomer.id.toString(),
        email: shopifyCustomer.email,
        phone: shopifyCustomer.phone,
        firstName: shopifyCustomer.first_name,
        lastName: shopifyCustomer.last_name,
        acceptsMarketing: shopifyCustomer.accepts_marketing || false,
        taxExempt: shopifyCustomer.tax_exempt || false,
        ordersCount: shopifyCustomer.orders_count || 0,
        totalSpent: Number(shopifyCustomer.total_spent) || 0,
        note: shopifyCustomer.note,
        defaultAddress: shopifyCustomer.default_address ? {
          address1: shopifyCustomer.default_address.address1,
          address2: shopifyCustomer.default_address.address2,
          city: shopifyCustomer.default_address.city,
          province: shopifyCustomer.default_address.province,
          country: shopifyCustomer.default_address.country,
          zip: shopifyCustomer.default_address.zip,
          phone: shopifyCustomer.default_address.phone,
        } : null,
        addresses: shopifyCustomer.addresses || [],
        metafields: shopifyCustomer.metafields || {},
        tags: shopifyCustomer.tags ? shopifyCustomer.tags.split(',').map(tag => tag.trim()) : [],
        synced: true,
        syncedAt: new Date(),
        externalCreatedAt: shopifyCustomer.created_at ? new Date(shopifyCustomer.created_at) : null,
      };
    } catch (error) {
      this.logger.error(`Error transforming Shopify customer: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Transform Shopify line item to Avnu line item format
   */
  transformShopifyLineItem(
    shopifyLineItem: any,
    orderId: string
  ): Partial<OrderLineItem> {
    try {
      return {
        orderId,
        externalId: shopifyLineItem.id.toString(),
        externalProductId: shopifyLineItem.product_id?.toString() || '',
        externalVariantId: shopifyLineItem.variant_id?.toString() || '',
        title: shopifyLineItem.title,
        variantTitle: shopifyLineItem.variant_title,
        price: Number(shopifyLineItem.price) || 0,
        quantity: shopifyLineItem.quantity || 1,
        quantityFulfilled: shopifyLineItem.fulfillable_quantity || 0,
        sku: shopifyLineItem.sku,
        vendor: shopifyLineItem.vendor,
        requiresShipping: shopifyLineItem.requires_shipping,
        taxable: shopifyLineItem.taxable,
        taxLines: shopifyLineItem.tax_lines || [],
        discountAllocations: shopifyLineItem.discount_allocations || [],
        properties: shopifyLineItem.properties || {},
        imageUrl: this.extractImageUrl(shopifyLineItem),
        giftCard: shopifyLineItem.gift_card || false,
      };
    } catch (error) {
      this.logger.error(`Error transforming Shopify line item: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Map Shopify order status to Avnu status
   */
  private mapOrderStatus(shopifyOrder: any): 'open' | 'closed' | 'cancelled' | 'any' {
    if (shopifyOrder.cancelled_at) {
      return 'cancelled';
    }
    
    return shopifyOrder.closed_at ? 'closed' : 'open';
  }

  /**
   * Map Shopify financial status to Avnu financial status
   */
  private mapFinancialStatus(
    status: string
  ): 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided' {
    const validStatuses = [
      'pending', 'authorized', 'partially_paid', 'paid', 
      'partially_refunded', 'refunded', 'voided'
    ];
    
    return validStatuses.includes(status) ? 
      status as any : 
      'pending';
  }

  /**
   * Map Shopify fulfillment status to Avnu fulfillment status
   */
  private mapFulfillmentStatus(
    status: string
  ): 'unfulfilled' | 'partial' | 'fulfilled' | 'restocked' {
    if (!status) return 'unfulfilled';
    
    const statusMap: { [key: string]: 'unfulfilled' | 'partial' | 'fulfilled' | 'restocked' } = {
      'unfulfilled': 'unfulfilled',
      'partial': 'partial',
      'fulfilled': 'fulfilled',
      'restocked': 'restocked',
    };
    
    return statusMap[status] || 'unfulfilled';
  }

  /**
   * Calculate total shipping from Shopify order
   */
  private calculateTotalShipping(shopifyOrder: any): number {
    if (!shopifyOrder.shipping_lines || !shopifyOrder.shipping_lines.length) {
      return 0;
    }
    
    return shopifyOrder.shipping_lines.reduce(
      (total: number, line: any) => total + Number(line.price || 0),
      0
    );
  }

  /**
   * Extract image URL from line item
   */
  private extractImageUrl(lineItem: any): string | null {
    if (lineItem.image) {
      return lineItem.image.src;
    }
    
    if (lineItem.properties && lineItem.properties._image_url) {
      return lineItem.properties._image_url;
    }
    
    return null;
  }
}
```

### 3. Update Module Configuration

Update the Shopify module to include the new services:

```typescript
// Update src/modules/integrations/shopify-app/shopify.module.ts

import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { ShopifyOrderService } from './services/shopify-order.service';
import { ShopifyTransformService } from './services/shopify-transform.service';
import { Order } from '../../entities/order.entity';
import { OrderLineItem } from '../../entities/order-line-item.entity';
import { Customer } from '../../entities/customer.entity';

@Module({
  imports: [
    // Existing imports
    TypeOrmModule.forFeature([
      // Existing entities
      Order,
      OrderLineItem,
      Customer,
    ]),
    // Other imports
  ],
  providers: [
    // Existing providers
    ShopifyOrderService,
    ShopifyTransformService,
  ],
  controllers: [
    // Existing controllers
  ],
  exports: [
    // Existing exports
    ShopifyOrderService,
  ],
})
export class ShopifyModule {
  // Rest of the module configuration
}
```

## Dependencies & Prerequisites

- Completed Phase 4A and 4B
- TypeORM for database interactions
- Bull for queue management
- Shopify API integration

## Testing Guidelines

1. **Order Transformation:**
   - Test transformation functions with various order payloads
   - Verify field mappings between Shopify and Avnu formats
   - Test edge cases like missing or invalid fields

2. **Order Processing:**
   - Test new order creation flow
   - Test order update scenarios
   - Test order cancellation and payment status updates
   - Verify idempotent behavior (processing the same order twice)

3. **Transaction Handling:**
   - Test transaction rollback on failures
   - Verify all related entities (order, line items, customer) are created/updated atomically

## Next Phase

Once the order service is implemented, proceed to [Phase 4D: Fulfillment Service](./shopify-app-phase4d-fulfillment-service.md) to add fulfillment integration capabilities.
