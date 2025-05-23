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
var AutocompleteService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutocompleteService = void 0;
const common_1 = require("@nestjs/common");
const elasticsearch_service_1 = require("./elasticsearch.service");
const search_analytics_service_1 = require("../../analytics/services/search-analytics.service");
const personalization_service_1 = require("../../personalization/services/personalization.service");
const ab_testing_service_1 = require("../../ab-testing/services/ab-testing.service");
const experiment_entity_1 = require("../../ab-testing/entities/experiment.entity");
let AutocompleteService = AutocompleteService_1 = class AutocompleteService {
    constructor(elasticsearchService, searchAnalyticsService, personalizationService, abTestingService) {
        this.elasticsearchService = elasticsearchService;
        this.searchAnalyticsService = searchAnalyticsService;
        this.personalizationService = personalizationService;
        this.abTestingService = abTestingService;
        this.logger = new common_1.Logger(AutocompleteService_1.name);
    }
    async getAutocompleteSuggestions(query, userId, sessionId, options = {}) {
        try {
            const limit = options.limit || 10;
            const includeCategories = options.includeCategories !== false;
            const includeBrands = options.includeBrands !== false;
            const includeValues = options.includeValues !== false;
            const includeTrending = options.includeTrending !== false;
            const experimentConfig = await this.abTestingService.getVariantConfiguration(experiment_entity_1.ExperimentType.SEARCH_ALGORITHM, userId, sessionId);
            let suggestionParams = {
                productWeight: 1.0,
                categoryWeight: 0.8,
                brandWeight: 0.7,
                valueWeight: 0.9,
                trendingWeight: 0.8,
                personalizedWeight: 1.2,
                fuzzyMatching: true,
                maxFuzzyDistance: 2,
                highlightMatches: true,
            };
            if (experimentConfig && Object.keys(experimentConfig).length > 0) {
                const experimentId = Object.keys(experimentConfig)[0];
                if (experimentId) {
                    const variantConfig = experimentConfig[experimentId];
                    if (variantConfig && variantConfig.configuration) {
                        suggestionParams = {
                            ...suggestionParams,
                            ...variantConfig.configuration,
                        };
                        await this.abTestingService.trackImpression(variantConfig.assignmentId);
                    }
                }
            }
            const [productSuggestions, categorySuggestions, brandSuggestions, valueSuggestions, trendingSuggestions, personalizedSuggestions,] = await Promise.all([
                this.getProductTitleSuggestions(query, limit, suggestionParams.fuzzyMatching),
                includeCategories
                    ? this.getCategorySuggestions(query, Math.ceil(limit / 2), suggestionParams.fuzzyMatching)
                    : [],
                includeBrands
                    ? this.getBrandSuggestions(query, Math.ceil(limit / 2), suggestionParams.fuzzyMatching)
                    : [],
                includeValues
                    ? this.getValueSuggestions(query, Math.ceil(limit / 2), suggestionParams.fuzzyMatching)
                    : [],
                includeTrending
                    ? this.searchAnalyticsService
                        .getTopSearchQueries(Math.ceil(limit / 2))
                        .then(results => results.map(r => r.query))
                    : [],
                userId
                    ? this.personalizationService
                        .generatePersonalizedSearchParams(userId)
                        .then(params => params?.behavior?.recentSearches?.map(s => s.query) ?? [])
                        .then(queries => queries.slice(0, Math.ceil(limit / 2)))
                    : [],
            ]);
            const combinedSuggestions = this.combineSuggestions(query, productSuggestions, categorySuggestions, brandSuggestions, valueSuggestions, trendingSuggestions, personalizedSuggestions, suggestionParams, limit);
            this.searchAnalyticsService
                .trackEvent('autocomplete_impression', {
                query,
                suggestions: combinedSuggestions.map(s => s.text),
                userId,
                sessionId,
            })
                .catch(error => {
                this.logger.error(`Failed to track suggestion impression: ${error.message}`);
            });
            if (experimentConfig && Object.keys(experimentConfig).length > 0) {
                const experimentId = Object.keys(experimentConfig)[0];
                if (experimentId) {
                    const variantConfig = experimentConfig[experimentId];
                    if (variantConfig) {
                        await this.abTestingService.trackInteraction(variantConfig.assignmentId, 'suggestions_viewed', {
                            query,
                            suggestionCount: combinedSuggestions.length,
                        });
                    }
                }
            }
            return {
                suggestions: combinedSuggestions,
                metadata: {
                    productSuggestions: productSuggestions.length,
                    categorySuggestions: categorySuggestions.length,
                    brandSuggestions: brandSuggestions.length,
                    valueSuggestions: valueSuggestions.length,
                    trendingSuggestions: trendingSuggestions.length,
                    personalizedSuggestions: personalizedSuggestions.length,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to get autocomplete suggestions: ${error.message}`);
            const suggestions = await this.elasticsearchService.getProductSuggestions(query, options.limit || 10);
            return {
                suggestions: suggestions.map(text => ({ text, type: 'product' })),
            };
        }
    }
    async getProductTitleSuggestions(query, limit, fuzzyMatching = true) {
        try {
            const body = {
                size: 0,
                query: {
                    bool: {
                        must: [
                            {
                                match_bool_prefix: {
                                    title: {
                                        query,
                                        fuzziness: fuzzyMatching ? 'AUTO' : '0',
                                    },
                                },
                            },
                            {
                                term: {
                                    isActive: true,
                                },
                            },
                        ],
                    },
                },
                aggs: {
                    title_suggestions: {
                        terms: {
                            field: 'title.keyword',
                            size: limit,
                            order: {
                                _count: 'desc',
                            },
                        },
                    },
                },
            };
            const response = await this.elasticsearchService.performSearch('products', body);
            return response.aggregations.title_suggestions.buckets.map(bucket => bucket.key);
        }
        catch (error) {
            this.logger.error(`Failed to get product title suggestions: ${error.message}`);
            return [];
        }
    }
    async getCategorySuggestions(query, limit, fuzzyMatching = true) {
        try {
            const body = {
                size: 0,
                query: {
                    bool: {
                        must: [
                            {
                                match: {
                                    categories: {
                                        query,
                                        fuzziness: fuzzyMatching ? 'AUTO' : '0',
                                    },
                                },
                            },
                            {
                                term: {
                                    isActive: true,
                                },
                            },
                        ],
                    },
                },
                aggs: {
                    category_suggestions: {
                        terms: {
                            field: 'categories.keyword',
                            size: limit,
                            order: {
                                _count: 'desc',
                            },
                        },
                    },
                },
            };
            const response = await this.elasticsearchService.performSearch('products', body);
            return response.aggregations.category_suggestions.buckets.map(bucket => bucket.key);
        }
        catch (error) {
            this.logger.error(`Failed to get category suggestions: ${error.message}`);
            return [];
        }
    }
    async getBrandSuggestions(query, limit, fuzzyMatching = true) {
        try {
            const body = {
                size: 0,
                query: {
                    bool: {
                        must: [
                            {
                                match: {
                                    brandName: {
                                        query,
                                        fuzziness: fuzzyMatching ? 'AUTO' : '0',
                                    },
                                },
                            },
                            {
                                term: {
                                    isActive: true,
                                },
                            },
                        ],
                    },
                },
                aggs: {
                    brand_suggestions: {
                        terms: {
                            field: 'brandName.keyword',
                            size: limit,
                            order: {
                                _count: 'desc',
                            },
                        },
                    },
                },
            };
            const response = await this.elasticsearchService.performSearch('products', body);
            return response.aggregations.brand_suggestions.buckets.map(bucket => bucket.key);
        }
        catch (error) {
            this.logger.error(`Failed to get brand suggestions: ${error.message}`);
            return [];
        }
    }
    async getValueSuggestions(query, limit, fuzzyMatching = true) {
        try {
            const body = {
                size: 0,
                query: {
                    bool: {
                        must: [
                            {
                                match: {
                                    values: {
                                        query,
                                        fuzziness: fuzzyMatching ? 'AUTO' : '0',
                                    },
                                },
                            },
                            {
                                term: {
                                    isActive: true,
                                },
                            },
                        ],
                    },
                },
                aggs: {
                    value_suggestions: {
                        terms: {
                            field: 'values.keyword',
                            size: limit,
                            order: {
                                _count: 'desc',
                            },
                        },
                    },
                },
            };
            const response = await this.elasticsearchService.performSearch('products', body);
            return response.aggregations.value_suggestions.buckets.map(bucket => bucket.key);
        }
        catch (error) {
            this.logger.error(`Failed to get value suggestions: ${error.message}`);
            return [];
        }
    }
    combineSuggestions(query, productSuggestions, categorySuggestions, brandSuggestions, valueSuggestions, trendingSuggestions, personalizedSuggestions, params, limit) {
        const weightedSuggestions = [
            ...productSuggestions.map(text => ({
                text,
                type: 'product',
                weight: params.productWeight,
                score: this.calculateRelevanceScore(query, text) * params.productWeight,
            })),
            ...categorySuggestions.map(text => ({
                text,
                type: 'category',
                prefix: 'Category: ',
                weight: params.categoryWeight,
                score: this.calculateRelevanceScore(query, text) * params.categoryWeight,
            })),
            ...brandSuggestions.map(text => ({
                text,
                type: 'brand',
                prefix: 'Brand: ',
                weight: params.brandWeight,
                score: this.calculateRelevanceScore(query, text) * params.brandWeight,
            })),
            ...valueSuggestions.map(text => ({
                text,
                type: 'value',
                prefix: 'Value: ',
                weight: params.valueWeight,
                score: this.calculateRelevanceScore(query, text) * params.valueWeight,
            })),
            ...trendingSuggestions.map(text => ({
                text,
                type: 'trending',
                prefix: 'Trending: ',
                weight: params.trendingWeight,
                score: 0.5 * params.trendingWeight,
            })),
            ...personalizedSuggestions.map(text => ({
                text,
                type: 'personalized',
                prefix: 'For you: ',
                weight: params.personalizedWeight,
                score: 0.7 * params.personalizedWeight,
            })),
        ];
        const seen = new Set();
        const uniqueSuggestions = [];
        for (const suggestion of weightedSuggestions) {
            const lowerText = suggestion.text.toLowerCase();
            if (!seen.has(lowerText)) {
                seen.add(lowerText);
                uniqueSuggestions.push(suggestion);
            }
        }
        uniqueSuggestions.sort((a, b) => b.score - a.score);
        const limitedSuggestions = uniqueSuggestions.slice(0, limit);
        if (params.highlightMatches) {
            for (const suggestion of limitedSuggestions) {
                suggestion.highlighted = this.highlightMatches(query, suggestion.text);
            }
        }
        return limitedSuggestions.map(({ _weight, _score, ...suggestion }) => suggestion);
    }
    calculateRelevanceScore(query, suggestion) {
        if (!query || !suggestion) {
            return 0;
        }
        const queryLower = query.toLowerCase();
        const suggestionLower = suggestion.toLowerCase();
        if (suggestionLower.startsWith(queryLower)) {
            return 1.0;
        }
        const words = suggestionLower.split(/\s+/);
        if (words.some(word => word.startsWith(queryLower))) {
            return 0.8;
        }
        if (suggestionLower.includes(queryLower)) {
            return 0.6;
        }
        if (words.some(word => word.includes(queryLower))) {
            return 0.4;
        }
        return 0.2;
    }
    calculateCompositeScore(item, _weight, _score) {
        return item.score || 0.5;
    }
    highlightMatches(query, suggestion) {
        if (!query || !suggestion) {
            return suggestion;
        }
        try {
            const queryLower = query.toLowerCase();
            const suggestionText = suggestion;
            const startIndex = suggestion.toLowerCase().indexOf(queryLower);
            if (startIndex >= 0) {
                const matchingPart = suggestion.substring(startIndex, startIndex + query.length);
                return suggestionText.replace(matchingPart, `<strong>${matchingPart}</strong>`);
            }
            return suggestionText;
        }
        catch (error) {
            return suggestion;
        }
    }
    async trackSuggestionSelection(query, selectedSuggestion, suggestionType, userId, sessionId) {
        try {
            await this.searchAnalyticsService.trackEvent('autocomplete_selection', {
                query,
                selectedSuggestion,
                suggestionType,
                userId,
                sessionId,
            });
        }
        catch (error) {
            this.logger.error(`Failed to track suggestion selection: ${error.message}`);
        }
    }
};
exports.AutocompleteService = AutocompleteService;
exports.AutocompleteService = AutocompleteService = AutocompleteService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [elasticsearch_service_1.ElasticsearchService,
        search_analytics_service_1.SearchAnalyticsService,
        personalization_service_1.PersonalizationService,
        ab_testing_service_1.AbTestingService])
], AutocompleteService);
//# sourceMappingURL=autocomplete.service.js.map