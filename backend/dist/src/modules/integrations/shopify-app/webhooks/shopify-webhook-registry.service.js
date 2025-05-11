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
var ShopifyWebhookRegistryService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ShopifyWebhookRegistryService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const crypto_1 = require('crypto');
const merchant_platform_connection_entity_1 = require('../../entities/merchant-platform-connection.entity');
const shopify_client_service_1 = require('../services/shopify-client.service');
const shopify_config_1 = require('../../../common/config/shopify-config');
const webhook_registry_1 = require('./webhook-registry');
const webhook_validator_1 = require('./webhook-validator');
const handlers_1 = require('./handlers');
let ShopifyWebhookRegistryService =
  (ShopifyWebhookRegistryService_1 = class ShopifyWebhookRegistryService {
    constructor(
      config,
      merchantPlatformConnectionRepository,
      shopifyClientService,
      webhookRegistry,
      webhookValidator,
      productHandler,
      orderHandler,
      appUninstalledHandler,
    ) {
      this.config = config;
      this.merchantPlatformConnectionRepository = merchantPlatformConnectionRepository;
      this.shopifyClientService = shopifyClientService;
      this.webhookRegistry = webhookRegistry;
      this.webhookValidator = webhookValidator;
      this.productHandler = productHandler;
      this.orderHandler = orderHandler;
      this.appUninstalledHandler = appUninstalledHandler;
      this.logger = new common_1.Logger(ShopifyWebhookRegistryService_1.name);
    }
    async onModuleInit() {
      this.webhookRegistry.registerHandlers([
        this.productHandler,
        this.orderHandler,
        this.appUninstalledHandler,
      ]);
      this.logger.log(
        `Registered ${this.webhookRegistry.getRegisteredTopics().length} webhook handlers`,
      );
    }
    async registerWebhook(shop, accessToken, topic, address) {
      try {
        const topicFormatted = topic.toUpperCase().replace(/\//g, '_');
        const result = await this.shopifyClientService.query(
          shop,
          accessToken,
          this.config.DEFAULT_GRAPHQL_QUERIES.REGISTER_WEBHOOK,
          {
            topic: topicFormatted,
            webhookSubscription: {
              callbackUrl: address,
              format: 'json',
            },
          },
        );
        if (
          result?.webhookSubscriptionCreate?.userErrors &&
          result.webhookSubscriptionCreate.userErrors.length > 0
        ) {
          const errors = result.webhookSubscriptionCreate.userErrors;
          this.logger.error(`Failed to register webhook ${topic} for shop ${shop}:`, errors);
          throw new Error(`Failed to register webhook: ${errors[0]?.message || 'Unknown error'}`);
        }
        const subscription = result?.webhookSubscriptionCreate?.webhookSubscription;
        if (!subscription) {
          throw new Error(`Failed to register webhook ${topic}: No subscription returned`);
        }
        return {
          id: subscription.id,
          topic: this.formatTopicFromGraphQL(subscription.topic),
          address: subscription.endpoint?.callbackUrl || address,
          format: subscription.format,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } catch (error) {
        this.logger.error(
          `Error registering webhook ${topic} for shop ${shop}: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    }
    async registerAllWebhooks(shop, accessToken) {
      try {
        const webhookTopics = Object.keys(this.config.webhooks.topics);
        const _results = [];
        const baseUrl = this.config.webhooks.baseUrl;
        this.logger.log(`Registering ${webhookTopics.length} webhooks for shop ${shop}`);
        const promises = webhookTopics.map(async topic => {
          try {
            const address = `${baseUrl}/${topic.replace('/', '_')}`;
            const result = await this.registerWebhook(shop, accessToken, topic, address);
            this.logger.log(`Successfully registered webhook ${topic} for shop ${shop}`);
            return result;
          } catch (error) {
            this.logger.error(`Failed to register webhook ${topic}: ${error.message}`);
            return null;
          }
        });
        const allResults = await Promise.all(promises);
        return allResults.filter(Boolean);
      } catch (error) {
        this.logger.error(`Error registering webhooks for shop ${shop}: ${error.message}`);
        throw error;
      }
    }
    async getWebhooks(shop, accessToken) {
      try {
        const result = await this.shopifyClientService.query(
          shop,
          accessToken,
          this.config.DEFAULT_GRAPHQL_QUERIES.GET_WEBHOOKS,
        );
        const webhooks = result?.webhookSubscriptions?.edges.map(({ node }) => ({
          id: node.id,
          topic: this.formatTopicFromGraphQL(node.topic),
          address: node.endpoint?.callbackUrl || '',
          format: node.format,
          createdAt: node.createdAt || new Date().toISOString(),
          updatedAt: node.updatedAt || new Date().toISOString(),
        }));
        return webhooks || [];
      } catch (error) {
        this.logger.error(`Error fetching webhooks for shop ${shop}: ${error.message}`);
        throw error;
      }
    }
    verifyWebhookSignature(rawBody, headers) {
      return this.webhookValidator.verifyWebhookSignature(rawBody, headers);
    }
    async processWebhook(topic, shop, payload) {
      try {
        const webhookId = (0, crypto_1.randomUUID)();
        this.logger.log(`Processing webhook ${topic} for shop ${shop} (ID: ${webhookId})`);
        const context = {
          topic,
          shop,
          payload,
          webhookId,
          timestamp: new Date(),
        };
        await this.recordWebhookEvent(context);
        const result = await this.webhookRegistry.process(context);
        if (!result.success) {
          this.logger.error(`Webhook processing failed: ${result.message}`, result.error);
          await this.recordWebhookFailure(shop, topic, webhookId, result.error);
        }
      } catch (error) {
        this.logger.error(
          `Unexpected error processing webhook ${topic} for ${shop}: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    }
    async recordWebhookEvent(context) {
      try {
        const { topic, shop, webhookId, timestamp } = context;
        const minimalPayload = {
          shop,
          topic,
          webhook_id: webhookId,
          received_at: timestamp.toISOString(),
        };
        this.logger.debug('Webhook metadata:', minimalPayload);
      } catch (error) {
        this.logger.error(`Failed to record webhook event: ${error.message}`);
      }
    }
    async recordWebhookFailure(shop, topic, webhookId, error) {
      try {
        this.logger.error(`Recording webhook failure ${webhookId}: ${topic} for shop ${shop}`);
        const errorInfo = {
          webhook_id: webhookId,
          shop,
          topic,
          error_message: error instanceof Error ? error.message : String(error),
          error_time: new Date().toISOString(),
          retry_count: 0,
        };
        this.logger.error('Webhook failure details:', errorInfo);
      } catch (recordError) {
        this.logger.error(`Failed to record webhook failure: ${recordError.message}`);
      }
    }
    formatTopicFromGraphQL(topic) {
      return topic.toLowerCase().replace('_', '/');
    }
  });
exports.ShopifyWebhookRegistryService = ShopifyWebhookRegistryService;
exports.ShopifyWebhookRegistryService =
  ShopifyWebhookRegistryService =
  ShopifyWebhookRegistryService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, common_1.Inject)(shopify_config_1.shopifyConfig.KEY)),
        __param(
          1,
          (0, typeorm_1.InjectRepository)(
            merchant_platform_connection_entity_1.MerchantPlatformConnection,
          ),
        ),
        __metadata('design:paramtypes', [
          void 0,
          typeorm_2.Repository,
          shopify_client_service_1.ShopifyClientService,
          webhook_registry_1.WebhookRegistry,
          webhook_validator_1.WebhookValidator,
          handlers_1.ProductWebhookHandler,
          handlers_1.OrderWebhookHandler,
          handlers_1.AppUninstalledWebhookHandler,
        ]),
      ],
      ShopifyWebhookRegistryService,
    );
//# sourceMappingURL=shopify-webhook-registry.service.js.map
