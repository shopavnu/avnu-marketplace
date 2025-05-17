"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const merchant_guard_1 = require("../../../modules/auth/guards/merchant.guard");
const integrations_service_1 = require("../integrations.service");
const order_sync_service_1 = require("../services/order-sync.service");
const integration_type_enum_1 = require("../types/integration-type.enum");
let SyncController = class SyncController {
    constructor(integrationsService, orderSyncService) {
        this.integrationsService = integrationsService;
        this.orderSyncService = orderSyncService;
    }
    async syncShopifyProducts(req) {
        return this.integrationsService.syncProducts(integration_type_enum_1.IntegrationType.SHOPIFY, {}, req.user.merchantId);
    }
    async syncShopifyOrders(req) {
        return this.orderSyncService.syncOrders(integration_type_enum_1.IntegrationType.SHOPIFY, req.user.merchantId);
    }
    async handleShopifyWebhook(payload, req) {
        const topic = req.headers['x-shopify-topic'] || '';
        const _shop = req.headers['x-shopify-shop-domain'] || '';
        const merchantId = 'merchant-id-placeholder';
        const result = await this.integrationsService.handleWebhook(integration_type_enum_1.IntegrationType.SHOPIFY, payload, topic, merchantId);
        return { success: result };
    }
};
exports.SyncController = SyncController;
__decorate([
    (0, common_1.Post)('shopify/products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, merchant_guard_1.MerchantGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Sync products from Shopify' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "syncShopifyProducts", null);
__decorate([
    (0, common_1.Post)('shopify/orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, merchant_guard_1.MerchantGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Sync orders from Shopify' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "syncShopifyOrders", null);
__decorate([
    (0, common_1.Post)('shopify/webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle webhook from Shopify' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "handleShopifyWebhook", null);
exports.SyncController = SyncController = __decorate([
    (0, swagger_1.ApiTags)('Integrations'),
    (0, common_1.Controller)('sync'),
    __metadata("design:paramtypes", [integrations_service_1.IntegrationsService,
        order_sync_service_1.OrderSyncService])
], SyncController);
//# sourceMappingURL=sync.controller.js.map