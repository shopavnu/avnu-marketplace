import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../../common/common.module';

// Existing services
import { ShopifyAppService } from './services/shopify-app.service';
import { ShopifyAuthService } from './services/shopify-auth.service';
import { ShopifyWebhookService } from './services/shopify-webhook.service';
import { ShopifyWebhookValidator } from './utils/webhook-validator';

// Enhanced services that implement our interfaces
import { ShopifyClientService } from './services/shopify-client.service';
import { ShopifyAuthEnhancedService } from './services/shopify-auth-enhanced.service';
import { ShopifyWebhookEnhancedService } from './services/shopify-webhook-enhanced.service';
import { ShopifyProductService } from './services/shopify-product.service';
import { ShopifyBulkOperationService } from './services/shopify-bulk-operation.service';
import { ShopifyFulfillmentService } from './services/shopify-fulfillment.service';

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
    CommonModule,
  ],
  controllers: [],
  providers: [
    // Original services (for backward compatibility)
    ShopifyAppService,
    ShopifyAuthService,
    ShopifyWebhookService,
    ShopifyWebhookValidator,

    // Enhanced services implementing our interfaces
    ShopifyClientService,
    ShopifyAuthEnhancedService,
    ShopifyWebhookEnhancedService,
    ShopifyProductService,
    ShopifyBulkOperationService,
    ShopifyFulfillmentService,

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
      useExisting: ShopifyWebhookEnhancedService,
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
    ShopifyWebhookValidator,

    // Enhanced services
    ShopifyClientService,
    ShopifyAuthEnhancedService,
    ShopifyWebhookEnhancedService,
    ShopifyProductService,
    ShopifyBulkOperationService,
    ShopifyFulfillmentService,

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
