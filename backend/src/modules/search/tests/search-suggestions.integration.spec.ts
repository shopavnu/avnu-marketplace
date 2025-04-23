import { Test } from '@nestjs/testing';
import { SearchModule } from '../search.module';
import { SearchSuggestionService } from '../services/search-suggestion.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { AnalyticsService } from '../../analytics/services/analytics.service';
import { PersonalizationService } from '../../personalization/services/personalization.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

describe('Search Suggestions Integration', () => {
  let searchSuggestionService: SearchSuggestionService;

  // Mock services
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
    const moduleRef = await Test.createTestingModule({
      imports: [SearchModule],
    })
      .overrideProvider(ElasticsearchService)
      .useValue(elasticsearchMock)
      .overrideProvider(AnalyticsService)
      .useValue(analyticsMock)
      .overrideProvider(PersonalizationService)
      .useValue(personalizationMock)
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .overrideProvider(Logger)
      .useValue({ log: jest.fn(), error: jest.fn(), warn: jest.fn() })
      .compile();

    searchSuggestionService = moduleRef.get<SearchSuggestionService>(SearchSuggestionService);
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
    // Mock the Elasticsearch response
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
      } else {
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

    // Mock popular searches
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
    // Mock empty responses
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
