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
exports.EnhancedSearchOptionsDto =
  exports.EntityBoostingDto =
  exports.BrandFilterDto =
  exports.MerchantFilterDto =
  exports.ProductFilterDto =
    void 0;
const swagger_1 = require('@nestjs/swagger');
const class_validator_1 = require('class-validator');
const class_transformer_1 = require('class-transformer');
const graphql_1 = require('@nestjs/graphql');
const search_options_dto_1 = require('./search-options.dto');
let ProductFilterDto = class ProductFilterDto {
  toGenericFilters() {
    const filters = [];
    const rangeFilters = [];
    if (this.categories?.length) {
      filters.push({
        field: 'categories',
        values: this.categories,
        exact: false,
      });
    }
    if (this.tags?.length) {
      filters.push({
        field: 'tags',
        values: this.tags,
        exact: false,
      });
    }
    if (this.values?.length) {
      filters.push({
        field: 'values',
        values: this.values,
        exact: false,
      });
    }
    if (this.brandIds?.length) {
      filters.push({
        field: 'brandId',
        values: this.brandIds,
        exact: true,
      });
    }
    if (this.merchantIds?.length) {
      filters.push({
        field: 'merchantId',
        values: this.merchantIds,
        exact: true,
      });
    }
    if (this.minPrice !== undefined || this.maxPrice !== undefined) {
      rangeFilters.push({
        field: 'price',
        min: this.minPrice,
        max: this.maxPrice,
      });
    }
    if (this.minRating !== undefined) {
      rangeFilters.push({
        field: 'rating',
        min: this.minRating,
      });
    }
    if (this.inStock !== undefined) {
      filters.push({
        field: 'inStock',
        values: [this.inStock.toString()],
        exact: true,
      });
    }
    if (this.onSale !== undefined) {
      filters.push({
        field: 'onSale',
        values: [this.onSale.toString()],
        exact: true,
      });
    }
    if (this.newArrivalsWithinDays !== undefined) {
      const date = new Date();
      date.setDate(date.getDate() - this.newArrivalsWithinDays);
      rangeFilters.push({
        field: 'createdAt',
        min: date.getTime(),
      });
    }
    if (this.colors?.length) {
      filters.push({
        field: 'colors',
        values: this.colors,
        exact: false,
      });
    }
    if (this.sizes?.length) {
      filters.push({
        field: 'sizes',
        values: this.sizes,
        exact: false,
      });
    }
    if (this.materials?.length) {
      filters.push({
        field: 'materials',
        values: this.materials,
        exact: false,
      });
    }
    return { filters, rangeFilters };
  }
};
exports.ProductFilterDto = ProductFilterDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by categories',
      type: [String],
      required: false,
    }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  ProductFilterDto.prototype,
  'categories',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by tags',
      type: [String],
      required: false,
    }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  ProductFilterDto.prototype,
  'tags',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by values (e.g., sustainable, eco-friendly)',
      type: [String],
      required: false,
    }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  ProductFilterDto.prototype,
  'values',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by brand IDs',
      type: [String],
      required: false,
    }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  ProductFilterDto.prototype,
  'brandIds',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by merchant IDs',
      type: [String],
      required: false,
    }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  ProductFilterDto.prototype,
  'merchantIds',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by minimum price',
      required: false,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  ProductFilterDto.prototype,
  'minPrice',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by maximum price',
      required: false,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  ProductFilterDto.prototype,
  'maxPrice',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by minimum rating',
      required: false,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  ProductFilterDto.prototype,
  'minRating',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by product availability',
      required: false,
    }),
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  ProductFilterDto.prototype,
  'inStock',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by products on sale',
      required: false,
    }),
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  ProductFilterDto.prototype,
  'onSale',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by new arrivals (products added in the last X days)',
      required: false,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  ProductFilterDto.prototype,
  'newArrivalsWithinDays',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by color',
      type: [String],
      required: false,
    }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  ProductFilterDto.prototype,
  'colors',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by size',
      type: [String],
      required: false,
    }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  ProductFilterDto.prototype,
  'sizes',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by material',
      type: [String],
      required: false,
    }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  ProductFilterDto.prototype,
  'materials',
  void 0,
);
exports.ProductFilterDto = ProductFilterDto = __decorate(
  [(0, graphql_1.InputType)('ProductFilterInput')],
  ProductFilterDto,
);
let MerchantFilterDto = class MerchantFilterDto {
  toGenericFilters() {
    const filters = [];
    const rangeFilters = [];
    if (this.categories?.length) {
      filters.push({
        field: 'categories',
        values: this.categories,
        exact: false,
      });
    }
    if (this.values?.length) {
      filters.push({
        field: 'values',
        values: this.values,
        exact: false,
      });
    }
    if (this.locations?.length) {
      filters.push({
        field: 'location',
        values: this.locations,
        exact: false,
      });
    }
    if (this.minRating !== undefined) {
      rangeFilters.push({
        field: 'rating',
        min: this.minRating,
      });
    }
    if (this.verifiedOnly !== undefined && this.verifiedOnly) {
      filters.push({
        field: 'isVerified',
        values: ['true'],
        exact: true,
      });
    }
    if (this.activeOnly !== undefined && this.activeOnly) {
      filters.push({
        field: 'isActive',
        values: ['true'],
        exact: true,
      });
    }
    if (this.newMerchantsWithinDays !== undefined) {
      const date = new Date();
      date.setDate(date.getDate() - this.newMerchantsWithinDays);
      rangeFilters.push({
        field: 'createdAt',
        min: date.getTime(),
      });
    }
    if (this.minProductCount !== undefined) {
      rangeFilters.push({
        field: 'productCount',
        min: this.minProductCount,
      });
    }
    return { filters, rangeFilters };
  }
};
exports.MerchantFilterDto = MerchantFilterDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by categories',
      type: [String],
      required: false,
    }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  MerchantFilterDto.prototype,
  'categories',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by values (e.g., sustainable, eco-friendly)',
      type: [String],
      required: false,
    }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  MerchantFilterDto.prototype,
  'values',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by location',
      type: [String],
      required: false,
    }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  MerchantFilterDto.prototype,
  'locations',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by minimum rating',
      required: false,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  MerchantFilterDto.prototype,
  'minRating',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by verified merchants only',
      required: false,
    }),
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  MerchantFilterDto.prototype,
  'verifiedOnly',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by active merchants only',
      required: false,
    }),
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  MerchantFilterDto.prototype,
  'activeOnly',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by new merchants (added in the last X days)',
      required: false,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  MerchantFilterDto.prototype,
  'newMerchantsWithinDays',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by minimum product count',
      required: false,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  MerchantFilterDto.prototype,
  'minProductCount',
  void 0,
);
exports.MerchantFilterDto = MerchantFilterDto = __decorate(
  [(0, graphql_1.InputType)('MerchantFilterInput')],
  MerchantFilterDto,
);
let BrandFilterDto = class BrandFilterDto {
  toGenericFilters() {
    const filters = [];
    const rangeFilters = [];
    if (this.categories?.length) {
      filters.push({
        field: 'categories',
        values: this.categories,
        exact: false,
      });
    }
    if (this.values?.length) {
      filters.push({
        field: 'values',
        values: this.values,
        exact: false,
      });
    }
    if (this.locations?.length) {
      filters.push({
        field: 'location',
        values: this.locations,
        exact: false,
      });
    }
    if (this.verifiedOnly !== undefined && this.verifiedOnly) {
      filters.push({
        field: 'isVerified',
        values: ['true'],
        exact: true,
      });
    }
    if (this.activeOnly !== undefined && this.activeOnly) {
      filters.push({
        field: 'isActive',
        values: ['true'],
        exact: true,
      });
    }
    if (this.minFoundedYear !== undefined || this.maxFoundedYear !== undefined) {
      rangeFilters.push({
        field: 'foundedYear',
        min: this.minFoundedYear,
        max: this.maxFoundedYear,
      });
    }
    if (this.newBrandsWithinDays !== undefined) {
      const date = new Date();
      date.setDate(date.getDate() - this.newBrandsWithinDays);
      rangeFilters.push({
        field: 'createdAt',
        min: date.getTime(),
      });
    }
    if (this.minProductCount !== undefined) {
      rangeFilters.push({
        field: 'productCount',
        min: this.minProductCount,
      });
    }
    return { filters, rangeFilters };
  }
};
exports.BrandFilterDto = BrandFilterDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by categories',
      type: [String],
      required: false,
    }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  BrandFilterDto.prototype,
  'categories',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by values (e.g., sustainable, eco-friendly)',
      type: [String],
      required: false,
    }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  BrandFilterDto.prototype,
  'values',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by location',
      type: [String],
      required: false,
    }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  BrandFilterDto.prototype,
  'locations',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by verified brands only',
      required: false,
    }),
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  BrandFilterDto.prototype,
  'verifiedOnly',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by active brands only',
      required: false,
    }),
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  BrandFilterDto.prototype,
  'activeOnly',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by minimum founded year',
      required: false,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  BrandFilterDto.prototype,
  'minFoundedYear',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by maximum founded year',
      required: false,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  BrandFilterDto.prototype,
  'maxFoundedYear',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by new brands (added in the last X days)',
      required: false,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  BrandFilterDto.prototype,
  'newBrandsWithinDays',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter by minimum product count',
      required: false,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  BrandFilterDto.prototype,
  'minProductCount',
  void 0,
);
exports.BrandFilterDto = BrandFilterDto = __decorate(
  [(0, graphql_1.InputType)('BrandFilterInput')],
  BrandFilterDto,
);
let EntityBoostingDto = class EntityBoostingDto {
  constructor() {
    this.productBoost = 1.0;
    this.merchantBoost = 1.0;
    this.brandBoost = 1.0;
  }
};
exports.EntityBoostingDto = EntityBoostingDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Boost factor for products (1.0 = normal, >1.0 = boost, <1.0 = reduce)',
      default: 1.0,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float, { defaultValue: 1.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  EntityBoostingDto.prototype,
  'productBoost',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Boost factor for merchants (1.0 = normal, >1.0 = boost, <1.0 = reduce)',
      default: 1.0,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float, { defaultValue: 1.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  EntityBoostingDto.prototype,
  'merchantBoost',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Boost factor for brands (1.0 = normal, >1.0 = boost, <1.0 = reduce)',
      default: 1.0,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float, { defaultValue: 1.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  EntityBoostingDto.prototype,
  'brandBoost',
  void 0,
);
exports.EntityBoostingDto = EntityBoostingDto = __decorate(
  [(0, graphql_1.InputType)('EntityBoostingInput')],
  EntityBoostingDto,
);
let EnhancedSearchOptionsDto = class EnhancedSearchOptionsDto {
  constructor() {
    this.page = 0;
    this.limit = 20;
    this.enableNlp = false;
    this.personalized = true;
    this.boostByValues = true;
    this.includeSponsoredContent = true;
  }
};
exports.EnhancedSearchOptionsDto = EnhancedSearchOptionsDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Search query',
      required: false,
    }),
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  EnhancedSearchOptionsDto.prototype,
  'query',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Page number (0-indexed)',
      minimum: 0,
      default: 0,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  EnhancedSearchOptionsDto.prototype,
  'page',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Number of items per page',
      minimum: 1,
      maximum: 100,
      default: 20,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 20 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  EnhancedSearchOptionsDto.prototype,
  'limit',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Enable natural language processing',
      default: false,
    }),
    (0, graphql_1.Field)({ defaultValue: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  EnhancedSearchOptionsDto.prototype,
  'enableNlp',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Include personalized results',
      default: true,
    }),
    (0, graphql_1.Field)({ defaultValue: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  EnhancedSearchOptionsDto.prototype,
  'personalized',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Product-specific filters',
      type: ProductFilterDto,
      required: false,
    }),
    (0, graphql_1.Field)(() => ProductFilterDto, { nullable: true }),
    (0, class_transformer_1.Type)(() => ProductFilterDto),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', ProductFilterDto),
  ],
  EnhancedSearchOptionsDto.prototype,
  'productFilters',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Merchant-specific filters',
      type: MerchantFilterDto,
      required: false,
    }),
    (0, graphql_1.Field)(() => MerchantFilterDto, { nullable: true }),
    (0, class_transformer_1.Type)(() => MerchantFilterDto),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', MerchantFilterDto),
  ],
  EnhancedSearchOptionsDto.prototype,
  'merchantFilters',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Brand-specific filters',
      type: BrandFilterDto,
      required: false,
    }),
    (0, graphql_1.Field)(() => BrandFilterDto, { nullable: true }),
    (0, class_transformer_1.Type)(() => BrandFilterDto),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', BrandFilterDto),
  ],
  EnhancedSearchOptionsDto.prototype,
  'brandFilters',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Sort options',
      type: [search_options_dto_1.SortOption],
      required: false,
    }),
    (0, graphql_1.Field)(() => [search_options_dto_1.SortOption], { nullable: true }),
    (0, class_transformer_1.Type)(() => search_options_dto_1.SortOption),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  EnhancedSearchOptionsDto.prototype,
  'sort',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Entity boosting factors',
      type: EntityBoostingDto,
      required: false,
    }),
    (0, graphql_1.Field)(() => EntityBoostingDto, { nullable: true }),
    (0, class_transformer_1.Type)(() => EntityBoostingDto),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', EntityBoostingDto),
  ],
  EnhancedSearchOptionsDto.prototype,
  'entityBoosting',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Boost results matching user values',
      default: true,
    }),
    (0, graphql_1.Field)({ defaultValue: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  EnhancedSearchOptionsDto.prototype,
  'boostByValues',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Include sponsored content',
      default: true,
    }),
    (0, graphql_1.Field)({ defaultValue: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  EnhancedSearchOptionsDto.prototype,
  'includeSponsoredContent',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Experiment ID for A/B testing',
      required: false,
    }),
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  EnhancedSearchOptionsDto.prototype,
  'experimentId',
  void 0,
);
exports.EnhancedSearchOptionsDto = EnhancedSearchOptionsDto = __decorate(
  [(0, graphql_1.InputType)('EnhancedSearchOptionsInput')],
  EnhancedSearchOptionsDto,
);
//# sourceMappingURL=entity-specific-filters.dto.js.map
