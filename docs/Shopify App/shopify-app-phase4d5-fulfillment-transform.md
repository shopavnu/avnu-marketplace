# Phase 4D-5: Fulfillment Management - Transform Service

## Objectives

- Implement data transformation between Shopify and Avnu formats
- Create status mapping utilities
- Ensure consistent data structure across platforms

## Timeline: Week 17-18

## Tasks & Implementation Details

### 1. Transform Service Methods

Implement the transform service for fulfillment data:

```typescript
// src/modules/integrations/shopify-app/services/shopify-transform.service.ts

// Add these methods to the existing ShopifyTransformService class

/**
 * Transform Shopify fulfillment to Avnu fulfillment format
 */
transformShopifyFulfillment(
  shopifyFulfillment: any,
  orderId: string
): Partial<Fulfillment> {
  try {
    return {
      orderId,
      externalId: shopifyFulfillment.id.toString(),
      status: this.mapFulfillmentStatus(shopifyFulfillment.status),
      locationId: shopifyFulfillment.location_id?.toString(),
      trackingCompany: shopifyFulfillment.tracking_company,
      trackingNumber: shopifyFulfillment.tracking_number,
      trackingUrl: shopifyFulfillment.tracking_url,
      trackingUrls: shopifyFulfillment.tracking_urls,
      estimatedDeliveryAt: shopifyFulfillment.estimated_delivery_at ? 
        new Date(shopifyFulfillment.estimated_delivery_at) : null,
      notifyCustomer: shopifyFulfillment.notify_customer,
      note: shopifyFulfillment.receipt?.note,
      metafields: shopifyFulfillment.metafields || {},
      synced: true,
      syncedAt: new Date(),
      externalCreatedAt: shopifyFulfillment.created_at ? 
        new Date(shopifyFulfillment.created_at) : null,
    };
  } catch (error) {
    this.logger.error(`Error transforming Shopify fulfillment: ${error.message}`, error.stack);
    throw error;
  }
}

/**
 * Transform Shopify fulfillment update data
 */
transformShopifyFulfillmentUpdate(
  shopifyFulfillment: any,
  existingFulfillment: Fulfillment
): Fulfillment {
  try {
    // Only update fields that may have changed
    existingFulfillment.status = this.mapFulfillmentStatus(shopifyFulfillment.status);
    existingFulfillment.trackingCompany = shopifyFulfillment.tracking_company || existingFulfillment.trackingCompany;
    existingFulfillment.trackingNumber = shopifyFulfillment.tracking_number || existingFulfillment.trackingNumber;
    existingFulfillment.trackingUrl = shopifyFulfillment.tracking_url || existingFulfillment.trackingUrl;
    existingFulfillment.trackingUrls = shopifyFulfillment.tracking_urls || existingFulfillment.trackingUrls;
    existingFulfillment.estimatedDeliveryAt = shopifyFulfillment.estimated_delivery_at ? 
      new Date(shopifyFulfillment.estimated_delivery_at) : existingFulfillment.estimatedDeliveryAt;
    existingFulfillment.notifyCustomer = shopifyFulfillment.notify_customer !== undefined ? 
      shopifyFulfillment.notify_customer : existingFulfillment.notifyCustomer;
    existingFulfillment.note = shopifyFulfillment.receipt?.note || existingFulfillment.note;
    existingFulfillment.synced = true;
    existingFulfillment.syncedAt = new Date();
    
    return existingFulfillment;
  } catch (error) {
    this.logger.error(`Error transforming Shopify fulfillment update: ${error.message}`, error.stack);
    throw error;
  }
}

/**
 * Transform Shopify line item to Avnu fulfillment line item format
 */
transformShopifyFulfillmentLineItem(
  shopifyLineItem: any,
  fulfillmentId: string,
  orderLineItemId: string
): Partial<FulfillmentLineItem> {
  try {
    return {
      fulfillmentId,
      orderLineItemId,
      externalId: shopifyLineItem.id.toString(),
      externalLineItemId: shopifyLineItem.line_item_id.toString(),
      quantity: shopifyLineItem.quantity || 1,
    };
  } catch (error) {
    this.logger.error(`Error transforming Shopify fulfillment line item: ${error.message}`, error.stack);
    throw error;
  }
}

/**
 * Transform Shopify tracking info to Avnu format
 */
transformShopifyTracking(
  shopifyTracking: any,
  fulfillmentId: string
): Partial<FulfillmentTracking> {
  try {
    return {
      fulfillmentId,
      company: shopifyTracking.company || 'Unknown',
      number: shopifyTracking.number,
      url: shopifyTracking.url,
      estimatedDeliveryAt: shopifyTracking.estimated_delivery_at ? 
        new Date(shopifyTracking.estimated_delivery_at) : null,
      notifiedCustomer: shopifyTracking.notified_customer || false,
      shipmentStatus: shopifyTracking.shipment_status ? [
        {
          status: shopifyTracking.shipment_status,
          label: this.mapShipmentStatusToLabel(shopifyTracking.shipment_status),
          updatedAt: new Date(),
        }
      ] : [],
    };
  } catch (error) {
    this.logger.error(`Error transforming Shopify tracking: ${error.message}`, error.stack);
    throw error;
  }
}

/**
 * Transform Shopify tracking update
 */
transformShopifyTrackingUpdate(
  shopifyTracking: any,
  existingTracking: FulfillmentTracking
): FulfillmentTracking {
  try {
    // Update tracking fields
    existingTracking.company = shopifyTracking.company || existingTracking.company;
    existingTracking.number = shopifyTracking.number || existingTracking.number;
    existingTracking.url = shopifyTracking.url || existingTracking.url;
    existingTracking.estimatedDeliveryAt = shopifyTracking.estimated_delivery_at ? 
      new Date(shopifyTracking.estimated_delivery_at) : existingTracking.estimatedDeliveryAt;
    
    // Add new shipment status if provided and different from last status
    if (shopifyTracking.shipment_status) {
      const currentStatus = existingTracking.shipmentStatus || [];
      const lastStatus = currentStatus.length > 0 ? 
        currentStatus[currentStatus.length - 1].status : null;
      
      if (lastStatus !== shopifyTracking.shipment_status) {
        existingTracking.shipmentStatus = [
          ...currentStatus,
          {
            status: shopifyTracking.shipment_status,
            label: this.mapShipmentStatusToLabel(shopifyTracking.shipment_status),
            updatedAt: new Date(),
          }
        ];
      }
    }
    
    return existingTracking;
  } catch (error) {
    this.logger.error(`Error transforming Shopify tracking update: ${error.message}`, error.stack);
    throw error;
  }
}

/**
 * Map Shopify fulfillment status to Avnu status
 */
private mapFulfillmentStatus(status: string): 'pending' | 'open' | 'success' | 'cancelled' | 'error' | 'failure' {
  if (!status) return 'pending';
  
  const statusMap: { [key: string]: 'pending' | 'open' | 'success' | 'cancelled' | 'error' | 'failure' } = {
    'pending': 'pending',
    'open': 'open',
    'success': 'success',
    'cancelled': 'cancelled',
    'error': 'error',
    'failure': 'failure',
  };
  
  return statusMap[status] || 'pending';
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

/**
 * Transform Avnu fulfillment to Shopify format for API requests
 */
transformAvnuFulfillmentToShopify(
  fulfillment: Partial<Fulfillment>,
  lineItems: Partial<FulfillmentLineItem>[]
): any {
  try {
    // Format line items for Shopify
    const formattedLineItems = lineItems.map(item => ({
      id: item.externalLineItemId,
      quantity: item.quantity
    }));
    
    // Build tracking info if present
    let trackingInfo = null;
    if (fulfillment.trackingNumber || fulfillment.trackingCompany) {
      trackingInfo = {
        number: fulfillment.trackingNumber,
        company: fulfillment.trackingCompany,
        url: fulfillment.trackingUrl
      };
    }
    
    return {
      line_items: formattedLineItems,
      notify_customer: fulfillment.notifyCustomer,
      tracking_info: trackingInfo,
      location_id: fulfillment.locationId
    };
  } catch (error) {
    this.logger.error(`Error transforming Avnu fulfillment to Shopify: ${error.message}`, error.stack);
    throw error;
  }
}
```

