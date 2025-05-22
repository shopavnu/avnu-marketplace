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
exports.OrderFulfillment = void 0;
const typeorm_1 = require('typeorm');
const graphql_1 = require('@nestjs/graphql');
const order_entity_1 = require('./order.entity');
const enums_1 = require('../enums');
const class_validator_1 = require('class-validator');
const class_transformer_1 = require('class-transformer');
let OrderFulfillment = class OrderFulfillment {
  constructor() {
    this.id = '';
    this.orderId = '';
    this.status = enums_1.FulfillmentStatus.UNFULFILLED;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
};
exports.OrderFulfillment = OrderFulfillment;
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.ID, { description: 'Unique fulfillment identifier' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata('design:type', String),
  ],
  OrderFulfillment.prototype,
  'id',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { description: 'Parent order ID' }),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  OrderFulfillment.prototype,
  'orderId',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.ManyToOne)(
      () => order_entity_1.Order,
      order => order.fulfillments,
      { onDelete: 'CASCADE' },
    ),
    (0, typeorm_1.JoinColumn)({ name: 'orderId' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => order_entity_1.Order),
    __metadata('design:type', order_entity_1.Order),
  ],
  OrderFulfillment.prototype,
  'order',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { description: 'Current fulfillment status' }),
    (0, typeorm_1.Column)({
      type: 'enum',
      enum: enums_1.FulfillmentStatus,
      default: enums_1.FulfillmentStatus.UNFULFILLED,
    }),
    (0, typeorm_1.Index)(),
    (0, class_validator_1.IsEnum)(enums_1.FulfillmentStatus),
    __metadata('design:type', String),
  ],
  OrderFulfillment.prototype,
  'status',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, {
      nullable: true,
      description: 'Carrier-provided tracking number',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  OrderFulfillment.prototype,
  'trackingNumber',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, {
      nullable: true,
      description: 'URL to track the shipment',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  OrderFulfillment.prototype,
  'trackingUrl',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, {
      nullable: true,
      description: 'Name of the shipping carrier',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  OrderFulfillment.prototype,
  'carrierName',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, {
      nullable: true,
      description: 'Estimated delivery date',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata('design:type', Date),
  ],
  OrderFulfillment.prototype,
  'estimatedDeliveryDate',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, {
      nullable: true,
      description: 'Actual delivery date',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata('design:type', Date),
  ],
  OrderFulfillment.prototype,
  'deliveredAt',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, {
      nullable: true,
      description: 'Additional notes about the fulfillment',
    }),
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  OrderFulfillment.prototype,
  'notes',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, {
      description: 'When the fulfillment record was created',
    }),
    (0, typeorm_1.CreateDateColumn)(),
    (0, class_validator_1.IsDate)(),
    __metadata('design:type', Date),
  ],
  OrderFulfillment.prototype,
  'createdAt',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, {
      description: 'When the fulfillment record was last updated',
    }),
    (0, typeorm_1.UpdateDateColumn)(),
    (0, class_validator_1.IsDate)(),
    __metadata('design:type', Date),
  ],
  OrderFulfillment.prototype,
  'updatedAt',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, {
      nullable: true,
      description: 'When the fulfillment record was deleted',
    }),
    (0, typeorm_1.DeleteDateColumn)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata('design:type', Date),
  ],
  OrderFulfillment.prototype,
  'deletedAt',
  void 0,
);
exports.OrderFulfillment = OrderFulfillment = __decorate(
  [(0, graphql_1.ObjectType)('OrderFulfillment'), (0, typeorm_1.Entity)('order_fulfillments')],
  OrderFulfillment,
);
//# sourceMappingURL=order-fulfillment.entity.js.map
