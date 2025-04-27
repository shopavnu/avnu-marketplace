import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRecommendation, RecommendationType } from '../entities/product-recommendation.entity';
import { RecommendationConfig, RecommendationAlgorithmType } from '../entities/recommendation-config.entity';
import { ProductSimilarityService } from './product-similarity.service';
import { SimilarityType } from '../entities/product-similarity.entity';
import { UserPreferenceProfileService } from '../../personalization/services/user-preference-profile.service';
import { UserPreferenceProfile } from '../../personalization/entities/user-preference-profile.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductService } from '../../products/services';

/**
 * Service for personalizing product rankings based on user preferences
 */
@Injectable()
export class PersonalizedRankingService {
  private readonly logger = new Logger(PersonalizedRankingService.name);

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
   * Generate personalized product recommendations for a user
   * @param userId User ID
   * @param limit Maximum number of recommendations to return
   * @param algorithmId Specific algorithm ID to use (optional)
   */
  async generatePersonalizedRecommendations(
    userId: string,
    limit: number = 10,
    algorithmId?: string
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
              supportedRecommendationTypes: 'personalized' 
            },
            order: { version: 'DESC' }
          });

      if (!algorithm) {
        throw new Error('No active recommendation algorithm found');
      }

      // Generate recommendations based on algorithm type
      let recommendations: ProductRecommendation[] = [];
      
      switch (algorithm.algorithmType) {
        case 'content_based':
          recommendations = await this.generateContentBasedRecommendations(userId, userProfile, algorithm.id, limit);
          break;
        case 'collaborative_filtering':
          recommendations = await this.generateCollaborativeFilteringRecommendations(userId, userProfile, algorithm.id, limit);
          break;
        case 'hybrid':
          recommendations = await this.generateHybridRecommendations(userId, userProfile, algorithm.id, limit);
          break;
        default:
          recommendations = await this.generateContentBasedRecommendations(userId, userProfile, algorithm.id, limit);
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
    userId: string,
    userProfile: UserPreferenceProfile,
    algorithmId: string,
    limit: number
  ): Promise<ProductRecommendation[]> {
    // Get top categories and brands from user profile
    const topCategories = userProfile.topViewedCategories || [];
    const topBrands = userProfile.topViewedBrands || [];
    
    // Get products from top categories and brands
    const categoryProductsResult = await this.productService.findAll({
      limit: 50,
      page: 1
    });
    
    const brandProductsResult = await this.productService.findAll({
      limit: 50,
      page: 1
    });
    
    // Combine products and remove duplicates
    const combinedProducts = [...categoryProductsResult.items, ...brandProductsResult.items];
    const uniqueProducts = Array.from(new Map(combinedProducts.map(product => [product.id, product])).values());
    
    // Score products based on user preferences
    const scoredProducts = uniqueProducts.map(product => {
      let score = 0;
      
      // Category score
      if (product.categories) {
        for (const category of product.categories) {
          if (userProfile.categoryPreferences?.[category]) {
            score += userProfile.categoryPreferences[category] * 0.4 / product.categories.length;
          }
        }
      }
      
      // Brand score
      if (product.brandName && userProfile.brandPreferences?.[product.brandName]) {
        score += userProfile.brandPreferences[product.brandName] * 0.3;
      }
      
      // Price range score
      const priceRange = this.getPriceRangeKey(product.price);
      if (userProfile.priceRangePreferences?.[priceRange]) {
        score += userProfile.priceRangePreferences[priceRange] * 0.2;
      }
      
      // Product view score
      if (userProfile.productPreferences?.[product.id]) {
        score += userProfile.productPreferences[product.id] * 0.1;
      }
      
      return { product, score };
    });
    
    // Sort by score and limit
    scoredProducts.sort((a, b) => b.score - a.score);
    const topProducts = scoredProducts.slice(0, limit);
    
    // Create recommendations
    return topProducts.map((item, index) => {
      return this.productRecommendationRepository.create({
        userId,
        productId: item.product.id,
        recommendationType: RecommendationType.PERSONALIZED,
        algorithmId,
        score: item.score,
        position: index,
        metadata: {
          categoryScore: item.product.categories && item.product.categories.length > 0 && 
            userProfile.categoryPreferences?.[item.product.categories[0]] 
            ? userProfile.categoryPreferences[item.product.categories[0]] : 0,
          brandScore: item.product.brandName && userProfile.brandPreferences?.[item.product.brandName]
            ? userProfile.brandPreferences[item.product.brandName] : 0,
          priceRangeScore: userProfile.priceRangePreferences?.[this.getPriceRangeKey(item.product.price)] || 0,
          productViewScore: userProfile.productPreferences?.[item.product.id] || 0
        }
      });
    });
  }

  /**
   * Generate collaborative filtering recommendations
   * @param userId User ID
   * @param userProfile User preference profile
   * @param algorithmId Algorithm ID
   * @param limit Maximum number of recommendations
   */
  private async generateCollaborativeFilteringRecommendations(
    userId: string,
    userProfile: UserPreferenceProfile,
    algorithmId: string,
    limit: number
  ): Promise<ProductRecommendation[]> {
    // Get recently viewed products
    const recentlyViewedProducts = userProfile.recentlyViewedProducts || [];
    
    if (recentlyViewedProducts.length === 0) {
      return this.generateContentBasedRecommendations(userId, userProfile, algorithmId, limit);
    }
    
    // Get similar products for each recently viewed product
    const similarProductsPromises = recentlyViewedProducts.slice(0, 5).map(productId => 
      this.productSimilarityService.getSimilarProducts(productId, SimilarityType.VIEW_BASED, 10)
    );
    
    const similarProductsArrays = await Promise.all(similarProductsPromises);
    
    // Flatten and score products
    const productScoreMap = new Map<string, { product: Product; score: number; sources: string[] }>();
    
    similarProductsArrays.forEach((products, sourceIndex) => {
      const sourceProductId = recentlyViewedProducts[sourceIndex];
      const recencyWeight = 1 - (sourceIndex * 0.2); // More recent = higher weight
      
      products.forEach((product, productIndex) => {
        const positionWeight = 1 - (productIndex * 0.1); // Higher position = higher weight
        const score = recencyWeight * positionWeight;
        
        if (productScoreMap.has(product.id)) {
          const existing = productScoreMap.get(product.id)!;
          existing.score += score;
          existing.sources.push(sourceProductId);
        } else {
          productScoreMap.set(product.id, { 
            product, 
            score, 
            sources: [sourceProductId] 
          });
        }
      });
    });
    
    // Convert to array, sort by score, and limit
    const scoredProducts = Array.from(productScoreMap.values());
    scoredProducts.sort((a, b) => b.score - a.score);
    const topProducts = scoredProducts.slice(0, limit);
    
    // Create recommendations
    return topProducts.map((item, index) => {
      return this.productRecommendationRepository.create({
        userId,
        productId: item.product.id,
        recommendationType: RecommendationType.PERSONALIZED,
        algorithmId,
        score: item.score,
        position: index,
        metadata: {
          sources: item.sources,
          collaborativeScore: item.score
        }
      });
    });
  }

  /**
   * Generate hybrid recommendations combining multiple approaches
   * @param userId User ID
   * @param userProfile User preference profile
   * @param algorithmId Algorithm ID
   * @param limit Maximum number of recommendations
   */
  private async generateHybridRecommendations(
    userId: string,
    userProfile: UserPreferenceProfile,
    algorithmId: string,
    limit: number
  ): Promise<ProductRecommendation[]> {
    // Get recommendations from both methods
    const contentBasedRecs = await this.generateContentBasedRecommendations(
      userId, userProfile, algorithmId, limit * 2
    );
    
    const collaborativeRecs = await this.generateCollaborativeFilteringRecommendations(
      userId, userProfile, algorithmId, limit * 2
    );
    
    // Combine and score
    const productScoreMap = new Map<string, { 
      productId: string; 
      score: number; 
      contentScore: number;
      collaborativeScore: number;
    }>();
    
    // Content-based recommendations (60% weight)
    contentBasedRecs.forEach(rec => {
      productScoreMap.set(rec.productId, {
        productId: rec.productId,
        score: rec.score * 0.6,
        contentScore: rec.score,
        collaborativeScore: 0
      });
    });
    
    // Collaborative recommendations (40% weight)
    collaborativeRecs.forEach(rec => {
      if (productScoreMap.has(rec.productId)) {
        const existing = productScoreMap.get(rec.productId)!;
        existing.score += rec.score * 0.4;
        existing.collaborativeScore = rec.score;
      } else {
        productScoreMap.set(rec.productId, {
          productId: rec.productId,
          score: rec.score * 0.4,
          contentScore: 0,
          collaborativeScore: rec.score
        });
      }
    });
    
    // Convert to array, sort by score, and limit
    const scoredProducts = Array.from(productScoreMap.values());
    scoredProducts.sort((a, b) => b.score - a.score);
    const topProducts = scoredProducts.slice(0, limit);
    
    // Create recommendations
    return topProducts.map((item, index) => {
      return this.productRecommendationRepository.create({
        userId,
        productId: item.productId,
        recommendationType: RecommendationType.PERSONALIZED,
        algorithmId,
        score: item.score,
        position: index,
        metadata: {
          contentScore: item.contentScore,
          collaborativeScore: item.collaborativeScore,
          weights: {
            content: 0.6,
            collaborative: 0.4
          }
        }
      });
    });
  }

  /**
   * Generate popularity-based recommendations (fallback)
   * @param userId User ID
   * @param limit Maximum number of recommendations
   */
  private async generatePopularityBasedRecommendations(
    userId: string,
    limit: number
  ): Promise<ProductRecommendation[]> {
    // Get active popularity algorithm
    const algorithm = await this.recommendationConfigRepository.findOne({
      where: {
        isActive: true,
        algorithmType: RecommendationAlgorithmType.POPULARITY_BASED
      },
      order: { version: 'DESC' }
    });

    if (!algorithm) {
      throw new Error('No active popularity-based algorithm found');
    }

    // Get popular products
    const popularProductsResult = await this.productService.findAll({
      limit,
      page: 1
    });
    
    // Create recommendations
    return popularProductsResult.items.map((product, index) => {
      return this.productRecommendationRepository.create({
        userId,
        productId: product.id,
        recommendationType: RecommendationType.TRENDING,
        algorithmId: algorithm.id,
        score: 1 - (index / popularProductsResult.items.length), // Normalize score between 0 and 1
        position: index,
        metadata: {
          fallback: true,
          reason: 'insufficient_user_data'
        }
      });
    });
  }

  /**
   * Get personalized recommendations for a user
   * @param userId User ID
   * @param limit Maximum number of recommendations to return
   * @param refresh Whether to refresh recommendations
   */
  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 10,
    refresh: boolean = false
  ): Promise<Product[]> {
    try {
      let recommendations: ProductRecommendation[];
      
      if (refresh) {
        // Generate new recommendations
        recommendations = await this.generatePersonalizedRecommendations(userId, limit);
      } else {
        // Get existing recommendations
        recommendations = await this.productRecommendationRepository.find({
          where: {
            userId,
            recommendationType: RecommendationType.PERSONALIZED
          },
          order: {
            score: 'DESC'
          },
          take: limit
        });
        
        // Generate if none exist
        if (recommendations.length === 0) {
          recommendations = await this.generatePersonalizedRecommendations(userId, limit);
        }
      }
      
      // Get product details
      const productIds = recommendations.map(rec => rec.productId);
      const products = await this.productService.findByIds(productIds);
      
      // Sort products by recommendation score
      const productMap = new Map(products.map(product => [product.id, product]));
      return recommendations
        .map(rec => productMap.get(rec.productId))
        .filter(product => !!product) as Product[];
    } catch (error) {
      this.logger.error(`Failed to get personalized recommendations: ${error.message}`);
      throw error;
    }
  }

  /**
   * Track recommendation impression
   * @param recommendationId Recommendation ID
   */
  async trackImpression(recommendationId: string): Promise<void> {
    try {
      const recommendation = await this.productRecommendationRepository.findOne({
        where: { id: recommendationId }
      });
      
      if (!recommendation) {
        throw new Error(`Recommendation with ID ${recommendationId} not found`);
      }
      
      // Update impression count
      recommendation.impressions += 1;
      
      // Update CTR if there are clicks
      if (recommendation.clicks > 0) {
        recommendation.clickThroughRate = recommendation.clicks / recommendation.impressions;
      }
      
      await this.productRecommendationRepository.save(recommendation);
      
      // Update algorithm impression count
      const algorithm = await this.recommendationConfigRepository.findOne({
        where: { id: recommendation.algorithmId }
      });
      
      if (algorithm) {
        algorithm.totalImpressions += 1;
        await this.recommendationConfigRepository.save(algorithm);
      }
    } catch (error) {
      this.logger.error(`Failed to track impression: ${error.message}`);
    }
  }

  /**
   * Track recommendation click
   * @param recommendationId Recommendation ID
   */
  async trackClick(recommendationId: string): Promise<void> {
    try {
      const recommendation = await this.productRecommendationRepository.findOne({
        where: { id: recommendationId }
      });
      
      if (!recommendation) {
        throw new Error(`Recommendation with ID ${recommendationId} not found`);
      }
      
      // Update click count
      recommendation.clicks += 1;
      
      // Update CTR
      if (recommendation.impressions > 0) {
        recommendation.clickThroughRate = recommendation.clicks / recommendation.impressions;
      }
      
      await this.productRecommendationRepository.save(recommendation);
      
      // Update algorithm click count
      const algorithm = await this.recommendationConfigRepository.findOne({
        where: { id: recommendation.algorithmId }
      });
      
      if (algorithm) {
        algorithm.totalClicks += 1;
        await this.recommendationConfigRepository.save(algorithm);
      }
    } catch (error) {
      this.logger.error(`Failed to track click: ${error.message}`);
    }
  }

  /**
   * Track recommendation conversion
   * @param recommendationId Recommendation ID
   */
  async trackConversion(recommendationId: string): Promise<void> {
    try {
      const recommendation = await this.productRecommendationRepository.findOne({
        where: { id: recommendationId }
      });
      
      if (!recommendation) {
        throw new Error(`Recommendation with ID ${recommendationId} not found`);
      }
      
      // Update conversion count
      recommendation.conversions += 1;
      
      // Update conversion rate
      if (recommendation.impressions > 0) {
        recommendation.conversionRate = recommendation.conversions / recommendation.impressions;
      }
      
      await this.productRecommendationRepository.save(recommendation);
      
      // Update algorithm conversion count
      const algorithm = await this.recommendationConfigRepository.findOne({
        where: { id: recommendation.algorithmId }
      });
      
      if (algorithm) {
        algorithm.totalConversions += 1;
        await this.recommendationConfigRepository.save(algorithm);
      }
    } catch (error) {
      this.logger.error(`Failed to track conversion: ${error.message}`);
    }
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
}
