import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantAdCampaign, CampaignStatus } from '../entities/merchant-ad-campaign.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

export enum BudgetAllocationStrategy {
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

@Injectable()
export class AdBudgetManagementService {
  private readonly logger = new Logger(AdBudgetManagementService.name);

  constructor(
    @InjectRepository(MerchantAdCampaign)
    private adCampaignRepository: Repository<MerchantAdCampaign>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Calculate the daily budget for a campaign based on its total budget and duration
   */
  async calculateDailyBudget(campaignId: string): Promise<number> {
    const campaign = await this.adCampaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error(`Campaign with ID ${campaignId} not found`);
    }

    if (!campaign.endDate) {
      // If no end date, assume 30 days
      return campaign.budget / 30;
    }

    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    const durationInDays = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
    );

    return campaign.budget / durationInDays;
  }

  /**
   * Record ad spend for a campaign and check if budget is exhausted
   */
  async recordAdSpend(
    campaignId: string,
    amount: number,
    impressionCount = 1,
  ): Promise<BudgetUpdateResult> {
    const campaign = await this.adCampaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error(`Campaign with ID ${campaignId} not found`);
    }

    const previousSpent = campaign.spent || 0;
    const currentSpent = previousSpent + amount;
    const remainingBudget = campaign.budget - currentSpent;
    const budgetExhausted = remainingBudget <= 0;

    // Update campaign with new spend amount and impressions
    await this.adCampaignRepository.update(
      { id: campaignId },
      {
        spent: currentSpent,
        impressions: (campaign.impressions || 0) + impressionCount,
      },
    );

    // If budget is exhausted, pause the campaign
    if (budgetExhausted && campaign.status === CampaignStatus.ACTIVE) {
      await this.adCampaignRepository.update(
        { id: campaignId },
        { status: CampaignStatus.PAUSED },
      );
      
      this.logger.log(`Campaign ${campaignId} paused due to budget exhaustion`);
      this.eventEmitter.emit('campaign.budget.exhausted', { 
        campaignId, 
        merchantId: campaign.merchantId 
      });
    }

