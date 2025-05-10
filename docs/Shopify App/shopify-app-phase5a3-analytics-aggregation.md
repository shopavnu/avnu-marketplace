# Phase 5A-3: Analytics & Reporting - Aggregation Service

## Objectives

- Create a service to aggregate raw analytics events into meaningful metrics
- Implement time-based aggregation (hourly, daily, weekly, monthly)
- Optimize data storage for efficient reporting queries

## Timeline: Week 19-20

## Tasks & Implementation Details

### 1. Analytics Aggregation Service Interface

Define the interface for the aggregation service:

```typescript
// src/modules/analytics/interfaces/analytics-aggregation-service.interface.ts

export interface IAnalyticsAggregationService {
  // Aggregation methods
  aggregateEvents(params: {
    merchantId: string;
    metricKey: string;
    dimensionKey: string;
    startDate: Date;
    endDate: Date;
    period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  }): Promise<void>;
  
  // Scheduled aggregation
  runScheduledAggregations(period: 'hourly' | 'daily' | 'weekly' | 'monthly'): Promise<void>;
  
  // Custom aggregation
  runCustomAggregation(params: {
    merchantId: string;
    metricKey: string;
    dimensionKey: string;
    dimensionValueField: string;
    aggregationFunction: 'count' | 'sum' | 'avg' | 'min' | 'max';
    aggregationField?: string;
    filterConditions?: Record<string, any>;
    period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    startDate: Date;
    endDate: Date;
  }): Promise<void>;
}
```

### 2. Analytics Aggregation Service Implementation

Implement the core aggregation service:

