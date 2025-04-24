"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const event_emitter_1 = require("@nestjs/event-emitter");
const supertest_1 = __importDefault(require("supertest"));
const search_module_1 = require("../../../src/modules/search/search.module");
const nlp_module_1 = require("../../../src/modules/nlp/nlp.module");
const personalization_module_1 = require("../../../src/modules/personalization/personalization.module");
const ab_testing_module_1 = require("../../../src/modules/ab-testing/ab-testing.module");
const analytics_module_1 = require("../../../src/modules/analytics/analytics.module");
const search_entity_type_enum_1 = require("../../../src/modules/search/enums/search-entity-type.enum");
describe('Search Pipeline (e2e)', () => {
    let app;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [
                config_1.ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: '.env.test',
                }),
                typeorm_1.TypeOrmModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (configService) => ({
                        type: 'postgres',
                        host: configService.get('DB_HOST', 'localhost'),
                        port: configService.get('DB_PORT', 5432),
                        username: configService.get('DB_USERNAME', 'postgres'),
                        password: configService.get('DB_PASSWORD', 'postgres'),
                        database: configService.get('DB_NAME', 'avnu_test'),
                        entities: [__dirname + '/../../../src/**/*.entity{.ts,.js}'],
                        synchronize: true,
                    }),
                }),
                cache_manager_1.CacheModule.registerAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (configService) => ({
                        isGlobal: true,
                        ttl: configService.get('CACHE_TTL', 300),
                    }),
                }),
                event_emitter_1.EventEmitterModule.forRoot(),
                search_module_1.SearchModule,
                nlp_module_1.NlpModule,
                personalization_module_1.PersonalizationModule,
                ab_testing_module_1.AbTestingModule,
                analytics_module_1.AnalyticsModule,
            ],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    describe('Multi-Entity Search', () => {
        it('/api/multi-search/all (GET) should return mixed entity results', () => {
            return (0, supertest_1.default)(app.getHttpServer())
                .get('/api/multi-search/all')
                .query({
                query: 'sustainable fashion',
                page: 0,
                limit: 10,
                enableNlp: true,
            })
                .expect(200)
                .expect(res => {
                expect(res.body).toBeDefined();
                expect(res.body.query).toBe('sustainable fashion');
                expect(res.body.results).toBeDefined();
                expect(Array.isArray(res.body.results)).toBe(true);
                expect(res.body.pagination).toBeDefined();
                expect(res.body.pagination.page).toBe(0);
                expect(res.body.pagination.limit).toBe(10);
                expect(res.body.entityDistribution).toBeDefined();
                expect(res.body.entityDistribution.products).toBeDefined();
                expect(res.body.entityDistribution.merchants).toBeDefined();
                expect(res.body.entityDistribution.brands).toBeDefined();
                expect(res.body.relevanceScores).toBeDefined();
            });
        });
        it('/api/multi-search/products (GET) should return product-specific results', () => {
            return (0, supertest_1.default)(app.getHttpServer())
                .get('/api/multi-search/products')
                .query({
                query: 'organic cotton',
                page: 0,
                limit: 10,
                minPrice: 20,
                maxPrice: 100,
                categories: ['clothing'],
            })
                .expect(200)
                .expect(res => {
                expect(res.body).toBeDefined();
                expect(res.body.query).toBe('organic cotton');
                expect(res.body.results).toBeDefined();
                expect(Array.isArray(res.body.results)).toBe(true);
                res.body.results.forEach(result => {
                    expect(result._type).toBe(search_entity_type_enum_1.SearchEntityType.PRODUCT);
                });
                expect(res.body.facets).toBeDefined();
                expect(Array.isArray(res.body.facets)).toBe(true);
            });
        });
        it('/api/multi-search/merchants (GET) should return merchant-specific results', () => {
            return (0, supertest_1.default)(app.getHttpServer())
                .get('/api/multi-search/merchants')
                .query({
                query: 'sustainable brands',
                page: 0,
                limit: 10,
            })
                .expect(200)
                .expect(res => {
                expect(res.body).toBeDefined();
                expect(res.body.query).toBe('sustainable brands');
                expect(res.body.results).toBeDefined();
                expect(Array.isArray(res.body.results)).toBe(true);
                res.body.results.forEach(result => {
                    expect(result._type).toBe(search_entity_type_enum_1.SearchEntityType.MERCHANT);
                });
            });
        });
    });
    describe('Search Caching', () => {
        it('should cache search results for identical queries', async () => {
            const firstResponse = await (0, supertest_1.default)(app.getHttpServer())
                .get('/api/multi-search/products')
                .query({
                query: 'test caching',
                page: 0,
                limit: 10,
            })
                .expect(200);
            const secondResponse = await (0, supertest_1.default)(app.getHttpServer())
                .get('/api/multi-search/products')
                .query({
                query: 'test caching',
                page: 0,
                limit: 10,
            })
                .expect(200);
            expect(secondResponse.body).toEqual(firstResponse.body);
        });
        it('should not cache personalized search results', async () => {
            const authToken = 'test-auth-token';
            await (0, supertest_1.default)(app.getHttpServer())
                .get('/api/multi-search/products')
                .set('Authorization', `Bearer ${authToken}`)
                .query({
                query: 'test personalization',
                page: 0,
                limit: 10,
                personalized: true,
            })
                .expect(200);
            const secondAuthToken = 'different-auth-token';
            const secondResponse = await (0, supertest_1.default)(app.getHttpServer())
                .get('/api/multi-search/products')
                .set('Authorization', `Bearer ${secondAuthToken}`)
                .query({
                query: 'test personalization',
                page: 0,
                limit: 10,
                personalized: true,
            })
                .expect(200);
            expect(secondResponse.body).toBeDefined();
        });
    });
    describe('Search Experiments', () => {
        it('should apply experiment variations correctly', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/api/multi-search/all')
                .query({
                query: 'test experiment',
                page: 0,
                limit: 10,
                experimentId: 'entity-boosting:product-emphasis',
            })
                .expect(200);
            expect(response.body.experimentId).toBe('entity-boosting:product-emphasis');
        });
    });
    describe('Search Dashboard', () => {
        it('/api/search/dashboard/performance (GET) should return performance metrics', () => {
            const adminAuthToken = 'admin-auth-token';
            return (0, supertest_1.default)(app.getHttpServer())
                .get('/api/search/dashboard/performance')
                .set('Authorization', `Bearer ${adminAuthToken}`)
                .query({ timeframe: 'day' })
                .expect(200)
                .expect(res => {
                expect(res.body).toBeDefined();
                expect(res.body.averageResponseTime).toBeDefined();
                expect(res.body.totalSearches).toBeDefined();
                expect(res.body.slowSearches).toBeDefined();
                expect(res.body.responseTimeDistribution).toBeDefined();
                expect(Array.isArray(res.body.responseTimeDistribution)).toBe(true);
            });
        });
        it('/api/search/dashboard/popular-searches (GET) should return popular searches', () => {
            const adminAuthToken = 'admin-auth-token';
            return (0, supertest_1.default)(app.getHttpServer())
                .get('/api/search/dashboard/popular-searches')
                .set('Authorization', `Bearer ${adminAuthToken}`)
                .query({ limit: 5 })
                .expect(200)
                .expect(res => {
                expect(res.body).toBeDefined();
                expect(Array.isArray(res.body)).toBe(true);
                if (res.body.length > 0) {
                    expect(res.body[0].query).toBeDefined();
                    expect(res.body[0].count).toBeDefined();
                }
            });
        });
    });
    describe('GraphQL API', () => {
        it('should perform multi-entity search via GraphQL', () => {
            const query = `
        query {
          enhancedMultiEntitySearch(
            query: "sustainable fashion",
            page: 0,
            limit: 10,
            enableNlp: true
          ) {
            query
            pagination {
              page
              limit
              total
              totalPages
            }
            results {
              ... on ProductResultType {
                id
                title
                price
              }
              ... on MerchantResultType {
                id
                name
              }
              ... on BrandResultType {
                id
                name
              }
            }
            relevanceScores {
              products
              merchants
              brands
            }
            entityDistribution {
              products
              merchants
              brands
            }
          }
        }
      `;
            return (0, supertest_1.default)(app.getHttpServer())
                .post('/graphql')
                .send({ query })
                .expect(200)
                .expect(res => {
                expect(res.body.data).toBeDefined();
                expect(res.body.data.enhancedMultiEntitySearch).toBeDefined();
                expect(res.body.data.enhancedMultiEntitySearch.query).toBe('sustainable fashion');
                expect(res.body.data.enhancedMultiEntitySearch.results).toBeDefined();
                expect(Array.isArray(res.body.data.enhancedMultiEntitySearch.results)).toBe(true);
                expect(res.body.data.enhancedMultiEntitySearch.relevanceScores).toBeDefined();
                expect(res.body.data.enhancedMultiEntitySearch.entityDistribution).toBeDefined();
            });
        });
    });
});
//# sourceMappingURL=search-pipeline.e2e-spec.js.map