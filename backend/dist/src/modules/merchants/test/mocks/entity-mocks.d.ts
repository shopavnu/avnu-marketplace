export declare enum CampaignStatus {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    COMPLETED = "COMPLETED",
    ARCHIVED = "ARCHIVED"
}
export declare enum CampaignType {
    PRODUCT_PROMOTION = "PRODUCT_PROMOTION",
    BRAND_AWARENESS = "BRAND_AWARENESS",
    RETARGETING = "RETARGETING",
    SEASONAL = "SEASONAL",
    CLEARANCE = "CLEARANCE"
}
export declare enum BudgetAllocationStrategy {
    EQUAL = "equal",
    PERFORMANCE_BASED = "performance_based",
    TIME_BASED = "time_based"
}
export interface MerchantAdCampaign {
    id: string;
    merchantId: string;
    name: string;
    description?: string;
    type: CampaignType | string;
    status: CampaignStatus | string;
    productIds: string[];
    budget: number;
    spent: number;
    startDate?: Date;
    endDate?: Date;
    targetAudience?: string;
    targetDemographics?: string[];
    targetLocations?: string[];
    targetInterests?: string[];
    impressions: number;
    clicks: number;
    conversions?: number;
    clickThroughRate?: number;
    conversionRate?: number;
    lastUpdatedByMerchantAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}
export interface BudgetUtilization {
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
    utilizationRate: number;
    campaignBreakdown: Record<string, number>;
}
export interface BudgetForecast {
    projectedSpend: number;
    daysRemaining: number;
    dailyBudget: number;
    projectedExhaustionDate: Date;
    campaignProjections: Record<string, number>;
}
export interface BudgetUpdateResult {
    campaignId: string;
    previousSpent: number;
    currentSpent: number;
    remainingBudget: number;
    budgetExhausted: boolean;
}
export interface AdPlacementResult {
    campaignId: string;
    merchantId: string;
    productIds: string[];
    type: CampaignType | string;
    relevanceScore: number;
    isSponsored: boolean;
    impressionCost: number;
}
export interface AdPlacementOptions {
    userId?: string;
    sessionId?: string;
    userInterests?: string[];
    userDemographics?: string[];
    userLocation?: string;
    maxResults?: number;
    excludedCampaignIds?: string[];
}
