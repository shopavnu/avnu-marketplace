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
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.NlpResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const natural_language_search_service_1 = require('./services/natural-language-search.service');
const nlp_service_1 = require('./services/nlp.service');
const product_entity_1 = require('../products/entities/product.entity');
const pagination_dto_1 = require('../../common/dto/pagination.dto');
let QueryEntity = class QueryEntity {};
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  QueryEntity.prototype,
  'type',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  QueryEntity.prototype,
  'value',
  void 0,
);
QueryEntity = __decorate([(0, graphql_1.ObjectType)()], QueryEntity);
let QueryFilters = class QueryFilters {};
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  QueryFilters.prototype,
  'categories',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata('design:type', Number),
  ],
  QueryFilters.prototype,
  'priceMin',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata('design:type', Number),
  ],
  QueryFilters.prototype,
  'priceMax',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  QueryFilters.prototype,
  'brandName',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', Boolean)],
  QueryFilters.prototype,
  'inStock',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  QueryFilters.prototype,
  'values',
  void 0,
);
QueryFilters = __decorate([(0, graphql_1.ObjectType)()], QueryFilters);
let ProcessedQueryResult = class ProcessedQueryResult {};
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ProcessedQueryResult.prototype,
  'originalQuery',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ProcessedQueryResult.prototype,
  'processedQuery',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String]), __metadata('design:type', Array)],
  ProcessedQueryResult.prototype,
  'tokens',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String]), __metadata('design:type', Array)],
  ProcessedQueryResult.prototype,
  'stems',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [QueryEntity]), __metadata('design:type', Array)],
  ProcessedQueryResult.prototype,
  'entities',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ProcessedQueryResult.prototype,
  'intent',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => QueryFilters), __metadata('design:type', QueryFilters)],
  ProcessedQueryResult.prototype,
  'filters',
  void 0,
);
ProcessedQueryResult = __decorate([(0, graphql_1.ObjectType)()], ProcessedQueryResult);
let NlpSearchResult = class NlpSearchResult {};
__decorate(
  [(0, graphql_1.Field)(() => [product_entity_1.Product]), __metadata('design:type', Array)],
  NlpSearchResult.prototype,
  'items',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  NlpSearchResult.prototype,
  'total',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  NlpSearchResult.prototype,
  'enhancedQuery',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => QueryFilters), __metadata('design:type', QueryFilters)],
  NlpSearchResult.prototype,
  'detectedFilters',
  void 0,
);
NlpSearchResult = __decorate([(0, graphql_1.ObjectType)()], NlpSearchResult);
let UserPreferencesInput = class UserPreferencesInput {};
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  UserPreferencesInput.prototype,
  'favoriteCategories',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  UserPreferencesInput.prototype,
  'favoriteValues',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  UserPreferencesInput.prototype,
  'priceSensitivity',
  void 0,
);
UserPreferencesInput = __decorate([(0, graphql_1.InputType)()], UserPreferencesInput);
let KeywordsResult = class KeywordsResult {};
__decorate(
  [(0, graphql_1.Field)(() => [String]), __metadata('design:type', Array)],
  KeywordsResult.prototype,
  'keywords',
  void 0,
);
KeywordsResult = __decorate([(0, graphql_1.ObjectType)()], KeywordsResult);
let SimilarityResult = class SimilarityResult {};
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  SimilarityResult.prototype,
  'similarity',
  void 0,
);
SimilarityResult = __decorate([(0, graphql_1.ObjectType)()], SimilarityResult);
let ClassificationResult = class ClassificationResult {};
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ClassificationResult.prototype,
  'category',
  void 0,
);
ClassificationResult = __decorate([(0, graphql_1.ObjectType)()], ClassificationResult);
let _RelevanceScore = class _RelevanceScore {};
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  _RelevanceScore.prototype,
  'score',
  void 0,
);
_RelevanceScore = __decorate([(0, graphql_1.ObjectType)()], _RelevanceScore);
let NlpResolver = class NlpResolver {
  constructor(naturalLanguageSearchService, nlpService) {
    this.naturalLanguageSearchService = naturalLanguageSearchService;
    this.nlpService = nlpService;
  }
  async searchProducts(query, paginationDto) {
    return this.naturalLanguageSearchService.searchProducts(
      query,
      paginationDto || { page: 1, limit: 10 },
    );
  }
  analyzeQuery(query) {
    return this.nlpService.processQuery(query);
  }
  async generateSearchSuggestions(query, limit) {
    return this.naturalLanguageSearchService.generateSearchSuggestions(query, limit);
  }
  classifySearchQuery(query) {
    return { category: this.naturalLanguageSearchService.classifySearchQuery(query) };
  }
  async getRecommendationsFromDescription(description, limit) {
    return this.naturalLanguageSearchService.getRecommendationsFromDescription(description, limit);
  }
  async getPersonalizedSearchResults(query, userPreferences, paginationDto) {
    return this.naturalLanguageSearchService.getPersonalizedSearchResults(
      query,
      userPreferences,
      paginationDto || { page: 1, limit: 10 },
    );
  }
  extractKeywords(text, maxKeywords) {
    return {
      keywords: this.nlpService.extractKeywords(text, maxKeywords),
    };
  }
  calculateSimilarity(text1, text2) {
    return {
      similarity: this.nlpService.calculateSimilarity(text1, text2),
    };
  }
};
exports.NlpResolver = NlpResolver;
__decorate(
  [
    (0, graphql_1.Query)(() => NlpSearchResult, { name: 'nlpSearch' }),
    __param(0, (0, graphql_1.Args)('query')),
    __param(1, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, pagination_dto_1.PaginationDto]),
    __metadata('design:returntype', Promise),
  ],
  NlpResolver.prototype,
  'searchProducts',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => ProcessedQueryResult, { name: 'analyzeQuery' }),
    __param(0, (0, graphql_1.Args)('query')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  NlpResolver.prototype,
  'analyzeQuery',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [String], { name: 'searchSuggestions' }),
    __param(0, (0, graphql_1.Args)('query')),
    __param(1, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Number]),
    __metadata('design:returntype', Promise),
  ],
  NlpResolver.prototype,
  'generateSearchSuggestions',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => ClassificationResult, { name: 'classifyQuery' }),
    __param(0, (0, graphql_1.Args)('query')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  NlpResolver.prototype,
  'classifySearchQuery',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => [product_entity_1.Product], {
      name: 'getRecommendationsFromDescription',
    }),
    __param(0, (0, graphql_1.Args)('description')),
    __param(1, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Number]),
    __metadata('design:returntype', Promise),
  ],
  NlpResolver.prototype,
  'getRecommendationsFromDescription',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => NlpSearchResult, { name: 'getPersonalizedSearchResults' }),
    __param(0, (0, graphql_1.Args)('query')),
    __param(1, (0, graphql_1.Args)('userPreferences')),
    __param(2, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, UserPreferencesInput, pagination_dto_1.PaginationDto]),
    __metadata('design:returntype', Promise),
  ],
  NlpResolver.prototype,
  'getPersonalizedSearchResults',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => KeywordsResult, { name: 'extractKeywords' }),
    __param(0, (0, graphql_1.Args)('text')),
    __param(1, (0, graphql_1.Args)('maxKeywords', { type: () => graphql_1.Int, nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Number]),
    __metadata('design:returntype', void 0),
  ],
  NlpResolver.prototype,
  'extractKeywords',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => SimilarityResult, { name: 'calculateSimilarity' }),
    __param(0, (0, graphql_1.Args)('text1')),
    __param(1, (0, graphql_1.Args)('text2')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String]),
    __metadata('design:returntype', void 0),
  ],
  NlpResolver.prototype,
  'calculateSimilarity',
  null,
);
exports.NlpResolver = NlpResolver = __decorate(
  [
    (0, graphql_1.Resolver)(),
    __metadata('design:paramtypes', [
      natural_language_search_service_1.NaturalLanguageSearchService,
      nlp_service_1.NlpService,
    ]),
  ],
  NlpResolver,
);
//# sourceMappingURL=nlp.resolver.js.map
