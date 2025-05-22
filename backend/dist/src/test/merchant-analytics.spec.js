'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const testing_1 = require('@nestjs/testing');
const supertest_1 = __importDefault(require('supertest'));
const app_module_1 = require('../app.module');
const jwt_1 = require('@nestjs/jwt');
const merchant_entity_1 = require('../modules/merchants/entities/merchant.entity');
const typeorm_1 = require('@nestjs/typeorm');
describe('Merchant Analytics (e2e)', () => {
  let app;
  let jwtService;
  let merchantRepository;
  let testMerchant;
  let authToken;
  beforeAll(async () => {
    const moduleFixture = await testing_1.Test.createTestingModule({
      imports: [app_module_1.AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    jwtService = moduleFixture.get(jwt_1.JwtService);
    merchantRepository = moduleFixture.get(
      (0, typeorm_1.getRepositoryToken)(merchant_entity_1.Merchant),
    );
    testMerchant = await merchantRepository.findOne({ where: {} });
    if (!testMerchant) {
      console.log('No test merchant found. Creating one...');
      testMerchant = merchantRepository.create({
        name: 'Test Merchant',
        email: 'test@merchant.com',
        status: 'active',
      });
      await merchantRepository.save(testMerchant);
    }
    authToken = jwtService.sign({
      sub: testMerchant.id,
      email: testMerchant.email,
      isMerchant: true,
    });
  });
  afterAll(async () => {
    await app.close();
  });
  it('should fetch basic merchant dashboard analytics', async () => {
    const response = await (0, supertest_1.default)(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          query {
            merchantDashboardAnalytics {
              summary {
                totalRevenue
                totalOrders
                totalViews
                totalClicks
                averageOrderValue
                overallConversionRate
                overallClickThroughRate
              }
              topProducts {
                productId
                productName
                revenue
                orders
              }
            }
          }
        `,
      });
    console.log('Basic analytics response:', JSON.stringify(response.body, null, 2));
    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.merchantDashboardAnalytics).toBeDefined();
  });
  it('should fetch revenue analytics by time frame', async () => {
    const response = await (0, supertest_1.default)(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          query {
            merchantRevenueAnalytics {
              monthly {
                date
                value
              }
              quarterly {
                date
                value
              }
            }
          }
        `,
      });
    console.log('Revenue analytics response:', JSON.stringify(response.body, null, 2));
    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.merchantRevenueAnalytics).toBeDefined();
  });
  it('should fetch demographic analytics', async () => {
    const response = await (0, supertest_1.default)(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          query {
            merchantDemographicAnalytics {
              ageGroups {
                distribution {
                  key
                  value
                  percentage
                }
                dominantAgeGroup
              }
              location {
                countries {
                  key
                  value
                }
              }
              gender {
                key
                value
              }
            }
          }
        `,
      });
    console.log('Demographic analytics response:', JSON.stringify(response.body, null, 2));
    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.merchantDemographicAnalytics).toBeDefined();
  });
  it('should fetch enhanced dashboard with all analytics', async () => {
    const response = await (0, supertest_1.default)(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          query {
            merchantEnhancedDashboardAnalytics {
              summary {
                totalRevenue
                totalOrders
              }
              revenueAnalytics {
                monthly {
                  date
                  value
                }
              }
              conversionAnalytics {
                conversionRateOverTime {
                  date
                  value
                }
                cartAbandonmentRateOverTime {
                  date
                  value
                }
              }
              impressionAnalytics {
                impressionsOverTime {
                  date
                  organic
                  paid
                  total
                }
              }
              demographicAnalytics {
                ageGroups {
                  distribution {
                    key
                    value
                  }
                }
              }
            }
          }
        `,
      });
    console.log('Enhanced dashboard response:', JSON.stringify(response.body, null, 2));
    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.merchantEnhancedDashboardAnalytics).toBeDefined();
  });
});
//# sourceMappingURL=merchant-analytics.spec.js.map
