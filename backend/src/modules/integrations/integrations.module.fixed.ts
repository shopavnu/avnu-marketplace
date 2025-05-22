// @ts-strict-mode: enabled
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { MerchantsModule } from '../merchants/merchants.module';
import { ShopifyService } from './services/shopify.service';
import { WooCommerceService } from './services/woocommerce.service';
import { WooCommerceAdapter } from './services/woocommerce-adapter';
import { BaseIntegrationService } from './services/base-integration.service';
import { MerchantAuthService } from './services/merchant-auth.service';
import { IntegrationsController } from './integrations.controller';
import { MerchantAuthController } from './controllers/merchant-auth.controller';
import { IntegrationsService } from './integrations.service';
import { OrderSyncService } from './services/order-sync.service';
import { SyncController } from './controllers/sync.controller';
import { MerchantPlatformConnection } from './entities/merchant-platform-connection.entity';
import { ShopifyAppModule } from './shopify-app/shopify-app.module';
import { WooCommerceModule } from './woocommerce/woocommerce.module';
import { PlatformIntegrationService } from './services/platform-integration.service';
import { SharedModule } from '../shared/shared.module';
import { SyncService } from './services/sync.service.fixed';
import { ShopifySyncService } from './services/shopify-sync.service';
import { WooCommerceSyncService } from './services/woocommerce-sync.service';

/**
 * IntegrationsModule - Enhanced version with platform-specific sync services
 *
 * This module provides integration with external e-commerce platforms
 * such as Shopify and WooCommerce, with improved separation of concerns.
 */
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([MerchantPlatformConnection]),
    SharedModule,
    ProductsModule,
    OrdersModule,
    MerchantsModule,
    ShopifyAppModule,
    WooCommerceModule,
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
    WooCommerceService,
    WooCommerceAdapter,
    MerchantAuthService,
    OrderSyncService,
    // Add our new platform-specific sync services
    ShopifySyncService,
    WooCommerceSyncService,
    // Register the new SyncService
    SyncService,
  ],
  exports: [
    IntegrationsService,
    // Export the interface token for dependency injection
    'PlatformIntegrationService',
    BaseIntegrationService,
    ShopifyService,
    WooCommerceService,
    WooCommerceAdapter,
    MerchantAuthService,
    OrderSyncService,
    // Export our new platform-specific sync services
    ShopifySyncService,
    WooCommerceSyncService,
    // Export the new SyncService
    SyncService,
  ],
})
export class IntegrationsModule {}
