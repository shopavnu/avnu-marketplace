import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreferenceProfile } from '../entities/user-preference-profile.entity';
import { SessionService, SessionInteractionType } from './session.service';
import { SessionInteractionEntity } from '../entities/session-interaction.entity';

/**
 * Service for managing and analyzing user preference profiles
 */
@Injectable()
export class UserPreferenceProfileService {
  private readonly logger = new Logger(UserPreferenceProfileService.name);

  constructor(
    @InjectRepository(UserPreferenceProfile)
    private readonly userPreferenceProfileRepository: Repository<UserPreferenceProfile>,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Get or create a user preference profile
   * @param userId User ID
   */
  async getOrCreateProfile(userId: string): Promise<UserPreferenceProfile> {
    try {
      // Try to find existing profile
      let profile = await this.userPreferenceProfileRepository.findOne({
        where: { userId },
      });

      // Create new profile if not found
      if (!profile) {
        profile = this.userPreferenceProfileRepository.create({
          userId,
          lastUpdated: new Date(),
          hasEnoughData: false,
        });
        await this.userPreferenceProfileRepository.save(profile);
      }

      return profile;
    } catch (error) {
      this.logger.error(`Failed to get or create user preference profile: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update user preference profile based on session data
   * @param userId User ID
   * @param sessionId Session ID
   */
  async updateProfileFromSession(
    userId: string,
    sessionId: string,
  ): Promise<UserPreferenceProfile> {
    try {
      // Get user profile
      const profile = await this.getOrCreateProfile(userId);

      // Get session weights
      const sessionWeights = await this.sessionService.calculateSessionWeights(sessionId);

      // Get recent interactions for this session
      const interactions = await this.sessionService.getRecentInteractions(sessionId, null, 1000);

      // Process interactions to update profile
      await this.processInteractionsForProfile(profile, interactions, sessionWeights);

      return profile;
    } catch (error) {
      this.logger.error(`Failed to update user preference profile: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process interactions to update user preference profile
   * @param profile User preference profile
   * @param interactions Session interactions
   * @param sessionWeights Session weights
   */
  private async processInteractionsForProfile(
    profile: UserPreferenceProfile,
    interactions: SessionInteractionEntity[],
    sessionWeights: Record<string, any>,
  ): Promise<void> {
    try {
      // Initialize counters
      let totalPageViews = profile.totalPageViews || 0;
      let totalProductViews = profile.totalProductViews || 0;
      let totalScrollDepth = 0;
      let scrollDepthCount = 0;
      let totalProductViewTime = 0;
      let productViewCount = 0;
      let productEngagementCount = profile.productEngagementCount || 0;

      // Initialize preference maps
      const categoryPreferences: Record<string, number> = profile.categoryPreferences || {};
      const brandPreferences: Record<string, number> = profile.brandPreferences || {};
      const productPreferences: Record<string, number> = profile.productPreferences || {};
      const viewTimeByCategory: Record<string, number> = profile.viewTimeByCategory || {};
      const viewTimeByBrand: Record<string, number> = profile.viewTimeByBrand || {};
      const scrollDepthByPageType: Record<string, number> = profile.scrollDepthByPageType || {};
      const priceRangePreferences: Record<string, number> = profile.priceRangePreferences || {};

      // Track recently viewed products
      const recentlyViewedProducts: string[] = profile.recentlyViewedProducts || [];

      // Process each interaction
      for (const interaction of interactions) {
        const { type, data } = interaction;

        switch (type) {
          case SessionInteractionType.VIEW:
            totalPageViews++;

            // Track category or brand views
            if (data.type === 'category' && data.categoryId) {
              categoryPreferences[data.categoryId] =
                (categoryPreferences[data.categoryId] || 0) + 1;
            } else if (data.type === 'brand' && data.brandId) {
              brandPreferences[data.brandId] = (brandPreferences[data.brandId] || 0) + 1;
            }
            break;

          case SessionInteractionType.PRODUCT_VIEW:
            totalProductViews++;

            if (data.productId) {
              // Track product view
              productPreferences[data.productId] = (productPreferences[data.productId] || 0) + 1;

              // Add to recently viewed products (maintain uniqueness and max length of 20)
              if (!recentlyViewedProducts.includes(data.productId)) {
                recentlyViewedProducts.unshift(data.productId);
                if (recentlyViewedProducts.length > 20) {
                  recentlyViewedProducts.pop();
                }
              }

              // Track view time
              if (data.viewTimeMs) {
                const viewTimeSeconds = data.viewTimeMs / 1000;
                totalProductViewTime += viewTimeSeconds;
                productViewCount++;

                // Track view time by category
                if (data.categoryId) {
                  viewTimeByCategory[data.categoryId] =
                    (viewTimeByCategory[data.categoryId] || 0) + viewTimeSeconds;
                }

                // Track view time by brand
                if (data.brandId) {
                  viewTimeByBrand[data.brandId] =
                    (viewTimeByBrand[data.brandId] || 0) + viewTimeSeconds;
                }
              }

              // Track price range preferences
              if (data.price) {
                const priceRange = this.getPriceRangeKey(data.price);
                priceRangePreferences[priceRange] = (priceRangePreferences[priceRange] || 0) + 1;
              }
            }
            break;

          case SessionInteractionType.SCROLL_DEPTH:
            if (data.scrollPercentage) {
              totalScrollDepth += data.scrollPercentage;
              scrollDepthCount++;

              // Track scroll depth by page type
              if (data.pageType) {
                // Keep the maximum scroll depth for each page type
                scrollDepthByPageType[data.pageType] = Math.max(
                  scrollDepthByPageType[data.pageType] || 0,
                  data.scrollPercentage,
                );
              }
            }
            break;

          case SessionInteractionType.CLICK:
          case SessionInteractionType.ADD_TO_CART:
          case SessionInteractionType.PURCHASE:
            // Track product engagement
            if (data.productId) {
              productEngagementCount++;

              // Increase product preference weight for high-engagement actions
              const engagementWeight =
                type === SessionInteractionType.CLICK
                  ? 2
                  : type === SessionInteractionType.ADD_TO_CART
                    ? 5
                    : type === SessionInteractionType.PURCHASE
                      ? 10
                      : 1;

              productPreferences[data.productId] =
                (productPreferences[data.productId] || 0) + engagementWeight;

              // Track category and brand preferences from product engagement
              if (data.categoryId) {
                categoryPreferences[data.categoryId] =
                  (categoryPreferences[data.categoryId] || 0) + engagementWeight;
              }

              if (data.brandId) {
                brandPreferences[data.brandId] =
                  (brandPreferences[data.brandId] || 0) + engagementWeight;
              }
            }
            break;
        }
      }

      // Calculate averages
      const averageScrollDepth =
        scrollDepthCount > 0 ? totalScrollDepth / scrollDepthCount : profile.averageScrollDepth;
      const averageProductViewTimeSeconds =
        productViewCount > 0
          ? totalProductViewTime / productViewCount
          : profile.averageProductViewTimeSeconds;

      // Get top viewed categories and brands
      const topViewedCategories = this.getTopItems(categoryPreferences, 10);
      const topViewedBrands = this.getTopItems(brandPreferences, 10);

      // Determine if we have enough data for meaningful personalization
      const hasEnoughData = totalProductViews >= 5 && productEngagementCount >= 3;

      // Update profile
      profile.totalPageViews = totalPageViews;
      profile.totalProductViews = totalProductViews;
      profile.averageScrollDepth = averageScrollDepth;
      profile.averageProductViewTimeSeconds = averageProductViewTimeSeconds;
      profile.productEngagementCount = productEngagementCount;
      profile.topViewedCategories = topViewedCategories;
      profile.topViewedBrands = topViewedBrands;
      profile.recentlyViewedProducts = recentlyViewedProducts;
      profile.categoryPreferences = categoryPreferences;
      profile.brandPreferences = brandPreferences;
      profile.productPreferences = productPreferences;
      profile.viewTimeByCategory = viewTimeByCategory;
      profile.viewTimeByBrand = viewTimeByBrand;
      profile.scrollDepthByPageType = scrollDepthByPageType;
      profile.priceRangePreferences = priceRangePreferences;
      profile.hasEnoughData = hasEnoughData;
      profile.lastUpdated = new Date();

      // Save updated profile
      await this.userPreferenceProfileRepository.save(profile);
    } catch (error) {
      this.logger.error(`Failed to process interactions for profile: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get top items from a preferences map
   * @param preferencesMap Preferences map
   * @param limit Maximum number of items to return
   */
  private getTopItems(preferencesMap: Record<string, number>, limit: number): string[] {
    return Object.entries(preferencesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key]) => key);
  }

  /**
   * Get price range key for a given price
   * @param price Product price
   */
  private getPriceRangeKey(price: number): string {
    if (price < 25) return 'under_25';
    if (price < 50) return '25_to_50';
    if (price < 100) return '50_to_100';
    if (price < 250) return '100_to_250';
    if (price < 500) return '250_to_500';
    return 'over_500';
  }

  /**
   * Get user preference profile
   * @param userId User ID
   */
  async getUserPreferenceProfile(userId: string): Promise<UserPreferenceProfile> {
    try {
      return this.getOrCreateProfile(userId);
    } catch (error) {
      this.logger.error(`Failed to get user preference profile: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get personalized product recommendations based on user profile
   * @param userId User ID
   * @param limit Maximum number of recommendations to return
   */
  async getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<string[]> {
    try {
      const profile = await this.getOrCreateProfile(userId);

      if (!profile.hasEnoughData) {
        this.logger.log(`Not enough data for personalized recommendations for user ${userId}`);
        return [];
      }

      // Get top product preferences
      const topProducts = this.getTopItems(profile.productPreferences || {}, limit);

      return topProducts;
    } catch (error) {
      this.logger.error(`Failed to get personalized recommendations: ${error.message}`);
      return [];
    }
  }
}