    return {
      campaignId,
      previousSpent,
      currentSpent,
      remainingBudget,
      budgetExhausted,
    };
  }

  /**
   * Calculate cost per impression based on campaign budget and target impressions
   */
  async calculateCostPerImpression(campaignId: string): Promise<number> {
    const campaign = await this.adCampaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error(`Campaign with ID ${campaignId} not found`);
    }

    // Calculate target impressions based on industry average CTR of 0.1% and target of 100 clicks
    const targetImpressions = 100 / 0.001; // 100,000 impressions
    
    return campaign.budget / targetImpressions;
  }

  /**
   * Calculate cost per click based on campaign performance
   */
  async calculateCostPerClick(campaignId: string): Promise<number> {
    const campaign = await this.adCampaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error(`Campaign with ID ${campaignId} not found`);
    }

    if (!campaign.clicks || campaign.clicks === 0) {
      // If no clicks yet, use an estimated CPC based on budget
      return campaign.budget / 100; // Assume 100 clicks
    }

    return campaign.spent / campaign.clicks;
  }

  /**
   * Allocate budget across multiple campaigns using specified strategy
   */
  async allocateBudgetAcrossCampaigns(
    merchantId: string,
    totalBudget: number,
    campaignIds: string[],
    strategy: BudgetAllocationStrategy = BudgetAllocationStrategy.EQUAL,
  ): Promise<Record<string, number>> {
    const campaigns = await this.adCampaignRepository.find({
      where: { id: { in: campaignIds }, merchantId },
    });

    if (campaigns.length === 0) {
      throw new Error('No valid campaigns found for budget allocation');
    }

    const allocation: Record<string, number> = {};

    switch (strategy) {
      case BudgetAllocationStrategy.PERFORMANCE_BASED:
        // Allocate budget based on campaign performance (CTR)
        const totalClicks = campaigns.reduce((sum, campaign) => sum + (campaign.clicks || 0), 0);
        
        if (totalClicks === 0) {
          // If no performance data, fall back to equal allocation
          const equalBudget = totalBudget / campaigns.length;
          campaigns.forEach(campaign => {
            allocation[campaign.id] = equalBudget;
          });
        } else {
          campaigns.forEach(campaign => {
            const performanceRatio = (campaign.clicks || 0) / totalClicks;
            allocation[campaign.id] = totalBudget * performanceRatio;
          });
        }
        break;

      case BudgetAllocationStrategy.TIME_BASED:
        // Allocate more budget to newer campaigns
        const now = new Date();
        const totalDaysActive = campaigns.reduce((sum, campaign) => {
          const startDate = new Date(campaign.startDate);
          const daysActive = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          return sum + Math.max(1, daysActive);
        }, 0);

        campaigns.forEach(campaign => {
          const startDate = new Date(campaign.startDate);
          const daysActive = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          // Newer campaigns get more budget (inverse relationship with days active)
          const inverseTimeRatio = (totalDaysActive - daysActive + 1) / totalDaysActive;
          allocation[campaign.id] = totalBudget * (inverseTimeRatio / campaigns.length);
        });
        break;

      case BudgetAllocationStrategy.EQUAL:
      default:
        // Equal allocation
        const equalBudget = totalBudget / campaigns.length;
        campaigns.forEach(campaign => {
          allocation[campaign.id] = equalBudget;
        });
        break;
    }

    // Update campaign budgets
    for (const campaignId in allocation) {
      await this.adCampaignRepository.update(
        { id: campaignId },
        { budget: allocation[campaignId] },
      );
    }

    return allocation;
  }

  /**
   * Get budget utilization report for a merchant
   */
  async getBudgetUtilizationReport(merchantId: string): Promise<{
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
  }> {
    const campaigns = await this.adCampaignRepository.find({
      where: { merchantId },
    });

    const totalBudget = campaigns.reduce((sum, campaign) => sum + campaign.budget, 0);
    const totalSpent = campaigns.reduce((sum, campaign) => sum + (campaign.spent || 0), 0);
    const utilizationRate = totalBudget > 0 ? totalSpent / totalBudget : 0;

    const campaignUtilization = campaigns.map(campaign => ({
      campaignId: campaign.id,
      name: campaign.name,
      budget: campaign.budget,
      spent: campaign.spent || 0,
      utilizationRate: campaign.budget > 0 ? (campaign.spent || 0) / campaign.budget : 0,
    }));

    return {
      totalBudget,
      totalSpent,
      utilizationRate,
      campaignUtilization,
    };
  }

  /**
   * Forecast remaining campaign duration based on current spend rate
   */
  async forecastRemainingDuration(campaignId: string): Promise<{
    campaignId: string;
    remainingBudget: number;
    dailySpendRate: number;
    estimatedDaysRemaining: number;
    estimatedEndDate: Date;
  }> {
    const campaign = await this.adCampaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error(`Campaign with ID ${campaignId} not found`);
    }

    const remainingBudget = campaign.budget - (campaign.spent || 0);
    
    // Calculate daily spend rate
    const startDate = new Date(campaign.startDate);
    const now = new Date();
    const daysActive = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const dailySpendRate = (campaign.spent || 0) / daysActive;
    
    // Calculate estimated days remaining
    const estimatedDaysRemaining = dailySpendRate > 0 ? Math.ceil(remainingBudget / dailySpendRate) : 0;
    
    // Calculate estimated end date
    const estimatedEndDate = new Date();
    estimatedEndDate.setDate(estimatedEndDate.getDate() + estimatedDaysRemaining);

    return {
      campaignId,
      remainingBudget,
      dailySpendRate,
      estimatedDaysRemaining,
      estimatedEndDate,
    };
  }
}
