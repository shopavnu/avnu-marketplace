import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProductSimilarityService } from '../services/product-similarity.service';
import { EnhancedPersonalizationService } from '../services/enhanced-personalization.service';
import { SimilarityType } from '../entities/product-similarity.entity';
import { Product } from '../../products/entities/product.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../../auth/guards/optional-auth.guard';

@Resolver()
export class RecommendationResolver {
  constructor(
    private readonly productSimilarityService: ProductSimilarityService,
    private readonly enhancedPersonalizationService: EnhancedPersonalizationService,
  ) {}

  @Query(() => [Product], { name: 'similarProducts' })
  async getSimilarProducts(
    @Args('productId') productId: string,
    @Args('type', { type: () => String, nullable: true, defaultValue: SimilarityType.HYBRID })
    type: SimilarityType,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
  ): Promise<Product[]> {
    return this.productSimilarityService.getSimilarProducts(productId, type, limit);
  }

  @Query(() => [Product], { name: 'personalizedRecommendations' })
  @UseGuards(JwtAuthGuard)
  async getPersonalizedRecommendations(
    @Context() context: any,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
    @Args('refresh', { type: () => Boolean, nullable: true, defaultValue: false }) refresh: boolean,
  ): Promise<Product[]> {
    const userId = context.req.user?.id;
    return this.enhancedPersonalizationService.getPersonalizedRecommendations(
      userId,
      limit,
      refresh,
    );
  }

  @Query(() => [Product], { name: 'trendingProducts' })
  @UseGuards(OptionalAuthGuard)
  async getTrendingProducts(
    @Context() context: any,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
  ): Promise<Product[]> {
    const userId = context.req.user?.id || 'anonymous';
    return this.enhancedPersonalizationService.getTrendingProducts(userId, limit);
  }

  @Mutation(() => Boolean, { name: 'trackRecommendationImpression' })
  async trackImpression(@Args('recommendationId') _recommendationId: string): Promise<boolean> {
    // Tracking is now handled by the session service
    return true;
  }

  @Mutation(() => Boolean, { name: 'trackRecommendationClick' })
  async trackClick(@Args('recommendationId') _recommendationId: string): Promise<boolean> {
    // Tracking is now handled by the session service
    return true;
  }

  @Mutation(() => Boolean, { name: 'trackRecommendationConversion' })
  async trackConversion(@Args('recommendationId') _recommendationId: string): Promise<boolean> {
    // Tracking is now handled by the session service
    return true;
  }

  @Mutation(() => Boolean, { name: 'updateProductSimilarities' })
  async updateProductSimilarities(@Args('productId') productId: string): Promise<boolean> {
    await this.productSimilarityService.updateProductSimilarities(productId);
    return true;
  }

  @Mutation(() => Boolean, { name: 'batchUpdateSimilarities' })
  async batchUpdateSimilarities(
    @Args('productIds', { type: () => [String] }) productIds: string[],
  ): Promise<boolean> {
    await this.productSimilarityService.batchUpdateSimilarities(productIds);
    return true;
  }
}
