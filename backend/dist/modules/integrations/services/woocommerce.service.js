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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
var WooCommerceService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.WooCommerceService = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const products_service_1 = require('../../products/products.service');
const axios_1 = __importDefault(require('axios'));
const oauth_1_0a_1 = __importDefault(require('oauth-1.0a'));
const crypto = __importStar(require('crypto'));
let WooCommerceService = (WooCommerceService_1 = class WooCommerceService {
  constructor(configService, productsService) {
    this.configService = configService;
    this.productsService = productsService;
    this.logger = new common_1.Logger(WooCommerceService_1.name);
  }
  createOAuth(storeUrl, consumerKey, consumerSecret) {
    return new oauth_1_0a_1.default({
      consumer: {
        key: consumerKey,
        secret: consumerSecret,
      },
      signature_method: 'HMAC-SHA256',
      hash_function(base_string, key) {
        return crypto.createHmac('sha256', key).update(base_string).digest('base64');
      },
    });
  }
  async authenticate(storeUrl, consumerKey, consumerSecret) {
    try {
      const oauth = this.createOAuth(storeUrl, consumerKey, consumerSecret);
      const requestData = {
        url: `${storeUrl}/wp-json/wc/v3/products`,
        method: 'GET',
      };
      const headers = oauth.toHeader(oauth.authorize(requestData));
      const response = await (0, axios_1.default)({
        url: requestData.url,
        method: requestData.method,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        params: {
          per_page: 1,
        },
      });
      return response.status === 200;
    } catch (error) {
      this.logger.error(`Failed to authenticate with WooCommerce: ${error.message}`);
      return false;
    }
  }
  async fetchProducts(storeUrl, consumerKey, consumerSecret, merchantId, page = 1, perPage = 50) {
    try {
      const oauth = this.createOAuth(storeUrl, consumerKey, consumerSecret);
      const requestData = {
        url: `${storeUrl}/wp-json/wc/v3/products`,
        method: 'GET',
      };
      const headers = oauth.toHeader(oauth.authorize(requestData));
      const response = await (0, axios_1.default)({
        url: requestData.url,
        method: requestData.method,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        params: {
          page,
          per_page: perPage,
        },
      });
      this.logger.debug(`WooCommerce fetchProducts response: ${response.status}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        this.logger.warn(
          `Bad request fetching products page ${page} for merchant ${merchantId}: ${error.response.data?.message || error.message}`,
        );
        return [];
      }
      this.logger.error(
        `Failed to fetch products page ${page} for merchant ${merchantId}: ${error.message}`,
      );
      throw error;
    }
  }
  async syncProducts(storeUrl, consumerKey, consumerSecret, merchantId) {
    let page = 1;
    let hasMore = true;
    let created = 0;
    let updated = 0;
    let failed = 0;
    try {
      while (hasMore) {
        const wooProducts = await this.fetchProducts(
          storeUrl,
          consumerKey,
          consumerSecret,
          merchantId,
          page,
          50,
        );
        if (wooProducts.length === 0) {
          hasMore = false;
          continue;
        }
        for (const wooProduct of wooProducts) {
          try {
            try {
              const existingProduct = await this.productsService.findByExternalId(
                wooProduct.id.toString(),
                'woocommerce',
              );
              const updateDto = this.mapWooProductToUpdateDto(wooProduct, merchantId);
              await this.productsService.update(existingProduct.id, updateDto);
              updated++;
            } catch (error) {
              const createDto = this.mapWooProductToCreateDto(wooProduct, merchantId);
              await this.productsService.create(createDto);
              created++;
            }
          } catch (error) {
            this.logger.error(
              `Failed to sync WooCommerce product ${wooProduct.id}: ${error.message}`,
            );
            failed++;
          }
        }
        if (wooProducts.length < 50) {
          hasMore = false;
        } else {
          page++;
        }
      }
      return { created, updated, failed };
    } catch (error) {
      this.logger.error(`Failed to sync WooCommerce products: ${error.message}`);
      throw error;
    }
  }
  mapWooProductToCreateDto(wooProduct, merchantId) {
    const images = wooProduct.images.map(img => img.src);
    return {
      title: wooProduct.name,
      description: wooProduct.description,
      price: parseFloat(wooProduct.price || '0'),
      compareAtPrice: parseFloat(wooProduct.regular_price || '0'),
      images,
      thumbnail: images[0] || '',
      categories: wooProduct.categories.map(cat => cat.name),
      tags: wooProduct.tags.map(tag => tag.name),
      merchantId,
      brandName: this.extractBrandFromAttributes(wooProduct.attributes) || 'Unknown',
      isActive: wooProduct.status === 'publish',
      inStock: wooProduct.stock_status === 'instock',
      quantity: wooProduct.stock_quantity || 0,
      values: this.extractValuesFromAttributes(wooProduct.attributes),
      externalId: wooProduct.id.toString(),
      externalSource: 'woocommerce',
    };
  }
  mapWooProductToUpdateDto(wooProduct, _merchantId) {
    const images = wooProduct.images.map(img => img.src);
    return {
      title: wooProduct.name,
      description: wooProduct.description,
      price: parseFloat(wooProduct.price || '0'),
      compareAtPrice: parseFloat(wooProduct.regular_price || '0'),
      images,
      thumbnail: images[0] || '',
      categories: wooProduct.categories.map(cat => cat.name),
      tags: wooProduct.tags.map(tag => tag.name),
      brandName: this.extractBrandFromAttributes(wooProduct.attributes) || 'Unknown',
      isActive: wooProduct.status === 'publish',
      inStock: wooProduct.stock_status === 'instock',
      quantity: wooProduct.stock_quantity || 0,
      values: this.extractValuesFromAttributes(wooProduct.attributes),
    };
  }
  extractBrandFromAttributes(attributes) {
    if (!attributes || !Array.isArray(attributes)) {
      return undefined;
    }
    const brandAttribute = attributes.find(
      attr => attr.name.toLowerCase() === 'brand' || attr.name.toLowerCase() === 'manufacturer',
    );
    return brandAttribute ? brandAttribute.options[0] : undefined;
  }
  extractValuesFromAttributes(attributes) {
    if (!attributes || !Array.isArray(attributes)) {
      return [];
    }
    const valueAttributes = attributes.filter(
      attr =>
        attr.name.toLowerCase() === 'values' ||
        attr.name.toLowerCase() === 'sustainability' ||
        attr.name.toLowerCase() === 'ethical',
    );
    if (valueAttributes.length === 0) {
      return [];
    }
    return valueAttributes.flatMap(attr => attr.options);
  }
  async handleWebhook(payload, topic, merchantId) {
    this.logger.log(`Received WooCommerce webhook: ${topic}`);
    try {
      switch (topic) {
        case 'product.created':
          await this.handleProductCreate(payload, merchantId);
          break;
        case 'product.updated':
          await this.handleProductUpdate(payload, merchantId);
          break;
        case 'product.deleted':
          await this.handleProductDelete(payload);
          break;
        default:
          this.logger.log(`Unhandled webhook topic: ${topic}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle WooCommerce webhook: ${error.message}`);
      throw error;
    }
  }
  async handleProductCreate(payload, merchantId) {
    try {
      const createDto = this.mapWooProductToCreateDto(payload, merchantId);
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
        'woocommerce',
      );
      const updateDto = this.mapWooProductToUpdateDto(payload, merchantId);
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
        'woocommerce',
      );
      await this.productsService.remove(existingProduct.id);
    } catch (error) {
      this.logger.error(`Failed to handle product delete webhook: ${error.message}`);
      throw error;
    }
  }
  async syncProductsPlaceholder(_merchantId) {
    this.logger.warn(`Product sync not yet implemented for WooCommerce merchant ${_merchantId}`);
    return { status: 'pending', message: 'Sync not implemented' };
  }
  async syncOrdersPlaceholder(_merchantId) {
    this.logger.warn(`Order sync not yet implemented for WooCommerce merchant ${_merchantId}`);
    return { status: 'pending', message: 'Sync not implemented' };
  }
});
exports.WooCommerceService = WooCommerceService;
exports.WooCommerceService =
  WooCommerceService =
  WooCommerceService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          config_1.ConfigService,
          products_service_1.ProductsService,
        ]),
      ],
      WooCommerceService,
    );
//# sourceMappingURL=woocommerce.service.js.map
