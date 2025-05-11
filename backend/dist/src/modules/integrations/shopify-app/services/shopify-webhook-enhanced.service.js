'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
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
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
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
var ShopifyWebhookEnhancedService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ShopifyWebhookEnhancedService = void 0;
const common_1 = require('@nestjs/common');
const crypto = __importStar(require('crypto'));
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const merchant_platform_connection_entity_1 = require('../../entities/merchant-platform-connection.entity');
const shopify_config_1 = require('../../../common/config/shopify-config');
const shopify_client_service_1 = require('./shopify-client.service');
const shopify_auth_enhanced_service_1 = require('./shopify-auth-enhanced.service');
const platform_type_enum_1 = require('../../enums/platform-type.enum');
const crypto_1 = require('crypto');
let ShopifyWebhookEnhancedService =
  (ShopifyWebhookEnhancedService_1 = class ShopifyWebhookEnhancedService {
    constructor(
      config,
      merchantPlatformConnectionRepository,
      shopifyClientService,
      shopifyAuthService,
    ) {
      this.config = config;
      this.merchantPlatformConnectionRepository = merchantPlatformConnectionRepository;
      this.shopifyClientService = shopifyClientService;
      this.shopifyAuthService = shopifyAuthService;
      this.logger = new common_1.Logger(ShopifyWebhookEnhancedService_1.name);
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
              format: 'JSON',
            },
          },
        );
        if (
          result &&
          result['webhookSubscriptionCreate'] &&
          result['webhookSubscriptionCreate']['userErrors'] &&
          result['webhookSubscriptionCreate']['userErrors'].length > 0
        ) {
          const errors = result['webhookSubscriptionCreate']['userErrors'];
          this.logger.error(`Failed to register webhook ${topic} for shop ${shop}:`, errors);
          throw new Error(
            `Failed to register webhook: ${errors[0] && errors[0].message ? errors[0].message : 'Unknown error'}`,
          );
        }
        const subscription =
          result &&
          result['webhookSubscriptionCreate'] &&
          result['webhookSubscriptionCreate']['webhookSubscription']
            ? result['webhookSubscriptionCreate']['webhookSubscription']
            : null;
        if (!subscription) {
          throw new Error(`Failed to register webhook: No subscription returned`);
        }
        return {
          id: subscription.id || '',
          address: (subscription.endpoint && subscription.endpoint.callbackUrl) || '',
          topic: topic,
          format: subscription.format?.toLowerCase() || 'json',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } catch (error) {
        this.logger.error(`Error registering webhook ${topic} for shop ${shop}:`, error);
        throw error;
      }
    }
    async registerAllWebhooks(shop, accessToken) {
      const results = [];
      const errors = [];
      const webhookTopics = this.config.webhooks.topics;
      for (const topic of webhookTopics) {
        try {
          const webhookUrl = `${this.config.webhooks.baseUrl}/${topic.replace(/\//g, '_')}`;
          this.logger.log(`Registering webhook ${topic} for shop ${shop} at ${webhookUrl}`);
          const result = await this.registerWebhook(shop, accessToken, topic, webhookUrl);
          results.push(result);
        } catch (error) {
          this.logger.warn(`Failed to register webhook ${topic} for shop ${shop}:`, error);
          const typedError = error instanceof Error ? error : new Error(String(error));
          errors.push(typedError);
        }
      }
      this.logger.log(
        `Registered ${results.length}/${webhookTopics.length} webhooks for shop ${shop}`,
      );
      if (errors.length > 0) {
        this.logger.warn(`${errors.length} webhooks failed to register for shop ${shop}`);
      }
      return results;
    }
    async getWebhooks(shop, accessToken) {
      try {
        const result = await this.shopifyClientService.query(
          shop,
          accessToken,
          this.config.DEFAULT_GRAPHQL_QUERIES.GET_WEBHOOKS,
        );
        if (
          !result ||
          !result['webhookSubscriptions'] ||
          !result['webhookSubscriptions']['edges']
        ) {
          this.logger.warn(`Invalid response format when fetching webhooks for shop ${shop}`);
          return [];
        }
        return result['webhookSubscriptions']['edges']
          .map(edge => {
            const node = edge.node;
            if (!node) return null;
            return {
              id: node.id || '',
              address: (node.endpoint && node.endpoint.callbackUrl) || '',
              topic: this.formatTopicFromGraphQL(node.topic || ''),
              format: node.format?.toLowerCase() || 'json',
              createdAt: node.createdAt || new Date().toISOString(),
              updatedAt: node.updatedAt || new Date().toISOString(),
            };
          })
          .filter(Boolean);
      } catch (error) {
        this.logger.error(`Error fetching webhooks for shop ${shop}:`, error);
        throw error;
      }
    }
    verifyWebhookSignature(rawBody, headers) {
      try {
        const hmacHeader = headers['x-shopify-hmac-sha256'];
        const shopDomain = headers['x-shopify-shop-domain'];
        const timestamp = headers['x-shopify-hmac-timestamp'];
        const topic = headers['x-shopify-topic'];
        if (!hmacHeader || !shopDomain || !timestamp || !topic) {
          this.logger.error('Missing required headers for webhook verification', {
            hmac: !!hmacHeader,
            shop: !!shopDomain,
            timestamp: !!timestamp,
            topic: !!topic,
          });
          return false;
        }
        const secret = this.config.api.secret || '';
        if (!secret) {
          this.logger.error('Missing API secret for webhook verification');
          return false;
        }
        const timestampDate = new Date(timestamp);
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        if (isNaN(timestampDate.getTime()) || timestampDate < fiveMinutesAgo) {
          this.logger.error('Webhook timestamp is too old or invalid', { timestamp });
          return false;
        }
        const generatedHash = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
        const hmacValid = this.safeCompare(generatedHash, hmacHeader);
        if (!hmacValid) {
          this.logger.error('HMAC validation failed for webhook from shop ' + shopDomain);
          return false;
        }
        this.logger.debug(`Verified authentic webhook from ${shopDomain} for topic ${topic}`);
        return true;
      } catch (error) {
        this.logger.error('Error verifying webhook signature:', error);
        return false;
      }
    }
    async processWebhook(topic, shop, payload) {
      const webhookId = (0, crypto_1.randomUUID)();
      this.logger.log(`Processing webhook ${topic} from shop ${shop} [${webhookId}]`);
      try {
        const startTime = Date.now();
        if (!this.isValidShopDomain(shop)) {
          throw new common_1.BadRequestException(`Invalid shop domain: ${shop}`);
        }
        if (!payload || typeof payload !== 'object') {
          throw new common_1.BadRequestException('Invalid webhook payload format');
        }
        if (topic === 'app/uninstalled') {
          await this.handleAppUninstalled(shop, payload);
          return;
        }
        const [resourceType, event] = topic.split('/');
        await this.recordWebhookEvent(shop, topic, webhookId, payload);
        switch (resourceType) {
          case 'products':
            await this.handleProductWebhook(event || '', shop, payload);
            break;
          case 'orders':
            await this.handleOrderWebhook(event || '', shop, payload);
            break;
          case 'customers':
            await this.handleCustomerWebhook(event || '', shop, payload);
            break;
          case 'customer_tags':
            await this.handleCustomerTagsWebhook(event || '', shop, payload);
            break;
          case 'customers_marketing_consent':
            await this.handleCustomerMarketingConsentWebhook(event || '', shop, payload);
            break;
          case 'fulfillments':
            await this.handleFulfillmentWebhook(event || '', shop, payload);
            break;
          case 'fulfillment_holds':
            await this.handleFulfillmentHoldWebhook(event || '', shop, payload);
            break;
          case 'inventory_levels':
            await this.handleInventoryWebhook(event || '', shop, payload);
            break;
          case 'bulk_operations':
            await this.handleBulkOperationWebhook(event || '', shop, payload);
            break;
          default:
            this.logger.warn(`Unhandled webhook resource type: ${resourceType}`);
        }
        const processingTime = Date.now() - startTime;
        this.logger.debug(`Webhook ${topic} processed in ${processingTime}ms [${webhookId}]`);
      } catch (error) {
        this.logger.error(
          `Error processing webhook ${topic} from shop ${shop} [${webhookId}]:`,
          error,
        );
        await this.recordWebhookFailure(shop, topic, webhookId, error);
      }
    }
    async handleAppUninstalled(shop, _payload) {
      this.logger.log(`App uninstalled from shop ${shop}`);
      const connections = await this.merchantPlatformConnectionRepository.find({
        where: {
          platformType: platform_type_enum_1.PlatformType.SHOPIFY,
          platformIdentifier: shop,
        },
      });
      if (connections.length === 0) {
        this.logger.warn(`No connections found for shop ${shop} during uninstall`);
        return;
      }
      for (const connection of connections) {
        await this.merchantPlatformConnectionRepository.update(
          { id: connection.id },
          {
            isActive: false,
            metadata: {
              ...connection.metadata,
              uninstalledAt: new Date().toISOString(),
            },
          },
        );
      }
      this.logger.log(
        `Successfully marked ${connections.length} connections as inactive for shop ${shop}`,
      );
    }
    async handleProductWebhook(event, shop, payload) {
      const merchantId = await this.getMerchantIdByShop(shop);
      if (!merchantId) {
        this.logger.warn(`No merchant found for shop ${shop}`);
        return;
      }
      switch (event) {
        case 'create':
          this.logger.log(`Product created: ${payload.title} (${payload.id})`);
          break;
        case 'update':
          this.logger.log(`Product updated: ${payload.title} (${payload.id})`);
          break;
        case 'delete':
          this.logger.log(`Product deleted: ${payload.id}`);
          break;
        default:
          this.logger.warn(`Unhandled product event: ${event}`);
      }
    }
    async handleOrderWebhook(event, shop, payload) {
      const merchantId = await this.getMerchantIdByShop(shop);
      if (!merchantId) {
        this.logger.warn(`No merchant found for shop ${shop}`);
        return;
      }
      switch (event) {
        case 'create':
          this.logger.log(`Order created: ${payload.name} (${payload.id})`);
          break;
        case 'updated':
          this.logger.log(`Order updated: ${payload.name} (${payload.id})`);
          break;
        case 'cancelled':
          this.logger.log(`Order cancelled: ${payload.name} (${payload.id})`);
          break;
        case 'fulfilled':
          this.logger.log(`Order fulfilled: ${payload.name} (${payload.id})`);
          break;
        case 'paid':
          this.logger.log(`Order paid: ${payload.name} (${payload.id})`);
          break;
        case 'partially_fulfilled':
          this.logger.log(`Order partially fulfilled: ${payload.name} (${payload.id})`);
          break;
        default:
          this.logger.warn(`Unhandled order event: ${event}`);
      }
    }
    async handleCustomerWebhook(event, shop, payload) {
      const merchantId = await this.getMerchantIdByShop(shop);
      if (!merchantId) {
        this.logger.warn(`No merchant found for shop ${shop}`);
        return;
      }
      switch (event) {
        case 'create':
          this.logger.log(
            `Customer created: ${payload.first_name} ${payload.last_name} (${payload.id})`,
          );
          break;
        case 'update':
          this.logger.log(
            `Customer updated: ${payload.first_name} ${payload.last_name} (${payload.id})`,
          );
          break;
        case 'delete':
          this.logger.log(`Customer deleted: ${payload.id}`);
          break;
        case 'email_marketing_consent_update':
          this.logger.log(`Customer email marketing consent updated: ${payload.id}`);
          break;
        case 'marketing_consent_update':
          this.logger.log(`Customer marketing consent updated: ${payload.id}`);
          break;
        case 'purchasing_summary':
          this.logger.log(`Customer purchasing summary updated: ${payload.id}`);
          break;
        default:
          this.logger.warn(`Unhandled customer event: ${event}`);
      }
    }
    async handleCustomerTagsWebhook(event, shop, payload) {
      const merchantId = await this.getMerchantIdByShop(shop);
      if (!merchantId) {
        this.logger.warn(`No merchant found for shop ${shop}`);
        return;
      }
      switch (event) {
        case 'added':
          this.logger.log(`Tags added to customer: ${payload.customer_id}`);
          break;
        case 'removed':
          this.logger.log(`Tags removed from customer: ${payload.customer_id}`);
          break;
        default:
          this.logger.warn(`Unhandled customer tags event: ${event}`);
      }
    }
    async handleFulfillmentWebhook(event, shop, payload) {
      const merchantId = await this.getMerchantIdByShop(shop);
      if (!merchantId) {
        this.logger.warn(`No merchant found for shop ${shop}`);
        return;
      }
      switch (event) {
        case 'create':
          this.logger.log(`Fulfillment created: ${payload.id} for order ${payload.order_id}`);
          await this.recordFulfillmentEvent(merchantId, 'create', payload);
          break;
        case 'update':
          this.logger.log(`Fulfillment updated: ${payload.id} for order ${payload.order_id}`);
          await this.recordFulfillmentEvent(merchantId, 'update', payload);
          break;
        case 'hold':
          this.logger.log(`Fulfillment hold created: ${payload.id} for order ${payload.order_id}`);
          await this.recordFulfillmentEvent(merchantId, 'hold', payload);
          break;
        case 'hold_released':
          this.logger.log(`Fulfillment hold released: ${payload.id} for order ${payload.order_id}`);
          await this.recordFulfillmentEvent(merchantId, 'hold_released', payload);
          break;
        case 'cancellation_request':
          this.logger.log(
            `Fulfillment cancellation requested: ${payload.id} for order ${payload.order_id}`,
          );
          await this.recordFulfillmentEvent(merchantId, 'cancellation_request', payload);
          break;
        case 'cancellation_request_approved':
          this.logger.log(
            `Fulfillment cancellation approved: ${payload.id} for order ${payload.order_id}`,
          );
          await this.recordFulfillmentEvent(merchantId, 'cancellation_request_approved', payload);
          break;
        case 'cancellation_request_rejected':
          this.logger.log(
            `Fulfillment cancellation rejected: ${payload.id} for order ${payload.order_id}`,
          );
          await this.recordFulfillmentEvent(merchantId, 'cancellation_request_rejected', payload);
          break;
        case 'rescheduled':
          this.logger.log(`Fulfillment rescheduled: ${payload.id} for order ${payload.order_id}`);
          await this.recordFulfillmentEvent(merchantId, 'rescheduled', payload);
          break;
        default:
          this.logger.warn(`Unhandled fulfillment event: ${event}`);
      }
    }
    async handleCustomerMarketingConsentWebhook(event, shop, payload) {
      const merchantId = await this.getMerchantIdByShop(shop);
      if (!merchantId) {
        this.logger.warn(`No merchant found for shop ${shop}`);
        return;
      }
      switch (event) {
        case 'update':
          this.logger.log(`Customer marketing consent updated for customer ${payload.customer_id}`);
          break;
        default:
          this.logger.warn(`Unhandled customer marketing consent event: ${event}`);
      }
    }
    async handleFulfillmentHoldWebhook(event, shop, payload) {
      const merchantId = await this.getMerchantIdByShop(shop);
      if (!merchantId) {
        this.logger.warn(`No merchant found for shop ${shop}`);
        return;
      }
      switch (event) {
        case 'create':
          this.logger.log(`Fulfillment hold created: ${payload.id} for order ${payload.order_id}`);
          await this.recordFulfillmentEvent(merchantId, 'hold_created', payload);
          break;
        case 'release':
          this.logger.log(`Fulfillment hold released: ${payload.id} for order ${payload.order_id}`);
          await this.recordFulfillmentEvent(merchantId, 'hold_released', payload);
          break;
        default:
          this.logger.warn(`Unhandled fulfillment hold event: ${event}`);
      }
    }
    async handleBulkOperationWebhook(event, shop, payload) {
      const merchantId = await this.getMerchantIdByShop(shop);
      if (!merchantId) {
        this.logger.warn(`No merchant found for shop ${shop}`);
        return;
      }
      switch (event) {
        case 'finish':
          this.logger.log(`Bulk operation finished: ${payload.id}`);
          break;
        case 'error':
          this.logger.error(`Bulk operation error: ${payload.id}`, payload.error_code);
          break;
        default:
          this.logger.warn(`Unhandled bulk operation event: ${event}`);
      }
    }
    async recordFulfillmentEvent(merchantId, eventType, _payload) {
      try {
        this.logger.log(`Recording fulfillment event: ${eventType} for merchant ${merchantId}`);
      } catch (error) {
        this.logger.error(`Failed to record fulfillment event: ${eventType}`, error);
      }
    }
    async recordWebhookEvent(shop, topic, webhookId, payload) {
      try {
        this.logger.debug(`Recording webhook event ${webhookId}: ${topic} for shop ${shop}`);
        const minimalPayload = {
          id: payload.id,
          shop: shop,
          topic: topic,
          webhook_id: webhookId,
          received_at: new Date().toISOString(),
        };
        this.logger.debug('Webhook metadata:', minimalPayload);
      } catch (error) {
        this.logger.error(`Failed to record webhook event`, error);
      }
    }
    async recordWebhookFailure(shop, topic, webhookId, error) {
      try {
        this.logger.error(`Recording webhook failure ${webhookId}: ${topic} for shop ${shop}`);
        const errorInfo = {
          webhook_id: webhookId,
          shop: shop,
          topic: topic,
          error_message: error instanceof Error ? error.message : String(error),
          error_time: new Date().toISOString(),
          retry_count: 0,
        };
        this.logger.error('Webhook failure details:', errorInfo);
      } catch (recordError) {
        this.logger.error(`Failed to record webhook failure`, recordError);
      }
    }
    async handleInventoryWebhook(event, shop, payload) {
      const merchantId = await this.getMerchantIdByShop(shop);
      if (!merchantId) {
        this.logger.warn(`No merchant found for shop ${shop}`);
        return;
      }
      switch (event) {
        case 'update':
          this.logger.log(
            `Inventory updated: Item ${payload.inventory_item_id} at location ${payload.location_id} to ${payload.available}`,
          );
          break;
        case 'connect':
          this.logger.log(
            `Inventory connected: Item ${payload.inventory_item_id} at location ${payload.location_id}`,
          );
          break;
        case 'disconnect':
          this.logger.log(
            `Inventory disconnected: Item ${payload.inventory_item_id} at location ${payload.location_id}`,
          );
          break;
        default:
          this.logger.warn(`Unhandled inventory event: ${event}`);
      }
    }
    formatTopicFromGraphQL(topic) {
      return topic.toLowerCase().replace('_', '/');
    }
    async getMerchantIdByShop(shop) {
      const connection = await this.merchantPlatformConnectionRepository.findOne({
        where: {
          platformType: platform_type_enum_1.PlatformType.SHOPIFY,
          platformIdentifier: shop,
          isActive: true,
        },
      });
      return connection ? connection.merchantId : null;
    }
    isValidShopDomain(shop) {
      const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/;
      return shopRegex.test(shop);
    }
    safeCompare(a, b) {
      try {
        return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
      } catch (error) {
        const aBuffer = Buffer.from(a);
        const bBuffer = Buffer.from(b);
        const len = Math.max(aBuffer.length, bBuffer.length);
        const aPadded = Buffer.alloc(len, 0);
        const bPadded = Buffer.alloc(len, 0);
        aBuffer.copy(aPadded);
        bBuffer.copy(bPadded);
        return crypto.timingSafeEqual(aPadded, bPadded);
      }
    }
  });
exports.ShopifyWebhookEnhancedService = ShopifyWebhookEnhancedService;
exports.ShopifyWebhookEnhancedService =
  ShopifyWebhookEnhancedService =
  ShopifyWebhookEnhancedService_1 =
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
          shopify_auth_enhanced_service_1.ShopifyAuthEnhancedService,
        ]),
      ],
      ShopifyWebhookEnhancedService,
    );
//# sourceMappingURL=shopify-webhook-enhanced.service.js.map
