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
var ShopifyWebhookDeduplicator_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ShopifyWebhookDeduplicator = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const nestjs_redis_1 = require('nestjs-redis');
let ShopifyWebhookDeduplicator = (ShopifyWebhookDeduplicator_1 = class ShopifyWebhookDeduplicator {
  constructor(configService, redisService) {
    this.configService = configService;
    this.redisService = redisService;
    this.logger = new common_1.Logger(ShopifyWebhookDeduplicator_1.name);
    this.memoryProcessed = new Map();
    this.processingWindowMs = this.configService.get('WEBHOOK_DEDUPLICATION_WINDOW_MS', 3600000);
    this.useRedis = this.configService.get('CACHE_REDIS_ENABLED', true);
    if (this.useRedis) {
      try {
        this.redisClient = this.redisService.getClient();
        this.logger.log('Webhook deduplicator initialized with Redis');
      } catch (error) {
        this.logger.error(`Failed to initialize Redis for webhook deduplication: ${error.message}`);
        this.useRedis = false;
        this.logger.warn(
          'Falling back to in-memory webhook deduplication (not recommended for production)',
        );
      }
    } else {
      this.logger.warn(
        'Redis disabled for webhook deduplication - using in-memory (not recommended for production)',
      );
    }
    if (!this.useRedis) {
      setInterval(() => this.cleanupMemoryStorage(), 300000);
    }
  }
  async isAlreadyProcessed(webhookId) {
    if (this.useRedis) {
      return this.isProcessedRedis(webhookId);
    } else {
      return this.isProcessedMemory(webhookId);
    }
  }
  async markAsProcessed(webhookId, metadata = {}) {
    if (this.useRedis) {
      await this.markProcessedRedis(webhookId, metadata);
    } else {
      this.markProcessedMemory(webhookId);
    }
  }
  async processWithDeduplication(webhookId, processor, metadata = {}) {
    const isProcessed = await this.isAlreadyProcessed(webhookId);
    if (isProcessed) {
      this.logger.warn(`Duplicate webhook detected: ${webhookId}`);
      return undefined;
    }
    try {
      const result = await processor();
      await this.markAsProcessed(webhookId, {
        ...metadata,
        processedAt: new Date().toISOString(),
        success: true,
      });
      return result;
    } catch (error) {
      await this.markAsProcessed(webhookId, {
        ...metadata,
        processedAt: new Date().toISOString(),
        success: false,
        error: error.message,
      });
      throw error;
    }
  }
  async isProcessedRedis(webhookId) {
    try {
      const key = this.getRedisKey(webhookId);
      const exists = await this.redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Redis error checking webhook ${webhookId}: ${error.message}`);
      return this.isProcessedMemory(webhookId);
    }
  }
  async markProcessedRedis(webhookId, metadata = {}) {
    try {
      const key = this.getRedisKey(webhookId);
      const value = JSON.stringify({
        webhookId,
        timestamp: Date.now(),
        ...metadata,
      });
      const ttlSeconds = Math.floor(this.processingWindowMs / 1000);
      await this.redisClient.set(key, value, 'EX', ttlSeconds);
    } catch (error) {
      this.logger.error(`Redis error marking webhook ${webhookId}: ${error.message}`);
      this.markProcessedMemory(webhookId);
    }
  }
  isProcessedMemory(webhookId) {
    return this.memoryProcessed.has(webhookId);
  }
  markProcessedMemory(webhookId) {
    this.memoryProcessed.set(webhookId, Date.now());
  }
  cleanupMemoryStorage() {
    const now = Date.now();
    const cutoff = now - this.processingWindowMs;
    let count = 0;
    for (const [key, timestamp] of this.memoryProcessed.entries()) {
      if (timestamp < cutoff) {
        this.memoryProcessed.delete(key);
        count++;
      }
    }
    if (count > 0) {
      this.logger.debug(`Cleaned up ${count} old webhook records from memory`);
    }
  }
  getRedisKey(webhookId) {
    return `shopify:webhook:processed:${webhookId}`;
  }
  async getProcessedInfo(webhookId) {
    if (!this.useRedis) {
      return this.memoryProcessed.has(webhookId)
        ? { webhookId, timestamp: this.memoryProcessed.get(webhookId) }
        : null;
    }
    try {
      const key = this.getRedisKey(webhookId);
      const value = await this.redisClient.get(key);
      if (!value) return null;
      return JSON.parse(value);
    } catch (error) {
      this.logger.error(`Redis error getting webhook info for ${webhookId}: ${error.message}`);
      return null;
    }
  }
});
exports.ShopifyWebhookDeduplicator = ShopifyWebhookDeduplicator;
exports.ShopifyWebhookDeduplicator =
  ShopifyWebhookDeduplicator =
  ShopifyWebhookDeduplicator_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [config_1.ConfigService, nestjs_redis_1.RedisService]),
      ],
      ShopifyWebhookDeduplicator,
    );
//# sourceMappingURL=webhook-deduplicator.js.map
