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
exports.PaginationInput =
  exports.UpdateOrderInput =
  exports.CreateOrderInput =
  exports.OrderItemInput =
  exports.ShippingAddressInput =
    void 0;
const graphql_1 = require('@nestjs/graphql');
const order_status_enum_1 = require('../enums/order-status.enum');
const payment_status_enum_1 = require('../enums/payment-status.enum');
const class_validator_1 = require('class-validator');
const class_transformer_1 = require('class-transformer');
let ShippingAddressInput = class ShippingAddressInput {
  constructor() {
    this.firstName = '';
    this.lastName = '';
    this.addressLine1 = '';
    this.city = '';
    this.state = '';
    this.postalCode = '';
    this.country = '';
  }
};
exports.ShippingAddressInput = ShippingAddressInput;
__decorate(
  [(0, graphql_1.Field)(), (0, class_validator_1.IsString)(), __metadata('design:type', String)],
  ShippingAddressInput.prototype,
  'firstName',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), (0, class_validator_1.IsString)(), __metadata('design:type', String)],
  ShippingAddressInput.prototype,
  'lastName',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), (0, class_validator_1.IsString)(), __metadata('design:type', String)],
  ShippingAddressInput.prototype,
  'addressLine1',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  ShippingAddressInput.prototype,
  'addressLine2',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), (0, class_validator_1.IsString)(), __metadata('design:type', String)],
  ShippingAddressInput.prototype,
  'city',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), (0, class_validator_1.IsString)(), __metadata('design:type', String)],
  ShippingAddressInput.prototype,
  'state',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), (0, class_validator_1.IsString)(), __metadata('design:type', String)],
  ShippingAddressInput.prototype,
  'postalCode',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), (0, class_validator_1.IsString)(), __metadata('design:type', String)],
  ShippingAddressInput.prototype,
  'country',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  ShippingAddressInput.prototype,
  'phoneNumber',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  ShippingAddressInput.prototype,
  'email',
  void 0,
);
exports.ShippingAddressInput = ShippingAddressInput = __decorate(
  [(0, graphql_1.InputType)()],
  ShippingAddressInput,
);
let OrderItemInput = class OrderItemInput {
  constructor() {
    this.productId = '';
    this.quantity = 1;
    this.price = 0;
  }
};
exports.OrderItemInput = OrderItemInput;
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  OrderItemInput.prototype,
  'productId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata('design:type', Number),
  ],
  OrderItemInput.prototype,
  'quantity',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata('design:type', Number),
  ],
  OrderItemInput.prototype,
  'price',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  OrderItemInput.prototype,
  'variantId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  OrderItemInput.prototype,
  'options',
  void 0,
);
exports.OrderItemInput = OrderItemInput = __decorate([(0, graphql_1.InputType)()], OrderItemInput);
let CreateOrderInput = class CreateOrderInput {
  constructor() {
    this.userId = '';
    this.items = [];
    this.shippingAddress = new ShippingAddressInput();
  }
};
exports.CreateOrderInput = CreateOrderInput;
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  CreateOrderInput.prototype,
  'userId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [OrderItemInput]),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OrderItemInput),
    __metadata('design:type', Array),
  ],
  CreateOrderInput.prototype,
  'items',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => ShippingAddressInput),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ShippingAddressInput),
    __metadata('design:type', ShippingAddressInput),
  ],
  CreateOrderInput.prototype,
  'shippingAddress',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  CreateOrderInput.prototype,
  'notes',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean, { nullable: true, defaultValue: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  CreateOrderInput.prototype,
  'isPriority',
  void 0,
);
exports.CreateOrderInput = CreateOrderInput = __decorate(
  [(0, graphql_1.InputType)()],
  CreateOrderInput,
);
let UpdateOrderInput = class UpdateOrderInput {};
exports.UpdateOrderInput = UpdateOrderInput;
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateOrderInput.prototype,
  'userId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsEnum)(order_status_enum_1.OrderStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateOrderInput.prototype,
  'status',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsEnum)(payment_status_enum_1.PaymentStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateOrderInput.prototype,
  'paymentStatus',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateOrderInput.prototype,
  'trackingNumber',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateOrderInput.prototype,
  'trackingUrl',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateOrderInput.prototype,
  'notes',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  UpdateOrderInput.prototype,
  'isPriority',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => ShippingAddressInput, { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ShippingAddressInput),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', ShippingAddressInput),
  ],
  UpdateOrderInput.prototype,
  'shippingAddress',
  void 0,
);
exports.UpdateOrderInput = UpdateOrderInput = __decorate(
  [(0, graphql_1.InputType)()],
  UpdateOrderInput,
);
let PaginationInput = class PaginationInput {
  constructor() {
    this.page = 1;
    this.limit = 10;
  }
};
exports.PaginationInput = PaginationInput;
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata('design:type', Number),
  ],
  PaginationInput.prototype,
  'page',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 10 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata('design:type', Number),
  ],
  PaginationInput.prototype,
  'limit',
  void 0,
);
exports.PaginationInput = PaginationInput = __decorate(
  [(0, graphql_1.InputType)()],
  PaginationInput,
);
//# sourceMappingURL=order.inputs.js.map
