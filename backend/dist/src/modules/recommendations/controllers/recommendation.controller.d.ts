import { ProductSimilarityService } from '../services/product-similarity.service';
import { EnhancedPersonalizationService } from '../services/enhanced-personalization.service';
import { SimilarityType } from '../entities/product-similarity.entity';
interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isMerchant: boolean;
    merchantId?: string;
  };
}
export declare class RecommendationController {
  private readonly productSimilarityService;
  private readonly enhancedPersonalizationService;
  private readonly logger;
  constructor(
    productSimilarityService: ProductSimilarityService,
    enhancedPersonalizationService: EnhancedPersonalizationService,
  );
  getSimilarProducts(
    productId: string,
    type?: SimilarityType,
    limit?: number,
  ): Promise<{
    success: boolean;
    data: import('../../products').Product[];
    meta: {
      count: number;
      similarityType: SimilarityType;
    };
  }>;
  getPersonalizedRecommendations(
    req: RequestWithUser,
    limit?: number,
    refresh?: boolean,
    excludePurchased?: boolean,
    freshness?: number,
  ): Promise<{
    success: boolean;
    data: import('../../products').Product[];
    meta: {
      count: number;
      refresh: boolean;
    };
  }>;
  getTrendingProducts(
    req: RequestWithUser,
    limit?: number,
    excludePurchased?: boolean,
  ): Promise<{
    success: boolean;
    data: import('../../products').Product[];
    meta: {
      count: number;
    };
  }>;
  trackImpression(_recommendationId: string): Promise<{
    success: boolean;
    message: string;
  }>;
  trackClick(_recommendationId: string): Promise<{
    success: boolean;
    message: string;
  }>;
  trackConversion(_recommendationId: string): Promise<{
    success: boolean;
    message: string;
  }>;
  updateProductSimilarities(productId: string): Promise<{
    success: boolean;
    message: string;
  }>;
  batchUpdateSimilarities(body: { productIds: string[] }): Promise<{
    success: boolean;
    message: string;
    meta: {
      count: number;
    };
  }>;
}
export {};
