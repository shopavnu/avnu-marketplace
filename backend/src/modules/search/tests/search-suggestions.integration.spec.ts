import { Test, TestingModule } from '@nestjs/testing';
// import { SearchModule } from '../search.module';
import { SearchSuggestionService } from '../services/search-suggestion.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchAnalyticsService } from '../services/search-analytics.service';
import { PersonalizationService } from '../../personalization/services/personalization.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { GraphQLModule as _GraphQLModule } from '@nestjs/graphql';
import {
  ApolloDriver as _ApolloDriver,
  ApolloDriverConfig as _ApolloDriverConfig,
} from '@nestjs/apollo';

describe('Search Suggestions Integration', () => {
  let searchSuggestionService: SearchSuggestionService;
  let moduleRef: TestingModule; // Declare moduleRef to be accessible in afterAll

  // Mock services
  const elasticsearchMock = {
    search: jest.fn(),
  };

  const analyticsMock = {
    getPopularSearchQueries: jest.fn(),
    trackSuggestionImpression: jest.fn().mockResolvedValue(undefined),
    // Add any other methods from SearchAnalyticsService that might be called indirectly or in other tests
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
    moduleRef = await Test.createTestingModule({
      imports: [
        // GraphQLModule.forRoot<ApolloDriverConfig>({
        //   driver: ApolloDriver,
        //   autoSchemaFile: true, // Using in-memory schema generation for tests
        // }),
      ],
      providers: [
        SearchSuggestionService,
        ConfigService,
        PersonalizationService,
        SearchAnalyticsService,
        ElasticsearchService,
        Logger,
      ],
    })
      .overrideProvider(ElasticsearchService)
      .useValue(elasticsearchMock)
      .overrideProvider(SearchAnalyticsService)
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

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
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
    analyticsMock.getPopularSearchQueries.mockResolvedValue([
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
    expect(analyticsMock.getPopularSearchQueries).toHaveBeenCalled();
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
              options: [
                {
                  text: 'test electronics suggestion',
                  _source: {
                    query_text_completion: 'test electronics suggestion',
                    query_text: 'test electronics suggestion',
                    category: 'electronics',
                  },
                },
              ],
            },
          ],
        },
      });
    });

    analyticsMock.getPopularSearchQueries.mockResolvedValue([]);

    await searchSuggestionService.getSuggestions({
      query: 'test',
      limit: 5,
      includePopular: false,
      includePersonalized: false,
      includeCategoryContext: true,
      categories: ['electronics'],
    });

    expect(analyticsMock.trackSuggestionImpression).toHaveBeenCalled();
  });
});
