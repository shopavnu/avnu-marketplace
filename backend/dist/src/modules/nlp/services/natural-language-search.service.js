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
var NaturalLanguageSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaturalLanguageSearchService = void 0;
const common_1 = require("@nestjs/common");
const nlp_service_1 = require("./nlp.service");
const search_service_1 = require("../../search/search.service");
let NaturalLanguageSearchService = NaturalLanguageSearchService_1 = class NaturalLanguageSearchService {
    constructor(nlpService, searchService) {
        this.nlpService = nlpService;
        this.searchService = searchService;
        this.logger = new common_1.Logger(NaturalLanguageSearchService_1.name);
    }
    async searchProducts(query, paginationDto) {
        try {
            const processedQuery = this.nlpService.processQuery(query);
            this.logger.log(`Processed query: ${JSON.stringify(processedQuery)}`);
            const searchResults = await this.searchService.searchProducts(processedQuery.processedQuery, paginationDto, processedQuery.filters);
            return {
                ...searchResults,
                enhancedQuery: processedQuery.processedQuery,
                detectedFilters: processedQuery.filters,
            };
        }
        catch (error) {
            this.logger.error(`Failed to perform natural language search: ${error.message}`);
            const searchResults = await this.searchService.searchProducts(query, paginationDto);
            return {
                ...searchResults,
                enhancedQuery: query,
                detectedFilters: {},
            };
        }
    }
    async getRecommendationsFromDescription(description, limit = 10) {
        try {
            const keywords = this.nlpService.extractKeywords(description, 5);
            this.logger.log(`Extracted keywords: ${keywords.join(', ')}`);
            const searchResults = await this.searchService.searchProducts(keywords.join(' '), {
                page: 1,
                limit,
            });
            return searchResults.items;
        }
        catch (error) {
            this.logger.error(`Failed to get recommendations from description: ${error.message}`);
            return [];
        }
    }
    classifySearchQuery(query) {
        try {
            const categories = [
                {
                    name: 'specific_product',
                    examples: [
                        'black leather jacket',
                        'red dress size medium',
                        'wireless headphones',
                        'organic cotton t-shirt',
                    ],
                },
                {
                    name: 'category_browse',
                    examples: [
                        "women's dresses",
                        'kitchen appliances',
                        'outdoor furniture',
                        'sustainable clothing',
                    ],
                },
                {
                    name: 'price_sensitive',
                    examples: [
                        'affordable shoes under $50',
                        'budget friendly gifts',
                        'cheap laptops',
                        'best value smartphones',
                    ],
                },
                {
                    name: 'brand_specific',
                    examples: ['nike running shoes', 'apple iphone', "levi's jeans", 'patagonia jackets'],
                },
                {
                    name: 'value_driven',
                    examples: [
                        'sustainable fashion brands',
                        'eco-friendly cleaning products',
                        'fair trade coffee',
                        'ethical jewelry',
                    ],
                },
            ];
            return this.nlpService.classifyText(query, categories);
        }
        catch (error) {
            this.logger.error(`Failed to classify search query: ${error.message}`);
            return 'unknown';
        }
    }
    async getPersonalizedSearchResults(query, userPreferences, paginationDto) {
        try {
            const processedQuery = this.nlpService.processQuery(query);
            const mergedFilters = { ...processedQuery.filters };
            if (!mergedFilters.categories && userPreferences.favoriteCategories?.length) {
                mergedFilters.categories = userPreferences.favoriteCategories;
            }
            if (!mergedFilters.values && userPreferences.favoriteValues?.length) {
                mergedFilters.values = userPreferences.favoriteValues;
            }
            if (userPreferences.priceSensitivity && !mergedFilters.priceMin && !mergedFilters.priceMax) {
                switch (userPreferences.priceSensitivity) {
                    case 'low':
                        mergedFilters.priceMax = 50;
                        break;
                    case 'medium':
                        mergedFilters.priceMin = 50;
                        mergedFilters.priceMax = 150;
                        break;
                    case 'high':
                        mergedFilters.priceMin = 150;
                        break;
                }
            }
            return this.searchService.searchProducts(processedQuery.processedQuery, paginationDto, mergedFilters);
        }
        catch (error) {
            this.logger.error(`Failed to get personalized search results: ${error.message}`);
            return this.searchService.searchProducts(query, paginationDto);
        }
    }
    async generateSearchSuggestions(partialQuery, limit = 5) {
        try {
            const basicSuggestions = await this.searchService.getProductSuggestions(partialQuery, limit);
            const processedQuery = this.nlpService.processQuery(partialQuery);
            if (processedQuery.entities.length > 0) {
                const enhancedSuggestions = this.generateEnhancedSuggestions(processedQuery.tokens, processedQuery.entities, limit);
                return [...new Set([...enhancedSuggestions, ...basicSuggestions])].slice(0, limit);
            }
            return basicSuggestions;
        }
        catch (error) {
            this.logger.error(`Failed to generate search suggestions: ${error.message}`);
            return [];
        }
    }
    generateEnhancedSuggestions(tokens, entities, limit = 5) {
        const suggestions = [];
        const categoryEntities = entities.filter(entity => entity.type === 'category');
        const brandEntities = entities.filter(entity => entity.type === 'brand');
        const valueEntities = entities.filter(entity => entity.type === 'value');
        if (categoryEntities.length > 0) {
            suggestions.push(`${tokens.join(' ')} in ${categoryEntities[0].value}`);
        }
        if (brandEntities.length > 0) {
            suggestions.push(`${tokens.join(' ')} by ${brandEntities[0].value}`);
        }
        if (valueEntities.length > 0) {
            suggestions.push(`${valueEntities[0].value} ${tokens.join(' ')}`);
        }
        suggestions.push(`${tokens.join(' ')} under $50`);
        suggestions.push(`${tokens.join(' ')} under $100`);
        return suggestions.slice(0, limit);
    }
};
exports.NaturalLanguageSearchService = NaturalLanguageSearchService;
exports.NaturalLanguageSearchService = NaturalLanguageSearchService = NaturalLanguageSearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nlp_service_1.NlpService,
        search_service_1.SearchService])
], NaturalLanguageSearchService);
//# sourceMappingURL=natural-language-search.service.js.map