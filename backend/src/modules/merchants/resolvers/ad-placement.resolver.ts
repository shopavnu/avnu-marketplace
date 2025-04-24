import { Resolver, Query, Mutation, Args, ID, Float } from '@nestjs/graphql';
import { AdPlacementService, AdPlacementOptions } from '../services/ad-placement.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { Public } from '../../auth/decorators/public.decorator';
import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';

@ObjectType()
class AdPlacement {
  @Field(() => ID)
  campaignId: string;

  @Field(() => ID)
  merchantId: string;

  @Field(() => [ID])
  productIds: string[];

  @Field()
  type: string;

  @Field(() => Float)
  relevanceScore: number;

  @Field(() => Boolean)
  isSponsored: boolean;

  @Field(() => Float)
  impressionCost: number;
}

@ObjectType()
class ProductAdRecommendation {
  @Field(() => ID)
  productId: string;

  @Field(() => Float)
  recommendedBudget: number;

  @Field(() => Int)
  estimatedImpressions: number;

  @Field(() => Int)
  estimatedClicks: number;

  @Field(() => Int)
  estimatedConversions: number;
}

@InputType()
class AdPlacementOptionsInput {
  @Field(() => String, { nullable: true })
  location?: string;

  @Field(() => [String], { nullable: true })
  interests?: string[];

  @Field(() => [String], { nullable: true })
  demographics?: string[];

  @Field(() => [ID], { nullable: true })
  previouslyViewedProductIds?: string[];

  @Field(() => [ID], { nullable: true })
  cartProductIds?: string[];

  @Field(() => [ID], { nullable: true })
  purchasedProductIds?: string[];

  @Field(() => Int, { nullable: true, defaultValue: 2 })
  maxAds?: number;
}

@Resolver()
export class AdPlacementResolver {
  constructor(private readonly adPlacementService: AdPlacementService) {}

  @Public()
  @Query(() => [AdPlacement])
  async getAdsForDiscoveryFeed(
    @Args('options', { nullable: true }) options?: AdPlacementOptionsInput,
    @CurrentUser() user?: User,
  ): Promise<AdPlacement[]> {
    const placementOptions: AdPlacementOptions = {
      ...options,
      userId: user?.id,
      sessionId: user ? undefined : `anonymous-${Date.now()}`, // Generate a session ID for anonymous users
    };

    return this.adPlacementService.getAdsForDiscoveryFeed(placementOptions);
  }

  @Public()
  @Mutation(() => Boolean)
  async recordAdClick(
    @Args('campaignId', { type: () => ID }) campaignId: string,
    @CurrentUser() user?: User,
  ): Promise<boolean> {
    try {
      await this.adPlacementService.recordAdClick(
        campaignId,
        user?.id,
        user ? undefined : `anonymous-${Date.now()}`, // Generate a session ID for anonymous users
      );
      return true;
    } catch (error) {
      console.error('Error recording ad click:', error);
      return false;
    }
  }

  @Query(() => [ProductAdRecommendation])
  async getRecommendedAdPlacements(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @CurrentUser() user: User,
  ): Promise<ProductAdRecommendation[]> {
    // Note: We're not validating merchant access here because the ad placement service
    // will only return data for the merchant's products anyway
    return this.adPlacementService.getRecommendedPlacements(merchantId);
  }
}