### 2. API Service Methods for Fulfillment

Add methods to the Shopify API service for fulfillment operations:

```typescript
// src/modules/integrations/shopify-app/services/shopify-api.service.ts

// Add these methods to the existing ShopifyApiService class

/**
 * Create a fulfillment for an order in Shopify
 */
async createFulfillment(
  accessToken: string,
  shop: string,
  orderId: string,
  fulfillmentData: any
): Promise<any> {
  try {
    const response = await this.graphqlClient.request(accessToken, shop, `
      mutation fulfillmentCreate($fulfillment: FulfillmentInput!) {
        fulfillmentCreate(fulfillment: $fulfillment) {
          fulfillment {
            id
            status
            trackingInfo {
              company
              number
              url
            }
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      fulfillment: {
        orderId: `gid://shopify/Order/${orderId}`,
        lineItems: fulfillmentData.line_items,
        notifyCustomer: fulfillmentData.notify_customer,
        trackingInfo: fulfillmentData.tracking_info ? {
          company: fulfillmentData.tracking_info.company,
          number: fulfillmentData.tracking_info.number,
          url: fulfillmentData.tracking_info.url
        } : null,
        locationId: fulfillmentData.location_id ? 
          `gid://shopify/Location/${fulfillmentData.location_id}` : null
      }
    });
    
    if (response.fulfillmentCreate.userErrors && response.fulfillmentCreate.userErrors.length > 0) {
      throw new Error(`Error creating fulfillment: ${response.fulfillmentCreate.userErrors[0].message}`);
    }
    
    // Format the response to match the REST API format
    // since our transform methods are built for that
    const fulfillment = response.fulfillmentCreate.fulfillment;
    return {
      id: fulfillment.id.split('/').pop(),
      order_id: orderId,
      status: fulfillment.status,
      tracking_company: fulfillment.trackingInfo?.company,
      tracking_number: fulfillment.trackingInfo?.number,
      tracking_url: fulfillment.trackingInfo?.url,
      created_at: fulfillment.createdAt,
      updated_at: fulfillment.updatedAt
    };
  } catch (error) {
    this.logger.error(`Error creating fulfillment via GraphQL: ${error.message}`, error.stack);
    throw error;
  }
}

