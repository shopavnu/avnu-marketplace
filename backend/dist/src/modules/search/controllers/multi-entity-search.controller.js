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
var MultiEntitySearchController_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.MultiEntitySearchController = void 0;
const common_1 = require('@nestjs/common');
const swagger_1 = require('@nestjs/swagger');
const nlp_search_service_1 = require('../services/nlp-search.service');
const search_entity_type_enum_1 = require('../enums/search-entity-type.enum');
const search_response_dto_1 = require('../dto/search-response.dto');
const entity_specific_filters_dto_1 = require('../dto/entity-specific-filters.dto');
const analytics_service_1 = require('../../analytics/services/analytics.service');
const search_analytics_service_1 = require('../../analytics/services/search-analytics.service');
const entity_facet_generator_service_1 = require('../services/entity-facet-generator.service');
const entity_relevance_scorer_service_1 = require('../services/entity-relevance-scorer.service');
let MultiEntitySearchController =
  (MultiEntitySearchController_1 = class MultiEntitySearchController {
    constructor(
      nlpSearchService,
      analyticsService,
      searchAnalyticsService,
      entityFacetGenerator,
      entityRelevanceScorer,
    ) {
      this.nlpSearchService = nlpSearchService;
      this.analyticsService = analyticsService;
      this.searchAnalyticsService = searchAnalyticsService;
      this.entityFacetGenerator = entityFacetGenerator;
      this.entityRelevanceScorer = entityRelevanceScorer;
      this.logger = new common_1.Logger(MultiEntitySearchController_1.name);
    }
    async enhancedSearch(options, request) {
      this.logger.debug(`Enhanced search request: ${JSON.stringify(options)}`);
      const user = request.user;
      const searchOptions = this.convertToSearchOptions(options);
      const results = await this.nlpSearchService.searchAsync(searchOptions, user);
      this.searchAnalyticsService.trackEvent('enhanced_search', {
        query: options.query,
        entityType: searchOptions.entityType,
        productFilters: options.productFilters,
        merchantFilters: options.merchantFilters,
        brandFilters: options.brandFilters,
        entityBoosting: options.entityBoosting,
        enableNlp: options.enableNlp,
        personalized: options.personalized,
        resultCount: results.pagination.total,
        userId: user?.id || null,
        sessionId: request.headers['x-session-id'],
        userAgent: request.headers['user-agent'],
        timestamp: new Date().toISOString(),
        entityDistribution: this.calculateEntityDistribution(results),
        relevanceScores: this.calculateRelevanceScores(results, options.query),
        experimentId: options.experimentId,
      });
      return results;
    }
    calculateEntityDistribution(searchResponse) {
      const distribution = {
        Product: 0,
        Merchant: 0,
        Brand: 0,
      };
      if (searchResponse.products) {
        distribution['Product'] = searchResponse.products.length;
      }
      if (searchResponse.merchants) {
        distribution['Merchant'] = searchResponse.merchants.length;
      }
      if (searchResponse.brands) {
        distribution['Brand'] = searchResponse.brands.length;
      }
      this.logger.debug(`Calculated entity distribution: ${JSON.stringify(distribution)}`);
      return distribution;
    }
    calculateRelevanceScores(searchResponse, _query) {
      const scores = {};
      const processItems = items => {
        if (items) {
          for (const item of items) {
            if (item && item.id && typeof item.score === 'number') {
              scores[item.id] = item.score;
            }
          }
        }
      };
      processItems(searchResponse.products);
      processItems(searchResponse.merchants);
      processItems(searchResponse.brands);
      this.logger.debug(`Calculated relevance scores for ${Object.keys(scores).length} items.`);
      return scores;
    }
    async enhancedProductSearch(
      query,
      page,
      limit,
      enableNlp,
      personalized,
      categoriesStr,
      tagsStr,
      valuesStr,
      brandIdsStr,
      merchantIdsStr,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      onSale,
      colorsStr,
      sizesStr,
      materialsStr,
      request,
    ) {
      const categories = categoriesStr ? categoriesStr.split(',') : undefined;
      const tags = tagsStr ? tagsStr.split(',') : undefined;
      const values = valuesStr ? valuesStr.split(',') : undefined;
      const brandIds = brandIdsStr ? brandIdsStr.split(',') : undefined;
      const merchantIds = merchantIdsStr ? merchantIdsStr.split(',') : undefined;
      const colors = colorsStr ? colorsStr.split(',') : undefined;
      const sizes = sizesStr ? sizesStr.split(',') : undefined;
      const materials = materialsStr ? materialsStr.split(',') : undefined;
      const productFilters = Object.assign(new entity_specific_filters_dto_1.ProductFilterDto(), {
        categories,
        tags,
        values,
        brandIds,
        merchantIds,
        minPrice,
        maxPrice,
        minRating,
        inStock,
        onSale,
        colors,
        sizes,
        materials,
      });
      const options = {
        query,
        page,
        limit,
        enableNlp,
        personalized,
        productFilters,
      };
      const user = request.user;
      const searchOptions = this.convertToSearchOptions(options);
      searchOptions.entityType = search_entity_type_enum_1.SearchEntityType.PRODUCT;
      return this.nlpSearchService.searchAsync(searchOptions, user);
    }
    async enhancedMerchantSearch(
      query,
      page,
      limit,
      enableNlp,
      personalized,
      categoriesStr,
      valuesStr,
      locationsStr,
      minRating,
      verifiedOnly,
      activeOnly,
      minProductCount,
      request,
    ) {
      const categories = categoriesStr ? categoriesStr.split(',') : undefined;
      const values = valuesStr ? valuesStr.split(',') : undefined;
      const locations = locationsStr ? locationsStr.split(',') : undefined;
      const merchantFilters = Object.assign(new entity_specific_filters_dto_1.MerchantFilterDto(), {
        categories,
        values,
        locations,
        minRating,
        verifiedOnly,
        activeOnly,
        minProductCount,
      });
      const options = {
        query,
        page,
        limit,
        enableNlp,
        personalized,
        merchantFilters,
      };
      const user = request.user;
      const searchOptions = this.convertToSearchOptions(options);
      searchOptions.entityType = search_entity_type_enum_1.SearchEntityType.MERCHANT;
      return this.nlpSearchService.searchAsync(searchOptions, user);
    }
    async enhancedBrandSearch(
      query,
      page,
      limit,
      enableNlp,
      personalized,
      categoriesStr,
      valuesStr,
      locationsStr,
      verifiedOnly,
      activeOnly,
      minFoundedYear,
      maxFoundedYear,
      minProductCount,
      request,
    ) {
      const categories = categoriesStr ? categoriesStr.split(',') : undefined;
      const values = valuesStr ? valuesStr.split(',') : undefined;
      const locations = locationsStr ? locationsStr.split(',') : undefined;
      const brandFilters = Object.assign(new entity_specific_filters_dto_1.BrandFilterDto(), {
        categories,
        values,
        locations,
        verifiedOnly,
        activeOnly,
        minFoundedYear,
        maxFoundedYear,
        minProductCount,
      });
      const options = {
        query,
        page,
        limit,
        enableNlp,
        personalized,
        brandFilters,
      };
      const user = request.user;
      const searchOptions = this.convertToSearchOptions(options);
      searchOptions.entityType = search_entity_type_enum_1.SearchEntityType.BRAND;
      return this.nlpSearchService.searchAsync(searchOptions, user);
    }
    async enhancedMultiEntitySearch(
      query,
      page,
      limit,
      enableNlp,
      personalized,
      productBoost,
      merchantBoost,
      brandBoost,
      request,
    ) {
      const entityBoosting = {
        productBoost,
        merchantBoost,
        brandBoost,
      };
      const options = {
        query,
        page,
        limit,
        enableNlp,
        personalized,
        entityBoosting,
      };
      const user = request.user;
      const searchOptions = this.convertToSearchOptions(options);
      searchOptions.entityType = search_entity_type_enum_1.SearchEntityType.ALL;
      return this.nlpSearchService.searchAsync(searchOptions, user);
    }
    convertToSearchOptions(options) {
      const {
        query,
        page,
        limit,
        enableNlp,
        personalized,
        productFilters,
        merchantFilters,
        brandFilters,
        entityBoosting,
        boostByValues,
        includeSponsoredContent,
        experimentId,
      } = options;
      let filters = [];
      let rangeFilters = [];
      if (productFilters) {
        const { filters: pFilters, rangeFilters: pRangeFilters } =
          productFilters.toGenericFilters();
        filters = [...filters, ...pFilters];
        rangeFilters = [...rangeFilters, ...pRangeFilters];
      }
      if (merchantFilters) {
        const { filters: mFilters, rangeFilters: mRangeFilters } =
          merchantFilters.toGenericFilters();
        filters = [...filters, ...mFilters];
        rangeFilters = [...rangeFilters, ...mRangeFilters];
      }
      if (brandFilters) {
        const { filters: bFilters, rangeFilters: bRangeFilters } = brandFilters.toGenericFilters();
        filters = [...filters, ...bFilters];
        rangeFilters = [...rangeFilters, ...bRangeFilters];
      }
      const metadata = {};
      if (entityBoosting) {
        metadata.entityBoosting = entityBoosting;
      }
      return {
        query,
        entityType: search_entity_type_enum_1.SearchEntityType.ALL,
        page,
        limit,
        enableNlp,
        personalized,
        filters,
        rangeFilters,
        boostByValues,
        includeSponsoredContent,
        experimentId,
        metadata,
      };
    }
  });
