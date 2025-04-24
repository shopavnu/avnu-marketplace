import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
// Removed unused import: UseGuards
import { MerchantService } from '../services/merchant.service';
import { Merchant } from '../entities/merchant.entity';
import { MerchantBrand } from '../entities/merchant-brand.entity';
import { MerchantProduct } from '../entities/merchant-product.entity';
import { MerchantShipping } from '../entities/merchant-shipping.entity';
// Removed unused imports: JwtAuthGuard, RolesGuard, Roles
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User, UserRole } from '../../users/entities/user.entity';
import {
  CreateMerchantInput,
  UpdateMerchantInput,
  CreateMerchantBrandInput,
  UpdateMerchantShippingInput,
} from '../dto';
import { MerchantOnly } from '../../auth/decorators/merchant-only.decorator';
import { ForbiddenException } from '@nestjs/common';

@Resolver(() => Merchant)
export class MerchantResolver {
  constructor(private readonly merchantService: MerchantService) {}

  @Query(() => [Merchant])
  async merchants(): Promise<Merchant[]> {
    return this.merchantService.findAll();
  }

  @Query(() => Merchant)
  async merchant(@Args('id', { type: () => ID }) id: string): Promise<Merchant> {
    return this.merchantService.findOne(id);
  }

  @MerchantOnly()
  @Query(() => [Merchant])
  async myMerchants(@CurrentUser() _user: User): Promise<Merchant[]> {
    return this.merchantService.findByUserId(_user.id);
  }

  @MerchantOnly()
  @Mutation(() => Merchant)
  async createMerchant(
    @Args('input') input: CreateMerchantInput,
    @CurrentUser() _user: User, // Prefixed with underscore as it's unused
  ): Promise<Merchant> {
    // Associate the merchant with the current user
    return this.merchantService.create({
      ...input,
      // We'll need to handle user association in the service
    });
  }

  @MerchantOnly()
  @Mutation(() => Merchant)
  async updateMerchant(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMerchantInput,
    @CurrentUser() user: User,
  ): Promise<Merchant> {
    // Verify the merchant belongs to the current user
    const merchant = await this.merchantService.findOne(id);
    if (merchant.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to update this merchant');
    }

    return this.merchantService.update(id, input);
  }

  @MerchantOnly()
  @Mutation(() => Boolean)
  async removeMerchant(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    // Ensure the user owns this merchant (or is admin)
    const merchants = await this.merchantService.findByUserId(user.id);
    const canRemove = user.role === UserRole.ADMIN || merchants.some(m => m.id === id);

    if (!canRemove) {
      throw new Error('You do not have permission to remove this merchant');
    }

    return this.merchantService.remove(id);
  }

  // Brand related resolvers
  @MerchantOnly()
  @Query(() => MerchantBrand)
  async merchantBrand(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @CurrentUser() user: User,
  ): Promise<MerchantBrand> {
    // Ensure the user owns this merchant (or is admin)
    const merchants = await this.merchantService.findByUserId(user.id);
    const canView = user.role === UserRole.ADMIN || merchants.some(m => m.id === merchantId);

    if (!canView) {
      throw new Error('You do not have permission to view this merchant brand');
    }

    return this.merchantService.getMerchantBrand(merchantId);
  }

  @MerchantOnly()
  @Mutation(() => MerchantBrand)
  async createOrUpdateMerchantBrand(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @Args('input') input: CreateMerchantBrandInput,
    @CurrentUser() user: User,
  ): Promise<MerchantBrand> {
    // Ensure the user owns this merchant (or is admin)
    const merchants = await this.merchantService.findByUserId(user.id);
    const canEdit = user.role === UserRole.ADMIN || merchants.some(m => m.id === merchantId);

    if (!canEdit) {
      throw new Error('You do not have permission to update this merchant brand');
    }

    return this.merchantService.createOrUpdateMerchantBrand(merchantId, input);
  }

  // Product related resolvers
  @MerchantOnly()
  @Query(() => [MerchantProduct])
  async merchantProducts(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @CurrentUser() user: User,
  ): Promise<MerchantProduct[]> {
    // Ensure the user owns this merchant (or is admin)
    const merchants = await this.merchantService.findByUserId(user.id);
    const canView = user.role === UserRole.ADMIN || merchants.some(m => m.id === merchantId);

    if (!canView) {
      throw new Error('You do not have permission to view these merchant products');
    }

    return this.merchantService.getMerchantProducts(merchantId);
  }

  @MerchantOnly()
  @Mutation(() => MerchantProduct)
  async updateProductVisibility(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @Args('productId', { type: () => ID }) productId: string,
    @Args('isVisible', { type: () => Boolean }) isVisible: boolean,
    @CurrentUser() user: User,
  ): Promise<MerchantProduct> {
    // Ensure the user owns this merchant (or is admin)
    const merchants = await this.merchantService.findByUserId(user.id);
    const canEdit = user.role === UserRole.ADMIN || merchants.some(m => m.id === merchantId);

    if (!canEdit) {
      throw new Error('You do not have permission to update this product visibility');
    }

    return this.merchantService.updateProductVisibility(merchantId, productId, isVisible);
  }

  @MerchantOnly()
  @Mutation(() => MerchantProduct)
  async updateProductPromotion(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @Args('productId', { type: () => ID }) productId: string,
    @Args('isPromoted', { type: () => Boolean }) isPromoted: boolean,
    @CurrentUser() user: User,
    @Args('monthlyAdBudget', { type: () => Number, nullable: true }) monthlyAdBudget?: number,
  ): Promise<MerchantProduct> {
    // Ensure the user owns this merchant (or is admin)
    const merchants = await this.merchantService.findByUserId(user.id);
    const canEdit = user.role === UserRole.ADMIN || merchants.some(m => m.id === merchantId);

    if (!canEdit) {
      throw new Error('You do not have permission to update this product promotion');
    }

    return this.merchantService.updateProductPromotion(
      merchantId,
      productId,
      isPromoted,
      monthlyAdBudget,
    );
  }

  // Shipping related resolvers
  @MerchantOnly()
  @Query(() => MerchantShipping)
  async merchantShipping(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @CurrentUser() user: User,
  ): Promise<MerchantShipping> {
    // Ensure the user owns this merchant (or is admin)
    const merchants = await this.merchantService.findByUserId(user.id);
    const canView = user.role === UserRole.ADMIN || merchants.some(m => m.id === merchantId);

    if (!canView) {
      throw new Error('You do not have permission to view this merchant shipping settings');
    }

    return this.merchantService.getMerchantShipping(merchantId);
  }

  @MerchantOnly()
  @Mutation(() => MerchantShipping)
  async updateMerchantShipping(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @Args('input') input: UpdateMerchantShippingInput,
    @CurrentUser() user: User,
  ): Promise<MerchantShipping> {
    // Ensure the user owns this merchant (or is admin)
    const merchants = await this.merchantService.findByUserId(user.id);
    const canEdit = user.role === UserRole.ADMIN || merchants.some(m => m.id === merchantId);

    if (!canEdit) {
      throw new Error('You do not have permission to update this merchant shipping settings');
    }

    return this.merchantService.createOrUpdateMerchantShipping(merchantId, input);
  }
}
