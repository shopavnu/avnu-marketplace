import { Injectable } from '@nestjs/common';
import { AdBudgetManagementService } from './ad-budget-management.service.mock';
import { BudgetAllocationStrategy, BudgetForecast, BudgetUtilization } from './entity-mocks';

@Injectable()
export class AdBudgetManagementResolver {
  constructor(private readonly budgetService: AdBudgetManagementService) {}

  async merchantBudgetUtilization(merchantId: string, _user?: any): Promise<BudgetUtilization> {
    return this.budgetService.getBudgetUtilization(merchantId);
  }

  async merchantBudgetForecast(merchantId: string, _user?: any): Promise<BudgetForecast> {
    return this.budgetService.getBudgetForecast(merchantId);
  }

  async merchantDailyBudget(merchantId: string, _user?: any): Promise<number> {
    return this.budgetService.getDailyBudget(merchantId);
  }

  async allocateBudgetAcrossCampaigns(
    merchantId: string,
    totalBudget: number,
    campaignIds: string[],
    strategy: BudgetAllocationStrategy = BudgetAllocationStrategy.EQUAL,
    _user?: any,
  ): Promise<Record<string, number>> {
    return this.budgetService.allocateBudgetAcrossCampaigns(
      merchantId,
      campaignIds,
      totalBudget,
      strategy,
    );
  }
}
