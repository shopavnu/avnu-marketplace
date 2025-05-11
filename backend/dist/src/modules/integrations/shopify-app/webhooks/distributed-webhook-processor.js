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
Object.defineProperty(exports, '__esModule', { value: true });
exports.DistributedWebhookProcessor = void 0;
const common_1 = require('@nestjs/common');
const bull_1 = require('@nestjs/bull');
const config_1 = require('@nestjs/config');
const webhook_registry_1 = require('./webhook-registry');
const webhook_validator_1 = require('./webhook-validator');
const structured_logger_1 = require('../utils/structured-logger');
const webhook_deduplicator_1 = require('../utils/webhook-deduplicator');
let DistributedWebhookProcessor = class DistributedWebhookProcessor {
  constructor(
    webhookQueue,
    webhookRegistry,
    webhookValidator,
    webhookDeduplicator,
    configService,
    logger,
  ) {
    this.webhookQueue = webhookQueue;
    this.webhookRegistry = webhookRegistry;
    this.webhookValidator = webhookValidator;
    this.webhookDeduplicator = webhookDeduplicator;
    this.configService = configService;
    this.logger = logger;
  }
  async queueWebhook(shop, topic, payload, webhookId, merchantId) {
    try {
      const alreadyProcessed = await this.webhookDeduplicator.isAlreadyProcessed(webhookId);
      if (alreadyProcessed) {
        this.logger.warn(`Duplicate webhook received and skipped: ${webhookId}`, {
          shopDomain: shop,
          topic,
          webhookId,
        });
        return;
      }
      const priority = this.calculatePriority(topic);
      await this.webhookQueue.add(
        'process',
        {
          shop,
          topic,
          payload,
          webhookId,
          metadata: {
            receivedAt: new Date().toISOString(),
            attempts: 0,
            merchantId,
            priority,
          },
        },
        {
          priority,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          jobId: webhookId,
          removeOnComplete: 24 * 60 * 60,
          removeOnFail: 7 * 24 * 60 * 60,
        },
      );
      this.logger.log(`Webhook queued for processing: ${topic}`, {
        shopDomain: shop,
        topic,
        webhookId,
        priority,
      });
    } catch (error) {
      this.logger.error(`Failed to queue webhook: ${error.message}`, {
        shopDomain: shop,
        topic,
        webhookId,
        errorMessage: error.message,
      });
      throw error;
    }
  }
  async processWebhook(job) {
    const { shop, topic, payload, webhookId, metadata } = job.data;
    try {
      metadata.attempts = (metadata.attempts || 0) + 1;
      this.logger.log(`Processing webhook: ${topic} (attempt ${metadata.attempts})`, {
        shopDomain: shop,
        topic,
        webhookId,
        attempt: metadata.attempts,
      });
      const alreadyProcessed = await this.webhookDeduplicator.isAlreadyProcessed(webhookId);
      if (alreadyProcessed) {
        this.logger.warn(`Duplicate webhook processing prevented: ${webhookId}`, {
          shopDomain: shop,
          topic,
          webhookId,
        });
        return;
      }
      await this.webhookDeduplicator.processWithDeduplication(webhookId, async () => {
        const handler = this.webhookRegistry.getHandler(topic);
        if (!handler) {
          throw new Error(`No handler registered for topic: ${topic}`);
        }
        const startTime = Date.now();
        await handler.process({
          topic: topic,
          shop,
          payload,
          webhookId,
          timestamp: new Date(),
        });
        const duration = Date.now() - startTime;
        this.logger.log(`Webhook processed successfully: ${topic}`, {
          shopDomain: shop,
          topic,
          webhookId,
          duration,
        });
      });
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`, {
        shopDomain: shop,
        topic,
        webhookId,
        attempt: metadata.attempts,
        errorMessage: error.message,
        errorStack: error.stack,
      });
      const maxAttempts = job.opts.attempts || 3;
      if (metadata.attempts >= maxAttempts) {
        this.logger.error(`Max retry attempts reached for webhook: ${webhookId}`, {
          shopDomain: shop,
          topic,
          webhookId,
          maxAttempts,
        });
        await this.webhookDeduplicator.markAsProcessed(webhookId, {
          topic,
          shopDomain: shop,
          error: error.message,
          maxAttemptsReached: true,
        });
      }
      throw error;
    }
  }
  calculatePriority(topic) {
    if (
      topic.includes('orders/') ||
      topic.includes('checkouts/') ||
      topic.includes('fulfillments/')
    ) {
      return 1;
    }
    if (
      topic.includes('products/update') ||
      topic.includes('inventory_levels/') ||
      topic.includes('customers/') ||
      topic.includes('cart/')
    ) {
      return 5;
    }
    if (
      topic.includes('products/create') ||
      topic.includes('collections/') ||
      topic.includes('price_rules/') ||
      topic.includes('discounts/')
    ) {
      return 10;
    }
    return 15;
  }
};
exports.DistributedWebhookProcessor = DistributedWebhookProcessor;
__decorate(
  [
    (0, bull_1.Process)('process'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  DistributedWebhookProcessor.prototype,
  'processWebhook',
  null,
);
exports.DistributedWebhookProcessor = DistributedWebhookProcessor = __decorate(
  [
    (0, common_1.Injectable)(),
    (0, bull_1.Processor)('shopify-webhooks'),
    __param(0, (0, bull_1.InjectQueue)('shopify-webhooks')),
    __metadata('design:paramtypes', [
      Object,
      webhook_registry_1.WebhookRegistry,
      webhook_validator_1.WebhookValidator,
      webhook_deduplicator_1.ShopifyWebhookDeduplicator,
      config_1.ConfigService,
      structured_logger_1.ShopifyStructuredLogger,
    ]),
  ],
  DistributedWebhookProcessor,
);
//# sourceMappingURL=distributed-webhook-processor.js.map
