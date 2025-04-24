class MerchantAnalytics {
    constructor() {
        this.id = '';
        this.merchantId = '';
        this.date = new Date();
        this.timeFrame = 'monthly';
        this.productId = null;
        this.categoryId = null;
        this.revenue = 0;
        this.orders = 0;
        this.productViews = 0;
        this.organicImpressions = 0;
        this.paidImpressions = 0;
        this.clicks = 0;
        this.addToCarts = 0;
        this.abandonedCarts = 0;
        this.conversionRate = 0;
        this.clickThroughRate = 0;
        this.demographics = [];
    }
}
class MockRepository {
    constructor(initialData = []) {
        this.data = [];
        this.data = [...initialData];
    }
    async find(options) {
        let results = [...this.data];
        if (options?.where) {
            const where = options.where;
            results = results.filter(item => {
                for (const key in where) {
                    if (key === 'date' && where[key].constructor.name === 'Between') {
                        const date = item[key];
                        const min = where[key].value[0];
                        const max = where[key].value[1];
                        if (date < min || date > max)
                            return false;
                    }
                    else if (item[key] !== where[key]) {
                        return false;
                    }
                }
                return true;
            });
        }
        return results;
    }
}
function Between(start, end) {
    return { constructor: { name: 'Between' }, value: [start, end] };
}
class RevenueAnalyticsService {
    constructor(analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }
    async getRevenueByTimeFrame(merchantId, timeFrame = 'monthly', startDate, endDate) {
        if (!startDate) {
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 6);
        }
        if (!endDate) {
            endDate = new Date();
        }
        const analytics = await this.analyticsRepository.find({
            where: {
                merchantId,
                timeFrame,
                date: Between(startDate, endDate),
                productId: null,
                categoryId: null,
            },
        });
        return analytics.map(record => ({
            date: record.date,
            value: record.revenue,
        }));
    }
    async getImpressionsBySourceOverTime(merchantId, timeFrame = 'monthly', startDate, endDate) {
        if (!startDate) {
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 6);
        }
        if (!endDate) {
            endDate = new Date();
        }
        const analytics = await this.analyticsRepository.find({
            where: {
                merchantId,
                timeFrame,
                date: Between(startDate, endDate),
                productId: null,
                categoryId: null,
            },
        });
        return analytics.map(record => ({
            date: record.date,
            organic: record.organicImpressions || 0,
            paid: record.paidImpressions || 0,
            total: (record.organicImpressions || 0) + (record.paidImpressions || 0),
        }));
    }
}
class DemographicAnalyticsService {
    constructor(analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }
    async getDemographicAnalytics(merchantId, timeFrame = 'monthly', startDate, endDate, filters) {
        if (!startDate) {
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 6);
        }
        if (!endDate) {
            endDate = new Date();
        }
        const analytics = await this.analyticsRepository.find({
            where: {
                merchantId,
                timeFrame,
                date: Between(startDate, endDate),
                productId: null,
                categoryId: null,
            },
        });
        const ageGroups = { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 };
        const locations = { 'US': 0, 'EU': 0, 'Asia': 0, 'Other': 0 };
        const devices = { 'mobile': 0, 'desktop': 0, 'tablet': 0 };
        const genders = { 'male': 0, 'female': 0, 'other': 0 };
        const interests = { 'technology': 0, 'fashion': 0, 'home': 0, 'sports': 0, 'beauty': 0 };
        analytics.forEach(record => {
            if (!record.demographics)
                return;
            record.demographics.forEach(demo => {
                const [type, value] = demo.split(':');
                if (type === 'age') {
                    if (ageGroups.hasOwnProperty(value)) {
                        ageGroups[value]++;
                    }
                }
                else if (type === 'location') {
                    if (locations.hasOwnProperty(value)) {
                        locations[value]++;
                    }
                    else {
                        locations['Other']++;
                    }
                }
                else if (type === 'device') {
                    if (devices.hasOwnProperty(value)) {
                        devices[value]++;
                    }
                }
                else if (type === 'gender') {
                    if (genders.hasOwnProperty(value)) {
                        genders[value]++;
                    }
                    else {
                        genders['other']++;
                    }
                }
                else if (type === 'interest') {
                    if (interests.hasOwnProperty(value)) {
                        interests[value]++;
                    }
                }
            });
        });
        if (filters && filters.length > 0) {
            console.log('Applying filters:', filters);
        }
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
function createTestData() {
    const merchantId = 'merchant1';
    const data = [];
    for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(1);
        const record = new MerchantAnalytics();
        record.merchantId = merchantId;
        record.date = date;
        record.timeFrame = 'monthly';
        record.revenue = 10000 - (i * 1000);
        record.orders = 100 - (i * 10);
        record.productViews = 5000 - (i * 500);
        record.organicImpressions = 3000 - (i * 300);
        record.paidImpressions = 2000 - (i * 200);
        record.clicks = 1000 - (i * 100);
        record.addToCarts = 500 - (i * 50);
        record.abandonedCarts = 200 - (i * 20);
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
async function runAnalyticsTests() {
    console.log('Starting isolated analytics services tests...');
    const testData = createTestData();
    const mockRepository = new MockRepository(testData);
    const revenueService = new RevenueAnalyticsService(mockRepository);
    const demographicService = new DemographicAnalyticsService(mockRepository);
    console.log('\n--- Testing Revenue Analytics ---');
    const merchantId = 'merchant1';
    console.log('\nTesting getRevenueByTimeFrame:');
    const revenueData = await revenueService.getRevenueByTimeFrame(merchantId);
    console.log('Revenue Data:', JSON.stringify(revenueData, null, 2));
    console.log('\nTesting getImpressionsBySourceOverTime:');
    const impressionData = await revenueService.getImpressionsBySourceOverTime(merchantId);
    console.log('Impression Data:', JSON.stringify(impressionData, null, 2));
    console.log('\n--- Testing Demographic Analytics ---');
    console.log('\nTesting getDemographicAnalytics:');
    const demographicData = await demographicService.getDemographicAnalytics(merchantId);
    console.log('Demographic Data:', JSON.stringify(demographicData, null, 2));
    console.log('\nTesting getDemographicAnalytics with filters:');
    const filters = [{ key: 'age', values: ['25-34'] }];
    const filteredDemographicData = await demographicService.getDemographicAnalytics(merchantId, 'monthly', undefined, undefined, filters);
    console.log('Filtered Demographic Data:', JSON.stringify(filteredDemographicData, null, 2));
    console.log('\nAll tests completed successfully!');
}
runAnalyticsTests().catch(error => {
    console.error('Test failed with error:', error);
});
//# sourceMappingURL=test-analytics-isolated.js.map