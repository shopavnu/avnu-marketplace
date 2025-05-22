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
var WebhookMonitorService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebhookMonitorService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const schedule_1 = require('@nestjs/schedule');
const merchant_platform_connection_entity_1 = require('../../entities/merchant-platform-connection.entity');
let WebhookMonitorService = (WebhookMonitorService_1 = class WebhookMonitorService {
  constructor(merchantPlatformConnectionRepository) {
    this.merchantPlatformConnectionRepository = merchantPlatformConnectionRepository;
    this.logger = new common_1.Logger(WebhookMonitorService_1.name);
    this.webhookEvents = new Map();
  }
  async recordWebhookEvent(webhookId, topic, shop) {
    try {
      const merchantId = await this.getMerchantIdForShop(shop);
      const event = {
        id: webhookId,
        topic,
        shop,
        merchantId: merchantId || 'unknown',
        receivedAt: new Date(),
        success: false,
        retryCount: 0,
      };
      this.webhookEvents.set(webhookId, event);
      this.logger.debug(`Recorded webhook event ${webhookId} for topic ${topic} and shop ${shop}`);
    } catch (error) {
      this.logger.error(`Failed to record webhook event: ${error.message}`, error.stack);
    }
  }
  updateWebhookEventResult(webhookId, result) {
    try {
      const event = this.webhookEvents.get(webhookId);
      if (!event) {
        this.logger.warn(`Unable to find webhook event with ID ${webhookId}`);
        return;
      }
      event.processedAt = new Date();
      event.success = result.success;
      event.errorMessage = result.success ? undefined : result.message;
      this.webhookEvents.set(webhookId, event);
      if (result.success) {
        this.logger.debug(`Webhook ${webhookId} processed successfully`);
      } else {
        this.logger.warn(`Webhook ${webhookId} processing failed: ${result.message}`);
      }
    } catch (error) {
      this.logger.error(`Failed to update webhook event: ${error.message}`, error.stack);
    }
  }
  getWebhookEvent(webhookId) {
    return this.webhookEvents.get(webhookId);
  }
  getFailedWebhookEvents() {
    return Array.from(this.webhookEvents.values()).filter(event => !event.success);
  }
  getWebhookEventsByShop(shop) {
    return Array.from(this.webhookEvents.values()).filter(event => event.shop === shop);
  }
  getWebhookEventsByMerchant(merchantId) {
    return Array.from(this.webhookEvents.values()).filter(event => event.merchantId === merchantId);
  }
  recordRetryAttempt(webhookId, success, errorMessage) {
    try {
      const event = this.webhookEvents.get(webhookId);
      if (!event) {
        this.logger.warn(`Unable to find webhook event with ID ${webhookId}`);
        return;
      }
      event.retryCount += 1;
      event.lastRetryAt = new Date();
      event.success = success;
      event.errorMessage = success ? undefined : errorMessage;
      this.webhookEvents.set(webhookId, event);
      this.logger.log(
        `Webhook ${webhookId} retry attempt ${event.retryCount}: ${success ? 'successful' : 'failed'}`,
      );
    } catch (error) {
      this.logger.error(`Failed to record retry attempt: ${error.message}`, error.stack);
    }
  }
  cleanupOldEvents() {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const beforeCount = this.webhookEvents.size;
      for (const [id, event] of this.webhookEvents.entries()) {
        if (event.receivedAt < thirtyDaysAgo) {
          this.webhookEvents.delete(id);
        }
      }
      const afterCount = this.webhookEvents.size;
      this.logger.log(`Cleaned up ${beforeCount - afterCount} old webhook events`);
    } catch (error) {
      this.logger.error(`Failed to clean up old webhook events: ${error.message}`, error.stack);
    }
  }
  async getMerchantIdForShop(shop) {
    try {
      const connection = await this.merchantPlatformConnectionRepository.findOne({
        where: {
          platformType: 'SHOPIFY',
          platformIdentifier: shop,
          isActive: true,
        },
      });
      return connection ? connection.merchantId : null;
    } catch (error) {
      this.logger.error(`Failed to get merchant ID for shop ${shop}: ${error.message}`);
      return null;
    }
  }
});
exports.WebhookMonitorService = WebhookMonitorService;
__decorate(
  [
    (0, schedule_1.Cron)('0 0 * * *'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  WebhookMonitorService.prototype,
  'cleanupOldEvents',
  null,
);
exports.WebhookMonitorService =
  WebhookMonitorService =
  WebhookMonitorService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(
          0,
          (0, typeorm_1.InjectRepository)(
            merchant_platform_connection_entity_1.MerchantPlatformConnection,
          ),
        ),
        __metadata('design:paramtypes', [typeorm_2.Repository]),
      ],
      WebhookMonitorService,
    );
//# sourceMappingURL=webhook-monitor.service.js.map
