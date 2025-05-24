import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SearchSuggestionService } from '../services/search-suggestion.service';
import { PersonalizationService } from '../../personalization/services/personalization.service';
import { SearchAnalyticsService } from '../services/search-analytics.service';

describe('Search Suggestions', () => {
  let searchSuggestionService: SearchSuggestionService;
  let elasticsearchService: jest.Mocked<ElasticsearchService>;
  let _personalizationService: jest.Mocked<PersonalizationService>;
  let searchAnalyticsService: jest.Mocked<SearchAnalyticsService>;

  beforeEach(async () => {
    // Create mock services
    const elasticsearchMock = {
      search: jest.fn(),
    };

    const personalizationMock = {
      getPersonalizedSuggestions: jest.fn(),
    };

    const searchAnalyticsServiceMock = {
      trackSuggestionImpression: jest.fn().mockResolvedValue(undefined),
      getPopularSearchQueries: jest.fn().mockResolvedValue([]),
      // Add any other SearchAnalyticsService methods if they are called by SearchSuggestionService
    };

    const configMock = {
      get: jest.fn(key => {
        const config = {
          SEARCH_SUGGESTIONS_ENABLED: true,
          SEARCH_SUGGESTIONS_MAX_LIMIT: 10,
          POPULAR_SEARCHES_ANALYTICS_LIMIT: 20, // Add this key
          POPULAR_SEARCHES_DAYS_RANGE: 7, // Add this key
        };
        return config[key] || null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchSuggestionService,
        { provide: ElasticsearchService, useValue: elasticsearchMock },
        { provide: PersonalizationService, useValue: personalizationMock },
        { provide: SearchAnalyticsService, useValue: searchAnalyticsServiceMock },
        { provide: ConfigService, useValue: configMock },
        { provide: Logger, useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() } },
      ],
    }).compile();

    searchSuggestionService = module.get<SearchSuggestionService>(SearchSuggestionService);
    elasticsearchService = module.get(ElasticsearchService) as jest.Mocked<ElasticsearchService>;
    _personalizationService = module.get(
      PersonalizationService,
    ) as jest.Mocked<PersonalizationService>;
    searchAnalyticsService = module.get(
      SearchAnalyticsService,
    ) as jest.Mocked<SearchAnalyticsService>;
  });

  describe('Basic Functionality', () => {
    it('should be defined', () => {
      expect(searchSuggestionService).toBeDefined();
    });

    it('should return suggestions based on prefix', async () => {
      // Mock Elasticsearch response
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

      // Mock empty fallback response
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

      // Mock empty popular suggestions
      searchAnalyticsService.getPopularSearchQueries.mockResolvedValueOnce([]);

      // Call the service
      const result = await searchSuggestionService.getSuggestions({
        query: 'sust',
        limit: 5,
        includePopular: true,
        includePersonalized: false,
        includeCategoryContext: true,
      });

      // Verify the result
      expect(result).toBeDefined();
      expect(result.suggestions).toHaveLength(1);
      expect(result.suggestions[0].text).toBe('sustainable clothing');
      expect(result.total).toBe(1);
    });

    it('should handle empty results gracefully', async () => {
      // Mock empty Elasticsearch responses
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

      // Mock empty popular suggestions
      searchAnalyticsService.getPopularSearchQueries.mockResolvedValueOnce([]);

      // Call the service
      const result = await searchSuggestionService.getSuggestions({
        query: 'nonexistent',
        limit: 5,
        includePopular: true,
        includePersonalized: false,
        includeCategoryContext: true,
      });

      // Verify the result
      expect(result).toBeDefined();
      expect(result.suggestions).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('Advanced Features', () => {
    it('should respect category filters', async () => {
      // Mock Elasticsearch response
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

      // Call the service with category filter
      await searchSuggestionService.getSuggestions({
        query: 'test',
        limit: 5,
        includePopular: true,
        includePersonalized: false,
        includeCategoryContext: true,
        categories: ['clothing'],
      });

      // Verify Elasticsearch was called with the right parameters
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

      // Verify analytics service was called with the right parameters
      expect(searchAnalyticsService.getPopularSearchQueries).toHaveBeenCalledWith(
        expect.any(Number), // days (e.g., 7)
        20, // limit used for the analytics query (fixed at 20 in service)
      );
    });

    it('should track suggestion requests', async () => {
      // Mock empty responses
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

      searchAnalyticsService.getPopularSearchQueries.mockResolvedValueOnce([]);

      // Call the service
      await searchSuggestionService.getSuggestions({
        query: 'test',
        limit: 5,
        includePopular: true,
        includePersonalized: false,
        includeCategoryContext: true,
      });

      // Verify analytics tracking was called (should not be, as no suggestions are returned)
      expect(searchAnalyticsService.trackSuggestionImpression).not.toHaveBeenCalled();
    });
  });
});
