# Phase 4D-1: Fulfillment Management - Entities

## Objectives

- Define database entities for storing fulfillment data
- Create relationships between fulfillments, orders, and tracking information
- Implement data transfer objects for fulfillment operations

## Timeline: Week 16

## Tasks & Implementation Details

### 1. Fulfillment Entity

Create the entity to store fulfillment information:

```typescript
// src/modules/entities/fulfillment.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Order } from './order.entity';
import { FulfillmentLineItem } from './fulfillment-line-item.entity';
import { FulfillmentTracking } from './fulfillment-tracking.entity';

@Entity('fulfillments')
export class Fulfillment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  orderId: string;

  @ManyToOne(() => Order, order => order.fulfillments)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column()
  @Index()
  externalId: string; // Shopify fulfillment ID

  @Column({ default: 'pending' })
  status: 'pending' | 'open' | 'success' | 'cancelled' | 'error' | 'failure';

  @Column({ nullable: true })
  locationId: string;

  @Column({ nullable: true })
  trackingCompany: string;

  @Column({ nullable: true })
  trackingNumber: string;

  @Column({ nullable: true })
  trackingUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  trackingUrls: string[];

  @Column({ nullable: true })
  estimatedDeliveryAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  notifyCustomer: boolean;

  @Column({ nullable: true })
  note: string;

  @Column({ type: 'jsonb', nullable: true })
  metafields: Record<string, any>;

  @OneToMany(() => FulfillmentLineItem, lineItem => lineItem.fulfillment, { cascade: true })
  lineItems: FulfillmentLineItem[];

  @OneToMany(() => FulfillmentTracking, tracking => tracking.fulfillment, { cascade: true })
  trackingInfo: FulfillmentTracking[];

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

### 2. Fulfillment Line Item Entity

Create the entity for fulfillment line items:

```typescript
// src/modules/entities/fulfillment-line-item.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Fulfillment } from './fulfillment.entity';
import { OrderLineItem } from './order-line-item.entity';

@Entity('fulfillment_line_items')
export class FulfillmentLineItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  fulfillmentId: string;

  @ManyToOne(() => Fulfillment, fulfillment => fulfillment.lineItems)
  @JoinColumn({ name: 'fulfillment_id' })
  fulfillment: Fulfillment;

  @Column()
  @Index()
  orderLineItemId: string;

  @ManyToOne(() => OrderLineItem)
  @JoinColumn({ name: 'order_line_item_id' })
  orderLineItem: OrderLineItem;

  @Column()
  @Index()
  externalId: string; // Shopify fulfillment line item ID

  @Column()
  externalLineItemId: string; // Shopify line item ID

  @Column()
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 3. Fulfillment Tracking Entity

Create the entity for tracking information:

```typescript
// src/modules/entities/fulfillment-tracking.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Fulfillment } from './fulfillment.entity';

@Entity('fulfillment_tracking')
export class FulfillmentTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  fulfillmentId: string;

  @ManyToOne(() => Fulfillment, fulfillment => fulfillment.trackingInfo)
  @JoinColumn({ name: 'fulfillment_id' })
  fulfillment: Fulfillment;

  @Column()
  company: string;

  @Column()
  number: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  estimatedDeliveryAt: Date;

  @Column({ default: false })
  notifiedCustomer: boolean;

  @Column({ type: 'jsonb', nullable: true })
  shipmentStatus: {
    status: string;
    label: string;
    updatedAt: Date;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 4. Update Order Entity

Add fulfillment relationship to the Order entity:

```typescript
// Update src/modules/entities/order.entity.ts

import { Fulfillment } from './fulfillment.entity';

@Entity('orders')
export class Order {
  // Existing properties
  
  @OneToMany(() => Fulfillment, fulfillment => fulfillment.order)
  fulfillments: Fulfillment[];
  
  // Additional fulfillment-related fields
  @Column({ default: 'unfulfilled' })
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled' | 'restocked';
}
```

### 5. Fulfillment DTOs (Data Transfer Objects)

Create DTOs for API interactions:

```typescript
// src/modules/integrations/shopify-app/dtos/fulfillment.dto.ts

import { IsString, IsNumber, IsDate, IsBoolean, IsObject, IsArray, IsOptional, IsEnum, IsUUID } from 'class-validator';

export class FulfillmentLineItemDto {
  @IsUUID()
  orderLineItemId: string;

  @IsNumber()
  quantity: number;
}

export class FulfillmentTrackingDto {
  @IsString()
  company: string;

  @IsString()
  number: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsDate()
  estimatedDeliveryAt?: Date;
}

export class CreateFulfillmentDto {
  @IsUUID()
  orderId: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  trackingCompany?: string;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  trackingUrl?: string;

  @IsOptional()
  @IsArray()
  trackingUrls?: string[];

  @IsOptional()
  @IsDate()
  estimatedDeliveryAt?: Date;

  @IsOptional()
  @IsBoolean()
  notifyCustomer?: boolean;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsObject()
  metafields?: Record<string, any>;

