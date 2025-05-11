import { ProductSimilarityService } from '../services/product-similarity.service';
import { EnhancedPersonalizationService } from '../services/enhanced-personalization.service';
import { SimilarityType } from '../entities/product-similarity.entity';
import { Product } from '../../products/entities/product.entity';
export declare class RecommendationResolver {
  private readonly productSimilarityService;
  private readonly enhancedPersonalizationService;
  constructor(
    productSimilarityService: ProductSimilarityService,
    enhancedPersonalizationService: EnhancedPersonalizationService,
  );
  getSimilarProducts(productId: string, type: SimilarityType, limit: number): Promise<Product[]>;
  getPersonalizedRecommendations(context: any, limit: number, refresh: boolean): Promise<Product[]>;
  getTrendingProducts(context: any, limit: number): Promise<Product[]>;
  trackImpression(_recommendationId: string): Promise<boolean>;
  trackClick(_recommendationId: string): Promise<boolean>;
  trackConversion(_recommendationId: string): Promise<boolean>;
  updateProductSimilarities(productId: string): Promise<boolean>;
  batchUpdateSimilarities(productIds: string[]): Promise<boolean>;
}