```typescript
// src/modules/analytics/services/analytics-aggregation.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AnalyticsEvent } from '../../entities/analytics-event.entity';
import { AnalyticsAggregate } from '../../entities/analytics-aggregate.entity';
import { IAnalyticsAggregationService } from '../interfaces/analytics-aggregation-service.interface';
import { startOfHour, endOfHour, startOfDay, endOfDay, startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear,
  subDays, format } from 'date-fns';

@Injectable()
export class AnalyticsAggregationService implements IAnalyticsAggregationService {
  private readonly logger = new Logger(AnalyticsAggregationService.name);

  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsEventRepository: Repository<AnalyticsEvent>,
    @InjectRepository(AnalyticsAggregate)
    private readonly analyticsAggregateRepository: Repository<AnalyticsAggregate>,
  ) {}

  /**
   * Aggregate events based on the specified parameters
   */
  async aggregateEvents(params: {
    merchantId: string;
    metricKey: string;
    dimensionKey: string;
    startDate: Date;
    endDate: Date;
    period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  }): Promise<void> {
    const { merchantId, metricKey, dimensionKey, startDate, endDate, period } = params;
    
    try {
      // Get all events for the period
      const events = await this.analyticsEventRepository.find({
        where: {
          merchantId,
          createdAt: Between(startDate, endDate),
        },
      });
      
      if (!events.length) {
        this.logger.log(`No events found for ${merchantId} between ${startDate} and ${endDate}`);
        return;
      }
      
      // Group events by dimension value
      const groupedEvents = this.groupEventsByDimension(events, dimensionKey);
      
      // Calculate period start and end dates
      const { periodStart, periodEnd } = this.calculatePeriodDates(period, startDate);
      
      // For each dimension value, create or update an aggregate
      for (const [dimensionValue, dimensionEvents] of Object.entries(groupedEvents)) {
        await this.createOrUpdateAggregate({
          merchantId,
          metricKey,
          dimensionKey,
          dimensionValue,
          events: dimensionEvents,
          period,
          periodStart,
          periodEnd,
        });
      }
      
      this.logger.log(`Successfully aggregated ${events.length} events for ${merchantId}`);
    } catch (error) {
      this.logger.error(`Error aggregating events: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Run scheduled aggregations for the specified period
   */
  async runScheduledAggregations(period: 'hourly' | 'daily' | 'weekly' | 'monthly'): Promise<void> {
    try {
      // Get start and end dates based on period
      const { startDate, endDate } = this.getDateRangeForPeriod(period);
      
      this.logger.log(`Running ${period} aggregations from ${startDate} to ${endDate}`);
      
      // Get a list of all merchant IDs that have events in this period
      const merchants = await this.getMerchantsWithEvents(startDate, endDate);
      
      // Standard metrics to aggregate
      const standardMetrics = [
        { metricKey: 'product_views', dimensionKey: 'product_id' },
        { metricKey: 'order_count', dimensionKey: 'status' },
        { metricKey: 'revenue', dimensionKey: 'date' },
        { metricKey: 'pageviews', dimensionKey: 'page' },
      ];
      
      // Process each merchant
      for (const merchantId of merchants) {
        for (const { metricKey, dimensionKey } of standardMetrics) {
          await this.aggregateEvents({
            merchantId,
            metricKey,
            dimensionKey,
            startDate,
            endDate,
            period,
          });
        }
      }
      
      this.logger.log(`Completed ${period} aggregations for ${merchants.length} merchants`);
    } catch (error) {
      this.logger.error(`Error running scheduled aggregations: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Run a custom aggregation based on the specified parameters
   */
  async runCustomAggregation(params: {
    merchantId: string;
    metricKey: string;
    dimensionKey: string;
    dimensionValueField: string;
    aggregationFunction: 'count' | 'sum' | 'avg' | 'min' | 'max';
    aggregationField?: string;
    filterConditions?: Record<string, any>;
    period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    startDate: Date;
    endDate: Date;
  }): Promise<void> {
    const { 
      merchantId, 
      metricKey, 
      dimensionKey, 
      dimensionValueField,
      aggregationFunction,
      aggregationField,
      filterConditions,
      period,
      startDate,
      endDate
    } = params;
    
    try {
      // Create query builder for more complex queries
      let queryBuilder = this.analyticsEventRepository.createQueryBuilder('event')
        .where('event.merchantId = :merchantId', { merchantId })
        .andWhere('event.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      
      // Add filter conditions if provided
      if (filterConditions) {
        Object.entries(filterConditions).forEach(([key, value]) => {
          queryBuilder = queryBuilder.andWhere(`event.eventData ->> '${key}' = :${key}`, { [key]: value });
        });
      }
      
      // Use JSON path to access the dimension value field
      const dimensionValueQuery = `event.eventData ->> '${dimensionValueField}'`;
      
      // Build aggregation query based on the function
      let aggregationQuery = 'COUNT(*)';
      if (aggregationFunction !== 'count' && aggregationField) {
        aggregationQuery = `${aggregationFunction.toUpperCase()}(CAST(event.eventData ->> '${aggregationField}' as DECIMAL))`;
      }
      
      // Execute the query, grouping by dimension value
      const results = await queryBuilder
        .select(dimensionValueQuery, 'dimensionValue')
        .addSelect(aggregationQuery, 'value')
        .groupBy(dimensionValueQuery)
        .getRawMany();
      
      // Calculate period dates
      const { periodStart, periodEnd } = this.calculatePeriodDates(period, startDate);
      
      // Save aggregates
      for (const result of results) {
        const dimensionValue = result.dimensionValue;
        const value = Number(result.value);
        
        // Create dimension values object
        const dimensionValues = { [dimensionKey]: dimensionValue };
        
        // Find or create aggregate
        const existingAggregate = await this.analyticsAggregateRepository.findOne({
          where: {
            merchantId,
            metricKey,
            dimensionKey,
            periodStart,
            period,
          },
        });
        
        if (existingAggregate) {
          // Update existing aggregate
          existingAggregate.value = value;
          existingAggregate.dimensionValues = dimensionValues;
          existingAggregate.updatedAt = new Date();
          await this.analyticsAggregateRepository.save(existingAggregate);
        } else {
          // Create new aggregate
          const newAggregate = this.analyticsAggregateRepository.create({
            merchantId,
            metricKey,
            dimensionKey,
            dimensionValues,
            value,
            period,
            periodStart,
            periodEnd,
            sampleSize: results.length,
          });
          await this.analyticsAggregateRepository.save(newAggregate);
        }
      }
      
      this.logger.log(`Successfully ran custom aggregation for ${metricKey} with ${results.length} results`);
    } catch (error) {
      this.logger.error(`Error running custom aggregation: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Group events by dimension value
   */
  private groupEventsByDimension(events: AnalyticsEvent[], dimensionKey: string): Record<string, AnalyticsEvent[]> {
    const groupedEvents: Record<string, AnalyticsEvent[]> = {};
    
    for (const event of events) {
      // Extract dimension value from event data
      const dimensionValue = 
        event.eventData[dimensionKey] || 
        event.sourceId || 
        'unknown';
      
      // Initialize array if not exists
      if (!groupedEvents[dimensionValue]) {
        groupedEvents[dimensionValue] = [];
      }
      
      // Add event to the group
      groupedEvents[dimensionValue].push(event);
    }
    
    return groupedEvents;
  }

  /**
   * Calculate period start and end dates
   */
  private calculatePeriodDates(
    period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    date: Date
  ): { periodStart: Date; periodEnd: Date } {
    switch (period) {
      case 'hourly':
        return {
          periodStart: startOfHour(date),
          periodEnd: endOfHour(date),
        };
      case 'daily':
        return {
          periodStart: startOfDay(date),
          periodEnd: endOfDay(date),
        };
      case 'weekly':
        return {
          periodStart: startOfWeek(date),
          periodEnd: endOfWeek(date),
        };
      case 'monthly':
        return {
          periodStart: startOfMonth(date),
          periodEnd: endOfMonth(date),
        };
      case 'quarterly':
        return {
          periodStart: startOfQuarter(date),
          periodEnd: endOfQuarter(date),
        };
      case 'yearly':
        return {
          periodStart: startOfYear(date),
          periodEnd: endOfYear(date),
        };
    }
  }

  /**
   * Get date range for scheduled aggregation
   */
  private getDateRangeForPeriod(
    period: 'hourly' | 'daily' | 'weekly' | 'monthly'
  ): { startDate: Date; endDate: Date } {
    const now = new Date();
    
    switch (period) {
      case 'hourly':
        return {
          startDate: startOfHour(subDays(now, 1)), // Last 24 hours
          endDate: now,
        };
      case 'daily':
        return {
          startDate: startOfDay(subDays(now, 7)), // Last 7 days
          endDate: now,
        };
      case 'weekly':
        return {
          startDate: startOfWeek(subDays(now, 30)), // Last 30 days
          endDate: now,
        };
      case 'monthly':
        return {
          startDate: startOfMonth(subDays(now, 90)), // Last 90 days
          endDate: now,
        };
    }
  }

  /**
   * Create or update an aggregate
   */
  private async createOrUpdateAggregate(params: {
    merchantId: string;
    metricKey: string;
    dimensionKey: string;
    dimensionValue: string;
    events: AnalyticsEvent[];
    period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    periodStart: Date;
    periodEnd: Date;
  }): Promise<void> {
    const { 
      merchantId, 
      metricKey, 
      dimensionKey, 
      dimensionValue, 
      events, 
      period, 
      periodStart, 
      periodEnd 
    } = params;
    
    // Create dimension values object
    const dimensionValues = { [dimensionKey]: dimensionValue };
    
    // Calculate value (count by default)
    const value = events.length;
    
    // Find or create aggregate
    const existingAggregate = await this.analyticsAggregateRepository.findOne({
      where: {
        merchantId,
        metricKey,
        dimensionKey,
        periodStart,
        period,
      },
    });
    
    if (existingAggregate) {
      // Update existing aggregate
      existingAggregate.value = value;
      existingAggregate.dimensionValues = dimensionValues;
      existingAggregate.updatedAt = new Date();
      await this.analyticsAggregateRepository.save(existingAggregate);
    } else {
      // Create new aggregate
      const newAggregate = this.analyticsAggregateRepository.create({
        merchantId,
        metricKey,
        dimensionKey,
        dimensionValues,
        value,
        period,
        periodStart,
        periodEnd,
        sampleSize: events.length,
      });
      await this.analyticsAggregateRepository.save(newAggregate);
    }
  }

  /**
   * Get merchants that have events in the given date range
   */
  private async getMerchantsWithEvents(startDate: Date, endDate: Date): Promise<string[]> {
    const results = await this.analyticsEventRepository
      .createQueryBuilder('event')
      .select('DISTINCT event.merchantId', 'merchantId')
      .where('event.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawMany();
    
    return results.map(result => result.merchantId);
  }
}
```

### 3. Scheduled Aggregation Task

Create a scheduled task for regular aggregation:

```typescript
// src/modules/analytics/tasks/aggregation.task.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnalyticsAggregationService } from '../services/analytics-aggregation.service';

@Injectable()
export class AggregationTask {
  private readonly logger = new Logger(AggregationTask.name);

  constructor(
    private readonly analyticsAggregationService: AnalyticsAggregationService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async runHourlyAggregation() {
    this.logger.log('Running hourly aggregation...');
    try {
      await this.analyticsAggregationService.runScheduledAggregations('hourly');
      this.logger.log('Hourly aggregation completed');
    } catch (error) {
      this.logger.error(`Error running hourly aggregation: ${error.message}`, error.stack);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runDailyAggregation() {
    this.logger.log('Running daily aggregation...');
    try {
      await this.analyticsAggregationService.runScheduledAggregations('daily');
      this.logger.log('Daily aggregation completed');
    } catch (error) {
      this.logger.error(`Error running daily aggregation: ${error.message}`, error.stack);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async runWeeklyAggregation() {
    this.logger.log('Running weekly aggregation...');
    try {
      await this.analyticsAggregationService.runScheduledAggregations('weekly');
      this.logger.log('Weekly aggregation completed');
    } catch (error) {
      this.logger.error(`Error running weekly aggregation: ${error.message}`, error.stack);
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async runMonthlyAggregation() {
    this.logger.log('Running monthly aggregation...');
    try {
      await this.analyticsAggregationService.runScheduledAggregations('monthly');
      this.logger.log('Monthly aggregation completed');
    } catch (error) {
      this.logger.error(`Error running monthly aggregation: ${error.message}`, error.stack);
    }
  }
}
```

### 4. Update Analytics Module

Update the analytics module with the new components:

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
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsProcessor } from './processors/analytics.processor';
import { AnalyticsAggregationService } from './services/analytics-aggregation.service';
import { AggregationTask } from './tasks/aggregation.task';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsEvent,
      AnalyticsAggregate,
      UserActivity,
      ReportDefinition,
      ReportResult,
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
    AggregationTask,
  ],
  exports: [
    AnalyticsService,
    AnalyticsAggregationService,
  ],
})
export class AnalyticsModule {}
```

## Dependencies & Prerequisites

- Completed Phase 5A-1 and 5A-2
- TypeORM for database interactions
- date-fns for date manipulation
- NestJS Schedule module for cron jobs

## Testing Guidelines

1. **Aggregation Logic:**
   - Test aggregation with various event types and dimensions
   - Verify period calculations are correct
   - Test edge cases like empty data sets

2. **Performance:**
   - Benchmark aggregation performance with large datasets
   - Test query optimization techniques
   - Measure database load during aggregation runs

3. **Scheduled Tasks:**
   - Verify cron expressions run at expected times
   - Test error handling and recovery
   - Verify concurrent aggregations don't conflict

## Next Phase

Continue to [Phase 5A-4: Metrics Definition](./shopify-app-phase5a4-metrics-definition.md) to implement the service for defining standard and custom metrics.
