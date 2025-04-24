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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NlpController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const natural_language_search_service_1 = require("./services/natural-language-search.service");
const nlp_service_1 = require("./services/nlp.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let NlpController = class NlpController {
    constructor(naturalLanguageSearchService, nlpService) {
        this.naturalLanguageSearchService = naturalLanguageSearchService;
        this.nlpService = nlpService;
    }
    async searchProducts(query, paginationDto) {
        return this.naturalLanguageSearchService.searchProducts(query, paginationDto);
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
    async getRecommendationsFromDescription(body) {
        return this.naturalLanguageSearchService.getRecommendationsFromDescription(body.description, body.limit);
    }
    async getPersonalizedSearchResults(body) {
        return this.naturalLanguageSearchService.getPersonalizedSearchResults(body.query, body.userPreferences, body.pagination || { page: 1, limit: 10 });
    }
    extractKeywords(body) {
        return {
            keywords: this.nlpService.extractKeywords(body.text, body.maxKeywords),
        };
    }
    calculateSimilarity(body) {
        return {
            similarity: this.nlpService.calculateSimilarity(body.text1, body.text2),
        };
    }
};
exports.NlpController = NlpController;
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Perform a natural language search for products' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns search results with enhanced query and detected filters',
    }),
    (0, swagger_1.ApiQuery)({ name: 'query', required: true, description: 'Natural language query' }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], NlpController.prototype, "searchProducts", null);
__decorate([
    (0, common_1.Get)('analyze'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze a natural language query' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns the analyzed query with tokens, entities, and intent',
    }),
    (0, swagger_1.ApiQuery)({ name: 'query', required: true, description: 'Natural language query' }),
    __param(0, (0, common_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NlpController.prototype, "analyzeQuery", null);
__decorate([
    (0, common_1.Get)('suggestions'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate search suggestions based on a partial query' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns search suggestions' }),
    (0, swagger_1.ApiQuery)({ name: 'query', required: true, description: 'Partial query' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Maximum number of suggestions' }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], NlpController.prototype, "generateSearchSuggestions", null);
__decorate([
    (0, common_1.Get)('classify'),
    (0, swagger_1.ApiOperation)({ summary: 'Classify a search query into predefined categories' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the query classification' }),
    (0, swagger_1.ApiQuery)({ name: 'query', required: true, description: 'Search query' }),
    __param(0, (0, common_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NlpController.prototype, "classifySearchQuery", null);
__decorate([
    (0, common_1.Post)('recommendations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product recommendations based on a natural language description' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns recommended products' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NlpController.prototype, "getRecommendationsFromDescription", null);
__decorate([
    (0, common_1.Post)('personalized-search'),
    (0, swagger_1.ApiOperation)({ summary: 'Get personalized search results based on user preferences' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns personalized search results' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NlpController.prototype, "getPersonalizedSearchResults", null);
__decorate([
    (0, common_1.Post)('extract-keywords'),
    (0, swagger_1.ApiOperation)({ summary: 'Extract keywords from text' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns extracted keywords' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NlpController.prototype, "extractKeywords", null);
__decorate([
    (0, common_1.Post)('calculate-similarity'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate similarity between two texts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns similarity score' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NlpController.prototype, "calculateSimilarity", null);
exports.NlpController = NlpController = __decorate([
    (0, swagger_1.ApiTags)('nlp'),
    (0, common_1.Controller)('nlp'),
    __metadata("design:paramtypes", [natural_language_search_service_1.NaturalLanguageSearchService,
        nlp_service_1.NlpService])
], NlpController);
//# sourceMappingURL=nlp.controller.js.map