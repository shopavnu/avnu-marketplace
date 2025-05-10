# Phase 2B: Onboarding UI - Shipping Configuration

## Objectives

- Implement the shipping policy configuration UI
- Create shipping rate integration with Shopify
- Connect with Avnu's multi-merchant shipping aggregation
- Save shipping preferences to merchant's profile

## Timeline: Week 5 (Middle part of Phase 2)

## Tasks & Implementation Details

### 1. Create Remix Route for Shipping Setup

```typescript
// app/routes/app.onboarding.shipping.tsx

import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import {
  Page,
  Layout,
  LegacyCard,
  FormLayout,
  TextField,
  Banner,
  Text,
  Button,
  RadioButton,
  Stack,
  Box,
  Select,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

// Loader to fetch existing shipping data
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  try {
    // Fetch existing shipping data from Avnu backend
    const response = await fetch(
      `${process.env.AVNU_API_URL}/api/integrations/shopify/merchant/${session.shop}/shipping`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        }
      }
    );
    
    if (response.ok) {
      const shippingData = await response.json();
      return json({
        shop: session.shop,
        shippingData,
        errors: null
      });
    }
    
    return json({
      shop: session.shop,
      shippingData: null,
      errors: null
    });
  } catch (error) {
    console.error('Error fetching shipping data', error);
    return json({
      shop: session.shop,
      shippingData: null,
      errors: ['Failed to load existing shipping data']
    });
  }
};

// Action to save shipping configuration
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  // Process form data
  const mode = formData.get('mode');
  const threshold = formData.get('threshold') || null;
  const useShopifyRates = formData.get('useShopifyRates') === 'true';
  
  try {
    // Save shipping policy to Avnu backend
    const response = await fetch(
      `${process.env.AVNU_API_URL}/api/integrations/shopify/merchant/${session.shop}/shipping`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({
          mode,
          threshold: threshold ? parseFloat(threshold) : null,
          useShopifyRates
        })
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      return json({
        success: false,
        errors: errorData.errors || ['Failed to save shipping configuration']
      });
    }
    
    // Redirect to next step (returns policy)
    return redirect('/app/onboarding/returns');
  } catch (error) {
    console.error('Error saving shipping configuration', error);
    return json({
      success: false,
      errors: ['An unexpected error occurred']
    });
  }
};

// Component for shipping setup form
export default function ShippingSetup() {
  const { shop, shippingData, errors: loaderErrors } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  
  // Initialize state with existing data if available
  const [shippingMode, setShippingMode] = useState(
    shippingData?.mode || 'real_time_rates'
  );
  const [threshold, setThreshold] = useState(
    shippingData?.threshold?.toString() || '50'
  );
  const [useShopifyRates, setUseShopifyRates] = useState(
    shippingData?.useShopifyRates || true
  );
  
  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('mode', shippingMode);
    
    if (shippingMode === 'free_over_threshold') {
      formData.append('threshold', threshold);
    }
    
    formData.append('useShopifyRates', useShopifyRates.toString());
    
    submit(formData, { method: 'post' });
  };
  
  // Display errors if any
  const errors = loaderErrors || (actionData?.errors || []);
  
  return (
    <Page
      title="Configure Shipping"
      subtitle="Set up how shipping will be handled for your products on Avnu"
      backAction={{ url: "/app/onboarding/brand" }}
    >
      <Layout>
        {errors.length > 0 && (
          <Layout.Section>
            <Banner status="critical">
              <p>There were errors with your submission:</p>
              <ul>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Banner>
          </Layout.Section>
        )}
        
        <Layout.Section>
          <form onSubmit={handleSubmit}>
            <LegacyCard sectioned>
              <FormLayout>
                <Text variant="headingMd">Shipping Policy</Text>
                <Text variant="bodyMd" color="subdued">
                  Select how you want to handle shipping costs for your products on Avnu.
                  This will be shown to customers during checkout.
                </Text>
                
                <Stack vertical>
                  <RadioButton
                    label="Always offer free shipping"
                    helpText="All your products will ship for free"
                    checked={shippingMode === 'always_free'}
                    onChange={() => setShippingMode('always_free')}
                    id="always-free"
                  />
                  
                  <RadioButton
                    label="Free shipping over a threshold"
                    helpText="Free shipping when order value exceeds a certain amount"
                    checked={shippingMode === 'free_over_threshold'}
                    onChange={() => setShippingMode('free_over_threshold')}
                    id="free-over-threshold"
                  />
                  
                  {shippingMode === 'free_over_threshold' && (
                    <Box paddingInlineStart="8">
                      <TextField
                        label="Free shipping threshold"
                        type="number"
                        prefix="$"
                        value={threshold}
                        onChange={setThreshold}
                        autoComplete="off"
                        helpText="Orders above this amount qualify for free shipping"
                      />
                    </Box>
                  )}
                  
                  <RadioButton
                    label="Real-time shipping rates"
                    helpText="Calculate shipping rates based on customer location and order details"
                    checked={shippingMode === 'real_time_rates'}
                    onChange={() => setShippingMode('real_time_rates')}
                    id="real-time-rates"
                  />
                  
                  {shippingMode === 'real_time_rates' && (
                    <Box paddingInlineStart="8">
                      <Select
                        label="Shipping rate source"
                        options={[
                          { label: 'Use Shopify shipping rates', value: 'true' },
                          { label: 'Use fixed shipping rates', value: 'false' },
                        ]}
                        value={useShopifyRates.toString()}
                        onChange={(value) => setUseShopifyRates(value === 'true')}
                        helpText="Choose where to get your shipping rates from"
                      />
                    </Box>
                  )}
                </Stack>
                
                <Box paddingBlockStart="5">
                  <Button submit primary size="large">
                    Continue to Return Policy
                  </Button>
                </Box>
              </FormLayout>
            </LegacyCard>
          </form>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

### 2. Backend API for Shipping Configuration

Add shipping endpoints to the merchant controller:

```typescript
// Add to src/modules/integrations/shopify-app/controllers/shopify-merchant.controller.ts

