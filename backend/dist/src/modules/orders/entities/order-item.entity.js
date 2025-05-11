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
exports.OrderItem = void 0;
const typeorm_1 = require('typeorm');
const graphql_1 = require('@nestjs/graphql');
const order_entity_1 = require('./order.entity');
const class_validator_1 = require('class-validator');
const class_transformer_1 = require('class-transformer');
let OrderItem = class OrderItem {
  constructor() {
    this.id = '';
    this.orderId = '';
    this.productId = '';
    this.quantity = 1;
    this.price = 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
};
exports.OrderItem = OrderItem;
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.ID, { description: 'Unique order item identifier' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata('design:type', String),
  ],
  OrderItem.prototype,
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
  OrderItem.prototype,
  'orderId',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.ManyToOne)(
      () => order_entity_1.Order,
      order => order.items,
      { onDelete: 'CASCADE' },
    ),
    (0, typeorm_1.JoinColumn)({ name: 'orderId' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => order_entity_1.Order),
    __metadata('design:type', order_entity_1.Order),
  ],
  OrderItem.prototype,
  'order',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { description: 'Product ID reference' }),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  OrderItem.prototype,
  'productId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true, description: 'Product variant ID' }),
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  OrderItem.prototype,
  'variantId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { description: 'Number of units ordered' }),
    (0, typeorm_1.Column)('int'),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata('design:type', Number),
  ],
  OrderItem.prototype,
  'quantity',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { description: 'Price per unit' }),
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata('design:type', Number),
  ],
  OrderItem.prototype,
  'price',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true, description: 'Product option values' }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata('design:type', Array),
  ],
  OrderItem.prototype,
  'options',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, {
      description: 'When the order item was created',
    }),
    (0, typeorm_1.CreateDateColumn)(),
    (0, class_validator_1.IsDate)(),
    __metadata('design:type', Date),
  ],
  OrderItem.prototype,
  'createdAt',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, {
      description: 'When the order item was last updated',
    }),
    (0, typeorm_1.UpdateDateColumn)(),
    (0, class_validator_1.IsDate)(),
    __metadata('design:type', Date),
  ],
  OrderItem.prototype,
  'updatedAt',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, {
      nullable: true,
      description: 'When the order item was deleted',
    }),
    (0, typeorm_1.DeleteDateColumn)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata('design:type', Date),
  ],
  OrderItem.prototype,
  'deletedAt',
  void 0,
);
exports.OrderItem = OrderItem = __decorate(
  [(0, graphql_1.ObjectType)('OrderItem'), (0, typeorm_1.Entity)('order_items')],
  OrderItem,
);
//# sourceMappingURL=order-item.entity.js.map
