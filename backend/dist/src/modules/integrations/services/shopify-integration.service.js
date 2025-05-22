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
var ShopifyIntegrationService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ShopifyIntegrationService = void 0;
const common_1 = require('@nestjs/common');
const event_emitter_1 = require('@nestjs/event-emitter');
const uuid_1 = require('uuid');
const shopify_app_service_1 = require('../shopify-app/services/shopify-app.service');
const shared_1 = require('../../shared');
let ShopifyIntegrationService = (ShopifyIntegrationService_1 = class ShopifyIntegrationService {
  constructor(eventEmitter, shopifyService) {
    this.eventEmitter = eventEmitter;
    this.shopifyService = shopifyService;
    this.logger = new common_1.Logger(ShopifyIntegrationService_1.name);
  }
  processIncomingProduct(product, platformType, merchantId) {
    try {
      this.logger.debug(`Processing incoming Shopify product`);
      if (platformType !== shared_1.PlatformType.SHOPIFY) {
        throw new Error(`Expected Shopify product but received ${platformType}`);
      }
      return this.shopifyService.processIncomingProduct(product, platformType, merchantId);
    } catch (error) {
      this.logger.error(
        `Error processing incoming Shopify product: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
  prepareOutgoingProduct(product, platformType) {
    try {
      this.logger.debug(`Preparing outgoing product for Shopify`);
      if (platformType !== shared_1.PlatformType.SHOPIFY) {
        throw new Error(`Expected Shopify platform but received ${platformType}`);
      }
      return this.shopifyService.prepareOutgoingProduct(product, platformType);
    } catch (error) {
      this.logger.error(
        `Error preparing outgoing Shopify product: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
  async getProduct(productId, merchantId) {
    try {
      this.logger.debug(`Getting product ${productId} from Shopify for merchant ${merchantId}`);
      const product = await this.shopifyService.getProduct(productId, merchantId);
      const event = {
        eventId: (0, uuid_1.v4)(),
        timestamp: new Date(),
        platformType: shared_1.PlatformType.SHOPIFY,
        merchantId,
        externalProductId: productId,
        internalProductId: 'unknown',
        productData: product,
        origin: 'marketplace',
        status: 'success',
      };
      this.eventEmitter.emit(shared_1.INTEGRATION_EVENTS.PRODUCT_IMPORTED, event);
      return product;
    } catch (error) {
      this.logger.error(
        `Error getting product from Shopify: ${error instanceof Error ? error.message : String(error)}`,
      );
      const event = {
        eventId: (0, uuid_1.v4)(),
        timestamp: new Date(),
        platformType: shared_1.PlatformType.SHOPIFY,
        merchantId,
        externalProductId: productId,
        internalProductId: 'unknown',
        productData: null,
        origin: 'marketplace',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : String(error),
      };
      this.eventEmitter.emit(shared_1.INTEGRATION_EVENTS.PRODUCT_IMPORTED, event);
      throw error;
    }
  }
  async createProduct(productData, merchantId) {
    try {
      this.logger.debug(`Creating product on Shopify for merchant ${merchantId}`);
      const shopifyProductData = {
        ...productData,
        platformType: shared_1.PlatformType.SHOPIFY,
      };
      const createdProduct = await this.shopifyService.createProduct(
        shopifyProductData,
        merchantId,
      );
      const event = {
        eventId: (0, uuid_1.v4)(),
        timestamp: new Date(),
        platformType: shared_1.PlatformType.SHOPIFY,
        merchantId: merchantId || 'unknown',
        externalProductId: createdProduct.id || 'unknown',
        internalProductId: productData.id || 'unknown',
        productData: createdProduct,
        origin: 'marketplace',
        status: 'success',
      };
      this.eventEmitter.emit(shared_1.INTEGRATION_EVENTS.PRODUCT_EXPORTED, event);
      return createdProduct;
    } catch (error) {
      this.logger.error(
        `Error creating product on Shopify: ${error instanceof Error ? error.message : String(error)}`,
      );
      const event = {
        eventId: (0, uuid_1.v4)(),
        timestamp: new Date(),
        platformType: shared_1.PlatformType.SHOPIFY,
        merchantId,
        externalProductId: 'unknown',
        internalProductId: productData.id || 'unknown',
        productData: productData,
        origin: 'marketplace',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : String(error),
      };
      this.eventEmitter.emit(shared_1.INTEGRATION_EVENTS.PRODUCT_EXPORTED, event);
      throw error;
    }
  }
  async updateProduct(productId, productData, merchantId) {
    try {
      this.logger.debug(`Updating product ${productId} on Shopify for merchant ${merchantId}`);
      const shopifyProductData = {
        ...productData,
        platformType: shared_1.PlatformType.SHOPIFY,
      };
      const updatedProduct = await this.shopifyService.updateProduct(
        productId,
        shopifyProductData,
        merchantId,
      );
      const event = {
        eventId: (0, uuid_1.v4)(),
        timestamp: new Date(),
        platformType: shared_1.PlatformType.SHOPIFY,
        merchantId,
        externalProductId: productId,
        internalProductId: productData.id || 'unknown',
        updatedFields: Object.keys(productData),
        origin: 'marketplace',
        status: 'success',
      };
      this.eventEmitter.emit(shared_1.INTEGRATION_EVENTS.PRODUCT_UPDATED, event);
      return updatedProduct;
    } catch (error) {
      this.logger.error(
        `Error updating product on Shopify: ${error instanceof Error ? error.message : String(error)}`,
      );
      const event = {
        eventId: (0, uuid_1.v4)(),
        timestamp: new Date(),
        platformType: shared_1.PlatformType.SHOPIFY,
        merchantId,
        externalProductId: productId,
        internalProductId: productData.id || 'unknown',
        updatedFields: Object.keys(productData),
        origin: 'marketplace',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : String(error),
      };
      this.eventEmitter.emit(shared_1.INTEGRATION_EVENTS.PRODUCT_UPDATED, event);
      throw error;
    }
  }
  async deleteProduct(productId, merchantId) {
    try {
      this.logger.debug(`Deleting product ${productId} from Shopify for merchant ${merchantId}`);
      await this.shopifyService.deleteProduct(productId, merchantId);
      const event = {
        eventId: (0, uuid_1.v4)(),
        timestamp: new Date(),
        platformType: shared_1.PlatformType.SHOPIFY,
        merchantId,
        externalProductId: productId,
        internalProductId: 'unknown',
        origin: 'marketplace',
        status: 'success',
      };
      this.eventEmitter.emit(shared_1.INTEGRATION_EVENTS.PRODUCT_DELETED, event);
      return true;
    } catch (error) {
      this.logger.error(
        `Error deleting product from Shopify: ${error instanceof Error ? error.message : String(error)}`,
      );
      const event = {
        eventId: (0, uuid_1.v4)(),
        timestamp: new Date(),
        platformType: shared_1.PlatformType.SHOPIFY,
        merchantId,
        externalProductId: productId,
        internalProductId: 'unknown',
        origin: 'marketplace',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : String(error),
      };
      this.eventEmitter.emit(shared_1.INTEGRATION_EVENTS.PRODUCT_DELETED, event);
      return false;
    }
  }
  async syncProducts(merchantId) {
    try {
      this.logger.debug(`Syncing products from Shopify for merchant ${merchantId}`);
      return await this.shopifyService.syncProducts(merchantId);
    } catch (error) {
      this.logger.error(
        `Error syncing products from Shopify: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        created: 0,
        updated: 0,
        failed: 1,
        total: 1,
        errors: [error instanceof Error ? error.message : String(error)],
        success: false,
      };
    }
  }
  async syncOrders(merchantId) {
    try {
      this.logger.debug(`Syncing orders from Shopify for merchant ${merchantId}`);
      return await this.shopifyService.syncOrders(merchantId);
    } catch (error) {
      this.logger.error(
        `Error syncing orders from Shopify: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        created: 0,
        updated: 0,
        failed: 1,
        total: 1,
        errors: [error instanceof Error ? error.message : String(error)],
        success: false,
      };
    }
  }
  async handleWebhook(event, data, merchantId) {
    try {
      this.logger.debug(`Handling Shopify webhook event: ${event} for merchant ${merchantId}`);
      if (event.toLowerCase().includes('product')) {
        return await this.handleProductWebhook(event, data, merchantId);
      } else if (event.toLowerCase().includes('order')) {
        return await this.handleOrderWebhook(event, data, merchantId);
      } else {
        this.logger.warn(`Unsupported Shopify webhook event type: ${event}`);
        return false;
      }
    } catch (error) {
      this.logger.error(
        `Error handling Shopify webhook: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }
  async handleProductWebhook(event, data, merchantId) {
    try {
      this.logger.debug(`Handling Shopify product webhook: ${event}`);
      const webhookEvent = {
        eventId: (0, uuid_1.v4)(),
        timestamp: new Date(),
        platformType: shared_1.PlatformType.SHOPIFY,
        merchantId,
        eventType: event,
        eventData: data,
        status: 'received',
      };
      this.eventEmitter.emit(shared_1.INTEGRATION_EVENTS.WEBHOOK_RECEIVED, webhookEvent);
      if (event.toLowerCase().includes('create')) {
        const productDto = this.processIncomingProduct(
          data,
          shared_1.PlatformType.SHOPIFY,
          merchantId,
        );
        this.logger.debug(`Processed created product from Shopify webhook: ${productDto.name}`);
        return true;
      } else if (event.toLowerCase().includes('update')) {
        const productDto = this.processIncomingProduct(
          data,
          shared_1.PlatformType.SHOPIFY,
          merchantId,
        );
        this.logger.debug(`Processed updated product from Shopify webhook: ${productDto.name}`);
        return true;
      } else if (event.toLowerCase().includes('delete')) {
        const externalId = data.id?.toString() || 'unknown';
        this.logger.debug(`Processing deleted product from Shopify webhook: ${externalId}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(
        `Error handling Shopify product webhook: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }
  async handleOrderWebhook(event, data, merchantId) {
    try {
      this.logger.debug(`Handling Shopify order webhook: ${event}`);
      const webhookEvent = {
        eventId: (0, uuid_1.v4)(),
        timestamp: new Date(),
        platformType: shared_1.PlatformType.SHOPIFY,
        merchantId,
        eventType: event,
        eventData: data,
        status: 'received',
      };
      this.eventEmitter.emit(shared_1.INTEGRATION_EVENTS.WEBHOOK_RECEIVED, webhookEvent);
      this.logger.debug(`Processed order from Shopify webhook`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error handling Shopify order webhook: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }
});
exports.ShopifyIntegrationService = ShopifyIntegrationService;
exports.ShopifyIntegrationService =
  ShopifyIntegrationService =
  ShopifyIntegrationService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          event_emitter_1.EventEmitter2,
          shopify_app_service_1.ShopifyAppService,
        ]),
      ],
      ShopifyIntegrationService,
    );
//# sourceMappingURL=shopify-integration.service.js.map
