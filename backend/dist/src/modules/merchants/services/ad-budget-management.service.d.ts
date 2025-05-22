import { Repository } from 'typeorm';
import { MerchantAdCampaign } from '../entities/merchant-ad-campaign.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare enum BudgetAllocationStrategy {
  EQUAL = 'equal',
  PERFORMANCE_BASED = 'performance_based',
  TIME_BASED = 'time_based',
}
export interface BudgetUpdateResult {
  campaignId: string;
  previousSpent: number;
  currentSpent: number;
  remainingBudget: number;
  budgetExhausted: boolean;
}
export declare class AdBudgetManagementService {
  private adCampaignRepository;
  private eventEmitter;
  private readonly logger;
  constructor(adCampaignRepository: Repository<MerchantAdCampaign>, eventEmitter: EventEmitter2);
  calculateDailyBudget(campaignId: string): Promise<number>;
  recordAdSpend(
    campaignId: string,
    amount: number,
    impressionCount?: number,
  ): Promise<BudgetUpdateResult>;
  calculateCostPerImpression(campaignId: string): Promise<number>;
  calculateCostPerClick(campaignId: string): Promise<number>;
  allocateBudgetAcrossCampaigns(
    merchantId: string,
    totalBudget: number,
    campaignIds: string[],
    strategy?: BudgetAllocationStrategy,
  ): Promise<Record<string, number>>;
  getBudgetUtilizationReport(merchantId: string): Promise<{
    totalBudget: number;
    totalSpent: number;
    utilizationRate: number;
    campaignUtilization: Array<{
      campaignId: string;
      name: string;
      budget: number;
      spent: number;
      utilizationRate: number;
    }>;
  }>;
  forecastRemainingDuration(campaignId: string): Promise<{
    campaignId: string;
    remainingBudget: number;
    dailySpendRate: number;
    estimatedDaysRemaining: number;
    estimatedEndDate: Date;
  }>;
}
