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
exports.SearchResponseDto =
  exports.BrandSearchResult =
  exports.MerchantSearchResult =
  exports.ProductSearchResult =
  exports.SearchFacets =
  exports.TermFacet =
  exports.SearchMetadata =
  exports.PriceRange =
  exports.PriceFacet =
  exports.ValueFacet =
  exports.CategoryFacet =
  exports.PaginationInfo =
    void 0;
const swagger_1 = require('@nestjs/swagger');
const graphql_1 = require('@nestjs/graphql');
const graphql_type_json_1 = require('graphql-type-json');
const highlight_dto_1 = require('./highlight.dto');
let PaginationInfo = class PaginationInfo {};
exports.PaginationInfo = PaginationInfo;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Total number of items',
      example: 100,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata('design:type', Number),
  ],
  PaginationInfo.prototype,
  'total',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Current page (0-indexed)',
      example: 0,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata('design:type', Number),
  ],
  PaginationInfo.prototype,
  'page',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Number of items per page',
      example: 20,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata('design:type', Number),
  ],
  PaginationInfo.prototype,
  'limit',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Total number of pages',
      example: 5,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata('design:type', Number),
  ],
  PaginationInfo.prototype,
  'pages',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Total number of pages (alias for pages)',
      example: 5,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata('design:type', Number),
  ],
  PaginationInfo.prototype,
  'totalPages',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Whether there is a next page',
      example: true,
    }),
    (0, graphql_1.Field)(() => Boolean),
    __metadata('design:type', Boolean),
  ],
  PaginationInfo.prototype,
  'hasNext',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Whether there is a previous page',
      example: false,
    }),
    (0, graphql_1.Field)(() => Boolean),
    __metadata('design:type', Boolean),
  ],
  PaginationInfo.prototype,
  'hasPrevious',
  void 0,
);
exports.PaginationInfo = PaginationInfo = __decorate(
  [(0, graphql_1.ObjectType)('PaginationInfo')],
  PaginationInfo,
);
let CategoryFacet = class CategoryFacet {};
exports.CategoryFacet = CategoryFacet;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Category name',
      example: 'Clothing',
    }),
    (0, graphql_1.Field)(),
    __metadata('design:type', String),
  ],
  CategoryFacet.prototype,
  'name',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Number of items in this category',
      example: 42,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata('design:type', Number),
  ],
  CategoryFacet.prototype,
  'count',
  void 0,
);
exports.CategoryFacet = CategoryFacet = __decorate(
  [(0, graphql_1.ObjectType)('CategoryFacet')],
  CategoryFacet,
);
let ValueFacet = class ValueFacet {};
exports.ValueFacet = ValueFacet;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Value name',
      example: 'Sustainable',
    }),
    (0, graphql_1.Field)(),
    __metadata('design:type', String),
  ],
  ValueFacet.prototype,
  'name',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Number of items with this value',
      example: 27,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata('design:type', Number),
  ],
  ValueFacet.prototype,
  'count',
  void 0,
);
exports.ValueFacet = ValueFacet = __decorate([(0, graphql_1.ObjectType)('ValueFacet')], ValueFacet);
let PriceFacet = class PriceFacet {};
exports.PriceFacet = PriceFacet;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Minimum price',
      example: 10.99,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata('design:type', Number),
  ],
  PriceFacet.prototype,
  'min',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Maximum price',
      example: 199.99,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata('design:type', Number),
  ],
  PriceFacet.prototype,
  'max',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Price ranges',
      example: [
        { min: 0, max: 50, count: 20 },
        { min: 50, max: 100, count: 15 },
        { min: 100, max: 200, count: 7 },
      ],
    }),
    (0, graphql_1.Field)(() => [PriceRange]),
    __metadata('design:type', Array),
  ],
  PriceFacet.prototype,
  'ranges',
  void 0,
);
exports.PriceFacet = PriceFacet = __decorate([(0, graphql_1.ObjectType)('PriceFacet')], PriceFacet);
let PriceRange = class PriceRange {};
exports.PriceRange = PriceRange;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Minimum price in range',
      example: 50,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata('design:type', Number),
  ],
  PriceRange.prototype,
  'min',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Maximum price in range',
      example: 100,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata('design:type', Number),
  ],
  PriceRange.prototype,
  'max',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Number of items in this price range',
      example: 15,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata('design:type', Number),
  ],
  PriceRange.prototype,
  'count',
  void 0,
);
exports.PriceRange = PriceRange = __decorate([(0, graphql_1.ObjectType)('PriceRange')], PriceRange);
let SearchMetadata = class SearchMetadata {};
exports.SearchMetadata = SearchMetadata;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Search duration in milliseconds',
      example: 123,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata('design:type', Number),
  ],
  SearchMetadata.prototype,
  'searchDuration',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Relevance algorithm used',
      example: 'intent',
    }),
    (0, graphql_1.Field)(),
    __metadata('design:type', String),
  ],
  SearchMetadata.prototype,
  'algorithm',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'A/B test ID if applicable',
      example: 'search-relevance-test-001',
      required: false,
    }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata('design:type', String),
  ],
  SearchMetadata.prototype,
  'testId',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'A/B test variant ID if applicable',
      example: 'intent-boosted',
      required: false,
    }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata('design:type', String),
  ],
  SearchMetadata.prototype,
  'variantId',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Whether personalization was applied',
      example: true,
      required: false,
    }),
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata('design:type', Boolean),
  ],
  SearchMetadata.prototype,
  'personalized',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Personalization strength if applied',
      example: 1.0,
      required: false,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  SearchMetadata.prototype,
  'personalizationStrength',
  void 0,
);
exports.SearchMetadata = SearchMetadata = __decorate(
  [(0, graphql_1.ObjectType)('SearchMetadata')],
  SearchMetadata,
);
let TermFacet = class TermFacet {};
exports.TermFacet = TermFacet;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Facet item name/key',
      example: 'Example Brand',
    }),
    (0, graphql_1.Field)(),
    __metadata('design:type', String),
  ],
  TermFacet.prototype,
  'name',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Number of items in this facet',
      example: 10,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata('design:type', Number),
  ],
  TermFacet.prototype,
  'count',
  void 0,
);
exports.TermFacet = TermFacet = __decorate([(0, graphql_1.ObjectType)('TermFacet')], TermFacet);
let SearchFacets = class SearchFacets {};
exports.SearchFacets = SearchFacets;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Category facets',
      type: [CategoryFacet],
    }),
    (0, graphql_1.Field)(() => [CategoryFacet]),
    __metadata('design:type', Array),
  ],
  SearchFacets.prototype,
  'categories',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Value facets',
      type: [ValueFacet],
    }),
    (0, graphql_1.Field)(() => [ValueFacet]),
    __metadata('design:type', Array),
  ],
  SearchFacets.prototype,
  'values',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Price facets',
      type: PriceFacet,
    }),
    (0, graphql_1.Field)(() => PriceFacet, { nullable: true }),
    __metadata('design:type', PriceFacet),
  ],
  SearchFacets.prototype,
  'price',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Brand facets',
      type: [TermFacet],
      required: false,
    }),
    (0, graphql_1.Field)(() => [TermFacet], { nullable: true }),
    __metadata('design:type', Array),
  ],
  SearchFacets.prototype,
  'brands',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Location facets',
      type: [TermFacet],
      required: false,
    }),
    (0, graphql_1.Field)(() => [TermFacet], { nullable: true }),
    __metadata('design:type', Array),
  ],
  SearchFacets.prototype,
  'locations',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Entity Type facets',
      type: [TermFacet],
      required: false,
    }),
    (0, graphql_1.Field)(() => [TermFacet], { nullable: true }),
    __metadata('design:type', Array),
  ],
  SearchFacets.prototype,
  'entityTypes',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Merchant facets',
      type: [TermFacet],
      required: false,
    }),
    (0, graphql_1.Field)(() => [TermFacet], { nullable: true }),
    __metadata('design:type', Array),
  ],
  SearchFacets.prototype,
  'merchants',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Rating facets',
      type: [TermFacet],
      required: false,
    }),
    (0, graphql_1.Field)(() => [TermFacet], { nullable: true }),
    __metadata('design:type', Array),
  ],
  SearchFacets.prototype,
  'ratings',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Founded Year facets',
      type: [TermFacet],
      required: false,
    }),
    (0, graphql_1.Field)(() => [TermFacet], { nullable: true }),
    __metadata('design:type', Array),
  ],
  SearchFacets.prototype,
  'foundedYears',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Tag facets',
      type: [TermFacet],
      required: false,
    }),
    (0, graphql_1.Field)(() => [TermFacet], { nullable: true }),
    __metadata('design:type', Array),
  ],
  SearchFacets.prototype,
  'tags',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Verification Status facets',
      type: [TermFacet],
      required: false,
    }),
    (0, graphql_1.Field)(() => [TermFacet], { nullable: true }),
    __metadata('design:type', Array),
  ],
  SearchFacets.prototype,
  'verificationStatus',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Color facets',
      type: [TermFacet],
      required: false,
    }),
    (0, graphql_1.Field)(() => [TermFacet], { nullable: true }),
    __metadata('design:type', Array),
  ],
  SearchFacets.prototype,
  'colors',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Size facets',
      type: [TermFacet],
      required: false,
    }),
    (0, graphql_1.Field)(() => [TermFacet], { nullable: true }),
    __metadata('design:type', Array),
  ],
  SearchFacets.prototype,
  'sizes',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Material facets',
      type: [TermFacet],
      required: false,
    }),
    (0, graphql_1.Field)(() => [TermFacet], { nullable: true }),
    __metadata('design:type', Array),
  ],
  SearchFacets.prototype,
  'materials',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'In-stock status facets',
      type: [TermFacet],
      required: false,
    }),
    (0, graphql_1.Field)(() => [TermFacet], { nullable: true }),
    __metadata('design:type', Array),
  ],
  SearchFacets.prototype,
  'inStock',
  void 0,
);
exports.SearchFacets = SearchFacets = __decorate(
  [(0, graphql_1.ObjectType)('SearchFacets')],
  SearchFacets,
);
let ProductSearchResult = class ProductSearchResult {};
exports.ProductSearchResult = ProductSearchResult;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Product ID',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata('design:type', String),
  ],
  ProductSearchResult.prototype,
  'id',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Highlighted content for this product',
      type: highlight_dto_1.HighlightResult,
      required: false,
    }),
    (0, graphql_1.Field)(() => highlight_dto_1.HighlightResult, { nullable: true }),
    __metadata('design:type', highlight_dto_1.HighlightResult),
  ],
  ProductSearchResult.prototype,
  'highlights',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Product title',
      example: 'Organic Cotton T-Shirt',
    }),
    (0, graphql_1.Field)(),
    __metadata('design:type', String),
  ],
  ProductSearchResult.prototype,
  'title',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Product description',
      example: 'Comfortable organic cotton t-shirt made with sustainable practices.',
    }),
    (0, graphql_1.Field)(),
    __metadata('design:type', String),
  ],
  ProductSearchResult.prototype,
  'description',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Product price',
      example: 29.99,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata('design:type', Number),
  ],
  ProductSearchResult.prototype,
  'price',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Product image URL',
      example: 'https://example.com/images/t-shirt.jpg',
    }),
    (0, graphql_1.Field)(),
    __metadata('design:type', String),
  ],
  ProductSearchResult.prototype,
  'image',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Brand name',
      example: 'EcoWear',
    }),
    (0, graphql_1.Field)(),
    __metadata('design:type', String),
  ],
  ProductSearchResult.prototype,
  'brandName',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Brand ID',
      example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata('design:type', String),
  ],
  ProductSearchResult.prototype,
  'brandId',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Categories',
      example: ['Clothing', 'T-Shirts'],
    }),
    (0, graphql_1.Field)(() => [String]),
    __metadata('design:type', Array),
  ],
  ProductSearchResult.prototype,
  'categories',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Values',
      example: ['Sustainable', 'Ethical'],
    }),
    (0, graphql_1.Field)(() => [String]),
    __metadata('design:type', Array),
  ],
  ProductSearchResult.prototype,
  'values',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Rating',
      example: 4.5,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata('design:type', Number),
  ],
  ProductSearchResult.prototype,
  'rating',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Number of reviews',
      example: 42,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata('design:type', Number),
  ],
  ProductSearchResult.prototype,
  'reviewCount',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Whether the product is sponsored',
      example: false,
    }),
    (0, graphql_1.Field)(() => Boolean),
    __metadata('design:type', Boolean),
  ],
  ProductSearchResult.prototype,
  'isSponsored',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Relevance score',
      example: 0.95,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata('design:type', Number),
  ],
  ProductSearchResult.prototype,
  'score',
  void 0,
);
exports.ProductSearchResult = ProductSearchResult = __decorate(
  [(0, graphql_1.ObjectType)('ProductSearchResult')],
  ProductSearchResult,
);
let MerchantSearchResult = class MerchantSearchResult {};
exports.MerchantSearchResult = MerchantSearchResult;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Merchant ID',
      example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata('design:type', String),
  ],
  MerchantSearchResult.prototype,
  'id',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Highlighted content for this merchant',
      type: highlight_dto_1.HighlightResult,
      required: false,
    }),
    (0, graphql_1.Field)(() => highlight_dto_1.HighlightResult, { nullable: true }),
    __metadata('design:type', highlight_dto_1.HighlightResult),
  ],
  MerchantSearchResult.prototype,
  'highlights',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Merchant name',
      example: 'EcoWear',
    }),
    (0, graphql_1.Field)(),
    __metadata('design:type', String),
  ],
  MerchantSearchResult.prototype,
  'name',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Merchant description',
      example: 'Sustainable clothing brand focused on eco-friendly materials.',
    }),
    (0, graphql_1.Field)(),
    __metadata('design:type', String),
  ],
  MerchantSearchResult.prototype,
  'description',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Merchant logo URL',
      example: 'https://example.com/images/ecowear-logo.jpg',
    }),
    (0, graphql_1.Field)(),
    __metadata('design:type', String),
  ],
  MerchantSearchResult.prototype,
  'logo',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Merchant location',
      example: 'Portland, OR',
    }),
    (0, graphql_1.Field)(),
    __metadata('design:type', String),
  ],
  MerchantSearchResult.prototype,
  'location',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Categories',
      example: ['Clothing', 'Accessories'],
    }),
    (0, graphql_1.Field)(() => [String]),
    __metadata('design:type', Array),
  ],
  MerchantSearchResult.prototype,
  'categories',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Values',
      example: ['Sustainable', 'Ethical', 'Local'],
    }),
    (0, graphql_1.Field)(() => [String]),
    __metadata('design:type', Array),
  ],
  MerchantSearchResult.prototype,
  'values',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Rating',
      example: 4.7,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata('design:type', Number),
  ],
  MerchantSearchResult.prototype,
  'rating',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Number of reviews',
      example: 156,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata('design:type', Number),
  ],
  MerchantSearchResult.prototype,
  'reviewCount',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Whether the merchant is sponsored',
      example: false,
    }),
    (0, graphql_1.Field)(() => Boolean),
    __metadata('design:type', Boolean),
  ],
  MerchantSearchResult.prototype,
  'isSponsored',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Relevance score',
      example: 0.92,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata('design:type', Number),
  ],
  MerchantSearchResult.prototype,
  'score',
  void 0,
);
exports.MerchantSearchResult = MerchantSearchResult = __decorate(
  [(0, graphql_1.ObjectType)('MerchantSearchResult')],
  MerchantSearchResult,
);
let BrandSearchResult = class BrandSearchResult {};
exports.BrandSearchResult = BrandSearchResult;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Brand ID',
      example: '123e4567-e89b-12d3-a456-426614174003',
    }),
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata('design:type', String),
  ],
  BrandSearchResult.prototype,
  'id',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Highlighted content for this brand',
      type: highlight_dto_1.HighlightResult,
      required: false,
    }),
    (0, graphql_1.Field)(() => highlight_dto_1.HighlightResult, { nullable: true }),
    __metadata('design:type', highlight_dto_1.HighlightResult),
  ],
  BrandSearchResult.prototype,
  'highlights',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Brand name',
      example: 'EcoWear',
    }),
    (0, graphql_1.Field)(),
    __metadata('design:type', String),
  ],
  BrandSearchResult.prototype,
  'name',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Brand description',
      example: 'Sustainable clothing brand focused on eco-friendly materials.',
    }),
    (0, graphql_1.Field)(),
    __metadata('design:type', String),
  ],
  BrandSearchResult.prototype,
  'description',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Brand logo URL',
      example: 'https://example.com/images/ecowear-logo.jpg',
    }),
    (0, graphql_1.Field)(),
    __metadata('design:type', String),
  ],
  BrandSearchResult.prototype,
  'logo',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Brand hero image URL',
      example: 'https://example.com/images/ecowear-hero.jpg',
    }),
    (0, graphql_1.Field)(),
    __metadata('design:type', String),
  ],
  BrandSearchResult.prototype,
  'heroImage',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Brand location',
      example: 'Portland, OR',
    }),
    (0, graphql_1.Field)(),
    __metadata('design:type', String),
  ],
  BrandSearchResult.prototype,
  'location',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Categories',
      example: ['Clothing', 'Accessories'],
    }),
    (0, graphql_1.Field)(() => [String]),
    __metadata('design:type', Array),
  ],
  BrandSearchResult.prototype,
  'categories',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Values',
      example: ['Sustainable', 'Ethical', 'Local'],
    }),
    (0, graphql_1.Field)(() => [String]),
    __metadata('design:type', Array),
  ],
  BrandSearchResult.prototype,
  'values',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Year founded',
      example: 2015,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata('design:type', Number),
  ],
  BrandSearchResult.prototype,
  'foundedYear',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Whether the brand is sponsored',
      example: false,
    }),
    (0, graphql_1.Field)(() => Boolean),
    __metadata('design:type', Boolean),
  ],
  BrandSearchResult.prototype,
  'isSponsored',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Relevance score',
      example: 0.89,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata('design:type', Number),
  ],
  BrandSearchResult.prototype,
  'score',
  void 0,
);
exports.BrandSearchResult = BrandSearchResult = __decorate(
  [(0, graphql_1.ObjectType)('BrandSearchResult')],
  BrandSearchResult,
);
let SearchResponseDto = class SearchResponseDto {};
exports.SearchResponseDto = SearchResponseDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Pagination information',
      type: PaginationInfo,
    }),
    (0, graphql_1.Field)(() => PaginationInfo),
    __metadata('design:type', PaginationInfo),
  ],
  SearchResponseDto.prototype,
  'pagination',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Whether highlights are enabled in the response',
      example: true,
      required: false,
    }),
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata('design:type', Boolean),
  ],
  SearchResponseDto.prototype,
  'highlightsEnabled',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Search facets for filtering',
      type: SearchFacets,
    }),
    (0, graphql_1.Field)(() => SearchFacets),
    __metadata('design:type', SearchFacets),
  ],
  SearchResponseDto.prototype,
  'facets',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Product search results',
      type: [ProductSearchResult],
    }),
    (0, graphql_1.Field)(() => [ProductSearchResult], { nullable: true }),
    __metadata('design:type', Array),
  ],
  SearchResponseDto.prototype,
  'products',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Merchant search results',
      type: [MerchantSearchResult],
    }),
    (0, graphql_1.Field)(() => [MerchantSearchResult], { nullable: true }),
    __metadata('design:type', Array),
  ],
  SearchResponseDto.prototype,
  'merchants',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Brand search results',
      type: [BrandSearchResult],
    }),
    (0, graphql_1.Field)(() => [BrandSearchResult], { nullable: true }),
    __metadata('design:type', Array),
  ],
  SearchResponseDto.prototype,
  'brands',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Search query used',
      example: 'sustainable clothing',
    }),
    (0, graphql_1.Field)(),
    __metadata('design:type', String),
  ],
  SearchResponseDto.prototype,
  'query',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Whether NLP was used for the search',
      example: true,
    }),
    (0, graphql_1.Field)(() => Boolean),
    __metadata('design:type', Boolean),
  ],
  SearchResponseDto.prototype,
  'usedNlp',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'NLP-processed query (if NLP was used)',
      example: 'sustainable eco-friendly clothing apparel',
      required: false,
    }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata('design:type', String),
  ],
  SearchResponseDto.prototype,
  'processedQuery',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Experiment variant (if A/B testing is active)',
      example: 'variant_a',
      required: false,
    }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata('design:type', String),
  ],
  SearchResponseDto.prototype,
  'experimentVariant',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Relevance scores for each result',
      required: false,
    }),
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata('design:type', Object),
  ],
  SearchResponseDto.prototype,
  'relevanceScores',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Distribution of results by entity type',
      required: false,
    }),
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata('design:type', Object),
  ],
  SearchResponseDto.prototype,
  'entityDistribution',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Experiment ID for A/B testing',
      required: false,
    }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata('design:type', String),
  ],
  SearchResponseDto.prototype,
  'experimentId',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Search metadata including performance and relevance information',
      required: false,
    }),
    (0, graphql_1.Field)(() => SearchMetadata, { nullable: true }),
    __metadata('design:type', SearchMetadata),
  ],
  SearchResponseDto.prototype,
  'metadata',
  void 0,
);
exports.SearchResponseDto = SearchResponseDto = __decorate(
  [(0, graphql_1.ObjectType)('SearchResponse')],
  SearchResponseDto,
);
//# sourceMappingURL=search-response.dto.js.map
