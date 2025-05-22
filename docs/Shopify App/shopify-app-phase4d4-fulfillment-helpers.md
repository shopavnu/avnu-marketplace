# Phase 4D-4: Fulfillment Service - Helper Methods

## Objectives

- Implement helper methods for the fulfillment service
- Create data transformation logic between systems
- Ensure accurate order status updates

## Timeline: Week 17

## Tasks & Implementation Details

### 1. Line Items Processing

Implement the helper method to process fulfillment line items:

```typescript
// Add to src/modules/integrations/shopify-app/services/shopify-fulfillment.service.ts

/**
 * Process line items for a fulfillment
 */
private async processLineItems(
  transactionManager: any, 
  fulfillmentId: string, 
  orderId: string, 
  lineItems: any[]
): Promise<FulfillmentLineItem[]> {
  const fulfillmentLineItems: FulfillmentLineItem[] = [];
  
  // Get the order line items
  const orderLineItems = await this.orderLineItemRepository.find({
    where: { orderId }
  });
  
  // Create a map of order line items by external ID for quick lookup
  const orderLineItemMap = new Map<string, OrderLineItem>();
  orderLineItems.forEach(item => {
    orderLineItemMap.set(item.externalId, item);
  });
  
  for (const lineItem of lineItems) {
    const externalLineItemId = lineItem.id.toString();
    
    // Find the corresponding order line item
    const orderLineItem = orderLineItemMap.get(externalLineItemId);
    
    if (!orderLineItem) {
      this.logger.warn(`Order line item with external ID ${externalLineItemId} not found for fulfillment ${fulfillmentId}`);
      continue;
    }
    
    // Create fulfillment line item
    const fulfillmentLineItem = transactionManager.create(FulfillmentLineItem, {
      fulfillmentId,
      orderLineItemId: orderLineItem.id,
      externalId: `${fulfillmentId}-${externalLineItemId}`, // Create a unique external ID
      externalLineItemId,
      quantity: lineItem.quantity || 1,
    });
    
    const savedLineItem = await transactionManager.save(fulfillmentLineItem);
    fulfillmentLineItems.push(savedLineItem);
    
    // Update quantity fulfilled on the order line item
    orderLineItem.quantityFulfilled = 
      (orderLineItem.quantityFulfilled || 0) + (lineItem.quantity || 1);
      
    if (orderLineItem.quantityFulfilled > orderLineItem.quantity) {
      orderLineItem.quantityFulfilled = orderLineItem.quantity;
    }
    
    await transactionManager.save(orderLineItem);
  }
  
  return fulfillmentLineItems;
}
```

### 2. Tracking Information Processing

Implement the helper method to process tracking information:

```typescript
// Add to src/modules/integrations/shopify-app/services/shopify-fulfillment.service.ts

/**
 * Process tracking information for a fulfillment
 */
private async processTrackingInfo(
  transactionManager: any,
  fulfillmentId: string,
  trackingInfo: any
): Promise<FulfillmentTracking> {
  // Convert single tracking info to array for consistent processing
  const trackingInfos = Array.isArray(trackingInfo) ? trackingInfo : [trackingInfo];
  
  const trackingEntities: FulfillmentTracking[] = [];
  
  for (const info of trackingInfos) {
    // Create tracking entity
    const tracking = transactionManager.create(FulfillmentTracking, {
      fulfillmentId,
      company: info.company || 'Unknown',
      number: info.number,
      url: info.url,
      estimatedDeliveryAt: info.estimated_delivery_at ? new Date(info.estimated_delivery_at) : null,
      notifiedCustomer: info.notified_customer || false,
      shipmentStatus: info.shipment_status ? [
        {
          status: info.shipment_status,
          label: this.mapShipmentStatusToLabel(info.shipment_status),
          updatedAt: new Date(),
        }
      ] : [],
    });
    
    const savedTracking = await transactionManager.save(tracking);
    trackingEntities.push(savedTracking);
    
    // Update the fulfillment with tracking info
    await transactionManager.update(Fulfillment, { id: fulfillmentId }, {
      trackingCompany: info.company || 'Unknown',
      trackingNumber: info.number,
      trackingUrl: info.url,
      estimatedDeliveryAt: info.estimated_delivery_at ? new Date(info.estimated_delivery_at) : null,
    });
  }
  
  return trackingEntities.length > 0 ? trackingEntities[0] : null;
}

/**
 * Map shipment status to human-readable label
 */
private mapShipmentStatusToLabel(status: string): string {
  const statusMap: Record<string, string> = {
    'label_created': 'Label Created',
    'label_printed': 'Label Printed',
    'pre_transit': 'Pre-Transit',
    'in_transit': 'In Transit',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'failure': 'Delivery Failed',
    'exception': 'Delivery Exception',
    'return_to_sender': 'Returned to Sender',
    'unknown': 'Status Unknown',
  };
  
  return statusMap[status] || 'Status Unknown';
}
```