  @IsArray()
  lineItems: FulfillmentLineItemDto[];

  @IsOptional()
  @IsArray()
  trackingInfo?: FulfillmentTrackingDto[];
}

export class UpdateFulfillmentDto {
  @IsOptional()
  @IsEnum(['pending', 'open', 'success', 'cancelled', 'error', 'failure'])
  status?: 'pending' | 'open' | 'success' | 'cancelled' | 'error' | 'failure';

  @IsOptional()
  @IsString()
  trackingCompany?: string;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  trackingUrl?: string;

  @IsOptional()
  @IsArray()
  trackingUrls?: string[];

  @IsOptional()
  @IsDate()
  estimatedDeliveryAt?: Date;

  @IsOptional()
  @IsBoolean()
  notifyCustomer?: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}

export class AddTrackingDto {
  @IsString()
  company: string;

  @IsString()
  number: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsDate()
  estimatedDeliveryAt?: Date;

  @IsOptional()
  @IsBoolean()
  notifyCustomer?: boolean;
}
```

### 6. Database Migrations

Create a migration for these new entities:

```typescript
// Create with: npx typeorm migration:create -n FulfillmentEntities

import { MigrationInterface, QueryRunner } from 'typeorm';

export class FulfillmentEntities1684500002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create fulfillments table
    await queryRunner.query(`
      CREATE TABLE "fulfillments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "external_id" varchar NOT NULL,
        "status" varchar NOT NULL DEFAULT 'pending',
        "location_id" varchar,
        "tracking_company" varchar,
        "tracking_number" varchar,
        "tracking_url" varchar,
        "tracking_urls" jsonb,
        "estimated_delivery_at" timestamp,
        "notify_customer" boolean,
        "note" text,
        "metafields" jsonb,
        "synced" boolean DEFAULT false,
        "synced_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "external_created_at" timestamp,
        CONSTRAINT "fk_fulfillments_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "idx_fulfillments_order_id" ON "fulfillments"("order_id");
      CREATE INDEX "idx_fulfillments_external_id" ON "fulfillments"("external_id");
    `);
    
    // Create fulfillment line items table
    await queryRunner.query(`
      CREATE TABLE "fulfillment_line_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "fulfillment_id" uuid NOT NULL,
        "order_line_item_id" uuid NOT NULL,
        "external_id" varchar NOT NULL,
        "external_line_item_id" varchar NOT NULL,
        "quantity" integer NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_fulfillment_line_items_fulfillment" FOREIGN KEY ("fulfillment_id") REFERENCES "fulfillments"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_fulfillment_line_items_order_line_item" FOREIGN KEY ("order_line_item_id") REFERENCES "order_line_items"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "idx_fulfillment_line_items_fulfillment_id" ON "fulfillment_line_items"("fulfillment_id");
      CREATE INDEX "idx_fulfillment_line_items_order_line_item_id" ON "fulfillment_line_items"("order_line_item_id");
      CREATE INDEX "idx_fulfillment_line_items_external_id" ON "fulfillment_line_items"("external_id");
    `);
    
    // Create fulfillment tracking table
    await queryRunner.query(`
      CREATE TABLE "fulfillment_tracking" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "fulfillment_id" uuid NOT NULL,
        "company" varchar NOT NULL,
        "number" varchar NOT NULL,
        "url" varchar,
        "estimated_delivery_at" timestamp,
        "notified_customer" boolean DEFAULT false,
        "shipment_status" jsonb,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_fulfillment_tracking_fulfillment" FOREIGN KEY ("fulfillment_id") REFERENCES "fulfillments"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "idx_fulfillment_tracking_fulfillment_id" ON "fulfillment_tracking"("fulfillment_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "fulfillment_tracking"`);
    await queryRunner.query(`DROP TABLE "fulfillment_line_items"`);
    await queryRunner.query(`DROP TABLE "fulfillments"`);
  }
}
```

### 7. Update Module Configuration

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
        Customer,
        Order,
        OrderLineItem,
        // New entities
        Fulfillment,
        FulfillmentLineItem,
        FulfillmentTracking
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

- Completed Phase 4A, 4B, and 4C
- TypeORM for database interactions
- PostgreSQL database with UUID extension enabled

## Testing Guidelines

1. **Database Schema:**
   - Verify migration runs successfully
   - Test entity relationships and constraints
   - Check indexes for query performance

2. **Entity Data Types:**
   - Test all field types, especially JSON fields
   - Verify enum constraints work correctly
   - Test nullable vs required fields

3. **Data Validation:**
   - Test DTOs with valid and invalid data
   - Verify validation error messages
   - Test relationship integrity between orders and fulfillments

## Next Phase

Once the fulfillment entities are in place, proceed to [Phase 4D-2: Fulfillment Webhook Handlers](./shopify-app-phase4d2-fulfillment-webhooks.md) to implement webhook processing for fulfillment events.
