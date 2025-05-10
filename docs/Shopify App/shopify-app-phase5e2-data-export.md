# Phase 5E-2: Analytics & Reporting - Data Export Capabilities

## Objectives

- Implement comprehensive data export features
- Create exporters for multiple file formats (CSV, Excel, JSON)
- Add scheduled export functionality
- Implement secure file storage and access

## Timeline: Week 26

## Tasks & Implementation Details

### 1. Data Export Service Interface

Define the interface for data exports:

```typescript
// src/modules/analytics/interfaces/data-export-service.interface.ts

import { ReportResult } from '../../entities/report-result.entity';

export type ExportFormat = 'csv' | 'excel' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  includeHeaders?: boolean;
  delimiter?: string; // For CSV
  dateFormat?: string;
  filename?: string;
}

export interface ExportResult {
  filename: string;
  fileUrl: string;
  fileSize: number;
  expiresAt: Date;
  format: ExportFormat;
}

export interface IDataExportService {
  exportReportData(reportResultId: string, options: ExportOptions): Promise<ExportResult>;
  exportMetricData(
    merchantId: string, 
    metricKey: string, 
    dimensionKey: string,
    options: ExportOptions & { 
      startDate?: Date;
      endDate?: Date;
      period?: string;
    }
  ): Promise<ExportResult>;
  exportRawEvents(
    merchantId: string,
    options: ExportOptions & {
      eventType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ExportResult>;
  getExportUrl(filename: string): Promise<string>;
}
```

### 2. Data Export Service Implementation

Implement the data export service:

```typescript
// src/modules/analytics/services/data-export.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ReportResult } from '../../entities/report-result.entity';
import { AnalyticsEvent } from '../../entities/analytics-event.entity';
import { MetricsQueryService } from './metrics-query.service';
import { S3 } from 'aws-sdk';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import {
  ExportFormat,
  ExportOptions,
  ExportResult,
  IDataExportService
} from '../interfaces/data-export-service.interface';

@Injectable()
export class DataExportService implements IDataExportService {
  private readonly logger = new Logger(DataExportService.name);
  private readonly s3Client: S3;
  private readonly bucketName: string;
  private readonly urlExpirationSeconds: number;

  constructor(
    @InjectRepository(ReportResult)
    private readonly reportResultRepository: Repository<ReportResult>,
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsEventRepository: Repository<AnalyticsEvent>,
    private readonly metricsQueryService: MetricsQueryService,
    private readonly configService: ConfigService,
  ) {
    // Initialize S3 client
    this.s3Client = new S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
    });
    
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    this.urlExpirationSeconds = this.configService.get<number>('EXPORT_URL_EXPIRATION_SECONDS', 3600);
  }

  /**
   * Export report data to a file
   */
  async exportReportData(reportResultId: string, options: ExportOptions): Promise<ExportResult> {
    try {
      // Find the report result
      const reportResult = await this.reportResultRepository.findOne({
        where: { id: reportResultId },
        relations: ['reportDefinition'],
      });
      
      if (!reportResult) {
        throw new NotFoundException(`Report result with ID ${reportResultId} not found`);
      }
      
      // Get the data to export
      const data = reportResult.resultData;
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('No data available for export');
      }
      
      // Generate a filename if not provided
      const filename = options.filename || this.generateFilename(
        reportResult.reportDefinition?.name || 'report',
        options.format
      );
      
      // Export the data to the requested format
      const exportBuffer = await this.formatData(data, options);
      
      // Upload to S3
      const uploadResult = await this.uploadToS3(exportBuffer, filename, options.format);
      
      // Generate a pre-signed URL for downloading
      const fileUrl = await this.getExportUrl(filename);
      
      // Return the export result
      return {
        filename,
        fileUrl,
        fileSize: exportBuffer.length,
        expiresAt: new Date(Date.now() + this.urlExpirationSeconds * 1000),
        format: options.format,
      };
    } catch (error) {
      this.logger.error(`Error exporting report data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Export metric data to a file
   */
  async exportMetricData(
    merchantId: string,
    metricKey: string,
    dimensionKey: string,
    options: ExportOptions & {
      startDate?: Date;
      endDate?: Date;
      period?: string;
    }
  ): Promise<ExportResult> {
    try {
      // Query the metric data
      const data = await this.metricsQueryService.queryMetric({
        merchantId,
        metricKey,
        dimensionKey,
        startDate: options.startDate,
        endDate: options.endDate,
        period: options.period as any,
      });
      
      if (!data || data.length === 0) {
        throw new Error('No data available for export');
      }
      
      // Generate a filename if not provided
      const filename = options.filename || this.generateFilename(
        `${metricKey}_${dimensionKey}`,
        options.format
      );
      
      // Export the data to the requested format
      const exportBuffer = await this.formatData(data, options);
      
      // Upload to S3
      const uploadResult = await this.uploadToS3(exportBuffer, filename, options.format);
      
      // Generate a pre-signed URL for downloading
      const fileUrl = await this.getExportUrl(filename);
      
      // Return the export result
      return {
        filename,
        fileUrl,
        fileSize: exportBuffer.length,
        expiresAt: new Date(Date.now() + this.urlExpirationSeconds * 1000),
        format: options.format,
      };
    } catch (error) {
      this.logger.error(`Error exporting metric data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Export raw analytics events to a file
   */
  async exportRawEvents(
    merchantId: string,
    options: ExportOptions & {
      eventType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ExportResult> {
    try {
      // Build the query
      let query = this.analyticsEventRepository
        .createQueryBuilder('event')
        .where('event.merchantId = :merchantId', { merchantId });
      
      // Add filters if provided
      if (options.eventType) {
        query = query.andWhere('event.eventType = :eventType', { eventType: options.eventType });
      }
      
      if (options.startDate) {
        query = query.andWhere('event.timestamp >= :startDate', { startDate: options.startDate });
      }
      
      if (options.endDate) {
        query = query.andWhere('event.timestamp <= :endDate', { endDate: options.endDate });
      }
      
      // Execute the query
      const events = await query
        .orderBy('event.timestamp', 'DESC')
        .limit(10000) // Limit to prevent memory issues
        .getMany();
      
      if (!events || events.length === 0) {
        throw new Error('No events available for export');
      }
      
      // Transform the events to a more export-friendly format
      const data = events.map(event => ({
        id: event.id,
        eventType: event.eventType,
        timestamp: event.timestamp,
        userId: event.userId,
        sessionId: event.sessionId,
        ...event.eventData,
      }));
      
      // Generate a filename if not provided
      const filename = options.filename || this.generateFilename(
        options.eventType ? `events_${options.eventType}` : 'events',
        options.format
      );
      
      // Export the data to the requested format
      const exportBuffer = await this.formatData(data, options);
      
      // Upload to S3
      const uploadResult = await this.uploadToS3(exportBuffer, filename, options.format);
      
      // Generate a pre-signed URL for downloading
      const fileUrl = await this.getExportUrl(filename);
      
      // Return the export result
      return {
        filename,
        fileUrl,
        fileSize: exportBuffer.length,
        expiresAt: new Date(Date.now() + this.urlExpirationSeconds * 1000),
        format: options.format,
      };
    } catch (error) {
      this.logger.error(`Error exporting raw events: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a pre-signed URL for downloading an export file
   */
  async getExportUrl(filename: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: `exports/${filename}`,
      Expires: this.urlExpirationSeconds,
    };
    
    return this.s3Client.getSignedUrlPromise('getObject', params);
  }

  /**
   * Format data to the requested export format
   */
  private async formatData(data: any[], options: ExportOptions): Promise<Buffer> {
    const { format, includeHeaders = true, delimiter = ',' } = options;
    
    switch (format) {
      case 'csv':
        return this.formatToCsv(data, includeHeaders, delimiter);
      
      case 'excel':
        return this.formatToExcel(data, includeHeaders);
      
      case 'json':
        return this.formatToJson(data);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Format data to CSV
   */
  private formatToCsv(data: any[], includeHeaders: boolean, delimiter: string): Buffer {
    if (!data || data.length === 0) {
      return Buffer.from('');
    }
    
    // Get the headers from the first data item
    const headers = Object.keys(data[0]);
    
    // Build the CSV content
    let csvContent = '';
    
    // Add headers if requested
    if (includeHeaders) {
      csvContent += headers.join(delimiter) + '\n';
    }
    
    // Add data rows
    for (const item of data) {
      const row = headers.map(header => {
        const value = item[header];
        
        // Handle different data types
        if (value === null || value === undefined) {
          return '';
        } else if (typeof value === 'string') {
          // Escape quotes and wrap in quotes if needed
          if (value.includes(delimiter) || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        } else if (value instanceof Date) {
          return value.toISOString();
        } else if (typeof value === 'object') {
          // Convert objects to JSON string
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        } else {
          return String(value);
        }
      });
      
      csvContent += row.join(delimiter) + '\n';
    }
    
    return Buffer.from(csvContent);
  }

  /**
   * Format data to Excel
   */
  private formatToExcel(data: any[], includeHeaders: boolean): Buffer {
    if (!data || data.length === 0) {
      return Buffer.from('');
    }
    
    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(data, {
      header: includeHeaders ? Object.keys(data[0]) : undefined,
    });
    
    // Create a workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    
    // Generate an array buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    return buffer;
  }

  /**
   * Format data to JSON
   */
  private formatToJson(data: any[]): Buffer {
    return Buffer.from(JSON.stringify(data, null, 2));
  }

  /**
   * Upload a file to S3
   */
  private async uploadToS3(buffer: Buffer, filename: string, format: ExportFormat): Promise<S3.ManagedUpload.SendData> {
    const contentType = this.getContentType(format);
    
    const params = {
      Bucket: this.bucketName,
      Key: `exports/${filename}`,
      Body: buffer,
      ContentType: contentType,
    };
    
    return this.s3Client.upload(params).promise();
  }

  /**
   * Get the content type for a format
   */
  private getContentType(format: ExportFormat): string {
    switch (format) {
      case 'csv':
        return 'text/csv';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'json':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Generate a filename for an export
   */
  private generateFilename(prefix: string, format: ExportFormat): string {
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    const uniqueId = uuidv4().slice(0, 8);
    
    switch (format) {
      case 'csv':
        return `${prefix}_${timestamp}_${uniqueId}.csv`;
      case 'excel':
        return `${prefix}_${timestamp}_${uniqueId}.xlsx`;
      case 'json':
        return `${prefix}_${timestamp}_${uniqueId}.json`;
      default:
        return `${prefix}_${timestamp}_${uniqueId}`;
    }
  }
}
```

### 3. Export Controller

Create a controller for handling export requests:

```typescript
// src/modules/analytics/controllers/export.controller.ts

import { Controller, Get, Post, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DataExportService } from '../services/data-export.service';
import { ExportOptions } from '../interfaces/data-export-service.interface';

@Controller('exports')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(
    private readonly dataExportService: DataExportService,
  ) {}

  @Post('reports/:reportId')
  async exportReport(
    @Param('reportId') reportId: string,
    @Body() options: ExportOptions,
  ) {
    return this.dataExportService.exportReportData(reportId, options);
  }

  @Post('metrics')
  async exportMetric(
    @Request() req,
    @Body() data: {
      metricKey: string;
      dimensionKey: string;
      startDate?: string;
      endDate?: string;
      period?: string;
      format: 'csv' | 'excel' | 'json';
      includeHeaders?: boolean;
    },
  ) {
    const merchantId = req.user.merchantId;
    
    return this.dataExportService.exportMetricData(
      merchantId,
      data.metricKey,
      data.dimensionKey,
      {
        format: data.format,
        includeHeaders: data.includeHeaders,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        period: data.period,
      },
    );
  }

  @Post('events')
  async exportEvents(
    @Request() req,
    @Body() data: {
      eventType?: string;
      startDate?: string;
      endDate?: string;
      format: 'csv' | 'excel' | 'json';
      includeHeaders?: boolean;
    },
  ) {
    const merchantId = req.user.merchantId;
    
    return this.dataExportService.exportRawEvents(
      merchantId,
      {
        format: data.format,
        includeHeaders: data.includeHeaders,
        eventType: data.eventType,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    );
  }

  @Get('download/:filename')
  async getDownloadUrl(@Param('filename') filename: string) {
    const url = await this.dataExportService.getExportUrl(filename);
    
    return { url };
  }
}
```

### 4. Scheduled Exports Service

Implement a service for scheduled exports:

```typescript
// src/modules/analytics/services/scheduled-export.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScheduledExport } from '../../entities/scheduled-export.entity';
import { DataExportService } from './data-export.service';
import { EmailService } from '../../common/services/email.service';
import { format } from 'date-fns';

@Injectable()
export class ScheduledExportService {
  private readonly logger = new Logger(ScheduledExportService.name);

  constructor(
    @InjectRepository(ScheduledExport)
    private readonly scheduledExportRepository: Repository<ScheduledExport>,
    private readonly dataExportService: DataExportService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Create a scheduled export
   */
  async createScheduledExport(
    merchantId: string,
    config: Partial<ScheduledExport>,
  ): Promise<ScheduledExport> {
    const scheduledExport = this.scheduledExportRepository.create({
      merchantId,
      name: config.name,
      frequency: config.frequency,
      exportType: config.exportType,
      configuration: config.configuration,
      recipients: config.recipients,
      isActive: true,
    });
    
    return this.scheduledExportRepository.save(scheduledExport);
  }

  /**
   * Update a scheduled export
   */
  async updateScheduledExport(
    id: string,
    config: Partial<ScheduledExport>,
  ): Promise<ScheduledExport> {
    await this.scheduledExportRepository.update(id, config);
    
    return this.scheduledExportRepository.findOne({
      where: { id },
    });
  }

  /**
   * Delete a scheduled export
   */
  async deleteScheduledExport(id: string): Promise<void> {
    await this.scheduledExportRepository.delete(id);
  }

  /**
   * Get scheduled exports for a merchant
   */
  async getScheduledExports(merchantId: string): Promise<ScheduledExport[]> {
    return this.scheduledExportRepository.find({
      where: { merchantId },
    });
  }

  /**
   * Run daily scheduled exports
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runDailyExports() {
    this.logger.log('Running daily scheduled exports');
    await this.runScheduledExports('daily');
  }

  /**
   * Run weekly scheduled exports
   */
  @Cron(CronExpression.EVERY_WEEK)
  async runWeeklyExports() {
    this.logger.log('Running weekly scheduled exports');
    await this.runScheduledExports('weekly');
  }

  /**
   * Run monthly scheduled exports
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async runMonthlyExports() {
    this.logger.log('Running monthly scheduled exports');
    await this.runScheduledExports('monthly');
  }

  /**
   * Run scheduled exports for a specific frequency
   */
  private async runScheduledExports(frequency: 'daily' | 'weekly' | 'monthly') {
    try {
      // Find scheduled exports with the specified frequency
      const scheduledExports = await this.scheduledExportRepository.find({
        where: {
          frequency,
          isActive: true,
        },
      });
      
      this.logger.log(`Found ${scheduledExports.length} ${frequency} exports to process`);
      
      // Process each scheduled export
      for (const scheduledExport of scheduledExports) {
        await this.processScheduledExport(scheduledExport);
      }
      
      this.logger.log(`Completed ${scheduledExports.length} ${frequency} exports`);
    } catch (error) {
      this.logger.error(`Error running ${frequency} exports: ${error.message}`, error.stack);
    }
  }

  /**
   * Process a single scheduled export
   */
  private async processScheduledExport(scheduledExport: ScheduledExport) {
    try {
      this.logger.log(`Processing scheduled export ${scheduledExport.id}: ${scheduledExport.name}`);
      
      const { merchantId, exportType, configuration } = scheduledExport;
      let exportResult;
      
      // Handle different export types
      switch (exportType) {
        case 'report':
          if (configuration.reportId) {
            exportResult = await this.dataExportService.exportReportData(
              configuration.reportId,
              {
                format: configuration.format || 'csv',
                includeHeaders: configuration.includeHeaders !== false,
              },
            );
          }
          break;
          
        case 'metric':
          if (configuration.metricKey && configuration.dimensionKey) {
            // Set dates based on frequency
            const { startDate, endDate } = this.getDateRangeForFrequency(scheduledExport.frequency);
            
            exportResult = await this.dataExportService.exportMetricData(
              merchantId,
              configuration.metricKey,
              configuration.dimensionKey,
              {
                format: configuration.format || 'csv',
                includeHeaders: configuration.includeHeaders !== false,
                startDate,
                endDate,
                period: configuration.period || 'day',
              },
            );
          }
          break;
          
        case 'events':
          // Set dates based on frequency
          const { startDate, endDate } = this.getDateRangeForFrequency(scheduledExport.frequency);
          
          exportResult = await this.dataExportService.exportRawEvents(
            merchantId,
            {
              format: configuration.format || 'csv',
              includeHeaders: configuration.includeHeaders !== false,
              eventType: configuration.eventType,
              startDate,
              endDate,
            },
          );
          break;
      }
      
      // Send the export via email if recipients are specified
      if (exportResult && scheduledExport.recipients && scheduledExport.recipients.length > 0) {
        await this.sendExportEmail(scheduledExport, exportResult);
      }
      
      // Update last run timestamp
      await this.scheduledExportRepository.update(scheduledExport.id, {
        lastRunAt: new Date(),
      });
      
      this.logger.log(`Completed scheduled export ${scheduledExport.id}`);
    } catch (error) {
      this.logger.error(`Error processing scheduled export ${scheduledExport.id}: ${error.message}`, error.stack);
    }
  }

  /**
   * Send an export via email
   */
  private async sendExportEmail(scheduledExport: ScheduledExport, exportResult: any) {
    try {
      const subject = `${scheduledExport.name} - ${format(new Date(), 'yyyy-MM-dd')}`;
      
      const message = `
        Your scheduled export "${scheduledExport.name}" is ready.
        
        Export details:
        - Format: ${exportResult.format}
        - File size: ${this.formatFileSize(exportResult.fileSize)}
        - Generated at: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}
        
        You can download the file by clicking the link below. The link will expire in 24 hours.
        
        ${exportResult.fileUrl}
      `;
      
      await this.emailService.sendEmail({
        to: scheduledExport.recipients,
        subject,
        text: message,
      });
      
      this.logger.log(`Sent export email for ${scheduledExport.id} to ${scheduledExport.recipients.length} recipients`);
    } catch (error) {
      this.logger.error(`Error sending export email: ${error.message}`, error.stack);
    }
  }

  /**
   * Get date range based on frequency
   */
  private getDateRangeForFrequency(frequency: string): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (frequency) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    return { startDate, endDate };
  }

  /**
   * Format file size in a human-readable format
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  }
}
```

### 5. Scheduled Export Entity

Define the scheduled export entity:

```typescript
// src/modules/entities/scheduled-export.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('scheduled_exports')
export class ScheduledExport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'merchant_id' })
  merchantId: string;

  @Column()
  frequency: 'daily' | 'weekly' | 'monthly';

  @Column({ name: 'export_type' })
  exportType: 'report' | 'metric' | 'events';

  @Column('json')
  configuration: {
    format: 'csv' | 'excel' | 'json';
    includeHeaders?: boolean;
    reportId?: string;
    metricKey?: string;
    dimensionKey?: string;
    period?: string;
    eventType?: string;
  };

  @Column('simple-array')
  recipients: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ name: 'last_run_at', nullable: true, type: 'timestamp' })
  lastRunAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

## Dependencies & Prerequisites

- Completed Phase 5A-5D sections
- AWS S3 for file storage
- NestJS Schedule module for recurring exports
- XLSX library for Excel file generation

## Testing Guidelines

1. **Format Testing:**
   - Test exporting data in CSV, Excel, and JSON formats
   - Verify correct handling of special characters and complex data

2. **Storage Testing:**
   - Test uploading files to S3
   - Verify URL generation and access control

3. **Scheduled Exports:**
   - Test scheduling exports with different frequencies
   - Verify email delivery of exported files

## Next Phase

Continue to [Phase 5E-3: Third-party Integrations](./shopify-app-phase5e3-third-party-integrations.md) to implement connections with external analytics tools.
