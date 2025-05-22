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
exports.SyncCountResponseDto =
  exports.SyncSuccessResponseDto =
  exports.SyncStatusResponseDto =
  exports.WebhookQueryDto =
  exports.WooCommerceWebhookHeadersDto =
  exports.ShopifyWebhookHeadersDto =
  exports.WooCommerceWebhookTopic =
  exports.ShopifyWebhookTopic =
  exports.SyncStatus =
    void 0;
const swagger_1 = require('@nestjs/swagger');
const class_validator_1 = require('class-validator');
var SyncStatus;
(function (SyncStatus) {
  SyncStatus['PENDING'] = 'pending';
  SyncStatus['IN_PROGRESS'] = 'in_progress';
  SyncStatus['COMPLETED'] = 'completed';
  SyncStatus['FAILED'] = 'failed';
  SyncStatus['NEVER_SYNCED'] = 'never_synced';
})(SyncStatus || (exports.SyncStatus = SyncStatus = {}));
var ShopifyWebhookTopic;
(function (ShopifyWebhookTopic) {
  ShopifyWebhookTopic['PRODUCTS_CREATE'] = 'products/create';
  ShopifyWebhookTopic['PRODUCTS_UPDATE'] = 'products/update';
  ShopifyWebhookTopic['PRODUCTS_DELETE'] = 'products/delete';
  ShopifyWebhookTopic['ORDERS_CREATE'] = 'orders/create';
  ShopifyWebhookTopic['ORDERS_UPDATE'] = 'orders/update';
  ShopifyWebhookTopic['ORDERS_CANCELLED'] = 'orders/cancelled';
  ShopifyWebhookTopic['ORDERS_FULFILLED'] = 'orders/fulfilled';
  ShopifyWebhookTopic['FULFILLMENTS_CREATE'] = 'fulfillments/create';
  ShopifyWebhookTopic['FULFILLMENTS_UPDATE'] = 'fulfillments/update';
})(ShopifyWebhookTopic || (exports.ShopifyWebhookTopic = ShopifyWebhookTopic = {}));
var WooCommerceWebhookTopic;
(function (WooCommerceWebhookTopic) {
  WooCommerceWebhookTopic['PRODUCT_CREATED'] = 'product.created';
  WooCommerceWebhookTopic['PRODUCT_UPDATED'] = 'product.updated';
  WooCommerceWebhookTopic['PRODUCT_DELETED'] = 'product.deleted';
  WooCommerceWebhookTopic['ORDER_CREATED'] = 'order.created';
  WooCommerceWebhookTopic['ORDER_UPDATED'] = 'order.updated';
  WooCommerceWebhookTopic['ORDER_DELETED'] = 'order.deleted';
})(WooCommerceWebhookTopic || (exports.WooCommerceWebhookTopic = WooCommerceWebhookTopic = {}));
class ShopifyWebhookHeadersDto {}
exports.ShopifyWebhookHeadersDto = ShopifyWebhookHeadersDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'The webhook topic',
      enum: ShopifyWebhookTopic,
      example: ShopifyWebhookTopic.PRODUCTS_CREATE,
    }),
    (0, class_validator_1.IsEnum)(ShopifyWebhookTopic),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata('design:type', String),
  ],
  ShopifyWebhookHeadersDto.prototype,
  'x-shopify-topic',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'The webhook HMAC signature',
      example: 'sha256=abc123...',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata('design:type', String),
  ],
  ShopifyWebhookHeadersDto.prototype,
  'x-shopify-hmac-sha256',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'The shop domain',
      example: 'my-store.myshopify.com',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata('design:type', String),
  ],
  ShopifyWebhookHeadersDto.prototype,
  'x-shopify-shop-domain',
  void 0,
);
class WooCommerceWebhookHeadersDto {}
exports.WooCommerceWebhookHeadersDto = WooCommerceWebhookHeadersDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'The webhook topic',
      enum: WooCommerceWebhookTopic,
      example: WooCommerceWebhookTopic.PRODUCT_CREATED,
    }),
    (0, class_validator_1.IsEnum)(WooCommerceWebhookTopic),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata('design:type', String),
  ],
  WooCommerceWebhookHeadersDto.prototype,
  'x-wc-webhook-topic',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'The webhook signature',
      example: 'abc123...',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata('design:type', String),
  ],
  WooCommerceWebhookHeadersDto.prototype,
  'x-wc-webhook-signature',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'The source URL',
      example: 'https://my-store.com',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata('design:type', String),
  ],
  WooCommerceWebhookHeadersDto.prototype,
  'x-wc-webhook-source',
  void 0,
);
class WebhookQueryDto {}
exports.WebhookQueryDto = WebhookQueryDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Optional merchant ID',
      example: '123e4567-e89b-12d3-a456-426614174000',
      required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  WebhookQueryDto.prototype,
  'merchantId',
  void 0,
);
class SyncStatusResponseDto {}
exports.SyncStatusResponseDto = SyncStatusResponseDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Last synced timestamp',
      example: '2023-01-01T00:00:00.000Z',
      nullable: true,
    }),
    __metadata('design:type', Date),
  ],
  SyncStatusResponseDto.prototype,
  'lastSyncedAt',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Sync status',
      enum: SyncStatus,
      example: SyncStatus.COMPLETED,
    }),
    __metadata('design:type', String),
  ],
  SyncStatusResponseDto.prototype,
  'status',
  void 0,
);
class SyncSuccessResponseDto {}
exports.SyncSuccessResponseDto = SyncSuccessResponseDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Success status',
      example: true,
    }),
    __metadata('design:type', Boolean),
  ],
  SyncSuccessResponseDto.prototype,
  'success',
  void 0,
);
class SyncCountResponseDto {}
exports.SyncCountResponseDto = SyncCountResponseDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Count of synced items',
      example: 42,
    }),
    __metadata('design:type', Number),
  ],
  SyncCountResponseDto.prototype,
  'count',
  void 0,
);
//# sourceMappingURL=sync.dto.js.map
