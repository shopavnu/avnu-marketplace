"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyAppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const common_module_1 = require("../../common/common.module");
const shopify_app_service_1 = require("./services/shopify-app.service");
const shopify_auth_service_1 = require("./services/shopify-auth.service");
const shopify_webhook_service_1 = require("./services/shopify-webhook.service");
const webhook_validator_1 = require("./utils/webhook-validator");
const shopify_client_service_1 = require("./services/shopify-client.service");
const shopify_auth_enhanced_service_1 = require("./services/shopify-auth-enhanced.service");
const shopify_webhook_enhanced_service_1 = require("./services/shopify-webhook-enhanced.service");
const shopify_product_service_1 = require("./services/shopify-product.service");
const shopify_bulk_operation_service_1 = require("./services/shopify-bulk-operation.service");
const shopify_fulfillment_service_1 = require("./services/shopify-fulfillment.service");
const merchant_platform_connection_entity_1 = require("../entities/merchant-platform-connection.entity");
const shopify_config_1 = require("../../common/config/shopify-config");
const shopify_config_2 = require("../../common/config/shopify-config");
let ShopifyAppModule = class ShopifyAppModule {
};
exports.ShopifyAppModule = ShopifyAppModule;
exports.ShopifyAppModule = ShopifyAppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([merchant_platform_connection_entity_1.MerchantPlatformConnection]),
            config_1.ConfigModule.forFeature(shopify_config_1.shopifyConfig),
            common_module_1.CommonModule,
        ],
        controllers: [],
        providers: [
            shopify_app_service_1.ShopifyAppService,
            shopify_auth_service_1.ShopifyAuthService,
            shopify_webhook_service_1.ShopifyWebhookService,
            webhook_validator_1.ShopifyWebhookValidator,
            shopify_client_service_1.ShopifyClientService,
            shopify_auth_enhanced_service_1.ShopifyAuthEnhancedService,
            shopify_webhook_enhanced_service_1.ShopifyWebhookEnhancedService,
            shopify_product_service_1.ShopifyProductService,
            shopify_bulk_operation_service_1.ShopifyBulkOperationService,
            shopify_fulfillment_service_1.ShopifyFulfillmentService,
            {
                provide: shopify_config_2.SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_CLIENT_SERVICE,
                useExisting: shopify_client_service_1.ShopifyClientService,
            },
            {
                provide: shopify_config_2.SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_AUTH_SERVICE,
                useExisting: shopify_auth_enhanced_service_1.ShopifyAuthEnhancedService,
            },
            {
                provide: shopify_config_2.SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_WEBHOOK_SERVICE,
                useExisting: shopify_webhook_enhanced_service_1.ShopifyWebhookEnhancedService,
            },
            {
                provide: shopify_config_2.SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_PRODUCT_SERVICE,
                useExisting: shopify_product_service_1.ShopifyProductService,
            },
            {
                provide: shopify_config_2.SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_BULK_OPERATION_SERVICE,
                useExisting: shopify_bulk_operation_service_1.ShopifyBulkOperationService,
            },
            {
                provide: shopify_config_2.SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_FULFILLMENT_SERVICE,
                useExisting: shopify_fulfillment_service_1.ShopifyFulfillmentService,
            },
        ],
        exports: [
            shopify_app_service_1.ShopifyAppService,
            shopify_auth_service_1.ShopifyAuthService,
            shopify_webhook_service_1.ShopifyWebhookService,
            webhook_validator_1.ShopifyWebhookValidator,
            shopify_client_service_1.ShopifyClientService,
            shopify_auth_enhanced_service_1.ShopifyAuthEnhancedService,
            shopify_webhook_enhanced_service_1.ShopifyWebhookEnhancedService,
            shopify_product_service_1.ShopifyProductService,
            shopify_bulk_operation_service_1.ShopifyBulkOperationService,
            shopify_fulfillment_service_1.ShopifyFulfillmentService,
            shopify_config_2.SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_CLIENT_SERVICE,
            shopify_config_2.SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_AUTH_SERVICE,
            shopify_config_2.SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_WEBHOOK_SERVICE,
            shopify_config_2.SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_PRODUCT_SERVICE,
            shopify_config_2.SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_BULK_OPERATION_SERVICE,
            shopify_config_2.SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_FULFILLMENT_SERVICE,
        ],
    })
], ShopifyAppModule);
//# sourceMappingURL=shopify-app.module.js.map