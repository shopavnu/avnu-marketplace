'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const testing_1 = require('@nestjs/testing');
const elasticsearch_1 = require('@nestjs/elasticsearch');
const config_1 = require('@nestjs/config');
const common_1 = require('@nestjs/common');
const search_suggestion_service_1 = require('../services/search-suggestion.service');
const personalization_service_1 = require('../../personalization/services/personalization.service');
const analytics_service_1 = require('../../analytics/services/analytics.service');
describe('Search Suggestions', () => {
  let searchSuggestionService;
  let elasticsearchService;
  let _personalizationService;
  let analyticsService;
  beforeEach(async () => {
    const elasticsearchMock = {
      search: jest.fn(),
    };
    const personalizationMock = {
      getPersonalizedSuggestions: jest.fn(),
    };
    const analyticsMock = {
      getPopularSearches: jest.fn(),
      trackEngagement: jest.fn(),
    };
    const configMock = {
      get: jest.fn(key => {
        const config = {
          SEARCH_SUGGESTIONS_ENABLED: true,
          SEARCH_SUGGESTIONS_MAX_LIMIT: 10,
        };
        return config[key] || null;
      }),
    };
    const module = await testing_1.Test.createTestingModule({
      providers: [
        search_suggestion_service_1.SearchSuggestionService,
        { provide: elasticsearch_1.ElasticsearchService, useValue: elasticsearchMock },
        {
          provide: personalization_service_1.PersonalizationService,
          useValue: personalizationMock,
        },
        { provide: analytics_service_1.AnalyticsService, useValue: analyticsMock },
        { provide: config_1.ConfigService, useValue: configMock },
        {
          provide: common_1.Logger,
          useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() },
        },
      ],
    }).compile();
    searchSuggestionService = module.get(search_suggestion_service_1.SearchSuggestionService);
    elasticsearchService = module.get(elasticsearch_1.ElasticsearchService);
    _personalizationService = module.get(personalization_service_1.PersonalizationService);
    analyticsService = module.get(analytics_service_1.AnalyticsService);
  });
  describe('Basic Functionality', () => {
    it('should be defined', () => {
      expect(searchSuggestionService).toBeDefined();
    });
    it('should return suggestions based on prefix', async () => {
      elasticsearchService.search.mockResolvedValueOnce({
        took: 5,
        timed_out: false,
        _shards: { total: 1, successful: 1, failed: 0, skipped: 0 },
        hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
        suggest: {
          completion: [
            {
              text: 'sust',
              offset: 0,
              length: 4,
              options: [
                {
                  text: 'sustainable clothing',
                  _source: {
                    text: 'sustainable clothing',
                    type: 'product',
                    score: 5.0,
                    category: 'clothing',
                  },
                  _index: 'search_suggestions',
                },
              ],
            },
          ],
        },
      });
      elasticsearchService.search.mockResolvedValueOnce({
        took: 3,
        timed_out: false,
        _shards: { total: 1, successful: 1, failed: 0, skipped: 0 },
        hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
        suggest: {
          completion: [
            {
              text: 'sust',
              offset: 0,
              length: 4,
              options: [],
            },
          ],
        },
      });
      analyticsService.getPopularSearches.mockResolvedValueOnce([]);
      const result = await searchSuggestionService.getSuggestions({
        query: 'sust',
        limit: 5,
        includePopular: true,
        includePersonalized: false,
        includeCategoryContext: true,
      });
      expect(result).toBeDefined();
      expect(result.suggestions).toHaveLength(1);
      expect(result.suggestions[0].text).toBe('sustainable clothing');
      expect(result.total).toBe(1);
    });
    it('should handle empty results gracefully', async () => {
      elasticsearchService.search.mockResolvedValueOnce({
        took: 3,
        timed_out: false,
        _shards: { total: 1, successful: 1, failed: 0, skipped: 0 },
        hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
        suggest: {
          completion: [
            {
              text: 'sust',
              offset: 0,
              length: 4,
              options: [],
            },
          ],
        },
      });
      elasticsearchService.search.mockResolvedValueOnce({
        took: 3,
        timed_out: false,
        _shards: { total: 1, successful: 1, failed: 0, skipped: 0 },
        hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
        suggest: {
          completion: [
            {
              text: 'sust',
              offset: 0,
              length: 4,
              options: [],
            },
          ],
        },
      });
      analyticsService.getPopularSearches.mockResolvedValueOnce([]);
      const result = await searchSuggestionService.getSuggestions({
        query: 'nonexistent',
        limit: 5,
        includePopular: true,
        includePersonalized: false,
        includeCategoryContext: true,
      });
      expect(result).toBeDefined();
      expect(result.suggestions).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });
  describe('Advanced Features', () => {
    it('should respect category filters', async () => {
      elasticsearchService.search.mockResolvedValueOnce({
        took: 3,
        timed_out: false,
        _shards: { total: 1, successful: 1, failed: 0, skipped: 0 },
        hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
        suggest: {
          completion: [
            {
              text: 'sust',
              offset: 0,
              length: 4,
              options: [],
            },
          ],
        },
      });
      elasticsearchService.search.mockResolvedValueOnce({
        took: 3,
        timed_out: false,
        _shards: { total: 1, successful: 1, failed: 0, skipped: 0 },
        hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
        suggest: {
          completion: [
            {
              text: 'sust',
              offset: 0,
              length: 4,
              options: [],
            },
          ],
        },
      });
      await searchSuggestionService.getSuggestions({
        query: 'test',
        limit: 5,
        includePopular: true,
        includePersonalized: false,
        includeCategoryContext: true,
        categories: ['clothing'],
      });
      expect(elasticsearchService.search).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            suggest: expect.objectContaining({
              completion: expect.objectContaining({
                completion: expect.objectContaining({
                  contexts: expect.objectContaining({
                    category: ['clothing'],
                  }),
                }),
              }),
            }),
          }),
        }),
      );
      expect(analyticsService.getPopularSearches).toHaveBeenCalledWith(
        'test',
        expect.any(Number),
        ['clothing'],
        expect.any(Number),
      );
    });
    it('should track suggestion requests', async () => {
      elasticsearchService.search.mockResolvedValueOnce({
        took: 3,
        timed_out: false,
        _shards: { total: 1, successful: 1, failed: 0, skipped: 0 },
        hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
        suggest: {
          completion: [
            {
              text: 'sust',
              offset: 0,
              length: 4,
              options: [],
            },
          ],
        },
      });
      elasticsearchService.search.mockResolvedValueOnce({
        took: 3,
        timed_out: false,
        _shards: { total: 1, successful: 1, failed: 0, skipped: 0 },
        hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
        suggest: {
          completion: [
            {
              text: 'sust',
              offset: 0,
              length: 4,
              options: [],
            },
          ],
        },
      });
      analyticsService.getPopularSearches.mockResolvedValueOnce([]);
      await searchSuggestionService.getSuggestions({
        query: 'test',
        limit: 5,
        includePopular: true,
        includePersonalized: false,
        includeCategoryContext: true,
      });
      expect(analyticsService.trackEngagement).toHaveBeenCalledWith(
        expect.objectContaining({
          engagementType: expect.any(String),
          entityType: 'search',
          pagePath: '/search/suggestions',
          metadata: expect.any(String),
        }),
      );
    });
  });
});
//# sourceMappingURL=search-suggestions.spec.js.map
