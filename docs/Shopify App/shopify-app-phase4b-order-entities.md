# Phase 4B: Order Management - Data Entities

## Objectives

- Define database entities for order data
- Implement relationships between orders, line items, and customers
- Create data transfer objects for API interactions

## Timeline: Weeks 14-15 (alongside Phase 4A)

## Tasks & Implementation Details

### 1. Order Entity

Create the primary order entity to store order information:

```typescript
// src/modules/entities/order.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { OrderLineItem } from './order-line-item.entity';
import { Merchant } from './merchant.entity';
import { Customer } from './customer.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  merchantId: string;

  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @Column({ nullable: true })
  @Index()
  customerId: string;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column()
  @Index()
  externalId: string; // Shopify order ID

  @Column()
  orderNumber: string; // Shopify order number (human-readable)

  @Column({ default: 'open' })
  status: 'open' | 'closed' | 'cancelled' | 'any';

  @Column({ default: 'pending' })
  financialStatus: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided';

  @Column({ default: 'unfulfilled' })
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled' | 'restocked';

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotalPrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalTax: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalDiscounts: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalShipping: number;
  
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  currency: string;

  @Column({ type: 'jsonb', nullable: true })
  billingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    country: string;
    zip: string;
    phone?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    country: string;
    zip: string;
    phone?: string;
  };

  @Column({ nullable: true })
  note: string;

  @Column({ type: 'jsonb', nullable: true })
  metafields: Record<string, any>;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ nullable: true })
  cancelReason: string;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  shippingLines: any[];

  @Column({ type: 'jsonb', nullable: true })
  taxLines: any[];

  @Column({ type: 'jsonb', nullable: true })
  discountApplications: any[];

  @Column({ default: false })
  synced: boolean;

  @Column({ default: false })
  needsAttention: boolean;

  @Column({ nullable: true })
  syncedAt: Date;

  @OneToMany(() => OrderLineItem, lineItem => lineItem.order, { cascade: true })
  lineItems: OrderLineItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  externalCreatedAt: Date; // Shopify created_at
}
```

### 2. Order Line Item Entity

Create the entity for order line items:

```typescript
// src/modules/entities/order-line-item.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('order_line_items')
export class OrderLineItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  orderId: string;

  @ManyToOne(() => Order, order => order.lineItems)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ nullable: true })
  productId: string;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ nullable: true })
  variantId: string;

  @ManyToOne(() => ProductVariant, { nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column()
  externalId: string; // Shopify line item ID

  @Column()
  externalProductId: string; // Shopify product ID

  @Column()
  externalVariantId: string; // Shopify variant ID

  @Column()
  title: string;

  @Column({ nullable: true })
  variantTitle: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({ default: 0 })
  quantityFulfilled: number;

  @Column({ nullable: true })
  sku: string;

  @Column({ nullable: true })
  vendor: string;

  @Column({ nullable: true })
  requiresShipping: boolean;

  @Column({ nullable: true })
  taxable: boolean;

  @Column({ type: 'jsonb', nullable: true })
  taxLines: any[];

  @Column({ type: 'jsonb', nullable: true })
  discountAllocations: any[];

  @Column({ type: 'jsonb', nullable: true })
  properties: Record<string, any>;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: false })
  giftCard: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 3. Customer Entity

Create a customer entity to store customer information:

```typescript
// src/modules/entities/customer.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { Order } from './order.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  merchantId: string;

  @Column({ nullable: true })
  @Index()
  externalId: string; // Shopify customer ID

  @Column({ nullable: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ default: false })
  acceptsMarketing: boolean;

  @Column({ nullable: true })
  taxExempt: boolean;

  @Column({ nullable: true })
  ordersCount: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  totalSpent: number;

  @Column({ nullable: true })
  note: string;

  @Column({ type: 'jsonb', nullable: true })
  defaultAddress: {
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    country: string;
    zip: string;
    phone?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  addresses: any[];

  @Column({ type: 'jsonb', nullable: true })
  metafields: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @OneToMany(() => Order, order => order.customer)
  orders: Order[];

  @Column({ default: false })
  synced: boolean;

  @Column({ nullable: true })
  syncedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  externalCreatedAt: Date; // Shopify created_at
}
```

### 4. Order DTOs (Data Transfer Objects)

Create DTOs for API interactions:

```typescript
// src/modules/integrations/shopify-app/dtos/order.dto.ts

