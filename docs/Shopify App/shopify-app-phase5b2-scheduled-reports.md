# Phase 5B-2: Analytics & Reporting - Scheduled Reports

## Objectives

- Implement report scheduling functionality
- Create an email delivery system for reports
- Enable recurring report generation with customizable frequency

## Timeline: Week 21

## Tasks & Implementation Details

### 1. Report Scheduler Service Interface

Define the interface for the report scheduler service:

```typescript
// src/modules/analytics/interfaces/report-scheduler-service.interface.ts

import { ReportDefinition } from '../../entities/report-definition.entity';
import { ReportResult } from '../../entities/report-result.entity';

export interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6, where 0 is Sunday (for weekly)
  dayOfMonth?: number; // 1-31 (for monthly)
  hour: number; // 0-23
  minute: number; // 0-59
  recipients: string[];
  format: 'csv' | 'excel' | 'pdf';
  includeData: boolean;
  subject?: string;
  message?: string;
}

export interface IReportSchedulerService {
  scheduleReport(reportId: string, config: ScheduleConfig): Promise<ReportDefinition>;
  unscheduleReport(reportId: string): Promise<ReportDefinition>;
  updateSchedule(reportId: string, config: Partial<ScheduleConfig>): Promise<ReportDefinition>;
  runScheduledReports(frequency: 'daily' | 'weekly' | 'monthly'): Promise<void>;
  sendReportEmail(reportResultId: string, recipients: string[], options?: {
    subject?: string;
    message?: string;
    includeData?: boolean;
  }): Promise<void>;
}
```

### 2. Report Scheduler Service Implementation

Implement the report scheduler service:

