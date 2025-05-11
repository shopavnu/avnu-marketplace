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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
var ShopifyService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ShopifyService = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const products_service_1 = require('../../products/products.service');
const axios_1 = __importDefault(require('axios'));
let ShopifyService = (ShopifyService_1 = class ShopifyService {
  constructor(configService, productsService) {
    this.configService = configService;
    this.productsService = productsService;
    this.logger = new common_1.Logger(ShopifyService_1.name);
  }
  async authenticate(shopDomain, apiKey, apiSecret, accessToken) {
    try {
      const response = await axios_1.default.get(
        `https://${shopDomain}/admin/api/2023-07/shop.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken,
          },
        },
      );
      return response.status === 200;
    } catch (error) {
      this.logger.error(`Failed to authenticate with Shopify: ${error.message}`);
      return false;
    }
  }
  async fetchProducts(shopDomain, accessToken, _merchantId, limit = 50, sinceId) {
    try {
      let url = `https://${shopDomain}/admin/api/2023-07/products.json?limit=${limit}`;
      if (sinceId) {
        url += `&since_id=${sinceId}`;
      }
      const response = await axios_1.default.get(url, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      });
      return response.data.products;
    } catch (error) {
      this.logger.error(`Failed to fetch Shopify products: ${error.message}`);
      throw error;
    }
  }
  async syncProducts(shopDomain, accessToken, _merchantId) {
    let sinceId;
    let hasMore = true;
    let created = 0;
    let updated = 0;
    let failed = 0;
    try {
      while (hasMore) {
        const shopifyProducts = await this.fetchProducts(
          shopDomain,
          accessToken,
          _merchantId,
          50,
          sinceId,
        );
        if (shopifyProducts.length === 0) {
          hasMore = false;
          continue;
        }
        sinceId = shopifyProducts[shopifyProducts.length - 1].id.toString();
        for (const shopifyProduct of shopifyProducts) {
          try {
            try {
              const existingProduct = await this.productsService.findByExternalId(
                shopifyProduct.id.toString(),
                'shopify',
              );
              const updateDto = this.mapShopifyProductToUpdateDto(shopifyProduct, _merchantId);
              await this.productsService.update(existingProduct.id, updateDto);
              updated++;
            } catch (error) {
              const createDto = this.mapShopifyProductToCreateDto(shopifyProduct, _merchantId);
              await this.productsService.create(createDto);
              created++;
            }
          } catch (error) {
            this.logger.error(
              `Failed to sync Shopify product ${shopifyProduct.id}: ${error.message}`,
            );
            failed++;
          }
        }
        if (shopifyProducts.length < 50) {
          hasMore = false;
        }
      }
      return { created, updated, failed };
    } catch (error) {
      this.logger.error(`Failed to sync Shopify products: ${error.message}`);
      throw error;
    }
  }
  mapShopifyProductToCreateDto(shopifyProduct, merchantId) {
    const images = shopifyProduct.images.map(img => img.src);
    return {
      title: shopifyProduct.title,
      description: shopifyProduct.body_html || '',
      price: parseFloat(shopifyProduct.variants[0]?.price || '0'),
      compareAtPrice: shopifyProduct.variants[0]?.compare_at_price
        ? parseFloat(shopifyProduct.variants[0].compare_at_price)
        : undefined,
      images: images,
      thumbnail: images[0] || '',
      categories: shopifyProduct.product_type ? [shopifyProduct.product_type] : ['Uncategorized'],
      tags: shopifyProduct.tags ? shopifyProduct.tags.split(',').map(tag => tag.trim()) : [],
      brandName: shopifyProduct.vendor || 'Unknown',
      isActive: shopifyProduct.status === 'active',
      inStock: shopifyProduct.variants[0]?.inventory_quantity > 0,
      quantity: shopifyProduct.variants[0]?.inventory_quantity || 0,
      values: [],
      externalId: shopifyProduct.id.toString(),
      externalSource: 'shopify',
      merchantId,
    };
  }
  mapShopifyProductToUpdateDto(shopifyProduct, _merchantId) {
    const images = shopifyProduct.images.map(img => img.src);
    return {
      title: shopifyProduct.title,
      description: shopifyProduct.body_html || '',
      price: parseFloat(shopifyProduct.variants[0]?.price || '0'),
      compareAtPrice: shopifyProduct.variants[0]?.compare_at_price
        ? parseFloat(shopifyProduct.variants[0].compare_at_price)
        : undefined,
      images: images,
      thumbnail: images[0] || '',
      categories: shopifyProduct.product_type ? [shopifyProduct.product_type] : ['Uncategorized'],
      tags: shopifyProduct.tags ? shopifyProduct.tags.split(',').map(tag => tag.trim()) : [],
      brandName: shopifyProduct.vendor || 'Unknown',
      isActive: shopifyProduct.status === 'active',
      inStock: shopifyProduct.variants[0]?.inventory_quantity > 0,
      quantity: shopifyProduct.variants[0]?.inventory_quantity || 0,
    };
  }
  async handleWebhook(payload, topic, merchantId) {
    this.logger.log(`Received Shopify webhook: ${topic}`);
    try {
      switch (topic) {
        case 'products/create':
          await this.handleProductCreate(payload, merchantId);
          break;
        case 'products/update':
          await this.handleProductUpdate(payload, merchantId);
          break;
        case 'products/delete':
          await this.handleProductDelete(payload);
          break;
        default:
          this.logger.log(`Unhandled webhook topic: ${topic}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle Shopify webhook: ${error.message}`);
      throw error;
    }
  }
  async handleProductCreate(payload, merchantId) {
    try {
      const createDto = this.mapShopifyProductToCreateDto(payload, merchantId);
      await this.productsService.create(createDto);
    } catch (error) {
      this.logger.error(`Failed to handle product create webhook: ${error.message}`);
      throw error;
    }
  }
  async handleProductUpdate(payload, merchantId) {
    try {
      const existingProduct = await this.productsService.findByExternalId(
        payload.id.toString(),
        'shopify',
      );
      const updateDto = this.mapShopifyProductToUpdateDto(payload, merchantId);
      await this.productsService.update(existingProduct.id, updateDto);
    } catch (error) {
      this.logger.error(`Failed to handle product update webhook: ${error.message}`);
      throw error;
    }
  }
  async handleProductDelete(payload) {
    try {
      const existingProduct = await this.productsService.findByExternalId(
        payload.id.toString(),
        'shopify',
      );
      await this.productsService.remove(existingProduct.id);
    } catch (error) {
      this.logger.error(`Failed to handle product delete webhook: ${error.message}`);
      throw error;
    }
  }
  async syncProductsPlaceholder(_merchantId) {
    this.logger.warn(`Product sync not yet implemented for Shopify merchant ${_merchantId}`);
    return { status: 'pending', message: 'Sync not implemented' };
  }
  async syncOrdersPlaceholder(_merchantId) {
    this.logger.warn(`Order sync not yet implemented for Shopify merchant ${_merchantId}`);
    return { status: 'pending', message: 'Sync not implemented' };
  }
  async fetchOrders(_merchantId, options) {
    this.logger.log(`Fetching orders with options: ${JSON.stringify(options)}`);
    return [];
  }
});
exports.ShopifyService = ShopifyService;
exports.ShopifyService =
  ShopifyService =
  ShopifyService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          config_1.ConfigService,
          products_service_1.ProductsService,
        ]),
      ],
      ShopifyService,
    );
//# sourceMappingURL=shopify.service.js.map