import { IsString, IsNumber, IsDate, IsBoolean, IsObject, IsArray, IsOptional, IsEnum } from 'class-validator';

export class OrderAddressDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  address1: string;

  @IsOptional()
  @IsString()
  address2?: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsString()
  country: string;

  @IsString()
  zip: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class OrderLineItemDto {
  @IsString()
  externalId: string;

  @IsString()
  externalProductId: string;

  @IsString()
  externalVariantId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  variantTitle?: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  quantityFulfilled?: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsBoolean()
  requiresShipping?: boolean;

  @IsOptional()
  @IsBoolean()
  taxable?: boolean;

  @IsOptional()
  @IsArray()
  taxLines?: any[];

  @IsOptional()
  @IsArray()
  discountAllocations?: any[];

  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  giftCard?: boolean;
}

export class CreateOrderDto {
  @IsString()
  merchantId: string;

  @IsString()
  externalId: string;

  @IsString()
  orderNumber: string;

  @IsEnum(['open', 'closed', 'cancelled', 'any'])
  status: 'open' | 'closed' | 'cancelled' | 'any';

  @IsEnum(['pending', 'authorized', 'partially_paid', 'paid', 'partially_refunded', 'refunded', 'voided'])
  financialStatus: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided';

  @IsEnum(['unfulfilled', 'partial', 'fulfilled', 'restocked'])
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled' | 'restocked';

  @IsNumber()
  totalPrice: number;

  @IsNumber()
  subtotalPrice: number;

  @IsOptional()
  @IsNumber()
  totalTax?: number;

  @IsOptional()
  @IsNumber()
  totalDiscounts?: number;

  @IsOptional()
  @IsNumber()
  totalShipping?: number;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  currency: string;

  @IsOptional()
  @IsObject()
  billingAddress?: OrderAddressDto;

  @IsOptional()
  @IsObject()
  shippingAddress?: OrderAddressDto;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsObject()
  metafields?: Record<string, any>;

  @IsOptional()
  @IsDate()
  cancelledAt?: Date;

  @IsOptional()
  @IsString()
  cancelReason?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsArray()
  shippingLines?: any[];

  @IsOptional()
  @IsArray()
  taxLines?: any[];

  @IsOptional()
  @IsArray()
  discountApplications?: any[];

  @IsArray()
  lineItems: OrderLineItemDto[];

  @IsOptional()
  @IsDate()
  externalCreatedAt?: Date;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(['open', 'closed', 'cancelled', 'any'])
  status?: 'open' | 'closed' | 'cancelled' | 'any';

  @IsOptional()
  @IsEnum(['pending', 'authorized', 'partially_paid', 'paid', 'partially_refunded', 'refunded', 'voided'])
  financialStatus?: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided';

  @IsOptional()
  @IsEnum(['unfulfilled', 'partial', 'fulfilled', 'restocked'])
  fulfillmentStatus?: 'unfulfilled' | 'partial' | 'fulfilled' | 'restocked';

  @IsOptional()
  @IsDate()
  cancelledAt?: Date;

  @IsOptional()
  @IsString()
  cancelReason?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  synced?: boolean;

  @IsOptional()
  @IsBoolean()
  needsAttention?: boolean;
}
```

### 5. Database Migrations

Create a migration for these new entities:

```typescript
// Create with: npx typeorm migration:create -n OrderEntities

