"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merchant_revenue_analytics_service_1 = require("../modules/merchants/services/merchant-revenue-analytics.service");
const merchant_demographic_analytics_service_1 = require("../modules/merchants/services/merchant-demographic-analytics.service");
const merchant_analytics_entity_1 = require("../modules/merchants/entities/merchant-analytics.entity");
class MockMerchantAnalyticsRepository {
    constructor() {
        this.mockData = [];
        this.seedTestData();
    }
    seedTestData() {
        const today = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        this.mockData = [
            this.createAnalyticsRecord('merchant1', today, 'daily', 1000, 10, 500, 300, 200),
            this.createAnalyticsRecord('merchant1', lastMonth, 'monthly', 5000, 50, 2500, 1500, 1000),
            this.createAnalyticsRecord('merchant1', today, 'daily', 800, 8, 400, 250, 150, 'product1'),
            this.createAnalyticsRecord('merchant1', lastMonth, 'monthly', 4000, 40, 2000, 1200, 800, 'product1'),
        ];
    }
    createAnalyticsRecord(merchantId, date, timeFrame, revenue, orders, productViews, organicImpressions, paidImpressions, productId, categoryId) {
        const record = new merchant_analytics_entity_1.MerchantAnalytics();
        record.merchantId = merchantId;
        record.date = date;
        record.timeFrame = timeFrame;
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
    async find(options) {
        let results = [...this.mockData];
        if (options?.where) {
            const where = options.where;
            if (where.merchantId) {
                results = results.filter(r => r.merchantId === where.merchantId);
            }
            if (where.timeFrame) {
                results = results.filter(r => r.timeFrame === where.timeFrame);
            }
            if (where.productId) {
                results = results.filter(r => r.productId === where.productId);
            }
            else if (where.productId === null) {
                results = results.filter(r => r.productId === null);
            }
            if (where.categoryId) {
                results = results.filter(r => r.categoryId === where.categoryId);
            }
            else if (where.categoryId === null) {
                results = results.filter(r => r.categoryId === null);
            }
        }
        return results;
    }
    async findOne(options) {
        const results = await this.find(options);
        return results.length > 0 ? results[0] : null;
    }
    create(entityLike) {
        const entity = new merchant_analytics_entity_1.MerchantAnalytics();
        Object.assign(entity, entityLike);
        return entity;
    }
    async save(entityOrEntities, options) {
        if (Array.isArray(entityOrEntities)) {
            return Promise.all(entityOrEntities.map(entity => this.saveEntity(entity)));
        }
        return this.saveEntity(entityOrEntities);
    }
    async saveEntity(entity) {
        const existingIndex = this.mockData.findIndex(r => r.merchantId === entity.merchantId &&
            r.date.getTime() === entity.date.getTime() &&
            r.timeFrame === entity.timeFrame &&
            r.productId === entity.productId &&
            r.categoryId === entity.categoryId);
        if (existingIndex >= 0) {
            this.mockData[existingIndex] = entity;
        }
        else {
            this.mockData.push(entity);
        }
        return entity;
    }
}
async function runTests() {
    console.log('Starting merchant analytics services tests...');
    const mockRepository = new MockMerchantAnalyticsRepository();
    const revenueAnalyticsService = new merchant_revenue_analytics_service_1.MerchantRevenueAnalyticsService(mockRepository);
    const demographicAnalyticsService = new merchant_demographic_analytics_service_1.MerchantDemographicAnalyticsService(mockRepository);
    console.log('\n--- Testing Revenue Analytics ---');
    const merchantId = 'merchant1';
    console.log('\nTesting getRevenueByTimeFrame:');
    const revenueData = await revenueAnalyticsService.getRevenueByTimeFrame(merchantId, 'monthly');
    console.log('Revenue Data:', JSON.stringify(revenueData, null, 2));
    console.log('\nTesting getImpressionsBySourceOverTime:');
    const impressionData = await revenueAnalyticsService.getImpressionsBySourceOverTime(merchantId, 'monthly');
    console.log('Impression Data:', JSON.stringify(impressionData, null, 2));
    console.log('\n--- Testing Demographic Analytics ---');
    console.log('\nTesting getDemographicAnalytics:');
    const demographicData = await demographicAnalyticsService.getDemographicAnalytics(merchantId, 'monthly');
    console.log('Demographic Data:', JSON.stringify(demographicData, null, 2));
    console.log('\nTesting getDemographicAnalytics with filters:');
    const filters = [{ key: 'age', values: ['25-34'] }];
    const filteredDemographicData = await demographicAnalyticsService.getDemographicAnalytics(merchantId, 'monthly', undefined, undefined, filters);
    console.log('Filtered Demographic Data:', JSON.stringify(filteredDemographicData, null, 2));
    console.log('\nAll tests completed successfully!');
}
runTests().catch(error => {
    console.error('Test failed with error:', error);
});
//# sourceMappingURL=test-analytics-services.js.map