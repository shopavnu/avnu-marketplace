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
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var ShopifyWebhookController_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ShopifyWebhookController = void 0;
const common_1 = require('@nestjs/common');
const swagger_1 = require('@nestjs/swagger');
const shopify_webhook_service_1 = require('../services/shopify-webhook.service');
const webhook_validator_1 = require('../utils/webhook-validator');
let ShopifyWebhookController = (ShopifyWebhookController_1 = class ShopifyWebhookController {
  constructor(shopifyWebhookService, webhookValidator) {
    this.shopifyWebhookService = shopifyWebhookService;
    this.webhookValidator = webhookValidator;
    this.logger = new common_1.Logger(ShopifyWebhookController_1.name);
  }
  async handleWebhook(topic, hmac, shop, request, data) {
    try {
      this.logger.log(`Received Shopify webhook: ${topic} from ${shop}`);
      const rawBody = request.rawBody?.toString() || JSON.stringify(data);
      const isValid = this.webhookValidator.validateWebhook(hmac, rawBody);
      this.webhookValidator.logValidationResult(isValid, topic, shop);
      if (!isValid) {
        this.logger.warn(`Invalid webhook signature from ${shop}`);
        throw new common_1.BadRequestException('Invalid webhook signature');
      }
      await this.shopifyWebhookService.handleWebhook(topic, shop, data);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error handling webhook: ${error instanceof Error ? error.message : String(error)}`,
      );
      return { success: false };
    }
  }
});
exports.ShopifyWebhookController = ShopifyWebhookController;
__decorate(
  [
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Shopify webhook requests' }),
    (0, swagger_1.ApiHeader)({ name: 'X-Shopify-Topic', description: 'Webhook topic' }),
    (0, swagger_1.ApiHeader)({
      name: 'X-Shopify-Hmac-Sha256',
      description: 'HMAC signature for verification',
    }),
    (0, swagger_1.ApiHeader)({ name: 'X-Shopify-Shop-Domain', description: 'Shopify shop domain' }),
    __param(0, (0, common_1.Headers)('x-shopify-topic')),
    __param(1, (0, common_1.Headers)('x-shopify-hmac-sha256')),
    __param(2, (0, common_1.Headers)('x-shopify-shop-domain')),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, String, Object, Object]),
    __metadata('design:returntype', Promise),
  ],
  ShopifyWebhookController.prototype,
  'handleWebhook',
  null,
);
exports.ShopifyWebhookController =
  ShopifyWebhookController =
  ShopifyWebhookController_1 =
    __decorate(
      [
        (0, swagger_1.ApiTags)('shopify-webhooks'),
        (0, common_1.Controller)('integrations/shopify/webhook'),
        __metadata('design:paramtypes', [
          shopify_webhook_service_1.ShopifyWebhookService,
          webhook_validator_1.ShopifyWebhookValidator,
        ]),
      ],
      ShopifyWebhookController,
    );
//# sourceMappingURL=shopify-webhook.controller.js.map
