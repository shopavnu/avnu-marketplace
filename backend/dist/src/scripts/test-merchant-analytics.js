"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const merchant_revenue_analytics_service_1 = require("../modules/merchants/services/merchant-revenue-analytics.service");
const merchant_demographic_analytics_service_1 = require("../modules/merchants/services/merchant-demographic-analytics.service");
const merchant_dashboard_analytics_service_1 = require("../modules/merchants/services/merchant-dashboard-analytics.service");
const merchant_entity_1 = require("../modules/merchants/entities/merchant.entity");
const typeorm_1 = require("@nestjs/typeorm");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        const revenueService = app.get(merchant_revenue_analytics_service_1.MerchantRevenueAnalyticsService);
        const demographicService = app.get(merchant_demographic_analytics_service_1.MerchantDemographicAnalyticsService);
        const dashboardService = app.get(merchant_dashboard_analytics_service_1.MerchantDashboardAnalyticsService);
        const merchantRepo = app.get((0, typeorm_1.getRepositoryToken)(merchant_entity_1.Merchant));
        const merchant = await merchantRepo.findOne({ where: {} });
        if (!merchant) {
            console.error('No merchant found for testing');
            return;
        }
        console.log(`Testing with merchant: ${merchant.id}`);
        console.log('\n=== Testing Revenue Analytics ===');
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        const endDate = new Date();
        try {
            const revenueData = await revenueService.getRevenueByTimeFrame(merchant.id, 'monthly', startDate, endDate);
            console.log('Revenue data:', JSON.stringify(revenueData, null, 2));
        }
        catch (error) {
            console.error('Error getting revenue data:', error.message);
        }
        console.log('\n=== Testing Impressions Analytics ===');
        try {
            const impressionsData = await revenueService.getImpressionsBySourceOverTime(merchant.id, 'monthly', startDate, endDate);
            console.log('Impressions data:', JSON.stringify(impressionsData, null, 2));
        }
        catch (error) {
            console.error('Error getting impressions data:', error.message);
        }
        console.log('\n=== Testing Demographic Analytics ===');
        try {
            const demographicData = await demographicService.getDemographicAnalytics(merchant.id, 'monthly', startDate, endDate);
            console.log('Demographic data:', JSON.stringify(demographicData, null, 2));
        }
        catch (error) {
            console.error('Error getting demographic data:', error.message);
        }
        console.log('\n=== Testing Dashboard Analytics ===');
        try {
            const dashboardData = await dashboardService.getDashboardAnalytics(merchant.id, 'monthly', startDate, endDate);
            console.log('Dashboard data summary:', JSON.stringify(dashboardData.summary, null, 2));
        }
        catch (error) {
            console.error('Error getting dashboard data:', error.message);
        }
        console.log('\nAll tests completed!');
    }
    catch (error) {
        console.error('Error running tests:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=test-merchant-analytics.js.map