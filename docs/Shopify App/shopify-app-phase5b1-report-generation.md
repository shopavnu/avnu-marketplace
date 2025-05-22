# Phase 5B-1: Analytics & Reporting - Report Generation

## Objectives

- Implement a flexible report generation system
- Create standard e-commerce reports for Shopify integration
- Enable custom report creation by merchants

## Timeline: Week 20-21

## Tasks & Implementation Details

### 1. Report Generation Service Interface

Define the interface for the report generation service:

```typescript
// src/modules/analytics/interfaces/report-generation-service.interface.ts

import { ReportDefinition } from '../../entities/report-definition.entity';
import { ReportResult } from '../../entities/report-result.entity';

export interface ReportParameters {
  startDate?: Date;
  endDate?: Date;
  filters?: Array<{
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith';
    value: any;
  }>;
  sort?: Array<{
    field: string;
    direction: 'asc' | 'desc';
  }>;
  limit?: number;
  offset?: number;
  format?: 'json' | 'csv' | 'excel';
}

export interface IReportGenerationService {
  generateReport(reportId: string, parameters: ReportParameters): Promise<ReportResult>;
  generateCustomReport(merchantId: string, config: Partial<ReportDefinition>, parameters: ReportParameters): Promise<ReportResult>;
  getReportById(reportId: string): Promise<ReportResult>;
  getReportsForMerchant(merchantId: string, options?: { page?: number; limit?: number; }): Promise<{ reports: ReportResult[]; total: number; }>;
  saveReportDefinition(merchantId: string, definition: Partial<ReportDefinition>): Promise<ReportDefinition>;
  getReportDefinitions(merchantId: string): Promise<ReportDefinition[]>;
  deleteReportDefinition(reportId: string): Promise<void>;
}
```

### 2. Report Generation Service Implementation

Implement the core report generation service:

