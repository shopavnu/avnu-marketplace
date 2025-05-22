# Phase 5E-3.1: Analytics & Reporting - Integration Framework

## Objectives

- Create a modular system for third-party integrations
- Implement secure credential storage
- Develop a flexible configuration management system

## Timeline: Week 27

## Tasks & Implementation Details

### 1. Integration Provider Interface

Define a base interface for all integration providers:

```typescript
// src/modules/integrations/interfaces/integration-provider.interface.ts

export interface IntegrationConfig {
  id: string;
  merchantId: string;
  providerType: string;
  credentials: Record<string, any>;
  settings: Record<string, any>;
  isEnabled: boolean;
}

export interface IntegrationEvent {
  eventType: string;
  timestamp: Date;
  merchantId: string;
  userId?: string;
  sessionId?: string;
  data: Record<string, any>;
}

export interface IIntegrationProvider {
  readonly type: string;
  readonly name: string;
  readonly description: string;
  readonly requiredCredentials: string[];
  
  initialize(config: IntegrationConfig): Promise<void>;
  validateCredentials(credentials: Record<string, any>): Promise<boolean>;
  trackEvent(event: IntegrationEvent): Promise<boolean>;
  isConfigured(config: IntegrationConfig): boolean;
  getDefaultSettings(): Record<string, any>;
}
```

### 2. Integration Configuration Entity

Create an entity for storing integration configurations:

