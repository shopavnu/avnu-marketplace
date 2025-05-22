# Phase 3B: Product Synchronization - Bulk Operations

## Objectives

- Implement bulk import/export operations for initial product synchronization
- Leverage Shopify's Bulk Operations API for efficient data retrieval
- Create data transformation pipeline for importing products to Avnu
- Build an admin interface for manual synchronization triggers

## Timeline: Weeks 10-11 (Second part of Phase 3)

## Tasks & Implementation Details

### 1. Enhance the Bulk Operation Service

Extend the existing ShopifyBulkOperationService to handle product data:

```typescript
// src/modules/integrations/shopify-app/services/shopify-bulk-operation.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MerchantPlatformConnection } from '../../../entities/merchant-platform-connection.entity';
import { ShopifyClientService } from './shopify-client.service';
import { ShopifySyncService } from './shopify-sync.service';

@Injectable()
export class ShopifyBulkOperationService {
  private readonly logger = new Logger(ShopifyBulkOperationService.name);

  constructor(
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantConnectionRepository: Repository<MerchantPlatformConnection>,
    private readonly shopifyClientService: ShopifyClientService,
    private readonly shopifySyncService: ShopifySyncService,
    @InjectQueue('shopify-sync') private syncQueue: Queue,
  ) {}

  /**
   * Start a bulk product export operation
   */
  async startBulkProductExport(shop: string): Promise<{ id: string; status: string }> {
    const merchantConnection = await this.getMerchantConnection(shop);
    
    // Check for selected products
    if (!merchantConnection.selectedProductIds || merchantConnection.selectedProductIds.length === 0) {
      throw new Error('No products selected for synchronization');
    }
    
    // Build product IDs filter
    const productIdsFilter = merchantConnection.selectedProductIds
      .map(id => id.replace('gid://shopify/Product/', ''))
      .join(',');
    
    // GraphQL query for bulk product export
    const query = `
      mutation {
        bulkOperationRunQuery(
          query: """
          {
            products(query: "id:${productIdsFilter}") {
              edges {
                node {
                  id
                  title
                  description
                  handle
                  productType
                  vendor
                  tags
                  status
                  publishedAt
                  images {
                    edges {
                      node {
                        id
                        src
                        altText
                      }
                    }
                  }
                  variants {
                    edges {
                      node {
                        id
                        title
                        sku
                        price
                        compareAtPrice
                        weight
                        weightUnit
                        inventoryItem {
                          id
                          inventoryLevels(first: 1) {
                            edges {
                              node {
                                available
                              }
                            }
                          }
                        }
                        selectedOptions {
                          name
                          value
                        }
                        image {
                          id
                          src
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          """
        ) {
          bulkOperation {
            id
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    
    try {
      const response = await this.shopifyClientService.query(
        shop,
        merchantConnection.accessToken,
        query
      );
      
      const bulkOperation = response.data.bulkOperationRunQuery.bulkOperation;
      const userErrors = response.data.bulkOperationRunQuery.userErrors;
      
      if (userErrors && userErrors.length > 0) {
        throw new Error(`Bulk operation errors: ${JSON.stringify(userErrors)}`);
      }
      
      this.logger.log(`Started bulk product export for ${shop}, operation ID: ${bulkOperation.id}`);
      
      // Queue a job to poll for bulk operation completion
      await this.syncQueue.add('poll-bulk-operation', {
        shop,
        operationId: bulkOperation.id,
        type: 'product-export',
        attempts: 0,
        timestamp: new Date().toISOString()
      }, {
        delay: 30000, // Start polling after 30 seconds
        attempts: 24, // Try for up to 2 hours (5 min intervals)
        backoff: {
          type: 'fixed',
          delay: 300000 // 5 minutes between checks
        }
      });
      
      return {
        id: bulkOperation.id,
        status: bulkOperation.status
      };
    } catch (error) {
      this.logger.error(`Failed to start bulk product export for ${shop}`, error);
      throw new Error(`Failed to start bulk operation: ${error.message}`);
    }
  }

  /**
   * Check the status of a bulk operation
   */
  async checkBulkOperationStatus(shop: string, operationId: string): Promise<{ status: string; url?: string }> {
    const merchantConnection = await this.getMerchantConnection(shop);
    
    const query = `
      query {
        node(id: "${operationId}") {
          ... on BulkOperation {
            id
            status
            errorCode
            createdAt
            completedAt
            objectCount
            fileSize
            url
            partialDataUrl
          }
        }
      }
    `;
    
    try {
      const response = await this.shopifyClientService.query(
        shop,
        merchantConnection.accessToken,
        query
      );
      
      const operation = response.data.node;
      
      if (!operation) {
        throw new Error(`Bulk operation ${operationId} not found`);
      }
      
      this.logger.log(`Bulk operation ${operationId} status: ${operation.status}`);
      
      return {
        status: operation.status,
        url: operation.url || operation.partialDataUrl,
        errorCode: operation.errorCode,
        objectCount: operation.objectCount,
        fileSize: operation.fileSize,
        completedAt: operation.completedAt
      };
    } catch (error) {
      this.logger.error(`Failed to check bulk operation status for ${shop}`, error);
      throw new Error(`Failed to check bulk operation status: ${error.message}`);
    }
  }

  /**
   * Process completed bulk operation data
   */
  async processBulkOperationResults(shop: string, operationUrl: string, operationType: string): Promise<{ processed: number }> {
    const merchantConnection = await this.getMerchantConnection(shop);
    
    try {
      // Download the JSONL file from the provided URL
      const response = await fetch(operationUrl);
      if (!response.ok) {
        throw new Error(`Failed to download bulk operation results: ${response.statusText}`);
      }
      
      const text = await response.text();
      const lines = text.trim().split('\n');
      
      this.logger.log(`Processing ${lines.length} items from bulk operation`);
      
      let processed = 0;
      
      // Process each line (JSON object) from the results
      for (const line of lines) {
        const data = JSON.parse(line);
        
        if (operationType === 'product-export') {
          // Extract product data and process it
          const product = this.transformBulkProductData(data);
          
          // Use the sync service to save the product
          await this.shopifySyncService.saveProduct(shop, product);
          processed++;
        }
      }
      
      this.logger.log(`Processed ${processed} items from bulk operation`);
      
      return { processed };
    } catch (error) {
      this.logger.error(`Failed to process bulk operation results for ${shop}`, error);
      throw new Error(`Failed to process bulk operation results: ${error.message}`);
    }
  }

  /**
   * Transform bulk product data from Shopify format to Avnu format
   */
  private transformBulkProductData(data: any): any {
    // Extract the product node from the bulk operation data
    const product = data.products?.edges?.[0]?.node;
    
    if (!product) {
      throw new Error('Invalid product data structure');
    }
    
    // Transform to a format compatible with our sync service
    const transformedProduct = {
      id: product.id,
      title: product.title,
      description: product.description,
      handle: product.handle,
      product_type: product.productType,
      vendor: product.vendor,
      tags: product.tags,
      status: product.status,
      published_at: product.publishedAt,
      images: product.images.edges.map(edge => ({
        id: edge.node.id,
        src: edge.node.src,
        alt_text: edge.node.altText
      })),
      variants: product.variants.edges.map(edge => {
        const variant = edge.node;
        const inventoryLevel = variant.inventoryItem?.inventoryLevels?.edges?.[0]?.node;
        
        return {
          id: variant.id,
          title: variant.title,
          sku: variant.sku,
          price: variant.price,
          compare_at_price: variant.compareAtPrice,
          weight: variant.weight,
          weight_unit: variant.weightUnit,
          inventory_item_id: variant.inventoryItem?.id,
          inventory_quantity: inventoryLevel?.available || 0,
          option1: variant.selectedOptions?.[0]?.value,
          option2: variant.selectedOptions?.[1]?.value,
          option3: variant.selectedOptions?.[2]?.value,
          image_id: variant.image?.id
        };
      })
    };
    
    return transformedProduct;
  }

  /**
   * Get merchant connection or throw error
   */
  private async getMerchantConnection(shop: string): Promise<MerchantPlatformConnection> {
    const merchantConnection = await this.merchantConnectionRepository.findOne({
      where: { platformStoreName: shop, platformType: 'SHOPIFY' }
    });
    
    if (!merchantConnection) {
      throw new NotFoundException(`No merchant found for shop ${shop}`);
    }
    
    return merchantConnection;
  }
}
```

### 2. Add ShopifySyncService Method for Bulk Processing

Add a method to save products during bulk operations:

```typescript
// Add to src/modules/integrations/shopify-app/services/shopify-sync.service.ts

/**
 * Save product from bulk operation
 */
async saveProduct(shop: string, productData: any): Promise<Product> {
  const merchantConnection = await this.getMerchantConnection(shop);
  
  // Check if this product is selected for sync
  if (!await this.isProductSelected(merchantConnection, productData.id)) {
    this.logger.log(`Product ${productData.id} not selected for sync, skipping`);
    return null;
  }
  
  // Check if product exists
  const existingProduct = await this.productRepository.findOne({
    where: {
      externalId: productData.id,
      merchantId: merchantConnection.merchantId
    },
    relations: ['variants']
  });
  
  // Transform Shopify product to Avnu product
  const avnuProduct = this.transformShopifyProduct(productData, merchantConnection);
  
  if (existingProduct) {
    // Update existing product
    avnuProduct.id = existingProduct.id;
    
    // Handle variant updates
    await this.handleVariantUpdates(existingProduct, avnuProduct);
  }
  
  // Save to database
  const savedProduct = await this.productRepository.save(avnuProduct);
  
  this.logger.log(`Product saved via bulk operation: ${productData.id} (${productData.title})`);
  
  return savedProduct;
}
```

### 3. Implement Bulk Operation Processor

Create a processor for handling bulk operation polling and processing:

```typescript
// src/modules/integrations/shopify-app/processors/shopify-bulk-operation.processor.ts

import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ShopifyBulkOperationService } from '../services/shopify-bulk-operation.service';

