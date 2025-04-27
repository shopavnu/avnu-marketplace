import { Resolver, Query, Mutation, Args, ID, Float } from '@nestjs/graphql';
import { ForbiddenException } from '@nestjs/common';
import {
  AdBudgetManagementService,
  BudgetAllocationStrategy,
} from '../services/ad-budget-management.service';
import { MerchantService } from '../services/merchant.service';
import { _MerchantAdCampaign } from '../entities/merchant-ad-campaign.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { MerchantOnly } from '../../auth/decorators/merchant-only.decorator';
import { User, UserRole } from '../../users/entities/user.entity';
import { registerEnumType } from '@nestjs/graphql';

// Register the BudgetAllocationStrategy enum for GraphQL
registerEnumType(BudgetAllocationStrategy, { name: 'BudgetAllocationStrategy' });

// Define GraphQL types for budget management
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
class BudgetUtilizationReport {
  @Field(() => Float)
  totalBudget: number;

  @Field(() => Float)
  totalSpent: number;

  @Field(() => Float)
  utilizationRate: number;

  @Field(() => [CampaignUtilization])
  campaignUtilization: CampaignUtilization[];
}

@ObjectType()
class CampaignUtilization {
  @Field(() => ID)
  campaignId: string;

  @Field()
  name: string;

  @Field(() => Float)
  budget: number;

  @Field(() => Float)
  spent: number;

  @Field(() => Float)
  utilizationRate: number;
}

@ObjectType()
class CampaignForecast {
  @Field(() => ID)
  campaignId: string;

  @Field(() => Float)
  remainingBudget: number;

  @Field(() => Float)
  dailySpendRate: number;

  @Field(() => Float)
  estimatedDaysRemaining: number;

  @Field()
  estimatedEndDate: Date;
}

@ObjectType()
class BudgetAllocation {
  @Field(() => ID)
  campaignId: string;

  @Field(() => Float)
  allocatedBudget: number;
}

@Resolver()
export class AdBudgetManagementResolver {
  constructor(
    private readonly budgetService: AdBudgetManagementService,
    private readonly merchantService: MerchantService,
  ) {}

  @MerchantOnly()
  @Query(() => BudgetUtilizationReport)
  async merchantBudgetUtilization(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @CurrentUser() user: User,
  ): Promise<BudgetUtilizationReport> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    return this.budgetService.getBudgetUtilizationReport(merchantId);
  }

  @MerchantOnly()
  @Query(() => CampaignForecast)
  async campaignBudgetForecast(
    @Args('campaignId', { type: () => ID }) campaignId: string,
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @CurrentUser() user: User,
  ): Promise<CampaignForecast> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    return this.budgetService.forecastRemainingDuration(campaignId);
  }

  @MerchantOnly()
  @Query(() => Float)
  async campaignDailyBudget(
    @Args('campaignId', { type: () => ID }) campaignId: string,
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @CurrentUser() user: User,
  ): Promise<number> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    return this.budgetService.calculateDailyBudget(campaignId);
  }

  @MerchantOnly()
  @Mutation(() => [BudgetAllocation])
  async allocateBudgetAcrossCampaigns(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @Args('totalBudget', { type: () => Float }) totalBudget: number,
    @Args('campaignIds', { type: () => [ID] }) campaignIds: string[],
    @Args('strategy', {
      type: () => BudgetAllocationStrategy,
      defaultValue: BudgetAllocationStrategy.EQUAL,
    })
    strategy: BudgetAllocationStrategy,
    @CurrentUser() user: User,
  ): Promise<BudgetAllocation[]> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    const allocation = await this.budgetService.allocateBudgetAcrossCampaigns(
      merchantId,
      totalBudget,
      campaignIds,
      strategy,
    );

    // Convert the allocation object to an array of BudgetAllocation objects
    return Object.entries(allocation).map(([campaignId, allocatedBudget]) => ({
      campaignId,
      allocatedBudget,
    }));
  }

  // Helper method to validate merchant access
  private async validateMerchantAccess(user: User, merchantId: string): Promise<void> {
    if (user.role === UserRole.ADMIN) {
      return; // Admins have access to all merchants
    }

    const merchants = await this.merchantService.findByUserId(user.id);
    const hasAccess = merchants.some(m => m.id === merchantId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to access this merchant');
    }
  }
}
