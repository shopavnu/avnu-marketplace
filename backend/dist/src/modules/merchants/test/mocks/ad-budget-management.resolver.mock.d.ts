import { AdBudgetManagementService } from './ad-budget-management.service.mock';
import { BudgetAllocationStrategy, BudgetForecast, BudgetUtilization } from './entity-mocks';
export declare class AdBudgetManagementResolver {
    private readonly budgetService;
    constructor(budgetService: AdBudgetManagementService);
    merchantBudgetUtilization(merchantId: string, user?: any): Promise<BudgetUtilization>;
    merchantBudgetForecast(merchantId: string, user?: any): Promise<BudgetForecast>;
    merchantDailyBudget(merchantId: string, user?: any): Promise<number>;
    allocateBudgetAcrossCampaigns(merchantId: string, totalBudget: number, campaignIds: string[], strategy?: BudgetAllocationStrategy, user?: any): Promise<Record<string, number>>;
}
