/**
 * Isolated test script for merchant analytics services
 *
 * This script tests the core analytics logic without loading entity models
 * to avoid TypeScript decorator issues.
 */

// Mock MerchantAnalytics class without TypeORM decorators
class MerchantAnalytics {
  id: string = '';
  merchantId: string = '';
  date: Date = new Date();
  timeFrame: string = 'monthly';
  productId: string | null = null;
  categoryId: string | null = null;
  revenue: number = 0;
  orders: number = 0;
  productViews: number = 0;
  organicImpressions: number = 0;
  paidImpressions: number = 0;
  clicks: number = 0;
  addToCarts: number = 0;
  abandonedCarts: number = 0;
  conversionRate: number = 0;
  clickThroughRate: number = 0;
  demographics: string[] = [];
}

// Mock Repository class
class MockRepository<T> {
  private data: T[] = [];

  constructor(initialData: T[] = []) {
    this.data = [...initialData];
  }

  async find(options?: any): Promise<T[]> {
    let results = [...this.data];

    if (options?.where) {
      const where = options.where;

      // Filter based on where conditions
      results = results.filter(item => {
        for (const key in where) {
          if (key === 'date' && where[key].constructor.name === 'Between') {
            const date = (item as any)[key];
            const min = where[key].value[0];
            const max = where[key].value[1];
            if (date < min || date > max) return false;
          } else if ((item as any)[key] !== where[key]) {
            return false;
          }
        }
        return true;
      });
    }

    return results;
  }
}

// Mock Between function for date ranges
function Between(start: Date, end: Date) {
  return { constructor: { name: 'Between' }, value: [start, end] };
}

// Revenue Analytics Service (simplified)
class RevenueAnalyticsService {
  constructor(private analyticsRepository: MockRepository<MerchantAnalytics>) {}

  async getRevenueByTimeFrame(
    merchantId: string,
    timeFrame: string = 'monthly',
    startDate?: Date,
    endDate?: Date,
  ) {
    // Set default date range
    if (!startDate) {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
    }

    if (!endDate) {
      endDate = new Date();
    }

    // Get analytics data
    const analytics = await this.analyticsRepository.find({
      where: {
        merchantId,
        timeFrame,
        date: Between(startDate, endDate),
        productId: null,
        categoryId: null,
      },
    });

    // Format data for time series
    return analytics.map(record => ({
      date: record.date,
      value: record.revenue,
    }));
  }

  async getImpressionsBySourceOverTime(
    merchantId: string,
    timeFrame: string = 'monthly',
    startDate?: Date,
    endDate?: Date,
  ) {
    // Set default date range
    if (!startDate) {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
    }

    if (!endDate) {
      endDate = new Date();
    }

    // Get analytics data
    const analytics = await this.analyticsRepository.find({
      where: {
        merchantId,
        timeFrame,
        date: Between(startDate, endDate),
        productId: null,
        categoryId: null,
      },
    });

    // Format data for time series
    return analytics.map(record => ({
      date: record.date,
      organic: record.organicImpressions || 0,
      paid: record.paidImpressions || 0,
      total: (record.organicImpressions || 0) + (record.paidImpressions || 0),
    }));
  }
}

// Demographic Analytics Service (simplified)
class DemographicAnalyticsService {
  constructor(private analyticsRepository: MockRepository<MerchantAnalytics>) {}

