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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyWebhookController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const webhook_validator_1 = require("./webhook-validator");
const distributed_webhook_processor_1 = require("./distributed-webhook-processor");
const structured_logger_1 = require("../utils/structured-logger");
const crypto_1 = __importDefault(require("crypto"));
let ShopifyWebhookController = class ShopifyWebhookController {
    constructor(webhookValidator, webhookProcessor, configService, logger) {
        this.webhookValidator = webhookValidator;
        this.webhookProcessor = webhookProcessor;
        this.configService = configService;
        this.logger = logger;
    }
    async processWebhook(shop, topic, hmac, webhookId, payload, request) {
        try {
            this.logger.logWebhookEvent(topic, shop, webhookId);
            const rawBody = request.rawBody ? request.rawBody.toString('utf8') : JSON.stringify(payload);
            const isValid = this.webhookValidator.validateHmac(hmac, rawBody, this.configService.get('SHOPIFY_WEBHOOK_SECRET'));
            if (!isValid) {
                this.logger.error(`Invalid webhook signature for ${shop}`, {
                    shopDomain: shop,
                    topic,
                    webhookId,
                });
                return {
                    success: false,
                    message: 'Invalid signature',
                };
            }
            const uniqueWebhookId = webhookId || this.generateWebhookId(shop, topic, rawBody);
            const merchantId = this.extractMerchantId(payload, shop);
            await this.webhookProcessor.queueWebhook(shop, topic, payload, uniqueWebhookId, merchantId);
            return {
                success: true,
                message: 'Webhook received and queued for processing',
            };
        }
        catch (error) {
            this.logger.error(`Error handling webhook: ${error.message}`, {
                shopDomain: shop,
                topic,
                webhookId,
                errorMessage: error.message,
                errorStack: error.stack,
            });
            return {
                success: false,
                message: 'Webhook received but encountered an error during queueing',
            };
        }
    }
    generateWebhookId(shop, topic, body) {
        const hash = crypto_1.default
            .createHash('sha256')
            .update(`${shop}:${topic}:${body}:${Date.now()}`)
            .digest('hex');
        return `gen_${hash.substring(0, 20)}`;
    }
    extractMerchantId(payload, shop) {
        if (payload.shop && payload.shop.id) {
            return payload.shop.id.toString();
        }
        if (payload.admin_graphql_api_id) {
            const matches = payload.admin_graphql_api_id.match(/gid:\/\/shopify\/\w+\/(\d+)/);
            if (matches && matches[1]) {
                return matches[1];
            }
        }
        if (payload.id) {
            return `${shop}_${payload.id}`;
        }
        return undefined;
    }
};
exports.ShopifyWebhookController = ShopifyWebhookController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Headers)('x-shopify-shop-domain')),
    __param(1, (0, common_1.Headers)('x-shopify-topic')),
    __param(2, (0, common_1.Headers)('x-shopify-hmac-sha256')),
    __param(3, (0, common_1.Headers)('x-shopify-webhook-id')),
    __param(4, (0, common_1.Body)()),
    __param(5, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], ShopifyWebhookController.prototype, "processWebhook", null);
exports.ShopifyWebhookController = ShopifyWebhookController = __decorate([
    (0, common_1.Controller)('shopify/webhooks'),
    __metadata("design:paramtypes", [webhook_validator_1.WebhookValidator,
        distributed_webhook_processor_1.DistributedWebhookProcessor,
        config_1.ConfigService,
        structured_logger_1.ShopifyStructuredLogger])
], ShopifyWebhookController);
//# sourceMappingURL=webhook-controller.js.map