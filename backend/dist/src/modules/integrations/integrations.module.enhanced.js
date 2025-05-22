'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.IntegrationsModule = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const typeorm_1 = require('@nestjs/typeorm');
const products_module_enhanced_1 = require('../products/products.module.enhanced');
const orders_module_1 = require('../orders/orders.module');
const merchants_module_1 = require('../merchants/merchants.module');
const integrations_controller_enhanced_1 = require('./controllers/integrations.controller.enhanced');
const merchant_auth_controller_enhanced_1 = require('./controllers/merchant-auth.controller.enhanced');
const sync_controller_enhanced_1 = require('./controllers/sync.controller.enhanced');
const shopify_service_enhanced_1 = require('./services/shopify.service.enhanced');
const woocommerce_service_enhanced_1 = require('./services/woocommerce.service.enhanced');
const base_integration_service_enhanced_1 = require('./services/base-integration.service.enhanced');
const merchant_auth_service_enhanced_1 = require('./services/merchant-auth.service.enhanced');
const integrations_service_enhanced_1 = require('./integrations.service.enhanced');
const sync_service_enhanced_1 = require('./services/sync.service.enhanced');
const order_sync_service_enhanced_1 = require('./services/order-sync.service.enhanced');
const merchant_platform_connection_entity_1 = require('./entities/merchant-platform-connection.entity');
let IntegrationsModule = class IntegrationsModule {};
exports.IntegrationsModule = IntegrationsModule;
exports.IntegrationsModule = IntegrationsModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        config_1.ConfigModule,
        typeorm_1.TypeOrmModule.forFeature([
          merchant_platform_connection_entity_1.MerchantPlatformConnection,
        ]),
        products_module_enhanced_1.ProductsModule,
        orders_module_1.OrdersModule,
        merchants_module_1.MerchantsModule,
      ],
      controllers: [
        integrations_controller_enhanced_1.IntegrationsController,
        merchant_auth_controller_enhanced_1.MerchantAuthController,
        sync_controller_enhanced_1.SyncController,
      ],
      providers: [
        integrations_service_enhanced_1.IntegrationsService,
        base_integration_service_enhanced_1.BaseIntegrationService,
        shopify_service_enhanced_1.ShopifyService,
        woocommerce_service_enhanced_1.WooCommerceService,
        merchant_auth_service_enhanced_1.MerchantAuthService,
        sync_service_enhanced_1.SyncService,
        order_sync_service_enhanced_1.OrderSyncService,
      ],
      exports: [
        integrations_service_enhanced_1.IntegrationsService,
        base_integration_service_enhanced_1.BaseIntegrationService,
        shopify_service_enhanced_1.ShopifyService,
        woocommerce_service_enhanced_1.WooCommerceService,
        merchant_auth_service_enhanced_1.MerchantAuthService,
        sync_service_enhanced_1.SyncService,
        order_sync_service_enhanced_1.OrderSyncService,
      ],
    }),
  ],
  IntegrationsModule,
);
//# sourceMappingURL=integrations.module.enhanced.js.map
