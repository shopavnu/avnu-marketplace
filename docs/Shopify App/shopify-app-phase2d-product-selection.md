# Phase 2D: Onboarding UI - Product Selection

## Objectives

- Implement the product selection interface for merchants
- Enable merchants to choose which products to list on Avnu Marketplace
- Create a bulk product synchronization workflow
- Save product selections and submit the onboarding for approval

## Timeline: Week 7 (Final part of Phase 2)

## Tasks & Implementation Details

### 1. Create Remix Route for Product Selection

```typescript
// app/routes/app.onboarding.products.tsx

import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit, Form } from "@remix-run/react";
import { useState, useCallback, useEffect } from "react";
import {
  Page,
  Layout,
  LegacyCard,
  ResourceList,
  ResourceItem,
  Text,
  Button,
  Banner,
  EmptyState,
  Pagination,
  Spinner,
  Checkbox,
  Filters,
  LegacyStack,
  Modal,
  TextContainer,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

// Loader to fetch products from Shopify
export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  
  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor") || null;
  const direction = url.searchParams.get("direction") || "next";
  const query = url.searchParams.get("query") || "";
  
  try {
    // Fetch products from Shopify Admin GraphQL API
    const PRODUCTS_QUERY = `
      query GetProducts($numProducts: Int!, $cursor: String, $query: String) {
        products(first: $numProducts, after: $cursor, query: $query) {
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
          edges {
            cursor
            node {
              id
              title
              handle
              vendor
              productType
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                    inventoryQuantity
                  }
                }
              }
              featuredImage {
                id
                url
                altText
              }
            }
          }
        }
      }
    `;
    
    const response = await admin.graphql(
      PRODUCTS_QUERY,
      {
        variables: {
          numProducts: 10,
          cursor: cursor,
          query: query
        }
      }
    );
    
    const data = await response.json();
    
    // Also fetch existing selected products from Avnu API
    const selectedResponse = await fetch(
      `${process.env.AVNU_API_URL}/api/integrations/shopify/merchant/${session.shop}/selected-products`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        }
      }
    );
    
    let selectedProducts = [];
    if (selectedResponse.ok) {
      const selectedData = await selectedResponse.json();
      selectedProducts = selectedData.productIds || [];
    }
    
    return json({
      shop: session.shop,
      products: data.data.products,
      selectedProducts,
      cursor,
      query
    });
  } catch (error) {
    console.error('Error fetching products', error);
    return json({
      shop: session.shop,
      products: { edges: [] },
      selectedProducts: [],
      errors: ['Failed to load products. Please try again.']
    });
  }
};

// Action to save selected products
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  // Check the form action type
  const actionType = formData.get('_action');
  
  if (actionType === 'select_products') {
    // Get selected product IDs
    const selectedProductIds = formData.getAll('selectedProducts');
    
    try {
      // Save selected products to Avnu backend
      const response = await fetch(
        `${process.env.AVNU_API_URL}/api/integrations/shopify/merchant/${session.shop}/selected-products`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`
          },
          body: JSON.stringify({
            productIds: Array.from(selectedProductIds)
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        return json({
          success: false,
          errors: errorData.errors || ['Failed to save product selections']
        });
      }
      
      return json({
        success: true,
        message: 'Products selected successfully'
      });
    } catch (error) {
      console.error('Error saving product selections', error);
      return json({
        success: false,
        errors: ['An unexpected error occurred']
      });
    }
  } else if (actionType === 'submit_onboarding') {
    try {
      // Submit the onboarding for approval
      const response = await fetch(
        `${process.env.AVNU_API_URL}/api/integrations/shopify/merchant/${session.shop}/submit-onboarding`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        return json({
          success: false,
          errors: errorData.errors || ['Failed to submit onboarding']
        });
      }
      
      // Redirect to completion page
      return redirect('/app/onboarding/complete');
    } catch (error) {
      console.error('Error submitting onboarding', error);
      return json({
        success: false,
        errors: ['An unexpected error occurred while submitting your onboarding']
      });
    }
  }
  
  return json({
    success: false,
    errors: ['Invalid action']
  });
};

