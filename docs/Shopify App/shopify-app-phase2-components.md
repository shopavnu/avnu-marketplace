# Phase 2: Shared Components & Services

## Objectives

- Create reusable components for the onboarding experience
- Implement validation services for data integrity
- Add draft-saving functionality for all onboarding steps

## Timeline: Throughout Weeks 3-7 (Supporting Phase 2A-2D)

## Tasks & Implementation Details

### 1. Onboarding Progress Indicator

Create a shared component to display the merchant's progress through the onboarding process:

```typescript
// app/components/OnboardingProgress.tsx

import React from "react";
import { ProgressBar, LegacyStack, Text } from "@shopify/polaris";

export function OnboardingProgress({ currentStep }) {
  const steps = ["brand", "shipping", "returns", "products", "submitted"];
  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;
  
  return (
    <LegacyStack vertical spacing="tight">
      <Text variant="bodyMd">Onboarding Progress: {Math.round(progress)}%</Text>
      <ProgressBar progress={progress} size="small" />
      <LegacyStack distribution="equalSpacing">
        <Text variant="bodyMd" color={currentIndex >= 0 ? "success" : "subdued"}>Brand</Text>
        <Text variant="bodyMd" color={currentIndex >= 1 ? "success" : "subdued"}>Shipping</Text>
        <Text variant="bodyMd" color={currentIndex >= 2 ? "success" : "subdued"}>Returns</Text>
        <Text variant="bodyMd" color={currentIndex >= 3 ? "success" : "subdued"}>Products</Text>
        <Text variant="bodyMd" color={currentIndex >= 4 ? "success" : "subdued"}>Complete</Text>
      </LegacyStack>
    </LegacyStack>
  );
}
```

### 2. Validation Service

Create a validation service to ensure data integrity across all onboarding steps:

```typescript
// src/modules/integrations/shopify-app/services/validation.service.ts

import { Injectable, BadRequestException, Logger } from '@nestjs/common';

@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);

  validateBrandInfo(brandData: any): void {
    if (!brandData) {
      throw new BadRequestException('Brand information is required');
    }
    
    if (!brandData.about || brandData.about.trim().length < 10) {
      throw new BadRequestException('Brand description must be at least 10 characters');
    }
    
    if (!brandData.location) {
      throw new BadRequestException('Brand location is required');
    }
    
    // Logo and hero image validations
    if (brandData.logoUrl && !this.isValidUrl(brandData.logoUrl)) {
      throw new BadRequestException('Invalid logo URL format');
    }
    
    if (brandData.heroUrl && !this.isValidUrl(brandData.heroUrl)) {
      throw new BadRequestException('Invalid hero image URL format');
    }
    
    this.logger.log('Brand information validated successfully');
  }
  
  validateShippingPolicy(shippingData: any): void {
    if (!shippingData) {
      throw new BadRequestException('Shipping policy is required');
    }
    
    if (!['always_free', 'free_over_threshold', 'real_time_rates'].includes(shippingData.mode)) {
      throw new BadRequestException('Invalid shipping mode');
    }
    
    // Check threshold for free shipping over threshold
    if (shippingData.mode === 'free_over_threshold') {
      if (typeof shippingData.threshold !== 'number' || shippingData.threshold <= 0) {
        throw new BadRequestException('Free shipping threshold must be a positive number');
      }
    }
    
    this.logger.log('Shipping policy validated successfully');
  }
  
  validateReturnsPolicy(returnsData: any): void {
    if (!returnsData) {
      throw new BadRequestException('Returns policy is required');
    }
    
    if (!['standard', 'custom', 'no_returns'].includes(returnsData.policyType)) {
      throw new BadRequestException('Invalid returns policy type');
    }
    
    // Standard policy validations
    if (returnsData.policyType === 'standard') {
      if (typeof returnsData.returnWindow !== 'number' || returnsData.returnWindow < 1) {
        throw new BadRequestException('Return window must be at least 1 day');
      }
      
      if (typeof returnsData.restockingFee !== 'number' || returnsData.restockingFee < 0 || returnsData.restockingFee > 100) {
        throw new BadRequestException('Restocking fee must be between 0 and 100 percent');
      }
      
      if (!returnsData.acceptedConditions || returnsData.acceptedConditions.length === 0) {
        throw new BadRequestException('At least one accepted return condition is required');
      }
    }
    
    // Custom policy validations
    if (returnsData.policyType === 'custom' && (!returnsData.customPolicy || returnsData.customPolicy.trim().length < 10)) {
      throw new BadRequestException('Custom return policy must be at least 10 characters');
    }
    
    this.logger.log('Returns policy validated successfully');
  }
  
  validateProductSelection(productIds: string[]): void {
    if (!productIds || productIds.length === 0) {
      throw new BadRequestException('At least one product must be selected');
    }
    
    // Validate product ID format
    for (const id of productIds) {
      if (!id.startsWith('gid://shopify/Product/')) {
        throw new BadRequestException(`Invalid product ID format: ${id}`);
      }
    }
    
    this.logger.log(`Product selection validated successfully: ${productIds.length} products`);
  }
  
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }
}
```

