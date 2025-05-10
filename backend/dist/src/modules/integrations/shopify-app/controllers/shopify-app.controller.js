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
var ShopifyAppController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyAppController = void 0;
const common_1 = require("@nestjs/common");
const shopify_auth_service_1 = require("../services/shopify-auth.service");
const shopify_app_service_1 = require("../services/shopify-app.service");
const shopify_webhook_service_1 = require("../services/shopify-webhook.service");
let ShopifyAppController = ShopifyAppController_1 = class ShopifyAppController {
    constructor(shopifyAuthService, shopifyAppService, shopifyWebhookService) {
        this.shopifyAuthService = shopifyAuthService;
        this.shopifyAppService = shopifyAppService;
        this.shopifyWebhookService = shopifyWebhookService;
        this.logger = new common_1.Logger(ShopifyAppController_1.name);
    }
    async auth(shop, response) {
        this.logger.log(`Received authorization request for shop: ${shop}`);
        try {
            const authUrl = await this.shopifyAuthService.getAuthUrl(shop);
            response.redirect(authUrl);
        }
        catch (error) {
            this.logger.error(`Error in auth: ${error instanceof Error ? error.message : String(error)}`);
            response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to initiate authorization',
            });
        }
    }
    async callback(shop, code, state, response) {
        this.logger.log(`Received callback for shop: ${shop}`);
        try {
            const success = await this.shopifyAuthService.handleCallback(shop, code, state);
            if (success) {
                response.redirect(`https://${shop}/admin/apps/avnu-marketplace`);
            }
            else {
                response.status(common_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'Authentication failed',
                });
            }
        }
        catch (error) {
            this.logger.error(`Error in callback: ${error instanceof Error ? error.message : String(error)}`);
            response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Authentication failed',
            });
        }
    }
    async handleWebhook(topic, shop, hmac, request, response) {
        this.logger.log(`Received webhook: ${topic} from shop: ${shop}`);
        try {
            const requestBody = JSON.stringify(request.body);
            const isValid = await this.shopifyWebhookService.verifyWebhook(hmac, requestBody);
            if (!isValid) {
                this.logger.warn(`Invalid webhook signature for shop: ${shop}, topic: ${topic}`);
                response.status(common_1.HttpStatus.UNAUTHORIZED).send();
                return;
            }
            await this.shopifyWebhookService.handleWebhook(topic, shop, request.body);
            response.status(common_1.HttpStatus.OK).send();
        }
        catch (error) {
            this.logger.error(`Error processing webhook: ${error instanceof Error ? error.message : String(error)}`);
            response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async syncProducts(shop, response) {
        this.logger.log(`Initiating product sync for shop: ${shop}`);
        try {
            const result = await this.shopifyAppService.syncProducts(shop);
            response.status(common_1.HttpStatus.OK).json(result);
        }
        catch (error) {
            this.logger.error(`Error syncing products: ${error instanceof Error ? error.message : String(error)}`);
            response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to sync products',
            });
        }
    }
    async syncOrders(shop, response) {
        this.logger.log(`Initiating order sync for shop: ${shop}`);
        try {
            const result = await this.shopifyAppService.syncOrders(shop);
            response.status(common_1.HttpStatus.OK).json(result);
        }
        catch (error) {
            this.logger.error(`Error syncing orders: ${error instanceof Error ? error.message : String(error)}`);
            response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to sync orders',
            });
        }
    }
};
exports.ShopifyAppController = ShopifyAppController;
__decorate([
    (0, common_1.Get)('auth'),
    __param(0, (0, common_1.Query)('shop')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShopifyAppController.prototype, "auth", null);
__decorate([
    (0, common_1.Get)('callback'),
    __param(0, (0, common_1.Query)('shop')),
    __param(1, (0, common_1.Query)('code')),
    __param(2, (0, common_1.Query)('state')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ShopifyAppController.prototype, "callback", null);
__decorate([
    (0, common_1.Post)('webhooks'),
    __param(0, (0, common_1.Headers)('x-shopify-topic')),
    __param(1, (0, common_1.Headers)('x-shopify-shop-domain')),
    __param(2, (0, common_1.Headers)('x-shopify-hmac-sha256')),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], ShopifyAppController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('products/sync'),
    __param(0, (0, common_1.Query)('shop')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShopifyAppController.prototype, "syncProducts", null);
__decorate([
    (0, common_1.Get)('orders/sync'),
    __param(0, (0, common_1.Query)('shop')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShopifyAppController.prototype, "syncOrders", null);
exports.ShopifyAppController = ShopifyAppController = ShopifyAppController_1 = __decorate([
    (0, common_1.Controller)('integrations/shopify'),
    __metadata("design:paramtypes", [shopify_auth_service_1.ShopifyAuthService,
        shopify_app_service_1.ShopifyAppService,
        shopify_webhook_service_1.ShopifyWebhookService])
], ShopifyAppController);
//# sourceMappingURL=shopify-app.controller.js.map