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
exports.ProductRecommendation = exports.RecommendationType = void 0;
const typeorm_1 = require('typeorm');
const graphql_1 = require('@nestjs/graphql');
var RecommendationType;
(function (RecommendationType) {
  RecommendationType['SIMILAR_PRODUCTS'] = 'similar_products';
  RecommendationType['FREQUENTLY_BOUGHT_TOGETHER'] = 'frequently_bought_together';
  RecommendationType['COMPLEMENTARY_PRODUCTS'] = 'complementary_products';
  RecommendationType['PERSONALIZED'] = 'personalized';
  RecommendationType['TRENDING'] = 'trending';
  RecommendationType['TOP_RATED'] = 'top_rated';
  RecommendationType['RECENTLY_VIEWED'] = 'recently_viewed';
  RecommendationType['PRICE_DROP'] = 'price_drop';
  RecommendationType['SEASONAL'] = 'seasonal';
  RecommendationType['FEATURED'] = 'featured';
})(RecommendationType || (exports.RecommendationType = RecommendationType = {}));
let ProductRecommendation = class ProductRecommendation {};
exports.ProductRecommendation = ProductRecommendation;
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata('design:type', String),
  ],
  ProductRecommendation.prototype,
  'id',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata('design:type', String),
  ],
  ProductRecommendation.prototype,
  'userId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata('design:type', String),
  ],
  ProductRecommendation.prototype,
  'sessionId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata('design:type', String),
  ],
  ProductRecommendation.prototype,
  'productId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => RecommendationType),
    (0, typeorm_1.Column)({
      type: 'enum',
      enum: RecommendationType,
      default: RecommendationType.SIMILAR_PRODUCTS,
    }),
    __metadata('design:type', String),
  ],
  ProductRecommendation.prototype,
  'recommendationType',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String), (0, typeorm_1.Column)(), __metadata('design:type', String)],
  ProductRecommendation.prototype,
  'algorithmId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata('design:type', Number),
  ],
  ProductRecommendation.prototype,
  'score',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata('design:type', Number),
  ],
  ProductRecommendation.prototype,
  'position',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata('design:type', Number),
  ],
  ProductRecommendation.prototype,
  'impressions',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata('design:type', Number),
  ],
  ProductRecommendation.prototype,
  'clicks',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata('design:type', Number),
  ],
  ProductRecommendation.prototype,
  'conversions',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { defaultValue: 0 }),
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata('design:type', Number),
  ],
  ProductRecommendation.prototype,
  'conversionRate',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { defaultValue: 0 }),
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata('design:type', Number),
  ],
  ProductRecommendation.prototype,
  'clickThroughRate',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata('design:type', Object),
  ],
  ProductRecommendation.prototype,
  'metadata',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata('design:type', Date),
  ],
  ProductRecommendation.prototype,
  'createdAt',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata('design:type', Date),
  ],
  ProductRecommendation.prototype,
  'updatedAt',
  void 0,
);
exports.ProductRecommendation = ProductRecommendation = __decorate(
  [(0, graphql_1.ObjectType)(), (0, typeorm_1.Entity)('product_recommendations')],
  ProductRecommendation,
);
//# sourceMappingURL=product-recommendation.entity.js.map