### 3. Order Fulfillment Status Update

Implement the helper method to update an order's fulfillment status:

```typescript
// Add to src/modules/integrations/shopify-app/services/shopify-fulfillment.service.ts

/**
 * Update the fulfillment status of an order based on line items
 */
private async updateOrderFulfillmentStatus(
  transactionManager: any,
  orderId: string
): Promise<void> {
  // Get all line items for the order
  const orderLineItems = await this.orderLineItemRepository.find({
    where: { orderId }
  });
  
  if (!orderLineItems.length) {
    return;
  }
  
  // Calculate total quantities and fulfilled quantities
  const totalQuantity = orderLineItems.reduce(
    (sum, item) => sum + item.quantity, 
    0
  );
  
  const fulfilledQuantity = orderLineItems.reduce(
    (sum, item) => sum + (item.quantityFulfilled || 0), 
    0
  );
  
  // Determine fulfillment status
  let fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled' | 'restocked';
  
  if (fulfilledQuantity === 0) {
    fulfillmentStatus = 'unfulfilled';
  } else if (fulfilledQuantity < totalQuantity) {
    fulfillmentStatus = 'partial';
  } else {
    fulfillmentStatus = 'fulfilled';
  }
  
  // Update order
  await transactionManager.update(Order, { id: orderId }, { 
    fulfillmentStatus 
  });
}
```

### 4. Create Fulfillment Implementation

Implement the method to create a new fulfillment:

```typescript
// Update in src/modules/integrations/shopify-app/services/shopify-fulfillment.service.ts

/**
 * Create a new fulfillment in Shopify via API
 */
async createFulfillment(
  merchantId: string, 
  createDto: CreateFulfillmentDto
): Promise<Fulfillment> {
  // Get the order
  const order = await this.orderRepository.findOne({
    where: { id: createDto.orderId, merchantId },
    relations: ['lineItems'],
  });
  
  if (!order) {
    throw new NotFoundException(`Order with ID ${createDto.orderId} not found`);
  }
  
  // Get the merchant connection
  const connection = await this.connectionRepository.findOne({
    where: { merchantId, platform: 'shopify' },
  });
  
  if (!connection) {
    throw new Error(`No Shopify connection found for merchant ${merchantId}`);
  }
  
  // Validate line items
  if (!createDto.lineItems || !createDto.lineItems.length) {
    throw new Error('At least one line item is required for fulfillment');
  }
  
  // Get the order line items
  const orderLineItemIds = createDto.lineItems.map(item => item.orderLineItemId);
  const orderLineItems = await this.orderLineItemRepository.find({
    where: { id: In(orderLineItemIds) }
  });
  
  if (orderLineItems.length !== orderLineItemIds.length) {
    throw new Error('One or more line items not found');
  }
  
  // Create a map of order line items by ID for quick lookup
  const orderLineItemMap = new Map<string, OrderLineItem>();
  orderLineItems.forEach(item => {
    orderLineItemMap.set(item.id, item);
  });
  
  // Prepare line items for Shopify
  const shopifyLineItems = createDto.lineItems.map(item => {
    const orderLineItem = orderLineItemMap.get(item.orderLineItemId);
    return {
      id: orderLineItem.externalId,
      quantity: item.quantity
    };
  });
  
  // Prepare tracking info if provided
  let trackingInfo = null;
  if (createDto.trackingNumber || createDto.trackingCompany) {
    trackingInfo = {
      number: createDto.trackingNumber,
      company: createDto.trackingCompany,
      url: createDto.trackingUrl
    };
  }
  
  // Create fulfillment in Shopify
  try {
    const shopifyFulfillment = await this.shopifyApiService.createFulfillment(
      connection.accessToken,
      connection.shopDomain,
      order.externalId,
      {
        line_items: shopifyLineItems,
        notify_customer: createDto.notifyCustomer,
        tracking_info: trackingInfo,
        location_id: createDto.locationId
      }
    );
    
    // Now process the response to create a fulfillment in our system
    return this.processNewFulfillment(connection.shopDomain, shopifyFulfillment);
  } catch (error) {
    this.logger.error(`Error creating fulfillment in Shopify: ${error.message}`, error.stack);
    throw error;
  }
}
```

