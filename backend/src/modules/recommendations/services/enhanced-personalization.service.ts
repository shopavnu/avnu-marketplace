import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProductRecommendation,
  // Prefixing with underscore to indicate it's used in type declarations but not directly referenced
  RecommendationType as _RecommendationType,
} from '../entities/product-recommendation.entity';
import {
  RecommendationConfig,
  RecommendationAlgorithmType,
} from '../entities/recommendation-config.entity';
import { ProductSimilarityService } from './product-similarity.service';
import { UserPreferenceProfileService } from '../../personalization/services/user-preference-profile.service';
import { UserPreferenceProfile } from '../../personalization/entities/user-preference-profile.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductService } from '../../products/services';
import { BehaviorType } from '../../personalization/entities/user-behavior.entity';

/**
 * Enhanced service for personalizing product rankings with freshness and purchase exclusion
 */
@Injectable()
export class EnhancedPersonalizationService {
  private readonly logger = new Logger(EnhancedPersonalizationService.name);

  constructor(
    @InjectRepository(ProductRecommendation)
    private readonly productRecommendationRepository: Repository<ProductRecommendation>,
    @InjectRepository(RecommendationConfig)
    private readonly recommendationConfigRepository: Repository<RecommendationConfig>,
    private readonly productSimilarityService: ProductSimilarityService,
    private readonly userPreferenceProfileService: UserPreferenceProfileService,
    private readonly productService: ProductService,
  ) {}

