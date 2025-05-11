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
exports.SearchResponseType =
  exports.EntityDistributionType =
  exports.EntityRelevanceScoresType =
  exports.SearchResultUnion =
  exports.BrandResultType =
  exports.MerchantResultType =
  exports.ProductResultType =
  exports.HighlightResultType =
  exports.HighlightFieldType =
  exports.FacetType =
  exports.FacetValueType =
  exports.PaginationType =
    void 0;
const graphql_1 = require('@nestjs/graphql');
let PaginationType = class PaginationType {};
exports.PaginationType = PaginationType;
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  PaginationType.prototype,
  'page',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  PaginationType.prototype,
  'limit',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  PaginationType.prototype,
  'total',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  PaginationType.prototype,
  'totalPages',
  void 0,
);
exports.PaginationType = PaginationType = __decorate([(0, graphql_1.ObjectType)()], PaginationType);
let FacetValueType = class FacetValueType {};
exports.FacetValueType = FacetValueType;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  FacetValueType.prototype,
  'value',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  FacetValueType.prototype,
  'count',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Boolean, { nullable: true }), __metadata('design:type', Boolean)],
  FacetValueType.prototype,
  'selected',
  void 0,
);
exports.FacetValueType = FacetValueType = __decorate([(0, graphql_1.ObjectType)()], FacetValueType);
let FacetType = class FacetType {};
exports.FacetType = FacetType;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  FacetType.prototype,
  'name',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  FacetType.prototype,
  'displayName',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [FacetValueType]), __metadata('design:type', Array)],
  FacetType.prototype,
  'values',
  void 0,
);
exports.FacetType = FacetType = __decorate([(0, graphql_1.ObjectType)()], FacetType);
let HighlightFieldType = class HighlightFieldType {};
exports.HighlightFieldType = HighlightFieldType;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  HighlightFieldType.prototype,
  'field',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String]), __metadata('design:type', Array)],
  HighlightFieldType.prototype,
  'snippets',
  void 0,
);
exports.HighlightFieldType = HighlightFieldType = __decorate(
  [(0, graphql_1.ObjectType)()],
  HighlightFieldType,
);
let HighlightResultType = class HighlightResultType {};
exports.HighlightResultType = HighlightResultType;
__decorate(
  [(0, graphql_1.Field)(() => [HighlightFieldType]), __metadata('design:type', Array)],
  HighlightResultType.prototype,
  'fields',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  HighlightResultType.prototype,
  'matchedTerms',
  void 0,
);
exports.HighlightResultType = HighlightResultType = __decorate(
  [(0, graphql_1.ObjectType)()],
  HighlightResultType,
);
let ProductResultType = class ProductResultType {};
exports.ProductResultType = ProductResultType;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ProductResultType.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ProductResultType.prototype,
  'title',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  ProductResultType.prototype,
  'description',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => HighlightResultType, { nullable: true }),
    __metadata('design:type', HighlightResultType),
  ],
  ProductResultType.prototype,
  'highlights',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  ProductResultType.prototype,
  'price',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  ProductResultType.prototype,
  'salePrice',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Boolean), __metadata('design:type', Boolean)],
  ProductResultType.prototype,
  'inStock',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Boolean, { nullable: true }), __metadata('design:type', Boolean)],
  ProductResultType.prototype,
  'onSale',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  ProductResultType.prototype,
  'rating',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata('design:type', Number),
  ],
  ProductResultType.prototype,
  'reviewCount',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  ProductResultType.prototype,
  'images',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  ProductResultType.prototype,
  'thumbnailImage',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  ProductResultType.prototype,
  'categories',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  ProductResultType.prototype,
  'tags',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  ProductResultType.prototype,
  'values',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  ProductResultType.prototype,
  'brandId',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  ProductResultType.prototype,
  'brandName',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  ProductResultType.prototype,
  'merchantId',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  ProductResultType.prototype,
  'merchantName',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  ProductResultType.prototype,
  'colors',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  ProductResultType.prototype,
  'sizes',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  ProductResultType.prototype,
  'materials',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  ProductResultType.prototype,
  'relevanceScore',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Boolean, { nullable: true }), __metadata('design:type', Boolean)],
  ProductResultType.prototype,
  'sponsored',
  void 0,
);
exports.ProductResultType = ProductResultType = __decorate(
  [(0, graphql_1.ObjectType)()],
  ProductResultType,
);
let MerchantResultType = class MerchantResultType {};
exports.MerchantResultType = MerchantResultType;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  MerchantResultType.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  MerchantResultType.prototype,
  'name',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  MerchantResultType.prototype,
  'description',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => HighlightResultType, { nullable: true }),
    __metadata('design:type', HighlightResultType),
  ],
  MerchantResultType.prototype,
  'highlights',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  MerchantResultType.prototype,
  'logo',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  MerchantResultType.prototype,
  'coverImage',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  MerchantResultType.prototype,
  'images',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  MerchantResultType.prototype,
  'categories',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  MerchantResultType.prototype,
  'values',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  MerchantResultType.prototype,
  'location',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  MerchantResultType.prototype,
  'rating',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata('design:type', Number),
  ],
  MerchantResultType.prototype,
  'reviewCount',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Boolean, { nullable: true }), __metadata('design:type', Boolean)],
  MerchantResultType.prototype,
  'verified',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Boolean, { nullable: true }), __metadata('design:type', Boolean)],
  MerchantResultType.prototype,
  'active',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata('design:type', Number),
  ],
  MerchantResultType.prototype,
  'productCount',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  MerchantResultType.prototype,
  'relevanceScore',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Boolean, { nullable: true }), __metadata('design:type', Boolean)],
  MerchantResultType.prototype,
  'sponsored',
  void 0,
);
exports.MerchantResultType = MerchantResultType = __decorate(
  [(0, graphql_1.ObjectType)()],
  MerchantResultType,
);
let BrandResultType = class BrandResultType {};
exports.BrandResultType = BrandResultType;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  BrandResultType.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  BrandResultType.prototype,
  'name',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  BrandResultType.prototype,
  'description',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => HighlightResultType, { nullable: true }),
    __metadata('design:type', HighlightResultType),
  ],
  BrandResultType.prototype,
  'highlights',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  BrandResultType.prototype,
  'logo',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  BrandResultType.prototype,
  'coverImage',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  BrandResultType.prototype,
  'images',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  BrandResultType.prototype,
  'categories',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  BrandResultType.prototype,
  'values',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  BrandResultType.prototype,
  'location',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata('design:type', Number),
  ],
  BrandResultType.prototype,
  'foundedYear',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  BrandResultType.prototype,
  'story',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Boolean, { nullable: true }), __metadata('design:type', Boolean)],
  BrandResultType.prototype,
  'verified',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Boolean, { nullable: true }), __metadata('design:type', Boolean)],
  BrandResultType.prototype,
  'active',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata('design:type', Number),
  ],
  BrandResultType.prototype,
  'productCount',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  BrandResultType.prototype,
  'relevanceScore',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Boolean, { nullable: true }), __metadata('design:type', Boolean)],
  BrandResultType.prototype,
  'sponsored',
  void 0,
);
exports.BrandResultType = BrandResultType = __decorate(
  [(0, graphql_1.ObjectType)()],
  BrandResultType,
);
exports.SearchResultUnion = (0, graphql_1.createUnionType)({
  name: 'SearchResult',
  types: () => [ProductResultType, MerchantResultType, BrandResultType],
  resolveType(value) {
    if (value.title) {
      return ProductResultType;
    }
    if (value.foundedYear) {
      return BrandResultType;
    }
    return MerchantResultType;
  },
});
let EntityRelevanceScoresType = class EntityRelevanceScoresType {};
exports.EntityRelevanceScoresType = EntityRelevanceScoresType;
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  EntityRelevanceScoresType.prototype,
  'products',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  EntityRelevanceScoresType.prototype,
  'merchants',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  EntityRelevanceScoresType.prototype,
  'brands',
  void 0,
);
exports.EntityRelevanceScoresType = EntityRelevanceScoresType = __decorate(
  [(0, graphql_1.ObjectType)()],
  EntityRelevanceScoresType,
);
let EntityDistributionType = class EntityDistributionType {};
exports.EntityDistributionType = EntityDistributionType;
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  EntityDistributionType.prototype,
  'products',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  EntityDistributionType.prototype,
  'merchants',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  EntityDistributionType.prototype,
  'brands',
  void 0,
);
exports.EntityDistributionType = EntityDistributionType = __decorate(
  [(0, graphql_1.ObjectType)()],
  EntityDistributionType,
);
let SearchResponseType = class SearchResponseType {
  constructor() {
    this.highlightsEnabled = false;
  }
};
exports.SearchResponseType = SearchResponseType;
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  SearchResponseType.prototype,
  'query',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => PaginationType), __metadata('design:type', PaginationType)],
  SearchResponseType.prototype,
  'pagination',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [exports.SearchResultUnion]), __metadata('design:type', Array)],
  SearchResponseType.prototype,
  'results',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean, { defaultValue: false }),
    __metadata('design:type', Boolean),
  ],
  SearchResponseType.prototype,
  'highlightsEnabled',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [FacetType], { nullable: true }), __metadata('design:type', Array)],
  SearchResponseType.prototype,
  'facets',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => EntityRelevanceScoresType, { nullable: true }),
    __metadata('design:type', EntityRelevanceScoresType),
  ],
  SearchResponseType.prototype,
  'relevanceScores',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => EntityDistributionType, { nullable: true }),
    __metadata('design:type', EntityDistributionType),
  ],
  SearchResponseType.prototype,
  'entityDistribution',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Boolean, { nullable: true }), __metadata('design:type', Boolean)],
  SearchResponseType.prototype,
  'isNlpEnabled',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Boolean, { nullable: true }), __metadata('design:type', Boolean)],
  SearchResponseType.prototype,
  'isPersonalized',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  SearchResponseType.prototype,
  'experimentId',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  SearchResponseType.prototype,
  'appliedFilters',
  void 0,
);
exports.SearchResponseType = SearchResponseType = __decorate(
  [(0, graphql_1.ObjectType)()],
  SearchResponseType,
);
//# sourceMappingURL=search-response.type.js.map