### 5. Update Fulfillment Implementation

Implement the method to update an existing fulfillment:

```typescript
// Update in src/modules/integrations/shopify-app/services/shopify-fulfillment.service.ts

/**
 * Update an existing fulfillment
 */
async updateFulfillment(
  fulfillmentId: string, 
  updateDto: UpdateFulfillmentDto
): Promise<Fulfillment> {
  // Get the existing fulfillment
  const fulfillment = await this.fulfillmentRepository.findOne({
    where: { id: fulfillmentId },
    relations: ['order'],
  });
  
  if (!fulfillment) {
    throw new NotFoundException(`Fulfillment with ID ${fulfillmentId} not found`);
  }
  
  // Get the merchant connection
  const order = await this.orderRepository.findOne({
    where: { id: fulfillment.orderId },
    relations: [],
  });
  
  const connection = await this.connectionRepository.findOne({
    where: { merchantId: order.merchantId, platform: 'shopify' },
  });
  
  if (!connection) {
    throw new Error(`No Shopify connection found for merchant ${order.merchantId}`);
  }
  
  // Prepare update data
  const updateData: any = {};
  
  if (updateDto.trackingCompany) {
    updateData.tracking_company = updateDto.trackingCompany;
  }
  
  if (updateDto.trackingNumber) {
    updateData.tracking_number = updateDto.trackingNumber;
  }
  
  if (updateDto.trackingUrl) {
    updateData.tracking_url = updateDto.trackingUrl;
  }
  
  if (updateDto.notifyCustomer !== undefined) {
    updateData.notify_customer = updateDto.notifyCustomer;
  }
  
  // Update fulfillment in Shopify
  try {
    const shopifyFulfillment = await this.shopifyApiService.updateFulfillment(
      connection.accessToken,
      connection.shopDomain,
      order.externalId,
      fulfillment.externalId,
      updateData
    );
    
    // Now process the response to update our fulfillment
    return this.processFulfillmentUpdate(connection.shopDomain, shopifyFulfillment);
  } catch (error) {
    this.logger.error(`Error updating fulfillment in Shopify: ${error.message}`, error.stack);
    throw error;
  }
}
```

### 6. Cancel Fulfillment Implementation

Implement the method to cancel a fulfillment:

```typescript
// Update in src/modules/integrations/shopify-app/services/shopify-fulfillment.service.ts

/**
 * Cancel a fulfillment
 */
async cancelFulfillment(
  fulfillmentId: string, 
  reason?: string
): Promise<Fulfillment> {
  // Get the existing fulfillment
  const fulfillment = await this.fulfillmentRepository.findOne({
    where: { id: fulfillmentId },
    relations: ['order'],
  });
  
  if (!fulfillment) {
    throw new NotFoundException(`Fulfillment with ID ${fulfillmentId} not found`);
  }
  
  // Get the merchant connection
  const order = await this.orderRepository.findOne({
    where: { id: fulfillment.orderId },
    relations: [],
  });
  
  const connection = await this.connectionRepository.findOne({
    where: { merchantId: order.merchantId, platform: 'shopify' },
  });
  
  if (!connection) {
    throw new Error(`No Shopify connection found for merchant ${order.merchantId}`);
  }
  
  // Cancel fulfillment in Shopify
  try {
    await this.shopifyApiService.cancelFulfillment(
      connection.accessToken,
      connection.shopDomain,
      order.externalId,
      fulfillment.externalId,
      reason
    );
    
    // Update local fulfillment status
    fulfillment.status = 'cancelled';
    await this.fulfillmentRepository.save(fulfillment);
    
    // Update order status
    await this.updateOrderFulfillmentStatus(this.connection.manager, order.id);
    
    return fulfillment;
  } catch (error) {
    this.logger.error(`Error cancelling fulfillment in Shopify: ${error.message}`, error.stack);
    throw error;
  }
}
```

