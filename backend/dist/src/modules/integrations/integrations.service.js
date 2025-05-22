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
var IntegrationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsService = exports.IntegrationType = void 0;
const common_1 = require("@nestjs/common");
const shopify_service_1 = require("./services/shopify.service");
const integration_type_enum_1 = require("./types/integration-type.enum");
Object.defineProperty(exports, "IntegrationType", { enumerable: true, get: function () { return integration_type_enum_1.IntegrationType; } });
let IntegrationsService = IntegrationsService_1 = class IntegrationsService {
    constructor(shopifyService) {
        this.shopifyService = shopifyService;
        this.logger = new common_1.Logger(IntegrationsService_1.name);
    }
    async authenticate(type, credentials) {
        try {
            if (type !== integration_type_enum_1.IntegrationType.SHOPIFY) {
                throw new Error(`Unsupported integration type: ${type}`);
            }
            const shopDomain = credentials.shopify?.shopDomain || credentials.shopDomain || '';
            const accessToken = credentials.shopify?.accessToken || credentials.accessToken || '';
            if (!shopDomain || !accessToken) {
                throw new Error('Shopify domain and access token are required');
            }
            const result = await this.shopifyService.authenticate(shopDomain, accessToken, null, null);
            return result !== null;
        }
        catch (error) {
            this.logger.error(`Failed to authenticate with ${type}: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }
    async syncProducts(type, credentials, merchantId) {
        try {
            if (type !== integration_type_enum_1.IntegrationType.SHOPIFY) {
                throw new Error(`Unsupported integration type: ${type}`);
            }
            const result = await this.shopifyService.syncProducts(merchantId, null, null);
            return {
                added: result.created || 0,
                updated: result.updated || 0,
                failed: result.failed || 0,
                errors: [],
            };
        }
        catch (error) {
            this.logger.error(`Failed to sync products from ${type}: ${error instanceof Error ? error.message : String(error)}`);
            return { added: 0, updated: 0, failed: 0, errors: [`${error}`] };
        }
    }
    async handleWebhook(type, payload, topic, merchantId) {
        try {
            if (type !== integration_type_enum_1.IntegrationType.SHOPIFY) {
                throw new Error(`Unsupported integration type: ${type}`);
            }
            const connection = { platformStoreUrl: `shop.myshopify.com` };
            if (!connection) {
                throw new Error(`No Shopify connection found for merchant ${merchantId}`);
            }
            await this.shopifyService.handleWebhook(topic, connection.platformStoreUrl, payload);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to handle webhook from ${type}: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }
};
exports.IntegrationsService = IntegrationsService;
exports.IntegrationsService = IntegrationsService = IntegrationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [shopify_service_1.ShopifyService])
], IntegrationsService);
//# sourceMappingURL=integrations.service.js.map