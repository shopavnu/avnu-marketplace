# Phase 3A: Product Synchronization - Webhook Handlers

## Objectives

- Implement real-time product synchronization through Shopify webhooks
- Create handlers for product, variant, inventory, and price changes
- Set up data transformation between Shopify and Avnu schemas
- Handle webhook retries and error scenarios

## Timeline: Weeks 8-9 (First part of Phase 3)

## Tasks & Implementation Details

### 1. Enhance Webhook Controller Implementation

Extend the basic controller from Phase 1 to fully handle product data:

```typescript
// src/modules/integrations/shopify-app/controllers/shopify-webhook.controller.ts

import { Controller, Post, Headers, Body, Logger } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ShopifySyncService } from '../services/shopify-sync.service';
import { BullQueue, InjectQueue } from '@nestjs/bull';

@Controller('webhooks/shopify')
@SkipThrottle() // Skip rate limiting for webhooks
export class ShopifyWebhookController {
  private readonly logger = new Logger(ShopifyWebhookController.name);

  constructor(
    private readonly shopifySyncService: ShopifySyncService,
    @InjectQueue('shopify-sync') private syncQueue: BullQueue,
  ) {}

  @Post('products')
  async handleProductWebhook(
    @Headers('x-shopify-shop-domain') shop: string,
    @Headers('x-shopify-topic') topic: string,
    @Body() data: any,
  ) {
    this.logger.log(`Received ${topic} webhook from ${shop}`);
    
    // Process based on specific event type
    const eventType = topic.split('/')[1];
    
    try {
      switch (eventType) {
        case 'CREATE':
          await this.shopifySyncService.handleProductCreated(shop, data);
          break;
        case 'UPDATE':
          await this.shopifySyncService.handleProductUpdated(shop, data);
          break;
        case 'DELETE':
          await this.shopifySyncService.handleProductDeleted(shop, data);
          break;
        default:
          this.logger.warn(`Unknown product event type: ${eventType}`);
      }
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing ${topic} webhook: ${error.message}`, error.stack);
      
      // Queue for retry
      await this.syncQueue.add('retry-product-webhook', {
        shop,
        topic,
        data,
        attempts: 1,
        timestamp: new Date().toISOString()
      }, {
        delay: 60000, // Retry after 1 minute
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 60000
        }
      });
      
      return { success: false, queued: true };
    }
  }
  
  @Post('variants')
  async handleVariantWebhook(
    @Headers('x-shopify-shop-domain') shop: string,
    @Headers('x-shopify-topic') topic: string,
    @Body() data: any,
  ) {
    this.logger.log(`Received ${topic} webhook from ${shop}`);
    
    const eventType = topic.split('/')[1];
    
    try {
      switch (eventType) {
        case 'CREATE':
          await this.shopifySyncService.handleVariantCreated(shop, data);
          break;
        case 'UPDATE':
          await this.shopifySyncService.handleVariantUpdated(shop, data);
          break;
        default:
          this.logger.warn(`Unknown variant event type: ${eventType}`);
      }
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing ${topic} webhook: ${error.message}`, error.stack);
      
      // Queue for retry
      await this.syncQueue.add('retry-variant-webhook', {
        shop,
        topic,
        data,
        attempts: 1,
        timestamp: new Date().toISOString()
      }, {
        delay: 60000,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 60000
        }
      });
      
      return { success: false, queued: true };
    }
  }
  
  @Post('inventory')
  async handleInventoryWebhook(
    @Headers('x-shopify-shop-domain') shop: string,
    @Headers('x-shopify-topic') topic: string,
    @Body() data: any,
  ) {
    this.logger.log(`Received ${topic} webhook from ${shop}`);
    
    try {
      await this.shopifySyncService.handleInventoryUpdate(shop, data);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing ${topic} webhook: ${error.message}`, error.stack);
      
      // Queue for retry
      await this.syncQueue.add('retry-inventory-webhook', {
        shop,
        topic,
        data,
        attempts: 1,
        timestamp: new Date().toISOString()
      }, {
        delay: 60000,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 60000
        }
      });
      
      return { success: false, queued: true };
    }
  }
}
```

### 2. Create Shopify Sync Service

Implement a service to handle the business logic for product synchronization:

```typescript
// src/modules/integrations/shopify-app/services/shopify-sync.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantPlatformConnection } from '../../../entities/merchant-platform-connection.entity';
import { Product } from '../../../entities/product.entity';
import { ProductVariant } from '../../../entities/product-variant.entity';
import { ShopifyClientService } from './shopify-client.service';