### 7. Add Tracking Implementation

Implement the method to add tracking information to a fulfillment:

```typescript
// Update in src/modules/integrations/shopify-app/services/shopify-fulfillment.service.ts

/**
 * Add tracking information to a fulfillment
 */
async addTracking(
  fulfillmentId: string, 
  trackingDto: AddTrackingDto
): Promise<Fulfillment> {
  // Get the existing fulfillment
  const fulfillment = await this.fulfillmentRepository.findOne({
    where: { id: fulfillmentId },
    relations: ['order', 'trackingInfo'],
  });
  
  if (!fulfillment) {
    throw new NotFoundException(`Fulfillment with ID ${fulfillmentId} not found`);
  }
  
  // Get the merchant connection
  const order = await this.orderRepository.findOne({
    where: { id: fulfillment.orderId },
    relations: [],
  });
  
  const connection = await this.connectionRepository.findOne({
    where: { merchantId: order.merchantId, platform: 'shopify' },
  });
  
  if (!connection) {
    throw new Error(`No Shopify connection found for merchant ${order.merchantId}`);
  }
  
  // Prepare tracking data
  const trackingData = {
    tracking_number: trackingDto.number,
    tracking_company: trackingDto.company,
    tracking_url: trackingDto.url,
    notify_customer: trackingDto.notifyCustomer
  };
  
  // Add tracking to Shopify fulfillment
  try {
    const shopifyFulfillment = await this.shopifyApiService.updateFulfillment(
      connection.accessToken,
      connection.shopDomain,
      order.externalId,
      fulfillment.externalId,
      trackingData
    );
    
    // Start a transaction for adding tracking locally
    return this.connection.transaction(async (transactionManager) => {
      // Update fulfillment with tracking info
      fulfillment.trackingCompany = trackingDto.company;
      fulfillment.trackingNumber = trackingDto.number;
      fulfillment.trackingUrl = trackingDto.url;
      
      await transactionManager.save(fulfillment);
      
      // Add tracking info record
      const tracking = transactionManager.create(FulfillmentTracking, {
        fulfillmentId,
        company: trackingDto.company,
        number: trackingDto.number,
        url: trackingDto.url,
        estimatedDeliveryAt: trackingDto.estimatedDeliveryAt,
        notifiedCustomer: trackingDto.notifyCustomer || false,
      });
      
      await transactionManager.save(tracking);
      
      // Reload the fulfillment with tracking
      return this.fulfillmentRepository.findOne({
        where: { id: fulfillmentId },
        relations: ['trackingInfo'],
      });
    });
  } catch (error) {
    this.logger.error(`Error adding tracking to fulfillment in Shopify: ${error.message}`, error.stack);
    throw error;
  }
}
```

## Dependencies & Prerequisites

- Completed Phase 4D-3 (Fulfillment Service Core)
- TypeORM for database transactions
- Shopify API integration for fulfillment operations

## Testing Guidelines

1. **Helper Methods:**
   - Test line item processing with various quantities
   - Verify tracking information is correctly processed and mapped
   - Test order status updates for different fulfillment scenarios

2. **API Methods:**
   - Test creation, updates, and cancellation flows
   - Verify tracking additions work correctly
   - Test error handling and validation

3. **Data Synchronization:**
   - Verify bidirectional updates between Shopify and Avnu
   - Test idempotent operations
   - Verify status mapping is consistent

## Next Phase

Continue to [Phase 4D-5: Fulfillment Transform Service](./shopify-app-phase4d5-fulfillment-transform.md) to implement the data transformation logic between Shopify and Avnu.