/**
 * Update a fulfillment in Shopify
 */
async updateFulfillment(
  accessToken: string,
  shop: string,
  orderId: string,
  fulfillmentId: string,
  updateData: any
): Promise<any> {
  try {
    // First get the fulfillment to get its GraphQL ID
    const fulfillment = await this.getFulfillment(accessToken, shop, orderId, fulfillmentId);
    
    // If tracking info is being updated
    if (updateData.tracking_number || updateData.tracking_company || updateData.tracking_url) {
      const response = await this.graphqlClient.request(accessToken, shop, `
        mutation fulfillmentTrackingInfoUpdate($fulfillmentId: ID!, $trackingInfoUpdateInput: FulfillmentTrackingInfoUpdateInput!) {
          fulfillmentTrackingInfoUpdate(fulfillmentId: $fulfillmentId, trackingInfoUpdateInput: $trackingInfoUpdateInput) {
            fulfillment {
              id
              status
              trackingInfo {
                company
                number
                url
              }
              updatedAt
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        fulfillmentId: `gid://shopify/Fulfillment/${fulfillmentId}`,
        trackingInfoUpdateInput: {
          notifyCustomer: updateData.notify_customer,
          trackingInfoInput: {
            company: updateData.tracking_company,
            number: updateData.tracking_number,
            url: updateData.tracking_url
          }
        }
      });
      
      if (response.fulfillmentTrackingInfoUpdate.userErrors && 
          response.fulfillmentTrackingInfoUpdate.userErrors.length > 0) {
        throw new Error(`Error updating fulfillment tracking: ${response.fulfillmentTrackingInfoUpdate.userErrors[0].message}`);
      }
      
      // Format the response
      const updatedFulfillment = response.fulfillmentTrackingInfoUpdate.fulfillment;
      return {
        id: updatedFulfillment.id.split('/').pop(),
        order_id: orderId,
        status: updatedFulfillment.status,
        tracking_company: updatedFulfillment.trackingInfo?.company,
        tracking_number: updatedFulfillment.trackingInfo?.number,
        tracking_url: updatedFulfillment.trackingInfo?.url,
        updated_at: updatedFulfillment.updatedAt
      };
    }
    
    // Return the unmodified fulfillment data if no tracking was updated
    return fulfillment;
  } catch (error) {
    this.logger.error(`Error updating fulfillment via GraphQL: ${error.message}`, error.stack);
    throw error;
  }
}

/**
 * Cancel a fulfillment in Shopify
 */
