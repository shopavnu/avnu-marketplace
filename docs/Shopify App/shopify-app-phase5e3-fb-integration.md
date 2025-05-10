# Phase 5E-3.3: Analytics & Reporting - Facebook Pixel Integration

## Objectives

- Implement Facebook Pixel integration
- Support conversion tracking for e-commerce events
- Enable server-side tracking for improved accuracy

## Timeline: Week 28

## Tasks & Implementation Details

### 1. Facebook Pixel Provider Implementation

Create a provider for Facebook Pixel integration:

```typescript
// src/modules/integrations/providers/facebook-pixel.provider.ts

import { Injectable, Logger } from '@nestjs/common';
import { IIntegrationProvider, IntegrationConfig, IntegrationEvent } from '../interfaces/integration-provider.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FacebookPixelProvider implements IIntegrationProvider {
  readonly type = 'facebook_pixel';
  readonly name = 'Facebook Pixel';
  readonly description = 'Integration with Facebook Pixel for conversion tracking and audience building';
  readonly requiredCredentials = ['pixelId', 'accessToken'];

  private readonly logger = new Logger(FacebookPixelProvider.name);
  private configs = new Map<string, IntegrationConfig>();
  private readonly apiVersion = 'v18.0'; // Update to latest Facebook API version

  constructor(private readonly httpService: HttpService) {}

  /**
   * Initialize the provider with configuration
   */
  async initialize(config: IntegrationConfig): Promise<void> {
    this.configs.set(config.merchantId, config);
    this.logger.log(`Initialized Facebook Pixel provider for merchant ${config.merchantId}`);
  }

  /**
   * Validate Facebook Pixel credentials
   */
  async validateCredentials(credentials: Record<string, any>): Promise<boolean> {
    try {
      const { pixelId, accessToken } = credentials;
      
      if (!pixelId || !accessToken) {
        return false;
      }
      
      // Test the access token and pixel ID
      const url = `https://graph.facebook.com/${this.apiVersion}/${pixelId}?access_token=${accessToken}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url)
      );
      
      // If the request succeeds and returns a pixel object, the credentials are valid
      return response.status === 200 && response.data.id === pixelId;
    } catch (error) {
      this.logger.error(`Error validating Facebook Pixel credentials: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Track an event in Facebook Pixel
   */
  async trackEvent(event: IntegrationEvent): Promise<boolean> {
    try {
      // Get the configuration for this merchant
      const config = this.configs.get(event.merchantId);
      
      if (!config) {
        throw new Error(`No configuration found for merchant ${event.merchantId}`);
      }
      
      const { pixelId, accessToken } = config.credentials;
      
      // Transform the event to Facebook Pixel format
      const fbEvent = this.transformEvent(event);
      
      // Send the event to Facebook Conversion API
      const url = `https://graph.facebook.com/${this.apiVersion}/${pixelId}/events?access_token=${accessToken}`;
      
      const response = await firstValueFrom(
        this.httpService.post(url, {
          data: [fbEvent],
        })
      );
      
      return response.status === 200 && response.data.events_received > 0;
    } catch (error) {
      this.logger.error(`Error tracking event in Facebook Pixel: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Check if the provider is configured
   */
  isConfigured(config: IntegrationConfig): boolean {
    const { pixelId, accessToken } = config.credentials;
    return Boolean(pixelId && accessToken);
  }

  /**
   * Get default settings for the provider
   */
  getDefaultSettings(): Record<string, any> {
    return {
      sendUserData: true,
      eventMapping: {
        page_view: 'PageView',
        product_view: 'ViewContent',
        add_to_cart: 'AddToCart',
        checkout_begin: 'InitiateCheckout',
        purchase: 'Purchase',
      }
    };
  }

  /**
   * Transform an event to Facebook Pixel format
   */
  private transformEvent(event: IntegrationEvent): any {
    // Generate an event ID
    const eventId = this.generateEventId(event);
    
    // Base event
    const fbEvent: any = {
      event_name: this.mapEventName(event.eventType),
      event_time: Math.floor(new Date(event.timestamp).getTime() / 1000),
      event_id: eventId,
      event_source_url: event.data.url,
      action_source: 'website',
      user_data: this.extractUserData(event),
      custom_data: {},
    };
    
    // Add event-specific data
    switch (event.eventType) {
      case 'product_view':
        fbEvent.custom_data = {
          content_type: 'product',
          content_ids: [event.data.product_id],
          content_name: event.data.product_name,
          content_category: event.data.category,
          value: parseFloat(event.data.price) || 0,
          currency: event.data.currency || 'USD',
        };
        break;
      
      case 'add_to_cart':
        fbEvent.custom_data = {
          content_type: 'product',
          content_ids: [event.data.product_id],
          content_name: event.data.product_name,
          value: (parseFloat(event.data.price) || 0) * (parseInt(event.data.quantity) || 1),
          currency: event.data.currency || 'USD',
          contents: [
            {
              id: event.data.product_id,
              quantity: parseInt(event.data.quantity) || 1,
              item_price: parseFloat(event.data.price) || 0,
            }
          ],
        };
        break;
      
      case 'checkout_begin':
        fbEvent.custom_data = {
          content_type: 'product',
          content_ids: event.data.items?.map(item => item.product_id) || [],
          value: parseFloat(event.data.value) || 0,
          currency: event.data.currency || 'USD',
          contents: event.data.items?.map(item => ({
            id: item.product_id,
            quantity: parseInt(item.quantity) || 1,
            item_price: parseFloat(item.price) || 0,
          })) || [],
        };
        break;
      
      case 'purchase':
        fbEvent.custom_data = {
          content_type: 'product',
          content_ids: event.data.items?.map(item => item.product_id) || [],
          value: parseFloat(event.data.total) || 0,
          currency: event.data.currency || 'USD',
          contents: event.data.items?.map(item => ({
            id: item.product_id,
            quantity: parseInt(item.quantity) || 1,
            item_price: parseFloat(item.price) || 0,
          })) || [],
          order_id: event.data.order_id,
        };
        break;
      
      default:
        // For custom events, just pass through relevant data
        fbEvent.custom_data = {
          ...event.data,
          // Remove user-related fields that should be in user_data
          user_id: undefined,
          email: undefined,
          phone: undefined,
          firstName: undefined,
          lastName: undefined,
        };
    }
    
    return fbEvent;
  }

  /**
   * Extract user data for Facebook events
   */
  private extractUserData(event: IntegrationEvent): any {
    const userData: any = {};
    
    // Extract user identifiers
    if (event.userId) {
      userData.external_id = event.userId;
    }
    
    if (event.data.email) {
      userData.em = this.hashData(event.data.email.trim().toLowerCase());
    }
    
    if (event.data.phone) {
      userData.ph = this.hashData(this.normalizePhone(event.data.phone));
    }
    
    // Extract name if available
    if (event.data.firstName && event.data.lastName) {
      userData.fn = this.hashData(event.data.firstName.trim().toLowerCase());
      userData.ln = this.hashData(event.data.lastName.trim().toLowerCase());
    }
    
    // Client IP and user agent
    if (event.data.ip) {
      userData.client_ip_address = event.data.ip;
    }
    
    if (event.data.userAgent) {
      userData.client_user_agent = event.data.userAgent;
    }
    
    // Facebook click ID (fbc) and browser ID (fbp) if available
    if (event.data.fbc) {
      userData.fbc = event.data.fbc;
    }
    
    if (event.data.fbp) {
      userData.fbp = event.data.fbp;
    }
    
    return userData;
  }

  /**
   * Map internal event names to Facebook event names
   */
  private mapEventName(eventType: string): string {
    const defaultMapping = {
      page_view: 'PageView',
      product_view: 'ViewContent',
      add_to_cart: 'AddToCart',
      checkout_begin: 'InitiateCheckout',
      purchase: 'Purchase',
      sign_up: 'CompleteRegistration',
      search: 'Search',
    };
    
    return defaultMapping[eventType] || eventType;
  }

  /**
   * Generate a unique event ID
   */
  private generateEventId(event: IntegrationEvent): string {
    const timestamp = new Date(event.timestamp).getTime();
    const random = Math.floor(Math.random() * 1000000);
    return `${event.merchantId}_${event.eventType}_${timestamp}_${random}`;
  }

  /**
   * Normalize a phone number to E.164 format
   */
  private normalizePhone(phone: string): string {
    // Remove all non-digit characters
    let digits = phone.replace(/\D/g, '');
    
    // If no country code and length is 10, assume US and add +1
    if (digits.length === 10 && !phone.includes('+')) {
      return `+1${digits}`;
    }
    
    // If it starts with 00, replace with +
    if (digits.startsWith('00')) {
      return `+${digits.substring(2)}`;
    }
    
    // If it doesn't start with +, add it
    if (!phone.includes('+')) {
      return `+${digits}`;
    }
    
    return phone;
  }

  /**
   * Hash data for Facebook's requirements (SHA-256)
   */
  private hashData(data: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
```

### 2. Facebook Pixel Utility Functions

Create utilities for client-side pixel integration:

```typescript
// src/client/utils/fb-pixel.util.ts

/**
 * Initialize Facebook Pixel on the client side
 */
export const initFacebookPixel = (pixelId: string): void => {
  if (typeof window === 'undefined' || !pixelId) {
    return;
  }

  // Skip if the pixel is already initialized
  if ((window as any).fbq) {
    return;
  }

  // Initialize the pixel
  (window as any).fbq = function() {
    (window as any).fbq.callMethod ?
      (window as any).fbq.callMethod.apply((window as any).fbq, arguments) :
      (window as any).fbq.queue.push(arguments);
  };

  // Set up the queue if it doesn't exist
  if (!(window as any)._fbq) {
    (window as any)._fbq = (window as any).fbq;
  }
  (window as any).fbq.push = (window as any).fbq;
  (window as any).fbq.loaded = true;
  (window as any).fbq.version = '2.0';
  (window as any).fbq.queue = [];

  // Add the pixel script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  // Initialize the pixel with the provided ID
  (window as any).fbq('init', pixelId);
};

/**
 * Track an event with Facebook Pixel
 */
export const trackFacebookEvent = (
  eventName: string,
  params?: Record<string, any>
): void => {
  if (typeof window === 'undefined' || !(window as any).fbq) {
    return;
  }

  (window as any).fbq('track', eventName, params);
};

/**
 * Get the Facebook browser ID (fbp)
 */
export const getFacebookBrowserId = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  // Check for the _fbp cookie
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === '_fbp') {
      return value;
    }
  }

  return null;
};

/**
 * Get the Facebook click ID (fbc)
 */
export const getFacebookClickId = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  // Check for the _fbc cookie
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === '_fbc') {
      return value;
    }
  }

  // If no cookie, check the URL for fbclid
  const urlParams = new URLSearchParams(window.location.search);
  const fbclid = urlParams.get('fbclid');
  
  if (fbclid) {
    // Format as a proper fbc value
    const now = Math.floor(Date.now() / 1000);
    return `fb.1.${now}.${fbclid}`;
  }

  return null;
};
```

### 3. Facebook Pixel Setup Component

Create a React component for setting up Facebook Pixel integration:

```tsx
// src/client/components/integrations/FacebookPixelSetup.tsx

import React, { useState } from 'react';
import { Form, Input, Button, Card, Switch, Alert, Divider, Collapse } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { apiClient } from '../../services/api-client';

const { Panel } = Collapse;

interface FacebookPixelSetupProps {
  existingConfig?: any;
  onComplete?: (config: any) => void;
}

export const FacebookPixelSetup: React.FC<FacebookPixelSetupProps> = ({
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
        pixelId: existingConfig.credentials.pixelId,
        accessToken: existingConfig.credentials.accessToken,
        sendUserData: existingConfig.settings?.sendUserData || true,
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
        providerType: 'facebook_pixel',
        credentials: {
          pixelId: values.pixelId,
          accessToken: values.accessToken,
        },
        settings: {
          sendUserData: values.sendUserData,
          eventMapping: values.eventMapping || {
            page_view: 'PageView',
            product_view: 'ViewContent',
            add_to_cart: 'AddToCart',
            checkout_begin: 'InitiateCheckout',
            purchase: 'Purchase',
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
      setError(err.response?.data?.message || 'Failed to save Facebook Pixel configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Facebook Pixel Setup">
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
          description="Facebook Pixel integration was successfully configured and tested."
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
          sendUserData: true,
        }}
      >
        <Form.Item
          name="pixelId"
          label="Pixel ID"
          tooltip="Your Facebook Pixel ID"
          rules={[{ required: true, message: 'Please enter your Pixel ID' }]}
        >
          <Input placeholder="123456789012345" />
        </Form.Item>
        
        <Form.Item
          name="accessToken"
          label="Access Token"
          tooltip="Your Facebook API Access Token with ads_management permission"
          rules={[{ required: true, message: 'Please enter your Access Token' }]}
        >
          <Input.Password placeholder="Access Token" />
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
            <Panel header="Data Settings" key="data-settings">
              <Form.Item
                name="sendUserData"
                valuePropName="checked"
                label="Send User Data"
                tooltip="Send hashed user data for better conversion matching"
              >
                <Switch />
              </Form.Item>
              
              <Alert
                message="Note about Data Privacy"
                description="User data is hashed before being sent to Facebook in accordance with their requirements. Make sure your privacy policy covers this data sharing."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            </Panel>
            
            <Panel header="Event Mapping" key="event-mapping">
              <p>Map Avnu event types to Facebook Pixel event types</p>
              
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
                          name={[field.name, 'fbEvent']}
                          style={{ width: '50%' }}
                        >
                          <Input placeholder="Facebook Event Name" />
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

### 4. Client-Side Pixel Integration Component

Create a component to handle client-side Facebook Pixel integration:

```tsx
// src/client/components/integrations/FacebookPixelTracker.tsx

import React, { useEffect } from 'react';
import { initFacebookPixel, trackFacebookEvent } from '../../utils/fb-pixel.util';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface FacebookPixelTrackerProps {
  children: React.ReactNode;
}

export const FacebookPixelTracker: React.FC<FacebookPixelTrackerProps> = ({ children }) => {
  const integrations = useSelector((state: RootState) => state.integrations.items);
  
  useEffect(() => {
    // Find the Facebook Pixel integration if it exists
    const fbPixelIntegration = integrations.find(
      integration => integration.providerType === 'facebook_pixel' && integration.isEnabled
    );
    
    if (fbPixelIntegration) {
      // Initialize the pixel
      const pixelId = fbPixelIntegration.credentials.pixelId;
      initFacebookPixel(pixelId);
      
      // Track initial page view
      trackFacebookEvent('PageView');
    }
  }, [integrations]);
  
  return <>{children}</>;
};

// Custom hook for tracking Facebook events
export const useFacebookPixel = () => {
  const integrations = useSelector((state: RootState) => state.integrations.items);
  
  const trackEvent = (eventName: string, params?: Record<string, any>) => {
    // Find the Facebook Pixel integration if it exists
    const fbPixelIntegration = integrations.find(
      integration => integration.providerType === 'facebook_pixel' && integration.isEnabled
    );
    
    if (fbPixelIntegration) {
      // Track the event
      trackFacebookEvent(eventName, params);
    }
  };
  
  return {
    trackEvent,
  };
};
```

### 5. Enhancing the App Component with Pixel Integration

Update the main App component to include the Facebook Pixel Tracker:

```tsx
// src/client/App.tsx

import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AppLayout } from './components/layout/AppLayout';
import { Routes } from './routes';
import { FacebookPixelTracker } from './components/integrations/FacebookPixelTracker';
import { IntegrationsProvider } from './providers/IntegrationsProvider';

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <IntegrationsProvider>
        <FacebookPixelTracker>
          <Router>
            <AppLayout>
              <Routes />
            </AppLayout>
          </Router>
        </FacebookPixelTracker>
      </IntegrationsProvider>
    </Provider>
  );
};
```

## Dependencies & Prerequisites

- Completed Phase 5E-3.1 (Integration Framework)
- Facebook Pixel ID and access token
- HttpService for making API calls to Facebook
- Client-side scripts for browser tracking

## Testing Guidelines

1. **Server-Side Tracking:**
   - Test server-side event tracking via the Conversion API
   - Verify proper data formatting and hashing

2. **Client-Side Tracking:**
   - Test client-side pixel initialization
   - Verify events are properly tracked in the browser

3. **User Data Handling:**
   - Test proper hashing of sensitive user data
   - Verify compliance with Facebook's data requirements

## Next Phase

Continue to [Phase 5E-3.4: Data Warehouse Integrations](./shopify-app-phase5e3-data-warehouse.md) to implement connections with data warehousing solutions.
