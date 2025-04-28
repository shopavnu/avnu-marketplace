import { Injectable } from '@nestjs/common';
import {
  MerchantAdMetrics,
  AdCampaign,
  AdPerformanceMetric,
  HistoricalMetricPoint,
} from '../dto/merchant-ad-metrics.dto';

@Injectable()
export class MerchantAdMetricsService {
  async getMerchantAdMetrics(period: number = 30, merchantId?: string): Promise<MerchantAdMetrics> {
    // In a real implementation, this would fetch data from a database
    // For now, we'll generate mock data
    const campaigns = this.generateMockCampaigns(period, merchantId);

    // Calculate totals
    const totalRevenue = campaigns.reduce((sum, campaign) => sum + campaign.totalRevenue, 0);
    const totalCost = campaigns.reduce((sum, campaign) => sum + campaign.totalCost, 0);
    const totalRoi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
    const totalImpressions = campaigns.reduce(
      (sum, campaign) => sum + campaign.totalImpressions,
      0,
    );
    const totalClicks = campaigns.reduce((sum, campaign) => sum + campaign.totalClicks, 0);
    const averageClickThroughRate = totalImpressions > 0 ? 
      (totalClicks / totalImpressions) * 100 : 0;
    const totalConversions = campaigns.reduce(
      (sum, campaign) => sum + campaign.totalConversions,
      0,
    );
    const averageConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    // Calculate platform revenue (what Avnu makes from ads)
    // In a real implementation, this would be the actual revenue Avnu makes from ads
    // For mock data, we'll assume Avnu takes 15% of ad spend
    const platformAdRevenue = totalCost * 0.15;

    // Calculate product sales revenue (dollars sold because of ads)
    // In a real implementation, this would be tracked from actual sales attributed to ads
    // For mock data, we'll use a multiplier on the ad revenue to simulate product sales
    const productSalesFromAds = totalRevenue * 3.5; // 3.5x the ad revenue for product sales

    // Calculate return on ad spend (ROAS)
    const returnOnAdSpend = totalCost > 0 ? productSalesFromAds / totalCost : 0;

    // Calculate average conversion value
    const averageConversionValue = totalConversions > 0 ? 
      productSalesFromAds / totalConversions : 0;

    // Calculate cost per acquisition (CPA)
    const costPerAcquisition = totalConversions > 0 ? totalCost / totalConversions : 0;

    // Generate historical metrics for trend tracking
    const historicalMetrics = this.generateHistoricalMetrics(period);

    return {
      campaigns,
      totalRevenue,
      totalCost,
      totalRoi,
      totalImpressions,
      totalClicks,
      averageClickThroughRate,
      totalConversions,
      averageConversionRate,
      platformAdRevenue,
      productSalesFromAds,
      returnOnAdSpend,
      averageConversionValue,
      costPerAcquisition,
      historicalMetrics
    };
  }

