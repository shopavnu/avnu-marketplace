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
var PersonalizedSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalizedSearchService = void 0;
const common_1 = require("@nestjs/common");
const elasticsearch_service_1 = require("./elasticsearch.service");
const natural_language_search_service_1 = require("../../nlp/services/natural-language-search.service");
const personalization_service_1 = require("../../personalization/services/personalization.service");
const user_behavior_entity_1 = require("../../personalization/entities/user-behavior.entity");
let PersonalizedSearchService = PersonalizedSearchService_1 = class PersonalizedSearchService {
    constructor(elasticsearchService, naturalLanguageSearchService, personalizationService) {
        this.elasticsearchService = elasticsearchService;
        this.naturalLanguageSearchService = naturalLanguageSearchService;
        this.personalizationService = personalizationService;
        this.logger = new common_1.Logger(PersonalizedSearchService_1.name);
    }
    async personalizedSearch(userId, query, options = {}) {
        try {
            const processedQuery = await this.naturalLanguageSearchService.searchProducts(query, {
                page: 1,
                limit: 10,
            });
            const enhancedQuery = processedQuery.enhancedQuery;
            const detectedFilters = processedQuery.detectedFilters;
            const enhancedParams = await this.personalizationService.enhanceSearchWithPersonalization(userId, enhancedQuery, {
                ...options,
                filters: {
                    ...(options.filters || {}),
                    ...detectedFilters,
                },
            });
            const searchResults = await this.elasticsearchService.searchProducts(enhancedParams.query, enhancedParams.filters, options.page || 1, options.limit || 20, options.sort);
            this.personalizationService
                .trackInteractionAndUpdatePreferences(userId, user_behavior_entity_1.BehaviorType.SEARCH, query, 'search', query)
                .catch(error => {
                this.logger.error(`Failed to track search: ${error.message}`);
            });
            return {
                ...searchResults,
                metadata: {
                    originalQuery: query,
                    processedQuery: enhancedQuery,
                    extractedFilters: detectedFilters,
                    personalizedFilters: enhancedParams.filters,
                    personalizedBoosts: enhancedParams.boosts,
                    userPreferences: enhancedParams.personalization?.preferences,
                },
            };
        }
        catch (error) {
            this.logger.error(`Personalized search failed: ${error.message}`);
            return this.elasticsearchService.searchProducts(query, options.filters, options.page || 1, options.limit || 20, options.sort);
        }
    }
    async getPersonalizedRecommendations(userId, limit = 10) {
        try {
            const productIds = await this.personalizationService.generatePersonalizedRecommendations(userId, limit);
            if (productIds.length === 0) {
                const trendingProducts = await this.elasticsearchService.getTrendingProducts(limit);
                return {
                    items: trendingProducts,
                    total: trendingProducts.length,
                    page: 1,
                    limit,
                };
            }
            const searchResults = await this.elasticsearchService.searchProducts('', {}, 1, limit * 2);
            const products = searchResults.items
                .filter(product => productIds.includes(product.id))
                .slice(0, limit);
            return {
                items: products,
                total: products.length,
                page: 1,
                limit,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get personalized recommendations: ${error.message}`);
            const trendingProducts = await this.elasticsearchService.getTrendingProducts(limit);
            return {
                items: trendingProducts,
                total: trendingProducts.length,
                page: 1,
                limit,
            };
        }
    }
    async getDiscoveryFeed(userId, options = {}) {
        try {
            const limit = options.limit || 20;
            const personalizedLimit = Math.floor(limit * 0.6);
            const trendingLimit = Math.floor(limit * 0.2);
            const personalizedResults = await this.getPersonalizedRecommendations(userId, personalizedLimit);
            const trendingResults = await this.elasticsearchService.searchProducts('', {}, 1, trendingLimit, { field: 'popularity', order: 'desc' });
            const newResults = await this.elasticsearchService.searchProducts('', {}, 1, options.limit || 20, { field: 'createdAt', order: 'desc' });
            const seenIds = new Set();
            const combinedItems = [];
            const addItemsNoDuplicates = items => {
                for (const item of items) {
                    if (!seenIds.has(item.id)) {
                        seenIds.add(item.id);
                        combinedItems.push({
                            ...item,
                            discoverySource: item.discoverySource || 'mixed',
                        });
                    }
                }
            };
            addItemsNoDuplicates(personalizedResults.items.map(item => ({
                ...item,
                discoverySource: 'personalized',
            })));
            addItemsNoDuplicates(trendingResults.items.map(item => ({
                ...item,
                discoverySource: 'trending',
            })));
            addItemsNoDuplicates(newResults.items.map(item => ({
                ...item,
                discoverySource: 'new',
            })));
            return {
                items: combinedItems.slice(0, limit),
                total: combinedItems.length,
                page: 1,
                limit,
                metadata: {
                    personalized: personalizedResults.items.length,
                    trending: trendingResults.items.length,
                    new: newResults.items.length,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to get discovery feed: ${error.message}`);
            const trendingProducts = await this.elasticsearchService.getTrendingProducts(options.limit || 20);
            return {
                items: trendingProducts,
                total: trendingProducts.length,
                page: 1,
                limit: options.limit || 20,
            };
        }
    }
    async getSimilarProducts(productId, userId, limit = 10) {
        try {
            const similarProducts = await this.elasticsearchService.getRelatedProducts(productId, limit);
            if (userId) {
                const personalizedBoosts = await this.personalizationService.generatePersonalizedBoosts(userId);
                const productItems = Array.isArray(similarProducts)
                    ? similarProducts
                    : similarProducts &&
                        typeof similarProducts === 'object' &&
                        Object.prototype.hasOwnProperty.call(similarProducts, 'items')
                        ? similarProducts.items
                        : [];
                const boostedProducts = productItems.map(product => {
                    let _boostFactor = 1.0;
                    if (product.categories && personalizedBoosts.categoryBoosts) {
                        for (const category of product.categories) {
                            if (personalizedBoosts.categoryBoosts[category]) {
                                _boostFactor *= personalizedBoosts.categoryBoosts[category];
                            }
                        }
                    }
                    if (product.brand &&
                        personalizedBoosts.brandBoosts &&
                        personalizedBoosts.brandBoosts[product.brand]) {
                        _boostFactor *= personalizedBoosts.brandBoosts[product.brand];
                    }
                    if (personalizedBoosts.productBoosts && personalizedBoosts.productBoosts[product.id]) {
                        _boostFactor *= personalizedBoosts.productBoosts[product.id];
                    }
                    return {
                        ...product,
                        _boostFactor,
                    };
                });
                boostedProducts.sort((a, b) => b._boostFactor - a._boostFactor);
                const reorderedProducts = boostedProducts.map(({ _boostFactor, ...product }) => product);
                return {
                    items: reorderedProducts,
                    total: reorderedProducts.length,
                    productId,
                    personalized: true,
                };
            }
            return similarProducts;
        }
        catch (error) {
            this.logger.error(`Failed to get similar products: ${error.message}`);
            const relatedProducts = await this.elasticsearchService.getRelatedProducts(productId, limit);
            return {
                items: relatedProducts,
                total: relatedProducts.length,
                productId,
            };
        }
    }
    applyValueAlignmentBoost(results, userValues, _boostFactor) {
        if (!userValues || userValues.length === 0 || !results || results.length === 0) {
            return results;
        }
        return results;
    }
};
exports.PersonalizedSearchService = PersonalizedSearchService;
exports.PersonalizedSearchService = PersonalizedSearchService = PersonalizedSearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [elasticsearch_service_1.ElasticsearchService,
        natural_language_search_service_1.NaturalLanguageSearchService,
        personalization_service_1.PersonalizationService])
], PersonalizedSearchService);
//# sourceMappingURL=personalized-search.service.js.map