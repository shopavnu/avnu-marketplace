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
exports.UpdateProductDto = void 0;
const class_validator_1 = require('class-validator');
const graphql_1 = require('@nestjs/graphql');
const swagger_1 = require('@nestjs/swagger');
const create_product_dto_1 = require('./create-product.dto');
let UpdateProductDto = class UpdateProductDto extends (0, graphql_1.PartialType)(
  create_product_dto_1.CreateProductDto,
) {};
exports.UpdateProductDto = UpdateProductDto;
__decorate(
  [
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, description: 'Product title' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateProductDto.prototype,
  'title',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, description: 'Product description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateProductDto.prototype,
  'description',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, description: 'Product price' }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  UpdateProductDto.prototype,
  'price',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, description: 'Original price for comparison' }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  UpdateProductDto.prototype,
  'compareAtPrice',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, description: 'Product images' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  UpdateProductDto.prototype,
  'images',
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
  UpdateProductDto.prototype,
  'thumbnail',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, description: 'Product categories' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  UpdateProductDto.prototype,
  'categories',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Object, { nullable: true }),
    (0, swagger_1.ApiProperty)({
      required: false,
      description: 'Accessibility metadata for the product',
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Object),
  ],
  UpdateProductDto.prototype,
  'accessibilityMetadata',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Object, { nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, description: 'Map of image URLs to alt texts' }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Object),
  ],
  UpdateProductDto.prototype,
  'imageAltTexts',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, description: 'Product tags' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  UpdateProductDto.prototype,
  'tags',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, description: 'Brand name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  UpdateProductDto.prototype,
  'brandName',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, description: 'Product active status' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  UpdateProductDto.prototype,
  'isActive',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, description: 'Product stock status' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  UpdateProductDto.prototype,
  'inStock',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, description: 'Product quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  UpdateProductDto.prototype,
  'quantity',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, description: 'Product values' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  UpdateProductDto.prototype,
  'values',
  void 0,
);
exports.UpdateProductDto = UpdateProductDto = __decorate(
  [(0, graphql_1.InputType)()],
  UpdateProductDto,
);
//# sourceMappingURL=update-product.dto.js.map