```typescript
// src/modules/analytics/services/report-scheduler.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ReportDefinition } from '../../entities/report-definition.entity';
import { ReportResult } from '../../entities/report-result.entity';
import { ReportGenerationService } from './report-generation.service';
import { EmailService } from '../../common/services/email.service';
import { format } from 'date-fns';
import { ScheduleConfig, IReportSchedulerService } from '../interfaces/report-scheduler-service.interface';

@Injectable()
export class ReportSchedulerService implements IReportSchedulerService {
  private readonly logger = new Logger(ReportSchedulerService.name);

  constructor(
    @InjectRepository(ReportDefinition)
    private readonly reportDefinitionRepository: Repository<ReportDefinition>,
    @InjectRepository(ReportResult)
    private readonly reportResultRepository: Repository<ReportResult>,
    private readonly reportGenerationService: ReportGenerationService,
    private readonly emailService: EmailService,
    @InjectQueue('reports')
    private readonly reportsQueue: Queue,
  ) {}

  /**
   * Schedule a report
   */
  async scheduleReport(reportId: string, config: ScheduleConfig): Promise<ReportDefinition> {
    try {
      // Find the report definition
      const reportDefinition = await this.reportDefinitionRepository.findOne({
        where: { id: reportId }
      });
      
      if (!reportDefinition) {
        throw new NotFoundException(`Report definition with ID ${reportId} not found`);
      }
      
      // Validate the schedule config
      this.validateScheduleConfig(config);
      
      // Update the report definition
      reportDefinition.isScheduled = true;
      reportDefinition.scheduleConfig = config;
      
      // Save the changes
      return this.reportDefinitionRepository.save(reportDefinition);
    } catch (error) {
      this.logger.error(`Error scheduling report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Unschedule a report
   */
  async unscheduleReport(reportId: string): Promise<ReportDefinition> {
    try {
      // Find the report definition
      const reportDefinition = await this.reportDefinitionRepository.findOne({
        where: { id: reportId }
      });
      
      if (!reportDefinition) {
        throw new NotFoundException(`Report definition with ID ${reportId} not found`);
      }
      
      // Update the report definition
      reportDefinition.isScheduled = false;
      
      // Save the changes
      return this.reportDefinitionRepository.save(reportDefinition);
    } catch (error) {
      this.logger.error(`Error unscheduling report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update the schedule for a report
   */
  async updateSchedule(reportId: string, config: Partial<ScheduleConfig>): Promise<ReportDefinition> {
    try {
      // Find the report definition
      const reportDefinition = await this.reportDefinitionRepository.findOne({
        where: { id: reportId }
      });
      
      if (!reportDefinition) {
        throw new NotFoundException(`Report definition with ID ${reportId} not found`);
      }
      
      // Merge the new config with the existing one
      const updatedConfig = {
        ...reportDefinition.scheduleConfig,
        ...config,
      };
      
      // Validate the updated schedule config
      this.validateScheduleConfig(updatedConfig);
      
      // Update the report definition
      reportDefinition.scheduleConfig = updatedConfig;
      reportDefinition.isScheduled = true;
      
      // Save the changes
      return this.reportDefinitionRepository.save(reportDefinition);
    } catch (error) {
      this.logger.error(`Error updating report schedule: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Run scheduled reports for the specified frequency
   */
  async runScheduledReports(frequency: 'daily' | 'weekly' | 'monthly'): Promise<void> {
    try {
      this.logger.log(`Running scheduled ${frequency} reports`);
      
      // Find all scheduled reports with the specified frequency
      const scheduledReports = await this.reportDefinitionRepository.find({
        where: {
          isScheduled: true,
          isActive: true,
        },
      });
      
      // Filter reports based on frequency and whether they should run today
      const now = new Date();
      const reportsToRun = scheduledReports.filter(report => {
        const scheduleConfig = report.scheduleConfig;
        
        if (!scheduleConfig || scheduleConfig.frequency !== frequency) {
          return false;
        }
        
        // Check if the report should run based on day of week/month
        if (frequency === 'weekly' && scheduleConfig.dayOfWeek !== now.getDay()) {
          return false;
        }
        
        if (frequency === 'monthly' && scheduleConfig.dayOfMonth !== now.getDate()) {
          return false;
        }
        
        // Check if the report should run based on hour
        const currentHour = now.getHours();
        
        // Simple check: if we're running the task at the scheduled hour
        // In a real implementation, we would check more precisely and handle missed runs
        return scheduleConfig.hour === currentHour;
      });
      
      // Process each report that should run
      for (const report of reportsToRun) {
        await this.processScheduledReport(report);
      }
      
      this.logger.log(`Completed ${reportsToRun.length} scheduled ${frequency} reports`);
    } catch (error) {
      this.logger.error(`Error running scheduled reports: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send a report via email
   */
  async sendReportEmail(
    reportResultId: string,
    recipients: string[],
    options: {
      subject?: string;
      message?: string;
      includeData?: boolean;
    } = {}
  ): Promise<void> {
    try {
      // Get the report result
      const reportResult = await this.reportResultRepository.findOne({
        where: { id: reportResultId },
        relations: ['reportDefinition'],
      });
      
      if (!reportResult) {
        throw new NotFoundException(`Report result with ID ${reportResultId} not found`);
      }
      
      // Ensure the report is completed
      if (reportResult.status !== 'completed') {
        throw new Error(`Report is not yet completed, current status: ${reportResult.status}`);
      }
      
      // Get the report definition
      const reportDefinition = reportResult.reportDefinition;
      
      // Prepare the email subject
      const subject = options.subject || 
        `${reportDefinition.name} Report - ${format(new Date(), 'yyyy-MM-dd')}`;
      
      // Prepare the email message
      let message = options.message || 
        `Please find attached the ${reportDefinition.name} report.`;
      
      if (reportResult.rowCount) {
        message += `\n\nThe report contains ${reportResult.rowCount} rows of data.`;
      }
      
      // Prepare attachments
      const attachments = [];
      
      if (reportResult.fileUrl) {
        // Add the report file as an attachment
        attachments.push({
          filename: `${reportDefinition.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.${reportResult.fileFormat}`,
          path: reportResult.fileUrl,
        });
      } else if (options.includeData && reportResult.resultData) {
        // Generate a CSV on the fly if no file exists
        const csvContent = this.generateCsvFromData(reportResult.resultData);
        attachments.push({
          filename: `${reportDefinition.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.csv`,
          content: csvContent,
          contentType: 'text/csv',
        });
      }
      
      // Send the email
      await this.emailService.sendEmail({
        to: recipients,
        subject,
        text: message,
        attachments,
      });
      
      this.logger.log(`Sent report ${reportResultId} to ${recipients.length} recipients`);
    } catch (error) {
      this.logger.error(`Error sending report email: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Process a scheduled report
   */
  private async processScheduledReport(report: ReportDefinition): Promise<void> {
    try {
      this.logger.log(`Processing scheduled report ${report.id}: ${report.name}`);
      
      // Get the schedule config
      const scheduleConfig = report.scheduleConfig;
      
      // Define date range based on frequency
      const now = new Date();
      const { startDate, endDate } = this.getDateRangeForFrequency(scheduleConfig.frequency, now);
      
      // Generate the report
      const reportResult = await this.reportGenerationService.generateReport(report.id, {
        startDate,
        endDate,
        format: scheduleConfig.format,
      });
      
      // Queue email delivery
      await this.reportsQueue.add('send-report-email', {
        reportResultId: reportResult.id,
        recipients: scheduleConfig.recipients,
        options: {
          subject: scheduleConfig.subject,
          message: scheduleConfig.message,
          includeData: scheduleConfig.includeData,
        },
      }, {
        delay: 60000, // Wait for 1 minute to ensure report is completed
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000,
        },
      });
      
      this.logger.log(`Scheduled report ${report.id} queued for email delivery`);
    } catch (error) {
      this.logger.error(`Error processing scheduled report ${report.id}: ${error.message}`, error.stack);
      // Log error but don't rethrow to prevent blocking other reports
    }
  }

  /**
   * Validate schedule configuration
   */
  private validateScheduleConfig(config: ScheduleConfig): void {
    // Check required fields
    if (!config.frequency) {
      throw new Error('Schedule frequency is required');
    }
    
    if (config.hour === undefined || config.hour < 0 || config.hour > 23) {
      throw new Error('Schedule hour must be between 0 and 23');
    }
    
    if (config.minute === undefined || config.minute < 0 || config.minute > 59) {
      throw new Error('Schedule minute must be between 0 and 59');
    }
    
    if (!config.recipients || !Array.isArray(config.recipients) || config.recipients.length === 0) {
      throw new Error('At least one recipient email is required');
    }
    
    // Validate emails
    for (const email of config.recipients) {
      if (!this.isValidEmail(email)) {
        throw new Error(`Invalid email address: ${email}`);
      }
    }
    
    // Validate frequency-specific parameters
    if (config.frequency === 'weekly') {
      if (config.dayOfWeek === undefined || config.dayOfWeek < 0 || config.dayOfWeek > 6) {
        throw new Error('For weekly frequency, day of week must be between 0 (Sunday) and 6 (Saturday)');
      }
    }
    
    if (config.frequency === 'monthly') {
      if (config.dayOfMonth === undefined || config.dayOfMonth < 1 || config.dayOfMonth > 31) {
        throw new Error('For monthly frequency, day of month must be between 1 and 31');
      }
    }
  }

  /**
   * Get date range based on report frequency
   */
  private getDateRangeForFrequency(
    frequency: 'daily' | 'weekly' | 'monthly',
    referenceDate: Date
  ): { startDate: Date; endDate: Date } {
    const endDate = new Date(referenceDate);
    const startDate = new Date(referenceDate);
    
    switch (frequency) {
      case 'daily':
        // Last 24 hours
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'weekly':
        // Last 7 days
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        // Last 30 days
        startDate.setDate(startDate.getDate() - 30);
        break;
    }
    
    return { startDate, endDate };
  }

  /**
   * Validate email address format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate CSV from report data
   */
  private generateCsvFromData(data: any[]): string {
    if (!data || !data.length) {
      return 'No data available';
    }
    
    // Get headers from the first data item
    const headers = Object.keys(data[0]);
    
    // Create CSV header row
    let csv = headers.join(',') + '\n';
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        
        // Handle different data types
        if (value === null || value === undefined) {
          return '';
        } else if (typeof value === 'string') {
          // Escape quotes and wrap in quotes
          return `"${value.replace(/"/g, '""')}"`;
        } else if (value instanceof Date) {
          return `"${value.toISOString()}"`;
        } else if (typeof value === 'object') {
          // Convert objects to JSON string
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        } else {
          return value;
        }
      });
      
      csv += values.join(',') + '\n';
    }
    
    return csv;
  }
}
```

### 3. Email Service Implementation

Create an email service for sending reports:

```typescript
// src/modules/common/services/email.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string | Buffer;
    contentType?: string;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter<SentMessageInfo>;

  constructor(private readonly configService: ConfigService) {
    // Create a transporter with the configured settings
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_SMTP_HOST'),
      port: this.configService.get<number>('EMAIL_SMTP_PORT'),
      secure: this.configService.get<boolean>('EMAIL_SMTP_SECURE'),
      auth: {
        user: this.configService.get<string>('EMAIL_SMTP_USER'),
        pass: this.configService.get<string>('EMAIL_SMTP_PASSWORD'),
      },
    });
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<SentMessageInfo> {
    try {
      const fromEmail = this.configService.get<string>('EMAIL_FROM_ADDRESS');
      const fromName = this.configService.get<string>('EMAIL_FROM_NAME');
      
      // Prepare the email
      const mail = {
        from: `"${fromName}" <${fromEmail}>`,
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(',') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(',') : options.bcc) : undefined,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };
      
      // Send the email
      const info = await this.transporter.sendMail(mail);
      
      this.logger.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified');
      return true;
    } catch (error) {
      this.logger.error(`SMTP connection verification failed: ${error.message}`, error.stack);
      return false;
    }
  }
}
```

### 4. Scheduled Report Tasks

Create a task to run scheduled reports:

```typescript
// src/modules/analytics/tasks/report-scheduler.task.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportSchedulerService } from '../services/report-scheduler.service';