@Injectable()
export class ShopifySyncService {
  private readonly logger = new Logger(ShopifySyncService.name);

  constructor(
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantConnectionRepository: Repository<MerchantPlatformConnection>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    private readonly shopifyClientService: ShopifyClientService,
  ) {}

  /**
   * Handle product creation webhook
   */
  async handleProductCreated(shop: string, productData: any): Promise<void> {
    const merchantConnection = await this.getMerchantConnection(shop);
    
    // Check if this product is selected for sync
    if (!await this.isProductSelected(merchantConnection, productData.id)) {
      this.logger.log(`Product ${productData.id} not selected for sync, skipping`);
      return;
    }
    
    // Transform Shopify product to Avnu product
    const avnuProduct = this.transformShopifyProduct(productData, merchantConnection);
    
    // Save to database
    await this.productRepository.save(avnuProduct);
    
    this.logger.log(`Product created: ${productData.id} (${productData.title})`);
  }

  /**
   * Handle product update webhook
   */
  async handleProductUpdated(shop: string, productData: any): Promise<void> {
    const merchantConnection = await this.getMerchantConnection(shop);
    
    // Check if product exists
    const existingProduct = await this.productRepository.findOne({
      where: {
        externalId: productData.id,
        merchantId: merchantConnection.merchantId
      },
      relations: ['variants']
    });
    
    // Check if this product is selected for sync
    if (!await this.isProductSelected(merchantConnection, productData.id)) {
      // If product exists but is no longer selected, unpublish it
      if (existingProduct) {
        existingProduct.status = 'INACTIVE';
        await this.productRepository.save(existingProduct);
        this.logger.log(`Product ${productData.id} unpublished (no longer selected)`);
      }
      return;
    }
    
    // Transform Shopify product to Avnu product
    const avnuProduct = this.transformShopifyProduct(productData, merchantConnection);
    
    if (existingProduct) {
      // Update existing product
      avnuProduct.id = existingProduct.id;
      
      // Handle variant updates
      await this.handleVariantUpdates(existingProduct, avnuProduct);
    }
    
    // Save to database
    await this.productRepository.save(avnuProduct);
    
    this.logger.log(`Product updated: ${productData.id} (${productData.title})`);
  }

  /**
   * Handle product deletion webhook
   */
  async handleProductDeleted(shop: string, productData: any): Promise<void> {
    const merchantConnection = await this.getMerchantConnection(shop);
    
    // Find product
    const existingProduct = await this.productRepository.findOne({
      where: {
        externalId: productData.id,
        merchantId: merchantConnection.merchantId
      }
    });
    
    if (existingProduct) {
      // Set product status to deleted
      existingProduct.status = 'DELETED';
      await this.productRepository.save(existingProduct);
      
      this.logger.log(`Product marked as deleted: ${productData.id}`);
    }
  }

  /**
   * Handle variant creation webhook
   */
  async handleVariantCreated(shop: string, variantData: any): Promise<void> {
    const merchantConnection = await this.getMerchantConnection(shop);
    
    // Get product ID from variant data
    const productId = variantData.product_id;
    
    // Check if this product is selected for sync
    if (!await this.isProductSelected(merchantConnection, productId)) {
      this.logger.log(`Product ${productId} not selected for sync, skipping variant update`);
      return;
    }
    
    // Find the product
    const product = await this.productRepository.findOne({
      where: {
        externalId: productId.toString(),
        merchantId: merchantConnection.merchantId
      }
    });
    
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }
    
    // Transform and save the variant
    const avnuVariant = this.transformShopifyVariant(variantData, product);
    await this.variantRepository.save(avnuVariant);
    