@Processor('shopify-sync')
export class ShopifyBulkOperationProcessor {
  private readonly logger = new Logger(ShopifyBulkOperationProcessor.name);

  constructor(private readonly bulkOperationService: ShopifyBulkOperationService) {}

  @Process('poll-bulk-operation')
  async pollBulkOperation(job: Job) {
    const { shop, operationId, type, attempts } = job.data;
    
    this.logger.log(`Polling bulk operation ${operationId} (attempt ${attempts + 1})`);
    
    try {
      // Check bulk operation status
      const operationStatus = await this.bulkOperationService.checkBulkOperationStatus(shop, operationId);
      
      // If still running, reqeueue
      if (operationStatus.status === 'RUNNING' || operationStatus.status === 'CREATED') {
        // Log and requeue through Bull's retry mechanism
        this.logger.log(`Bulk operation ${operationId} still running, will check again later`);
        throw new Error('Operation still in progress');
      }
      
      // If completed
      if (operationStatus.status === 'COMPLETED' && operationStatus.url) {
        this.logger.log(`Bulk operation ${operationId} completed, processing results`);
        
        // Process the results
        const result = await this.bulkOperationService.processBulkOperationResults(
          shop,
          operationStatus.url,
          type
        );
        
        this.logger.log(`Processed ${result.processed} items from bulk operation ${operationId}`);
        return { success: true, processed: result.processed };
      }
      
      // If failed
      if (operationStatus.status === 'FAILED' || operationStatus.status === 'CANCELED') {
        this.logger.error(`Bulk operation ${operationId} failed or was canceled`);
        return { 
          success: false, 
          error: `Bulk operation failed with status: ${operationStatus.status}`,
          errorCode: operationStatus.errorCode
        };
      }
      
      // Handle partial completion
      if (operationStatus.status === 'COMPLETED' && operationStatus.partialDataUrl) {
        this.logger.log(`Bulk operation ${operationId} partially completed, processing available results`);
        
        // Process the partial results
        const result = await this.bulkOperationService.processBulkOperationResults(
          shop,
          operationStatus.partialDataUrl,
          type
        );
        
        this.logger.log(`Processed ${result.processed} items from partial bulk operation ${operationId}`);
        return { success: true, processed: result.processed, partial: true };
      }
      
      // Unexpected status
      this.logger.warn(`Bulk operation ${operationId} has unexpected status: ${operationStatus.status}`);
      return { success: false, error: `Unexpected operation status: ${operationStatus.status}` };
    } catch (error) {
      this.logger.error(`Error polling bulk operation ${operationId}: ${error.message}`, error.stack);
      
      // If max retries reached or not a polling retry error
      if (attempts >= 23 || error.message !== 'Operation still in progress') {
        this.logger.error(`Max retries reached or fatal error for bulk operation ${operationId}, giving up`);
        return { success: false, error: error.message, maxRetriesReached: true };
      }
      
      // Otherwise, throw to trigger a retry
      throw error;
    }
  }
}
```

### 4. Create REST API for Triggering Bulk Operations

Create an API endpoint for manual sync triggers:

```typescript
// src/modules/integrations/shopify-app/controllers/shopify-sync.controller.ts

