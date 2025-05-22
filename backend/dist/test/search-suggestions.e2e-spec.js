'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const testing_1 = require('@nestjs/testing');
const supertest_1 = __importDefault(require('supertest'));
const app_module_1 = require('../src/app.module');
const elasticsearch_1 = require('@nestjs/elasticsearch');
const search_suggestion_service_1 = require('../src/modules/search/services/search-suggestion.service');
describe('SearchSuggestions (e2e)', () => {
  let app;
  let elasticsearchServiceMock;
  let _searchSuggestionService;
  beforeAll(async () => {
    elasticsearchServiceMock = {
      search: jest.fn(),
    };
    const moduleFixture = await testing_1.Test.createTestingModule({
      imports: [app_module_1.AppModule],
    })
      .overrideProvider(elasticsearch_1.ElasticsearchService)
      .useValue(elasticsearchServiceMock)
      .compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    _searchSuggestionService = moduleFixture.get(
      search_suggestion_service_1.SearchSuggestionService,
    );
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should return search suggestions via GraphQL', async () => {
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
    const response = await (0, supertest_1.default)(app.getHttpServer())
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
    const response = await (0, supertest_1.default)(app.getHttpServer())
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
    const response = await (0, supertest_1.default)(app.getHttpServer())
      .post('/graphql')
      .send({
        query,
      })
      .expect(200);
    expect(response.body.data.getSuggestions.suggestions).toBeInstanceOf(Array);
    if (response.body.data.getSuggestions.suggestions.length > 0) {
      expect(response.body.data.getSuggestions.suggestions[0].category).toEqual('clothing');
    }
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
    const response = await (0, supertest_1.default)(app.getHttpServer())
      .post('/graphql')
      .send({
        query,
      })
      .expect(200);
    expect(response.body.data.getSuggestions.suggestions).toHaveLength(2);
  });
});
//# sourceMappingURL=search-suggestions.e2e-spec.js.map