@Get(':shop/shipping')
async getShippingPolicy(@Param('shop') shop: string) {
  return this.merchantService.getShippingPolicy(shop);
}

@Post(':shop/shipping')
async saveShippingPolicy(
  @Param('shop') shop: string,
  @Body() shippingData: {
    mode: 'always_free' | 'free_over_threshold' | 'real_time_rates';
    threshold?: number;
    useShopifyRates: boolean;
  }
) {
  return this.merchantService.saveShippingPolicy(shop, shippingData);
}
```

### 3. Update Merchant Service for Shipping

Add shipping methods to the merchant service:

```typescript
// Add to src/modules/integrations/shopify-app/services/shopify-merchant.service.ts

async getShippingPolicy(shop: string) {
  const connection = await this.merchantPlatformConnectionRepository.findOne({
    where: { platformStoreName: shop, platformType: 'SHOPIFY' }
  });
  
  if (!connection) {
    throw new NotFoundException(`No merchant found for shop ${shop}`);
  }
  
  return connection.shippingPolicy || {
    mode: 'real_time_rates',
    useShopifyRates: true
  };
}

async saveShippingPolicy(
  shop: string,
  shippingData: {
    mode: 'always_free' | 'free_over_threshold' | 'real_time_rates';
    threshold?: number;
    useShopifyRates: boolean;
  }
) {
  const connection = await this.merchantPlatformConnectionRepository.findOne({
    where: { platformStoreName: shop, platformType: 'SHOPIFY' }
  });
  
  if (!connection) {
    throw new NotFoundException(`No merchant found for shop ${shop}`);
  }
  
  // Update shipping policy
  connection.shippingPolicy = shippingData;
  
  // Update onboarding step
  connection.onboardingStep = 'returns';
  
  await this.merchantPlatformConnectionRepository.save(connection);
  
  // For real-time rates, we may need to register a carrier service with Shopify
  if (shippingData.mode === 'real_time_rates' && shippingData.useShopifyRates) {
    await this.registerCarrierService(shop);
  }
  
  return { success: true };
}

// Register a carrier service with Shopify for real-time rates
private async registerCarrierService(shop: string) {
  try {
    const connection = await this.merchantPlatformConnectionRepository.findOne({
      where: { platformStoreName: shop, platformType: 'SHOPIFY' }
    });
    
    if (!connection) {
      throw new NotFoundException(`No merchant found for shop ${shop}`);
    }
    
    const accessToken = connection.accessToken;
    
    // Use REST API to register carrier service (GraphQL doesn't support this)
    const endpoint = `/admin/api/2023-04/carrier_services.json`;
    const data = {
      carrier_service: {
        name: "Avnu Shipping",
        callback_url: `${this.configService.get('app.url')}/api/integrations/shopify/shipping/rates`,
        service_discovery: true
      }
    };
    
    // Make REST API request using your ShopifyClientService or direct HTTP call
    const url = `https://${shop}${endpoint}`;
    
    const response = await this.httpService.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      }
    }).toPromise();
    
    this.logger.log(`Registered carrier service for ${shop}`);
    
    return response.data;
  } catch (error) {
    this.logger.error(`Failed to register carrier service for ${shop}`, error);
    // Don't throw - this shouldn't block the onboarding flow
    // We can retry later or implement a background job
  }
}
```

### 4. Shipping Rate Calculator Endpoint

Create an endpoint to calculate shipping rates:

```typescript
// src/modules/integrations/shopify-app/controllers/shopify-shipping.controller.ts

import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { ShopifyShippingService } from '../services/shopify-shipping.service';

@Controller('api/integrations/shopify/shipping')
export class ShopifyShippingController {
  private readonly logger = new Logger(ShopifyShippingController.name);

  constructor(private readonly shippingService: ShopifyShippingService) {}

