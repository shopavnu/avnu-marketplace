"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const event_emitter_1 = require("@nestjs/event-emitter");
const perf_hooks_1 = require("perf_hooks");
const auth_module_1 = require("../../../src/modules/auth/auth.module");
const search_module_1 = require("../../../src/modules/search/search.module");
const ab_testing_module_1 = require("../../../src/modules/ab-testing/ab-testing.module");
const search_entity_type_enum_1 = require("../../../src/modules/search/enums/search-entity-type.enum");
const experiment_entity_1 = require("../../../src/modules/ab-testing/entities/experiment.entity");
const graphql_2 = require("@nestjs/graphql");
const auth_service_1 = require("../../../src/modules/auth/auth.service");
const users_1 = require("../../../src/modules/users");
(0, graphql_2.registerEnumType)(experiment_entity_1.ExperimentStatus, {
    name: 'ExperimentStatus',
});
describe('Search Performance Tests', () => {
    let app;
    let adminAuthToken;
    let authService;
    let usersService;
    const SIMPLE_SEARCH_THRESHOLD = 200;
    const COMPLEX_SEARCH_THRESHOLD = 500;
    const NLP_SEARCH_THRESHOLD = 800;
    const MULTI_ENTITY_SEARCH_THRESHOLD = 600;
    const CACHED_SEARCH_THRESHOLD = 50;
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
                        autoLoadEntities: true,
                        synchronize: true,
                    }),
                }),
                cache_manager_1.CacheModule.registerAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (configService) => {
                        const ttlValue = configService.get('CACHE_TTL');
                        const ttl = parseInt(ttlValue || '300', 10);
                        return {
                            ttl: !isNaN(ttl) && ttl > 0 ? ttl : 300,
                        };
                    },
                }),
                event_emitter_1.EventEmitterModule.forRoot(),
                graphql_1.GraphQLModule.forRoot({
                    driver: apollo_1.ApolloDriver,
                    autoSchemaFile: true,
                    sortSchema: true,
                    playground: false,
                    buildSchemaOptions: {
                        orphanedTypes: [search_entity_type_enum_1.SearchEntityType],
                    },
                }),
                search_module_1.SearchModule,
                auth_module_1.AuthModule,
                ab_testing_module_1.AbTestingModule,
            ],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        authService = moduleFixture.get(auth_service_1.AuthService);
        usersService = moduleFixture.get(users_1.UsersService);
        const testAdminEmail = 'admin-perf-test@example.com';
        const testAdminPassword = 'password123';
        let testAdminUser;
        try {
            testAdminUser = await usersService.findByEmail(testAdminEmail);
            if (!testAdminUser) {
                console.log(`Creating test admin user: ${testAdminEmail}`);
                testAdminUser = await usersService.create({
                    email: testAdminEmail,
                    password: testAdminPassword,
                    firstName: 'AdminPerf',
                    lastName: 'Tester',
                });
            }
            const loginResult = await authService.login({
                email: testAdminEmail,
                password: testAdminPassword,
            });
            if (!loginResult || !loginResult.accessToken) {
                throw new Error('Failed to log in test admin user.');
            }
            adminAuthToken = loginResult.accessToken;
            console.log('Successfully obtained JWT for performance tests.');
        }
        catch (error) {
            console.error('Error setting up test admin user for performance tests:', error);
            throw new Error(`Could not set up authentication for performance tests: ${error.message}`);
        }
    });
    afterAll(async () => {
        await app.close();
    });
    describe('Basic Search Performance', () => {
        it('should perform simple product search within performance threshold', async () => {
            const startTime = perf_hooks_1.performance.now();
            await (0, supertest_1.default)(app.getHttpServer())
                .get('/search/products')
                .query({
                query: 'shirt',
                page: 1,
                limit: 10,
            })
                .expect(200);
            const executionTime = perf_hooks_1.performance.now() - startTime;
            expect(executionTime).toBeUnderPerformanceThreshold(SIMPLE_SEARCH_THRESHOLD);
        });
        it('should perform complex filtered search within performance threshold', async () => {
            const startTime = perf_hooks_1.performance.now();
            await (0, supertest_1.default)(app.getHttpServer())
                .get('/search/products')
                .query({
                query: 'organic cotton shirt',
                page: 1,
                limit: 20,
                minPrice: 20,
                maxPrice: 100,
                categories: ['clothing', 'shirts'],
                sortField: 'price',
                sortOrder: 'asc',
            })
                .expect(200);
            const executionTime = perf_hooks_1.performance.now() - startTime;
            expect(executionTime).toBeUnderPerformanceThreshold(COMPLEX_SEARCH_THRESHOLD);
        });
    });
    describe('NLP Search Performance', () => {
        it('should perform NLP-enhanced search within performance threshold', async () => {
            const startTime = perf_hooks_1.performance.now();
            await (0, supertest_1.default)(app.getHttpServer())
                .get('/search/products')
                .query({
                query: 'eco friendly sustainable clothing that is affordable',
                page: 1,
                limit: 10,
            })
                .expect(200);
            const executionTime = perf_hooks_1.performance.now() - startTime;
            expect(executionTime).toBeUnderPerformanceThreshold(NLP_SEARCH_THRESHOLD);
        });
    });
    describe('Multi-Entity Search Performance', () => {
        it('should perform multi-entity search within performance threshold', async () => {
            const startTime = perf_hooks_1.performance.now();
            await (0, supertest_1.default)(app.getHttpServer())
                .get('/api/multi-search/all')
                .query({
                query: 'sustainable fashion',
                page: 0,
                limit: 20,
                enableNlp: true,
                entityBoosting: {
                    productBoost: 1.2,
                    merchantBoost: 0.8,
                    brandBoost: 1.0,
                },
            })
                .expect(200);
            const executionTime = perf_hooks_1.performance.now() - startTime;
            expect(executionTime).toBeUnderPerformanceThreshold(MULTI_ENTITY_SEARCH_THRESHOLD);
        });
    });
    describe('Cache Performance', () => {
        it('should return cached results much faster than initial search', async () => {
            const uniqueQuery = `performance-test-${Date.now()}`;
            const startTimeUncached = perf_hooks_1.performance.now();
            await (0, supertest_1.default)(app.getHttpServer())
                .get('/search/products')
                .query({
                query: uniqueQuery,
                page: 1,
                limit: 10,
            })
                .expect(200);
            const _executionTimeUncached = perf_hooks_1.performance.now() - startTimeUncached;
            const startTimeCached = perf_hooks_1.performance.now();
            await (0, supertest_1.default)(app.getHttpServer())
                .get('/search/products')
                .query({
                query: uniqueQuery,
                page: 1,
                limit: 10,
            })
                .expect(200);
            const executionTimeCached = perf_hooks_1.performance.now() - startTimeCached;
            expect(executionTimeCached).toBeUnderPerformanceThreshold(CACHED_SEARCH_THRESHOLD);
        });
    });
    describe('Search Scalability', () => {
        it('should handle concurrent search requests efficiently', async () => {
            const concurrentRequests = 5;
            const requests = Array(concurrentRequests)
                .fill(0)
                .map((_, index) => {
                return (0, supertest_1.default)(app.getHttpServer())
                    .get('/search/products')
                    .query({
                    query: `concurrent test ${index}`,
                    page: 1,
                    limit: 10,
                });
            });
            const startTime = perf_hooks_1.performance.now();
            await Promise.all(requests);
            const totalExecutionTime = perf_hooks_1.performance.now() - startTime;
            const avgTimePerRequest = totalExecutionTime / concurrentRequests;
            expect(avgTimePerRequest).toBeUnderPerformanceThreshold(COMPLEX_SEARCH_THRESHOLD);
        });
    });
    describe('GraphQL Performance', () => {
        it('should perform GraphQL search within performance threshold', async () => {
            const query = `
        query DiscoverySearch($query: String) {
          discoverySearch(query: $query) {
            query
            pagination {
              page
              limit
              total
              totalPages
            }
            results {
              __typename # Request only __typename
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
          }
        }
      `;
            const startTime = perf_hooks_1.performance.now();
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/graphql')
                .send({
                query,
                variables: {
                    query: 'test product',
                },
            })
                .expect(200);
            const executionTime = perf_hooks_1.performance.now() - startTime;
            expect(executionTime).toBeUnderPerformanceThreshold(MULTI_ENTITY_SEARCH_THRESHOLD);
        });
    });
    describe('Search Dashboard Performance', () => {
        it('should return dashboard metrics within performance threshold', async () => {
            const startTime = perf_hooks_1.performance.now();
            await (0, supertest_1.default)(app.getHttpServer())
                .get('/api/search/dashboard/performance')
                .set('Authorization', `Bearer ${adminAuthToken}`)
                .query({ timeframe: 'day' })
                .expect(200);
            const executionTime = perf_hooks_1.performance.now() - startTime;
            const DASHBOARD_THRESHOLD = 1000;
            expect(executionTime).toBeUnderPerformanceThreshold(DASHBOARD_THRESHOLD);
        });
    });
});
//# sourceMappingURL=search-performance.perf-spec.js.map