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
var SearchAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const elasticsearch_1 = require("@nestjs/elasticsearch");
const search_event_input_1 = require("../graphql/search-event.input");
let SearchAnalyticsService = SearchAnalyticsService_1 = class SearchAnalyticsService {
    constructor(elasticsearchService, configService) {
        this.elasticsearchService = elasticsearchService;
        this.configService = configService;
        this.logger = new common_1.Logger(SearchAnalyticsService_1.name);
        this.analyticsIndex = this.configService.get('ELASTICSEARCH_ANALYTICS_INDEX', 'search_analytics');
        this.analyticsEnabled = this.configService.get('SEARCH_ANALYTICS_ENABLED', true);
    }
    async trackEvent(eventType, data, user) {
        if (!this.analyticsEnabled) {
            this.logger.debug(`Search analytics disabled, not tracking event: ${eventType}`);
            return true;
        }
        try {
            const timestamp = new Date().toISOString();
            const eventDocument = {
                eventType,
                timestamp,
                data,
                userId: user?.id || null,
                isAuthenticated: !!user,
                sessionId: data.sessionId || null,
            };
            await this.elasticsearchService.index({
                index: this.analyticsIndex,
                body: eventDocument,
            });
            this.logger.debug(`Tracked search event: ${eventType}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to track search event: ${error.message}`, error.stack);
            return false;
        }
    }
    async trackSearchQuery(query, user) {
        return this.trackEvent(search_event_input_1.SearchEventType.SEARCH_QUERY, { query }, user);
    }
    async trackSuggestionClick(suggestionText, originalQuery, suggestionData, user) {
        return this.trackEvent(search_event_input_1.SearchEventType.SUGGESTION_CLICK, {
            suggestionText,
            originalQuery,
            ...suggestionData,
        }, user);
    }
    async trackSuggestionImpression(query, suggestionsCount, user) {
        return this.trackEvent(search_event_input_1.SearchEventType.SUGGESTION_IMPRESSION, {
            query,
            suggestionsCount,
        }, user);
    }
    async trackSearchResultClick(resultId, position, query, user) {
        return this.trackEvent(search_event_input_1.SearchEventType.SEARCH_RESULT_CLICK, {
            resultId,
            position,
            query,
        }, user);
    }
    async getPopularSearchQueries(days = 7, limit = 10) {
        if (!this.analyticsEnabled) {
            this.logger.debug('Search analytics disabled, returning empty popular queries');
            return [];
        }
        try {
            const now = new Date();
            const startDate = new Date();
            startDate.setDate(now.getDate() - days);
            const response = await this.elasticsearchService.search({
                index: this.analyticsIndex,
                size: 0,
                query: {
                    bool: {
                        must: [
                            { term: { eventType: search_event_input_1.SearchEventType.SEARCH_QUERY } },
                            {
                                range: {
                                    timestamp: {
                                        gte: startDate.toISOString(),
                                        lte: now.toISOString(),
                                    },
                                },
                            },
                        ],
                    },
                },
                aggs: {
                    popular_queries: {
                        terms: {
                            field: 'data.query.keyword',
                            size: limit,
                        },
                    },
                },
            });
            const popularQueries = response.aggregations?.popular_queries;
            const buckets = popularQueries?.buckets || [];
            return buckets.map((bucket) => ({
                query: bucket.key,
                count: bucket.doc_count,
            }));
        }
        catch (error) {
            this.logger.error(`Failed to get popular search queries: ${error.message}`, error.stack);
            return [];
        }
    }
    async createAnalyticsIndexIfNotExists() {
        try {
            const indexExists = await this.elasticsearchService.indices.exists({
                index: this.analyticsIndex,
            });
            if (indexExists) {
                this.logger.log(`Analytics index ${this.analyticsIndex} already exists`);
                return;
            }
            await this.elasticsearchService.indices.create({
                index: this.analyticsIndex,
                body: {
                    mappings: {
                        properties: {
                            eventType: { type: 'keyword' },
                            timestamp: { type: 'date' },
                            data: {
                                type: 'object',
                                properties: {
                                    query: { type: 'text', fields: { keyword: { type: 'keyword' } } },
                                    suggestionText: { type: 'text', fields: { keyword: { type: 'keyword' } } },
                                    originalQuery: { type: 'text', fields: { keyword: { type: 'keyword' } } },
                                    suggestionCategory: { type: 'keyword' },
                                    suggestionType: { type: 'keyword' },
                                    isPopular: { type: 'boolean' },
                                    isPersonalized: { type: 'boolean' },
                                    resultId: { type: 'keyword' },
                                    position: { type: 'integer' },
                                    suggestionsCount: { type: 'integer' },
                                },
                            },
                            userId: { type: 'keyword' },
                            isAuthenticated: { type: 'boolean' },
                            sessionId: { type: 'keyword' },
                        },
                    },
                    settings: {
                        number_of_shards: 1,
                        number_of_replicas: 1,
                    },
                },
            });
            this.logger.log(`Created analytics index ${this.analyticsIndex}`);
        }
        catch (error) {
            this.logger.error(`Failed to create analytics index: ${error.message}`, error.stack);
        }
    }
};
exports.SearchAnalyticsService = SearchAnalyticsService;
exports.SearchAnalyticsService = SearchAnalyticsService = SearchAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [elasticsearch_1.ElasticsearchService,
        config_1.ConfigService])
], SearchAnalyticsService);
//# sourceMappingURL=search-analytics.service.js.map