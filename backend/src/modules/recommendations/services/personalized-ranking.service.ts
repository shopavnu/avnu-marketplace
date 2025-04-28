import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { UserPreferenceProfile } from '../../personalization/entities/user-preference-profile.entity';
import { UserPreferenceProfileService } from '../../personalization/services/user-preference-profile.service';

/**
 * Service for personalized product ranking
 * @deprecated Use EnhancedPersonalizationService instead
 */
@Injectable()
export class PersonalizedRankingService {
  private readonly logger = new Logger(PersonalizedRankingService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly userPreferenceProfileService: UserPreferenceProfileService,
  ) {}

  /**
   * Get personalized product recommendations for a user
   * @param userId User ID
   * @param limit Maximum number of recommendations to return
   * @param excludePurchased Whether to exclude purchased products
   * @param freshness Freshness factor (0-1) where 1 means all fresh recommendations
   */
  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 10,
    excludePurchased: boolean = true,
    freshness: number = 0.7,
  ): Promise<Product[]> {
    try {
      // Get user preference profile
      const profile = await this.userPreferenceProfileService.getUserPreferenceProfile(userId);

      if (!profile || !profile.hasEnoughData) {
        this.logger.log(`Not enough data for personalized recommendations for user ${userId}`);
        return this.getTrendingProducts(limit);
      }

      // Get top categories and brands from user profile
      const _topCategories = profile.topViewedCategories || [];
      const _topBrands = profile.topViewedBrands || [];

      // Query for products matching user preferences
      const query = this.productRepository.createQueryBuilder('product');

      // Apply filters based on user preferences
      if (profile.topViewedCategories && profile.topViewedCategories.length > 0) {
        query.andWhere('product.categories && ARRAY[:...categories]', {
          categories: profile.topViewedCategories,
        });
      }

      if (profile.topViewedBrands && profile.topViewedBrands.length > 0) {
        query.orWhere('product.brandName IN (:...brands)', {
          brands: profile.topViewedBrands,
        });
      }

      // Exclude purchased products if requested
      if (excludePurchased) {
        // In a real implementation, we would join with the orders table
        // For now, we'll just exclude products the user has viewed more than 3 times
        if (profile.productPreferences) {
          const frequentlyViewedProductIds = Object.entries(profile.productPreferences)
            .filter(([_, count]) => count > 3)
            .map(([id]) => id);

          if (frequentlyViewedProductIds.length > 0) {
            query.andWhere('product.id NOT IN (:...excludedIds)', {
              excludedIds: frequentlyViewedProductIds,
            });
          }
        }
      }

      // Order by relevance score (simplified implementation)
      query.orderBy('RANDOM()');
      query.take(Math.ceil(limit * (1 - freshness))); // Get (1-freshness)% of results from user preferences

      const preferenceBasedProducts = await query.getMany();

      // If we need more products to meet the limit, get trending products
      if (preferenceBasedProducts.length < limit) {
        const remainingCount = limit - preferenceBasedProducts.length;
        const trendingProducts = await this.getTrendingProducts(remainingCount);

        // Combine preference-based and trending products
        return [...preferenceBasedProducts, ...trendingProducts];
      }

      return preferenceBasedProducts;
    } catch (error) {
      this.logger.error(`Failed to get personalized recommendations: ${error.message}`);
      return this.getTrendingProducts(limit);
    }
  }

  /**
   * Get trending products
   * @param limit Maximum number of products to return
   */
  private async getTrendingProducts(limit: number = 10): Promise<Product[]> {
    try {
      // In a real implementation, we would use view counts, purchase counts, etc.
      // For now, we'll just get random products
      return this.productRepository
        .createQueryBuilder('product')
        .orderBy('RANDOM()')
        .take(limit)
        .getMany();
    } catch (error) {
      this.logger.error(`Failed to get trending products: ${error.message}`);
      return [];
    }
  }
}
