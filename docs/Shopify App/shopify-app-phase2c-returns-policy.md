# Phase 2C: Onboarding UI - Returns Policy

## Objectives

- Implement the returns policy configuration UI
- Enable merchants to define their return terms and conditions
- Save return policy preferences to merchant profile
- Create a structured format for displaying return policies to customers

## Timeline: Week 6 (Part 3 of Phase 2)

## Tasks & Implementation Details

### 1. Create Remix Route for Returns Policy Setup

```typescript
// app/routes/app.onboarding.returns.tsx

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
  ChoiceList,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

// Loader to fetch existing returns data
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  try {
    // Fetch existing returns data from Avnu backend
    const response = await fetch(
      `${process.env.AVNU_API_URL}/api/integrations/shopify/merchant/${session.shop}/returns`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        }
      }
    );
    
    if (response.ok) {
      const returnsData = await response.json();
      return json({
        shop: session.shop,
        returnsData,
        errors: null
      });
    }
    
    return json({
      shop: session.shop,
      returnsData: null,
      errors: null
    });
  } catch (error) {
    console.error('Error fetching returns data', error);
    return json({
      shop: session.shop,
      returnsData: null,
      errors: ['Failed to load existing returns data']
    });
  }
};

// Action to save returns policy
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  // Process form data
  const policyType = formData.get('policyType');
  const returnWindow = formData.get('returnWindow') || '30';
  const restockingFee = formData.get('restockingFee') || '0';
  const acceptedConditions = formData.getAll('acceptedConditions');
  const customPolicy = formData.get('customPolicy') || '';
  
  try {
    // Save returns policy to Avnu backend
    const response = await fetch(
      `${process.env.AVNU_API_URL}/api/integrations/shopify/merchant/${session.shop}/returns`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({
          policyType,
          returnWindow: parseInt(returnWindow, 10),
          restockingFee: parseFloat(restockingFee),
          acceptedConditions: Array.from(acceptedConditions),
          customPolicy
        })
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      return json({
        success: false,
        errors: errorData.errors || ['Failed to save returns policy']
      });
    }
    
    // Redirect to next step (product selection)
    return redirect('/app/onboarding/products');
  } catch (error) {
    console.error('Error saving returns policy', error);
    return json({
      success: false,
      errors: ['An unexpected error occurred']
    });
  }
};

// Component for returns policy setup form
export default function ReturnsSetup() {
  const { shop, returnsData, errors: loaderErrors } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  
  // Initialize state with existing data if available
  const [policyType, setPolicyType] = useState(
    returnsData?.policyType || 'standard'
  );
  const [returnWindow, setReturnWindow] = useState(
    returnsData?.returnWindow?.toString() || '30'
  );
  const [restockingFee, setRestockingFee] = useState(
    returnsData?.restockingFee?.toString() || '0'
  );
  const [acceptedConditions, setAcceptedConditions] = useState(
    returnsData?.acceptedConditions || ['unused', 'original_packaging']
  );
  const [customPolicy, setCustomPolicy] = useState(
    returnsData?.customPolicy || ''
  );
  
  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('policyType', policyType);
    
    if (policyType === 'standard') {
      formData.append('returnWindow', returnWindow);
      formData.append('restockingFee', restockingFee);
      
      // Add accepted conditions
      acceptedConditions.forEach(condition => {
        formData.append('acceptedConditions', condition);
      });
    } else if (policyType === 'custom') {
      formData.append('customPolicy', customPolicy);
    } else if (policyType === 'no_returns') {
      // No additional fields needed
    }
    
    submit(formData, { method: 'post' });
  };
  
  // Handle condition selection change
  const handleConditionsChange = (selected) => {
    setAcceptedConditions(selected);
  };
  
  // Display errors if any
  const errors = loaderErrors || (actionData?.errors || []);
  
  return (
    <Page
      title="Return Policy"
      subtitle="Set up how product returns will be handled on Avnu"
      backAction={{ url: "/app/onboarding/shipping" }}
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
                <Text variant="headingMd">Return & Refund Policy</Text>
                <Text variant="bodyMd" color="subdued">
                  Choose how you want to handle product returns on Avnu.
                  This will be shown to customers during the purchase process.
                </Text>
                
                <Stack vertical>
                  <RadioButton
                    label="Standard return policy"
                    helpText="Configure a standard return policy with customizable time window and conditions"
                    checked={policyType === 'standard'}
                    onChange={() => setPolicyType('standard')}
                    id="standard-policy"
                  />
                  
                  {policyType === 'standard' && (
                    <Box paddingInlineStart="8">
                      <FormLayout>
                        <TextField
                          label="Return window (days)"
                          type="number"
                          value={returnWindow}
                          onChange={setReturnWindow}
                          autoComplete="off"
                          helpText="Number of days customers have to initiate a return"
                        />
                        
                        <TextField
                          label="Restocking fee (%)"
                          type="number"
                          value={restockingFee}
                          onChange={setRestockingFee}
                          autoComplete="off"
                          helpText="Percentage fee charged for returns (0 for no fee)"
                          suffix="%"
                        />
                        
                        <ChoiceList
                          title="Accepted return conditions"
                          choices={[
                            {label: 'Unused with tags attached', value: 'unused'},
                            {label: 'Original packaging required', value: 'original_packaging'},
                            {label: 'Slightly used/worn acceptable', value: 'slightly_used'},
                            {label: 'Defective items only', value: 'defective_only'}
                          ]}
                          selected={acceptedConditions}
                          onChange={handleConditionsChange}
                          allowMultiple
                        />
                      </FormLayout>
                    </Box>
                  )}
                  
                  <RadioButton
                    label="Custom return policy"
                    helpText="Write your own return policy in free text format"
                    checked={policyType === 'custom'}
                    onChange={() => setPolicyType('custom')}
                    id="custom-policy"
                  />
                  
                  {policyType === 'custom' && (
                    <Box paddingInlineStart="8">
                      <TextField
                        label="Your custom return policy"
                        multiline={6}
                        value={customPolicy}
                        onChange={setCustomPolicy}
                        autoComplete="off"
                        placeholder="Enter your complete return policy text here..."
                        helpText="This will be displayed exactly as written on product and checkout pages"
                      />
                    </Box>
                  )}
                  
                  <RadioButton
                    label="All sales final (no returns)"
                    helpText="Customers will not be able to return items from your store"
                    checked={policyType === 'no_returns'}
                    onChange={() => setPolicyType('no_returns')}
                    id="no-returns"
                  />
                </Stack>
                
                <Box paddingBlockStart="5">
                  <Button submit primary size="large">
                    Continue to Product Selection
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

### 2. Backend API for Returns Policy

Add returns policy endpoints to the merchant controller:

```typescript
// Add to src/modules/integrations/shopify-app/controllers/shopify-merchant.controller.ts

