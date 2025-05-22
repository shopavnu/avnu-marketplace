import { CampaignStatus, CampaignType } from '../entities/merchant-ad-campaign.entity';
export declare const mockAdCampaigns: (
  | {
      id: string;
      merchantId: string;
      name: string;
      type: CampaignType;
      status: CampaignStatus;
      productIds: string[];
      budget: number;
      spent: number;
      targetAudience: string;
      targetDemographics: string[];
      targetLocations: string[];
      targetInterests: string[];
      impressions: number;
      clicks: number;
      clickThroughRate: number;
      conversions: number;
      conversionRate: number;
      startDate: Date;
      endDate: Date;
      createdAt: Date;
      updatedAt: Date;
    }
  | {
      id: string;
      merchantId: string;
      name: string;
      type: CampaignType;
      status: CampaignStatus;
      productIds: string[];
      budget: number;
      spent: number;
      targetAudience: string;
      targetInterests: string[];
      impressions: number;
      clicks: number;
      clickThroughRate: number;
      conversions: number;
      conversionRate: number;
      startDate: Date;
      endDate: Date;
      createdAt: Date;
      updatedAt: Date;
      targetDemographics?: undefined;
      targetLocations?: undefined;
    }
  | {
      id: string;
      merchantId: string;
      name: string;
      type: CampaignType;
      status: CampaignStatus;
      productIds: string[];
      budget: number;
      spent: number;
      targetAudience: string;
      impressions: number;
      clicks: number;
      clickThroughRate: number;
      conversions: number;
      conversionRate: number;
      startDate: Date;
      endDate: Date;
      createdAt: Date;
      updatedAt: Date;
      targetDemographics?: undefined;
      targetLocations?: undefined;
      targetInterests?: undefined;
    }
)[];
export declare const mockBudgetUtilizationReport: {
  totalBudget: number;
  totalSpent: number;
  utilizationRate: number;
  campaignUtilization: {
    campaignId: string;
    name: string;
    budget: number;
    spent: number;
    utilizationRate: number;
  }[];
};
export declare const mockCampaignForecast: {
  campaignId: string;
  remainingBudget: number;
  dailySpendRate: number;
  estimatedDaysRemaining: number;
  estimatedEndDate: Date;
};
export declare const mockAdPlacements: {
  campaignId: string;
  merchantId: string;
  productIds: string[];
  type: string;
  relevanceScore: number;
  isSponsored: boolean;
  impressionCost: number;
}[];
export declare const mockProductRecommendations: {
  productId: string;
  recommendedBudget: number;
  estimatedImpressions: number;
  estimatedClicks: number;
  estimatedConversions: number;
}[];
export declare const mockUser: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};
