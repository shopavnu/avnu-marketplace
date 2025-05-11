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
var WebhookRegistry_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebhookRegistry = void 0;
const common_1 = require('@nestjs/common');
const webhook_monitor_service_1 = require('./webhook-monitor.service');
const webhook_retry_service_1 = require('./webhook-retry.service');
let WebhookRegistry = (WebhookRegistry_1 = class WebhookRegistry {
  constructor(webhookMonitor, webhookRetry) {
    this.webhookMonitor = webhookMonitor;
    this.webhookRetry = webhookRetry;
    this.logger = new common_1.Logger(WebhookRegistry_1.name);
    this.handlers = new Map();
    this.topicToHandlerMap = new Map();
  }
  register(handler) {
    const topics = handler.getTopics();
    if (Array.isArray(topics)) {
      topics.forEach(topic => {
        this.registerSingleTopic(topic, handler);
      });
    } else {
      this.registerSingleTopic(topics, handler);
    }
  }
  registerSingleTopic(topic, handler) {
    if (this.topicToHandlerMap.has(topic)) {
      this.logger.warn(`Overriding existing handler for topic ${topic}`);
    }
    this.topicToHandlerMap.set(topic, handler);
    const handlerId = handler.constructor.name;
    if (!this.handlers.has(handlerId)) {
      this.handlers.set(handlerId, handler);
    }
    this.logger.log(`Registered handler ${handlerId} for webhook topic: ${topic}`);
  }
  registerHandlers(handlers) {
    handlers.forEach(handler => this.register(handler));
  }
  hasHandlerFor(topic) {
    return this.topicToHandlerMap.has(topic);
  }
  getHandler(topic) {
    return this.topicToHandlerMap.get(topic) || null;
  }
  getRegisteredTopics() {
    return Array.from(this.topicToHandlerMap.keys());
  }
  getRegisteredHandlers() {
    return Array.from(this.handlers.values());
  }
  async process(context) {
    const { topic, webhookId } = context;
    const handler = this.topicToHandlerMap.get(topic);
    if (this.webhookMonitor) {
      await this.webhookMonitor.recordWebhookEvent(webhookId, topic, context.shop);
    }
    if (!handler) {
      const message = `No handler registered for webhook topic: ${topic}`;
      this.logger.warn(message);
      const result = {
        success: false,
        message,
        error: new Error(`Unhandled webhook topic: ${topic}`),
      };
      if (this.webhookMonitor) {
        this.webhookMonitor.updateWebhookEventResult(webhookId, result);
      }
      return result;
    }
    try {
      this.logger.debug(`Processing webhook ${webhookId} for topic: ${topic}`);
      const startTime = Date.now();
      const result = await handler.process(context);
      const processingTime = Date.now() - startTime;
      this.logger.debug(`Webhook processing time: ${processingTime}ms`);
      if (result.success) {
        this.logger.log(`Successfully processed webhook for topic: ${topic}`);
      } else {
        this.logger.error(`Failed to process webhook for topic: ${topic}`, result.error);
        if (this.webhookRetry && !result.success) {
          this.webhookRetry.scheduleRetry(webhookId, context);
        }
      }
      if (this.webhookMonitor) {
        this.webhookMonitor.updateWebhookEventResult(webhookId, result);
      }
      return result;
    } catch (error) {
      const errorMessage = `Unexpected error processing webhook topic ${topic}: ${error.message}`;
      this.logger.error(errorMessage, error.stack);
      const result = {
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error : new Error(String(error)),
      };
      if (this.webhookMonitor) {
        this.webhookMonitor.updateWebhookEventResult(webhookId, result);
      }
      if (this.webhookRetry) {
        this.webhookRetry.scheduleRetry(webhookId, context);
      }
      return result;
    }
  }
});
exports.WebhookRegistry = WebhookRegistry;
exports.WebhookRegistry =
  WebhookRegistry =
  WebhookRegistry_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, common_1.Optional)()),
        __param(1, (0, common_1.Optional)()),
        __metadata('design:paramtypes', [
          webhook_monitor_service_1.WebhookMonitorService,
          webhook_retry_service_1.WebhookRetryService,
        ]),
      ],
      WebhookRegistry,
    );
//# sourceMappingURL=webhook-registry.js.map