```typescript
// src/modules/analytics/services/report-generation.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ReportDefinition } from '../../entities/report-definition.entity';
import { ReportResult } from '../../entities/report-result.entity';
import { AnalyticsAggregate } from '../../entities/analytics-aggregate.entity';
import { MetricsRegistryService } from './metrics-registry.service';
import { MetricsQueryService } from './metrics-query.service';
import { ReportParameters, IReportGenerationService } from '../interfaces/report-generation-service.interface';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReportGenerationService implements IReportGenerationService {
  private readonly logger = new Logger(ReportGenerationService.name);

  constructor(
    @InjectRepository(ReportDefinition)
    private readonly reportDefinitionRepository: Repository<ReportDefinition>,
    @InjectRepository(ReportResult)
    private readonly reportResultRepository: Repository<ReportResult>,
    @InjectRepository(AnalyticsAggregate)
    private readonly analyticsAggregateRepository: Repository<AnalyticsAggregate>,
    private readonly metricsRegistry: MetricsRegistryService,
    private readonly metricsQuery: MetricsQueryService,
    @InjectQueue('reports')
    private readonly reportsQueue: Queue,
  ) {}

  /**
   * Generate a report based on a saved report definition
   */
  async generateReport(reportId: string, parameters: ReportParameters): Promise<ReportResult> {
    try {
      // Find the report definition
      const reportDefinition = await this.reportDefinitionRepository.findOne({
        where: { id: reportId }
      });
      
      if (!reportDefinition) {
        throw new NotFoundException(`Report definition with ID ${reportId} not found`);
      }
      
      // Create a report result entry with pending status
      const reportResult = this.reportResultRepository.create({
        reportDefinitionId: reportDefinition.id,
        merchantId: reportDefinition.merchantId,
        status: 'pending',
        parameters: {
          ...parameters,
          reportType: reportDefinition.reportType,
          metrics: reportDefinition.config.metrics,
          dimensions: reportDefinition.config.dimensions,
          filters: [...(reportDefinition.config.filters || []), ...(parameters.filters || [])],
          sort: parameters.sort || reportDefinition.config.sort,
          limit: parameters.limit || reportDefinition.config.limit,
        },
      });
      
      const savedResult = await this.reportResultRepository.save(reportResult);
      
      // Queue the report generation task
      await this.reportsQueue.add('generate-report', {
        reportResultId: savedResult.id,
        reportDefinitionId: reportDefinition.id,
        parameters: savedResult.parameters,
      }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      });
      
      return savedResult;
    } catch (error) {
      this.logger.error(`Error initiating report generation: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate a custom report without saving the definition
   */
  async generateCustomReport(
    merchantId: string,
    config: Partial<ReportDefinition>,
    parameters: ReportParameters
  ): Promise<ReportResult> {
    try {
      // Create a temporary report definition
      const tempDefinition = {
        id: uuidv4(),
        merchantId,
        name: config.name || `Ad-hoc Report ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
        description: config.description || 'Custom report generated on-demand',
        reportType: config.reportType || 'custom',
        config: {
          metrics: config.config?.metrics || [],
          dimensions: config.config?.dimensions || [],
          filters: config.config?.filters || [],
          sort: config.config?.sort || [],
          limit: config.config?.limit || 1000,
          format: config.config?.format || 'json',
        },
        isSystem: false,
        isActive: true,
        isScheduled: false,
      };
      
      // Create a report result entry with pending status
      const reportResult = this.reportResultRepository.create({
        reportDefinitionId: tempDefinition.id, // This won't be a real ID in the database
        merchantId,
        status: 'pending',
        parameters: {
          ...parameters,
          reportType: tempDefinition.reportType,
          metrics: tempDefinition.config.metrics,
          dimensions: tempDefinition.config.dimensions,
          filters: [...(tempDefinition.config.filters || []), ...(parameters.filters || [])],
          sort: parameters.sort || tempDefinition.config.sort,
          limit: parameters.limit || tempDefinition.config.limit,
        },
      });
      
      const savedResult = await this.reportResultRepository.save(reportResult);
      
      // Queue the report generation task
      await this.reportsQueue.add('generate-custom-report', {
        reportResultId: savedResult.id,
        tempDefinition,
        parameters: savedResult.parameters,
      }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      });
      
      return savedResult;
    } catch (error) {
      this.logger.error(`Error initiating custom report generation: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a report result by ID
   */
  async getReportById(reportId: string): Promise<ReportResult> {
    const report = await this.reportResultRepository.findOne({
      where: { id: reportId },
      relations: ['reportDefinition'],
    });
    
    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }
    
    return report;
  }

  /**
   * Get reports for a merchant with pagination
   */
  async getReportsForMerchant(
    merchantId: string,
    options: { page?: number; limit?: number; } = {}
  ): Promise<{ reports: ReportResult[]; total: number; }> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    
    const [reports, total] = await this.reportResultRepository.findAndCount({
      where: { merchantId },
      relations: ['reportDefinition'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    
    return { reports, total };
  }

  /**
   * Save a report definition
   */
  async saveReportDefinition(
    merchantId: string,
    definition: Partial<ReportDefinition>
  ): Promise<ReportDefinition> {
    try {
      // Check if this is an update to an existing definition
      let reportDefinition: ReportDefinition;
      
      if (definition.id) {
        reportDefinition = await this.reportDefinitionRepository.findOne({
          where: { id: definition.id, merchantId }
        });
        
        if (!reportDefinition) {
          throw new NotFoundException(`Report definition with ID ${definition.id} not found`);
        }
        
        // Update fields
        Object.assign(reportDefinition, {
          name: definition.name,
          description: definition.description,
          reportType: definition.reportType,
          config: definition.config,
          isActive: definition.isActive !== undefined ? definition.isActive : reportDefinition.isActive,
          isScheduled: definition.isScheduled !== undefined ? definition.isScheduled : reportDefinition.isScheduled,
          scheduleConfig: definition.scheduleConfig || reportDefinition.scheduleConfig,
        });
      } else {
        // Create new definition
        reportDefinition = this.reportDefinitionRepository.create({
          merchantId,
          name: definition.name || `Report ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
          description: definition.description,
          reportType: definition.reportType || 'custom',
          config: definition.config || {
            metrics: [],
            dimensions: [],
            filters: [],
            sort: [],
            limit: 1000,
            format: 'json',
          },
          isSystem: false,
          isActive: definition.isActive !== undefined ? definition.isActive : true,
          isScheduled: definition.isScheduled !== undefined ? definition.isScheduled : false,
          scheduleConfig: definition.scheduleConfig,
        });
      }
      
      // Save or update
      return this.reportDefinitionRepository.save(reportDefinition);
    } catch (error) {
      this.logger.error(`Error saving report definition: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all report definitions for a merchant
   */
  async getReportDefinitions(merchantId: string): Promise<ReportDefinition[]> {
    return this.reportDefinitionRepository.find({
      where: { merchantId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Delete a report definition
   */
  async deleteReportDefinition(reportId: string): Promise<void> {
    const result = await this.reportDefinitionRepository.delete(reportId);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Report definition with ID ${reportId} not found`);
    }
  }

  /**
   * Internal method to execute report query and save results
   * This is called by the queue processor
   */
  async executeReport(
    reportResultId: string,
    reportDefinition: ReportDefinition | any,
    parameters: ReportParameters
  ): Promise<void> {
    try {
      this.logger.log(`Executing report ${reportResultId}`);
      
      // Find the report result
      const reportResult = await this.reportResultRepository.findOne({
        where: { id: reportResultId }
      });
      
      if (!reportResult) {
        throw new Error(`Report result ${reportResultId} not found`);
      }
      
      // Update status to processing
      reportResult.status = 'processing';
      await this.reportResultRepository.save(reportResult);
      
      // Start execution time tracking
      const startTime = Date.now();
      
      // Extract parameters
      const { 
        startDate, 
        endDate, 
        metrics, 
        dimensions, 
        filters, 
        sort, 
        limit,
        format = 'json'
      } = parameters;
      
      // Validate parameters
      if (!metrics || metrics.length === 0) {
        throw new Error('At least one metric must be specified');
      }
      
      if (!dimensions || dimensions.length === 0) {
        throw new Error('At least one dimension must be specified');
      }
      
      // Execute queries for each metric and dimension combination
      const results: Record<string, any> = {};
      
      for (const metricKey of metrics) {
        for (const dimensionKey of dimensions) {
          // Get appropriate period based on date range
          const period = this.determinePeriod(startDate, endDate);
          
          // Query the metric
          const metricData = await this.metricsQuery.queryMetric({
            merchantId: reportDefinition.merchantId,
            metricKey,
            dimensionKey,
            period,
            startDate,
            endDate,
            // Apply dimension filters if any
            dimensionValues: this.extractDimensionFilters(filters, dimensionKey),
          });
          
          // Store results
          results[`${metricKey}_${dimensionKey}`] = metricData;
        }
      }
      
      // Process and transform results
      const processedData = this.processReportData(results, metrics, dimensions, filters, sort, limit);
      
      // Format the result based on requested format
      let fileUrl = null;
      let fileSize = null;
      let fileFormat = null;
      
      if (format === 'csv' || format === 'excel') {
        // Generate file and get URL (implementation would save to S3 or similar)
        const generatedFile = await this.generateReportFile(processedData, format, reportDefinition.name);
        fileUrl = generatedFile.url;
        fileSize = generatedFile.size;
        fileFormat = format;
      }
      
      // Update report result
      reportResult.status = 'completed';
      reportResult.resultData = processedData;
      reportResult.fileUrl = fileUrl;
      reportResult.fileFormat = fileFormat;
      reportResult.fileSize = fileSize;
      reportResult.executionTime = Date.now() - startTime;
      reportResult.rowCount = processedData.length;
      reportResult.completedAt = new Date();
      
      await this.reportResultRepository.save(reportResult);
      
      this.logger.log(`Report ${reportResultId} completed with ${processedData.length} rows`);
    } catch (error) {
      this.logger.error(`Error executing report: ${error.message}`, error.stack);
      
      // Update report result with error
      await this.reportResultRepository.update(reportResultId, {
        status: 'failed',
        error: error.message,
        completedAt: new Date(),
      });
      
      throw error;
    }
  }

  /**
   * Determine appropriate period based on date range
   */
  private determinePeriod(startDate: Date, endDate: Date): 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' {
    const diffInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays <= 2) {
      return 'hourly';
    } else if (diffInDays <= 31) {
      return 'daily';
    } else if (diffInDays <= 90) {
      return 'weekly';
    } else if (diffInDays <= 365) {
      return 'monthly';
    } else if (diffInDays <= 730) { // ~2 years
      return 'quarterly';
    } else {
      return 'yearly';
    }
  }

  /**
   * Extract dimension filter values
   */
  private extractDimensionFilters(filters: any[] = [], dimensionKey: string): string[] | undefined {
    const dimensionFilter = filters?.find(filter => 
      filter.field === dimensionKey && filter.operator === 'in' && Array.isArray(filter.value)
    );
    
    return dimensionFilter?.value;
  }

  /**
   * Process and transform report data
   */
  private processReportData(
    results: Record<string, any>,
    metrics: string[],
    dimensions: string[],
    filters: any[] = [],
    sort: any[] = [],
    limit: number = 1000
  ): any[] {
    // Implementation would combine and transform data based on metrics and dimensions
    // This is a simplified placeholder
    
    // Create a combined dataset
    const combinedData: any[] = [];
    
    // Just returning a placeholder for now
    return combinedData.slice(0, limit);
  }

  /**
   * Generate a report file in the requested format
   */
  private async generateReportFile(
    data: any[],
    format: 'csv' | 'excel',
    reportName: string
  ): Promise<{ url: string; size: number }> {
    // Implementation would generate and upload the file
    // This is a placeholder
    return {
      url: `https://example.com/reports/${format}/${reportName.replace(/\s+/g, '-').toLowerCase()}.${format}`,
      size: 1024, // Placeholder size in bytes
    };
  }
}
```

### 3. Report Queue Processor

Create a processor for handling report generation in the background:

```typescript
// src/modules/analytics/processors/report.processor.ts

import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bull';
import { ReportDefinition } from '../../entities/report-definition.entity';
import { ReportGenerationService } from '../services/report-generation.service';

@Processor('reports')
export class ReportProcessor {
  private readonly logger = new Logger(ReportProcessor.name);

  constructor(
    @InjectRepository(ReportDefinition)
    private readonly reportDefinitionRepository: Repository<ReportDefinition>,
    private readonly reportGenerationService: ReportGenerationService,
  ) {}

  @Process('generate-report')
  async processReportGeneration(job: Job): Promise<void> {
    try {
      const { reportResultId, reportDefinitionId, parameters } = job.data;
      
      this.logger.log(`Processing report generation for ${reportResultId}`);
      
      // Find the report definition
      const reportDefinition = await this.reportDefinitionRepository.findOne({
        where: { id: reportDefinitionId }
      });
      
      if (!reportDefinition) {
        throw new Error(`Report definition ${reportDefinitionId} not found`);
      }
      
      // Execute the report
      await this.reportGenerationService.executeReport(
        reportResultId,
        reportDefinition,
        parameters
      );
      
      // Update the last run time for the report definition
      await this.reportDefinitionRepository.update(reportDefinitionId, {
        lastRunAt: new Date(),
      });
      
      this.logger.log(`Report generation for ${reportResultId} completed`);
    } catch (error) {
      this.logger.error(`Error processing report generation: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('generate-custom-report')
  async processCustomReportGeneration(job: Job): Promise<void> {
    try {
      const { reportResultId, tempDefinition, parameters } = job.data;
      
      this.logger.log(`Processing custom report generation for ${reportResultId}`);
      
      // Execute the report with the temporary definition
      await this.reportGenerationService.executeReport(
        reportResultId,
        tempDefinition,
        parameters
      );
      
      this.logger.log(`Custom report generation for ${reportResultId} completed`);
    } catch (error) {
      this.logger.error(`Error processing custom report generation: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### 4. Standard Report Templates

Create a service for standard report templates:

```typescript
// src/modules/analytics/services/report-templates.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ReportDefinition } from '../../entities/report-definition.entity';

@Injectable()
export class ReportTemplatesService {
  private readonly logger = new Logger(ReportTemplatesService.name);
  private readonly standardTemplates: Record<string, Partial<ReportDefinition>> = {};

  constructor() {
    this.initializeStandardTemplates();
  }

  /**
   * Get a standard report template by key
   */
  getTemplate(key: string): Partial<ReportDefinition> | null {
    return this.standardTemplates[key] || null;
  }

  /**
   * Get all available templates
   */
  getAllTemplates(): Record<string, Partial<ReportDefinition>> {
    return { ...this.standardTemplates };
  }

  /**
   * Create a report definition from a template
   */
  createFromTemplate(templateKey: string, merchantId: string, overrides: Partial<ReportDefinition> = {}): Partial<ReportDefinition> {
    const template = this.getTemplate(templateKey);
    
    if (!template) {
      throw new Error(`Template with key ${templateKey} not found`);
    }
    
    return {
      ...template,
      merchantId,
      ...overrides,
      name: overrides.name || template.name,
      isSystem: false,
      isActive: true,
      isScheduled: false,
    };
  }

  /**
   * Initialize standard report templates
   */
  private initializeStandardTemplates(): void {
    this.standardTemplates['sales_summary'] = {
      name: 'Sales Summary',
      description: 'Overview of sales and order metrics',
      reportType: 'sales',
      config: {
        metrics: ['order_count', 'revenue', 'average_order_value'],
        dimensions: ['date'],
        filters: [],
        sort: [{ field: 'date', direction: 'asc' }],
        limit: 100,
        format: 'json',
      },
    };
    
    this.standardTemplates['product_performance'] = {
      name: 'Product Performance',
      description: 'Product sales and performance metrics',
      reportType: 'products',
      config: {
        metrics: ['revenue', 'order_count', 'product_views', 'conversion_rate'],
        dimensions: ['product_id'],
        filters: [],
        sort: [{ field: 'revenue', direction: 'desc' }],
        limit: 100,
        format: 'json',
      },
    };
    
    this.standardTemplates['customer_acquisition'] = {
      name: 'Customer Acquisition',
      description: 'New vs returning customer metrics',
      reportType: 'customers',
      config: {
        metrics: ['new_customers', 'returning_customers', 'revenue'],
        dimensions: ['date'],
        filters: [],
        sort: [{ field: 'date', direction: 'asc' }],
        limit: 100,
        format: 'json',
      },
    };
    
    this.standardTemplates['traffic_sources'] = {
      name: 'Traffic Sources',
      description: 'Visitor sources and referrers',
      reportType: 'traffic',
      config: {
        metrics: ['pageviews', 'order_count', 'conversion_rate'],
        dimensions: ['referrer'],
        filters: [],
        sort: [{ field: 'pageviews', direction: 'desc' }],
        limit: 100,
        format: 'json',
      },
    };
  }
}
```

### 5. Report API Controller

Create an API controller for report operations:

```typescript
// src/modules/analytics/controllers/reports.controller.ts

import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ReportGenerationService } from '../services/report-generation.service';
import { ReportTemplatesService } from '../services/report-templates.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReportParameters } from '../interfaces/report-generation-service.interface';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(
    private readonly reportGenerationService: ReportGenerationService,
    private readonly reportTemplatesService: ReportTemplatesService,
  ) {}

  @Get('definitions')
  async getReportDefinitions(@Request() req) {
    const merchantId = req.user.merchantId;
    return this.reportGenerationService.getReportDefinitions(merchantId);
  }

  @Post('definitions')
  async createReportDefinition(@Request() req, @Body() definition: any) {
    const merchantId = req.user.merchantId;
    return this.reportGenerationService.saveReportDefinition(merchantId, definition);
  }

  @Delete('definitions/:id')
  async deleteReportDefinition(@Param('id') id: string) {
    return this.reportGenerationService.deleteReportDefinition(id);
  }

  @Get('templates')
  async getReportTemplates() {
    return this.reportTemplatesService.getAllTemplates();
  }

  @Post('generate/:reportId')
  async generateReport(@Param('reportId') reportId: string, @Body() parameters: ReportParameters) {
    return this.reportGenerationService.generateReport(reportId, parameters);
  }

  @Post('generate-custom')
  async generateCustomReport(@Request() req, @Body() data: { config: any; parameters: ReportParameters }) {
    const merchantId = req.user.merchantId;
    return this.reportGenerationService.generateCustomReport(merchantId, data.config, data.parameters);
  }

  @Get('results')
  async getReports(@Request() req, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    const merchantId = req.user.merchantId;
    return this.reportGenerationService.getReportsForMerchant(merchantId, { page, limit });
  }

  @Get('results/:id')
  async getReportById(@Param('id') id: string) {
    return this.reportGenerationService.getReportById(id);
  }
}
```

### 6. Update Analytics Module

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
import { CustomMetric } from '../entities/custom-metric.entity';
import { CustomDimension } from '../entities/custom-dimension.entity';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsProcessor } from './processors/analytics.processor';
import { AnalyticsAggregationService } from './services/analytics-aggregation.service';
import { MetricsRegistryService } from './services/metrics-registry.service';
import { MetricsQueryService } from './services/metrics-query.service';
import { ReportGenerationService } from './services/report-generation.service';
import { ReportTemplatesService } from './services/report-templates.service';
import { ReportProcessor } from './processors/report.processor';
import { ReportsController } from './controllers/reports.controller';
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
    BullModule.registerQueue({
      name: 'reports',
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    ReportsController,
  ],
  providers: [
    AnalyticsService,
    AnalyticsProcessor,
    AnalyticsAggregationService,
    MetricsRegistryService,
    MetricsQueryService,
    ReportGenerationService,
    ReportTemplatesService,
    ReportProcessor,
    AggregationTask,
  ],
  exports: [
    AnalyticsService,
    AnalyticsAggregationService,
    MetricsRegistryService,
    MetricsQueryService,
    ReportGenerationService,
    ReportTemplatesService,
  ],
})
export class AnalyticsModule {}
```

## Dependencies & Prerequisites

- Completed Phase 5A-1 through 5A-4
- Bull queue for background processing
- File storage service (S3 or similar) for report exports
- CSV/Excel generation libraries

## Testing Guidelines

1. **Report Generation:**
   - Test generation of standard reports
   - Verify custom report parameters are applied correctly
   - Test error handling for invalid configurations

2. **Performance:**
   - Benchmark report generation times with various data sizes
   - Verify queue processing works efficiently
   - Test memory usage during large report generation

3. **API Integration:**
   - Test all API endpoints in the reports controller
   - Verify authentication and authorization
   - Test file downloads for CSV and Excel formats

## Next Phase

Continue to [Phase 5B-2: Scheduled Reports](./shopify-app-phase5b2-scheduled-reports.md) to implement the service for scheduling and automatically delivering reports.
