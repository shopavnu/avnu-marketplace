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
exports.UpdateOrderDto = void 0;
const class_validator_1 = require('class-validator');
const class_transformer_1 = require('class-transformer');
const swagger_1 = require('@nestjs/swagger');
const order_status_enum_1 = require('../enums/order-status.enum');
const payment_status_enum_1 = require('../enums/payment-status.enum');
const create_order_dto_1 = require('./create-order.dto');
class UpdateOrderDto {}
exports.UpdateOrderDto = UpdateOrderDto;
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID of the user who placed the order' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateOrderDto.prototype,
  'userId',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({
      description: 'Current status of the order',
      enum: order_status_enum_1.OrderStatus,
    }),
    (0, class_validator_1.IsEnum)(order_status_enum_1.OrderStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateOrderDto.prototype,
  'status',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({
      description: 'Current payment status of the order',
      enum: payment_status_enum_1.PaymentStatus,
    }),
    (0, class_validator_1.IsEnum)(payment_status_enum_1.PaymentStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateOrderDto.prototype,
  'paymentStatus',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tracking number for the shipment' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateOrderDto.prototype,
  'trackingNumber',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL to track the shipment' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateOrderDto.prototype,
  'trackingUrl',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional notes for the order' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateOrderDto.prototype,
  'notes',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether the order should be prioritized' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  UpdateOrderDto.prototype,
  'isPriority',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({
      description: 'Updated shipping address for the order',
      type: create_order_dto_1.ShippingAddressDto,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => create_order_dto_1.ShippingAddressDto),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', create_order_dto_1.ShippingAddressDto),
  ],
  UpdateOrderDto.prototype,
  'shippingAddress',
  void 0,
);
//# sourceMappingURL=update-order.dto.js.map
