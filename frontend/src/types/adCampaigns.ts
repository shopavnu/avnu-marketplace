// Campaign types and statuses from backend
export enum CampaignType {
  PRODUCT_PROMOTION = "product_promotion",
  RETARGETING = "retargeting",
  BRAND_AWARENESS = "brand_awareness",
}

export enum CampaignStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  PAUSED = "paused",
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
  ENDED = "ended",
}

export enum TargetAudience {
  ALL = "all",
  PREVIOUS_VISITORS = "previous_visitors",
  CART_ABANDONERS = "cart_abandoners",
  PREVIOUS_CUSTOMERS = "previous_customers",
}

// Interface for campaign data from API
export interface AdCampaign {
  id: string;
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  conversionRate: number;
  roi: number;
  startDate: string;
  endDate: string;
  productIds: string[];
  targetAudience: TargetAudience;
  targetDemographics: string[];
  targetLocations: string[];
  targetInterests: string[];
  createdAt: string;
  updatedAt: string;
  lastUpdatedByMerchantAt?: string;
}

// Interface for product data
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isActive?: boolean;
}

// Interface for campaign form data
export interface CampaignFormData {
  name: string;
  description: string;
  type: CampaignType;
  startDate: string;
  endDate: string;
  budget: number;
  targetAudience: TargetAudience;
  selectedProducts: string[];
  selectedAgeRanges: string[];
  selectedGenders: string[];
  selectedInterests: string[];
  selectedLocations: string[];
}

// Interface for budget forecast
export interface BudgetForecast {
  recommendedBudget: number;
  estimatedImpressions: number;
  estimatedClicks: number;
  estimatedConversions: number;
  estimatedCostPerClick: number;
  estimatedCostPerMille: number;
  estimatedCostPerAcquisition: number;
}

// Analytics types
export interface CampaignPerformance {
  id: string;
  name: string;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  spent: number;
  roi: number;
}

export interface DailyPerformanceData {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spent: number;
}

export interface PerformanceMetrics {
  totalSpent: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  ctr: number;
  conversionRate: number;
  roi: number;
}

export interface CampaignAnalytics {
  totalSpent: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  ctr: number;
  conversionRate: number;
  roi: number;
  previousPeriod: PerformanceMetrics;
  dailyData: DailyPerformanceData[];
  topCampaigns: CampaignPerformance[];
}

// Interface for ad placement recommendations
export interface AdPlacementRecommendation {
  placementType: string;
  recommendedBid: number;
  estimatedImpressions: number;
  estimatedClicks: number;
  estimatedConversions: number;
  relevanceScore: number;
}

// Input types for mutations
export interface CreateAdCampaignInput {
  name: string;
  description?: string;
  type: CampaignType;
  productIds: string[];
  budget: number;
  targetAudience: TargetAudience;
  targetDemographics?: string[];
  targetLocations?: string[];
  targetInterests?: string[];
  startDate: string;
  endDate?: string;
}

export interface UpdateAdCampaignInput {
  name?: string;
  description?: string;
  type?: CampaignType;
  productIds?: string[];
  budget?: number;
  targetAudience?: TargetAudience;
  targetDemographics?: string[];
  targetLocations?: string[];
  targetInterests?: string[];
  startDate?: string;
  endDate?: string;
}