    this.logger.log(`Variant created: ${variantData.id} for product ${productId}`);
  }

  /**
   * Handle variant update webhook
   */
  async handleVariantUpdated(shop: string, variantData: any): Promise<void> {
    const merchantConnection = await this.getMerchantConnection(shop);
    
    // Get product ID from variant data
    const productId = variantData.product_id;
    
    // Check if this product is selected for sync
    if (!await this.isProductSelected(merchantConnection, productId)) {
      this.logger.log(`Product ${productId} not selected for sync, skipping variant update`);
      return;
    }
    
    // Find the product
    const product = await this.productRepository.findOne({
      where: {
        externalId: productId.toString(),
        merchantId: merchantConnection.merchantId
      }
    });
    
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }
    
    // Find existing variant
    const existingVariant = await this.variantRepository.findOne({
      where: {
        externalId: variantData.id.toString(),
        productId: product.id
      }
    });
    
    // Transform Shopify variant to Avnu variant
    const avnuVariant = this.transformShopifyVariant(variantData, product);
    
    if (existingVariant) {
      avnuVariant.id = existingVariant.id;
    }
    
    await this.variantRepository.save(avnuVariant);
    
    this.logger.log(`Variant updated: ${variantData.id} for product ${productId}`);
  }

  /**
   * Handle inventory update webhook
   */
  async handleInventoryUpdate(shop: string, inventoryData: any): Promise<void> {
    const merchantConnection = await this.getMerchantConnection(shop);
    
    // Find the variant by inventory_item_id
    const variant = await this.variantRepository.findOne({
      where: {
        inventoryItemId: inventoryData.inventory_item_id.toString()
      },
      relations: ['product']
    });
    
    if (!variant) {
      this.logger.warn(`Variant with inventory_item_id ${inventoryData.inventory_item_id} not found`);
      return;
    }
    
    // Check if the product is selected for sync
    if (!await this.isProductSelected(merchantConnection, variant.product.externalId)) {
      this.logger.log(`Product ${variant.product.externalId} not selected for sync, skipping inventory update`);
      return;
    }
    
    // Update inventory
    variant.inventoryQuantity = inventoryData.available;
    await this.variantRepository.save(variant);
    
    this.logger.log(`Inventory updated for variant ${variant.externalId}: ${inventoryData.available} units available`);
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

  /**
   * Check if a product is selected for sync
   */
  private async isProductSelected(
    merchantConnection: MerchantPlatformConnection,
    productId: string | number
  ): Promise<boolean> {
    // Format product ID to match the format in the database
    const formattedId = typeof productId === 'number' 
      ? `gid://shopify/Product/${productId}`
      : productId;
    
    // Check if product is in the selected list
    return merchantConnection.selectedProductIds?.includes(formattedId) || false;
  }

  /**
   * Transform Shopify product to Avnu product
   */
  private transformShopifyProduct(
    shopifyProduct: any,
    merchantConnection: MerchantPlatformConnection
  ): Product {
    const product = new Product();
    
    // Map basic fields
    product.merchantId = merchantConnection.merchantId;
    product.externalId = shopifyProduct.id.toString();
    product.title = shopifyProduct.title;
    product.description = shopifyProduct.body_html || '';
    product.handle = shopifyProduct.handle;
    product.productType = shopifyProduct.product_type;
    product.vendor = shopifyProduct.vendor;
    product.tags = shopifyProduct.tags ? shopifyProduct.tags.split(',').map(tag => tag.trim()) : [];
    product.status = shopifyProduct.status === 'active' ? 'ACTIVE' : 'INACTIVE';
    product.publishedAt = shopifyProduct.published_at ? new Date(shopifyProduct.published_at) : null;
    
    // Extract images
    if (shopifyProduct.images && shopifyProduct.images.length > 0) {
      product.featuredImageUrl = shopifyProduct.images[0].src;
      product.imageUrls = shopifyProduct.images.map(img => img.src);
    }
    
    // Handle variants
    if (shopifyProduct.variants) {
      product.variants = shopifyProduct.variants.map(variant => 
        this.transformShopifyVariant(variant, product)
      );
    }
    
    return product;
  }

  /**
   * Transform Shopify variant to Avnu variant
   */
  private transformShopifyVariant(shopifyVariant: any, product: Product): ProductVariant {
    const variant = new ProductVariant();
    
    // Map basic fields
    variant.productId = product.id;
    variant.externalId = shopifyVariant.id.toString();
    variant.title = shopifyVariant.title;
    variant.sku = shopifyVariant.sku || '';
    variant.price = parseFloat(shopifyVariant.price);
    variant.compareAtPrice = shopifyVariant.compare_at_price 
      ? parseFloat(shopifyVariant.compare_at_price) 
      : null;
    variant.weight = parseFloat(shopifyVariant.weight || '0');
    variant.weightUnit = shopifyVariant.weight_unit || 'kg';
    variant.inventoryItemId = shopifyVariant.inventory_item_id?.toString();
    variant.inventoryQuantity = shopifyVariant.inventory_quantity || 0;
    variant.requiresShipping = shopifyVariant.requires_shipping || true;
    
    // Handle options
    if (shopifyVariant.option1) variant.option1 = shopifyVariant.option1;
    if (shopifyVariant.option2) variant.option2 = shopifyVariant.option2;
    if (shopifyVariant.option3) variant.option3 = shopifyVariant.option3;
    
    // Handle image if present
    if (shopifyVariant.image_id && product.imageUrls) {
      // Find matching image from product
      const variantImage = product.imageUrls.find(img => 
        img.includes(shopifyVariant.image_id.toString())
      );
      if (variantImage) {
        variant.imageUrl = variantImage;
      }
    }
    
    return variant;
  }

  /**
   * Handle updates to product variants
   */
  private async handleVariantUpdates(
    existingProduct: Product,
    updatedProduct: Product
  ): Promise<void> {
    // Get existing variant IDs
    const existingVariantIds = existingProduct.variants.map(v => v.externalId);
    
    // Get updated variant IDs
    const updatedVariantIds = updatedProduct.variants.map(v => v.externalId);
    
    // Find variants to delete (in existing but not in updated)
    const variantsToDelete = existingProduct.variants.filter(
      v => !updatedVariantIds.includes(v.externalId)
    );
    
    // Delete variants that are no longer present
    if (variantsToDelete.length > 0) {
      await this.variantRepository.remove(variantsToDelete);
    }
    
    // Set existing variant IDs on updated variants to maintain relationships
    for (const variant of updatedProduct.variants) {
      const existingVariant = existingProduct.variants.find(
        v => v.externalId === variant.externalId
      );
      
      if (existingVariant) {
        variant.id = existingVariant.id;
      }
    }
  }
}
```

### 3. Create Database Entities

Define the database structure for products and variants:

```typescript
// src/modules/entities/product.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { Merchant } from './merchant.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  merchantId: string;

  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @Column()
  externalId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  handle: string;

  @Column({ nullable: true })
  productType: string;

  @Column({ nullable: true })
  vendor: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column()
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ nullable: true })
  featuredImageUrl: string;

  @Column('simple-array', { nullable: true })
  imageUrls: string[];

  @OneToMany(() => ProductVariant, variant => variant.product, { cascade: true })
  variants: ProductVariant[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

```typescript
// src/modules/entities/product-variant.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, product => product.variants)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  externalId: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  sku: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  compareAtPrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  weight: number;

  @Column({ default: 'kg' })
  weightUnit: string;

  @Column({ nullable: true })
  inventoryItemId: string;

  @Column({ default: 0 })
  inventoryQuantity: number;

  @Column({ default: true })
  requiresShipping: boolean;

  @Column({ nullable: true })
  option1: string;

  @Column({ nullable: true })
  option2: string;

  @Column({ nullable: true })
  option3: string;

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 4. Implement Background Queue Processor

Create a processor for webhook retries and background synchronization:

```typescript
// src/modules/integrations/shopify-app/processors/shopify-sync.processor.ts

import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ShopifySyncService } from '../services/shopify-sync.service';

