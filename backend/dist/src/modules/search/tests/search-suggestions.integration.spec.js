"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const search_module_1 = require("../search.module");
const search_suggestion_service_1 = require("../services/search-suggestion.service");
const elasticsearch_1 = require("@nestjs/elasticsearch");
const analytics_service_1 = require("../../analytics/services/analytics.service");
const personalization_service_1 = require("../../personalization/services/personalization.service");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
describe('Search Suggestions Integration', () => {
    let searchSuggestionService;
    const elasticsearchMock = {
        search: jest.fn(),
    };
    const analyticsMock = {
        getPopularSearches: jest.fn(),
        trackEngagement: jest.fn(),
    };
    const personalizationMock = {
        getPersonalizedSuggestions: jest.fn(),
    };
    const configMock = {
        get: jest.fn().mockImplementation(key => {
            const config = {
                SEARCH_SUGGESTIONS_ENABLED: true,
                SEARCH_SUGGESTIONS_MAX_LIMIT: 10,
            };
            return config[key] || null;
        }),
    };
    beforeAll(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            imports: [search_module_1.SearchModule],
        })
            .overrideProvider(elasticsearch_1.ElasticsearchService)
            .useValue(elasticsearchMock)
            .overrideProvider(analytics_service_1.AnalyticsService)
            .useValue(analyticsMock)
            .overrideProvider(personalization_service_1.PersonalizationService)
            .useValue(personalizationMock)
            .overrideProvider(config_1.ConfigService)
            .useValue(configMock)
            .overrideProvider(common_1.Logger)
            .useValue({ log: jest.fn(), error: jest.fn(), warn: jest.fn() })
            .compile();
        searchSuggestionService = moduleRef.get(search_suggestion_service_1.SearchSuggestionService);
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should return empty suggestions for short queries', async () => {
        const result = await searchSuggestionService.getSuggestions({
            query: 'a',
            limit: 5,
            includePopular: true,
            includePersonalized: true,
            includeCategoryContext: true,
        });
        expect(result).toBeDefined();
        expect(result.suggestions).toEqual([]);
        expect(result.total).toBe(0);
    });
    it('should return suggestions from Elasticsearch', async () => {
        elasticsearchMock.search.mockImplementation(params => {
            if (params.index === 'search_suggestions') {
                return Promise.resolve({
                    suggest: {
                        completion: [
                            {
                                text: 'test',
                                offset: 0,
                                length: 4,
                                options: [
                                    {
                                        text: 'test product',
                                        _source: {
                                            text: 'test product',
                                            type: 'product',
                                            score: 5.0,
                                            category: 'clothing',
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                });
            }
            else {
                return Promise.resolve({
                    suggest: {
                        completion: [
                            {
                                text: 'test',
                                offset: 0,
                                length: 4,
                                options: [],
                            },
                        ],
                    },
                });
            }
        });
        analyticsMock.getPopularSearches.mockResolvedValue([
            {
                query: 'test query',
                count: 10,
                category: 'clothing',
            },
        ]);
        const result = await searchSuggestionService.getSuggestions({
            query: 'test',
            limit: 5,
            includePopular: true,
            includePersonalized: false,
            includeCategoryContext: true,
        });
        expect(result).toBeDefined();
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(elasticsearchMock.search).toHaveBeenCalled();
        expect(analyticsMock.getPopularSearches).toHaveBeenCalled();
    });
    it('should track suggestion requests', async () => {
        elasticsearchMock.search.mockImplementation(() => {
            return Promise.resolve({
                suggest: {
                    completion: [
                        {
                            text: 'test',
                            offset: 0,
                            length: 4,
                            options: [],
                        },
                    ],
                },
            });
        });
        analyticsMock.getPopularSearches.mockResolvedValue([]);
        await searchSuggestionService.getSuggestions({
            query: 'test',
            limit: 5,
            includePopular: true,
            includePersonalized: false,
            includeCategoryContext: true,
        });
        expect(analyticsMock.trackEngagement).toHaveBeenCalled();
    });
});
//# sourceMappingURL=search-suggestions.integration.spec.js.map