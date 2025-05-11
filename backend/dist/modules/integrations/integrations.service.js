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
var IntegrationsService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.IntegrationsService = void 0;
const common_1 = require('@nestjs/common');
const shopify_service_1 = require('./services/shopify.service');
const woocommerce_service_1 = require('./services/woocommerce.service');
let IntegrationsService = (IntegrationsService_1 = class IntegrationsService {
  constructor(shopifyService, wooCommerceService) {
    this.shopifyService = shopifyService;
    this.wooCommerceService = wooCommerceService;
    this.logger = new common_1.Logger(IntegrationsService_1.name);
  }
  async authenticate(type, credentials) {
    try {
      switch (type) {
        case 'shopify':
          if (!credentials.shopify) {
            throw new Error('Shopify credentials are required');
          }
          return this.shopifyService.authenticate(
            credentials.shopify.shopDomain,
            credentials.shopify.apiKey,
            credentials.shopify.apiSecret,
            credentials.shopify.accessToken,
          );
        case 'woocommerce':
          if (!credentials.woocommerce) {
            throw new Error('WooCommerce credentials are required');
          }
          return this.wooCommerceService.authenticate(
            credentials.woocommerce.storeUrl,
            credentials.woocommerce.consumerKey,
            credentials.woocommerce.consumerSecret,
          );
        default:
          throw new Error(`Unsupported integration type: ${type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to authenticate with ${type}: ${error.message}`);
      return false;
    }
  }
  async syncProducts(type, credentials, merchantId) {
    try {
      switch (type) {
        case 'shopify':
          if (!credentials.shopify) {
            throw new Error('Shopify credentials are required');
          }
          return this.shopifyService.syncProducts(
            credentials.shopify.shopDomain,
            credentials.shopify.accessToken,
            merchantId,
          );
        case 'woocommerce':
          if (!credentials.woocommerce) {
            throw new Error('WooCommerce credentials are required');
          }
          return this.wooCommerceService.syncProducts(
            credentials.woocommerce.storeUrl,
            credentials.woocommerce.consumerKey,
            credentials.woocommerce.consumerSecret,
            merchantId,
          );
        default:
          throw new Error(`Unsupported integration type: ${type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to sync products from ${type}: ${error.message}`);
      throw error;
    }
  }
  async handleWebhook(type, payload, topic, merchantId) {
    try {
      switch (type) {
        case 'shopify':
          return this.shopifyService.handleWebhook(payload, topic, merchantId);
        case 'woocommerce':
          return this.wooCommerceService.handleWebhook(payload, topic, merchantId);
        default:
          throw new Error(`Unsupported integration type: ${type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle webhook from ${type}: ${error.message}`);
      throw error;
    }
  }
});
exports.IntegrationsService = IntegrationsService;
exports.IntegrationsService =
  IntegrationsService =
  IntegrationsService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          shopify_service_1.ShopifyService,
          woocommerce_service_1.WooCommerceService,
        ]),
      ],
      IntegrationsService,
    );
//# sourceMappingURL=integrations.service.js.map
