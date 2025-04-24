import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { JwtService } from '@nestjs/jwt';
import { Merchant } from '../modules/merchants/entities/merchant.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('Merchant Analytics (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let merchantRepository: Repository<Merchant>;
  let testMerchant: Merchant;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get services
    jwtService = moduleFixture.get<JwtService>(JwtService);
    merchantRepository = moduleFixture.get<Repository<Merchant>>(getRepositoryToken(Merchant));

    // Create test merchant or use existing one
    testMerchant = await merchantRepository.findOne({ where: {} });
    if (!testMerchant) {
      console.log('No test merchant found. Creating one...');
      testMerchant = merchantRepository.create({
        // @ts-ignore - We're creating a test merchant with required fields
        name: 'Test Merchant',
        email: 'test@merchant.com',
        status: 'active',
      });
      await merchantRepository.save(testMerchant);
    }

    // Generate JWT token for the merchant
    authToken = jwtService.sign({ 
      sub: testMerchant.id, 
      // @ts-ignore - Using email property for testing
      email: testMerchant.email,
      isMerchant: true 
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should fetch basic merchant dashboard analytics', async () => {
    const response = await request(app.getHttpServer())
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
    const response = await request(app.getHttpServer())
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
    const response = await request(app.getHttpServer())
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
    const response = await request(app.getHttpServer())
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
