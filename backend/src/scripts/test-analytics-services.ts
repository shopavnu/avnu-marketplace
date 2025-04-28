/**
 * Manual test script for merchant analytics services
 *
 * This script directly tests the analytics services without relying on NestJS decorators
 * to avoid TypeScript compatibility issues.
 */

import { MerchantRevenueAnalyticsService } from '../modules/merchants/services/merchant-revenue-analytics.service';
import { MerchantDemographicAnalyticsService } from '../modules/merchants/services/merchant-demographic-analytics.service';
import { Repository, DeepPartial, SaveOptions } from 'typeorm';
import { MerchantAnalytics } from '../modules/merchants/entities/merchant-analytics.entity';

// Mock repository for testing
class MockMerchantAnalyticsRepository implements Partial<Repository<MerchantAnalytics>> {
  private mockData: MerchantAnalytics[] = [];

  constructor() {
    // Initialize with some test data
    this.seedTestData();
  }

  private seedTestData() {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Create some sample analytics data
    this.mockData = [
      this.createAnalyticsRecord('merchant1', today, 'daily', 1000, 10, 500, 300, 200),
      this.createAnalyticsRecord('merchant1', lastMonth, 'monthly', 5000, 50, 2500, 1500, 1000),
      this.createAnalyticsRecord('merchant1', today, 'daily', 800, 8, 400, 250, 150, 'product1'),
      this.createAnalyticsRecord(
        'merchant1',
        lastMonth,
        'monthly',
        4000,
        40,
        2000,
        1200,
        800,
        'product1',
      ),
    ];
  }

  private createAnalyticsRecord(
    merchantId: string,
    date: Date,
    timeFrame: string,
    revenue: number,
    orders: number,
    productViews: number,
    organicImpressions: number,
    paidImpressions: number,
    productId?: string,
    categoryId?: string,
  ): MerchantAnalytics {
    const record = new MerchantAnalytics();
    record.merchantId = merchantId;
    record.date = date;
    record.timeFrame = timeFrame as any;
    record.revenue = revenue;
    record.orders = orders;
    record.productViews = productViews;
    record.organicImpressions = organicImpressions;
    record.paidImpressions = paidImpressions;
    record.clicks = Math.floor(productViews * 0.2);
    record.addToCarts = Math.floor(record.clicks * 0.5);
    record.abandonedCarts = Math.floor(record.addToCarts * 0.3);
    record.conversionRate = orders / record.clicks;
    record.clickThroughRate = record.clicks / productViews;
    record.productId = productId || null;
    record.categoryId = categoryId || null;
    record.demographics = [
      'age:25-34',
      'gender:male',
      'location:US',
      'device:mobile',
      'interest:technology',
    ];

    return record;
  }

  async find(_options?: any): Promise<MerchantAnalytics[]> {
    // Filter data based on options
    let results = [...this.mockData];

    if (_options?.where) {
      const where = _options.where;

      // Filter by merchantId
      if (where.merchantId) {
        results = results.filter(r => r.merchantId === where.merchantId);
      }

      // Filter by timeFrame
      if (where.timeFrame) {
        results = results.filter(r => r.timeFrame === where.timeFrame);
      }

      // Filter by productId
      if (where.productId) {
        results = results.filter(r => r.productId === where.productId);
      } else if (where.productId === null) {
        results = results.filter(r => r.productId === null);
      }

      // Filter by categoryId
      if (where.categoryId) {
        results = results.filter(r => r.categoryId === where.categoryId);
      } else if (where.categoryId === null) {
        results = results.filter(r => r.categoryId === null);
      }
    }

    return results;
  }

  async findOne(_options?: any): Promise<MerchantAnalytics | null> {
    const results = await this.find(_options);
    return results.length > 0 ? results[0] : null;
  }

  create(): MerchantAnalytics;
  create(entityLikeArray: DeepPartial<MerchantAnalytics>[]): MerchantAnalytics[];
  create(entityLike: DeepPartial<MerchantAnalytics>): MerchantAnalytics;
  create(
    entityLike?: DeepPartial<MerchantAnalytics> | DeepPartial<MerchantAnalytics>[],
  ): MerchantAnalytics | MerchantAnalytics[] {
    const entity = new MerchantAnalytics();
    Object.assign(entity, entityLike);
    return entity;
  }

  async save<T extends DeepPartial<MerchantAnalytics>>(
    entities: T[],
    _options?: SaveOptions,
  ): Promise<T[]>;
  async save<T extends DeepPartial<MerchantAnalytics>>(
    entity: T,
    _options?: SaveOptions,
  ): Promise<T>;
  async save(
    entityOrEntities: MerchantAnalytics | MerchantAnalytics[],
    _options?: SaveOptions,
  ): Promise<MerchantAnalytics | MerchantAnalytics[]> {
    if (Array.isArray(entityOrEntities)) {
      return Promise.all(entityOrEntities.map(entity => this.saveEntity(entity)));
    }
    return this.saveEntity(entityOrEntities);
  }

  private async saveEntity(entity: MerchantAnalytics): Promise<MerchantAnalytics> {
    // Find and update existing record or add new one
    const existingIndex = this.mockData.findIndex(
      r =>
        r.merchantId === entity.merchantId &&
        r.date.getTime() === entity.date.getTime() &&
        r.timeFrame === entity.timeFrame &&
        r.productId === entity.productId &&
        r.categoryId === entity.categoryId,
    );

    if (existingIndex >= 0) {
      this.mockData[existingIndex] = entity;
    } else {
      this.mockData.push(entity);
    }

    return entity;
  }
}

// Main test function
async function runTests() {
  console.log('Starting merchant analytics services tests...');

  // Create mock repository
  const mockRepository = new MockMerchantAnalyticsRepository();

  // Create services with mock repository
  const revenueAnalyticsService = new MerchantRevenueAnalyticsService(mockRepository as any);
  const demographicAnalyticsService = new MerchantDemographicAnalyticsService(
    mockRepository as any,
  );

  // Test revenue analytics
  console.log('\n--- Testing Revenue Analytics ---');
  const merchantId = 'merchant1';

  console.log('\nTesting getRevenueByTimeFrame:');
  const revenueData = await revenueAnalyticsService.getRevenueByTimeFrame(merchantId, 'monthly');
  console.log('Revenue Data:', JSON.stringify(revenueData, null, 2));

  console.log('\nTesting getImpressionsBySourceOverTime:');
  const impressionData = await revenueAnalyticsService.getImpressionsBySourceOverTime(
    merchantId,
    'monthly',
  );
  console.log('Impression Data:', JSON.stringify(impressionData, null, 2));

  // Test demographic analytics
  console.log('\n--- Testing Demographic Analytics ---');

  console.log('\nTesting getDemographicAnalytics:');
  const demographicData = await demographicAnalyticsService.getDemographicAnalytics(
    merchantId,
    'monthly',
  );
  console.log('Demographic Data:', JSON.stringify(demographicData, null, 2));

  console.log('\nTesting getDemographicAnalytics with filters:');
  const filters = [{ key: 'age', values: ['25-34'] }];
  const filteredDemographicData = await demographicAnalyticsService.getDemographicAnalytics(
    merchantId,
    'monthly',
    undefined,
    undefined,
    filters,
  );
  console.log('Filtered Demographic Data:', JSON.stringify(filteredDemographicData, null, 2));

  console.log('\nAll tests completed successfully!');
}

// Run the tests
runTests().catch(error => {
  console.error('Test failed with error:', error);
});
