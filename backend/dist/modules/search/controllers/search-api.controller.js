"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SearchApiController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchApiController = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const swagger_1 = require("@nestjs/swagger");
const nlp_search_service_1 = require("../services/nlp-search.service");
const search_options_dto_1 = require("../dto/search-options.dto");
const search_entity_type_enum_1 = require("../enums/search-entity-type.enum");
const search_response_dto_1 = require("../dto/search-response.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const analytics_service_1 = require("../../analytics/services/analytics.service");
let SearchApiController = SearchApiController_1 = class SearchApiController {
    constructor(nlpSearchService, analyticsService) {
        this.nlpSearchService = nlpSearchService;
        this.analyticsService = analyticsService;
        this.logger = new common_1.Logger(SearchApiController_1.name);
    }
    async search(options, request) {
        this.logger.debug(`Search request: ${JSON.stringify(options)}`);
        const user = request.user;
        const results = await this.nlpSearchService.searchAsync(options, user);
        this.analyticsService.trackSearch({
            query: options.query,
            filters: options.filters ? JSON.stringify(options.filters) : undefined,
            hasFilters: !!(options.filters && options.filters.length > 0),
            filterCount: options.filters?.length,
            isNlpEnhanced: options.enableNlp,
            isPersonalized: options.personalized,
            resultCount: results.pagination.total,
            userId: user?.id,
            sessionId: request.headers['x-session-id'],
            userAgent: request.headers['user-agent'],
            timestamp: new Date(),
            metadata: {
                page: options.page,
                limit: options.limit,
                sort: options.sort ? JSON.stringify(options.sort) : undefined,
                entityType: options.entityType,
                rangeFilters: options.rangeFilters,
            },
        });
        return results;
    }
    async searchGet(query, entityType, page, limit, sortString, enableNlp, personalized, request) {
        let parsedSort;
        if (sortString) {
            try {
                parsedSort = JSON.parse(sortString);
                if (!Array.isArray(parsedSort) ||
                    !parsedSort.every(s => typeof s === 'object' && s !== null && 'field' in s)) {
                    this.logger.warn(`Invalid sort JSON string received (invalid structure): ${sortString}`);
                    parsedSort = undefined;
                }
            }
            catch (error) {
                this.logger.warn(`Invalid sort JSON string received (parse error): ${sortString}`);
                parsedSort = undefined;
            }
        }
        const options = {
            query,
            entityType: entityType || search_entity_type_enum_1.SearchEntityType.PRODUCT,
            page,
            limit,
            sort: parsedSort,
            enableNlp: enableNlp === 'true',
            personalized: personalized !== 'false',
        };
        const user = request.user;
        const results = await this.nlpSearchService.searchAsync(options, user);
        this.analyticsService.trackSearch({
            query: options.query,
            filters: options.filters ? JSON.stringify(options.filters) : undefined,
            hasFilters: !!(options.filters && options.filters.length > 0),
            filterCount: options.filters?.length,
            isNlpEnhanced: options.enableNlp,
            isPersonalized: options.personalized,
            resultCount: results.pagination.total,
            userId: user?.id,
            sessionId: request.headers['x-session-id'],
            userAgent: request.headers['user-agent'],
            timestamp: new Date(),
            metadata: {
                page: options.page,
                limit: options.limit,
                sort: options.sort ? JSON.stringify(options.sort) : undefined,
                entityType: options.entityType,
                rangeFilters: options.rangeFilters,
            },
        });
        return results;
    }
    async searchProducts(query, page, limit, sortString, enableNlp, personalized, request) {
        let parsedSort;
        if (sortString) {
            try {
                parsedSort = JSON.parse(sortString);
                if (!Array.isArray(parsedSort) ||
                    !parsedSort.every(s => typeof s === 'object' && s !== null && 'field' in s)) {
                    this.logger.warn(`Invalid sort JSON string received (invalid structure): ${sortString}`);
                    parsedSort = undefined;
                }
            }
            catch (error) {
                this.logger.warn(`Invalid sort JSON string received (parse error): ${sortString}`);
                parsedSort = undefined;
            }
        }
        const options = {
            query,
            entityType: search_entity_type_enum_1.SearchEntityType.PRODUCT,
            page,
            limit,
            sort: parsedSort,
            enableNlp: enableNlp === 'true',
            personalized: personalized !== 'false',
        };
        const user = request.user;
        const results = await this.nlpSearchService.searchAsync(options, user);
        this.analyticsService.trackSearch({
            query: options.query,
            filters: options.filters ? JSON.stringify(options.filters) : undefined,
            hasFilters: !!(options.filters && options.filters.length > 0),
            filterCount: options.filters?.length,
            isNlpEnhanced: options.enableNlp,
            isPersonalized: options.personalized,
            resultCount: results.pagination.total,
            userId: user?.id,
            sessionId: request.headers['x-session-id'],
            userAgent: request.headers['user-agent'],
            timestamp: new Date(),
            metadata: {
                page: options.page,
                limit: options.limit,
                sort: options.sort ? JSON.stringify(options.sort) : undefined,
                entityType: options.entityType,
                rangeFilters: options.rangeFilters,
            },
        });
        return results;
    }
    async searchMerchants(query, page, limit, sortString, enableNlp, personalized, request) {
        let parsedSort;
        if (sortString) {
            try {
                parsedSort = JSON.parse(sortString);
                if (!Array.isArray(parsedSort) ||
                    !parsedSort.every(s => typeof s === 'object' && s !== null && 'field' in s)) {
                    this.logger.warn(`Invalid sort JSON string received (invalid structure): ${sortString}`);
                    parsedSort = undefined;
                }
            }
            catch (error) {
                this.logger.warn(`Invalid sort JSON string received (parse error): ${sortString}`);
                parsedSort = undefined;
            }
        }
        const options = {
            query,
            entityType: search_entity_type_enum_1.SearchEntityType.MERCHANT,
            page,
            limit,
            sort: parsedSort,
            enableNlp: enableNlp === 'true',
            personalized: personalized !== 'false',
        };
        const user = request.user;
        const results = await this.nlpSearchService.searchAsync(options, user);
        this.analyticsService.trackSearch({
            query: options.query,
            filters: options.filters ? JSON.stringify(options.filters) : undefined,
            hasFilters: !!(options.filters && options.filters.length > 0),
            filterCount: options.filters?.length,
            isNlpEnhanced: options.enableNlp,
            isPersonalized: options.personalized,
            resultCount: results.pagination.total,
            userId: user?.id,
            sessionId: request.headers['x-session-id'],
            userAgent: request.headers['user-agent'],
            timestamp: new Date(),
            metadata: {
                page: options.page,
                limit: options.limit,
                sort: options.sort ? JSON.stringify(options.sort) : undefined,
                entityType: options.entityType,
                rangeFilters: options.rangeFilters,
            },
        });
        return results;
    }
    async searchBrands(query, page, limit, sortString, enableNlp, personalized, request) {
        let parsedSort;
        if (sortString) {
            try {
                parsedSort = JSON.parse(sortString);
                if (!Array.isArray(parsedSort) ||
                    !parsedSort.every(s => typeof s === 'object' && s !== null && 'field' in s)) {
                    this.logger.warn(`Invalid sort JSON string received (invalid structure): ${sortString}`);
                    parsedSort = undefined;
                }
            }
            catch (error) {
                this.logger.warn(`Invalid sort JSON string received (parse error): ${sortString}`);
                parsedSort = undefined;
            }
        }
        const options = {
            query,
            entityType: search_entity_type_enum_1.SearchEntityType.BRAND,
            page,
            limit,
            sort: parsedSort,
            enableNlp: enableNlp === 'true',
            personalized: personalized !== 'false',
        };
        const user = request.user;
        const results = await this.nlpSearchService.searchAsync(options, user);
        this.analyticsService.trackSearch({
            query: options.query,
            filters: options.filters ? JSON.stringify(options.filters) : undefined,
            hasFilters: !!(options.filters && options.filters.length > 0),
            filterCount: options.filters?.length,
            isNlpEnhanced: options.enableNlp,
            isPersonalized: options.personalized,
            resultCount: results.pagination.total,
            userId: user?.id,
            sessionId: request.headers['x-session-id'],
            userAgent: request.headers['user-agent'],
            timestamp: new Date(),
            metadata: {
                page: options.page,
                limit: options.limit,
                sort: options.sort ? JSON.stringify(options.sort) : undefined,
                entityType: options.entityType,
                rangeFilters: options.rangeFilters,
            },
        });
        return results;
    }
    async processQuery(query, request) {
        const user = request.user;
        this.logger.warn(`Attempted to call private processQuery via API for query: ${query} by user: ${user?.id}`);
        return { message: 'Direct NLP processing via this endpoint is currently disabled.' };
    }
};
exports.SearchApiController = SearchApiController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Search across products, merchants, and brands' }),
    (0, swagger_1.ApiBody)({ type: search_options_dto_1.SearchOptionsInput }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Search results',
        type: search_response_dto_1.SearchResponseDto,
    }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_options_dto_1.SearchOptionsInput, Object]),
    __metadata("design:returntype", Promise)
], SearchApiController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Search with GET request' }),
    (0, swagger_1.ApiQuery)({ name: 'query', required: false, description: 'Search query' }),
    (0, swagger_1.ApiQuery)({
        name: 'entityType',
        required: false,
        enum: search_entity_type_enum_1.SearchEntityType,
        description: 'Entity type to search',
    }),
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
        name: 'sort',
        required: false,
        description: 'JSON string of sort options (e.g., `[{"field":"createdAt","order":"desc"}]`)',
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
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Search results',
        type: search_response_dto_1.SearchResponseDto,
    }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('entityType')),
    __param(2, (0, common_1.Query)('page', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(4, (0, common_1.Query)('sort')),
    __param(5, (0, common_1.Query)('enableNlp')),
    __param(6, (0, common_1.Query)('personalized')),
    __param(7, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], SearchApiController.prototype, "searchGet", null);
__decorate([
    (0, common_1.Get)('products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, cache_manager_1.CacheKey)('search_products'),
    (0, cache_manager_1.CacheTTL)(60),
    (0, swagger_1.ApiOperation)({ summary: 'Search products only' }),
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
        name: 'sort',
        required: false,
        description: 'JSON string of sort options (e.g., `[{"field":"createdAt","order":"desc"}]`)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Product search results',
        type: search_response_dto_1.SearchResponseDto,
    }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('sort')),
    __param(4, (0, common_1.Query)('enableNlp')),
    __param(5, (0, common_1.Query)('personalized')),
    __param(6, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], SearchApiController.prototype, "searchProducts", null);
__decorate([
    (0, common_1.Get)('merchants'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Search merchants only' }),
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
        name: 'sort',
        required: false,
        description: 'JSON string of sort options (e.g., `[{"field":"createdAt","order":"desc"}]`)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Merchant search results',
        type: search_response_dto_1.SearchResponseDto,
    }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('sort')),
    __param(4, (0, common_1.Query)('enableNlp')),
    __param(5, (0, common_1.Query)('personalized')),
    __param(6, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], SearchApiController.prototype, "searchMerchants", null);
__decorate([
    (0, common_1.Get)('brands'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Search brands only' }),
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
        name: 'sort',
        required: false,
        description: 'JSON string of sort options (e.g., `[{"field":"createdAt","order":"desc"}]`)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Brand search results',
        type: search_response_dto_1.SearchResponseDto,
    }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('sort')),
    __param(4, (0, common_1.Query)('enableNlp')),
    __param(5, (0, common_1.Query)('personalized')),
    __param(6, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], SearchApiController.prototype, "searchBrands", null);
__decorate([
    (0, common_1.Get)('process-query'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Process a query with NLP' }),
    (0, swagger_1.ApiQuery)({ name: 'query', required: true, description: 'Query to process' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Processed query',
        schema: {
            type: 'object',
            properties: {
                processedQuery: { type: 'string' },
                entities: { type: 'object' },
                intent: { type: 'string' },
                expandedTerms: { type: 'array', items: { type: 'string' } },
            },
        },
    }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SearchApiController.prototype, "processQuery", null);
exports.SearchApiController = SearchApiController = SearchApiController_1 = __decorate([
    (0, swagger_1.ApiTags)('search-api'),
    (0, common_1.Controller)('api/search'),
    __metadata("design:paramtypes", [nlp_search_service_1.NlpSearchService,
        analytics_service_1.AnalyticsService])
], SearchApiController);
//# sourceMappingURL=search-api.controller.js.map