@Processor('shopify-sync')
export class ShopifySyncProcessor {
  private readonly logger = new Logger(ShopifySyncProcessor.name);

  constructor(private readonly shopifySyncService: ShopifySyncService) {}

  @Process('retry-product-webhook')
  async processProductWebhookRetry(job: Job) {
    const { shop, topic, data, attempts } = job.data;
    
    this.logger.log(`Processing product webhook retry ${attempts} for shop ${shop}`);
    
    try {
      const eventType = topic.split('/')[1];
      
      switch (eventType) {
        case 'CREATE':
          await this.shopifySyncService.handleProductCreated(shop, data);
          break;
        case 'UPDATE':
          await this.shopifySyncService.handleProductUpdated(shop, data);
          break;
        case 'DELETE':
          await this.shopifySyncService.handleProductDeleted(shop, data);
          break;
      }
      
      this.logger.log(`Successfully processed product webhook retry for ${shop}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing product webhook retry: ${error.message}`, error.stack);
      
      // If max retries reached, log but don't rethrow to avoid clogging the queue
      if (attempts >= 5) {
        this.logger.error(`Max retries reached for product webhook from ${shop}, giving up`);
        return { success: false, error: error.message, maxRetriesReached: true };
      }
      
      // Otherwise, throw to trigger a retry
      throw error;
    }
  }

