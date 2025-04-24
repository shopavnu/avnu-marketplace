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
const products_module_1 = require("../products/products.module");
const shopify_service_1 = require("./services/shopify.service");
const woocommerce_service_1 = require("./services/woocommerce.service");
const integrations_controller_1 = require("./integrations.controller");
const integrations_service_1 = require("./integrations.service");
let IntegrationsModule = class IntegrationsModule {
};
exports.IntegrationsModule = IntegrationsModule;
exports.IntegrationsModule = IntegrationsModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, products_module_1.ProductsModule],
        controllers: [integrations_controller_1.IntegrationsController],
        providers: [integrations_service_1.IntegrationsService, shopify_service_1.ShopifyService, woocommerce_service_1.WooCommerceService],
        exports: [integrations_service_1.IntegrationsService, shopify_service_1.ShopifyService, woocommerce_service_1.WooCommerceService],
    })
], IntegrationsModule);
//# sourceMappingURL=integrations.module.js.map