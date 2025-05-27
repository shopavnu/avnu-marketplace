// @ts-strict-mode: enabled
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from '../orders/orders.module';
import { MerchantsModule } from '../merchants/merchants.module';
import { ShopifyService } from './services/shopify.service';
// WooCommerce references removed as part of Shopify-first approach
import { BaseIntegrationService as _BaseIntegrationService } from './services/base-integration.service';
import { IntegrationsController } from './integrations.controller';
import { MerchantAuthController } from './controllers/merchant-auth.controller';
import { IntegrationsService } from './integrations.service';
import { OrderSyncService } from './services/order-sync.service';
import { SyncController } from './controllers/sync.controller';
import { MerchantPlatformConnection } from './entities/merchant-platform-connection.entity';
import { ShopifyAppModule } from './shopify-app/shopify-app.module';
// WooCommerceModule removed as part of Shopify-first approach
import { SharedModule } from '../shared/shared.module';
import { ShopifySyncService } from './services/shopify-sync.service';
import { ProductsModule } from '../products/products.module';

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
    OrdersModule,
    MerchantsModule,
    ShopifyAppModule,
    ProductsModule,
    // WooCommerceModule removed as part of Shopify-first approach
  ],
  controllers: [IntegrationsController, MerchantAuthController, SyncController],
  providers: [
    IntegrationsService,
    ShopifyService,
    // WooCommerce services removed as part of Shopify-first approach
    OrderSyncService,
    // Platform-specific sync service for Shopify
    ShopifySyncService,
  ],
  exports: [
    IntegrationsService,
    ShopifyService,
    // WooCommerce services removed as part of Shopify-first approach
    OrderSyncService,
    // Export Shopify-specific sync service
    ShopifySyncService,
  ],
})
export class IntegrationsModule {}
