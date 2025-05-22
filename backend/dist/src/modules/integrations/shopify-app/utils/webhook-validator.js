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
var ShopifyWebhookValidator_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ShopifyWebhookValidator = void 0;
const crypto = __importStar(require('crypto'));
const common_1 = require('@nestjs/common');
const common_2 = require('@nestjs/common');
const shopify_config_1 = require('../config/shopify.config');
let ShopifyWebhookValidator = (ShopifyWebhookValidator_1 = class ShopifyWebhookValidator {
  constructor(config) {
    this.config = config;
    this.logger = new common_1.Logger(ShopifyWebhookValidator_1.name);
  }
  validateWebhook(hmac, body) {
    if (!hmac || !body) {
      this.logger.warn('Missing HMAC or request body');
      return false;
    }
    try {
      const generatedHash = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(body, 'utf8')
        .digest('base64');
      return crypto.timingSafeEqual(Buffer.from(generatedHash), Buffer.from(hmac));
    } catch (error) {
      this.logger.error(
        `Webhook validation error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }
  logValidationResult(isValid, topic, shopDomain) {
    if (isValid) {
      this.logger.log(`Valid webhook received for topic ${topic} from shop ${shopDomain}`);
    } else {
      this.logger.warn(
        `Invalid webhook attempt for topic ${topic} claiming to be from ${shopDomain}`,
      );
    }
  }
});
exports.ShopifyWebhookValidator = ShopifyWebhookValidator;
exports.ShopifyWebhookValidator =
  ShopifyWebhookValidator =
  ShopifyWebhookValidator_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, common_2.Inject)(shopify_config_1.shopifyConfig.KEY)),
        __metadata('design:paramtypes', [void 0]),
      ],
      ShopifyWebhookValidator,
    );
//# sourceMappingURL=webhook-validator.js.map
