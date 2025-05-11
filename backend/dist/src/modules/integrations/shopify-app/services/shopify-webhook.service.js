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
var ShopifyWebhookService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ShopifyWebhookService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const merchant_platform_connection_entity_1 = require('../../entities/merchant-platform-connection.entity');
const platform_type_enum_1 = require('../../enums/platform-type.enum');
const crypto = __importStar(require('crypto'));
let ShopifyWebhookService = (ShopifyWebhookService_1 = class ShopifyWebhookService {
  constructor(merchantPlatformConnectionRepository) {
    this.merchantPlatformConnectionRepository = merchantPlatformConnectionRepository;
    this.logger = new common_1.Logger(ShopifyWebhookService_1.name);
    this.apiSecret = process.env['SHOPIFY_API_SECRET'] || 'your-api-secret';
  }
  async verifyWebhook(hmac, body) {
    try {
      const calculatedHmac = crypto
        .createHmac('sha256', this.apiSecret)
        .update(body, 'utf8')
        .digest('base64');
      return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(calculatedHmac));
    } catch (error) {
      this.logger.error(
        `Error verifying webhook: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }
  async getConnectionByShopDomain(shopDomain) {
    try {
      return await this.merchantPlatformConnectionRepository.findOne({
        where: {
          platformStoreName: shopDomain,
          platformType: platform_type_enum_1.PlatformType.SHOPIFY,
          isActive: true,
        },
      });
    } catch (error) {
      this.logger.error(
        `Error getting connection for shop ${shopDomain}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }
  async handleWebhook(topic, shop, data) {
    try {
      this.logger.log(`Processing ${topic} webhook from ${shop}`);
      const connection = await this.getConnectionByShopDomain(shop);
      if (!connection) {
        this.logger.warn(`No connection found for shop ${shop}, can't process webhook`);
        return;
      }
      connection.lastSyncedAt = new Date();
      await this.merchantPlatformConnectionRepository.save(connection);
      switch (topic) {
        case 'products/create':
          await this.handleProductCreate(connection, data);
          break;
        case 'products/update':
          await this.handleProductUpdate(connection, data);
          break;
        case 'products/delete':
          await this.handleProductDelete(connection, data);
          break;
        case 'orders/create':
          await this.handleOrderCreate(connection, data);
          break;
        case 'orders/updated':
          await this.handleOrderUpdate(connection, data);
          break;
        case 'orders/cancelled':
          await this.handleOrderCancel(connection, data);
          break;
        case 'app/uninstalled':
          await this.handleAppUninstalled(connection);
          break;
        default:
          this.logger.warn(`Unhandled webhook topic: ${topic}`);
      }
    } catch (error) {
      this.logger.error(
        `Error handling webhook: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  async handleProductCreate(connection, data) {
    this.logger.log(`Product created: ${data.id} for shop ${connection.platformStoreName}`);
  }
  async handleProductUpdate(connection, data) {
    this.logger.log(`Product updated: ${data.id} for shop ${connection.platformStoreName}`);
  }
  async handleProductDelete(connection, data) {
    this.logger.log(`Product deleted: ${data.id} for shop ${connection.platformStoreName}`);
  }
  async handleOrderCreate(connection, data) {
    this.logger.log(`Order created: ${data.id} for shop ${connection.platformStoreName}`);
  }
  async handleOrderUpdate(connection, data) {
    this.logger.log(`Order updated: ${data.id} for shop ${connection.platformStoreName}`);
  }
  async handleOrderCancel(connection, data) {
    this.logger.log(`Order cancelled: ${data.id} for shop ${connection.platformStoreName}`);
  }
  async handleAppUninstalled(connection) {
    connection.isActive = false;
    await this.merchantPlatformConnectionRepository.save(connection);
    this.logger.log(`App uninstalled for shop ${connection.platformStoreName}`);
  }
});
exports.ShopifyWebhookService = ShopifyWebhookService;
exports.ShopifyWebhookService =
  ShopifyWebhookService =
  ShopifyWebhookService_1 =
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
      ShopifyWebhookService,
    );
//# sourceMappingURL=shopify-webhook.service.js.map