import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderEntities1684500001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create customers table
    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "merchant_id" uuid NOT NULL,
        "external_id" varchar,
        "email" varchar,
        "phone" varchar,
        "first_name" varchar,
        "last_name" varchar,
        "accepts_marketing" boolean DEFAULT false,
        "tax_exempt" boolean,
        "orders_count" integer,
        "total_spent" decimal(10,2),
        "note" text,
        "default_address" jsonb,
        "addresses" jsonb,
        "metafields" jsonb,
        "tags" jsonb,
        "synced" boolean DEFAULT false,
        "synced_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "external_created_at" timestamp,
        CONSTRAINT "fk_customers_merchant" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "idx_customers_merchant_id" ON "customers"("merchant_id");
      CREATE INDEX "idx_customers_external_id" ON "customers"("external_id");
      CREATE INDEX "idx_customers_email" ON "customers"("email");
    `);
    
    // Create orders table
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "merchant_id" uuid NOT NULL,
        "customer_id" uuid,
        "external_id" varchar NOT NULL,
        "order_number" varchar NOT NULL,
        "status" varchar NOT NULL DEFAULT 'open',
        "financial_status" varchar NOT NULL DEFAULT 'pending',
        "fulfillment_status" varchar NOT NULL DEFAULT 'unfulfilled',
        "total_price" decimal(10,2) NOT NULL DEFAULT 0,
        "subtotal_price" decimal(10,2) NOT NULL DEFAULT 0,
        "total_tax" decimal(10,2) NOT NULL DEFAULT 0,
        "total_discounts" decimal(10,2) NOT NULL DEFAULT 0,
        "total_shipping" decimal(10,2) NOT NULL DEFAULT 0,
        "email" varchar,
        "phone" varchar,
        "currency" varchar NOT NULL,
        "billing_address" jsonb,
        "shipping_address" jsonb,
        "note" text,
        "metafields" jsonb,
        "cancelled_at" timestamp,
        "cancel_reason" varchar,
        "tags" jsonb,
        "shipping_lines" jsonb,
        "tax_lines" jsonb,
        "discount_applications" jsonb,
        "synced" boolean DEFAULT false,
        "needs_attention" boolean DEFAULT false,
        "synced_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "external_created_at" timestamp,
        CONSTRAINT "fk_orders_merchant" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_orders_customer" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL
      );
      
      CREATE INDEX "idx_orders_merchant_id" ON "orders"("merchant_id");
      CREATE INDEX "idx_orders_customer_id" ON "orders"("customer_id");
      CREATE INDEX "idx_orders_external_id" ON "orders"("external_id");
    `);
    
    // Create order line items table
    await queryRunner.query(`
      CREATE TABLE "order_line_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "product_id" uuid,
        "variant_id" uuid,
        "external_id" varchar NOT NULL,
        "external_product_id" varchar NOT NULL,
        "external_variant_id" varchar NOT NULL,
        "title" varchar NOT NULL,
        "variant_title" varchar,
        "price" decimal(10,2) NOT NULL,
        "quantity" integer NOT NULL DEFAULT 1,
        "quantity_fulfilled" integer NOT NULL DEFAULT 0,
        "sku" varchar,
        "vendor" varchar,
        "requires_shipping" boolean,
        "taxable" boolean,
        "tax_lines" jsonb,
        "discount_allocations" jsonb,
        "properties" jsonb,
        "image_url" varchar,
        "gift_card" boolean DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_line_items_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_line_items_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_line_items_variant" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL
      );
      
      CREATE INDEX "idx_line_items_order_id" ON "order_line_items"("order_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "order_line_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "customers"`);
  }
}
```

### 6. Update Module Configuration

Update the TypeORM configuration to include the new entities:

```typescript
// Update src/app.module.ts to include new entities

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        // Existing entities
        Merchant,
        MerchantPlatformConnection,
        Product,
        ProductVariant,
        // New entities
        Customer,
        Order,
        OrderLineItem
      ],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    // Other modules
  ],
  // Rest of the module config
})
export class AppModule {}
```

## Dependencies & Prerequisites

- Completed Phase 3 (Product Synchronization)
- TypeORM for database interactions
- PostgreSQL database with UUID extension enabled

## Testing Guidelines

1. **Database Schema:**
   - Verify migration runs successfully
   - Test entity relationships and constraints
   - Check indexes for query performance

2. **Entity Data Types:**
   - Test all field types, especially decimal and JSON fields
   - Verify enum constraints work correctly
   - Test nullable vs required fields

3. **Data Validation:**
   - Test DTOs with valid and invalid data
   - Verify validation error messages
   - Test conversion between Shopify format and internal entities

## Next Phase

Once the order entities are in place, proceed to [Phase 4C: Order Service](./shopify-app-phase4c-order-service.md) to implement the business logic for handling orders.
