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
exports.Product = void 0;
const typeorm_1 = require('typeorm');
const graphql_1 = require('@nestjs/graphql');
let AccessibilityMetadata = class AccessibilityMetadata {};
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  AccessibilityMetadata.prototype,
  'altText',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  AccessibilityMetadata.prototype,
  'ariaLabel',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  AccessibilityMetadata.prototype,
  'role',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  AccessibilityMetadata.prototype,
  'longDescription',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Object, { nullable: true }), __metadata('design:type', Object)],
  AccessibilityMetadata.prototype,
  'structuredData',
  void 0,
);
AccessibilityMetadata = __decorate([(0, graphql_1.ObjectType)()], AccessibilityMetadata);
let ImageMetadata = class ImageMetadata {};
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  ImageMetadata.prototype,
  'width',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  ImageMetadata.prototype,
  'height',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ImageMetadata.prototype,
  'format',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  ImageMetadata.prototype,
  'aspectRatio',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata('design:type', Number),
  ],
  ImageMetadata.prototype,
  'size',
  void 0,
);
ImageMetadata = __decorate([(0, graphql_1.ObjectType)()], ImageMetadata);
let ProductAttributes = class ProductAttributes {};
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  ProductAttributes.prototype,
  'size',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  ProductAttributes.prototype,
  'color',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  ProductAttributes.prototype,
  'material',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  ProductAttributes.prototype,
  'weight',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  ProductAttributes.prototype,
  'dimensions',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  ProductAttributes.prototype,
  'customAttributes',
  void 0,
);
ProductAttributes = __decorate([(0, graphql_1.ObjectType)()], ProductAttributes);
let Product = class Product {
  get isOnSale() {
    return this.compareAtPrice !== null && this.price < this.compareAtPrice;
  }
  get discountPercentage() {
    if (!this.isOnSale || !this.compareAtPrice) return null;
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
};
exports.Product = Product;
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata('design:type', String),
  ],
  Product.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), (0, typeorm_1.Column)(), __metadata('design:type', String)],
  Product.prototype,
  'title',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), (0, typeorm_1.Column)('text'), __metadata('design:type', String)],
  Product.prototype,
  'description',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    (0, typeorm_1.Index)(),
    __metadata('design:type', Number),
  ],
  Product.prototype,
  'price',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true }),
    __metadata('design:type', Number),
  ],
  Product.prototype,
  'compareAtPrice',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String]),
    (0, typeorm_1.Column)('simple-array'),
    __metadata('design:type', Array),
  ],
  Product.prototype,
  'images',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [ImageMetadata], { nullable: true }),
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata('design:type', Array),
  ],
  Product.prototype,
  'imageMetadata',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata('design:type', Array),
  ],
  Product.prototype,
  'mobileImages',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata('design:type', Array),
  ],
  Product.prototype,
  'tabletImages',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata('design:type', Object),
  ],
  Product.prototype,
  'responsiveImageData',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', String),
  ],
  Product.prototype,
  'thumbnail',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String]),
    (0, typeorm_1.Column)('simple-array'),
    (0, typeorm_1.Index)({ fulltext: true }),
    __metadata('design:type', Array),
  ],
  Product.prototype,
  'categories',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata('design:type', Array),
  ],
  Product.prototype,
  'tags',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata('design:type', String),
  ],
  Product.prototype,
  'merchantId',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), (0, typeorm_1.Column)(), __metadata('design:type', String)],
  Product.prototype,
  'brandName',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata('design:type', Object),
  ],
  Product.prototype,
  'brandInfo',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ default: true }),
    __metadata('design:type', Boolean),
  ],
  Product.prototype,
  'isActive',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ default: true }),
    (0, typeorm_1.Index)(),
    __metadata('design:type', Boolean),
  ],
  Product.prototype,
  'inStock',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ default: false }),
    (0, typeorm_1.Index)(),
    __metadata('design:type', Boolean),
  ],
  Product.prototype,
  'featured',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, typeorm_1.Column)('int', { nullable: true }),
    __metadata('design:type', Number),
  ],
  Product.prototype,
  'quantity',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata('design:type', Array),
  ],
  Product.prototype,
  'values',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => ProductAttributes, { nullable: true }),
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata('design:type', ProductAttributes),
  ],
  Product.prototype,
  'attributes',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), (0, typeorm_1.Column)(), __metadata('design:type', String)],
  Product.prototype,
  'externalId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata('design:type', String),
  ],
  Product.prototype,
  'externalSource',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata('design:type', String),
  ],
  Product.prototype,
  'slug',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Index)(),
    __metadata('design:type', Date),
  ],
  Product.prototype,
  'createdAt',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata('design:type', Date),
  ],
  Product.prototype,
  'updatedAt',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean, { defaultValue: false }),
    (0, typeorm_1.Column)({ default: false }),
    (0, typeorm_1.Index)(),
    __metadata('design:type', Boolean),
  ],
  Product.prototype,
  'isSuppressed',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata('design:type', Array),
  ],
  Product.prototype,
  'suppressedFrom',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', Date),
  ],
  Product.prototype,
  'lastValidationDate',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => AccessibilityMetadata, { nullable: true }),
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata('design:type', AccessibilityMetadata),
  ],
  Product.prototype,
  'accessibilityMetadata',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata('design:type', Object),
  ],
  Product.prototype,
  'imageAltTexts',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean),
    __metadata('design:type', Boolean),
    __metadata('design:paramtypes', []),
  ],
  Product.prototype,
  'isOnSale',
  null,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
    __metadata('design:paramtypes', []),
  ],
  Product.prototype,
  'discountPercentage',
  null,
);
exports.Product = Product = __decorate(
  [
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('products'),
    (0, typeorm_1.Index)(['merchantId', 'inStock', 'isActive']),
    (0, typeorm_1.Index)(['price', 'inStock', 'isActive']),
    (0, typeorm_1.Index)(['createdAt', 'id']),
  ],
  Product,
);
//# sourceMappingURL=product.entity.js.map