// Component for product selection
export default function ProductSelection() {
  const { 
    shop, 
    products, 
    selectedProducts, 
    cursor, 
    query,
    errors: loaderErrors 
  } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  
  const [searchQuery, setSearchQuery] = useState(query || "");
  const [selectedItems, setSelectedItems] = useState(selectedProducts || []);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  
  // Update selectedItems when loader data changes
  useEffect(() => {
    setSelectedItems(selectedProducts || []);
  }, [selectedProducts]);
  
  // Handle product selection changes
  const handleSelectionChange = (productId) => {
    setSelectedItems(prevSelected => {
      // If already selected, remove it
      if (prevSelected.includes(productId)) {
        return prevSelected.filter(id => id !== productId);
      } 
      // Otherwise add it
      return [...prevSelected, productId];
    });
  };
  
  // Handle save selections
  const handleSaveSelections = () => {
    const formData = new FormData();
    formData.append('_action', 'select_products');
    
    // Add each selected product ID
    selectedItems.forEach(id => {
      formData.append('selectedProducts', id);
    });
    
    submit(formData, { method: 'post' });
  };
  
  // Handle filter changes
  const handleFiltersQueryChange = (value) => {
    setSearchQuery(value);
  };
  
  // Handle filter submit
  const handleFiltersQueryClear = () => {
    setSearchQuery("");
  };
  
  // Apply filters
  const handleFiltersClearAll = () => {
    handleFiltersQueryClear();
  };
  
  // Handle pagination
  const handlePaginationLinkClick = (page) => {
    // Get first or last cursor from product edges
    const productEdges = products.edges || [];
    const targetCursor = page === 'next' 
      ? productEdges[productEdges.length - 1]?.cursor
      : productEdges[0]?.cursor;
    
    // Navigate to appropriate page
    submit({ 
      cursor: targetCursor, 
      direction: page,
      query: searchQuery 
    }, { method: 'get' });
  };
  
  // Handle search submit
  const handleSearchSubmit = () => {
    submit({ 
      cursor: null, 
      direction: 'next',
      query: searchQuery 
    }, { method: 'get' });
  };
  
  // Handle submit onboarding
  const handleSubmitOnboarding = () => {
    setShowSubmitConfirm(true);
  };
  
  // Confirm submission
  const handleConfirmSubmit = () => {
    setShowSubmitConfirm(false);
    
    const formData = new FormData();
    formData.append('_action', 'submit_onboarding');
    
    submit(formData, { method: 'post' });
  };
  
  // Display errors if any
  const errors = loaderErrors || (actionData?.errors || []);
  
  // Display the product list
  const productList = products?.edges || [];
  const hasNextPage = products?.pageInfo?.hasNextPage || false;
  const hasPrevPage = products?.pageInfo?.hasPreviousPage || false;
  
  const resourceName = {
    singular: 'product',
    plural: 'products',
  };
  
  return (
    <Page
      title="Select Products"
      subtitle="Choose which products to list on the Avnu Marketplace"
      backAction={{ url: "/app/onboarding/returns" }}
    >
      <Layout>
        {errors.length > 0 && (
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
        
        {actionData?.success && (
          <Layout.Section>
            <Banner status="success">
              <p>{actionData.message || 'Products saved successfully'}</p>
            </Banner>
          </Layout.Section>
        )}
        
        <Layout.Section>
          <LegacyCard>
            <Filters
              queryValue={searchQuery}
              queryPlaceholder="Search products..."
              onQueryChange={handleFiltersQueryChange}
              onQueryClear={handleFiltersQueryClear}
              onClearAll={handleFiltersClearAll}
            >
              <div style={{ paddingLeft: '8px' }}>
                <Button onClick={handleSearchSubmit}>Search</Button>
              </div>
            </Filters>
            
            {productList.length === 0 ? (
              <LegacyCard.Section>
                <EmptyState
                  heading="No products found"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>
                    Try changing your search criteria or adding products in your Shopify store.
                  </p>
                </EmptyState>
              </LegacyCard.Section>
            ) : (
              <ResourceList
                resourceName={resourceName}
                items={productList}
                renderItem={(item) => {
                  const { node } = item;
                  const id = node.id;
                  const title = node.title;
                  const price = node.variants.edges[0]?.node.price;
                  const media = node.featuredImage ? (
                    <img
                      src={node.featuredImage.url}
                      alt={node.featuredImage.altText || title}
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                  ) : undefined;
                  
                  const isSelected = selectedItems.includes(id);
                  
                  return (
                    <ResourceItem
                      id={id}
                      url={`https://${shop}/admin/products/${id.replace('gid://shopify/Product/', '')}`}
                      media={media}
                      accessibilityLabel={`View details for ${title}`}
                      onClick={() => {}} // Prevent default click behavior
                    >
                      <LegacyStack>
                        <LegacyStack.Item>
                          <Checkbox
                            label=""
                            labelHidden
                            checked={isSelected}
                            onChange={() => handleSelectionChange(id)}
                          />
                        </LegacyStack.Item>
                        <LegacyStack.Item fill>
                          <Text variant="bodyMd" fontWeight="bold">
                            {title}
                          </Text>
                          <div>Price: ${price}</div>
                          <div>Type: {node.productType || 'N/A'}</div>
                        </LegacyStack.Item>
                      </LegacyStack>
                    </ResourceItem>
                  );
                }}
              />
            )}
            
            <LegacyCard.Section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text>
                    {selectedItems.length} products selected
                  </Text>
                </div>
                <Pagination
                  hasPrevious={hasPrevPage}
                  onPrevious={() => handlePaginationLinkClick('prev')}
                  hasNext={hasNextPage}
                  onNext={() => handlePaginationLinkClick('next')}
                />
              </div>
            </LegacyCard.Section>
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section>
          <LegacyCard sectioned>
            <LegacyStack distribution="equalSpacing">
              <Button onClick={handleSaveSelections}>
                Save Product Selections
              </Button>
              <Button primary onClick={handleSubmitOnboarding} disabled={selectedItems.length === 0}>
                Submit for Approval
              </Button>
            </LegacyStack>
          </LegacyCard>
        </Layout.Section>
      </Layout>
      
      {/* Confirmation modal */}
      <Modal
        open={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        title="Submit Your Application"
        primaryAction={{
          content: 'Submit',
          onAction: handleConfirmSubmit,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setShowSubmitConfirm(false),
          },
        ]}
      >
        <Modal.Section>
          <TextContainer>
            <p>
              You're about to submit your store for review by the Avnu Marketplace team.
              You have selected {selectedItems.length} products to list on Avnu.
            </p>
            <p>
              Once approved, your store and selected products will be visible to shoppers on the Avnu Marketplace.
              Are you ready to submit your application?
            </p>
          </TextContainer>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
```

### 2. Backend API for Product Selection

Add product selection endpoints to the merchant controller:

```typescript
// Add to src/modules/integrations/shopify-app/controllers/shopify-merchant.controller.ts

@Get(':shop/selected-products')
async getSelectedProducts(@Param('shop') shop: string) {
  return this.merchantService.getSelectedProducts(shop);
}

@Post(':shop/selected-products')
async saveSelectedProducts(
  @Param('shop') shop: string,
  @Body() data: {
    productIds: string[];
  }
) {
  return this.merchantService.saveSelectedProducts(shop, data.productIds);
}

@Post(':shop/submit-onboarding')
async submitOnboarding(@Param('shop') shop: string) {
  return this.merchantService.submitOnboarding(shop);
}
```

### 3. Update Merchant Service for Product Selection

Add product selection methods to the merchant service:

```typescript
// Add to src/modules/integrations/shopify-app/services/shopify-merchant.service.ts

async getSelectedProducts(shop: string) {
  const connection = await this.merchantPlatformConnectionRepository.findOne({
    where: { platformStoreName: shop, platformType: 'SHOPIFY' }
  });
  
  if (!connection) {
    throw new NotFoundException(`No merchant found for shop ${shop}`);
  }
  
  return {
    productIds: connection.selectedProductIds || []
  };
}

async saveSelectedProducts(shop: string, productIds: string[]) {
  const connection = await this.merchantPlatformConnectionRepository.findOne({
    where: { platformStoreName: shop, platformType: 'SHOPIFY' }
  });
  
  if (!connection) {
    throw new NotFoundException(`No merchant found for shop ${shop}`);
  }
  
  // Update selected product IDs
  connection.selectedProductIds = productIds;
  
  await this.merchantPlatformConnectionRepository.save(connection);
  
  return {
    success: true,
    message: 'Product selections saved successfully'
  };
}

async submitOnboarding(shop: string) {
  const connection = await this.merchantPlatformConnectionRepository.findOne({
    where: { platformStoreName: shop, platformType: 'SHOPIFY' }
  });
  
  if (!connection) {
    throw new NotFoundException(`No merchant found for shop ${shop}`);
  }
  
  // Validate the submission
  if (!connection.brandInformation) {
    throw new BadRequestException('Brand information is missing');
  }
  
  if (!connection.shippingPolicy) {
    throw new BadRequestException('Shipping policy is missing');
  }
  
  if (!connection.returnsPolicy) {
    throw new BadRequestException('Returns policy is missing');
  }
  
  if (!connection.selectedProductIds || connection.selectedProductIds.length === 0) {
    throw new BadRequestException('No products selected');
  }
  
  // Update onboarding status
  connection.onboardingStep = 'submitted';
  connection.submittedAt = new Date();
  
  await this.merchantPlatformConnectionRepository.save(connection);
  
  // Start product sync job
  await this.syncProductsToAvnu(shop, connection.selectedProductIds);
  
  // Send notification to Avnu admin team
  await this.notificationService.notifyAdmins({
    type: 'NEW_MERCHANT_SUBMISSION',
    data: {
      shop,
      merchantId: connection.merchantId,
      productCount: connection.selectedProductIds.length
    }
  });
  
  return {
    success: true,
    message: 'Onboarding submitted successfully and awaiting approval'
  };
}

private async syncProductsToAvnu(shop: string, productIds: string[]) {
  // Queue a background job to sync products
  await this.bullQueue.add('sync-products', {
    shop,
    productIds
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  });
  
  this.logger.log(`Queued product sync job for ${shop} with ${productIds.length} products`);
}
```

### 4. Create Completion Route

Create a completion page to show after submission:

```typescript
// app/routes/app.onboarding.complete.tsx

import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  LegacyCard,
  Text,
  Button,
  EmptyState,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  try {
    // Fetch merchant status from Avnu
    const response = await fetch(
      `${process.env.AVNU_API_URL}/api/integrations/shopify/merchant/${session.shop}/status`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return json({
        shop: session.shop,
        status: data.status,
        submittedAt: data.submittedAt,
        errors: null
      });
    }
    
    return json({
      shop: session.shop,
      status: 'unknown',
      errors: ['Failed to load merchant status']
    });
  } catch (error) {
    console.error('Error fetching merchant status', error);
    return json({
      shop: session.shop,
      status: 'unknown',
      errors: ['An unexpected error occurred']
    });
  }
};

export default function OnboardingComplete() {
  const { shop, status, submittedAt, errors } = useLoaderData();
  
  const submittedDate = submittedAt ? new Date(submittedAt).toLocaleDateString() : 'recently';
  
  return (
    <Page title="Application Submitted">
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
          <LegacyCard sectioned>
            <EmptyState
              heading="Your application has been submitted!"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              action={{
                content: 'Go to Dashboard',
                url: '/app'
              }}
            >
              <p>
                Thanks for your interest in joining the Avnu Marketplace. Your application
                was submitted on {submittedDate} and is currently {status}.
              </p>
              <p>
                Our team will review your application shortly. You'll receive an email
                once your application has been approved.
              </p>
            </EmptyState>
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section>
          <LegacyCard sectioned title="What happens next?">
            <Text as="p">
              1. <strong>Application Review:</strong> Our team will review your brand information, policies, and products.
            </Text>
            <Text as="p">
              2. <strong>Brand Approval:</strong> Once approved, your brand will be visible on the Avnu Marketplace.
            </Text>
            <Text as="p">
              3. <strong>Start Selling:</strong> You'll receive orders through Shopify and can fulfill them as usual.
            </Text>
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section>
          <LegacyCard sectioned title="Need help?">
            <Text as="p">
              If you have any questions about your application or the approval process,
              please contact our merchant support team.
            </Text>
            <div style={{ marginTop: '1rem' }}>
              <Button url="mailto:merchants@avnu.com">Contact Support</Button>
            </div>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

### 5. Entity Updates

Update the `MerchantPlatformConnection` entity:

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

  @Column('simple-array', { nullable: true })
  selectedProductIds: string[];

  @Column('enum', { 
    enum: ['pending', 'brand', 'shipping', 'returns', 'products', 'submitted', 'approved', 'rejected'],
    default: 'pending'
  })
  onboardingStep: string;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  // Additional columns...
}
```

### 6. Notification Service for Admin Alerts

Create a notification service for admin alerts:

```typescript
// src/modules/integrations/shopify-app/services/notification.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async notifyAdmins(notification: {
    type: string;
    data: any;
  }) {
    try {
      // Get notification settings from config
      const slackWebhookUrl = this.configService.get<string>('notifications.slackWebhook');
      const adminEmails = this.configService.get<string[]>('notifications.adminEmails') || [];
      
      // Send Slack notification if configured
      if (slackWebhookUrl) {
        await this.sendSlackNotification(slackWebhookUrl, notification);
      }
      
      // Send email notifications if configured
      if (adminEmails.length > 0) {
        await this.sendEmailNotifications(adminEmails, notification);
      }
      
      return true;
    } catch (error) {
      this.logger.error('Failed to send admin notifications', error);
      // Don't throw, this shouldn't block the flow
      return false;
    }
  }
  
  private async sendSlackNotification(webhookUrl: string, notification: any) {
    // Format the message for Slack
    let message = '';
    
    if (notification.type === 'NEW_MERCHANT_SUBMISSION') {
      message = `🎉 *New Merchant Submission*\n` +
                `Shop: ${notification.data.shop}\n` +
                `Products: ${notification.data.productCount}\n` +
                `Review Link: ${this.configService.get('app.adminUrl')}/merchants/${notification.data.merchantId}`;
    }
    
    // Send to Slack
    await this.httpService.post(webhookUrl, {
      text: message
    }).toPromise();
    
    this.logger.log(`Sent Slack notification: ${notification.type}`);
  }
  
  private async sendEmailNotifications(recipients: string[], notification: any) {
    // Implementation depends on your email provider
    // Could use AWS SES, SendGrid, or another service
    
    this.logger.log(`Would send email notification to: ${recipients.join(', ')}`);
    // In a real implementation, you would send actual emails here
  }
}
```

### 7. Update Module Configuration

Add the new components to the Shopify module:

```typescript
// Update src/modules/integrations/shopify-app/shopify.module.ts

import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MerchantPlatformConnection]),
    BullModule.registerQueue({
      name: 'shopify-sync',
    }),
    HttpModule,
    ConfigModule,
  ],
  providers: [
    // existing providers
    NotificationService,
  ],
  controllers: [
    // existing controllers
  ],
  exports: [
    // existing exports
    NotificationService,
  ],
})
export class ShopifyModule {
  // existing configuration
}
```

## Dependencies & Prerequisites

- Completed Phase 2C (Returns Policy)
- Shopify Admin GraphQL API access
- Bull queue for background processing
- HTTP service for webhook notifications

## Testing Guidelines

1. **Product Listing:**
   - Test product search and pagination
   - Verify correct display of product information
   - Test product selection and persistence

2. **Selection Management:**
   - Test saving selections without submitting
   - Verify selections persist across page reloads
   - Test with large numbers of products

3. **Submission Flow:**
   - Test validation before submission (all required sections complete)
   - Verify confirmation modal works correctly
   - Test admin notifications are sent

4. **Status Display:**
   - Verify completion page shows correct status
   - Test different status scenarios (submitted, approved, rejected)

## Next Steps

After completing the entire onboarding UI (Phases 2A through 2D), the next major component is the [Product Synchronization Engine](./shopify-app-phase3-sync-engine.md) which will handle the real-time synchronization of product data between Shopify and Avnu.
