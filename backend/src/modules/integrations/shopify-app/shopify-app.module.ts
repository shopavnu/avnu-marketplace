import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

// Existing services
import { ShopifyAppService } from './services/shopify-app.service';
import { ShopifyAuthService } from './services/shopify-auth.service';
import { ShopifyWebhookService } from './services/shopify-webhook.service';

// New webhook registry system
import { ShopifyWebhooksModule } from './webhooks/webhooks.module';
import { ShopifyWebhookRegistryService } from './webhooks/shopify-webhook-registry.service';
import { WebhookRegistry } from './webhooks/webhook-registry';
import { WebhookValidator } from './webhooks/webhook-validator';

// Controllers
import { ShopifyControllersModule } from './controllers/controllers.module';

// Enhanced services that implement our interfaces
import { ShopifyClientService } from './services/shopify-client.service';
import { ShopifyAuthEnhancedService } from './services/shopify-auth-enhanced.service';
import { ShopifyWebhookEnhancedService } from './services/shopify-webhook-enhanced.service';
import { ShopifyProductService } from './services/shopify-product.service';
import { ShopifyBulkOperationService } from './services/shopify-bulk-operation.service';
import { ShopifyFulfillmentService } from './services/shopify-fulfillment.service';
import { ShopifyVersionManagerService } from './services/shopify-version-manager.service';
import { ShopifyClientExtensions } from './services/shopify-client-extensions';

// Entities
import { MerchantPlatformConnection } from '../entities/merchant-platform-connection.entity';

// Shopify config from common module
import { shopifyConfig } from '../../common/config/shopify-config';

// Interface tokens from common module
import { SHOPIFY_CONSTANTS } from '../../common/config/shopify-config';

/**
 * ShopifyAppModule - Enhanced for Shopify 2025-01 API
 *
 * This module provides integration with Shopify's Admin API and handles
 * authentication, webhooks, and data synchronization.
 *
 * The module now includes enhanced services that implement the interfaces
 * defined in the CommonModule for better maintainability and to prevent
 * circular dependencies.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([MerchantPlatformConnection]),
    ConfigModule.forFeature(shopifyConfig),
    HttpModule,
    ScheduleModule.forRoot(),
    ShopifyWebhooksModule,
    ShopifyControllersModule,
  ],
  providers: [
    // Original services (for backward compatibility)
    ShopifyAppService,
    ShopifyAuthService,
    ShopifyWebhookService,

    // Enhanced services implementing our interfaces
    ShopifyClientService,
    ShopifyAuthEnhancedService,
    ShopifyWebhookEnhancedService,
    ShopifyProductService,
    ShopifyBulkOperationService,
    ShopifyFulfillmentService,
    ShopifyVersionManagerService,
    ShopifyWebhookRegistryService,
    ShopifyClientExtensions,

    // Register services with interface tokens for dependency injection
    {
      provide: SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_CLIENT_SERVICE,
      useExisting: ShopifyClientService,
    },
    {
      provide: SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_AUTH_SERVICE,
      useExisting: ShopifyAuthEnhancedService,
    },
    {
      provide: SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_WEBHOOK_SERVICE,
      useExisting: ShopifyWebhookRegistryService,
    },
    {
      provide: SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_PRODUCT_SERVICE,
      useExisting: ShopifyProductService,
    },
    {
      provide: SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_BULK_OPERATION_SERVICE,
      useExisting: ShopifyBulkOperationService,
    },
    {
      provide: SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_FULFILLMENT_SERVICE,
      useExisting: ShopifyFulfillmentService,
    },
  ],
  exports: [
    // Export both original and enhanced services
    ShopifyAppService,
    ShopifyAuthService,
    ShopifyWebhookService,
    ShopifyWebhookRegistryService,

    // Enhanced services
    ShopifyClientService,
    ShopifyAuthEnhancedService,
    ShopifyWebhookEnhancedService,
    ShopifyProductService,
    ShopifyBulkOperationService,
    ShopifyFulfillmentService,
    ShopifyVersionManagerService,
    ShopifyClientExtensions,

    // Export services by their interface tokens
    SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_CLIENT_SERVICE,
    SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_AUTH_SERVICE,
    SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_WEBHOOK_SERVICE,
    SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_PRODUCT_SERVICE,
    SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_BULK_OPERATION_SERVICE,
    SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_FULFILLMENT_SERVICE,
  ],
})
export class ShopifyAppModule {}