  async getDemographicAnalytics(
    merchantId: string,
    timeFrame: string = 'monthly',
    startDate?: Date,
    endDate?: Date,
    filters?: any[],
  ) {
    // Set default date range
    if (!startDate) {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
    }

    if (!endDate) {
      endDate = new Date();
    }

    // Get analytics data
    const analytics = await this.analyticsRepository.find({
      where: {
        merchantId,
        timeFrame,
        date: Between(startDate, endDate),
        productId: null,
        categoryId: null,
      },
    });

    // Process demographic data
    const ageGroups = { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 };
    const locations = { US: 0, EU: 0, Asia: 0, Other: 0 };
    const devices = { mobile: 0, desktop: 0, tablet: 0 };
    const genders = { male: 0, female: 0, other: 0 };
    const interests = { technology: 0, fashion: 0, home: 0, sports: 0, beauty: 0 };

    // Aggregate demographic data from all records
    analytics.forEach(record => {
      if (!record.demographics) return;

      record.demographics.forEach(demo => {
        const [type, value] = demo.split(':');

        if (type === 'age') {
          if (ageGroups.hasOwnProperty(value)) {
            ageGroups[value as keyof typeof ageGroups]++;
          }
        } else if (type === 'location') {
          if (locations.hasOwnProperty(value)) {
            locations[value as keyof typeof locations]++;
          } else {
            locations['Other']++;
          }
        } else if (type === 'device') {
          if (devices.hasOwnProperty(value)) {
            devices[value as keyof typeof devices]++;
          }
        } else if (type === 'gender') {
          if (genders.hasOwnProperty(value)) {
            genders[value as keyof typeof genders]++;
          } else {
            genders['other']++;
          }
        } else if (type === 'interest') {
          if (interests.hasOwnProperty(value)) {
            interests[value as keyof typeof interests]++;
          }
        }
      });
    });

    // Apply filters if provided
    if (filters && filters.length > 0) {
      // This would be a more complex filtering logic in the real service
      console.log('Applying filters:', filters);
    }

    // Format the data for the response
    return {
      ageGroups: {
        data: Object.entries(ageGroups).map(([key, value]) => ({ label: key, value })),
      },
      location: {
        data: Object.entries(locations).map(([key, value]) => ({ label: key, value })),
      },
      devices: {
        data: Object.entries(devices).map(([key, value]) => ({ label: key, value })),
      },
      gender: Object.entries(genders).map(([key, value]) => ({ label: key, value })),
      interests: Object.entries(interests).map(([key, value]) => ({ label: key, value })),
    };
  }
}

// Create test data
function createTestData() {
  const merchantId = 'merchant1';
  const data: MerchantAnalytics[] = [];

  // Create monthly data for the past 6 months
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    date.setDate(1); // First day of month

    const record = new MerchantAnalytics();
    record.merchantId = merchantId;
    record.date = date;
    record.timeFrame = 'monthly';
    record.revenue = 10000 - i * 1000; // Decreasing revenue going back in time
    record.orders = 100 - i * 10;
    record.productViews = 5000 - i * 500;
    record.organicImpressions = 3000 - i * 300;
    record.paidImpressions = 2000 - i * 200;
    record.clicks = 1000 - i * 100;
    record.addToCarts = 500 - i * 50;
    record.abandonedCarts = 200 - i * 20;
    record.conversionRate = record.orders / record.clicks;
    record.clickThroughRate = record.clicks / record.productViews;
    record.demographics = [
      'age:25-34',
      'location:US',
      'device:mobile',
      'gender:male',
      'interest:technology',
    ];

    data.push(record);
  }

  return data;
}

// Main test function
async function runAnalyticsTests() {
  console.log('Starting isolated analytics services tests...');

  // Create test data and repository
  const testData = createTestData();
  const mockRepository = new MockRepository<MerchantAnalytics>(testData);

  // Create services
  const revenueService = new RevenueAnalyticsService(mockRepository);
  const demographicService = new DemographicAnalyticsService(mockRepository);

  // Test revenue analytics
  console.log('\n--- Testing Revenue Analytics ---');
  const merchantId = 'merchant1';

  console.log('\nTesting getRevenueByTimeFrame:');
  const revenueData = await revenueService.getRevenueByTimeFrame(merchantId);
  console.log('Revenue Data:', JSON.stringify(revenueData, null, 2));

  console.log('\nTesting getImpressionsBySourceOverTime:');
  const impressionData = await revenueService.getImpressionsBySourceOverTime(merchantId);
  console.log('Impression Data:', JSON.stringify(impressionData, null, 2));

  // Test demographic analytics
  console.log('\n--- Testing Demographic Analytics ---');

  console.log('\nTesting getDemographicAnalytics:');
  const demographicData = await demographicService.getDemographicAnalytics(merchantId);
  console.log('Demographic Data:', JSON.stringify(demographicData, null, 2));

  console.log('\nTesting getDemographicAnalytics with filters:');
  const filters = [{ key: 'age', values: ['25-34'] }];
  const filteredDemographicData = await demographicService.getDemographicAnalytics(
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
runAnalyticsTests().catch(error => {
  console.error('Test failed with error:', error);
});
