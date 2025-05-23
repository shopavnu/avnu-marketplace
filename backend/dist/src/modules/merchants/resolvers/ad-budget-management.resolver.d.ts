import { AdBudgetManagementService, BudgetAllocationStrategy } from '../services/ad-budget-management.service';
import { MerchantService } from '../services/merchant.service';
import { User } from '../../users/entities/user.entity';
declare class BudgetUtilizationReport {
    totalBudget: number;
    totalSpent: number;
    utilizationRate: number;
    campaignUtilization: CampaignUtilization[];
}
declare class CampaignUtilization {
    campaignId: string;
    name: string;
    budget: number;
    spent: number;
    utilizationRate: number;
}
declare class CampaignForecast {
    campaignId: string;
    remainingBudget: number;
    dailySpendRate: number;
    estimatedDaysRemaining: number;
    estimatedEndDate: Date;
}
declare class BudgetAllocation {
    campaignId: string;
    allocatedBudget: number;
}
export declare class AdBudgetManagementResolver {
    private readonly budgetService;
    private readonly merchantService;
    constructor(budgetService: AdBudgetManagementService, merchantService: MerchantService);
    merchantBudgetUtilization(merchantId: string, user: User): Promise<BudgetUtilizationReport>;
    campaignBudgetForecast(campaignId: string, merchantId: string, user: User): Promise<CampaignForecast>;
    campaignDailyBudget(campaignId: string, merchantId: string, user: User): Promise<number>;
    allocateBudgetAcrossCampaigns(merchantId: string, totalBudget: number, campaignIds: string[], strategy: BudgetAllocationStrategy, user: User): Promise<BudgetAllocation[]>;
    private validateMerchantAccess;
}
export {};
