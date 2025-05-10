# Phase 5E-1: Analytics & Reporting - External API Endpoints

## Objectives

- Create secure REST API endpoints for accessing analytics data
- Implement API key authentication for external consumers
- Add rate limiting and throttling for API endpoints
- Create detailed API documentation

## Timeline: Week 25

## Tasks & Implementation Details

### 1. API Key Authentication Service

Implement API key management and authentication:

```typescript
// src/modules/auth/services/api-key.service.ts

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../../entities/api-key.entity';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  /**
   * Generate a new API key for a merchant
   */
  async generateApiKey(merchantId: string, name: string, scopes: string[]): Promise<{ apiKey: string; apiKeyId: string }> {
    // Generate a random API key
    const apiKey = `avnu_${uuidv4().replace(/-/g, '')}`;
    
    // Hash the API key for storage
    const apiKeyHash = this.hashApiKey(apiKey);
    
    // Create a new API key record
    const apiKeyEntity = this.apiKeyRepository.create({
      merchantId,
      name,
      keyHash: apiKeyHash,
      scopes,
      lastUsedAt: null,
      isActive: true,
    });
    
    // Save the API key
    const savedKey = await this.apiKeyRepository.save(apiKeyEntity);
    
    // Only return the raw API key once, after this it will be hashed in the database
    return {
      apiKey,
      apiKeyId: savedKey.id,
    };
  }

  /**
   * Validate an API key
   */
  async validateApiKey(apiKey: string, requiredScope?: string): Promise<ApiKey> {
    try {
      // Hash the API key
      const apiKeyHash = this.hashApiKey(apiKey);
      
      // Find the API key
      const apiKeyEntity = await this.apiKeyRepository.findOne({
        where: {
          keyHash: apiKeyHash,
          isActive: true,
        },
      });
      
      if (!apiKeyEntity) {
        throw new UnauthorizedException('Invalid API key');
      }
      
      // Check if the API key has the required scope
      if (requiredScope && !apiKeyEntity.scopes.includes(requiredScope) && !apiKeyEntity.scopes.includes('*')) {
        throw new UnauthorizedException(`API key does not have the required scope: ${requiredScope}`);
      }
      
      // Update last used timestamp
      apiKeyEntity.lastUsedAt = new Date();
      await this.apiKeyRepository.save(apiKeyEntity);
      
      return apiKeyEntity;
    } catch (error) {
      this.logger.error(`Error validating API key: ${error.message}`, error.stack);
      throw new UnauthorizedException('Invalid API key');
    }
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(apiKeyId: string, merchantId: string): Promise<void> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: {
        id: apiKeyId,
        merchantId,
      },
    });
    
    if (!apiKey) {
      throw new Error(`API key with ID ${apiKeyId} not found`);
    }
    
    // Mark the API key as inactive
    apiKey.isActive = false;
    await this.apiKeyRepository.save(apiKey);
  }

  /**
   * Get all API keys for a merchant
   */
  async getApiKeys(merchantId: string): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: {
        merchantId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Hash an API key
   */
  private hashApiKey(apiKey: string): string {
    return createHash('sha256').update(apiKey).digest('hex');
  }
}
```

### 2. API Key Entity

Define the API key entity:

```typescript
// src/modules/entities/api-key.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column()
  name: string;

  @Column({ name: 'key_hash', unique: true })
  keyHash: string;

  @Column('simple-array')
  scopes: string[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_used_at', nullable: true, type: 'timestamp' })
  lastUsedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 3. API Key Auth Guard

Create an authentication guard for API key protection:

```typescript
// src/modules/auth/guards/api-key-auth.guard.ts

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeyService } from '../services/api-key.service';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredScope = this.reflector.get<string>('scope', context.getHandler());
    const request = context.switchToHttp().getRequest();
    
    // Get the API key from the request header
    const apiKey = request.headers['x-api-key'];
    
    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }
    
    try {
      // Validate the API key
      const apiKeyEntity = await this.apiKeyService.validateApiKey(apiKey, requiredScope);
      
      // Attach the merchant ID to the request
      request.merchantId = apiKeyEntity.merchantId;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid API key');
    }
  }
}
```

### 4. API Scope Decorator

Create a decorator for specifying required API scopes:

```typescript
// src/modules/auth/decorators/api-scope.decorator.ts

import { SetMetadata } from '@nestjs/common';

export const ApiScope = (scope: string) => SetMetadata('scope', scope);
```

### 5. External Analytics API Controller

Implement an external API controller for analytics data:

```typescript
// src/modules/analytics/controllers/external-api.controller.ts

import { Controller, Get, Post, Body, Query, UseGuards, Req, UseInterceptors } from '@nestjs/common';
import { ApiKeyAuthGuard } from '../../auth/guards/api-key-auth.guard';
import { ApiScope } from '../../auth/decorators/api-scope.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AnalyticsAggregationService } from '../services/analytics-aggregation.service';
import { MetricsQueryService } from '../services/metrics-query.service';
import { ReportGenerationService } from '../services/report-generation.service';

@Controller('api/v1/analytics')
@UseGuards(ApiKeyAuthGuard, ThrottlerGuard)
export class ExternalApiController {
  constructor(
    private readonly analyticsAggregationService: AnalyticsAggregationService,
    private readonly metricsQueryService: MetricsQueryService,
    private readonly reportGenerationService: ReportGenerationService,
  ) {}

