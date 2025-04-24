import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BudgetAllocationStrategy, BudgetForecast, BudgetUpdateResult, BudgetUtilization } from './entity-mocks';

@Injectable()
export class AdBudgetManagementService {
  constructor(
    private readonly eventEmitter: EventEmitter2
  ) {}

  async getBudgetUtilization(merchantId: string): Promise<BudgetUtilization> {
    return {
      totalBudget: 1500,
      totalSpent: 500,
      remainingBudget: 1000,
      utilizationRate: 0.33,
      campaignBreakdown: {
        'campaign1': 300,
        'campaign2': 200,
      },
    };
  }

  async getBudgetForecast(merchantId: string): Promise<BudgetForecast> {
    return {
      projectedSpend: 1000,
      daysRemaining: 15,
      dailyBudget: 66.67,
      projectedExhaustionDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      campaignProjections: {
        'campaign1': 600,
        'campaign2': 400,
      },
    };
  }

  async getDailyBudget(merchantId: string): Promise<number> {
    return 66.67;
  }

  async allocateBudgetAcrossCampaigns(
    merchantId: string,
    campaignIds: string[],
    totalBudget: number,
    strategy: BudgetAllocationStrategy = BudgetAllocationStrategy.EQUAL,
  ): Promise<Record<string, number>> {
    if (strategy === BudgetAllocationStrategy.EQUAL) {
      const perCampaignBudget = totalBudget / campaignIds.length;
      return campaignIds.reduce((acc, id) => {
        acc[id] = perCampaignBudget;
        return acc;
      }, {} as Record<string, number>);
    } else if (strategy === BudgetAllocationStrategy.PERFORMANCE_BASED) {
      // Mock performance-based allocation
      return {
        'campaign1': 600,
        'campaign2': 400,
      };
    } else {
      // TIME_BASED
      return {
        'campaign1': 500,
        'campaign2': 500,
      };
    }
  }

  async recordAdSpend(
    campaignId: string,
    amount: number,
    impressionCount = 1,
  ): Promise<BudgetUpdateResult> {
    return {
      campaignId,
      previousSpent: 100,
      currentSpent: 100 + amount,
      remainingBudget: 900 - amount,
      budgetExhausted: false,
    };
  }
}
