import { Repository } from 'typeorm';
import { ProductRecommendation } from '../entities/product-recommendation.entity';
import { RecommendationConfig } from '../entities/recommendation-config.entity';
import { ProductSimilarityService } from './product-similarity.service';
import { UserPreferenceProfileService } from '../../personalization/services/user-preference-profile.service';
import { Product } from '../../products/entities/product.entity';
import { ProductService } from '../../products/services';
export declare class EnhancedPersonalizationService {
  private readonly productRecommendationRepository;
  private readonly recommendationConfigRepository;
  private readonly productSimilarityService;
  private readonly userPreferenceProfileService;
  private readonly productService;
  private readonly logger;
  constructor(
    productRecommendationRepository: Repository<ProductRecommendation>,
    recommendationConfigRepository: Repository<RecommendationConfig>,
    productSimilarityService: ProductSimilarityService,
    userPreferenceProfileService: UserPreferenceProfileService,
    productService: ProductService,
  );
  getPersonalizedRecommendations(
    userId: string,
    limit?: number,
    refresh?: boolean,
    excludePurchased?: boolean,
    freshness?: number,
  ): Promise<Product[]>;
  getTrendingProducts(
    userId: string,
    limit?: number,
    excludePurchased?: boolean,
  ): Promise<Product[]>;
  private processRecommendations;
  private generatePersonalizedRecommendations;
  private generateContentBasedRecommendations;
  private generateCollaborativeFilteringRecommendations;
  private generateHybridRecommendations;
  private generatePopularityBasedRecommendations;
  private getUserPurchasedProducts;
  private getRecentlyViewedProducts;
}
