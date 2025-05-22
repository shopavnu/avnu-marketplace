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
exports.MerchantShipping = void 0;
const typeorm_1 = require('typeorm');
const graphql_1 = require('@nestjs/graphql');
const merchant_entity_1 = require('./merchant.entity');
let MerchantShipping = class MerchantShipping {};
exports.MerchantShipping = MerchantShipping;
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata('design:type', String),
  ],
  MerchantShipping.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), (0, typeorm_1.Column)(), __metadata('design:type', String)],
  MerchantShipping.prototype,
  'merchantId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => merchant_entity_1.Merchant),
    (0, typeorm_1.ManyToOne)(() => merchant_entity_1.Merchant, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'merchantId' }),
    __metadata('design:type', merchant_entity_1.Merchant),
  ],
  MerchantShipping.prototype,
  'merchant',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ default: false }),
    __metadata('design:type', Boolean),
  ],
  MerchantShipping.prototype,
  'offersFreeShipping',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata('design:type', Number),
  ],
  MerchantShipping.prototype,
  'freeShippingThreshold',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata('design:type', Number),
  ],
  MerchantShipping.prototype,
  'standardShippingRate',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata('design:type', Number),
  ],
  MerchantShipping.prototype,
  'expeditedShippingRate',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata('design:type', Array),
  ],
  MerchantShipping.prototype,
  'shippingCountries',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata('design:type', Array),
  ],
  MerchantShipping.prototype,
  'excludedRegions',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata('design:type', Date),
  ],
  MerchantShipping.prototype,
  'createdAt',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata('design:type', Date),
  ],
  MerchantShipping.prototype,
  'updatedAt',
  void 0,
);
exports.MerchantShipping = MerchantShipping = __decorate(
  [(0, graphql_1.ObjectType)(), (0, typeorm_1.Entity)('merchant_shipping_settings')],
  MerchantShipping,
);
//# sourceMappingURL=merchant-shipping.entity.js.map