@Get(':shop/returns')
async getReturnsPolicy(@Param('shop') shop: string) {
  return this.merchantService.getReturnsPolicy(shop);
}

@Post(':shop/returns')
async saveReturnsPolicy(
  @Param('shop') shop: string,
  @Body() returnsData: {
    policyType: 'standard' | 'custom' | 'no_returns';
    returnWindow?: number;
    restockingFee?: number;
    acceptedConditions?: string[];
    customPolicy?: string;
  }
) {
  return this.merchantService.saveReturnsPolicy(shop, returnsData);
}
```

### 3. Update Merchant Service for Returns Policy

Add returns policy methods to the merchant service:

```typescript
// Add to src/modules/integrations/shopify-app/services/shopify-merchant.service.ts

async getReturnsPolicy(shop: string) {
  const connection = await this.merchantPlatformConnectionRepository.findOne({
    where: { platformStoreName: shop, platformType: 'SHOPIFY' }
  });
  
  if (!connection) {
    throw new NotFoundException(`No merchant found for shop ${shop}`);
  }
  
  return connection.returnsPolicy || {
    policyType: 'standard',
    returnWindow: 30,
    restockingFee: 0,
    acceptedConditions: ['unused', 'original_packaging']
  };
}

async saveReturnsPolicy(
  shop: string,
  returnsData: {
    policyType: 'standard' | 'custom' | 'no_returns';
    returnWindow?: number;
    restockingFee?: number;
    acceptedConditions?: string[];
    customPolicy?: string;
  }
) {
  const connection = await this.merchantPlatformConnectionRepository.findOne({
    where: { platformStoreName: shop, platformType: 'SHOPIFY' }
  });
  
  if (!connection) {
    throw new NotFoundException(`No merchant found for shop ${shop}`);
  }
  
  // Validate data based on policy type
  if (returnsData.policyType === 'standard') {
    // Ensure valid return window (default to 30 days if not provided)
    if (!returnsData.returnWindow || returnsData.returnWindow < 0) {
      returnsData.returnWindow = 30;
    }
    
    // Ensure valid restocking fee (default to 0% if not provided)
    if (returnsData.restockingFee === undefined || returnsData.restockingFee < 0) {
      returnsData.restockingFee = 0;
    } else if (returnsData.restockingFee > 100) {
      returnsData.restockingFee = 100; // Cap at 100%
    }
    
    // Ensure at least one accepted condition
    if (!returnsData.acceptedConditions || returnsData.acceptedConditions.length === 0) {
      returnsData.acceptedConditions = ['unused'];
    }
  } else if (returnsData.policyType === 'custom') {
    // Ensure custom policy text is provided
    if (!returnsData.customPolicy || returnsData.customPolicy.trim().length === 0) {
      throw new BadRequestException('Custom policy text is required');
    }
  }
  
  // Update returns policy
  connection.returnsPolicy = returnsData;
  
  // Update onboarding step
  connection.onboardingStep = 'products';
  
  await this.merchantPlatformConnectionRepository.save(connection);
  
  return { success: true };
}
```

### 4. Entity Updates for Returns Policy

Update the `MerchantPlatformConnection` entity to include returns policy:

```typescript
// Update src/modules/entities/merchant-platform-connection.entity.ts

