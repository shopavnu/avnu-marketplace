# Phase 5A-4: Analytics & Reporting - Metrics Definition

## Objectives

- Create a flexible metrics definition system
- Implement standard e-commerce metrics for Shopify integration
- Allow for custom metric creation by merchants

## Timeline: Week 20

## Tasks & Implementation Details

### 1. Metrics Registry Interface

Define the interface for metrics registry:

```typescript
// src/modules/analytics/interfaces/metrics-registry.interface.ts

export interface MetricDefinition {
  key: string;
  name: string;
  description: string;
  category: string;
  unit?: string;
  aggregationMethod: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'custom';
  valueField?: string;
  availableDimensions: string[];
  defaultDimension: string;
  isStandard: boolean;
  calculate?: (events: any[], options?: any) => number;
}

export interface DimensionDefinition {
  key: string;
  name: string;
  description: string;
  dataField?: string;
  valueFormatter?: (value: any) => string;
  isStandard: boolean;
}

export interface IMetricsRegistry {
  registerMetric(definition: MetricDefinition): void;
  registerDimension(definition: DimensionDefinition): void;
  getMetricDefinition(key: string): MetricDefinition;
  getDimensionDefinition(key: string): DimensionDefinition;
  getAllMetrics(): MetricDefinition[];
  getAllDimensions(): DimensionDefinition[];
  getMerchantMetrics(merchantId: string): Promise<MetricDefinition[]>;
  getMerchantDimensions(merchantId: string): Promise<DimensionDefinition[]>;
  saveCustomMetric(merchantId: string, definition: MetricDefinition): Promise<void>;
  saveCustomDimension(merchantId: string, definition: DimensionDefinition): Promise<void>;
}
```

### 2. Metrics Registry Implementation

Implement the registry for storing metric definitions:

```typescript
// src/modules/analytics/services/metrics-registry.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetricDefinition, DimensionDefinition, IMetricsRegistry } from '../interfaces/metrics-registry.interface';
import { CustomMetric } from '../../entities/custom-metric.entity';
import { CustomDimension } from '../../entities/custom-dimension.entity';

@Injectable()
export class MetricsRegistryService implements IMetricsRegistry {
  private readonly logger = new Logger(MetricsRegistryService.name);
  private readonly metrics: Map<string, MetricDefinition> = new Map();
  private readonly dimensions: Map<string, DimensionDefinition> = new Map();

  constructor(
    @InjectRepository(CustomMetric)
    private readonly customMetricRepository: Repository<CustomMetric>,
    @InjectRepository(CustomDimension)
    private readonly customDimensionRepository: Repository<CustomDimension>,
  ) {
    // Register standard metrics and dimensions
    this.registerStandardMetrics();
    this.registerStandardDimensions();
  }

  /**
   * Register a metric definition
   */
  registerMetric(definition: MetricDefinition): void {
    if (this.metrics.has(definition.key)) {
      this.logger.warn(`Metric with key ${definition.key} already exists. Overriding.`);
    }
    this.metrics.set(definition.key, definition);
  }

  /**
   * Register a dimension definition
   */
  registerDimension(definition: DimensionDefinition): void {
    if (this.dimensions.has(definition.key)) {
      this.logger.warn(`Dimension with key ${definition.key} already exists. Overriding.`);
    }
    this.dimensions.set(definition.key, definition);
  }

  /**
   * Get a metric definition by key
   */
  getMetricDefinition(key: string): MetricDefinition {
    const metric = this.metrics.get(key);
    if (!metric) {
      throw new Error(`Metric with key ${key} not found`);
    }
    return metric;
  }

  /**
   * Get a dimension definition by key
   */
  getDimensionDefinition(key: string): DimensionDefinition {
    const dimension = this.dimensions.get(key);
    if (!dimension) {
      throw new Error(`Dimension with key ${dimension} not found`);
    }
    return dimension;
  }

  /**
   * Get all registered metrics
   */
  getAllMetrics(): MetricDefinition[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get all registered dimensions
   */
  getAllDimensions(): DimensionDefinition[] {
    return Array.from(this.dimensions.values());
  }

  /**
   * Get all metrics available for a merchant
   */
  async getMerchantMetrics(merchantId: string): Promise<MetricDefinition[]> {
    // Get standard metrics
    const standardMetrics = Array.from(this.metrics.values())
      .filter(metric => metric.isStandard);
    
    // Get custom metrics for this merchant
    const customMetrics = await this.customMetricRepository.find({
      where: { merchantId }
    });
    
    // Convert custom metrics to metric definitions
    const customDefinitions = customMetrics.map(custom => ({
      key: custom.key,
      name: custom.name,
      description: custom.description,
      category: custom.category,
      unit: custom.unit,
      aggregationMethod: custom.aggregationMethod as any,
      valueField: custom.valueField,
      availableDimensions: custom.availableDimensions,
      defaultDimension: custom.defaultDimension,
      isStandard: false,
    }));
    
    // Combine standard and custom metrics
    return [...standardMetrics, ...customDefinitions];
  }

  /**
   * Get all dimensions available for a merchant
   */
  async getMerchantDimensions(merchantId: string): Promise<DimensionDefinition[]> {
    // Get standard dimensions
    const standardDimensions = Array.from(this.dimensions.values())
      .filter(dimension => dimension.isStandard);
    
    // Get custom dimensions for this merchant
    const customDimensions = await this.customDimensionRepository.find({
      where: { merchantId }
    });
    
    // Convert custom dimensions to dimension definitions
    const customDefinitions = customDimensions.map(custom => ({
      key: custom.key,
      name: custom.name,
      description: custom.description,
      dataField: custom.dataField,
      isStandard: false,
    }));
    
    // Combine standard and custom dimensions
    return [...standardDimensions, ...customDefinitions];
  }

  /**
   * Save a custom metric for a merchant
   */
  async saveCustomMetric(merchantId: string, definition: MetricDefinition): Promise<void> {
    try {
      // Check if metric already exists
      const existingMetric = await this.customMetricRepository.findOne({
        where: {
          merchantId,
          key: definition.key,
        },
      });
      
      if (existingMetric) {
        // Update existing metric
        existingMetric.name = definition.name;
        existingMetric.description = definition.description;
        existingMetric.category = definition.category;
        existingMetric.unit = definition.unit;
        existingMetric.aggregationMethod = definition.aggregationMethod;
        existingMetric.valueField = definition.valueField;
        existingMetric.availableDimensions = definition.availableDimensions;
        existingMetric.defaultDimension = definition.defaultDimension;
        
        await this.customMetricRepository.save(existingMetric);
      } else {
        // Create new custom metric
        const customMetric = this.customMetricRepository.create({
          merchantId,
          key: definition.key,
          name: definition.name,
          description: definition.description,
          category: definition.category,
          unit: definition.unit,
          aggregationMethod: definition.aggregationMethod,
          valueField: definition.valueField,
          availableDimensions: definition.availableDimensions,
          defaultDimension: definition.defaultDimension,
        });
        
        await this.customMetricRepository.save(customMetric);
      }
    } catch (error) {
      this.logger.error(`Error saving custom metric: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Save a custom dimension for a merchant
   */
  async saveCustomDimension(merchantId: string, definition: DimensionDefinition): Promise<void> {
    try {
      // Check if dimension already exists
      const existingDimension = await this.customDimensionRepository.findOne({
        where: {
          merchantId,
          key: definition.key,
        },
      });
      
      if (existingDimension) {
        // Update existing dimension
        existingDimension.name = definition.name;
        existingDimension.description = definition.description;
        existingDimension.dataField = definition.dataField;
        
        await this.customDimensionRepository.save(existingDimension);
      } else {
        // Create new custom dimension
        const customDimension = this.customDimensionRepository.create({
          merchantId,
          key: definition.key,
          name: definition.name,
          description: definition.description,
          dataField: definition.dataField,
        });
        
        await this.customDimensionRepository.save(customDimension);
      }
    } catch (error) {
      this.logger.error(`Error saving custom dimension: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Register standard metrics
   */
  private registerStandardMetrics(): void {
    const standardMetrics: MetricDefinition[] = [
      // Order metrics
      {
        key: 'order_count',
        name: 'Order Count',
        description: 'Total number of orders',
        category: 'orders',
        aggregationMethod: 'count',
        availableDimensions: ['date', 'status', 'payment_method', 'fulfillment_status'],
        defaultDimension: 'date',
        isStandard: true,
      },
      {
        key: 'revenue',
        name: 'Revenue',
        description: 'Total revenue from orders',
        category: 'orders',
        unit: 'currency',
        aggregationMethod: 'sum',
        valueField: 'totalPrice',
        availableDimensions: ['date', 'status', 'payment_method'],
        defaultDimension: 'date',
        isStandard: true,
      },
      {
        key: 'average_order_value',
        name: 'Average Order Value',
        description: 'Average value of orders',
        category: 'orders',
        unit: 'currency',
        aggregationMethod: 'avg',
        valueField: 'totalPrice',
        availableDimensions: ['date', 'payment_method'],
        defaultDimension: 'date',
        isStandard: true,
      },
      
      // Product metrics
      {
        key: 'product_views',
        name: 'Product Views',
        description: 'Number of product page views',
        category: 'products',
        aggregationMethod: 'count',
        availableDimensions: ['product_id', 'date'],
        defaultDimension: 'product_id',
        isStandard: true,
      },
      {
        key: 'add_to_cart',
        name: 'Add to Cart',
        description: 'Number of products added to cart',
        category: 'products',
        aggregationMethod: 'count',
        availableDimensions: ['product_id', 'date'],
        defaultDimension: 'product_id',
        isStandard: true,
      },
      {
        key: 'conversion_rate',
        name: 'Conversion Rate',
        description: 'Percentage of product views that result in purchases',
        category: 'products',
        unit: 'percent',
        aggregationMethod: 'custom',
        availableDimensions: ['product_id', 'date'],
        defaultDimension: 'product_id',
        isStandard: true,
        calculate: (events, options) => {
          // Implementation would compare views to purchases
          return 0;
        },
      },
      
      // Customer metrics
      {
        key: 'new_customers',
        name: 'New Customers',
        description: 'Number of new customers',
        category: 'customers',
        aggregationMethod: 'count',
        availableDimensions: ['date'],
        defaultDimension: 'date',
        isStandard: true,
      },
      {
        key: 'returning_customers',
        name: 'Returning Customers',
        description: 'Number of returning customers',
        category: 'customers',
        aggregationMethod: 'count',
        availableDimensions: ['date'],
        defaultDimension: 'date',
        isStandard: true,
      },
      
      // Platform metrics
      {
        key: 'pageviews',
        name: 'Page Views',
        description: 'Number of page views',
        category: 'platform',
        aggregationMethod: 'count',
        availableDimensions: ['page', 'date'],
        defaultDimension: 'page',
        isStandard: true,
      },
      {
        key: 'api_calls',
        name: 'API Calls',
        description: 'Number of API calls made',
        category: 'platform',
        aggregationMethod: 'count',
        availableDimensions: ['endpoint', 'date'],
        defaultDimension: 'endpoint',
        isStandard: true,
      },
    ];
    
    // Register each standard metric
    standardMetrics.forEach(metric => this.registerMetric(metric));
  }

  /**
   * Register standard dimensions
   */
  private registerStandardDimensions(): void {
    const standardDimensions: DimensionDefinition[] = [
      // Time dimensions
      {
        key: 'date',
        name: 'Date',
        description: 'Calendar date',
        dataField: 'referenceDate',
        valueFormatter: (value) => new Date(value).toISOString().split('T')[0],
        isStandard: true,
      },
      
      // Order dimensions
      {
        key: 'status',
        name: 'Order Status',
        description: 'Status of the order',
        dataField: 'status',
        isStandard: true,
      },
      {
        key: 'payment_method',
        name: 'Payment Method',
        description: 'Method of payment',
        dataField: 'paymentMethod',
        isStandard: true,
      },
      {
        key: 'fulfillment_status',
        name: 'Fulfillment Status',
        description: 'Status of order fulfillment',
        dataField: 'fulfillmentStatus',
        isStandard: true,
      },
      
      // Product dimensions
      {
        key: 'product_id',
        name: 'Product',
        description: 'Product identifier',
        dataField: 'productId',
        isStandard: true,
      },
      {
        key: 'category',
        name: 'Product Category',
        description: 'Category of the product',
        dataField: 'category',
        isStandard: true,
      },
      {
        key: 'vendor',
        name: 'Vendor',
        description: 'Product vendor',
        dataField: 'vendor',
        isStandard: true,
      },
      
      // Platform dimensions
      {
        key: 'page',
        name: 'Page',
        description: 'Web page path',
        dataField: 'page',
        isStandard: true,
      },
      {
        key: 'endpoint',
        name: 'API Endpoint',
        description: 'API endpoint path',
        dataField: 'endpoint',
        isStandard: true,
      },
    ];
    
    // Register each standard dimension
    standardDimensions.forEach(dimension => this.registerDimension(dimension));
  }
}
```

### 3. Custom Metric and Dimension Entities

Create entities for storing custom metric and dimension definitions:

```typescript
// src/modules/entities/custom-metric.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('custom_metrics')
export class CustomMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  merchantId: string;

  @Column()
  @Index()
  key: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  unit: string;

  @Column()
  aggregationMethod: string;

  @Column({ nullable: true })
  valueField: string;

  @Column('simple-array')
  availableDimensions: string[];

  @Column()
  defaultDimension: string;

  @Column({ type: 'jsonb', nullable: true })
  configuration: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

```typescript
// src/modules/entities/custom-dimension.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('custom_dimensions')
export class CustomDimension {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  merchantId: string;

  @Column()
  @Index()
  key: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  dataField: string;

  @Column({ type: 'jsonb', nullable: true })
  configuration: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 4. Database Migration for Custom Metric/Dimension Entities

Create a migration for the custom entities:

```typescript
// Create with: npx typeorm migration:create -n CustomMetricsDimensions

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CustomMetricsDimensions1684500005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create custom_metrics table
    await queryRunner.query(`
      CREATE TABLE "custom_metrics" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "merchant_id" uuid NOT NULL,
        "key" varchar NOT NULL,
        "name" varchar NOT NULL,
        "description" varchar,
        "category" varchar NOT NULL,
        "unit" varchar,
        "aggregation_method" varchar NOT NULL,
        "value_field" varchar,
        "available_dimensions" varchar NOT NULL,
        "default_dimension" varchar NOT NULL,
        "configuration" jsonb,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_custom_metrics_merchant" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "idx_custom_metrics_merchant_id" ON "custom_metrics"("merchant_id");
      CREATE INDEX "idx_custom_metrics_key" ON "custom_metrics"("key");
      CREATE UNIQUE INDEX "uq_custom_metrics_merchant_key" ON "custom_metrics"("merchant_id", "key");
    `);
    
    // Create custom_dimensions table
    await queryRunner.query(`
      CREATE TABLE "custom_dimensions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "merchant_id" uuid NOT NULL,
        "key" varchar NOT NULL,
        "name" varchar NOT NULL,
        "description" varchar,
        "data_field" varchar,
        "configuration" jsonb,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_custom_dimensions_merchant" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "idx_custom_dimensions_merchant_id" ON "custom_dimensions"("merchant_id");
      CREATE INDEX "idx_custom_dimensions_key" ON "custom_dimensions"("key");
      CREATE UNIQUE INDEX "uq_custom_dimensions_merchant_key" ON "custom_dimensions"("merchant_id", "key");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "custom_dimensions"`);
    await queryRunner.query(`DROP TABLE "custom_metrics"`);
  }
}
```

### 5. Metrics Query Service

Create a service to query metrics data:

```typescript
// src/modules/analytics/services/metrics-query.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AnalyticsAggregate } from '../../entities/analytics-aggregate.entity';
import { MetricsRegistryService } from './metrics-registry.service';

@Injectable()
export class MetricsQueryService {
  private readonly logger = new Logger(MetricsQueryService.name);

  constructor(
    @InjectRepository(AnalyticsAggregate)
    private readonly analyticsAggregateRepository: Repository<AnalyticsAggregate>,
    private readonly metricsRegistry: MetricsRegistryService,
  ) {}

  /**
   * Query metric data for a specific metric, dimension, and time period
   */
  async queryMetric(params: {
    merchantId: string;
    metricKey: string;
    dimensionKey: string;
    period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    startDate: Date;
    endDate: Date;
    dimensionValues?: string[];
  }): Promise<{
    metricKey: string;
    dimensionKey: string;
    period: string;
    data: Array<{
      dimensionValue: string;
      value: number;
      periodStart: Date;
    }>;
  }> {
    const { 
      merchantId, 
      metricKey, 
      dimensionKey, 
      period, 
      startDate, 
      endDate, 
      dimensionValues 
    } = params;
    
    try {
      // Validate metric and dimension exist
      const metricDefinition = this.metricsRegistry.getMetricDefinition(metricKey);
      const dimensionDefinition = this.metricsRegistry.getDimensionDefinition(dimensionKey);
      
      // Build query
      const queryBuilder = this.analyticsAggregateRepository.createQueryBuilder('agg')
        .where('agg.merchantId = :merchantId', { merchantId })
        .andWhere('agg.metricKey = :metricKey', { metricKey })
        .andWhere('agg.dimensionKey = :dimensionKey', { dimensionKey })
        .andWhere('agg.period = :period', { period })
        .andWhere('agg.periodStart >= :startDate', { startDate })
        .andWhere('agg.periodEnd <= :endDate', { endDate })
        .orderBy('agg.periodStart', 'ASC');
      
      // Filter by dimension values if provided
      if (dimensionValues && dimensionValues.length > 0) {
        queryBuilder.andWhere(`agg.dimensionValues ->> '${dimensionKey}' IN (:...dimensionValues)`, {
          dimensionValues,
        });
      }
      
      const aggregates = await queryBuilder.getMany();
      
      // Format results
      const data = aggregates.map(agg => ({
        dimensionValue: agg.dimensionValues[dimensionKey],
        value: agg.value,
        periodStart: agg.periodStart,
      }));
      
      return {
        metricKey,
        dimensionKey,
        period,
        data,
      };
    } catch (error) {
      this.logger.error(`Error querying metric: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get multiple metrics for a dashboard
   */
  async queryDashboardMetrics(params: {
    merchantId: string;
    metrics: Array<{
      metricKey: string;
      dimensionKey: string;
      period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    }>;
    startDate: Date;
    endDate: Date;
  }): Promise<Record<string, any>> {
    const { merchantId, metrics, startDate, endDate } = params;
    
    try {
      const results: Record<string, any> = {};
      
      // Query each metric
      for (const metric of metrics) {
        const result = await this.queryMetric({
          merchantId,
          metricKey: metric.metricKey,
          dimensionKey: metric.dimensionKey,
          period: metric.period,
          startDate,
          endDate,
        });
        
        // Store in results with a unique key
        const resultKey = `${metric.metricKey}_${metric.dimensionKey}_${metric.period}`;
        results[resultKey] = result;
      }
      
      return results;
    } catch (error) {
      this.logger.error(`Error querying dashboard metrics: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### 6. Update Analytics Module

Update the module with the new components:

```typescript
// src/modules/analytics/analytics.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalyticsEvent } from '../entities/analytics-event.entity';
import { AnalyticsAggregate } from '../entities/analytics-aggregate.entity';
import { UserActivity } from '../entities/user-activity.entity';
import { ReportDefinition } from '../entities/report-definition.entity';
import { ReportResult } from '../entities/report-result.entity';
import { CustomMetric } from '../entities/custom-metric.entity';
import { CustomDimension } from '../entities/custom-dimension.entity';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsProcessor } from './processors/analytics.processor';
import { AnalyticsAggregationService } from './services/analytics-aggregation.service';
import { MetricsRegistryService } from './services/metrics-registry.service';
import { MetricsQueryService } from './services/metrics-query.service';
import { AggregationTask } from './tasks/aggregation.task';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsEvent,
      AnalyticsAggregate,
      UserActivity,
      ReportDefinition,
      ReportResult,
      CustomMetric,
      CustomDimension,
    ]),
    BullModule.registerQueue({
      name: 'analytics',
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [
    AnalyticsService,
    AnalyticsProcessor,
    AnalyticsAggregationService,
    MetricsRegistryService,
    MetricsQueryService,
    AggregationTask,
  ],
  exports: [
    AnalyticsService,
    AnalyticsAggregationService,
    MetricsRegistryService,
    MetricsQueryService,
  ],
})
export class AnalyticsModule {}
```

## Dependencies & Prerequisites

- Completed Phase 5A-1 through 5A-3
- TypeORM for database interactions
- PostgreSQL with JSONB support for complex queries

## Testing Guidelines

1. **Metrics Registry:**
   - Test registration of standard and custom metrics
   - Verify retrieval of metrics by key
   - Test merchant-specific metrics and dimensions

2. **Query Performance:**
   - Benchmark query performance with various time periods
   - Test dimension filtering with large datasets
   - Optimize JSONB queries for PostgreSQL

3. **Data Accuracy:**
   - Verify calculated metrics are accurate
   - Test edge cases and error conditions
   - Validate dimension value extraction

## Next Phase

Continue to [Phase 5B-1: Report Generation](./shopify-app-phase5b1-report-generation.md) to implement the service for generating and exporting reports.