async cancelFulfillment(
  accessToken: string,
  shop: string,
  orderId: string,
  fulfillmentId: string,
  reason?: string
): Promise<void> {
  try {
    const response = await this.graphqlClient.request(accessToken, shop, `
      mutation fulfillmentCancel($id: ID!) {
        fulfillmentCancel(id: $id) {
          fulfillment {
            id
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      id: `gid://shopify/Fulfillment/${fulfillmentId}`
    });
    
    if (response.fulfillmentCancel.userErrors && 
        response.fulfillmentCancel.userErrors.length > 0) {
      throw new Error(`Error cancelling fulfillment: ${response.fulfillmentCancel.userErrors[0].message}`);
    }
  } catch (error) {
    this.logger.error(`Error cancelling fulfillment via GraphQL: ${error.message}`, error.stack);
    throw error;
  }
}

/**
 * Get a specific fulfillment from Shopify
 */
async getFulfillment(
  accessToken: string,
  shop: string,
  orderId: string,
  fulfillmentId: string
): Promise<any> {
  try {
    const response = await this.graphqlClient.request(accessToken, shop, `
      query getFulfillment($orderId: ID!, $fulfillmentId: ID!) {
        order(id: $orderId) {
          fulfillment(id: $fulfillmentId) {
            id
            status
            trackingInfo {
              company
              number
              url
            }
            createdAt
            updatedAt
          }
        }
      }
    `, {
      orderId: `gid://shopify/Order/${orderId}`,
      fulfillmentId: `gid://shopify/Fulfillment/${fulfillmentId}`
    });
    
    if (!response.order || !response.order.fulfillment) {
      throw new Error(`Fulfillment ${fulfillmentId} not found for order ${orderId}`);
    }
    
    // Format the response
    const fulfillment = response.order.fulfillment;
    return {
      id: fulfillment.id.split('/').pop(),
      order_id: orderId,
      status: fulfillment.status,
      tracking_company: fulfillment.trackingInfo?.company,
      tracking_number: fulfillment.trackingInfo?.number,
      tracking_url: fulfillment.trackingInfo?.url,
      created_at: fulfillment.createdAt,
      updated_at: fulfillment.updatedAt
    };
  } catch (error) {
    this.logger.error(`Error getting fulfillment via GraphQL: ${error.message}`, error.stack);
    throw error;
  }
}
```

### 3. Shopify GraphQL Client

Add the GraphQL client for Shopify API calls:

```typescript
// src/modules/integrations/shopify-app/services/shopify-graphql.client.ts

import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ShopifyGraphQLClient {
  private readonly logger = new Logger(ShopifyGraphQLClient.name);

  /**
   * Send a GraphQL request to Shopify
   */
  async request(
    accessToken: string,
    shop: string,
    query: string,
    variables: any = {}
  ): Promise<any> {
    try {
      const response = await axios({
        url: `https://${shop}/admin/api/2023-01/graphql.json`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        data: {
          query,
          variables,
        },
      });

      if (response.data.errors) {
        throw new Error(`GraphQL Errors: ${JSON.stringify(response.data.errors)}`);
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(`GraphQL request failed: ${error.message}`, error.stack);
      
      if (error.response) {
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      
      throw error;
    }
  }
}
```

### 4. Update Module Configuration

Update the Shopify module to include the GraphQL client:

```typescript
// Update src/modules/integrations/shopify-app/shopify.module.ts

import { Module } from '@nestjs/common';
import { ShopifyGraphQLClient } from './services/shopify-graphql.client';

@Module({
  providers: [
    // Existing providers
    ShopifyGraphQLClient,
  ],
  exports: [
    // Existing exports
    ShopifyGraphQLClient,
  ],
})
export class ShopifyModule {
  // Rest of the module configuration
}
```

## Dependencies & Prerequisites

- Completed Phase 4D-1 through 4D-4
- Axios for HTTP requests to Shopify API
- Knowledge of Shopify GraphQL Admin API

## Testing Guidelines

1. **Transform Methods:**
   - Test transformation with various input data
   - Verify all fields are correctly mapped
   - Test with missing or null fields

2. **API Integration:**
   - Test GraphQL queries with mock responses
   - Verify error handling for API failures
   - Test with real Shopify store in development environment

3. **Status Mapping:**
   - Verify fulfillment status mapping is consistent
   - Test tracking status labels
   - Validate mapping edge cases

## Next Phase

Continue to [Phase 4D-6: Fulfillment UI Components](./shopify-app-phase4d6-fulfillment-ui.md) to implement the user interface for fulfillment management.
