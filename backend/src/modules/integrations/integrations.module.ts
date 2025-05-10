// @ts-strict-mode: enabled
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from '../orders/orders.module';
import { MerchantsModule } from '../merchants/merchants.module';
import { CommonModule } from '../common/common.module';
import { ShopifyService } from './services/shopify.service';
// WooCommerce references removed as part of Shopify-first approach
import { BaseIntegrationService } from './services/base-integration.service';
import { MerchantAuthService } from './services/merchant-auth.service';
import { IntegrationsController } from './integrations.controller';
import { MerchantAuthController } from './controllers/merchant-auth.controller';
import { IntegrationsService } from './integrations.service';
import { OrderSyncService } from './services/order-sync.service';
import { SyncController } from './controllers/sync.controller';
import { MerchantPlatformConnection } from './entities/merchant-platform-connection.entity';
import { ShopifyAppModule } from './shopify-app/shopify-app.module';
// WooCommerceModule removed as part of Shopify-first approach
import { PlatformIntegrationService } from './services/platform-integration.service';
import { SharedModule } from '../shared/shared.module';
import { SyncService } from './services/sync.service.fixed';
import { ShopifySyncService } from './services/shopify-sync.service';

/**
 * IntegrationsModule - Shopify-first Implementation
 *
 * This module provides integration with Shopify as our primary e-commerce platform,
 * with improved separation of concerns and simplified architecture.
 * Updated as part of May 2025 platform integration refactoring.
 */
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([MerchantPlatformConnection]),
    SharedModule,
    CommonModule,
    OrdersModule,
    MerchantsModule,
    ShopifyAppModule,
    // WooCommerceModule removed as part of Shopify-first approach
  ],
  controllers: [IntegrationsController, MerchantAuthController, SyncController],
  providers: [
    IntegrationsService,
    // Register PlatformIntegrationService with token for dependency injection
    {
      provide: 'PlatformIntegrationService',
      useClass: PlatformIntegrationService,
    },
    BaseIntegrationService,
    ShopifyService,
    // WooCommerce services removed as part of Shopify-first approach
    MerchantAuthService,
    OrderSyncService,
    // Platform-specific sync service for Shopify
    ShopifySyncService,
    // Register the SyncService
    SyncService,
  ],
  exports: [
    IntegrationsService,
    // Export the interface token for dependency injection
    'PlatformIntegrationService',
    BaseIntegrationService,
    ShopifyService,
    // WooCommerce services removed as part of Shopify-first approach
    MerchantAuthService,
    OrderSyncService,
    // Export Shopify-specific sync service
    ShopifySyncService,
    // Export the SyncService
    SyncService,
  ],
})
export class IntegrationsModule {}