import { Controller, Post, Get, Param, Body, UseGuards, Logger } from '@nestjs/common';
import { ShopifyAuthGuard } from '../guards/shopify-auth.guard';
import { ShopifyBulkOperationService } from '../services/shopify-bulk-operation.service';

@Controller('api/integrations/shopify/sync')
@UseGuards(ShopifyAuthGuard)
export class ShopifySyncController {
  private readonly logger = new Logger(ShopifySyncController.name);

  constructor(
    private readonly bulkOperationService: ShopifyBulkOperationService,
  ) {}

  @Post(':shop/products')
  async syncProducts(@Param('shop') shop: string) {
    this.logger.log(`Triggering product sync for ${shop}`);
    
    try {
      const operation = await this.bulkOperationService.startBulkProductExport(shop);
      
      return {
        success: true,
        operationId: operation.id,
        status: operation.status,
        message: 'Product synchronization started successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to start product sync for ${shop}`, error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get(':shop/operations/:operationId')
  async checkOperationStatus(
    @Param('shop') shop: string,
    @Param('operationId') operationId: string
  ) {
    this.logger.log(`Checking bulk operation status for ${shop}, operation ${operationId}`);
    
    try {
      const status = await this.bulkOperationService.checkBulkOperationStatus(shop, operationId);
      
      return {
        success: true,
        operationId,
        ...status
      };
    } catch (error) {
      this.logger.error(`Failed to check operation status for ${shop}`, error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

### 5. Create Remix Interface for Bulk Operations

Create a UI for managing product synchronization:

```typescript
// app/routes/app.sync.tsx

import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import { useState, useEffect } from "react";
import {
  Page,
  Layout,
  LegacyCard,
  Banner,
  Text,
  Button,
  LegacyStack,
  ProgressBar,
  Spinner,
  EmptyState,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  try {
    // Get current merchant connection status
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
    
    const data = await response.json();
    
    // Get active operations if any
    const operationsResponse = await fetch(
      `${process.env.AVNU_API_URL}/api/integrations/shopify/merchant/${session.shop}/operations`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        }
      }
    );
    
    const operationsData = await operationsResponse.json();
    
    return json({
      shop: session.shop,
      merchantStatus: data,
      operations: operationsData.operations || [],
      errors: null
    });
  } catch (error) {
    console.error('Error fetching merchant data', error);
    return json({
      shop: session.shop,
      merchantStatus: null,
      operations: [],
      errors: ['Failed to load merchant status']
    });
  }
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const action = formData.get('action');
  
  try {
    if (action === 'sync_products') {
      // Start product sync
      const response = await fetch(
        `${process.env.AVNU_API_URL}/api/integrations/shopify/sync/${session.shop}/products`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`
          }
        }
      );
      
      const data = await response.json();
      
      if (!data.success) {
        return json({
          success: false,
          errors: [data.error || 'Failed to start product synchronization']
        });
      }
      
      return json({
        success: true,
        operationId: data.operationId,
        message: 'Product synchronization started successfully'
      });
    }
    
    return json({
      success: false,
      errors: ['Invalid action']
    });
  } catch (error) {
    console.error('Error processing sync action', error);
    return json({
      success: false,
      errors: [error.message || 'An unexpected error occurred']
    });
  }
};

export default function ProductSync() {
  const { shop, merchantStatus, operations, errors: loaderErrors } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();
  
  const [activeOperation, setActiveOperation] = useState(null);
  const [pollingTimer, setPollingTimer] = useState(null);
  
  // Set up polling for active operations
  useEffect(() => {
    // Clear any existing timer
    if (pollingTimer) {
      clearInterval(pollingTimer);
    }
    
    // Find the most recent active operation
    const latestOperation = operations.length > 0 
      ? operations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
      : null;
    
    if (latestOperation && ['CREATED', 'RUNNING'].includes(latestOperation.status)) {
      setActiveOperation(latestOperation);
      
      // Set up polling
      const timer = setInterval(async () => {
        try {
          const response = await fetch(
            `${process.env.AVNU_API_URL}/api/integrations/shopify/sync/${shop}/operations/${latestOperation.id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          
          const data = await response.json();
          
          if (data.success) {
            setActiveOperation(data);
            
            // If completed or failed, stop polling
            if (!['CREATED', 'RUNNING'].includes(data.status)) {
              clearInterval(timer);
              setPollingTimer(null);
            }
          }
        } catch (error) {
          console.error('Error polling operation status', error);
        }
      }, 5000); // Poll every 5 seconds
      
      setPollingTimer(timer);
      
      // Clean up on unmount
      return () => clearInterval(timer);
    }
  }, [shop, operations]);
  
  const handleSyncProducts = () => {
    const formData = new FormData();
    formData.append('action', 'sync_products');
    
    submit(formData, { method: 'post' });
  };
  
  // Display errors if any
  const errors = loaderErrors || (actionData?.errors || []);
  const isLoading = navigation.state === 'submitting';
  
  // Calculate product count
  const productCount = merchantStatus?.selectedProductIds?.length || 0;
  
  // Calculate sync progress
  let syncProgress = 0;
  let syncStatus = 'Not started';
  
  if (activeOperation) {
    if (activeOperation.status === 'COMPLETED') {
      syncProgress = 100;
      syncStatus = 'Completed';
    } else if (activeOperation.status === 'RUNNING' && activeOperation.objectCount > 0) {
      syncProgress = Math.min(
        90, // Cap at 90% until fully completed
        (activeOperation.processedCount / activeOperation.objectCount) * 100
      );
      syncStatus = 'In progress';
    } else if (activeOperation.status === 'CREATED') {
      syncProgress = 10;
      syncStatus = 'Starting';
    } else if (['FAILED', 'CANCELED'].includes(activeOperation.status)) {
      syncProgress = 0;
      syncStatus = `Failed: ${activeOperation.errorCode || 'Unknown error'}`;
    }
  }
  
  return (
    <Page
      title="Product Synchronization"
      subtitle="Manage product data synchronization between Shopify and Avnu"
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
              <p>{actionData.message}</p>
            </Banner>
          </Layout.Section>
        )}
        
        <Layout.Section>
          <LegacyCard sectioned title="Product Selection">
            <Text variant="bodyMd">
              You have selected {productCount} products to be synchronized with Avnu Marketplace.
            </Text>
            
            <div style={{ marginTop: '1rem' }}>
              <Button
                url="/app/onboarding/products"
                disabled={isLoading || activeOperation?.status === 'RUNNING'}
              >
                Manage Product Selection
              </Button>
            </div>
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section>
          <LegacyCard
            sectioned
            title="Synchronization Status"
            actions={[
              {
                content: 'Sync Now',
                onAction: handleSyncProducts,
                disabled: isLoading || activeOperation?.status === 'RUNNING' || productCount === 0
              }
            ]}
          >
            {productCount === 0 ? (
              <EmptyState
                heading="No products selected"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>
                  You need to select which products to synchronize with Avnu before
                  you can start the synchronization process.
                </p>
              </EmptyState>
            ) : (
              <>
                <LegacyStack vertical spacing="loose">
                  <Text variant="bodyMd">
                    Status: <strong>{syncStatus}</strong>
                  </Text>
                  
                  {(isLoading || activeOperation?.status === 'RUNNING' || activeOperation?.status === 'CREATED') && (
                    <div style={{ marginTop: '1rem' }}>
                      <ProgressBar progress={syncProgress} size="medium" />
                      <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                        <Spinner size="small" />
                        <Text variant="bodyMd" color="subdued">
                          {activeOperation?.status === 'CREATED' 
                            ? 'Starting synchronization...' 
                            : 'Synchronizing products...'}
                        </Text>
                      </div>
                    </div>
                  )}
                  
                  {activeOperation?.status === 'COMPLETED' && (
                    <Banner status="success">
                      <p>
                        Successfully synchronized {activeOperation.processedCount} products
                        {activeOperation.completedAt && ` on ${new Date(activeOperation.completedAt).toLocaleString()}`}.
                      </p>
                    </Banner>
                  )}
                  
                  {['FAILED', 'CANCELED'].includes(activeOperation?.status) && (
                    <Banner status="critical">
                      <p>
                        Synchronization failed: {activeOperation.errorCode || 'Unknown error'}
                      </p>
                      <p>
                        Please try again or contact support if the problem persists.
                      </p>
                    </Banner>
                  )}
                </LegacyStack>
              </>
            )}
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

### 6. Update Module Configuration

Update the Shopify module to include these new components:

```typescript
// Update src/modules/integrations/shopify-app/shopify.module.ts

import { ShopifySyncController } from './controllers/shopify-sync.controller';
import { ShopifyBulkOperationProcessor } from './processors/shopify-bulk-operation.processor';

@Module({
  // Add the new controller to controllers array
  controllers: [
    ShopifyAuthController,
    ShopifyWebhookController,
    ShopifySyncController,
  ],
  
  // Add the new processor to providers array
  providers: [
    ShopifyAuthService,
    ShopifyClientService,
    ShopifySyncService,
    ShopifySyncProcessor,
    ShopifyBulkOperationProcessor,
  ],
})
export class ShopifyModule {
  // Existing configuration
}
```

## Dependencies & Prerequisites

- Completed Phase 3A (Webhook Handlers)
- Shopify Admin GraphQL API with Bulk Operations support
- Bull queue for background processing
- Fetch API for downloading bulk operation results

## Testing Guidelines

1. **Bulk Operation API:**
   - Test GraphQL query construction for different product selections
   - Verify error handling for API limits and throttling
   - Test retry mechanisms for failed operations

2. **Data Transformation:**
   - Verify correct transformation of bulk data to database entities
   - Test handling of product variants and inventory
   - Ensure selected product filtering works correctly

3. **User Interface:**
   - Test manual synchronization triggers
   - Verify progress reporting and status updates
   - Test error handling and user feedback

## Next Phase

Once the bulk operations are implemented, proceed to [Phase 3C: Background Jobs](./shopify-app-phase3c-background-jobs.md) to implement automated synchronization and maintenance tasks.
