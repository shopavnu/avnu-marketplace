"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const products_module_1 = require("../products/products.module");
const orders_module_1 = require("../orders/orders.module");
const merchants_module_1 = require("../merchants/merchants.module");
const shopify_service_1 = require("./services/shopify.service");
const woocommerce_service_1 = require("./services/woocommerce.service");
const woocommerce_adapter_1 = require("./services/woocommerce-adapter");
const base_integration_service_1 = require("./services/base-integration.service");
const merchant_auth_service_1 = require("./services/merchant-auth.service");
const integrations_controller_1 = require("./integrations.controller");
const merchant_auth_controller_1 = require("./controllers/merchant-auth.controller");
const integrations_service_1 = require("./integrations.service");
const order_sync_service_1 = require("./services/order-sync.service");
const sync_controller_1 = require("./controllers/sync.controller");
const merchant_platform_connection_entity_1 = require("./entities/merchant-platform-connection.entity");
const shopify_app_module_1 = require("./shopify-app/shopify-app.module");
const woocommerce_module_1 = require("./woocommerce/woocommerce.module");
const platform_integration_service_1 = require("./services/platform-integration.service");
const shared_module_1 = require("../shared/shared.module");
const sync_service_fixed_1 = require("./services/sync.service.fixed");
const shopify_sync_service_1 = require("./services/shopify-sync.service");
const woocommerce_sync_service_1 = require("./services/woocommerce-sync.service");
let IntegrationsModule = class IntegrationsModule {
};
exports.IntegrationsModule = IntegrationsModule;
exports.IntegrationsModule = IntegrationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([merchant_platform_connection_entity_1.MerchantPlatformConnection]),
            shared_module_1.SharedModule,
            products_module_1.ProductsModule,
            orders_module_1.OrdersModule,
            merchants_module_1.MerchantsModule,
            shopify_app_module_1.ShopifyAppModule,
            woocommerce_module_1.WooCommerceModule,
        ],
        controllers: [integrations_controller_1.IntegrationsController, merchant_auth_controller_1.MerchantAuthController, sync_controller_1.SyncController],
        providers: [
            integrations_service_1.IntegrationsService,
            {
                provide: 'PlatformIntegrationService',
                useClass: platform_integration_service_1.PlatformIntegrationService,
            },
            base_integration_service_1.BaseIntegrationService,
            shopify_service_1.ShopifyService,
            woocommerce_service_1.WooCommerceService,
            woocommerce_adapter_1.WooCommerceAdapter,
            merchant_auth_service_1.MerchantAuthService,
            order_sync_service_1.OrderSyncService,
            shopify_sync_service_1.ShopifySyncService,
            woocommerce_sync_service_1.WooCommerceSyncService,
            sync_service_fixed_1.SyncService,
        ],
        exports: [
            integrations_service_1.IntegrationsService,
            'PlatformIntegrationService',
            base_integration_service_1.BaseIntegrationService,
            shopify_service_1.ShopifyService,
            woocommerce_service_1.WooCommerceService,
            woocommerce_adapter_1.WooCommerceAdapter,
            merchant_auth_service_1.MerchantAuthService,
            order_sync_service_1.OrderSyncService,
            shopify_sync_service_1.ShopifySyncService,
            woocommerce_sync_service_1.WooCommerceSyncService,
            sync_service_fixed_1.SyncService,
        ],
    })
], IntegrationsModule);
//# sourceMappingURL=integrations.module.fixed.js.map