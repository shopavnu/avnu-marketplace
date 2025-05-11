'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.mockUser =
  exports.mockProductRecommendations =
  exports.mockAdPlacements =
  exports.mockCampaignForecast =
  exports.mockBudgetUtilizationReport =
  exports.mockAdCampaigns =
    void 0;
const merchant_ad_campaign_entity_1 = require('../entities/merchant-ad-campaign.entity');
exports.mockAdCampaigns = [
  {
    id: '1',
    merchantId: 'merchant1',
    name: 'Test Campaign 1',
    type: merchant_ad_campaign_entity_1.CampaignType.PRODUCT_PROMOTION,
    status: merchant_ad_campaign_entity_1.CampaignStatus.ACTIVE,
    productIds: ['product1', 'product2'],
    budget: 1000,
    spent: 100,
    targetAudience: 'ALL',
    targetDemographics: ['18-24', '25-34'],
    targetLocations: ['New York', 'Los Angeles'],
    targetInterests: ['Fashion', 'Technology'],
    impressions: 1000,
    clicks: 50,
    clickThroughRate: 0.05,
    conversions: 10,
    conversionRate: 0.2,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    merchantId: 'merchant1',
    name: 'Test Campaign 2',
    type: merchant_ad_campaign_entity_1.CampaignType.BRAND_AWARENESS,
    status: merchant_ad_campaign_entity_1.CampaignStatus.ACTIVE,
    productIds: ['product3'],
    budget: 500,
    spent: 50,
    targetAudience: 'ALL',
    targetInterests: ['Home', 'Garden'],
    impressions: 500,
    clicks: 20,
    clickThroughRate: 0.04,
    conversions: 5,
    conversionRate: 0.25,
    startDate: new Date(),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    merchantId: 'merchant1',
    name: 'Test Campaign 3',
    type: merchant_ad_campaign_entity_1.CampaignType.RETARGETING,
    status: merchant_ad_campaign_entity_1.CampaignStatus.ACTIVE,
    productIds: ['product4'],
    budget: 300,
    spent: 290,
    targetAudience: 'PREVIOUS_VISITORS',
    impressions: 2000,
    clicks: 100,
    clickThroughRate: 0.05,
    conversions: 20,
    conversionRate: 0.2,
    startDate: new Date(),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
exports.mockBudgetUtilizationReport = {
  totalBudget: 1800,
  totalSpent: 440,
  utilizationRate: 0.24,
  campaignUtilization: [
    {
      campaignId: '1',
      name: 'Test Campaign 1',
      budget: 1000,
      spent: 100,
      utilizationRate: 0.1,
    },
    {
      campaignId: '2',
      name: 'Test Campaign 2',
      budget: 500,
      spent: 50,
      utilizationRate: 0.1,
    },
    {
      campaignId: '3',
      name: 'Test Campaign 3',
      budget: 300,
      spent: 290,
      utilizationRate: 0.97,
    },
  ],
};
exports.mockCampaignForecast = {
  campaignId: '1',
  remainingBudget: 900,
  dailySpendRate: 10,
  estimatedDaysRemaining: 90,
  estimatedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
};
exports.mockAdPlacements = [
  {
    campaignId: '1',
    merchantId: 'merchant1',
    productIds: ['product1', 'product2'],
    type: 'PRODUCT_PROMOTION',
    relevanceScore: 0.85,
    isSponsored: true,
    impressionCost: 0.05,
  },
  {
    campaignId: '2',
    merchantId: 'merchant1',
    productIds: ['product3'],
    type: 'BRAND_AWARENESS',
    relevanceScore: 0.75,
    isSponsored: true,
    impressionCost: 0.03,
  },
];
exports.mockProductRecommendations = [
  {
    productId: 'product1',
    recommendedBudget: 100,
    estimatedImpressions: 2000,
    estimatedClicks: 100,
    estimatedConversions: 10,
  },
  {
    productId: 'product2',
    recommendedBudget: 150,
    estimatedImpressions: 3000,
    estimatedClicks: 150,
    estimatedConversions: 15,
  },
];
exports.mockUser = {
  id: 'user1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
};
//# sourceMappingURL=test-utils.js.map
