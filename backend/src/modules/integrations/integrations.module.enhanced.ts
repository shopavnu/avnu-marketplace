import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Enhanced modules
import { ProductsModule } from '../products/products.module.enhanced';
import { OrdersModule } from '../orders/orders.module';
import { MerchantsModule } from '../merchants/merchants.module';

// Enhanced controllers
import { IntegrationsController } from './controllers/integrations.controller.enhanced';
import { MerchantAuthController } from './controllers/merchant-auth.controller.enhanced';
import { SyncController } from './controllers/sync.controller.enhanced';

// Enhanced services
import { ShopifyService } from './services/shopify.service.enhanced';
import { WooCommerceService } from './services/woocommerce.service.enhanced';
import { BaseIntegrationService } from './services/base-integration.service.enhanced';
import { MerchantAuthService } from './services/merchant-auth.service.enhanced';
import { IntegrationsService } from './integrations.service.enhanced';
import { SyncService } from './services/sync.service.enhanced';
import { OrderSyncService } from './services/order-sync.service.enhanced';

// Entities
import { MerchantPlatformConnection } from './entities/merchant-platform-connection.entity';

/**
 * Enhanced Integrations Module
 *
 * Manages all integration-related functionality with external platforms
 * including authentication, synchronization, and webhook handling.
 *
 * Features:
 * - Robust DTO validation with class-validator
 * - Comprehensive error handling
 * - Detailed Swagger/OpenAPI documentation
 * - Strong TypeScript typing with enums
 * - Consistent response formats
 */
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([MerchantPlatformConnection]),
    // Import modules to have access to their entities
    ProductsModule,
    OrdersModule,
    MerchantsModule,
  ],
  controllers: [IntegrationsController, MerchantAuthController, SyncController],
  providers: [
    IntegrationsService,
    BaseIntegrationService,
    ShopifyService,
    WooCommerceService,
    MerchantAuthService,
    SyncService,
    OrderSyncService,
  ],
  exports: [
    IntegrationsService,
    BaseIntegrationService,
    ShopifyService,
    WooCommerceService,
    MerchantAuthService,
    SyncService,
    OrderSyncService,
  ],
})
export class IntegrationsModule {}