  @Get('metrics')
  @ApiScope('analytics:read')
  async getMetrics(
    @Req() req,
    @Query('metricKey') metricKey: string,
    @Query('dimensionKey') dimensionKey: string = 'date',
    @Query('period') period: string = 'day',
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit') limit: number = 100,
  ) {
    const merchantId = req.merchantId;
    
    return this.metricsQueryService.queryMetric({
      merchantId,
      metricKey,
      dimensionKey,
      period: period as any,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
    });
  }

  @Get('aggregates')
  @ApiScope('analytics:read')
  async getAggregates(
    @Req() req,
    @Query('eventType') eventType: string,
    @Query('period') period: string = 'daily',
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('dimension') dimension: string,
  ) {
    const merchantId = req.merchantId;
    
    return this.analyticsAggregationService.getAggregates({
      merchantId,
      eventType,
      period: period as any,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      dimension,
    });
  }

  @Post('track')
  @ApiScope('analytics:write')
  async trackEvent(
    @Req() req,
    @Body() eventData: {
      eventType: string;
      eventData: Record<string, any>;
      userId?: string;
      sessionId?: string;
      timestamp?: string;
    },
  ) {
    const merchantId = req.merchantId;
    
    // Forward to the analytics service tracking (implementation would be in a separate service)
    // This is a placeholder
    return {
      success: true,
      message: 'Event tracked successfully',
      eventId: 'mock-event-id',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('reports/generate')
  @ApiScope('reports:write')
  async generateReport(
    @Req() req,
    @Body() reportConfig: {
      reportType: string;
      config: any;
      parameters: any;
    },
  ) {
    const merchantId = req.merchantId;
    
    // Generate a custom report
    const result = await this.reportGenerationService.generateCustomReport(
      merchantId,
      {
        reportType: reportConfig.reportType,
        config: reportConfig.config,
      },
      reportConfig.parameters,
    );
    
    return {
      reportId: result.id,
      status: result.status,
      createdAt: result.createdAt,
    };
  }

  @Get('reports/:reportId')
  @ApiScope('reports:read')
  async getReport(
    @Req() req,
    @Query('reportId') reportId: string,
  ) {
    // Get a generated report result
    const report = await this.reportGenerationService.getReportById(reportId);
    
    // Verify the report belongs to the merchant
    if (report.merchantId !== req.merchantId) {
      throw new Error('Report not found');
    }
    
    return report;
  }
}
```

### 6. Rate Limiting Configuration

Set up rate limiting for API endpoints:

```typescript
// src/app.module.ts

import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // Other imports...
    
    // Rate limiting configuration
    ThrottlerModule.forRoot({
      ttl: 60, // Time window in seconds
      limit: 60, // Maximum number of requests within the time window
    }),
  ],
  providers: [
    // Register the ThrottlerGuard as a global guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

### 7. API Key Management Controller

Create a controller for managing API keys:

```typescript
// src/modules/auth/controllers/api-key.controller.ts

import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiKeyService } from '../services/api-key.service';

@Controller('api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeyController {
  constructor(
    private readonly apiKeyService: ApiKeyService,
  ) {}

  @Get()
  async getApiKeys(@Request() req) {
    const merchantId = req.user.merchantId;
    const apiKeys = await this.apiKeyService.getApiKeys(merchantId);
    
    // Remove sensitive data
    return apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      scopes: key.scopes,
      isActive: key.isActive,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
    }));
  }

  @Post()
  async generateApiKey(
    @Request() req,
    @Body() data: { name: string; scopes: string[] }
  ) {
    const merchantId = req.user.merchantId;
    return this.apiKeyService.generateApiKey(merchantId, data.name, data.scopes);
  }

  @Delete(':id')
  async revokeApiKey(@Request() req, @Param('id') id: string) {
    const merchantId = req.user.merchantId;
    await this.apiKeyService.revokeApiKey(id, merchantId);
    return { success: true };
  }
}
```

### 8. API Documentation with Swagger

Add Swagger documentation for the API:

```typescript
// src/main.ts

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Avnu Analytics API')
    .setDescription('API for accessing Avnu Marketplace analytics data')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'ApiKey')
    .addTag('analytics', 'Analytics data endpoints')
    .addTag('reports', 'Report generation endpoints')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  await app.listen(3000);
}
bootstrap();
```

## Dependencies & Prerequisites

- Completed Phase 5A-D sections
- NestJS Throttler module for rate limiting
- Swagger for API documentation
- TypeORM for database operations

## Testing Guidelines

1. **Authentication Testing:**
   - Test API key generation and validation
   - Verify that unauthorized access is properly rejected
   - Test scope-based access control

2. **Rate Limiting:**
   - Test throttling behavior by making rapid requests
   - Verify appropriate error responses when limits are exceeded

3. **API Endpoints:**
   - Test each endpoint with valid and invalid parameters
   - Verify data consistency between internal and external APIs
   - Test error handling and response formats

## Next Phase

Continue to [Phase 5E-2: Data Export Capabilities](./shopify-app-phase5e2-data-export.md) to implement comprehensive data export features.
