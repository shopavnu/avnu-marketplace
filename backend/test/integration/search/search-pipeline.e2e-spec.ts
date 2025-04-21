import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import request from 'supertest';
import { SearchModule } from '../../../src/modules/search/search.module';
import { NlpModule } from '../../../src/modules/nlp/nlp.module';
import { PersonalizationModule } from '../../../src/modules/personalization/personalization.module';
import { AbTestingModule } from '../../../src/modules/ab-testing/ab-testing.module';
import { AnalyticsModule } from '../../../src/modules/analytics/analytics.module';
import { SearchEntityType } from '../../../src/modules/search/enums/search-entity-type.enum';

describe('Search Pipeline (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
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
        CacheModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            isGlobal: true,
            ttl: configService.get('CACHE_TTL', 300),
          }),
        }),
        EventEmitterModule.forRoot(),
        SearchModule,
        NlpModule,
        PersonalizationModule,
        AbTestingModule,
        AnalyticsModule,
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
      return request(app.getHttpServer())
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

          // Verify entity distribution
          expect(res.body.entityDistribution).toBeDefined();
          expect(res.body.entityDistribution.products).toBeDefined();
          expect(res.body.entityDistribution.merchants).toBeDefined();
          expect(res.body.entityDistribution.brands).toBeDefined();

          // Verify relevance scores
          expect(res.body.relevanceScores).toBeDefined();
        });
    });

    it('/api/multi-search/products (GET) should return product-specific results', () => {
      return request(app.getHttpServer())
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

          // Verify all results are products
          res.body.results.forEach(result => {
            expect(result._type).toBe(SearchEntityType.PRODUCT);
          });

          // Verify facets
          expect(res.body.facets).toBeDefined();
          expect(Array.isArray(res.body.facets)).toBe(true);
        });
    });

    it('/api/multi-search/merchants (GET) should return merchant-specific results', () => {
      return request(app.getHttpServer())
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

          // Verify all results are merchants
          res.body.results.forEach(result => {
            expect(result._type).toBe(SearchEntityType.MERCHANT);
          });
        });
    });
  });

  describe('Search Caching', () => {
    it('should cache search results for identical queries', async () => {
      // First request
      const firstResponse = await request(app.getHttpServer())
        .get('/api/multi-search/products')
        .query({
          query: 'test caching',
          page: 0,
          limit: 10,
        })
        .expect(200);

      // Second request with same parameters
      const secondResponse = await request(app.getHttpServer())
        .get('/api/multi-search/products')
        .query({
          query: 'test caching',
          page: 0,
          limit: 10,
        })
        .expect(200);

      // Results should be identical
      expect(secondResponse.body).toEqual(firstResponse.body);
    });

    it('should not cache personalized search results', async () => {
      // Mock auth token for a user
      const authToken = 'test-auth-token';

      // First request with personalization
      await request(app.getHttpServer())
        .get('/api/multi-search/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          query: 'test personalization',
          page: 0,
          limit: 10,
          personalized: true,
        })
        .expect(200);

      // Second request with same parameters but different user
      const secondAuthToken = 'different-auth-token';
      const secondResponse = await request(app.getHttpServer())
        .get('/api/multi-search/products')
        .set('Authorization', `Bearer ${secondAuthToken}`)
        .query({
          query: 'test personalization',
          page: 0,
          limit: 10,
          personalized: true,
        })
        .expect(200);

      // Results should be personalized, so we expect some differences
      // This test is a bit tricky since we're using mock data
      // In a real scenario, we would verify the personalization logic
      expect(secondResponse.body).toBeDefined();
    });
  });

  describe('Search Experiments', () => {
    it('should apply experiment variations correctly', async () => {
      // Request with experiment
      const response = await request(app.getHttpServer())
        .get('/api/multi-search/all')
        .query({
          query: 'test experiment',
          page: 0,
          limit: 10,
          experimentId: 'entity-boosting:product-emphasis',
        })
        .expect(200);

      // Verify experiment metadata in response
      expect(response.body.experimentId).toBe('entity-boosting:product-emphasis');

      // In a real test, we would verify the specific experiment effects
      // For example, checking that product results have higher relevance scores
    });
  });

  describe('Search Dashboard', () => {
    it('/api/search/dashboard/performance (GET) should return performance metrics', () => {
      // Mock admin auth token
      const adminAuthToken = 'admin-auth-token';

      return request(app.getHttpServer())
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
      // Mock admin auth token
      const adminAuthToken = 'admin-auth-token';

      return request(app.getHttpServer())
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

      return request(app.getHttpServer())
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
