import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchSuggestionService } from '../src/modules/search/services/search-suggestion.service';
import {} from /* SearchSuggestionsResponseType */ '../src/modules/search/graphql/search-suggestion.type';

describe('SearchSuggestions (e2e)', () => {
  let app: INestApplication;
  let elasticsearchServiceMock: {
    search: jest.Mock;
  };
  let _searchSuggestionService: SearchSuggestionService;

  beforeAll(async () => {
    elasticsearchServiceMock = {
      search: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ElasticsearchService)
      .useValue(elasticsearchServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    _searchSuggestionService = moduleFixture.get<SearchSuggestionService>(SearchSuggestionService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return search suggestions via GraphQL', async () => {
    // Mock Elasticsearch response for prefix suggestions
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

    // Mock Elasticsearch response for fallback suggestions (empty)
    elasticsearchServiceMock.search.mockResolvedValueOnce({
      suggest: {
        completion: [
          {
            options: [],
          },
        ],
      },
    });

    const query = `
      query {
        getSuggestions(input: { query: "test", limit: 5 }) {
          query
          suggestions {
            text
            source
            relevance
            category
            type
            isPersonalized
            isPopular
          }
          count
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query,
      })
      .expect(200);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.getSuggestions).toBeDefined();
    expect(response.body.data.getSuggestions.query).toEqual('test');
    expect(response.body.data.getSuggestions.suggestions).toBeInstanceOf(Array);
    expect(response.body.data.getSuggestions.count).toBeGreaterThanOrEqual(0);
  });

  it('should handle empty query gracefully', async () => {
    const query = `
      query {
        getSuggestions(input: { query: "", limit: 5 }) {
          query
          suggestions {
            text
          }
          count
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query,
      })
      .expect(200);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.getSuggestions).toBeDefined();
    expect(response.body.data.getSuggestions.query).toEqual('');
    expect(response.body.data.getSuggestions.suggestions).toEqual([]);
    expect(response.body.data.getSuggestions.count).toEqual(0);
  });

  it('should apply category filters correctly', async () => {
    // Mock Elasticsearch response for prefix suggestions with category filter
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

    // Mock Elasticsearch response for fallback suggestions (empty)
    elasticsearchServiceMock.search.mockResolvedValueOnce({
      suggest: {
        completion: [
          {
            options: [],
          },
        ],
      },
    });

    const query = `
      query {
        getSuggestions(input: { query: "test", limit: 5, categories: ["clothing"] }) {
          query
          suggestions {
            text
            category
          }
          count
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query,
      })
      .expect(200);

    expect(response.body.data.getSuggestions.suggestions).toBeInstanceOf(Array);
    if (response.body.data.getSuggestions.suggestions.length > 0) {
      expect(response.body.data.getSuggestions.suggestions[0].category).toEqual('clothing');
    }

    // Verify the Elasticsearch search was called with the right parameters
    expect(elasticsearchServiceMock.search).toHaveBeenCalledWith(
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
  });

  it('should respect the limit parameter', async () => {
    // Mock Elasticsearch response with multiple suggestions
    elasticsearchServiceMock.search.mockResolvedValueOnce({
      suggest: {
        completion: [
          {
            options: [
              {
                _source: {
                  text: 'test product 1',
                  type: 'product',
                  score: 5.0,
                },
                _index: 'search_suggestions',
              },
              {
                _source: {
                  text: 'test product 2',
                  type: 'product',
                  score: 4.0,
                },
                _index: 'search_suggestions',
              },
              {
                _source: {
                  text: 'test product 3',
                  type: 'product',
                  score: 3.0,
                },
                _index: 'search_suggestions',
              },
            ],
          },
        ],
      },
    });

    // Mock Elasticsearch response for fallback suggestions (empty)
    elasticsearchServiceMock.search.mockResolvedValueOnce({
      suggest: {
        completion: [
          {
            options: [],
          },
        ],
      },
    });

    const query = `
      query {
        getSuggestions(input: { query: "test", limit: 2 }) {
          query
          suggestions {
            text
          }
          count
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query,
      })
      .expect(200);

    expect(response.body.data.getSuggestions.suggestions).toHaveLength(2);
  });
});