```typescript
// src/modules/entities/integration-config.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('integration_configs')
export class IntegrationConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ name: 'provider_type' })
  providerType: string;

  @Column({ name: 'provider_name' })
  providerName: string;

  @Column({ type: 'json', nullable: true })
  credentials: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;

  @Column({ name: 'last_synced_at', nullable: true, type: 'timestamp' })
  lastSyncedAt: Date | null;

  @Column({ nullable: true })
  error: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 3. Integration Management Service

Implement a service for managing integration configurations:

```typescript
// src/modules/integrations/services/integration-management.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationConfig as IntegrationConfigEntity } from '../../entities/integration-config.entity';
import { IntegrationProviderRegistry } from './integration-provider-registry.service';
import { IntegrationConfig } from '../interfaces/integration-provider.interface';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class IntegrationManagementService {
  private readonly logger = new Logger(IntegrationManagementService.name);
  private readonly encryptionKey: Buffer;
  private readonly encryptionIV: Buffer;

  constructor(
    @InjectRepository(IntegrationConfigEntity)
    private readonly integrationConfigRepository: Repository<IntegrationConfigEntity>,
    private readonly providerRegistry: IntegrationProviderRegistry,
    private readonly configService: ConfigService,
  ) {
    // Initialize encryption keys
    const secretKey = this.configService.get<string>('INTEGRATION_ENCRYPTION_KEY');
    this.encryptionKey = Buffer.from(secretKey, 'hex');
    this.encryptionIV = randomBytes(16);
  }

  /**
   * Get all integration configurations for a merchant
   */
  async getIntegrations(merchantId: string): Promise<IntegrationConfigEntity[]> {
    return this.integrationConfigRepository.find({
      where: { merchantId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a specific integration configuration
   */
  async getIntegration(id: string): Promise<IntegrationConfigEntity> {
    const config = await this.integrationConfigRepository.findOne({
      where: { id },
    });
    
    if (!config) {
      throw new NotFoundException(`Integration configuration with ID ${id} not found`);
    }
    
    return config;
  }

  /**
   * Create a new integration configuration
   */
  async createIntegration(
    merchantId: string,
    providerType: string,
    credentials: Record<string, any>,
    settings?: Record<string, any>,
  ): Promise<IntegrationConfigEntity> {
    try {
      // Get the provider
      const provider = this.providerRegistry.getProvider(providerType);
      
      if (!provider) {
        throw new Error(`Integration provider ${providerType} not found`);
      }
      
      // Validate credentials
      const isValid = await provider.validateCredentials(credentials);
      
      if (!isValid) {
        throw new Error('Invalid credentials for integration provider');
      }
      
      // Encrypt sensitive credentials
      const encryptedCredentials = this.encryptCredentials(credentials);
      
      // Create the configuration
      const config = this.integrationConfigRepository.create({
        merchantId,
        providerType,
        providerName: provider.name,
        credentials: encryptedCredentials,
        settings: settings || provider.getDefaultSettings(),
        isEnabled: true,
      });
      
      // Save the configuration
      const savedConfig = await this.integrationConfigRepository.save(config);
      
      // Initialize the provider
      await provider.initialize({
        id: savedConfig.id,
        merchantId,
        providerType,
        credentials: this.decryptCredentials(savedConfig.credentials),
        settings: savedConfig.settings,
        isEnabled: savedConfig.isEnabled,
      });
      
      return savedConfig;
    } catch (error) {
      this.logger.error(`Error creating integration: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update an integration configuration
   */
  async updateIntegration(
    id: string,
    updates: {
      credentials?: Record<string, any>;
      settings?: Record<string, any>;
      isEnabled?: boolean;
    },
  ): Promise<IntegrationConfigEntity> {
    try {
      // Get the existing configuration
      const config = await this.getIntegration(id);
      
      // Update fields
      if (updates.credentials) {
        // Get the provider
        const provider = this.providerRegistry.getProvider(config.providerType);
        
        if (!provider) {
          throw new Error(`Integration provider ${config.providerType} not found`);
        }
        
        // Validate credentials
        const isValid = await provider.validateCredentials(updates.credentials);
        
        if (!isValid) {
          throw new Error('Invalid credentials for integration provider');
        }
        
        // Encrypt sensitive credentials
        config.credentials = this.encryptCredentials(updates.credentials);
      }
      
      if (updates.settings) {
        config.settings = updates.settings;
      }
      
      if (updates.isEnabled !== undefined) {
        config.isEnabled = updates.isEnabled;
      }
      
      // Save the updated configuration
      const updatedConfig = await this.integrationConfigRepository.save(config);
      
      // Reinitialize the provider if needed
      if (updates.credentials || updates.settings) {
        const provider = this.providerRegistry.getProvider(config.providerType);
        
        if (provider) {
          await provider.initialize({
            id: updatedConfig.id,
            merchantId: updatedConfig.merchantId,
            providerType: updatedConfig.providerType,
            credentials: this.decryptCredentials(updatedConfig.credentials),
            settings: updatedConfig.settings,
            isEnabled: updatedConfig.isEnabled,
          });
        }
      }
      
      return updatedConfig;
    } catch (error) {
      this.logger.error(`Error updating integration: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete an integration configuration
   */
  async deleteIntegration(id: string): Promise<void> {
    await this.integrationConfigRepository.delete(id);
  }

  /**
   * Update the last synced timestamp
   */
  async updateLastSyncedAt(id: string, error?: string): Promise<void> {
    await this.integrationConfigRepository.update(id, {
      lastSyncedAt: new Date(),
      error: error || null,
    });
  }

  /**
   * Encrypt sensitive credentials
   */
  private encryptCredentials(credentials: Record<string, any>): Record<string, any> {
    const encrypted: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(credentials)) {
      if (typeof value === 'string') {
        const cipher = createCipheriv('aes-256-cbc', this.encryptionKey, this.encryptionIV);
        let encryptedValue = cipher.update(value, 'utf8', 'hex');
        encryptedValue += cipher.final('hex');
        
        encrypted[key] = {
          value: encryptedValue,
          iv: this.encryptionIV.toString('hex'),
          encrypted: true,
        };
      } else {
        encrypted[key] = value;
      }
    }
    
    return encrypted;
  }

  /**
   * Decrypt sensitive credentials
   */
  private decryptCredentials(credentials: Record<string, any>): Record<string, any> {
    const decrypted: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(credentials)) {
      if (value && typeof value === 'object' && value.encrypted) {
        const iv = Buffer.from(value.iv, 'hex');
        const decipher = createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
        let decryptedValue = decipher.update(value.value, 'hex', 'utf8');
        decryptedValue += decipher.final('utf8');
        
        decrypted[key] = decryptedValue;
      } else {
        decrypted[key] = value;
      }
    }
    
    return decrypted;
  }
}
```

### 4. Integration Provider Registry

Create a registry for available integration providers:

```typescript
// src/modules/integrations/services/integration-provider-registry.service.ts

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IIntegrationProvider } from '../interfaces/integration-provider.interface';

@Injectable()
export class IntegrationProviderRegistry implements OnModuleInit {
  private readonly logger = new Logger(IntegrationProviderRegistry.name);
  private readonly providers = new Map<string, IIntegrationProvider>();

  constructor(private readonly moduleRef: ModuleRef) {}

  /**
   * Register available providers on module initialization
   */
  async onModuleInit() {
    // This method will be called by NestJS when the module is initialized
    this.logger.log('Initializing integration provider registry');
    
    // Find and register all available providers
    // In a real implementation, this might discover providers dynamically
    try {
      // Example of manually registering providers
      // In a real app, this could be done with a more dynamic approach
      
      // Google Analytics provider
      try {
        const gaProvider = this.moduleRef.get('GoogleAnalyticsProvider', { strict: false });
        if (gaProvider) {
          this.registerProvider(gaProvider);
        }
      } catch (error) {
        this.logger.warn('Google Analytics provider not available');
      }
      
      // Facebook Pixel provider
      try {
        const fbProvider = this.moduleRef.get('FacebookPixelProvider', { strict: false });
        if (fbProvider) {
          this.registerProvider(fbProvider);
        }
      } catch (error) {
        this.logger.warn('Facebook Pixel provider not available');
      }
      
      // Snowflake provider
      try {
        const snowflakeProvider = this.moduleRef.get('SnowflakeProvider', { strict: false });
        if (snowflakeProvider) {
          this.registerProvider(snowflakeProvider);
        }
      } catch (error) {
        this.logger.warn('Snowflake provider not available');
      }
      
      // BigQuery provider
      try {
        const bigQueryProvider = this.moduleRef.get('BigQueryProvider', { strict: false });
        if (bigQueryProvider) {
          this.registerProvider(bigQueryProvider);
        }
      } catch (error) {
        this.logger.warn('BigQuery provider not available');
      }
      
      this.logger.log(`Registered ${this.providers.size} integration providers`);
    } catch (error) {
      this.logger.error(`Error initializing integration providers: ${error.message}`, error.stack);
    }
  }

  /**
   * Register a provider
   */
  registerProvider(provider: IIntegrationProvider): void {
    this.providers.set(provider.type, provider);
    this.logger.log(`Registered integration provider: ${provider.name} (${provider.type})`);
  }

  /**
   * Get a provider by type
   */
  getProvider(type: string): IIntegrationProvider | undefined {
    return this.providers.get(type);
  }

  /**
   * Get all available providers
   */
  getAllProviders(): IIntegrationProvider[] {
    return Array.from(this.providers.values());
  }
}
```

### 5. Integration Event Service

Create a service for forwarding events to integrated systems:

```typescript
// src/modules/integrations/services/integration-event.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationConfig } from '../../entities/integration-config.entity';
import { IntegrationProviderRegistry } from './integration-provider-registry.service';
import { IntegrationManagementService } from './integration-management.service';
import { IntegrationEvent } from '../interfaces/integration-provider.interface';

@Injectable()
export class IntegrationEventService {
  private readonly logger = new Logger(IntegrationEventService.name);

  constructor(
    @InjectRepository(IntegrationConfig)
    private readonly integrationConfigRepository: Repository<IntegrationConfig>,
    private readonly providerRegistry: IntegrationProviderRegistry,
    private readonly integrationManagementService: IntegrationManagementService,
  ) {}

  /**
   * Forward an event to all enabled integrations for a merchant
   */
  async forwardEvent(event: IntegrationEvent): Promise<void> {
    try {
      // Find all enabled integrations for the merchant
      const integrations = await this.integrationConfigRepository.find({
        where: {
          merchantId: event.merchantId,
          isEnabled: true,
        },
      });
      
      if (integrations.length === 0) {
        return;
      }
      
      this.logger.debug(`Forwarding event ${event.eventType} to ${integrations.length} integrations`);
      
      // Forward the event to each integration in parallel
      const forwardPromises = integrations.map(integration => {
        return this.forwardEventToIntegration(integration, event);
      });
      
      // Wait for all forwarding attempts to complete
      await Promise.all(forwardPromises);
    } catch (error) {
      this.logger.error(`Error forwarding event: ${error.message}`, error.stack);
    }
  }

  /**
   * Forward an event to a specific integration
   */
  private async forwardEventToIntegration(
    integration: IntegrationConfig,
    event: IntegrationEvent,
  ): Promise<void> {
    try {
      const provider = this.providerRegistry.getProvider(integration.providerType);
      
      if (!provider) {
        throw new Error(`Provider ${integration.providerType} not found`);
      }
      
      // Track the event
      const result = await provider.trackEvent(event);
      
      // Update the last synced timestamp
      await this.integrationManagementService.updateLastSyncedAt(integration.id);
      
      this.logger.debug(`Event ${event.eventType} forwarded to ${integration.providerName} (${result ? 'success' : 'failed'})`);
    } catch (error) {
      this.logger.error(`Error forwarding event to ${integration.providerName}: ${error.message}`, error.stack);
      
      // Update with error
      await this.integrationManagementService.updateLastSyncedAt(integration.id, error.message);
    }
  }
}
```

### 6. Integration Controller

Create a controller for managing integrations:

```typescript
// src/modules/integrations/controllers/integration.controller.ts

import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IntegrationManagementService } from '../services/integration-management.service';
import { IntegrationProviderRegistry } from '../services/integration-provider-registry.service';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationController {
  constructor(
    private readonly integrationManagementService: IntegrationManagementService,
    private readonly providerRegistry: IntegrationProviderRegistry,
  ) {}

  @Get()
  async getIntegrations(@Request() req) {
    const merchantId = req.user.merchantId;
    return this.integrationManagementService.getIntegrations(merchantId);
  }

  @Get('providers')
  async getAvailableProviders() {
    const providers = this.providerRegistry.getAllProviders();
    
    // Return provider metadata without implementation details
    return providers.map(provider => ({
      type: provider.type,
      name: provider.name,
      description: provider.description,
      requiredCredentials: provider.requiredCredentials,
    }));
  }

  @Get(':id')
  async getIntegration(@Param('id') id: string) {
    return this.integrationManagementService.getIntegration(id);
  }

  @Post()
  async createIntegration(
    @Request() req,
    @Body() data: {
      providerType: string;
      credentials: Record<string, any>;
      settings?: Record<string, any>;
    },
  ) {
    const merchantId = req.user.merchantId;
    
    return this.integrationManagementService.createIntegration(
      merchantId,
      data.providerType,
      data.credentials,
      data.settings,
    );
  }

  @Put(':id')
  async updateIntegration(
    @Param('id') id: string,
    @Body() updates: {
      credentials?: Record<string, any>;
      settings?: Record<string, any>;
      isEnabled?: boolean;
    },
  ) {
    return this.integrationManagementService.updateIntegration(id, updates);
  }

  @Delete(':id')
  async deleteIntegration(@Param('id') id: string) {
    await this.integrationManagementService.deleteIntegration(id);
    return { success: true };
  }
}
```

## Dependencies & Prerequisites

- Completed Phase 5A-5E-2 sections
- Encryption library for secure credential storage
- TypeORM for database operations

## Testing Guidelines

1. **Provider Registry:**
   - Test dynamic provider registration
   - Verify provider discovery and initialization

2. **Credential Management:**
   - Test encryption and decryption of sensitive credentials
   - Verify secure storage in the database

3. **Event Forwarding:**
   - Test event forwarding to multiple providers
   - Verify error handling for failed forwarding

## Next Phase

Continue to [Phase 5E-3.2: Google Analytics and Facebook Integrations](./shopify-app-phase5e3-ga-fb-integrations.md) to implement specific integration providers.