### 3. Draft Saving Functionality

Create components and API endpoints to allow merchants to save drafts and continue later:

```typescript
// App component for draft saving button
// app/components/DraftSaveButton.tsx

import React, { useState } from 'react';
import { Button, Toast } from '@shopify/polaris';
import { SaveMinor } from '@shopify/polaris-icons';

export function DraftSaveButton({ onSave }) {
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <>
      <Button 
        icon={SaveMinor}
        onClick={handleSave}
        loading={isSaving}
        accessibilityLabel="Save draft"
      >
        Save Draft
      </Button>
      
      {showToast && (
        <Toast
          content="Draft saved successfully"
          onDismiss={() => setShowToast(false)}
          duration={3000}
        />
      )}
    </>
  );
}
```

Backend endpoint extensions for draft saving:

```typescript
// Add to src/modules/integrations/shopify-app/controllers/shopify-merchant.controller.ts

@Post(':shop/brand/draft')
async saveBrandDraft(
  @Param('shop') shop: string,
  @Body() brandData: any
) {
  return this.merchantService.saveBrandDraft(shop, brandData);
}

@Post(':shop/shipping/draft')
async saveShippingDraft(
  @Param('shop') shop: string,
  @Body() shippingData: any
) {
  return this.merchantService.saveShippingDraft(shop, shippingData);
}

@Post(':shop/returns/draft')
async saveReturnsDraft(
  @Param('shop') shop: string,
  @Body() returnsData: any
) {
  return this.merchantService.saveReturnsDraft(shop, returnsData);
}

@Post(':shop/products/draft')
async saveProductsDraft(
  @Param('shop') shop: string,
  @Body() data: { productIds: string[] }
) {
  return this.merchantService.saveProductsDraft(shop, data.productIds);
}
```

Service methods for draft saving:

```typescript
// Add to src/modules/integrations/shopify-app/services/shopify-merchant.service.ts

async saveBrandDraft(shop: string, brandData: any): Promise<any> {
  const connection = await this.merchantPlatformConnectionRepository.findOne({
    where: { platformStoreName: shop, platformType: 'SHOPIFY' }
  });
  
  if (!connection) {
    throw new NotFoundException(`No merchant found for shop ${shop}`);
  }
  
  // Store brand information without validating it
  connection.brandInformation = brandData;
  
  // Save without changing the onboarding step
  await this.merchantPlatformConnectionRepository.save(connection);
  
  return { success: true, message: 'Brand draft saved successfully' };
}

// Implement similar methods for other draft endpoints
```

### 4. Admin Approval Interface

Create an interface for Avnu administrators to review merchant applications:

```typescript
// app/routes/admin.merchant-approval.tsx

import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useState } from "@remix-run/react";
import {
  Page, Layout, LegacyCard, ResourceList, ResourceItem,
  Badge, ButtonGroup, Button, Modal, TextContainer, TextField
} from "@shopify/polaris";
import { authenticate } from "../admin.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  
  try {
    // Fetch pending merchant applications from Avnu API
    const response = await fetch(
      `${process.env.AVNU_API_URL}/api/admin/merchants/pending`,
      {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${admin.accessToken}` }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch merchant applications');
    }
    
    const data = await response.json();
    
    return json({
      merchants: data.merchants,
      errors: null
    });
  } catch (error) {
    console.error('Error fetching merchant applications', error);
    return json({
      merchants: [],
      errors: ['Failed to load merchant applications']
    });
  }
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const merchantId = formData.get('merchantId');
  const action = formData.get('action');
  const reason = formData.get('reason') || '';
  
  try {
    // Submit approval or rejection
    const response = await fetch(
      `${process.env.AVNU_API_URL}/api/admin/merchants/${merchantId}/${action}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.accessToken}`
        },
        body: JSON.stringify({ reason })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to ${action} merchant`);
    }
    
    return json({
      success: true,
      message: `Merchant ${action === 'approve' ? 'approved' : 'declined'} successfully`
    });
  } catch (error) {
    console.error(`Error ${action}ing merchant`, error);
    return json({
      success: false,
      errors: [`Failed to ${action} merchant: ${error.message}`]
    });
  }
};

export default function MerchantApproval() {
  const { merchants, errors } = useLoaderData();
  const submit = useSubmit();
  
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [modalAction, setModalAction] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  
  // Handle approval
  const handleApprove = (merchant) => {
    setSelectedMerchant(merchant);
    setModalAction('approve');
  };
  
  // Handle decline
  const handleDecline = (merchant) => {
    setSelectedMerchant(merchant);
    setModalAction('decline');
    setDeclineReason('');
  };
  
  // Confirm action
  const handleConfirm = () => {
    const formData = new FormData();
    formData.append('merchantId', selectedMerchant.id);
    formData.append('action', modalAction);
    
    if (modalAction === 'decline') {
      formData.append('reason', declineReason);
    }
    
    submit(formData, { method: 'post' });
    setSelectedMerchant(null);
  };
  
  return (
    <Page title="Merchant Approval">
      <Layout>
        {errors && (
          <Layout.Section>
            <Banner status="critical">
              <p>There were errors:</p>
              <ul>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Banner>
          </Layout.Section>
        )}
        
        <Layout.Section>
          <LegacyCard>
            <ResourceList
              resourceName={{ singular: 'merchant', plural: 'merchants' }}
              items={merchants}
              renderItem={(merchant) => {
                const { id, shopName, onboardingSubmittedAt, productCount } = merchant;
                
                return (
                  <ResourceItem
                    id={id}
                    onClick={() => {}}
                    accessibilityLabel={`View details for ${shopName}`}
                  >
                    <h3>{shopName}</h3>
                    <div>Submitted: {new Date(onboardingSubmittedAt).toLocaleDateString()}</div>
                    <div>Products: {productCount}</div>
                    <div>
                      <Badge>Pending Review</Badge>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <ButtonGroup>
                        <Button onClick={() => handleApprove(merchant)}>Approve</Button>
                        <Button destructive onClick={() => handleDecline(merchant)}>Decline</Button>
                        <Button url={`/admin/merchants/${id}`}>View Details</Button>
                      </ButtonGroup>
                    </div>
                  </ResourceItem>
                );
              }}
            />
          </LegacyCard>
        </Layout.Section>
      </Layout>
      
      {/* Approval confirmation modal */}
      {selectedMerchant && modalAction === 'approve' && (
        <Modal
          open={true}
          onClose={() => setSelectedMerchant(null)}
          title="Approve Merchant"
          primaryAction={{
            content: 'Approve',
            onAction: handleConfirm,
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: () => setSelectedMerchant(null),
            },
          ]}
        >
          <Modal.Section>
            <TextContainer>
              <p>
                Are you sure you want to approve {selectedMerchant.shopName}?
                This will publish their products to the Avnu Marketplace.
              </p>
            </TextContainer>
          </Modal.Section>
        </Modal>
      )}
      
      {/* Decline confirmation modal */}
      {selectedMerchant && modalAction === 'decline' && (
        <Modal
          open={true}
          onClose={() => setSelectedMerchant(null)}
          title="Decline Merchant"
          primaryAction={{
            content: 'Decline',
            onAction: handleConfirm,
            destructive: true
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: () => setSelectedMerchant(null),
            },
          ]}
        >
          <Modal.Section>
            <TextContainer>
              <p>
                Are you sure you want to decline {selectedMerchant.shopName}?
              </p>
              <TextField
                label="Reason for declining (will be sent to the merchant)"
                value={declineReason}
                onChange={setDeclineReason}
                multiline={3}
                autoComplete="off"
              />
            </TextContainer>
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
}
```

## Dependencies & Prerequisites

- Polaris component library for UI elements
- Existing merchant service implementation
- Access control for admin routes

## Integration with Phase 2A-2D

Add these components to each of the onboarding pages:

1. **Include the Progress Indicator:**
   ```tsx
   // Add this import to each onboarding page
   import { OnboardingProgress } from "../../components/OnboardingProgress";
   
   // Add this to the page layout
   <Layout.Section>
     <LegacyCard sectioned>
       <OnboardingProgress currentStep="brand" /> {/* Update step for each page */}
     </LegacyCard>
   </Layout.Section>
   ```

2. **Add Draft Save Button:**
   ```tsx
   // Add this import to each onboarding page
   import { DraftSaveButton } from "../../components/DraftSaveButton";
   
   // Add this to the page layout (typically near the primary button)
   <LegacyStack>
     <DraftSaveButton onSave={handleSaveDraft} />
     <Button primary submit>Continue</Button>
   </LegacyStack>
   ```

3. **Implement Draft Save Handlers:**
   ```tsx
   // Add this function to each page component
   const handleSaveDraft = () => {
     const formData = new FormData();
     
     // Add required form data for the specific page
     // ...
     
     // Submit to the draft endpoint
     return submit(formData, { 
       method: 'post',
       action: `/api/integrations/shopify/merchant/${shop}/brand/draft`
     });
   };
   ```

## Testing Guidelines

1. **Component Testing:**
   - Test OnboardingProgress renders correctly for each step
   - Verify DraftSaveButton triggers appropriate actions

2. **Validation Service:**
   - Test each validation method with valid and invalid data
   - Verify appropriate error messages are returned

3. **Admin Interface:**
   - Test approval and decline workflows
   - Verify emails are sent to merchants on status change

4. **Integration Testing:**
   - Verify draft saving works across page reloads
   - Test the complete onboarding flow with these components
