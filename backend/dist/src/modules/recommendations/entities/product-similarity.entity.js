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
exports.ProductSimilarity = exports.SimilarityType = void 0;
const typeorm_1 = require('typeorm');
const graphql_1 = require('@nestjs/graphql');
var SimilarityType;
(function (SimilarityType) {
  SimilarityType['ATTRIBUTE_BASED'] = 'attribute_based';
  SimilarityType['COLLABORATIVE_FILTERING'] = 'collaborative_filtering';
  SimilarityType['CONTENT_BASED'] = 'content_based';
  SimilarityType['HYBRID'] = 'hybrid';
  SimilarityType['PURCHASE_BASED'] = 'purchase_based';
  SimilarityType['VIEW_BASED'] = 'view_based';
  SimilarityType['CATEGORY_BASED'] = 'category_based';
  SimilarityType['PRICE_BASED'] = 'price_based';
  SimilarityType['BRAND_BASED'] = 'brand_based';
  SimilarityType['EMBEDDING_BASED'] = 'embedding_based';
})(SimilarityType || (exports.SimilarityType = SimilarityType = {}));
let ProductSimilarity = class ProductSimilarity {};
exports.ProductSimilarity = ProductSimilarity;
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata('design:type', String),
  ],
  ProductSimilarity.prototype,
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
  ProductSimilarity.prototype,
  'sourceProductId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata('design:type', String),
  ],
  ProductSimilarity.prototype,
  'targetProductId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => SimilarityType),
    (0, typeorm_1.Column)({
      type: 'enum',
      enum: SimilarityType,
      default: SimilarityType.ATTRIBUTE_BASED,
    }),
    __metadata('design:type', String),
  ],
  ProductSimilarity.prototype,
  'similarityType',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata('design:type', Number),
  ],
  ProductSimilarity.prototype,
  'score',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata('design:type', Object),
  ],
  ProductSimilarity.prototype,
  'metadata',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata('design:type', Date),
  ],
  ProductSimilarity.prototype,
  'createdAt',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata('design:type', Date),
  ],
  ProductSimilarity.prototype,
  'updatedAt',
  void 0,
);
exports.ProductSimilarity = ProductSimilarity = __decorate(
  [
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('product_similarities'),
    (0, typeorm_1.Unique)(['sourceProductId', 'targetProductId', 'similarityType']),
    (0, typeorm_1.Index)(['sourceProductId', 'similarityType', 'score']),
  ],
  ProductSimilarity,
);
//# sourceMappingURL=product-similarity.entity.js.map