  @Process('retry-variant-webhook')
  async processVariantWebhookRetry(job: Job) {
    const { shop, topic, data, attempts } = job.data;
    
    this.logger.log(`Processing variant webhook retry ${attempts} for shop ${shop}`);
    
    try {
      const eventType = topic.split('/')[1];
      
      switch (eventType) {
        case 'CREATE':
          await this.shopifySyncService.handleVariantCreated(shop, data);
          break;
        case 'UPDATE':
          await this.shopifySyncService.handleVariantUpdated(shop, data);
          break;
      }
      
      this.logger.log(`Successfully processed variant webhook retry for ${shop}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing variant webhook retry: ${error.message}`, error.stack);
      
      if (attempts >= 5) {
        this.logger.error(`Max retries reached for variant webhook from ${shop}, giving up`);
        return { success: false, error: error.message, maxRetriesReached: true };
      }
      
      throw error;
    }
  }

  @Process('retry-inventory-webhook')
  async processInventoryWebhookRetry(job: Job) {
    const { shop, topic, data, attempts } = job.data;
    
    this.logger.log(`Processing inventory webhook retry ${attempts} for shop ${shop}`);
    
    try {
      await this.shopifySyncService.handleInventoryUpdate(shop, data);
      
      this.logger.log(`Successfully processed inventory webhook retry for ${shop}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing inventory webhook retry: ${error.message}`, error.stack);
      
      if (attempts >= 5) {
        this.logger.error(`Max retries reached for inventory webhook from ${shop}, giving up`);
        return { success: false, error: error.message, maxRetriesReached: true };
      }
      
      throw error;
    }
  }
}
```

### 5. Update Module Configuration

Update the Shopify module to include these new components:

```typescript
// src/modules/integrations/shopify-app/shopify.module.ts

import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { Product } from '../../entities/product.entity';
import { ProductVariant } from '../../entities/product-variant.entity';
import { ShopifyAuthService } from './services/shopify-auth.service';
import { ShopifyClientService } from './services/shopify-client.service';
import { ShopifySyncService } from './services/shopify-sync.service';
import { ShopifyAuthController } from './controllers/shopify-auth.controller';
import { ShopifyWebhookController } from './controllers/shopify-webhook.controller';
import { ShopifyWebhookMiddleware } from './middleware/shopify-webhook.middleware';
import { ShopifySyncProcessor } from './processors/shopify-sync.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MerchantPlatformConnection,
      Product,
      ProductVariant
    ]),
    BullModule.registerQueue({
      name: 'shopify-sync',
    }),
    ConfigModule,
  ],
  providers: [
    ShopifyAuthService,
    ShopifyClientService,
    ShopifySyncService,
    ShopifySyncProcessor,
  ],
  controllers: [
    ShopifyAuthController,
    ShopifyWebhookController,
  ],
  exports: [
    ShopifyAuthService,
    ShopifyClientService,
    ShopifySyncService,
  ],
})
export class ShopifyModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ShopifyWebhookMiddleware)
      .forRoutes(
        { path: 'webhooks/shopify/*', method: RequestMethod.POST }
      );
  }
}
```

## Dependencies & Prerequisites

- Completed Phase 1 infrastructure with webhook setup
- Bull queue for background processing
- TypeORM for database interactions
- Redis for queue storage

## Testing Guidelines

1. **Webhook Processing:**
   - Test each webhook type with sample payloads
   - Verify correct data transformation and storage
   - Test error handling and retry mechanisms

2. **Product Synchronization:**
   - Verify all product data is correctly mapped
   - Test variant and inventory updates
   - Ensure selected product filtering works correctly

3. **Performance Testing:**
   - Test with large product payloads
   - Verify handling of high webhook volume
   - Test retry mechanisms under load

## Next Phase

Once the webhook handlers are implemented, proceed to [Phase 3B: Bulk Import/Export](./shopify-app-phase3b-bulk-operations.md) to implement large-scale data operations for initial product sync.
