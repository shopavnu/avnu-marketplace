# Phase 5A-1: Analytics & Reporting - Data Models

## Objectives

- Define database entities for analytics data collection
- Create relationships between analytics and business objects
- Implement efficient schema for reporting queries

## Timeline: Week 19

## Tasks & Implementation Details

### 1. Analytics Event Entity

Create an entity to track analytics events:

```typescript
// src/modules/entities/analytics-event.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Merchant } from './merchant.entity';

@Entity('analytics_events')
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  merchantId: string;

  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @Column()
  @Index()
  eventType: string;

  @Column({ type: 'jsonb' })
  eventData: Record<string, any>;

  @Column({ nullable: true })
  @Index()
  sourceId: string;

  @Column({ nullable: true })
  @Index()
  sourceType: string;

  @Column({ nullable: true })
  @Index()
  userId: string;

  @Column({ nullable: true })
  @Index()
  sessionId: string;

  @Column({ nullable: true })
  @Index()
  referenceDate: Date;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;
}
```

### 2. Analytics Aggregate Entity

Create an entity to store pre-aggregated analytics data:

```typescript
// src/modules/entities/analytics-aggregate.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('analytics_aggregates')
export class AnalyticsAggregate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  merchantId: string;

  @Column()
  @Index()
  metricKey: string;

  @Column()
  @Index()
  dimensionKey: string;

  @Column({ type: 'jsonb' })
  dimensionValues: Record<string, any>;

  @Column('decimal', { precision: 15, scale: 4 })
  value: number;

  @Column()
  @Index()
  period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'all_time';

  @Column()
  @Index()
  periodStart: Date;

  @Column()
  @Index()
  periodEnd: Date;

  @Column({ default: false })
  isInterpolated: boolean;

  @Column({ default: 1 })
  sampleSize: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  metadataJson: string;
}
```

### 3. User Activity Entity

Create an entity to track user interactions:

```typescript
// src/modules/entities/user-activity.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('user_activities')
export class UserActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  merchantId: string;

  @Column({ nullable: true })
  @Index()
  userId: string;

  @Column()
  @Index()
  sessionId: string;

  @Column()
  activityType: string;

  @Column({ type: 'jsonb' })
  activityData: Record<string, any>;

  @Column({ nullable: true })
  page: string;

  @Column({ nullable: true })
  action: string;

  @Column({ nullable: true })
  objectId: string;

  @Column({ nullable: true })
  objectType: string;

  @Column({ nullable: true, type: 'jsonb' })
  contextData: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  duration: number;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
```

### 4. Report Definition Entity

Create an entity to store report definitions:

```typescript
// src/modules/entities/report-definition.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('report_definitions')
export class ReportDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  merchantId: string;

  @Column()
  @Index()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  reportType: string;

  @Column({ type: 'jsonb' })
  config: {
    metrics: string[];
    dimensions: string[];
    filters: {
      field: string;
      operator: string;
      value: any;
    }[];
    sort: {
      field: string;
      direction: 'asc' | 'desc';
    }[];
    limit: number;
    format: string;
  };

  @Column({ default: false })
  isSystem: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isScheduled: boolean;

  @Column({ nullable: true, type: 'jsonb' })
  scheduleConfig: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    hour: number;
    minute: number;
    recipients: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastRunAt: Date;
}
```

### 5. Report Result Entity

Create an entity to store generated report results:

```typescript
// src/modules/entities/report-result.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ReportDefinition } from './report-definition.entity';

@Entity('report_results')
export class ReportResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  reportDefinitionId: string;

  @ManyToOne(() => ReportDefinition)
  @JoinColumn({ name: 'report_definition_id' })
  reportDefinition: ReportDefinition;

  @Column()
  @Index()
  merchantId: string;

  @Column()
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @Column({ nullable: true })
  error: string;

  @Column({ type: 'jsonb' })
  parameters: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  resultData: any[];

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true })
  fileFormat: string;

  @Column({ nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  executionTime: number;

  @Column({ nullable: true })
  rowCount: number;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @Column({ nullable: true })
  completedAt: Date;
}
```

### 6. Database Migration for Analytics Entities

Create a migration to set up the analytics tables:

```typescript
// Create with: npx typeorm migration:create -n AnalyticsEntities

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AnalyticsEntities1684500004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create analytics_events table
    await queryRunner.query(`
      CREATE TABLE "analytics_events" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "merchant_id" uuid NOT NULL,
        "event_type" varchar NOT NULL,
        "event_data" jsonb NOT NULL,
        "source_id" varchar,
        "source_type" varchar,
        "user_id" varchar,
        "session_id" varchar,
        "reference_date" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "ip_address" varchar,
        "user_agent" varchar,
        CONSTRAINT "fk_analytics_events_merchant" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "idx_analytics_events_merchant_id" ON "analytics_events"("merchant_id");
      CREATE INDEX "idx_analytics_events_event_type" ON "analytics_events"("event_type");
      CREATE INDEX "idx_analytics_events_source_id" ON "analytics_events"("source_id");
      CREATE INDEX "idx_analytics_events_source_type" ON "analytics_events"("source_type");
      CREATE INDEX "idx_analytics_events_user_id" ON "analytics_events"("user_id");
      CREATE INDEX "idx_analytics_events_session_id" ON "analytics_events"("session_id");
      CREATE INDEX "idx_analytics_events_reference_date" ON "analytics_events"("reference_date");
      CREATE INDEX "idx_analytics_events_created_at" ON "analytics_events"("created_at");
    `);
    
    // Create analytics_aggregates table
    await queryRunner.query(`
      CREATE TABLE "analytics_aggregates" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "merchant_id" uuid NOT NULL,
        "metric_key" varchar NOT NULL,
        "dimension_key" varchar NOT NULL,
        "dimension_values" jsonb NOT NULL,
        "value" decimal(15,4) NOT NULL,
        "period" varchar NOT NULL,
        "period_start" timestamp NOT NULL,
        "period_end" timestamp NOT NULL,
        "is_interpolated" boolean NOT NULL DEFAULT false,
        "sample_size" integer NOT NULL DEFAULT 1,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "metadata_json" varchar,
        CONSTRAINT "fk_analytics_aggregates_merchant" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "idx_analytics_aggregates_merchant_id" ON "analytics_aggregates"("merchant_id");
      CREATE INDEX "idx_analytics_aggregates_metric_key" ON "analytics_aggregates"("metric_key");
      CREATE INDEX "idx_analytics_aggregates_dimension_key" ON "analytics_aggregates"("dimension_key");
      CREATE INDEX "idx_analytics_aggregates_period" ON "analytics_aggregates"("period");
      CREATE INDEX "idx_analytics_aggregates_period_start" ON "analytics_aggregates"("period_start");
      CREATE INDEX "idx_analytics_aggregates_period_end" ON "analytics_aggregates"("period_end");
    `);
    
    // Create user_activities table
    await queryRunner.query(`
      CREATE TABLE "user_activities" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "merchant_id" uuid NOT NULL,
        "user_id" varchar,
        "session_id" varchar NOT NULL,
        "activity_type" varchar NOT NULL,
        "activity_data" jsonb NOT NULL,
        "page" varchar,
        "action" varchar,
        "object_id" varchar,
        "object_type" varchar,
        "context_data" jsonb,
        "ip_address" varchar,
        "user_agent" varchar,
        "duration" integer,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_user_activities_merchant" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "idx_user_activities_merchant_id" ON "user_activities"("merchant_id");
      CREATE INDEX "idx_user_activities_user_id" ON "user_activities"("user_id");
      CREATE INDEX "idx_user_activities_session_id" ON "user_activities"("session_id");
      CREATE INDEX "idx_user_activities_created_at" ON "user_activities"("created_at");
    `);
    
    // Create report_definitions table
    await queryRunner.query(`
      CREATE TABLE "report_definitions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "merchant_id" uuid NOT NULL,
        "name" varchar NOT NULL,
        "description" varchar,
        "report_type" varchar NOT NULL,
        "config" jsonb NOT NULL,
        "is_system" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "is_scheduled" boolean NOT NULL DEFAULT false,
        "schedule_config" jsonb,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "last_run_at" timestamp,
        CONSTRAINT "fk_report_definitions_merchant" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "idx_report_definitions_merchant_id" ON "report_definitions"("merchant_id");
      CREATE INDEX "idx_report_definitions_name" ON "report_definitions"("name");
    `);
    
    // Create report_results table
    await queryRunner.query(`
      CREATE TABLE "report_results" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "report_definition_id" uuid NOT NULL,
        "merchant_id" uuid NOT NULL,
        "status" varchar NOT NULL,
        "error" varchar,
        "parameters" jsonb NOT NULL,
        "result_data" jsonb,
        "file_url" varchar,
        "file_format" varchar,
        "file_size" integer,
        "execution_time" integer,
        "row_count" integer,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "completed_at" timestamp,
        CONSTRAINT "fk_report_results_report_definition" FOREIGN KEY ("report_definition_id") REFERENCES "report_definitions"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_report_results_merchant" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "idx_report_results_report_definition_id" ON "report_results"("report_definition_id");
      CREATE INDEX "idx_report_results_merchant_id" ON "report_results"("merchant_id");
      CREATE INDEX "idx_report_results_created_at" ON "report_results"("created_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "report_results"`);
    await queryRunner.query(`DROP TABLE "report_definitions"`);
    await queryRunner.query(`DROP TABLE "user_activities"`);
    await queryRunner.query(`DROP TABLE "analytics_aggregates"`);
    await queryRunner.query(`DROP TABLE "analytics_events"`);
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
        Fulfillment,
        FulfillmentLineItem,
        FulfillmentTracking,
        // New analytics entities
        AnalyticsEvent,
        AnalyticsAggregate,
        UserActivity,
        ReportDefinition,
        ReportResult
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

### 8. Create Analytics Module

Create a dedicated module for analytics functionality:

```typescript
// src/modules/analytics/analytics.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsEvent } from '../entities/analytics-event.entity';
import { AnalyticsAggregate } from '../entities/analytics-aggregate.entity';
import { UserActivity } from '../entities/user-activity.entity';
import { ReportDefinition } from '../entities/report-definition.entity';
import { ReportResult } from '../entities/report-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsEvent,
      AnalyticsAggregate,
      UserActivity,
      ReportDefinition,
      ReportResult,
    ]),
  ],
  providers: [
    // Services will be added in subsequent documentation
  ],
  controllers: [
    // Controllers will be added in subsequent documentation
  ],
  exports: [
    // Exported services will be added in subsequent documentation
  ],
})
export class AnalyticsModule {}
```

## Dependencies & Prerequisites

- Completed Phase 4 (Order Management)
- TypeORM for database interactions
- PostgreSQL database with JSONB support
- Appropriate database indexing for analytics queries

## Testing Guidelines

1. **Schema Design:**
   - Verify entity relationships work as expected
   - Test JSONB field operations and indexing
   - Measure query performance with test data

2. **Data Integrity:**
   - Test constraints and foreign key relationships
   - Verify indexes support the expected query patterns
   - Test date range queries for performance

3. **Migration:**
   - Test migration scripts in a development environment
   - Verify tables are created with correct fields and constraints
   - Test rollback functionality

## Next Phase

Continue to [Phase 5A-2: Analytics Collection Service](./shopify-app-phase5a2-analytics-service.md) to implement the service for collecting analytics data.