  @Post('rates')
  async calculateRates(
    @Headers('x-shopify-shop-domain') shop: string,
    @Body() data: any
  ) {
    this.logger.log(`Calculating shipping rates for ${shop}`);
    
    try {
      const rates = await this.shippingService.calculateRates(shop, data);
      return { rates };
    } catch (error) {
      this.logger.error(`Failed to calculate shipping rates for ${shop}`, error);
      
      // Return a fallback rate to avoid checkout failures
      return {
        rates: [
          {
            service_name: "Standard Shipping",
            service_code: "avnu_standard",
            total_price: "999", // $9.99 in cents
            description: "5-7 business days",
            currency: "USD"
          }
        ]
      };
    }
  }
}
```

### 5. Shipping Service Implementation

Create a service to handle shipping rate calculations:

```typescript
// src/modules/integrations/shopify-app/services/shopify-shipping.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantPlatformConnection } from '../../../entities/merchant-platform-connection.entity';
import { ShopifyClientService } from './shopify-client.service';

@Injectable()
export class ShopifyShippingService {
  private readonly logger = new Logger(ShopifyShippingService.name);

  constructor(
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
    private readonly shopifyClientService: ShopifyClientService,
  ) {}

  async calculateRates(shop: string, requestData: any) {
    // Get merchant connection
    const connection = await this.merchantPlatformConnectionRepository.findOne({
      where: { platformStoreName: shop, platformType: 'SHOPIFY' }
    });
    
    if (!connection) {
      throw new NotFoundException(`No merchant found for shop ${shop}`);
    }
    
    // Extract information from the request
    const { rate: rateRequest } = requestData;
    const { origin, destination, items } = rateRequest;
    
    // Check shipping policy
    const shippingPolicy = connection.shippingPolicy || {
      mode: 'real_time_rates',
      useShopifyRates: true
    };
    
    // Handle different shipping modes
    if (shippingPolicy.mode === 'always_free') {
      return [
        {
          service_name: "Free Shipping",
          service_code: "avnu_free",
          total_price: "0",
          description: "Free Shipping",
          currency: "USD"
        }
      ];
    }
    
    // Calculate order subtotal
    const subtotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * item.quantity);
    }, 0);
    
    // Check for free shipping threshold
    if (
      shippingPolicy.mode === 'free_over_threshold' && 
      subtotal >= (shippingPolicy.threshold || 0)
    ) {
      return [
        {
          service_name: "Free Shipping",
          service_code: "avnu_free_threshold",
          total_price: "0",
          description: `Free Shipping (Order over $${shippingPolicy.threshold})`,
          currency: "USD"
        }
      ];
    }
    
    // Use Shopify rates if enabled
    if (shippingPolicy.useShopifyRates) {
      return this.getShopifyRates(connection, rateRequest);
    }
    
    // Default to fixed rates
    return [
      {
        service_name: "Standard Shipping",
        service_code: "avnu_standard",
        total_price: "595", // $5.95 in cents
        description: "5-7 business days",
        currency: "USD"
      },
      {
        service_name: "Express Shipping",
        service_code: "avnu_express",
        total_price: "1495", // $14.95 in cents
        description: "2-3 business days",
        currency: "USD"
      }
    ];
  }
  
  private async getShopifyRates(connection: MerchantPlatformConnection, rateRequest: any) {
    // Implementation depends on your integration strategy
    // This might involve calling Shopify's Shipping API or
    // forwarding to merchant's existing carrier services
    
    // For simplicity, return fixed rates for now
    return [
      {
        service_name: "Standard Shipping",
        service_code: "shopify_standard",
        total_price: "795", // $7.95 in cents
        description: "5-7 business days",
        currency: "USD"
      },
      {
        service_name: "Express Shipping",
        service_code: "shopify_express",
        total_price: "1695", // $16.95 in cents
        description: "2-3 business days",
        currency: "USD"
      }
    ];
    
    // In a real implementation, you'd query Shopify or another service
    // to get actual rates based on the destination, weight, etc.
  }
}
```

### 6. Update Module Configuration

Add the shipping components to the Shopify module:

```typescript
// Update src/modules/integrations/shopify-app/shopify.module.ts

import { ShopifyShippingService } from './services/shopify-shipping.service';
import { ShopifyShippingController } from './controllers/shopify-shipping.controller';

@Module({
  imports: [
    // existing imports
  ],
  providers: [
    // existing providers
    ShopifyShippingService,
  ],
  controllers: [
    // existing controllers
    ShopifyShippingController,
  ],
  exports: [
    // existing exports
    ShopifyShippingService,
  ],
})
export class ShopifyModule {
  // existing configuration
}
```

## Dependencies & Prerequisites

- Completed Phase 2A (Brand Setup)
- Shopify Admin API access for carrier service registration
- HTTP service for API calls

## Testing Guidelines

1. **Shipping Form:**
   - Test different shipping mode selections
   - Verify threshold input validation for free shipping threshold
   - Test form submission for each shipping mode

2. **Carrier Service Registration:**
   - Verify successful registration with Shopify
   - Test error handling for registration failures

3. **Rate Calculation:**
   - Test rate responses for different shipping modes
   - Verify correct free shipping threshold behavior
   - Test fallback rates for error conditions

## Next Phase

Once the shipping configuration is implemented, proceed to [Phase 2C: Returns Policy and Product Selection](./shopify-app-phase2c-returns-products.md) to complete the onboarding UI.
