import { AdBudgetManagementService } from './ad-budget-management.service.mock';
import { BudgetAllocationStrategy, BudgetForecast, BudgetUtilization } from './entity-mocks';
export declare class AdBudgetManagementResolver {
    private readonly budgetService;
    constructor(budgetService: AdBudgetManagementService);
    merchantBudgetUtilization(merchantId: string, _user?: any): Promise<BudgetUtilization>;
    merchantBudgetForecast(merchantId: string, _user?: any): Promise<BudgetForecast>;
    merchantDailyBudget(merchantId: string, _user?: any): Promise<number>;
    allocateBudgetAcrossCampaigns(merchantId: string, totalBudget: number, campaignIds: string[], strategy?: BudgetAllocationStrategy, _user?: any): Promise<Record<string, number>>;
}
