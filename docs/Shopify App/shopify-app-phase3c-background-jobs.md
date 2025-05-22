# Phase 3C: Product Synchronization - Background Jobs

## Objectives

- Implement automated background jobs for scheduled product synchronization
- Create data integrity validation and repair processes
- Set up monitoring and alerting for sync failures
- Build analytics tracking for product performance

## Timeline: Weeks 12-13 (Final part of Phase 3)

## Tasks & Implementation Details

### 1. Create Scheduled Synchronization Service

Implement a service to run background synchronization jobs:

```typescript
// src/modules/integrations/shopify-app/services/shopify-scheduler.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MerchantPlatformConnection } from '../../../entities/merchant-platform-connection.entity';
import { ShopifyBulkOperationService } from './shopify-bulk-operation.service';

@Injectable()
export class ShopifySchedulerService {
  private readonly logger = new Logger(ShopifySchedulerService.name);

  constructor(
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantConnectionRepository: Repository<MerchantPlatformConnection>,
    private readonly bulkOperationService: ShopifyBulkOperationService,
    @InjectQueue('shopify-sync') private syncQueue: Queue,
  ) {}

  /**
   * Scheduled task to run product synchronization daily
   * Runs at 3 AM every day
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async scheduledProductSync() {
    this.logger.log('Starting scheduled product sync for all merchants');
    
    try {
      // Get all active Shopify merchant connections
      const merchants = await this.merchantConnectionRepository.find({
        where: {
          platformType: 'SHOPIFY',
          isActive: true,
          approvalStatus: 'approved'
        }
      });
      
      this.logger.log(`Found ${merchants.length} active merchants for scheduled sync`);
      
      // Queue sync jobs for each merchant, staggered by 5 minutes to avoid API rate limits
      for (let i = 0; i < merchants.length; i++) {
        const merchant = merchants[i];
        const delay = i * 5 * 60 * 1000; // 5 minutes between each merchant
        
        await this.syncQueue.add('scheduled-product-sync', {
          shop: merchant.platformStoreName,
          timestamp: new Date().toISOString()
        }, {
          delay,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 60000
          }
        });
        
        this.logger.log(`Queued sync for ${merchant.platformStoreName} with delay of ${delay}ms`);
      }
    } catch (error) {
      this.logger.error('Error scheduling product syncs', error);
    }
  }

  /**
   * Scheduled task to check for inventory updates every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async scheduleInventoryUpdates() {
    this.logger.log('Starting scheduled inventory updates for all merchants');
    
    try {
      // Get all active Shopify merchant connections
      const merchants = await this.merchantConnectionRepository.find({
        where: {
          platformType: 'SHOPIFY',
          isActive: true,
          approvalStatus: 'approved'
        }
      });
      
      // Queue inventory sync jobs for each merchant, staggered by 1 minute
      for (let i = 0; i < merchants.length; i++) {
        const merchant = merchants[i];
        const delay = i * 60 * 1000; // 1 minute between each merchant
        
        await this.syncQueue.add('inventory-sync', {
          shop: merchant.platformStoreName,
          timestamp: new Date().toISOString()
        }, {
          delay,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 30000
          }
        });
      }
    } catch (error) {
      this.logger.error('Error scheduling inventory updates', error);
    }
  }

  /**
   * Scheduled task to validate data integrity weekly
   * Runs at 2 AM every Sunday
   */
  @Cron(CronExpression.EVERY_WEEK)
  async scheduleDataIntegrityChecks() {
    this.logger.log('Starting weekly data integrity checks for all merchants');
    
    try {
      // Get all active Shopify merchant connections
      const merchants = await this.merchantConnectionRepository.find({
        where: {
          platformType: 'SHOPIFY',
          isActive: true,
          approvalStatus: 'approved'
        }
      });
      
      // Queue data integrity check jobs for each merchant
      for (let i = 0; i < merchants.length; i++) {
        const merchant = merchants[i];
        const delay = i * 2 * 60 * 1000; // 2 minutes between each merchant
        
        await this.syncQueue.add('data-integrity-check', {
          shop: merchant.platformStoreName,
          timestamp: new Date().toISOString()
        }, {
          delay,
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 60000
          }
        });
      }
    } catch (error) {
      this.logger.error('Error scheduling data integrity checks', error);
    }
  }
}
```

### 2. Create Synchronization Job Processor

Implement a processor for handling scheduled sync jobs:

```typescript
// src/modules/integrations/shopify-app/processors/shopify-scheduler.processor.ts

import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantPlatformConnection } from '../../../entities/merchant-platform-connection.entity';
import { Product } from '../../../entities/product.entity';
import { ProductVariant } from '../../../entities/product-variant.entity';
import { ShopifyBulkOperationService } from '../services/shopify-bulk-operation.service';
import { ShopifyClientService } from '../services/shopify-client.service';
import { NotificationService } from '../services/notification.service';

@Processor('shopify-sync')
export class ShopifySchedulerProcessor {
  private readonly logger = new Logger(ShopifySchedulerProcessor.name);

  constructor(
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantConnectionRepository: Repository<MerchantPlatformConnection>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    private readonly bulkOperationService: ShopifyBulkOperationService,
    private readonly shopifyClientService: ShopifyClientService,
    private readonly notificationService: NotificationService,
  ) {}

  @Process('scheduled-product-sync')
  async processScheduledProductSync(job: Job) {
    const { shop } = job.data;
    
    this.logger.log(`Processing scheduled product sync for ${shop}`);
    
    try {
      // Start bulk product export
      const operation = await this.bulkOperationService.startBulkProductExport(shop);
      
      this.logger.log(`Started bulk product export for ${shop}, operation ID: ${operation.id}`);
      
      return {
        success: true,
        operationId: operation.id,
        status: operation.status
      };
    } catch (error) {
      this.logger.error(`Failed to process scheduled product sync for ${shop}`, error);
      
      // Notify about failure
      await this.notificationService.notifyAdmins({
        type: 'SYNC_FAILURE',
        data: {
          shop,
          error: error.message,
          jobType: 'scheduled-product-sync'
        }
      });
      
      throw error; // Rethrow to trigger Bull's retry mechanism
    }
  }

  @Process('inventory-sync')
  async processInventorySync(job: Job) {
    const { shop } = job.data;
    
    this.logger.log(`Processing inventory sync for ${shop}`);
    
    try {
      const merchantConnection = await this.merchantConnectionRepository.findOne({
        where: { platformStoreName: shop, platformType: 'SHOPIFY' }
      });
      
      if (!merchantConnection) {
        throw new Error(`No merchant found for shop ${shop}`);
      }
      
      // Only sync inventory for selected products
      if (!merchantConnection.selectedProductIds || merchantConnection.selectedProductIds.length === 0) {
        this.logger.log(`No products selected for ${shop}, skipping inventory sync`);
        return { success: true, skipped: true };
      }
      
      // Query for inventory levels of all selected variants
      // This is a simplified implementation; in production, you'd need to handle pagination
      const query = `
        query {
          inventoryItems(first: 250) {
            edges {
              node {
                id
                inventoryLevel(locationId: "${merchantConnection.defaultLocationId}") {
                  available
                  incoming
                  item {
                    variant {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      `;
      
      const response = await this.shopifyClientService.query(
        shop,
        merchantConnection.accessToken,
        query
      );
      
      const inventoryItems = response.data.inventoryItems.edges;
      
      this.logger.log(`Retrieved ${inventoryItems.length} inventory items for ${shop}`);
      
      // Update inventory for each variant
      let updatedCount = 0;
      
      for (const edge of inventoryItems) {
        const item = edge.node;
        const variantId = item.inventoryLevel?.item?.variant?.id;
        
        if (!variantId || !item.id) continue;
        
        // Find the variant in our database
        const variant = await this.variantRepository.findOne({
          where: { 
            inventoryItemId: item.id 
          },
          relations: ['product']
        });
        
        if (variant) {
          // Only update if changed
          if (variant.inventoryQuantity !== item.inventoryLevel.available) {
            variant.inventoryQuantity = item.inventoryLevel.available;
            await this.variantRepository.save(variant);
            updatedCount++;
          }
        }
      }
      
      this.logger.log(`Updated inventory for ${updatedCount} variants for ${shop}`);
      
      return {
        success: true,
        updatedCount
      };
    } catch (error) {
      this.logger.error(`Failed to process inventory sync for ${shop}`, error);
      
      // Only notify if it's not just a temporary API issue
      if (error.message.includes('throttled') || error.message.includes('rate limit')) {
        this.logger.warn(`API rate limit hit for ${shop}, will retry later`);
      } else {
        await this.notificationService.notifyAdmins({
          type: 'SYNC_FAILURE',
          data: {
            shop,
            error: error.message,
            jobType: 'inventory-sync'
          }
        });
      }
      
      throw error;
    }
  }

  @Process('data-integrity-check')
  async processDataIntegrityCheck(job: Job) {
    const { shop } = job.data;
    
    this.logger.log(`Processing data integrity check for ${shop}`);
    
    try {
      const merchantConnection = await this.merchantConnectionRepository.findOne({
        where: { platformStoreName: shop, platformType: 'SHOPIFY' }
      });
      
      if (!merchantConnection) {
        throw new Error(`No merchant found for shop ${shop}`);
      }
      
      // 1. Check for orphaned variants (variants without products)
      const orphanedVariants = await this.variantRepository
        .createQueryBuilder('variant')
        .leftJoin('variant.product', 'product')
        .where('product.id IS NULL')
        .andWhere('variant.productId IS NOT NULL')
        .getMany();
      
      if (orphanedVariants.length > 0) {
        this.logger.warn(`Found ${orphanedVariants.length} orphaned variants for ${shop}`);
        
        // Delete orphaned variants
        await this.variantRepository.remove(orphanedVariants);
      }
      
      // 2. Check for products that should be active but aren't
      const inactiveProducts = await this.productRepository
        .createQueryBuilder('product')
        .where('product.merchantId = :merchantId', { merchantId: merchantConnection.merchantId })
        .andWhere('product.status = :status', { status: 'INACTIVE' })
        .andWhere('product.externalId IN (:...ids)', { 
          ids: merchantConnection.selectedProductIds.map(id => id.replace('gid://shopify/Product/', ''))
        })
        .getMany();
      
      if (inactiveProducts.length > 0) {
        this.logger.warn(`Found ${inactiveProducts.length} inactive products that should be active for ${shop}`);
        
        // Activate these products
        for (const product of inactiveProducts) {
          product.status = 'ACTIVE';
          await this.productRepository.save(product);
        }
      }
      
      // 3. Check for data inconsistencies in pricing
      const invalidPricedVariants = await this.variantRepository
        .createQueryBuilder('variant')
        .innerJoin('variant.product', 'product')
        .where('product.merchantId = :merchantId', { merchantId: merchantConnection.merchantId })
        .andWhere('(variant.price <= 0 OR variant.price IS NULL)')
        .getMany();
      
      if (invalidPricedVariants.length > 0) {
        this.logger.warn(`Found ${invalidPricedVariants.length} variants with invalid pricing for ${shop}`);
        
        // Flag these for manual review rather than auto-fixing
        await this.notificationService.notifyAdmins({
          type: 'DATA_INTEGRITY_ISSUE',
          data: {
            shop,
            issue: 'Invalid pricing detected',
            count: invalidPricedVariants.length,
            variantIds: invalidPricedVariants.map(v => v.id)
          }
        });
      }
      
      this.logger.log(`Completed data integrity check for ${shop}`);
      
      return {
        success: true,
        issues: {
          orphanedVariants: orphanedVariants.length,
          inactiveProducts: inactiveProducts.length,
          invalidPricedVariants: invalidPricedVariants.length
        }
      };
    } catch (error) {
      this.logger.error(`Failed to process data integrity check for ${shop}`, error);
      
      await this.notificationService.notifyAdmins({
        type: 'SYNC_FAILURE',
        data: {
          shop,
          error: error.message,
          jobType: 'data-integrity-check'
        }
      });
      
      throw error;
    }
  }
}
```

### 3. Implement Sync Analytics Service

Create a service for tracking synchronization metrics:

```typescript
// src/modules/integrations/shopify-app/services/sync-analytics.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncEvent } from '../../../entities/sync-event.entity';

@Injectable()
export class SyncAnalyticsService {
  private readonly logger = new Logger(SyncAnalyticsService.name);

  constructor(
    @InjectRepository(SyncEvent)
    private readonly syncEventRepository: Repository<SyncEvent>,
  ) {}

  /**
   * Record a sync event
   */
  async recordSyncEvent(data: {
    shop: string;
    merchantId: string;
    eventType: 'PRODUCT_SYNC' | 'INVENTORY_SYNC' | 'BULK_OPERATION' | 'WEBHOOK' | 'DATA_INTEGRITY';
    status: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
    itemCount?: number;
    processingTimeMs?: number;
    errorMessage?: string;
    metadata?: any;
  }): Promise<SyncEvent> {
    try {
      const event = new SyncEvent();
      event.shopDomain = data.shop;
      event.merchantId = data.merchantId;
      event.eventType = data.eventType;
      event.status = data.status;
      event.itemCount = data.itemCount;
      event.processingTimeMs = data.processingTimeMs;
      event.errorMessage = data.errorMessage;
      event.metadata = data.metadata;
      
      const savedEvent = await this.syncEventRepository.save(event);
      
      this.logger.log(`Recorded ${data.eventType} sync event for ${data.shop}: ${data.status}`);
      
      return savedEvent;
    } catch (error) {
      this.logger.error(`Failed to record sync event for ${data.shop}`, error);
      throw error;
    }
  }

  /**
   * Get sync statistics for a merchant
   */
  async getSyncStats(shop: string): Promise<any> {
    try {
      // Get success rate for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const events = await this.syncEventRepository.find({
        where: {
          shopDomain: shop,
          createdAt: { $gte: thirtyDaysAgo }
        }
      });
      
      // Calculate success rate
      const totalEvents = events.length;
      const successEvents = events.filter(e => e.status === 'SUCCESS').length;
      const successRate = totalEvents > 0 ? (successEvents / totalEvents) * 100 : 100;
      
      // Calculate average processing time
      const processingTimes = events
        .filter(e => e.processingTimeMs !== null && e.processingTimeMs > 0)
        .map(e => e.processingTimeMs);
      
      const avgProcessingTime = processingTimes.length > 0
        ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
        : 0;
      
      // Get event counts by type
      const eventsByType = {};
      events.forEach(event => {
        eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
      });
      
      return {
        totalEvents,
        successRate,
        avgProcessingTime,
        eventsByType,
        // Last 5 failures for quick reference
        recentFailures: events
          .filter(e => e.status === 'FAILURE')
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5)
      };
    } catch (error) {
      this.logger.error(`Failed to get sync stats for ${shop}`, error);
      throw error;
    }
  }
}
```

### 4. Create Sync Event Entity for Analytics

Add a database entity for tracking sync events:

```typescript
// src/modules/entities/sync-event.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('sync_events')
export class SyncEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  shopDomain: string;

  @Index()
  @Column()
  merchantId: string;

  @Column()
  eventType: 'PRODUCT_SYNC' | 'INVENTORY_SYNC' | 'BULK_OPERATION' | 'WEBHOOK' | 'DATA_INTEGRITY';

  @Column()
  status: 'SUCCESS' | 'FAILURE' | 'PARTIAL';

  @Column({ nullable: true })
  itemCount: number;

  @Column({ nullable: true })
  processingTimeMs: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
```

### 5. Add Admin Dashboard for Sync Monitoring

Create a UI for monitoring sync status and performance:

```typescript
// app/routes/admin.sync-monitor.tsx

import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import {
  Page,
  Layout,
  LegacyCard,
  DataTable,
  Filters,
  Button,
  Banner,
  DatePicker,
  LegacyStack,
  Select,
  Text,
  Spinner
} from "@shopify/polaris";
import { authenticateAdmin } from "../admin.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticateAdmin(request);
  
  try {
    // Get list of merchants
    const merchantsResponse = await fetch(
      `${process.env.AVNU_API_URL}/api/admin/merchants?status=approved`,
      {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${admin.accessToken}` }
      }
    );
    
    if (!merchantsResponse.ok) {
      throw new Error('Failed to fetch merchants');
    }
    
    const merchantsData = await merchantsResponse.json();
    
    // Get recent sync events
    const eventsResponse = await fetch(
      `${process.env.AVNU_API_URL}/api/admin/sync-events?limit=100`,
      {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${admin.accessToken}` }
      }
    );
    
    if (!eventsResponse.ok) {
      throw new Error('Failed to fetch sync events');
    }
    
    const eventsData = await eventsResponse.json();
    
    return json({
      merchants: merchantsData.merchants,
      events: eventsData.events,
      errors: null
    });
  } catch (error) {
    console.error('Error fetching data', error);
    return json({
      merchants: [],
      events: [],
      errors: [error.message || 'An unexpected error occurred']
    });
  }
};

export default function SyncMonitor() {
  const { merchants, events, errors } = useLoaderData();
  
  const [selectedMerchant, setSelectedMerchant] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // One week ago
    end: new Date()
  });
  const [eventType, setEventType] = useState('all');
  
  // Filter events based on selections
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.createdAt);
    const matchesMerchant = selectedMerchant === 'all' || event.shopDomain === selectedMerchant;
    const matchesDate = eventDate >= dateRange.start && eventDate <= dateRange.end;
    const matchesType = eventType === 'all' || event.eventType === eventType;
    
    return matchesMerchant && matchesDate && matchesType;
  });
  
  // Prepare data for table
  const rows = filteredEvents.map(event => [
    new Date(event.createdAt).toLocaleString(),
    event.shopDomain,
    event.eventType,
    event.status,
    event.itemCount || '-',
    event.processingTimeMs ? `${(event.processingTimeMs / 1000).toFixed(2)}s` : '-',
    event.errorMessage || '-'
  ]);
  
  // Calculate stats
  const totalEvents = filteredEvents.length;
  const successEvents = filteredEvents.filter(e => e.status === 'SUCCESS').length;
  const successRate = totalEvents > 0 ? (successEvents / totalEvents) * 100 : 100;
  
  return (
    <Page title="Sync Monitoring">
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
            <Filters
              queryValue=""
              filters={[
                {
                  key: 'merchant',
                  label: 'Merchant',
                  filter: (
                    <Select
                      label=""
                      options={[
                        { label: 'All Merchants', value: 'all' },
                        ...merchants.map(m => ({ label: m.shopName, value: m.shopDomain }))
                      ]}
                      value={selectedMerchant}
                      onChange={setSelectedMerchant}
                    />
                  ),
                },
                {
                  key: 'eventType',
                  label: 'Event Type',
                  filter: (
                    <Select
                      label=""
                      options={[
                        { label: 'All Events', value: 'all' },
                        { label: 'Product Sync', value: 'PRODUCT_SYNC' },
                        { label: 'Inventory Sync', value: 'INVENTORY_SYNC' },
                        { label: 'Bulk Operation', value: 'BULK_OPERATION' },
                        { label: 'Webhook', value: 'WEBHOOK' },
                        { label: 'Data Integrity', value: 'DATA_INTEGRITY' }
                      ]}
                      value={eventType}
                      onChange={setEventType}
                    />
                  ),
                }
              ]}
            />
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section oneThird>
          <LegacyCard sectioned title="Sync Statistics">
            <LegacyStack vertical spacing="tight">
              <Text variant="bodyMd">
                <strong>Total Events:</strong> {totalEvents}
              </Text>
              <Text variant="bodyMd">
                <strong>Success Rate:</strong> {successRate.toFixed(2)}%
              </Text>
              <Text variant="bodyMd">
                <strong>Date Range:</strong> {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
              </Text>
            </LegacyStack>
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section>
          <LegacyCard>
            <DataTable
              columnContentTypes={['text', 'text', 'text', 'text', 'numeric', 'text', 'text']}
              headings={['Time', 'Shop', 'Event Type', 'Status', 'Items', 'Duration', 'Error']}
              rows={rows}
              sortable={[true, true, true, true, true, true, false]}
              defaultSortDirection="descending"
              defaultSortColumnIndex={0}
              footerContent={`Showing ${rows.length} of ${events.length} events`}
            />
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

### 6. Update Module Configuration

Update the Shopify module configuration:

```typescript
// Update src/modules/integrations/shopify-app/shopify.module.ts

import { ScheduleModule } from '@nestjs/schedule';
import { ShopifySchedulerService } from './services/shopify-scheduler.service';
import { ShopifySchedulerProcessor } from './processors/shopify-scheduler.processor';
import { SyncAnalyticsService } from './services/sync-analytics.service';
import { SyncEvent } from '../../entities/sync-event.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Add this for cron jobs
    TypeOrmModule.forFeature([
      MerchantPlatformConnection,
      Product,
      ProductVariant,
      SyncEvent // Add this entity
    ]),
    BullModule.registerQueue({
      name: 'shopify-sync',
    }),
    ConfigModule,
  ],
  providers: [
    // Existing providers
    ShopifySchedulerService,
    ShopifySchedulerProcessor,
    SyncAnalyticsService,
  ],
  // Update controllers and exports
})
export class ShopifyModule {
  // Existing configuration
}
```

## Dependencies & Prerequisites

- Completed Phase 3B (Bulk Operations)
- NestJS Schedule module for cron jobs
- Bull queue for background processing
- Data analytics capabilities

## Testing Guidelines

1. **Scheduled Jobs:**
   - Test cron job scheduling with mock timers
   - Verify staggered execution for multiple merchants
   - Test error handling and retry mechanisms

2. **Data Integrity:**
   - Create test cases for common data issues
   - Verify automatic repair of orphaned entities
   - Test alerting for critical data problems

3. **Analytics:**
   - Verify accurate recording of sync events
   - Test performance metrics calculation
   - Validate filtering in the monitoring dashboard

## Next Phase

With the completion of Phase 3C, the product synchronization engine is now fully implemented. The next phase in the Shopify Integration App is [Phase 4: Order Management](./shopify-app-phase4-order-management.md), which will focus on handling order synchronization and fulfillment.
