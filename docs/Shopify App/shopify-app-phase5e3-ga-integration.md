# Phase 5E-3.2: Analytics & Reporting - Google Analytics Integration

## Objectives

- Implement Google Analytics integration
- Support both Universal Analytics and GA4
- Track e-commerce events in Google Analytics

## Timeline: Week 27-28

## Tasks & Implementation Details

### 1. Google Analytics Provider Implementation

Create a provider for Google Analytics:

```typescript
// src/modules/integrations/providers/google-analytics.provider.ts

import { Injectable, Logger } from '@nestjs/common';
import { IIntegrationProvider, IntegrationConfig, IntegrationEvent } from '../interfaces/integration-provider.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GoogleAnalyticsProvider implements IIntegrationProvider {
  readonly type = 'google_analytics';
  readonly name = 'Google Analytics';
  readonly description = 'Integration with Google Analytics 4 for tracking e-commerce events';
  readonly requiredCredentials = ['measurementId', 'apiSecret'];

  private readonly logger = new Logger(GoogleAnalyticsProvider.name);
  private configs = new Map<string, IntegrationConfig>();

  constructor(private readonly httpService: HttpService) {}

  /**
   * Initialize the provider with configuration
   */
  async initialize(config: IntegrationConfig): Promise<void> {
    this.configs.set(config.merchantId, config);
    this.logger.log(`Initialized Google Analytics provider for merchant ${config.merchantId}`);
  }

  /**
   * Validate Google Analytics credentials
   */
  async validateCredentials(credentials: Record<string, any>): Promise<boolean> {
    try {
      const { measurementId, apiSecret } = credentials;
      
      if (!measurementId || !apiSecret) {
        return false;
      }
      
      // Perform a test event to validate credentials
      const testEvent = {
        client_id: 'test_client',
        events: [
          {
            name: 'test_event',
            params: {
              test_param: 'test_value'
            }
          }
        ]
      };
      
      const url = `https://www.google-analytics.com/debug/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;
      
      const response = await firstValueFrom(
        this.httpService.post(url, testEvent)
      );
      
      // Check if the response indicates valid credentials
      return response.status === 200 && 
        !response.data.validationMessages;
    } catch (error) {
      this.logger.error(`Error validating Google Analytics credentials: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Track an event in Google Analytics
   */
  async trackEvent(event: IntegrationEvent): Promise<boolean> {
    try {
      // Get the configuration for this merchant
      const config = this.configs.get(event.merchantId);
      
      if (!config) {
        throw new Error(`No configuration found for merchant ${event.merchantId}`);
      }
      
      const { measurementId, apiSecret } = config.credentials;
      
      // Transform the event to Google Analytics format
      const gaEvent = this.transformEvent(event);
      
      // Send the event to Google Analytics
      const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;
      
      const response = await firstValueFrom(
        this.httpService.post(url, gaEvent)
      );
      
      return response.status === 204;
    } catch (error) {
      this.logger.error(`Error tracking event in Google Analytics: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Check if the provider is configured
   */
  isConfigured(config: IntegrationConfig): boolean {
    const { measurementId, apiSecret } = config.credentials;
    return Boolean(measurementId && apiSecret);
  }

  /**
   * Get default settings for the provider
   */
  getDefaultSettings(): Record<string, any> {
    return {
      sendUserIdAsClientId: false,
      includeUserProperties: true,
      eventMapping: {
        page_view: 'page_view',
        product_view: 'view_item',
        add_to_cart: 'add_to_cart',
        checkout_begin: 'begin_checkout',
        purchase: 'purchase',
        refund: 'refund',
      }
    };
  }

  /**
   * Transform an event to Google Analytics format
   */
  private transformEvent(event: IntegrationEvent): any {
    // Get the client ID from the event data
    const clientId = event.data.client_id || 
                    event.userId || 
                    `shopify_${event.merchantId}_${event.sessionId}` || 
                    this.generateClientId();
    
    // Base payload
    const gaEvent: any = {
      client_id: clientId,
      user_id: event.userId,
      timestamp_micros: new Date(event.timestamp).getTime() * 1000,
      non_personalized_ads: false,
      events: [
        {
          name: this.mapEventName(event.eventType),
          params: {},
        }
      ]
    };
    
    // Add event parameters based on event type
    switch (event.eventType) {
      case 'page_view':
        gaEvent.events[0].params = {
          page_title: event.data.title,
          page_location: event.data.url,
          page_referrer: event.data.referrer,
        };
        break;
      
      case 'product_view':
        gaEvent.events[0].params = {
          currency: event.data.currency || 'USD',
          value: event.data.price,
          items: [
            {
              item_id: event.data.product_id,
              item_name: event.data.product_name,
              price: event.data.price,
              quantity: 1,
            }
          ]
        };
        break;
      
      case 'add_to_cart':
        gaEvent.events[0].params = {
          currency: event.data.currency || 'USD',
          value: event.data.price * event.data.quantity,
          items: [
            {
              item_id: event.data.product_id,
              item_name: event.data.product_name,
              price: event.data.price,
              quantity: event.data.quantity,
            }
          ]
        };
        break;
      
      case 'checkout_begin':
        gaEvent.events[0].params = {
          currency: event.data.currency || 'USD',
          value: event.data.value,
          items: event.data.items.map(item => ({
            item_id: item.product_id,
            item_name: item.product_name,
            price: item.price,
            quantity: item.quantity,
          }))
        };
        break;
      
      case 'purchase':
        gaEvent.events[0].params = {
          transaction_id: event.data.order_id,
          currency: event.data.currency || 'USD',
          value: event.data.total,
          tax: event.data.tax,
          shipping: event.data.shipping,
          items: event.data.items.map(item => ({
            item_id: item.product_id,
            item_name: item.product_name,
            price: item.price,
            quantity: item.quantity,
          }))
        };
        break;
      
      case 'refund':
        gaEvent.events[0].params = {
          transaction_id: event.data.order_id,
          currency: event.data.currency || 'USD',
          value: event.data.refund_amount,
          items: event.data.items ? event.data.items.map(item => ({
            item_id: item.product_id,
            item_name: item.product_name,
            price: item.price,
            quantity: item.quantity,
          })) : []
        };
        break;
      
      default:
        // For custom events, just pass through all data
        gaEvent.events[0].params = { ...event.data };
    }
    
    return gaEvent;
  }

  /**
   * Map internal event names to Google Analytics event names
   */
  private mapEventName(eventType: string): string {
    const defaultMapping = {
      page_view: 'page_view',
      product_view: 'view_item',
      add_to_cart: 'add_to_cart',
      checkout_begin: 'begin_checkout',
      purchase: 'purchase',
      refund: 'refund',
    };
    
    return defaultMapping[eventType] || eventType;
  }

  /**
   * Generate a random client ID for Google Analytics
   */
  private generateClientId(): string {
    return `${Math.floor(Math.random() * 1000000000)}.${Math.floor(Date.now() / 1000)}`;
  }
}
```

### 2. Event Transformation Utility

Create a utility to help transform events for Google Analytics:

```typescript
// src/modules/integrations/utils/ga-event-transformer.util.ts

import { Logger } from '@nestjs/common';

export class GAEventTransformer {
  private static readonly logger = new Logger('GAEventTransformer');

  /**
   * Transform a standard e-commerce event to Google Analytics 4 format
   */
  static transformEcommerceEvent(
    eventType: string,
    eventData: Record<string, any>,
    clientId?: string,
    userId?: string,
  ): Record<string, any> {
    try {
      // Create base event structure
      const gaEvent = {
        client_id: clientId || this.generateClientId(),
        user_id: userId,
        timestamp_micros: Date.now() * 1000,
        events: [
          {
            name: this.mapEventName(eventType),
            params: {},
          }
        ]
      };

      // Populate event parameters based on event type
      gaEvent.events[0].params = this.buildEventParams(eventType, eventData);
      
      return gaEvent;
    } catch (error) {
      this.logger.error(`Error transforming event to GA4 format: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Build event parameters based on event type
   */
  private static buildEventParams(
    eventType: string,
    eventData: Record<string, any>,
  ): Record<string, any> {
    switch (eventType) {
      case 'product_view':
        return this.buildProductViewParams(eventData);
      
      case 'add_to_cart':
        return this.buildAddToCartParams(eventData);
      
      case 'checkout_begin':
        return this.buildCheckoutBeginParams(eventData);
      
      case 'purchase':
        return this.buildPurchaseParams(eventData);
      
      case 'refund':
        return this.buildRefundParams(eventData);
      
      default:
        // For custom events, just return the original data
        return eventData;
    }
  }

  /**
   * Build parameters for product view events
   */
  private static buildProductViewParams(data: Record<string, any>): Record<string, any> {
    return {
      currency: data.currency || 'USD',
      value: parseFloat(data.price) || 0,
      items: [
        {
          item_id: data.product_id,
          item_name: data.product_name,
          price: parseFloat(data.price) || 0,
          quantity: 1,
          item_category: data.category,
          item_brand: data.brand,
          item_variant: data.variant,
        }
      ]
    };
  }

  /**
   * Build parameters for add to cart events
   */
  private static buildAddToCartParams(data: Record<string, any>): Record<string, any> {
    const quantity = parseInt(data.quantity) || 1;
    const price = parseFloat(data.price) || 0;
    
    return {
      currency: data.currency || 'USD',
      value: price * quantity,
      items: [
        {
          item_id: data.product_id,
          item_name: data.product_name,
          price,
          quantity,
          item_category: data.category,
          item_brand: data.brand,
          item_variant: data.variant,
        }
      ]
    };
  }

  /**
   * Build parameters for checkout begin events
   */
  private static buildCheckoutBeginParams(data: Record<string, any>): Record<string, any> {
    return {
      currency: data.currency || 'USD',
      value: parseFloat(data.value) || 0,
      items: Array.isArray(data.items) ? data.items.map(item => ({
        item_id: item.product_id,
        item_name: item.product_name,
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
        item_category: item.category,
        item_brand: item.brand,
        item_variant: item.variant,
      })) : []
    };
  }

  /**
   * Build parameters for purchase events
   */
  private static buildPurchaseParams(data: Record<string, any>): Record<string, any> {
    return {
      transaction_id: data.order_id,
      value: parseFloat(data.total) || 0,
      tax: parseFloat(data.tax) || 0,
      shipping: parseFloat(data.shipping) || 0,
      currency: data.currency || 'USD',
      coupon: data.coupon,
      items: Array.isArray(data.items) ? data.items.map(item => ({
        item_id: item.product_id,
        item_name: item.product_name,
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
        item_category: item.category,
        item_brand: item.brand,
        item_variant: item.variant,
      })) : []
    };
  }

  /**
   * Build parameters for refund events
   */
  private static buildRefundParams(data: Record<string, any>): Record<string, any> {
    return {
      transaction_id: data.order_id,
      value: parseFloat(data.refund_amount) || 0,
      currency: data.currency || 'USD',
      items: Array.isArray(data.items) ? data.items.map(item => ({
        item_id: item.product_id,
        item_name: item.product_name,
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
      })) : []
    };
  }

  /**
   * Map internal event names to Google Analytics event names
   */
  private static mapEventName(eventType: string): string {
    const mapping = {
      page_view: 'page_view',
      product_view: 'view_item',
      add_to_cart: 'add_to_cart',
      remove_from_cart: 'remove_from_cart',
      checkout_begin: 'begin_checkout',
      purchase: 'purchase',
      refund: 'refund',
      login: 'login',
      sign_up: 'sign_up',
      search: 'search',
      view_cart: 'view_cart',
      add_shipping_info: 'add_shipping_info',
      add_payment_info: 'add_payment_info',
    };
    
    return mapping[eventType] || eventType;
  }

  /**
   * Generate a random client ID for Google Analytics
   */
  private static generateClientId(): string {
    return `${Math.floor(Math.random() * 1000000000)}.${Math.floor(Date.now() / 1000)}`;
  }
}
```

### 3. Google Analytics Integration Setup Component

Create a React component for setting up Google Analytics integration:

```tsx
// src/client/components/integrations/GoogleAnalyticsSetup.tsx

import React, { useState } from 'react';
import { Form, Input, Button, Card, Switch, Alert, Divider, Collapse, Select } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { apiClient } from '../../services/api-client';

const { Panel } = Collapse;
const { Option } = Select;

interface GoogleAnalyticsSetupProps {
  existingConfig?: any;
  onComplete?: (config: any) => void;
}

export const GoogleAnalyticsSetup: React.FC<GoogleAnalyticsSetupProps> = ({
  existingConfig,
  onComplete,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Pre-fill form if editing an existing configuration
  React.useEffect(() => {
    if (existingConfig) {
      form.setFieldsValue({
        measurementId: existingConfig.credentials.measurementId,
        apiSecret: existingConfig.credentials.apiSecret,
        sendUserIdAsClientId: existingConfig.settings?.sendUserIdAsClientId || false,
        includeUserProperties: existingConfig.settings?.includeUserProperties || true,
        // Other settings...
      });
    }
  }, [existingConfig, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      setError(null);
      setTestSuccess(false);
      
      const config = {
        providerType: 'google_analytics',
        credentials: {
          measurementId: values.measurementId,
          apiSecret: values.apiSecret,
        },
        settings: {
          sendUserIdAsClientId: values.sendUserIdAsClientId,
          includeUserProperties: values.includeUserProperties,
          eventMapping: values.eventMapping || {
            page_view: 'page_view',
            product_view: 'view_item',
            add_to_cart: 'add_to_cart',
            checkout_begin: 'begin_checkout',
            purchase: 'purchase',
            refund: 'refund',
          },
        },
      };
      
      // Create or update the integration
      let response;
      if (existingConfig) {
        response = await apiClient.put(`/integrations/${existingConfig.id}`, config);
      } else {
        response = await apiClient.post('/integrations', config);
      }
      
      setTestSuccess(true);
      
      if (onComplete) {
        onComplete(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save Google Analytics configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Google Analytics 4 Setup">
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {testSuccess && (
        <Alert
          message="Success"
          description="Google Analytics integration was successfully configured and tested."
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          sendUserIdAsClientId: false,
          includeUserProperties: true,
        }}
      >
        <Form.Item
          name="measurementId"
          label="Measurement ID"
          tooltip="Your Google Analytics 4 Measurement ID (starts with G-)"
          rules={[{ required: true, message: 'Please enter your Measurement ID' }]}
        >
          <Input placeholder="G-XXXXXXXXXX" />
        </Form.Item>
        
        <Form.Item
          name="apiSecret"
          label="API Secret"
          tooltip="Your Google Analytics 4 API Secret from the Data Streams section"
          rules={[{ required: true, message: 'Please enter your API Secret' }]}
        >
          <Input.Password placeholder="API Secret" />
        </Form.Item>
        
        <Divider />
        
        <div style={{ marginBottom: 16 }}>
          <Button
            type="link"
            icon={<InfoCircleOutlined />}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
          </Button>
        </div>
        
        {showAdvanced && (
          <Collapse ghost>
            <Panel header="User Identification" key="user-identification">
              <Form.Item
                name="sendUserIdAsClientId"
                valuePropName="checked"
                label="Send User ID as Client ID"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="includeUserProperties"
                valuePropName="checked"
                label="Include User Properties"
              >
                <Switch />
              </Form.Item>
            </Panel>
            
            <Panel header="Event Mapping" key="event-mapping">
              <p>Map Avnu event types to Google Analytics event types</p>
              
              <Form.List name={['eventMapping']}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(field => (
                      <div key={field.key} style={{ display: 'flex', marginBottom: 8 }}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'avnuEvent']}
                          style={{ marginRight: 8, width: '50%' }}
                        >
                          <Input placeholder="Avnu Event Name" />
                        </Form.Item>
                        
                        <Form.Item
                          {...field}
                          name={[field.name, 'gaEvent']}
                          style={{ width: '50%' }}
                        >
                          <Input placeholder="GA Event Name" />
                        </Form.Item>
                      </div>
                    ))}
                    
                    <Button type="dashed" onClick={() => add()} block>
                      Add Event Mapping
                    </Button>
                  </>
                )}
              </Form.List>
            </Panel>
          </Collapse>
        )}
        
        <Form.Item style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            {existingConfig ? 'Update Configuration' : 'Save Configuration'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
```

### 4. Integration with Analytics Event Listener

Update the Analytics Service to forward events to Google Analytics:

```typescript
// src/modules/analytics/services/analytics.service.ts

// Add this to the existing AnalyticsService class

/**
 * Track an event and forward it to integrations
 */
async trackEventWithIntegrations(
  merchantId: string,
  eventType: string,
  eventData: Record<string, any>,
  userId?: string,
  sessionId?: string,
): Promise<void> {
  try {
    // First track the event in our own system
    const event = await this.trackEvent(merchantId, eventType, eventData, userId, sessionId);
    
    // Then forward to the integration service
    await this.integrationEventService.forwardEvent({
      eventType,
      timestamp: event.timestamp,
      merchantId,
      userId,
      sessionId,
      data: eventData,
    });
  } catch (error) {
    this.logger.error(`Error tracking event with integrations: ${error.message}`, error.stack);
    
    // Still try to track the event in our system even if integration forwarding fails
    await this.trackEvent(merchantId, eventType, eventData, userId, sessionId);
  }
}
```

## Dependencies & Prerequisites

- Completed Phase 5E-3.1 (Integration Framework)
- Google Analytics 4 property and measurement ID
- HttpService for making API calls to Google Analytics

## Testing Guidelines

1. **Event Transformation:**
   - Test transformation of various event types to GA4 format
   - Verify required parameters are included for each event type

2. **API Integration:**
   - Test communication with Google Analytics API
   - Verify proper handling of API errors

3. **UI Testing:**
   - Test configuration form validation
   - Verify credential testing functionality

## Next Phase

Continue to [Phase 5E-3.3: Facebook Pixel Integration](./shopify-app-phase5e3-fb-integration.md) to implement Facebook tracking capabilities.
