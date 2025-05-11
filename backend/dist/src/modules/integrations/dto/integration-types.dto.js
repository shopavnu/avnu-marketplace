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
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebhookRequestDto =
  exports.SyncProductsRequestDto =
  exports.AuthenticateRequestDto =
  exports.WooCommerceCredentialsDto =
  exports.ShopifyCredentialsDto =
  exports.BaseCredentialsDto =
  exports.IntegrationTypeParamDto =
  exports.IntegrationType =
    void 0;
const swagger_1 = require('@nestjs/swagger');
const class_validator_1 = require('class-validator');
const class_transformer_1 = require('class-transformer');
var IntegrationType;
(function (IntegrationType) {
  IntegrationType['SHOPIFY'] = 'shopify';
  IntegrationType['WOOCOMMERCE'] = 'woocommerce';
})(IntegrationType || (exports.IntegrationType = IntegrationType = {}));
class IntegrationTypeParamDto {}
exports.IntegrationTypeParamDto = IntegrationTypeParamDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Type of integration platform',
      enum: IntegrationType,
      example: IntegrationType.SHOPIFY,
    }),
    (0, class_validator_1.IsEnum)(IntegrationType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata('design:type', String),
  ],
  IntegrationTypeParamDto.prototype,
  'type',
  void 0,
);
class BaseCredentialsDto {}
exports.BaseCredentialsDto = BaseCredentialsDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'API key or client ID for the integration',
      example: 'your_api_key',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata('design:type', String),
  ],
  BaseCredentialsDto.prototype,
  'apiKey',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'API secret or client secret for the integration',
      example: 'your_api_secret',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata('design:type', String),
  ],
  BaseCredentialsDto.prototype,
  'apiSecret',
  void 0,
);
class ShopifyCredentialsDto extends BaseCredentialsDto {}
exports.ShopifyCredentialsDto = ShopifyCredentialsDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Shopify store domain',
      example: 'your-store.myshopify.com',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata('design:type', String),
  ],
  ShopifyCredentialsDto.prototype,
  'shopDomain',
  void 0,
);
class WooCommerceCredentialsDto extends BaseCredentialsDto {}
exports.WooCommerceCredentialsDto = WooCommerceCredentialsDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'WooCommerce store URL',
      example: 'https://your-store.com',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata('design:type', String),
  ],
  WooCommerceCredentialsDto.prototype,
  'storeUrl',
  void 0,
);
class AuthenticateRequestDto {}
exports.AuthenticateRequestDto = AuthenticateRequestDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Integration credentials',
      oneOf: [
        { $ref: (0, swagger_1.getSchemaPath)(ShopifyCredentialsDto) },
        { $ref: (0, swagger_1.getSchemaPath)(WooCommerceCredentialsDto) },
      ],
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => BaseCredentialsDto, {
      discriminator: {
        property: 'type',
        subTypes: [
          { value: ShopifyCredentialsDto, name: IntegrationType.SHOPIFY },
          { value: WooCommerceCredentialsDto, name: IntegrationType.WOOCOMMERCE },
        ],
      },
    }),
    __metadata('design:type', Object),
  ],
  AuthenticateRequestDto.prototype,
  'credentials',
  void 0,
);
class SyncProductsRequestDto {}
exports.SyncProductsRequestDto = SyncProductsRequestDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Integration credentials',
      oneOf: [
        { $ref: (0, swagger_1.getSchemaPath)(ShopifyCredentialsDto) },
        { $ref: (0, swagger_1.getSchemaPath)(WooCommerceCredentialsDto) },
      ],
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => BaseCredentialsDto, {
      discriminator: {
        property: 'type',
        subTypes: [
          { value: ShopifyCredentialsDto, name: IntegrationType.SHOPIFY },
          { value: WooCommerceCredentialsDto, name: IntegrationType.WOOCOMMERCE },
        ],
      },
    }),
    __metadata('design:type', Object),
  ],
  SyncProductsRequestDto.prototype,
  'credentials',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Merchant ID',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata('design:type', String),
  ],
  SyncProductsRequestDto.prototype,
  'merchantId',
  void 0,
);
class WebhookRequestDto {}
exports.WebhookRequestDto = WebhookRequestDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Webhook payload',
      type: Object,
    }),
    (0, class_validator_1.IsObject)(),
    __metadata('design:type', Object),
  ],
  WebhookRequestDto.prototype,
  'payload',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Webhook topic',
      example: 'products/create',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata('design:type', String),
  ],
  WebhookRequestDto.prototype,
  'topic',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Merchant ID',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata('design:type', String),
  ],
  WebhookRequestDto.prototype,
  'merchantId',
  void 0,
);
//# sourceMappingURL=integration-types.dto.js.map