  private generateMockCampaigns(period: number, merchantId?: string): AdCampaign[] {
    const merchants = [
      { id: 'merchant-1', name: 'Eco Furnishings' },
      { id: 'merchant-2', name: 'Modern Home Décor' },
      { id: 'merchant-3', name: 'Artisan Crafts' },
      { id: 'merchant-4', name: 'Tech Gadgets Plus' },
      { id: 'merchant-5', name: 'Outdoor Living' },
    ];

    const campaignTypes = [
      'Summer Sale',
      'New Arrivals',
      'Clearance',
      'Holiday Special',
      'Flash Sale',
    ];

    const statuses = ['active', 'paused', 'completed'];

    // Filter merchants if merchantId is provided
    const filteredMerchants = merchantId
      ? merchants.filter(m => m.id === merchantId)
      : merchants;

    // Generate between 1-3 campaigns per merchant
    return filteredMerchants.flatMap(merchant => {
      const numCampaigns = Math.floor(Math.random() * 3) + 1;

      return Array.from({ length: numCampaigns }, (_, i) => {
        const campaignType = campaignTypes[Math.floor(Math.random() * campaignTypes.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        // Generate random metrics
        const totalImpressions = Math.floor(Math.random() * 100000) + 10000;
        const totalClicks = Math.floor(totalImpressions * (Math.random() * 0.1 + 0.01)); // 1-11% CTR
        const clickThroughRate = (totalClicks / totalImpressions) * 100;
        const totalConversions = Math.floor(totalClicks * (Math.random() * 0.1 + 0.01)); // 1-11% conversion
        const conversionRate = (totalConversions / totalClicks) * 100;
        const totalRevenue = totalConversions * (Math.random() * 100 + 50); // $50-150 per conversion
        const totalCost = totalImpressions * 0.01 + totalClicks * 0.5; // $0.01 per impression, $0.50 per click
        const roi = ((totalRevenue - totalCost) / totalCost) * 100;

        // Generate daily metrics for the period
        const dailyMetrics = this.generateDailyMetrics(
          period,
          totalImpressions,
          totalClicks,
          totalConversions,
          totalRevenue,
          totalCost,
        );

        // Calculate start and end dates
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);
        
        return {
          id: `campaign-${merchant.id}-${i}`,
          name: `${merchant.name} ${campaignType}`,
          merchantId: merchant.id,
          merchantName: merchant.name,
          status,
          startDate: startDate.toISOString().split('T')[0],
          endDate: status === 'completed' ? endDate.toISOString().split('T')[0] : null,
          totalImpressions,
          totalClicks,
          clickThroughRate,
          totalConversions,
          conversionRate,
          totalRevenue,
          totalCost,
          roi,
          dailyMetrics
        };
      });
    });
  }

  /**
   * Generate historical metrics for trend tracking
   * @param period Number of days to generate metrics for
   */
  private generateHistoricalMetrics(period: number): HistoricalMetricPoint[] {
    const metrics: HistoricalMetricPoint[] = [];
    const today = new Date();

    // Generate a trend pattern with some randomness
    // Start with base values
    const baseRevenue = 5000 + Math.random() * 2000;
    const baseCost = 1000 + Math.random() * 500;
    const baseImpressions = 50000 + Math.random() * 10000;
    const baseClicks = 5000 + Math.random() * 1000;
    const baseConversions = 500 + Math.random() * 100;

    // Create a growth trend (with some randomness)
    for (let i = 0; i < period; i++) {
      const date = new Date();
      date.setDate(today.getDate() - (period - i - 1));

      // Add some daily fluctuation
      const dailyFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2

      // Add a slight growth trend (0.5% daily growth on average)
      const growthFactor = 1 + 0.005 * i * (0.8 + Math.random() * 0.4);

      // Calculate metrics with trend and fluctuation
      const totalRevenue = baseRevenue * dailyFactor * growthFactor;
      const totalCost = baseCost * dailyFactor * growthFactor;
      const platformAdRevenue = totalCost * 0.15;
      const productSalesFromAds = totalRevenue * 3.5;
      const totalImpressions = Math.floor(baseImpressions * dailyFactor * growthFactor);
      const totalClicks = Math.floor(baseClicks * dailyFactor * growthFactor);
      const totalConversions = Math.floor(baseConversions * dailyFactor * growthFactor);

      metrics.push({
        date: date.toISOString().split('T')[0],
        totalRevenue,
        totalCost,
        platformAdRevenue,
        productSalesFromAds,
        totalImpressions,
        totalClicks,
        totalConversions,
      });
    }
    
    return metrics;
  }
  
  private generateDailyMetrics(
    period: number,
    totalImpressions: number,
    totalClicks: number,
    totalConversions: number,
    totalRevenue: number,
    totalCost: number,
  ): AdPerformanceMetric[] {
    const metrics: AdPerformanceMetric[] = [];
    const today = new Date();

    // Distribute metrics over the period with some randomness
    for (let i = 0; i < period; i++) {
      const date = new Date();
      date.setDate(today.getDate() - (period - i - 1));

      // Add some randomness to daily distribution
      const factor = 0.5 + Math.random();

      const impressions = Math.floor((totalImpressions / period) * factor);
      const clicks = Math.floor((totalClicks / period) * factor);
      const clickThroughRate = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const conversions = Math.floor((totalConversions / period) * factor);
      const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
      const revenue = (totalRevenue / period) * factor;
      const cost = (totalCost / period) * factor;
      const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;

      metrics.push({
        date: date.toISOString().split('T')[0],
        impressions,
        clicks,
        clickThroughRate,
        conversions,
        conversionRate,
        revenue,
        cost,
        roi,
      });
    }

    return metrics;
  }
}
