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
var ShopifyWebhooksController_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ShopifyWebhooksController = void 0;
const common_1 = require('@nestjs/common');
const webhook_registry_1 = require('../webhooks/webhook-registry');
const webhook_validator_1 = require('../webhooks/webhook-validator');
const crypto_1 = require('crypto');
let ShopifyWebhooksController = (ShopifyWebhooksController_1 = class ShopifyWebhooksController {
  constructor(webhookRegistry, webhookValidator) {
    this.webhookRegistry = webhookRegistry;
    this.webhookValidator = webhookValidator;
    this.logger = new common_1.Logger(ShopifyWebhooksController_1.name);
  }
  async handleWebhook(topicParam, payload, headers, request) {
    try {
      const topic = topicParam.replace('_', '/');
      const rawBody = request.rawBody;
      if (!rawBody) {
        this.logger.error('Raw body not available for webhook verification');
        return { success: false, message: 'Invalid request' };
      }
      const isValid = this.webhookValidator.verifyWebhookSignature(rawBody, headers);
      if (!isValid) {
        this.logger.warn(`Invalid webhook signature for topic ${topic}`);
        return { success: false, message: 'Invalid webhook signature' };
      }
      const shop = headers['x-shopify-shop-domain'];
      if (!shop) {
        this.logger.warn('Shop domain not provided in webhook headers');
        return { success: false, message: 'Missing shop domain' };
      }
      const webhookId = (0, crypto_1.randomUUID)();
      const context = {
        topic,
        shop,
        payload,
        webhookId,
        timestamp: new Date(),
        headers,
      };
      this.logger.log(`Processing webhook ${webhookId} for topic ${topic} from shop ${shop}`);
      const result = await this.webhookRegistry.process(context);
      return {
        success: result.success,
        webhookId,
        message: result.message || 'Webhook received',
      };
    } catch (error) {
      this.logger.error(`Error handling webhook: ${error.message}`, error.stack);
      return { success: false, message: 'Error processing webhook' };
    }
  }
  healthCheck() {
    return {
      status: 'ok',
      topics: this.webhookRegistry.getRegisteredTopics(),
    };
  }
});
exports.ShopifyWebhooksController = ShopifyWebhooksController;
__decorate(
  [
    (0, common_1.Post)(':topic'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('topic')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)()),
    __param(3, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Object, Object, Object]),
    __metadata('design:returntype', Promise),
  ],
  ShopifyWebhooksController.prototype,
  'handleWebhook',
  null,
);
__decorate(
  [
    (0, common_1.Post)('health'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Object),
  ],
  ShopifyWebhooksController.prototype,
  'healthCheck',
  null,
);
exports.ShopifyWebhooksController =
  ShopifyWebhooksController =
  ShopifyWebhooksController_1 =
    __decorate(
      [
        (0, common_1.Controller)('webhooks/shopify'),
        __metadata('design:paramtypes', [
          webhook_registry_1.WebhookRegistry,
          webhook_validator_1.WebhookValidator,
        ]),
      ],
      ShopifyWebhooksController,
    );
//# sourceMappingURL=webhooks.controller.js.map