  /**
   * Get personalized recommendations for a user
   * @param userId User ID
   * @param limit Maximum number of recommendations to return
   * @param refresh Whether to refresh recommendations
   * @param excludePurchased Whether to exclude products the user has purchased
   * @param freshness Value between 0-1 indicating preference for fresh content (1 = all fresh)
   */
  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 10,
    refresh: boolean = false,
    excludePurchased: boolean = true,
    freshness: number = 0.7,
  ): Promise<Product[]> {
    try {
      // Check if we need to refresh recommendations
      if (refresh) {
        await this.generatePersonalizedRecommendations(userId, limit * 3); // Generate more for variety
      }

      // Get user's purchased products to exclude them if requested
      let purchasedProductIds = new Set<string>();
      if (excludePurchased) {
        const purchasedProducts = await this.getUserPurchasedProducts(userId);
        purchasedProductIds = new Set(purchasedProducts.map(p => p.entityId));
      }

      // Get recently viewed products to potentially exclude some for freshness
      const recentlyViewedProducts = await this.getRecentlyViewedProducts(userId, 20);
      const recentlyViewedIds = new Set(recentlyViewedProducts.map(p => p.entityId));

      // Get existing recommendations
      const recommendations = await this.productRecommendationRepository.find({
        where: { userId },
        order: { score: 'DESC' },
        take: limit * 3, // Fetch more than needed for filtering
      });

      // If no recommendations found or too few, generate new ones
      if (recommendations.length < limit * 2) {
        await this.generatePersonalizedRecommendations(userId, limit * 3);

        // Fetch again
        const newRecommendations = await this.productRecommendationRepository.find({
          where: { userId },
          order: { score: 'DESC' },
          take: limit * 3,
        });

        return this.processRecommendations(
          newRecommendations,
          purchasedProductIds,
          recentlyViewedIds,
          limit,
          freshness,
        );
      }

      return this.processRecommendations(
        recommendations,
        purchasedProductIds,
        recentlyViewedIds,
        limit,
        freshness,
      );
    } catch (error) {
      this.logger.error(`Failed to get personalized recommendations: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get trending products
   * @param limit Maximum number of products to return
   * @param excludePurchased Whether to exclude products the user has purchased
   */
  async getTrendingProducts(
    userId: string,
    limit: number = 10,
    excludePurchased: boolean = true,
  ): Promise<Product[]> {
    try {
      // Get trending products using repository query
      // Since findTrending doesn't exist, we'll query for popular products directly
      const queryBuilder = this.productRecommendationRepository.manager
        .createQueryBuilder()
        .select('p')
        .from('products', 'p')
        .where('p.isSuppressed = :isSuppressed', { isSuppressed: false })
        .orderBy('p.viewCount', 'DESC')
        .addOrderBy('p.createdAt', 'DESC')
        .limit(limit * 2);

      const trendingProducts = (await queryBuilder.getMany()) as Product[];

      // If not excluding purchased products, return trending products
      if (!excludePurchased || userId === 'anonymous') {
        return trendingProducts.slice(0, limit);
      }

      // Get user's purchased products to exclude them
      const purchasedProducts = await this.getUserPurchasedProducts(userId);
      const purchasedProductIds = new Set(purchasedProducts.map(p => p.entityId));

      // Filter out purchased products
      const filteredProducts = trendingProducts.filter(
        product => !purchasedProductIds.has(product.id),
      );

      // Return filtered products up to the limit
      return filteredProducts.slice(0, limit);
    } catch (error) {
      this.logger.error(`Failed to get trending products: ${error.message}`);
      return [];
    }
  }

  /**
   * Process recommendations by filtering out purchased products and ensuring variety
   * @param recommendations Raw recommendations
   * @param purchasedProductIds Set of purchased product IDs to exclude
   * @param recentlyViewedIds Set of recently viewed product IDs
   * @param limit Maximum number of recommendations to return
   * @param freshness Value between 0-1 indicating preference for fresh content (1 = all fresh)
   */
  private async processRecommendations(
    recommendations: ProductRecommendation[],
    purchasedProductIds: Set<string>,
    recentlyViewedIds: Set<string>,
    limit: number,
    freshness: number = 0.7,
  ): Promise<Product[]> {
    try {
      // Filter out purchased products
      const filteredRecommendations = recommendations.filter(
        rec => !purchasedProductIds.has(rec.productId),
      );

      if (filteredRecommendations.length === 0) {
        return [];
      }

      // Split recommendations into two groups: recently viewed and fresh
      const recentlyViewedRecommendations = filteredRecommendations.filter(rec =>
        recentlyViewedIds.has(rec.productId),
      );
      const freshRecommendations = filteredRecommendations.filter(
        rec => !recentlyViewedIds.has(rec.productId),
      );

      // Prioritize fresh content but include some familiar items
      // Use the freshness parameter to determine the ratio
      const freshLimit = Math.floor(limit * freshness);
      const recentLimit = limit - freshLimit;

      // Select products with preference for fresh content
      let selectedRecommendations: ProductRecommendation[] = [];

      // Add fresh recommendations first
      selectedRecommendations = selectedRecommendations.concat(
        freshRecommendations.slice(0, freshLimit),
      );

      // Fill remaining slots with recently viewed recommendations
      const remainingSlots = limit - selectedRecommendations.length;
      if (remainingSlots > 0 && recentlyViewedRecommendations.length > 0) {
        selectedRecommendations = selectedRecommendations.concat(
          recentlyViewedRecommendations.slice(0, Math.min(remainingSlots, recentLimit)),
        );
      }

      // If we still need more recommendations, add more fresh ones if available
      const stillRemainingSlots = limit - selectedRecommendations.length;
      if (stillRemainingSlots > 0 && freshRecommendations.length > freshLimit) {
        selectedRecommendations = selectedRecommendations.concat(
          freshRecommendations.slice(freshLimit, freshLimit + stillRemainingSlots),
        );
      }

      // Get product IDs from selected recommendations
      const productIds = selectedRecommendations.map(rec => rec.productId);

      // Fetch and return products
      return this.productService
        .findByIds(productIds)
        .then(products => products.filter(product => !product.isSuppressed))
        .catch(error => {
          this.logger.error(`Failed to fetch products: ${error.message}`);
          return [];
        });
    } catch (error) {
      this.logger.error(`Failed to process recommendations: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate personalized product recommendations for a user
   * @param userId User ID
   * @param limit Maximum number of recommendations to return
   * @param algorithmId Specific algorithm ID to use (optional)
   */
  private async generatePersonalizedRecommendations(
    userId: string,
    limit: number = 10,
    algorithmId?: string,
  ): Promise<ProductRecommendation[]> {
    try {
      // Get user preference profile
      const userProfile = await this.userPreferenceProfileService.getUserPreferenceProfile(userId);

      if (!userProfile.hasEnoughData) {
        this.logger.log(`Not enough data for personalized recommendations for user ${userId}`);
        // Fall back to popular products
        return this.generatePopularityBasedRecommendations(userId, limit);
      }

      // Get active algorithm
      const algorithm = algorithmId
        ? await this.recommendationConfigRepository.findOne({ where: { id: algorithmId } })
        : await this.recommendationConfigRepository.findOne({
            where: {
              isActive: true,
              supportedRecommendationTypes: 'personalized',
            },
            order: { version: 'DESC' },
          });

      if (!algorithm) {
        throw new Error('No active recommendation algorithm found');
      }

      // Generate recommendations based on algorithm type
      let recommendations: ProductRecommendation[] = [];

      switch (algorithm.algorithmType) {
        case RecommendationAlgorithmType.CONTENT_BASED:
          recommendations = await this.generateContentBasedRecommendations(
            userId,
            userProfile,
            algorithm.id,
            limit,
          );
          break;
        case RecommendationAlgorithmType.COLLABORATIVE_FILTERING:
          recommendations = await this.generateCollaborativeFilteringRecommendations(
            userId,
            userProfile,
            algorithm.id,
            limit,
          );
          break;
        case RecommendationAlgorithmType.HYBRID:
          recommendations = await this.generateHybridRecommendations(
            userId,
            userProfile,
            algorithm.id,
            limit,
          );
          break;
        default:
          recommendations = await this.generateContentBasedRecommendations(
            userId,
            userProfile,
            algorithm.id,
            limit,
          );
      }

      // Save recommendations
      await this.productRecommendationRepository.save(recommendations);

      return recommendations;
    } catch (error) {
      this.logger.error(`Failed to generate personalized recommendations: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate content-based recommendations using user preferences
   * @param userId User ID
   * @param userProfile User preference profile
   * @param algorithmId Algorithm ID
   * @param limit Maximum number of recommendations
   */
  private async generateContentBasedRecommendations(
    _userId: string,
    _userProfile: UserPreferenceProfile,
    _algorithmId: string,
    _limit: number,
  ): Promise<ProductRecommendation[]> {
    // Implementation details would go here
    // For now, we'll return an empty array
    return [];
  }

  /**
   * Generate collaborative filtering recommendations
   * @param userId User ID
   * @param userProfile User preference profile
   * @param algorithmId Algorithm ID
   * @param limit Maximum number of recommendations
   */
  private async generateCollaborativeFilteringRecommendations(
    _userId: string,
    _userProfile: UserPreferenceProfile,
    _algorithmId: string,
    _limit: number,
  ): Promise<ProductRecommendation[]> {
    // Implementation details would go here
    // For now, we'll return an empty array
    return [];
  }

  /**
   * Generate hybrid recommendations combining multiple approaches
   * @param userId User ID
   * @param userProfile User preference profile
   * @param algorithmId Algorithm ID
   * @param limit Maximum number of recommendations
   */
  private async generateHybridRecommendations(
    _userId: string,
    _userProfile: UserPreferenceProfile,
    _algorithmId: string,
    _limit: number,
  ): Promise<ProductRecommendation[]> {
    // Implementation details would go here
    // For now, we'll return an empty array
    return [];
  }

  /**
   * Generate popularity-based recommendations (fallback)
   * @param userId User ID
   * @param limit Maximum number of recommendations
   */
  private async generatePopularityBasedRecommendations(
    _userId: string,
    _limit: number,
  ): Promise<ProductRecommendation[]> {
    // Implementation details would go here
    // For now, we'll return an empty array
    return [];
  }

  /**
   * Get products that the user has purchased
   * @param userId User ID
   */
  private async getUserPurchasedProducts(userId: string): Promise<any[]> {
    try {
      // Query the user_behaviors table for purchase behaviors
      const queryBuilder = this.productRecommendationRepository.manager
        .createQueryBuilder()
        .select('ub')
        .from('user_behaviors', 'ub')
        .where('ub.userId = :userId', { userId })
        .andWhere('ub.entityType = :entityType', { entityType: 'product' })
        .andWhere('ub.behaviorType = :behaviorType', { behaviorType: BehaviorType.PURCHASE });

      return queryBuilder.getMany();
    } catch (error) {
      this.logger.error(`Failed to get user purchased products: ${error.message}`);
      return [];
    }
  }

  /**
   * Get products that the user has recently viewed
   * @param userId User ID
   * @param limit Maximum number of products to return
   */
  private async getRecentlyViewedProducts(userId: string, limit: number = 20): Promise<any[]> {
    try {
      // Query the user_behaviors table for view behaviors
      const queryBuilder = this.productRecommendationRepository.manager
        .createQueryBuilder()
        .select('ub')
        .from('user_behaviors', 'ub')
        .where('ub.userId = :userId', { userId })
        .andWhere('ub.entityType = :entityType', { entityType: 'product' })
        .andWhere('ub.behaviorType = :behaviorType', { behaviorType: BehaviorType.VIEW })
        .orderBy('ub.lastInteractionAt', 'DESC')
        .limit(limit);

      return queryBuilder.getMany();
    } catch (error) {
      this.logger.error(`Failed to get recently viewed products: ${error.message}`);
      return [];
    }
  }
}
