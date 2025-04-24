import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ForbiddenException } from '@nestjs/common';
import { MerchantAdCampaignService } from '../services/merchant-ad-campaign.service';
import { MerchantService } from '../services/merchant.service';
import {
  MerchantAdCampaign,
  CampaignStatus,
  CampaignType,
} from '../entities/merchant-ad-campaign.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { MerchantOnly } from '../../auth/decorators/merchant-only.decorator';
import { User, UserRole } from '../../users/entities/user.entity';
import { CreateAdCampaignInput, UpdateAdCampaignInput } from '../dto';

@Resolver(() => MerchantAdCampaign)
export class MerchantAdCampaignResolver {
  constructor(
    private readonly adCampaignService: MerchantAdCampaignService,
    private readonly merchantService: MerchantService,
  ) {}

  @MerchantOnly()
  @Query(() => [MerchantAdCampaign])
  async merchantAdCampaigns(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @CurrentUser() user: User,
  ): Promise<MerchantAdCampaign[]> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    return this.adCampaignService.findAll(merchantId);
  }

  @MerchantOnly()
  @Query(() => MerchantAdCampaign)
  async merchantAdCampaign(
    @Args('id', { type: () => ID }) id: string,
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @CurrentUser() user: User,
  ): Promise<MerchantAdCampaign> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    return this.adCampaignService.findOne(id, merchantId);
  }

  @MerchantOnly()
  @Query(() => [MerchantAdCampaign])
  async activeMerchantAdCampaigns(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @CurrentUser() user: User,
  ): Promise<MerchantAdCampaign[]> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    return this.adCampaignService.getActiveCampaigns(merchantId);
  }

  @MerchantOnly()
  @Query(() => [MerchantAdCampaign])
  async merchantAdCampaignsByType(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @Args('type', { type: () => CampaignType }) type: CampaignType,
    @CurrentUser() user: User,
  ): Promise<MerchantAdCampaign[]> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    return this.adCampaignService.getCampaignsByType(merchantId, type);
  }

  @MerchantOnly()
  @Query(() => [MerchantAdCampaign])
  async merchantAdCampaignsForProduct(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @Args('productId', { type: () => ID }) productId: string,
    @CurrentUser() user: User,
  ): Promise<MerchantAdCampaign[]> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    return this.adCampaignService.getCampaignsForProduct(merchantId, productId);
  }

  @MerchantOnly()
  @Mutation(() => MerchantAdCampaign)
  async createMerchantAdCampaign(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @Args('input') input: CreateAdCampaignInput,
    @CurrentUser() user: User,
  ): Promise<MerchantAdCampaign> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    return this.adCampaignService.create(merchantId, input);
  }

  @MerchantOnly()
  @Mutation(() => MerchantAdCampaign)
  async updateMerchantAdCampaign(
    @Args('id', { type: () => ID }) id: string,
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @Args('input') input: UpdateAdCampaignInput,
    @CurrentUser() user: User,
  ): Promise<MerchantAdCampaign> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    return this.adCampaignService.update(id, merchantId, input);
  }

  @MerchantOnly()
  @Mutation(() => MerchantAdCampaign)
  async updateMerchantAdCampaignStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @Args('status', { type: () => CampaignStatus }) status: CampaignStatus,
    @CurrentUser() user: User,
  ): Promise<MerchantAdCampaign> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    return this.adCampaignService.updateStatus(id, merchantId, status);
  }

  @MerchantOnly()
  @Mutation(() => Boolean)
  async deleteMerchantAdCampaign(
    @Args('id', { type: () => ID }) id: string,
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    return this.adCampaignService.delete(id, merchantId);
  }

  @MerchantOnly()
  @Mutation(() => MerchantAdCampaign)
  async createRetargetingCampaign(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @Args('productIds', { type: () => [ID] }) productIds: string[],
    @Args('budget', { type: () => Number }) budget: number,
    @CurrentUser() user: User,
  ): Promise<MerchantAdCampaign> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    return this.adCampaignService.createRetargetingCampaign(merchantId, productIds, budget);
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
