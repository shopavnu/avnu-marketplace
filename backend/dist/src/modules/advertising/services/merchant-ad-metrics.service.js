'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.MerchantAdMetricsService = void 0;
const common_1 = require('@nestjs/common');
let MerchantAdMetricsService = class MerchantAdMetricsService {
  async getMerchantAdMetrics(period = 30, merchantId) {
    const campaigns = this.generateMockCampaigns(period, merchantId);
    const totalRevenue = campaigns.reduce((sum, campaign) => sum + campaign.totalRevenue, 0);
    const totalCost = campaigns.reduce((sum, campaign) => sum + campaign.totalCost, 0);
    const totalRoi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
    const totalImpressions = campaigns.reduce(
      (sum, campaign) => sum + campaign.totalImpressions,
      0,
    );
    const totalClicks = campaigns.reduce((sum, campaign) => sum + campaign.totalClicks, 0);
    const averageClickThroughRate =
      totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const totalConversions = campaigns.reduce(
      (sum, campaign) => sum + campaign.totalConversions,
      0,
    );
    const averageConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const platformAdRevenue = totalCost * 0.15;
    const productSalesFromAds = totalRevenue * 3.5;
    const returnOnAdSpend = totalCost > 0 ? productSalesFromAds / totalCost : 0;
    const averageConversionValue =
      totalConversions > 0 ? productSalesFromAds / totalConversions : 0;
    const costPerAcquisition = totalConversions > 0 ? totalCost / totalConversions : 0;
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
      historicalMetrics,
    };
  }
  generateMockCampaigns(period, merchantId) {
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
    const filteredMerchants = merchantId ? merchants.filter(m => m.id === merchantId) : merchants;
    return filteredMerchants.flatMap(merchant => {
      const numCampaigns = Math.floor(Math.random() * 3) + 1;
      return Array.from({ length: numCampaigns }, (_, i) => {
        const campaignType = campaignTypes[Math.floor(Math.random() * campaignTypes.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const totalImpressions = Math.floor(Math.random() * 100000) + 10000;
        const totalClicks = Math.floor(totalImpressions * (Math.random() * 0.1 + 0.01));
        const clickThroughRate = (totalClicks / totalImpressions) * 100;
        const totalConversions = Math.floor(totalClicks * (Math.random() * 0.1 + 0.01));
        const conversionRate = (totalConversions / totalClicks) * 100;
        const totalRevenue = totalConversions * (Math.random() * 100 + 50);
        const totalCost = totalImpressions * 0.01 + totalClicks * 0.5;
        const roi = ((totalRevenue - totalCost) / totalCost) * 100;
        const dailyMetrics = this.generateDailyMetrics(
          period,
          totalImpressions,
          totalClicks,
          totalConversions,
          totalRevenue,
          totalCost,
        );
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
          dailyMetrics,
        };
      });
    });
  }
  generateHistoricalMetrics(period) {
    const metrics = [];
    const today = new Date();
    const baseRevenue = 5000 + Math.random() * 2000;
    const baseCost = 1000 + Math.random() * 500;
    const baseImpressions = 50000 + Math.random() * 10000;
    const baseClicks = 5000 + Math.random() * 1000;
    const baseConversions = 500 + Math.random() * 100;
    for (let i = 0; i < period; i++) {
      const date = new Date();
      date.setDate(today.getDate() - (period - i - 1));
      const dailyFactor = 0.8 + Math.random() * 0.4;
      const growthFactor = 1 + 0.005 * i * (0.8 + Math.random() * 0.4);
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
  generateDailyMetrics(
    period,
    totalImpressions,
    totalClicks,
    totalConversions,
    totalRevenue,
    totalCost,
  ) {
    const metrics = [];
    const today = new Date();
    for (let i = 0; i < period; i++) {
      const date = new Date();
      date.setDate(today.getDate() - (period - i - 1));
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
};
exports.MerchantAdMetricsService = MerchantAdMetricsService;
exports.MerchantAdMetricsService = MerchantAdMetricsService = __decorate(
  [(0, common_1.Injectable)()],
  MerchantAdMetricsService,
);
//# sourceMappingURL=merchant-ad-metrics.service.js.map