@Injectable()
export class ReportSchedulerTask {
  private readonly logger = new Logger(ReportSchedulerTask.name);

  constructor(
    private readonly reportSchedulerService: ReportSchedulerService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async runHourlyReports() {
    this.logger.log('Running hourly report scheduler...');
    try {
      await this.reportSchedulerService.runScheduledReports('daily');
      this.logger.log('Hourly report scheduler completed');
    } catch (error) {
      this.logger.error(`Error running hourly report scheduler: ${error.message}`, error.stack);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runDailyReports() {
    this.logger.log('Running daily report scheduler...');
    try {
      await this.reportSchedulerService.runScheduledReports('weekly');
      this.logger.log('Daily report scheduler completed');
    } catch (error) {
      this.logger.error(`Error running daily report scheduler: ${error.message}`, error.stack);
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async runMonthlyReports() {
    this.logger.log('Running monthly report scheduler...');
    try {
      await this.reportSchedulerService.runScheduledReports('monthly');
      this.logger.log('Monthly report scheduler completed');
    } catch (error) {
      this.logger.error(`Error running monthly report scheduler: ${error.message}`, error.stack);
    }
  }
}
```

### 5. Update Report Processor

Update the report processor to handle email delivery:

```typescript
// src/modules/analytics/processors/report.processor.ts

// Add this process method to the existing ReportProcessor class

@Process('send-report-email')
async processSendReportEmail(job: Job): Promise<void> {
  try {
    const { reportResultId, recipients, options } = job.data;
    
    this.logger.log(`Processing report email delivery for ${reportResultId}`);
    
    // Send the email
    await this.reportSchedulerService.sendReportEmail(
      reportResultId,
      recipients,
      options
    );
    
    this.logger.log(`Report email delivery for ${reportResultId} completed`);
  } catch (error) {
    this.logger.error(`Error processing report email delivery: ${error.message}`, error.stack);
    throw error;
  }
}
```

### 6. Schedule Controller

Create a controller for managing report schedules:

```typescript
// src/modules/analytics/controllers/schedule.controller.ts

import { Controller, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { ReportSchedulerService } from '../services/report-scheduler.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ScheduleConfig } from '../interfaces/report-scheduler-service.interface';

@Controller('reports/schedule')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(
    private readonly reportSchedulerService: ReportSchedulerService,
  ) {}

  @Post(':reportId')
  async scheduleReport(@Param('reportId') reportId: string, @Body() config: ScheduleConfig) {
    return this.reportSchedulerService.scheduleReport(reportId, config);
  }

  @Put(':reportId')
  async updateSchedule(@Param('reportId') reportId: string, @Body() config: Partial<ScheduleConfig>) {
    return this.reportSchedulerService.updateSchedule(reportId, config);
  }

  @Delete(':reportId')
  async unscheduleReport(@Param('reportId') reportId: string) {
    return this.reportSchedulerService.unscheduleReport(reportId);
  }

  @Post(':reportId/send')
  async sendReportEmail(
    @Param('reportId') reportId: string, 
    @Body() data: { reportResultId: string; recipients: string[]; options?: any }
  ) {
    return this.reportSchedulerService.sendReportEmail(
      data.reportResultId,
      data.recipients,
      data.options
    );
  }
}
```

### 7. Update Analytics Module

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
import { ReportSchedulerService } from './services/report-scheduler.service';
import { EmailService } from '../common/services/email.service';
import { ReportProcessor } from './processors/report.processor';
import { ReportsController } from './controllers/reports.controller';
import { ScheduleController } from './controllers/schedule.controller';
import { AggregationTask } from './tasks/aggregation.task';
import { ReportSchedulerTask } from './tasks/report-scheduler.task';

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
    ScheduleController,
  ],
  providers: [
    AnalyticsService,
    AnalyticsProcessor,
    AnalyticsAggregationService,
    MetricsRegistryService,
    MetricsQueryService,
    ReportGenerationService,
    ReportTemplatesService,
    ReportSchedulerService,
    EmailService,
    ReportProcessor,
    AggregationTask,
    ReportSchedulerTask,
  ],
  exports: [
    AnalyticsService,
    AnalyticsAggregationService,
    MetricsRegistryService,
    MetricsQueryService,
    ReportGenerationService,
    ReportTemplatesService,
    ReportSchedulerService,
  ],
})
export class AnalyticsModule {}
```

### 8. Environment Variables

Add the required environment variables for email configuration:

```bash
# src/config/env/.env

# SMTP Email Configuration
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_SECURE=false
EMAIL_SMTP_USER=reports@example.com
EMAIL_SMTP_PASSWORD=your-smtp-password
EMAIL_FROM_ADDRESS=reports@example.com
EMAIL_FROM_NAME=Avnu Reports
```

## Dependencies & Prerequisites

- Completed Phase 5B-1 (Report Generation)
- Nodemailer for email sending
- Cron scheduling support (NestJS Schedule module)
- SMTP service configuration

## Testing Guidelines

1. **Schedule Management:**
   - Test creating, updating, and deleting report schedules
   - Verify schedule configuration validation
   - Test frequency-specific schedule parameters

2. **Email Delivery:**
   - Test email generation with different report formats
   - Verify attachments are correctly included
   - Test email sending to multiple recipients

3. **Scheduled Execution:**
   - Test scheduled report triggering at the correct times
   - Verify background processing of email delivery
   - Test error handling and retry mechanisms

## Next Phase

Continue to [Phase 5C-1: Dashboard Components](./shopify-app-phase5c1-dashboard-components.md) to implement the user interface components for analytics visualization.
