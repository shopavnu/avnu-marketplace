import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { ForbiddenException } from '@nestjs/common';
import { MerchantAnalyticsService } from '../services/merchant-analytics.service';
import { MerchantService } from '../services/merchant.service';
import { MerchantAnalytics } from '../entities/merchant-analytics.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { MerchantOnly } from '../../auth/decorators/merchant-only.decorator';
import { User, UserRole } from '../../users/entities/user.entity';
import { GraphQLISODateTime } from '@nestjs/graphql';

@Resolver(() => MerchantAnalytics)
export class MerchantAnalyticsResolver {
  constructor(
    private readonly analyticsService: MerchantAnalyticsService,
    private readonly merchantService: MerchantService,
  ) {}

  @MerchantOnly()
  @Query(() => [MerchantAnalytics])
  async merchantAnalytics(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @CurrentUser() user: User,
    @Args('timeFrame', { defaultValue: 'monthly' }) timeFrame: string,
    @Args('startDate', { type: () => GraphQLISODateTime, nullable: true }) startDate?: Date,
    @Args('endDate', { type: () => GraphQLISODateTime, nullable: true }) endDate?: Date,
    @Args('productId', { type: () => ID, nullable: true }) productId?: string,
    @Args('categoryId', { type: () => ID, nullable: true }) categoryId?: string,
  ): Promise<MerchantAnalytics[]> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    return this.analyticsService.getAnalytics(
      merchantId,
      timeFrame as any,
      startDate,
      endDate,
      productId,
      categoryId,
    );
  }

  @MerchantOnly()
  @Query(() => [MerchantAnalytics])
  async merchantProductAnalytics(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @Args('productId', { type: () => ID }) productId: string,
    @CurrentUser() user: User,
    @Args('timeFrame', { defaultValue: 'monthly' }) timeFrame: string,
    @Args('startDate', { type: () => GraphQLISODateTime, nullable: true }) startDate?: Date,
    @Args('endDate', { type: () => GraphQLISODateTime, nullable: true }) endDate?: Date,
  ): Promise<MerchantAnalytics[]> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    return this.analyticsService.getProductAnalytics(
      merchantId,
      productId,
      timeFrame as any,
      startDate,
      endDate,
    );
  }

  @MerchantOnly()
  @Query(() => [MerchantAnalytics])
  async merchantCategoryAnalytics(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @Args('categoryId', { type: () => ID }) categoryId: string,
    @CurrentUser() user: User,
    @Args('timeFrame', { defaultValue: 'monthly' }) timeFrame: string,
    @Args('startDate', { type: () => GraphQLISODateTime, nullable: true }) startDate?: Date,
    @Args('endDate', { type: () => GraphQLISODateTime, nullable: true }) endDate?: Date,
  ): Promise<MerchantAnalytics[]> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    return this.analyticsService.getCategoryAnalytics(
      merchantId,
      categoryId,
      timeFrame as any,
      startDate,
      endDate,
    );
  }

  @MerchantOnly()
  @Query(() => [MerchantAnalytics])
  async merchantOverallAnalytics(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @CurrentUser() user: User,
    @Args('timeFrame', { defaultValue: 'monthly' }) timeFrame: string,
    @Args('startDate', { type: () => GraphQLISODateTime, nullable: true }) startDate?: Date,
    @Args('endDate', { type: () => GraphQLISODateTime, nullable: true }) endDate?: Date,
  ): Promise<MerchantAnalytics[]> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    return this.analyticsService.getOverallAnalytics(
      merchantId,
      timeFrame as any,
      startDate,
      endDate,
    );
  }

  @MerchantOnly()
  @Query(() => Object)
  async merchantDemographicData(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @Args('timeFrame', { defaultValue: 'monthly' }) timeFrame: string,
    @CurrentUser() user: User,
  ): Promise<Record<string, number>> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    return this.analyticsService.getDemographicData(merchantId, timeFrame as any);
  }

  @MerchantOnly()
  @Query(() => [Object])
  async merchantTopProducts(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @Args('limit', { defaultValue: 10 }) limit: number,
    @Args('timeFrame', { defaultValue: 'monthly' }) timeFrame: string,
    @CurrentUser() user: User,
  ): Promise<{ productId: string; revenue: number; orders: number }[]> {
    // Ensure the user owns this merchant (or is admin)
    await this.validateMerchantAccess(user, merchantId);

    return this.analyticsService.getTopProducts(merchantId, limit, timeFrame as any);
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
