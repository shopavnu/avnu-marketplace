'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const testing_1 = require('@nestjs/testing');
const elasticsearch_1 = require('@nestjs/elasticsearch');
const config_1 = require('@nestjs/config');
const common_1 = require('@nestjs/common');
const search_suggestion_service_1 = require('./search-suggestion.service');
const personalization_service_1 = require('../../personalization/services/personalization.service');
const analytics_service_1 = require('../../analytics/services/analytics.service');
describe('SearchSuggestionService', () => {
  let service;
  let elasticsearchServiceMock;
  let personalizationServiceMock;
  let analyticsServiceMock;
  let configServiceMock;
  let loggerMock;
  beforeEach(async () => {
    elasticsearchServiceMock = {
      search: jest.fn(),
    };
    personalizationServiceMock = {
      getPersonalizedSuggestions: jest.fn(),
    };
    analyticsServiceMock = {
      getPopularSearches: jest.fn(),
      trackEngagement: jest.fn(),
    };
    configServiceMock = {
      get: jest.fn(),
    };
    loggerMock = new common_1.Logger(search_suggestion_service_1.SearchSuggestionService.name);
    configServiceMock.get.mockImplementation((key, defaultValue) => {
      const config = {
        SEARCH_SUGGESTIONS_ENABLED: true,
        SEARCH_SUGGESTIONS_MAX_LIMIT: 10,
        SEARCH_SUGGESTIONS_DEFAULT_LIMIT: 5,
      };
      return config[key] !== undefined ? config[key] : defaultValue;
    });
    const module = await testing_1.Test.createTestingModule({
      providers: [
        search_suggestion_service_1.SearchSuggestionService,
        {
          provide: elasticsearch_1.ElasticsearchService,
          useValue: elasticsearchServiceMock,
        },
        {
          provide: personalization_service_1.PersonalizationService,
          useValue: personalizationServiceMock,
        },
        {
          provide: analytics_service_1.AnalyticsService,
          useValue: analyticsServiceMock,
        },
        {
          provide: config_1.ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: common_1.Logger,
          useValue: loggerMock,
        },
      ],
    }).compile();
    service = module.get(search_suggestion_service_1.SearchSuggestionService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('getSuggestions', () => {
    it('should return empty array when query is too short', async () => {
      const input = {
        query: 'a',
        limit: 5,
        includePopular: true,
        includePersonalized: true,
        includeCategoryContext: true,
      };
      const result = await service.getSuggestions(input);
      expect(result.suggestions).toEqual([]);
      expect(result.originalQuery).toEqual('a');
      expect(result.total).toEqual(0);
    });
    it('should combine suggestions from different sources', async () => {
      const input = {
        query: 'test',
        limit: 5,
        includePopular: true,
        includePersonalized: true,
        includeCategoryContext: true,
      };
      elasticsearchServiceMock.search.mockResolvedValueOnce({
        suggest: {
          completion: [
            {
              options: [
                {
                  _source: {
                    text: 'test product',
                    type: 'product',
                    score: 5.0,
                  },
                  _index: 'search_suggestions',
                },
              ],
            },
          ],
        },
      });
      elasticsearchServiceMock.search.mockResolvedValueOnce({
        suggest: {
          completion: [
            {
              options: [],
            },
          ],
        },
      });
      analyticsServiceMock.getPopularSearches.mockResolvedValueOnce([
        {
          query: 'test query',
          count: 10,
          category: 'clothing',
        },
      ]);
      personalizationServiceMock.getPersonalizedSuggestions.mockResolvedValueOnce([]);
      const result = await service.getSuggestions(input);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.originalQuery).toEqual('test');
      expect(elasticsearchServiceMock.search).toHaveBeenCalledTimes(2);
      expect(analyticsServiceMock.getPopularSearches).toHaveBeenCalledTimes(1);
      expect(personalizationServiceMock.getPersonalizedSuggestions).toHaveBeenCalledTimes(0);
    });
    it('should include personalized suggestions for authenticated users', async () => {
      const input = {
        query: 'test',
        limit: 5,
        includePopular: true,
        includePersonalized: true,
        includeCategoryContext: true,
      };
      const user = {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      elasticsearchServiceMock.search.mockResolvedValueOnce({
        suggest: {
          completion: [
            {
              options: [
                {
                  _source: {
                    text: 'test product',
                    type: 'product',
                    score: 5.0,
                  },
                  _index: 'search_suggestions',
                },
              ],
            },
          ],
        },
      });
      elasticsearchServiceMock.search.mockResolvedValueOnce({
        suggest: {
          completion: [
            {
              options: [],
            },
          ],
        },
      });
      analyticsServiceMock.getPopularSearches.mockResolvedValueOnce([
        {
          query: 'test query',
          count: 10,
          category: 'clothing',
        },
      ]);
      personalizationServiceMock.getPersonalizedSuggestions.mockResolvedValueOnce([
        {
          text: 'test personalized',
          relevance: 8.0,
          category: 'electronics',
          type: 'search',
        },
      ]);
      const result = await service.getSuggestions(input, user);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.originalQuery).toEqual('test');
      expect(elasticsearchServiceMock.search).toHaveBeenCalledTimes(2);
      expect(analyticsServiceMock.getPopularSearches).toHaveBeenCalledTimes(1);
      expect(personalizationServiceMock.getPersonalizedSuggestions).toHaveBeenCalledTimes(1);
      const combinedSuggestions = Array.from(result.suggestions.values()).sort(
        (a, b) => b.score - a.score,
      );
      const personalizedSuggestion = combinedSuggestions.find(s => s.text === 'test personalized');
      expect(personalizedSuggestion).toBeDefined();
      expect(personalizedSuggestion?.isPersonalized).toBe(true);
    });
    it('should respect category filters', async () => {
      const input = {
        query: 'test',
        limit: 5,
        categories: ['clothing'],
        includePopular: true,
        includePersonalized: true,
        includeCategoryContext: true,
      };
      elasticsearchServiceMock.search.mockResolvedValueOnce({
        suggest: {
          completion: [
            {
              options: [
                {
                  _source: {
                    text: 'test clothing',
                    type: 'product',
                    category: 'clothing',
                    score: 5.0,
                  },
                  _index: 'search_suggestions',
                },
              ],
            },
          ],
        },
      });
      elasticsearchServiceMock.search.mockResolvedValueOnce({
        suggest: {
          completion: [
            {
              options: [],
            },
          ],
        },
      });
      analyticsServiceMock.getPopularSearches.mockResolvedValueOnce([
        {
          query: 'test clothing',
          count: 10,
          category: 'clothing',
        },
      ]);
      const result = await service.getSuggestions(input);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(elasticsearchServiceMock.search).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            suggest: expect.objectContaining({
              completion: expect.objectContaining({
                completion: expect.objectContaining({
                  contexts: {
                    category: ['clothing'],
                  },
                }),
              }),
            }),
          }),
        }),
      );
      expect(analyticsServiceMock.getPopularSearches).toHaveBeenCalledWith(
        'test',
        expect.any(Number),
        ['clothing'],
        expect.any(Number),
      );
    });
    it('should track suggestion requests in analytics', async () => {
      const input = {
        query: 'test',
        limit: 5,
        includePopular: true,
        includePersonalized: true,
        includeCategoryContext: true,
      };
      elasticsearchServiceMock.search.mockResolvedValueOnce({
        suggest: {
          completion: [
            {
              options: [],
            },
          ],
        },
      });
      elasticsearchServiceMock.search.mockResolvedValueOnce({
        suggest: {
          completion: [
            {
              options: [],
            },
          ],
        },
      });
      analyticsServiceMock.getPopularSearches.mockResolvedValueOnce([]);
      const result = await service.getSuggestions(input);
      expect(result.suggestions).toEqual([]);
      expect(analyticsServiceMock.trackEngagement).toHaveBeenCalledWith(
        expect.objectContaining({
          engagementType: 'search',
          entityType: 'search',
          pagePath: '/search/suggestions',
          metadata: expect.any(String),
        }),
      );
    });
    it('should handle errors gracefully', async () => {
      const input = {
        query: 'test',
        limit: 5,
        includePopular: true,
        includePersonalized: true,
        includeCategoryContext: true,
      };
      elasticsearchServiceMock.search.mockRejectedValueOnce(new Error('Elasticsearch error'));
      const result = await service.getSuggestions(input);
      expect(result).toBeDefined();
      expect(result.suggestions).toEqual([]);
      expect(result.originalQuery).toEqual('test');
      expect(result.total).toEqual(0);
    });
  });
  describe('getPrefixSuggestions', () => {
    it('should return empty array for short queries', async () => {
      const result = await service['getPrefixSuggestions']('a', 5);
      expect(result).toEqual([]);
    });
    it('should process Elasticsearch completion suggestions', async () => {
      elasticsearchServiceMock.search.mockResolvedValueOnce({
        suggest: {
          completion: [
            {
              options: [
                {
                  _source: {
                    text: 'test product',
                    type: 'product',
                    score: 5.0,
                  },
                  _index: 'search_suggestions',
                },
              ],
            },
          ],
        },
      });
      elasticsearchServiceMock.search.mockResolvedValueOnce({
        suggest: {
          completion: [
            {
              options: [],
            },
          ],
        },
      });
      const result = await service['getPrefixSuggestions']('test', 5);
      expect(result.length).toEqual(1);
      expect(result[0].text).toEqual('test product');
      expect(result[0].type).toEqual('product');
    });
    it('should handle empty response from Elasticsearch', async () => {
      elasticsearchServiceMock.search.mockResolvedValueOnce({
        suggest: {
          completion: [
            {
              options: [],
            },
          ],
        },
      });
      elasticsearchServiceMock.search.mockResolvedValueOnce({
        suggest: {
          completion: [
            {
              options: [],
            },
          ],
        },
      });
      const result = await service['getPrefixSuggestions']('test', 5);
      expect(result).toEqual([]);
    });
  });
  describe('getPopularSuggestions', () => {
    it('should map popular searches to suggestions', async () => {
      analyticsServiceMock.getPopularSearches.mockResolvedValueOnce([
        {
          query: 'popular query',
          count: 15,
          category: 'electronics',
        },
      ]);
      const result = await service['getPopularSuggestions']('pop', 5);
      expect(result.length).toEqual(1);
      expect(result[0].text).toEqual('popular query');
      expect(result[0].score).toEqual(15);
      expect(result[0].category).toEqual('electronics');
      expect(result[0].isPopular).toBe(true);
    });
    it('should handle empty response from analytics service', async () => {
      analyticsServiceMock.getPopularSearches.mockResolvedValueOnce([]);
      const result = await service['getPopularSuggestions']('test', 5);
      expect(result).toEqual([]);
    });
  });
  describe('getPersonalizedSuggestions', () => {
    it('should map personalized suggestions correctly', async () => {
      personalizationServiceMock.getPersonalizedSuggestions.mockResolvedValueOnce([
        {
          text: 'personalized query',
          score: 9.5,
          category: 'clothing',
          type: 'search',
        },
      ]);
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await service['getPersonalizedSuggestions']('per', user, 5);
      expect(result.length).toEqual(1);
      expect(result[0].text).toEqual('personalized query');
      expect(result[0].isPersonalized).toEqual(true);
      expect(result[0].score).toEqual(9.5);
      expect(result[0].category).toEqual('clothing');
      expect(result[0].isPersonalized).toBe(true);
    });
    it('should handle empty response from personalization service', async () => {
      personalizationServiceMock.getPersonalizedSuggestions.mockResolvedValueOnce([]);
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await service['getPersonalizedSuggestions']('test', user, 5);
      expect(result).toEqual([]);
    });
  });
  describe('combineAndDeduplicate', () => {
    it('should deduplicate suggestions by text', () => {
      const prefixSuggestions = [
        {
          text: 'test product',
          score: 10,
          type: 'product',
          isPopular: false,
          isPersonalized: false,
        },
      ];
      const popularSuggestions = [
        {
          text: 'test',
          score: 5,
          type: 'search',
          isPopular: true,
          isPersonalized: false,
        },
        {
          text: 'test product',
          score: 3,
          type: 'search',
          isPopular: true,
          isPersonalized: false,
        },
      ];
      const personalizedSuggestions = [
        {
          text: 'testing',
          score: 8,
          type: 'search',
          isPopular: false,
          isPersonalized: true,
        },
        {
          text: 'test new',
          score: 7,
          type: 'search',
          isPopular: false,
          isPersonalized: true,
        },
      ];
      const result = service['combineAndDeduplicate'](
        prefixSuggestions,
        popularSuggestions,
        personalizedSuggestions,
        5,
      );
      expect(result.length).toEqual(4);
      const testSuggestion = result.find(s => s.text === 'test');
      expect(testSuggestion?.isPopular).toEqual(true);
      const testingSuggestion = result.find(s => s.text === 'testing');
      expect(testingSuggestion?.isPersonalized).toEqual(true);
      expect(result[0].score).toBeGreaterThanOrEqual(result[1].score);
      expect(result[1].score).toBeGreaterThanOrEqual(result[2].score);
    });
    it('should respect the limit parameter', () => {
      const suggestions = [
        {
          text: 'test1',
          score: 10,
          type: 'product',
          isPopular: false,
          isPersonalized: false,
        },
        {
          text: 'test2',
          score: 8,
          type: 'search',
          isPopular: false,
          isPersonalized: false,
        },
        {
          text: 'test3',
          score: 6,
          type: 'product',
          isPopular: false,
          isPersonalized: false,
        },
        {
          text: 'test4',
          score: 4,
          type: 'search',
          isPopular: false,
          isPersonalized: false,
        },
        {
          text: 'test5',
          score: 2,
          type: 'product',
          isPopular: false,
          isPersonalized: false,
        },
      ];
      const result = service['combineAndDeduplicate'](suggestions, [], [], 3);
      expect(result.length).toEqual(3);
      expect(result[0].text).toEqual('test1');
      expect(result[1].text).toEqual('test2');
      expect(result[2].text).toEqual('test3');
    });
  });
});
//# sourceMappingURL=search-suggestion.service.spec.js.map
