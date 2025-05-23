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
var SearchSuggestionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchSuggestionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const elasticsearch_1 = require("@nestjs/elasticsearch");
const personalization_service_1 = require("../../personalization/services/personalization.service");
const search_analytics_service_1 = require("./search-analytics.service");
let SearchSuggestionService = SearchSuggestionService_1 = class SearchSuggestionService {
    constructor(elasticsearchService, configService, personalizationService, searchAnalyticsService) {
        this.elasticsearchService = elasticsearchService;
        this.configService = configService;
        this.personalizationService = personalizationService;
        this.searchAnalyticsService = searchAnalyticsService;
        this.logger = new common_1.Logger(SearchSuggestionService_1.name);
        this.defaultLimit = 10;
        this.isFeatureEnabled = true;
        this.suggestionIndex = this.configService.get('ELASTICSEARCH_SUGGESTION_INDEX', 'suggestions');
        this.maxSuggestions = this.configService.get('MAX_SUGGESTIONS', 20);
    }
    async getSuggestions(input, user) {
        const { query, limit = this.defaultLimit, includePopular = true, includePersonalized = true, } = input;
        if (!this.isFeatureEnabled || !query || query.length < 2) {
            this.logger.debug('Query too short or feature disabled, returning empty results');
            return {
                suggestions: [],
                total: 0,
                isPersonalized: false,
                originalQuery: query,
            };
        }
        try {
            this.logger.debug(`Getting suggestions for query: "${query}", limit: ${limit}`);
            const promisesToSettle = [];
            promisesToSettle.push(this.getPrefixSuggestions(query, limit, input.categories?.[0]));
            if (includePopular) {
                promisesToSettle.push(this.getPopularSuggestions(query, limit, input.categories?.[0]));
            }
            else {
                promisesToSettle.push(Promise.resolve([]));
            }
            if (includePersonalized && user) {
                promisesToSettle.push(this.getPersonalizedSuggestions(query, user, limit));
            }
            else {
                promisesToSettle.push(Promise.resolve([]));
            }
            this.logger.debug(`DEBUG: getSuggestions - promisesToSettle.length: ${promisesToSettle.length}`);
            const settledResults = await Promise.allSettled(promisesToSettle);
            const prefixPromiseResult = settledResults.length > 0
                ? settledResults[0]
                : { status: 'rejected', reason: new Error('settledResults[0] is undefined (synthetic)') };
            const popularPromiseResult = settledResults.length > 1
                ? settledResults[1]
                : { status: 'rejected', reason: new Error('settledResults[1] is undefined (synthetic)') };
            const personalizedPromiseResult = settledResults.length > 2
                ? settledResults[2]
                : { status: 'rejected', reason: new Error('settledResults[2] is undefined (synthetic)') };
            this.logger.debug(`DEBUG: getSuggestions - prefixPromiseResult: ${JSON.stringify(prefixPromiseResult)}`);
            this.logger.debug(`DEBUG: getSuggestions - popularPromiseResult: ${JSON.stringify(popularPromiseResult)}`);
            this.logger.debug(`DEBUG: getSuggestions - personalizedPromiseResult: ${JSON.stringify(personalizedPromiseResult)}`);
            const prefixSuggestions = prefixPromiseResult.status === 'fulfilled' ? prefixPromiseResult.value : [];
            if (prefixPromiseResult.status === 'rejected') {
                this.logger.error(`DEBUG: getSuggestions - prefixPromise failed: ${prefixPromiseResult.reason?.message}`, prefixPromiseResult.reason?.stack);
            }
            const popularSuggestionsList = popularPromiseResult.status === 'fulfilled' ? popularPromiseResult.value : [];
            if (popularPromiseResult.status === 'rejected') {
                this.logger.warn(`Failed to get popular suggestions: ${popularPromiseResult.reason?.message}`, popularPromiseResult.reason?.stack);
            }
            const personalizedSuggestionsList = personalizedPromiseResult.status === 'fulfilled' ? personalizedPromiseResult.value : [];
            if (personalizedPromiseResult.status === 'rejected') {
                const reasonMessage = personalizedPromiseResult.reason instanceof Error
                    ? personalizedPromiseResult.reason.message
                    : String(personalizedPromiseResult.reason);
                const reasonStack = personalizedPromiseResult.reason instanceof Error
                    ? personalizedPromiseResult.reason.stack
                    : undefined;
                this.logger.warn(`Failed to get personalized suggestions: ${reasonMessage}`, reasonStack);
                if (reasonMessage === 'settledResults[2] is undefined') {
                    this.logger.debug('Personalized suggestions were not applicable or the promise was not added.');
                }
            }
            const combinedSuggestions = this.combineAndDeduplicate(prefixSuggestions, popularSuggestionsList, personalizedSuggestionsList, limit);
            this.logger.debug(`Returning ${combinedSuggestions.length} suggestions`);
            if (combinedSuggestions.length > 0) {
                this.searchAnalyticsService
                    .trackSuggestionImpression(query, combinedSuggestions.length, user)
                    .catch(error => {
                    this.logger.error(`Failed to track suggestion impression: ${error.message}`, error.stack);
                });
            }
            return {
                suggestions: combinedSuggestions,
                total: combinedSuggestions.length,
                isPersonalized: personalizedSuggestionsList.length > 0,
                originalQuery: query,
            };
        }
        catch (error) {
            this.logger.error(`Error getting suggestions for query "${query}": ${error.message}`, error.stack);
            return {
                suggestions: [],
                total: 0,
                isPersonalized: false,
                originalQuery: query,
                error: error.message || 'Unknown error in getSuggestions',
            };
        }
    }
    async getPrefixSuggestions(query, limit, category) {
        try {
            const suggesterConfigTextCompletion = {
                field: 'text.completion',
                size: limit,
                skip_duplicates: true,
                fuzzy: {
                    fuzziness: 1,
                },
            };
            if (category) {
                suggesterConfigTextCompletion.contexts = {
                    category: [category],
                };
            }
            const response = await this.elasticsearchService.search({
                index: 'search_suggestions',
                body: {
                    suggest: {
                        completion: {
                            prefix: query,
                            completion: suggesterConfigTextCompletion,
                        },
                    },
                },
            });
            const options = response.suggest?.completion?.[0]?.options;
            let suggestions = Array.isArray(options) ? options : [];
            if (suggestions.length < limit) {
                const suggesterConfigNameCompletion = {
                    field: 'name.completion',
                    size: limit - suggestions.length,
                    skip_duplicates: true,
                    fuzzy: {
                        fuzziness: 1,
                    },
                };
                if (category) {
                    suggesterConfigNameCompletion.contexts = {
                        category: [category],
                    };
                }
                const fallbackResponse = await this.elasticsearchService.search({
                    index: 'products,merchants,brands',
                    body: {
                        suggest: {
                            completion: {
                                prefix: query,
                                completion: suggesterConfigNameCompletion,
                            },
                        },
                    },
                });
                const fallbackOptions = fallbackResponse.suggest?.completion?.[0]?.options;
                if (Array.isArray(fallbackOptions) && fallbackOptions.length > 0) {
                    suggestions = [...suggestions, ...fallbackOptions];
                }
            }
            const mappedSuggestions = suggestions.map(option => {
                try {
                    if (!option || !option._source) {
                        this.logger.warn(`Skipping suggestion due to missing option or _source: ${JSON.stringify(option)}`);
                        return null;
                    }
                    const source = option._source;
                    const text = source.text || source.name;
                    const typeFromSource = source.type;
                    const indexName = option._index;
                    if (text === undefined || text === null) {
                        this.logger.warn(`Skipping suggestion due to missing text: ${JSON.stringify(option)}`);
                        return null;
                    }
                    return {
                        text: String(text),
                        score: Number(source.score || source.popularity || 1.0),
                        category: source.category || undefined,
                        type: typeFromSource || (indexName ? String(indexName).replace(/s$/, '') : 'unknown'),
                        isPopular: false,
                        isPersonalized: false,
                    };
                }
                catch (mapError) {
                    this.logger.error(`Error during suggestion mapping: ${mapError.message}, option: ${JSON.stringify(option)}`);
                    return null;
                }
            });
            const validSuggestions = mappedSuggestions.filter(s => s !== null);
            return Promise.resolve(validSuggestions);
        }
        catch (error) {
            this.logger.error(`Error getting prefix suggestions for "${query}": ${error.message}`);
            return Promise.resolve([]);
        }
    }
    async getPopularSuggestions(query, limit = 5, category) {
        if (!this.isFeatureEnabled || !query || query.length < 2) {
            return Promise.resolve([]);
        }
        try {
            const popularAnalyticsLimit = this.configService.get('POPULAR_SEARCHES_ANALYTICS_LIMIT', 20);
            const daysRange = this.configService.get('POPULAR_SEARCHES_DAYS_RANGE', 7);
            const popularQueriesFromAnalytics = await this.searchAnalyticsService.getPopularSearchQueries(daysRange, popularAnalyticsLimit);
            let filteredPopular = popularQueriesFromAnalytics.filter(item => item.query.toLowerCase().includes(query.toLowerCase()));
            if (category) {
                filteredPopular = filteredPopular.filter(item => {
                    const itemCategory = this.getCategoryFromQuery(item.query);
                    return itemCategory === category;
                });
            }
            const matchingQueries = filteredPopular
                .map(item => ({
                text: item.query,
                score: Math.min(10, 5 + Math.log(item.count)),
                category: this.getCategoryFromQuery(item.query),
                type: 'search',
                isPopular: true,
                isPersonalized: false,
            }))
                .slice(0, limit);
            return matchingQueries;
        }
        catch (error) {
            this.logger.error(`Error getting popular suggestions: ${error.message}`);
            return Promise.resolve([]);
        }
    }
    async getPersonalizedSuggestions(query, user, limit) {
        const userId = user.id;
        try {
            const personalizedSuggestions = await this.personalizationService.getPersonalizedSuggestions(query, userId, limit);
            this.logger.debug(`DEBUG: getPersonalizedSuggestions - raw suggestions from service: ${JSON.stringify(personalizedSuggestions)}`);
            return personalizedSuggestions.map(suggestion => {
                this.logger.debug(`DEBUG: getPersonalizedSuggestions - mapping suggestion: ${JSON.stringify(suggestion)}`);
                return {
                    text: suggestion.text,
                    score: suggestion.relevance,
                    category: suggestion.category,
                    type: suggestion.type,
                    isPopular: false,
                    isPersonalized: true,
                };
            });
        }
        catch (error) {
            this.logger.error(`Error getting personalized suggestions for user ${userId}: ${error.message}`, error.stack, SearchSuggestionService_1.name);
            return Promise.resolve([]);
        }
    }
    combineAndDeduplicate(prefixSuggestions, popularSuggestions, personalizedSuggestions, limit) {
        const _allSuggestions = [
            ...prefixSuggestions,
            ...popularSuggestions,
            ...personalizedSuggestions,
        ];
        const suggestionMap = new Map();
        for (const suggestion of personalizedSuggestions) {
            suggestionMap.set(suggestion.text.toLowerCase(), suggestion);
        }
        for (const suggestion of popularSuggestions) {
            const key = suggestion.text.toLowerCase();
            if (!suggestionMap.has(key) || suggestion.score > suggestionMap.get(key).score) {
                suggestionMap.set(key, suggestion);
            }
        }
        for (const suggestion of prefixSuggestions) {
            const key = suggestion.text.toLowerCase();
            if (!suggestionMap.has(key) || suggestion.score > suggestionMap.get(key).score) {
                suggestionMap.set(key, suggestion);
            }
        }
        const combinedSuggestions = Array.from(suggestionMap.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        return combinedSuggestions;
    }
    getCategoryFromQuery(query) {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('shirt') ||
            lowerQuery.includes('dress') ||
            lowerQuery.includes('cotton')) {
            return 'clothing';
        }
        if (lowerQuery.includes('table') ||
            lowerQuery.includes('chair') ||
            lowerQuery.includes('sofa')) {
            return 'furniture';
        }
        if (lowerQuery.includes('phone') ||
            lowerQuery.includes('laptop') ||
            lowerQuery.includes('camera')) {
            return 'electronics';
        }
        if (lowerQuery.includes('eco') ||
            lowerQuery.includes('sustainable') ||
            lowerQuery.includes('organic')) {
            return 'eco-friendly';
        }
        return undefined;
    }
};
exports.SearchSuggestionService = SearchSuggestionService;
exports.SearchSuggestionService = SearchSuggestionService = SearchSuggestionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [elasticsearch_1.ElasticsearchService,
        config_1.ConfigService,
        personalization_service_1.PersonalizationService,
        search_analytics_service_1.SearchAnalyticsService])
], SearchSuggestionService);
//# sourceMappingURL=search-suggestion.service.js.map