@Entity('merchant_platform_connections')
export class MerchantPlatformConnection {
  // Existing columns...

  @Column('jsonb', { nullable: true })
  brandInformation: {
    about: string;
    location: string;
    causes: string[];
    logoUrl: string;
    heroUrl: string;
  };

  @Column('jsonb', { nullable: true })
  shippingPolicy: {
    mode: 'always_free' | 'free_over_threshold' | 'real_time_rates';
    threshold?: number;
    useShopifyRates?: boolean;
  };

  @Column('jsonb', { nullable: true })
  returnsPolicy: {
    policyType: 'standard' | 'custom' | 'no_returns';
    returnWindow?: number;
    restockingFee?: number;
    acceptedConditions?: string[];
    customPolicy?: string;
  };

  @Column('enum', { 
    enum: ['pending', 'brand', 'shipping', 'returns', 'products', 'submitted', 'approved', 'rejected'],
    default: 'pending'
  })
  onboardingStep: string;

  // Additional columns...
}
```

## Dependencies & Prerequisites

- Completed Phase 2B (Shipping Setup)
- Database schema with returns policy fields

## Testing Guidelines

1. **Returns Policy Form:**
   - Test different policy type selections
   - Verify validation for standard policy fields
   - Test custom policy text field
   - Test persistence of returns data

2. **Navigation Flow:**
   - Verify that back navigation works correctly
   - Verify that forward navigation works when policy is saved
   - Test that the onboarding step is correctly updated

3. **Data Validation:**
   - Test boundary conditions for return window and restocking fee
   - Verify proper error handling for missing required fields
   - Test acceptance of multiple conditions

## Next Steps

After implementing the returns policy setup, the next step is to create the [Product Selection interface](./shopify-app-phase2d-product-selection.md) where merchants can choose which products to list on Avnu.
