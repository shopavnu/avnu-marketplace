/**
 * This script manually tests the merchant analytics services
 * Run with: npx ts-node src/scripts/test-merchant-analytics.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MerchantRevenueAnalyticsService } from '../modules/merchants/services/merchant-revenue-analytics.service';
import { MerchantDemographicAnalyticsService } from '../modules/merchants/services/merchant-demographic-analytics.service';
import { MerchantDashboardAnalyticsService } from '../modules/merchants/services/merchant-dashboard-analytics.service';
import { Repository } from 'typeorm';
import { Merchant } from '../modules/merchants/entities/merchant.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function bootstrap() {
  // Create a NestJS application context
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Get the services
    const revenueService = app.get(MerchantRevenueAnalyticsService);
    const demographicService = app.get(MerchantDemographicAnalyticsService);
    const dashboardService = app.get(MerchantDashboardAnalyticsService);
    
    // Get merchant repository to find a test merchant
    const merchantRepo = app.get<Repository<Merchant>>(getRepositoryToken(Merchant));
    
    // Find a merchant for testing
    const merchant = await merchantRepo.findOne({ where: {} });
    
    if (!merchant) {
      console.error('No merchant found for testing');
      return;
    }
    
    console.log(`Testing with merchant: ${merchant.id}`);
    
    // Test revenue analytics
    console.log('\n=== Testing Revenue Analytics ===');
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    const endDate = new Date();
    
    try {
      const revenueData = await revenueService.getRevenueByTimeFrame(
        merchant.id,
        'monthly',
        startDate,
        endDate
      );
      console.log('Revenue data:', JSON.stringify(revenueData, null, 2));
    } catch (error) {
      console.error('Error getting revenue data:', error.message);
    }
    
    // Test impressions analytics
    console.log('\n=== Testing Impressions Analytics ===');
    try {
      const impressionsData = await revenueService.getImpressionsBySourceOverTime(
        merchant.id,
        'monthly',
        startDate,
        endDate
      );
      console.log('Impressions data:', JSON.stringify(impressionsData, null, 2));
    } catch (error) {
      console.error('Error getting impressions data:', error.message);
    }
    
    // Test demographic analytics
    console.log('\n=== Testing Demographic Analytics ===');
    try {
      const demographicData = await demographicService.getDemographicAnalytics(
        merchant.id,
        'monthly',
        startDate,
        endDate
      );
      console.log('Demographic data:', JSON.stringify(demographicData, null, 2));
    } catch (error) {
      console.error('Error getting demographic data:', error.message);
    }
    
    // Test dashboard analytics
    console.log('\n=== Testing Dashboard Analytics ===');
    try {
      const dashboardData = await dashboardService.getDashboardAnalytics(
        merchant.id,
        'monthly',
        startDate,
        endDate
      );
      console.log('Dashboard data summary:', JSON.stringify(dashboardData.summary, null, 2));
    } catch (error) {
      console.error('Error getting dashboard data:', error.message);
    }
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
