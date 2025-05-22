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
exports.CreateProductDto = void 0;
const class_validator_1 = require('class-validator');
const graphql_1 = require('@nestjs/graphql');
const class_transformer_1 = require('class-transformer');
const swagger_1 = require('@nestjs/swagger');
const product_attributes_dto_1 = require('./product-attributes.dto');
let CreateProductDto = class CreateProductDto {};
exports.CreateProductDto = CreateProductDto;
__decorate(
  [
    (0, graphql_1.Field)(),
    (0, swagger_1.ApiProperty)({
      example: 'Handcrafted Ceramic Mug',
      description: 'Product title',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Title is required' }),
    __metadata('design:type', String),
  ],
  CreateProductDto.prototype,
  'title',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(),
    (0, swagger_1.ApiProperty)({
      example: 'A beautiful handcrafted ceramic mug...',
      description: 'Product description',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Description is required' }),
    __metadata('design:type', String),
  ],
  CreateProductDto.prototype,
  'description',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, swagger_1.ApiProperty)({ example: 29.99, description: 'Product price' }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsNotEmpty)({ message: 'Price is required' }),
    __metadata('design:type', Number),
  ],
  CreateProductDto.prototype,
  'price',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, swagger_1.ApiProperty)({
      example: 39.99,
      required: false,
      description: 'Original price for comparison',
    }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  CreateProductDto.prototype,
  'compareAtPrice',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String]),
    (0, swagger_1.ApiProperty)({
      example: ['https://example.com/image1.jpg'],
      description: 'Product images',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsUrl)({}, { each: true, message: 'Each image must be a valid URL' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'At least one image is required' }),
    __metadata('design:type', Array),
  ],
  CreateProductDto.prototype,
  'images',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, swagger_1.ApiProperty)({
      required: false,
      example: 'handcrafted-ceramic-mug',
      description: 'URL-friendly slug',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  CreateProductDto.prototype,
  'slug',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, description: 'Product thumbnail' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  CreateProductDto.prototype,
  'thumbnail',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String]),
    (0, swagger_1.ApiProperty)({
      example: ['Home', 'Kitchenware'],
      description: 'Product categories',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)({ message: 'At least one category is required' }),
    __metadata('design:type', Array),
  ],
  CreateProductDto.prototype,
  'categories',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, swagger_1.ApiProperty)({
      example: ['ceramic', 'handmade'],
      required: false,
      description: 'Product tags',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  CreateProductDto.prototype,
  'tags',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => product_attributes_dto_1.ProductAttributesDto, { nullable: true }),
    (0, swagger_1.ApiProperty)({
      required: false,
      description: 'Product attributes like size, color, material, etc.',
      type: () => product_attributes_dto_1.ProductAttributesDto,
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => product_attributes_dto_1.ProductAttributesDto),
    __metadata('design:type', product_attributes_dto_1.ProductAttributesDto),
  ],
  CreateProductDto.prototype,
  'attributes',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(),
    (0, swagger_1.ApiProperty)({
      example: '123e4567-e89b-12d3-a456-426614174000',
      description: 'Merchant ID',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Merchant ID is required' }),
    __metadata('design:type', String),
  ],
  CreateProductDto.prototype,
  'merchantId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(),
    (0, swagger_1.ApiProperty)({ example: 'Terra & Clay', description: 'Brand name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Brand name is required' }),
    __metadata('design:type', String),
  ],
  CreateProductDto.prototype,
  'brandName',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)({ defaultValue: true }),
    (0, swagger_1.ApiProperty)({
      example: true,
      default: true,
      description: 'Product active status',
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  CreateProductDto.prototype,
  'isActive',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)({ defaultValue: true }),
    (0, swagger_1.ApiProperty)({
      example: true,
      default: true,
      description: 'Product stock status',
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  CreateProductDto.prototype,
  'inStock',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, swagger_1.ApiProperty)({ example: 100, required: false, description: 'Product quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  CreateProductDto.prototype,
  'quantity',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, swagger_1.ApiProperty)({
      example: ['sustainable', 'handmade'],
      required: false,
      description: 'Product values',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  CreateProductDto.prototype,
  'values',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(),
    (0, swagger_1.ApiProperty)({ example: 'PROD123', description: 'External product ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'External ID is required' }),
    __metadata('design:type', String),
  ],
  CreateProductDto.prototype,
  'externalId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(),
    (0, swagger_1.ApiProperty)({
      example: 'shopify',
      description: 'External source (e.g., shopify, woocommerce)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'External source is required' }),
    __metadata('design:type', String),
  ],
  CreateProductDto.prototype,
  'externalSource',
  void 0,
);
exports.CreateProductDto = CreateProductDto = __decorate(
  [(0, graphql_1.InputType)()],
  CreateProductDto,
);
//# sourceMappingURL=create-product.dto.js.map