exports.MultiEntitySearchController = MultiEntitySearchController;
__decorate(
  [
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, swagger_1.ApiOperation)({
      summary:
        'Enhanced search across products, merchants, and brands with entity-specific filters',
    }),
    (0, swagger_1.ApiBody)({ type: entity_specific_filters_dto_1.EnhancedSearchOptionsDto }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: 'Search results',
      type: search_response_dto_1.SearchResponseDto,
    }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      entity_specific_filters_dto_1.EnhancedSearchOptionsDto,
      Object,
    ]),
    __metadata('design:returntype', Promise),
  ],
  MultiEntitySearchController.prototype,
  'enhancedSearch',
  null,
);
__decorate(
  [
    (0, common_1.Get)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'Enhanced product search with specialized filters' }),
    (0, swagger_1.ApiQuery)({ name: 'query', required: false, description: 'Search query' }),
    (0, swagger_1.ApiQuery)({
      name: 'page',
      required: false,
      description: 'Page number (0-indexed)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'limit',
      required: false,
      description: 'Items per page (max 100)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'enableNlp',
      required: false,
      description: 'Enable natural language processing',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'personalized',
      required: false,
      description: 'Include personalized results',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'categories',
      required: false,
      description: 'Filter by categories (comma-separated)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'tags',
      required: false,
      description: 'Filter by tags (comma-separated)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'values',
      required: false,
      description: 'Filter by values (comma-separated)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'brandIds',
      required: false,
      description: 'Filter by brand IDs (comma-separated)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'merchantIds',
      required: false,
      description: 'Filter by merchant IDs (comma-separated)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'minPrice',
      required: false,
      description: 'Filter by minimum price',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'maxPrice',
      required: false,
      description: 'Filter by maximum price',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'minRating',
      required: false,
      description: 'Filter by minimum rating',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'inStock',
      required: false,
      description: 'Filter by product availability',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'onSale',
      required: false,
      description: 'Filter by products on sale',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'colors',
      required: false,
      description: 'Filter by colors (comma-separated)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'sizes',
      required: false,
      description: 'Filter by sizes (comma-separated)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'materials',
      required: false,
      description: 'Filter by materials (comma-separated)',
    }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: 'Product search results',
      type: search_response_dto_1.SearchResponseDto,
    }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)('query')),
    __param(
      1,
      (0, common_1.Query)('page', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe),
    ),
    __param(
      2,
      (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe),
    ),
    __param(
      3,
      (0, common_1.Query)(
        'enableNlp',
        new common_1.DefaultValuePipe(false),
        common_1.ParseBoolPipe,
      ),
    ),
    __param(
      4,
      (0, common_1.Query)(
        'personalized',
        new common_1.DefaultValuePipe(true),
        common_1.ParseBoolPipe,
      ),
    ),
    __param(5, (0, common_1.Query)('categories')),
    __param(6, (0, common_1.Query)('tags')),
    __param(7, (0, common_1.Query)('values')),
    __param(8, (0, common_1.Query)('brandIds')),
    __param(9, (0, common_1.Query)('merchantIds')),
    __param(
      10,
      (0, common_1.Query)(
        'minPrice',
        new common_1.DefaultValuePipe(undefined),
        common_1.ParseIntPipe,
      ),
    ),
    __param(
      11,
      (0, common_1.Query)(
        'maxPrice',
        new common_1.DefaultValuePipe(undefined),
        common_1.ParseIntPipe,
      ),
    ),
    __param(
      12,
      (0, common_1.Query)(
        'minRating',
        new common_1.DefaultValuePipe(undefined),
        common_1.ParseIntPipe,
      ),
    ),
    __param(
      13,
      (0, common_1.Query)(
        'inStock',
        new common_1.DefaultValuePipe(undefined),
        common_1.ParseBoolPipe,
      ),
    ),
    __param(
      14,
      (0, common_1.Query)(
        'onSale',
        new common_1.DefaultValuePipe(undefined),
        common_1.ParseBoolPipe,
      ),
    ),
    __param(15, (0, common_1.Query)('colors')),
    __param(16, (0, common_1.Query)('sizes')),
    __param(17, (0, common_1.Query)('materials')),
    __param(18, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      String,
      Number,
      Number,
      Boolean,
      Boolean,
      String,
      String,
      String,
      String,
      String,
      Number,
      Number,
      Number,
      Boolean,
      Boolean,
      String,
      String,
      String,
      Object,
    ]),
    __metadata('design:returntype', Promise),
  ],
  MultiEntitySearchController.prototype,
  'enhancedProductSearch',
  null,
);
__decorate(
  [
    (0, common_1.Get)('merchants'),
    (0, swagger_1.ApiOperation)({ summary: 'Enhanced merchant search with specialized filters' }),
    (0, swagger_1.ApiQuery)({ name: 'query', required: false, description: 'Search query' }),
    (0, swagger_1.ApiQuery)({
      name: 'page',
      required: false,
      description: 'Page number (0-indexed)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'limit',
      required: false,
      description: 'Items per page (max 100)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'enableNlp',
      required: false,
      description: 'Enable natural language processing',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'personalized',
      required: false,
      description: 'Include personalized results',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'categories',
      required: false,
      description: 'Filter by categories (comma-separated)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'values',
      required: false,
      description: 'Filter by values (comma-separated)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'locations',
      required: false,
      description: 'Filter by locations (comma-separated)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'minRating',
      required: false,
      description: 'Filter by minimum rating',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'verifiedOnly',
      required: false,
      description: 'Filter by verified merchants only',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'activeOnly',
      required: false,
      description: 'Filter by active merchants only',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'minProductCount',
      required: false,
      description: 'Filter by minimum product count',
    }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: 'Merchant search results',
      type: search_response_dto_1.SearchResponseDto,
    }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)('query')),
    __param(
      1,
      (0, common_1.Query)('page', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe),
    ),
    __param(
      2,
      (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe),
    ),
    __param(
      3,
      (0, common_1.Query)(
        'enableNlp',
        new common_1.DefaultValuePipe(false),
        common_1.ParseBoolPipe,
      ),
    ),
    __param(
      4,
      (0, common_1.Query)(
        'personalized',
        new common_1.DefaultValuePipe(true),
        common_1.ParseBoolPipe,
      ),
    ),
    __param(5, (0, common_1.Query)('categories')),
    __param(6, (0, common_1.Query)('values')),
    __param(7, (0, common_1.Query)('locations')),
    __param(
      8,
      (0, common_1.Query)(
        'minRating',
        new common_1.DefaultValuePipe(undefined),
        common_1.ParseIntPipe,
      ),
    ),
    __param(
      9,
      (0, common_1.Query)(
        'verifiedOnly',
        new common_1.DefaultValuePipe(undefined),
        common_1.ParseBoolPipe,
      ),
    ),
    __param(
      10,
      (0, common_1.Query)(
        'activeOnly',
        new common_1.DefaultValuePipe(undefined),
        common_1.ParseBoolPipe,
      ),
    ),
    __param(
      11,
      (0, common_1.Query)(
        'minProductCount',
        new common_1.DefaultValuePipe(undefined),
        common_1.ParseIntPipe,
      ),
    ),
    __param(12, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      String,
      Number,
      Number,
      Boolean,
      Boolean,
      String,
      String,
      String,
      Number,
      Boolean,
      Boolean,
      Number,
      Object,
    ]),
    __metadata('design:returntype', Promise),
  ],
  MultiEntitySearchController.prototype,
  'enhancedMerchantSearch',
  null,
);
__decorate(
  [
    (0, common_1.Get)('brands'),
    (0, swagger_1.ApiOperation)({ summary: 'Enhanced brand search with specialized filters' }),
    (0, swagger_1.ApiQuery)({ name: 'query', required: false, description: 'Search query' }),
    (0, swagger_1.ApiQuery)({
      name: 'page',
      required: false,
      description: 'Page number (0-indexed)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'limit',
      required: false,
      description: 'Items per page (max 100)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'enableNlp',
      required: false,
      description: 'Enable natural language processing',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'personalized',
      required: false,
      description: 'Include personalized results',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'categories',
      required: false,
      description: 'Filter by categories (comma-separated)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'values',
      required: false,
      description: 'Filter by values (comma-separated)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'locations',
      required: false,
      description: 'Filter by locations (comma-separated)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'verifiedOnly',
      required: false,
      description: 'Filter by verified brands only',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'activeOnly',
      required: false,
      description: 'Filter by active brands only',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'minFoundedYear',
      required: false,
      description: 'Filter by minimum founded year',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'maxFoundedYear',
      required: false,
      description: 'Filter by maximum founded year',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'minProductCount',
      required: false,
      description: 'Filter by minimum product count',
    }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: 'Brand search results',
      type: search_response_dto_1.SearchResponseDto,
    }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)('query')),
    __param(
      1,
      (0, common_1.Query)('page', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe),
    ),
    __param(
      2,
      (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe),
    ),
    __param(
      3,
      (0, common_1.Query)(
        'enableNlp',
        new common_1.DefaultValuePipe(false),
        common_1.ParseBoolPipe,
      ),
    ),
    __param(
      4,
      (0, common_1.Query)(
        'personalized',
        new common_1.DefaultValuePipe(true),
        common_1.ParseBoolPipe,
      ),
    ),
    __param(5, (0, common_1.Query)('categories')),
    __param(6, (0, common_1.Query)('values')),
    __param(7, (0, common_1.Query)('locations')),
    __param(
      8,
      (0, common_1.Query)(
        'verifiedOnly',
        new common_1.DefaultValuePipe(undefined),
        common_1.ParseBoolPipe,
      ),
    ),
    __param(
      9,
      (0, common_1.Query)(
        'activeOnly',
        new common_1.DefaultValuePipe(undefined),
        common_1.ParseBoolPipe,
      ),
    ),
    __param(
      10,
      (0, common_1.Query)(
        'minFoundedYear',
        new common_1.DefaultValuePipe(undefined),
        common_1.ParseIntPipe,
      ),
    ),
    __param(
      11,
      (0, common_1.Query)(
        'maxFoundedYear',
        new common_1.DefaultValuePipe(undefined),
        common_1.ParseIntPipe,
      ),
    ),
    __param(
      12,
      (0, common_1.Query)(
        'minProductCount',
        new common_1.DefaultValuePipe(undefined),
        common_1.ParseIntPipe,
      ),
    ),
    __param(13, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      String,
      Number,
      Number,
      Boolean,
      Boolean,
      String,
      String,
      String,
      Boolean,
      Boolean,
      Number,
      Number,
      Number,
      Object,
    ]),
    __metadata('design:returntype', Promise),
  ],
  MultiEntitySearchController.prototype,
  'enhancedBrandSearch',
  null,
);
__decorate(
  [
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({
      summary: 'Enhanced search across all entity types with entity boosting',
    }),
    (0, swagger_1.ApiQuery)({ name: 'query', required: false, description: 'Search query' }),
    (0, swagger_1.ApiQuery)({
      name: 'page',
      required: false,
      description: 'Page number (0-indexed)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'limit',
      required: false,
      description: 'Items per page (max 100)',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'enableNlp',
      required: false,
      description: 'Enable natural language processing',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'personalized',
      required: false,
      description: 'Include personalized results',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'productBoost',
      required: false,
      description: 'Boost factor for products',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'merchantBoost',
      required: false,
      description: 'Boost factor for merchants',
    }),
    (0, swagger_1.ApiQuery)({
      name: 'brandBoost',
      required: false,
      description: 'Boost factor for brands',
    }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: 'Multi-entity search results',
      type: search_response_dto_1.SearchResponseDto,
    }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)('query')),
    __param(
      1,
      (0, common_1.Query)('page', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe),
    ),
    __param(
      2,
      (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe),
    ),
    __param(
      3,
      (0, common_1.Query)(
        'enableNlp',
        new common_1.DefaultValuePipe(false),
        common_1.ParseBoolPipe,
      ),
    ),
    __param(
      4,
      (0, common_1.Query)(
        'personalized',
        new common_1.DefaultValuePipe(true),
        common_1.ParseBoolPipe,
      ),
    ),
    __param(5, (0, common_1.Query)('productBoost', new common_1.DefaultValuePipe(1.0))),
    __param(6, (0, common_1.Query)('merchantBoost', new common_1.DefaultValuePipe(1.0))),
    __param(7, (0, common_1.Query)('brandBoost', new common_1.DefaultValuePipe(1.0))),
    __param(8, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      String,
      Number,
      Number,
      Boolean,
      Boolean,
      Number,
      Number,
      Number,
      Object,
    ]),
    __metadata('design:returntype', Promise),
  ],
  MultiEntitySearchController.prototype,
  'enhancedMultiEntitySearch',
  null,
);
exports.MultiEntitySearchController =
  MultiEntitySearchController =
  MultiEntitySearchController_1 =
    __decorate(
      [
        (0, swagger_1.ApiTags)('multi-entity-search'),
        (0, common_1.Controller)('api/multi-search'),
        __metadata('design:paramtypes', [
          nlp_search_service_1.NlpSearchService,
          analytics_service_1.AnalyticsService,
          search_analytics_service_1.SearchAnalyticsService,
          entity_facet_generator_service_1.EntityFacetGeneratorService,
          entity_relevance_scorer_service_1.EntityRelevanceScorerService,
        ]),
      ],
      MultiEntitySearchController,
    );
//# sourceMappingURL=multi-entity-search.controller.js.map
