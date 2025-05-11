import { Repository } from 'typeorm';
import { ProductSimilarity, SimilarityType } from '../entities/product-similarity.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductService } from '../../products/services/product.service';
import { UserBehaviorService } from '../../personalization/services/user-behavior.service';
export declare class ProductSimilarityService {
  private readonly productSimilarityRepository;
  private readonly productService;
  private readonly userBehaviorService;
  private readonly logger;
  constructor(
    productSimilarityRepository: Repository<ProductSimilarity>,
    productService: ProductService,
    userBehaviorService: UserBehaviorService,
  );
  calculateAttributeBasedSimilarity(
    productId: string,
    limit?: number,
  ): Promise<ProductSimilarity[]>;
  private calculateProductAttributeSimilarity;
  private getMatchedAttributes;
  private hasCommonElements;
  private getCommonElements;
  private hasCommonKeywords;
  private extractKeywords;
  calculateViewBasedSimilarity(productId: string, _limit?: number): Promise<ProductSimilarity[]>;
  calculateHybridSimilarity(productId: string, limit?: number): Promise<ProductSimilarity[]>;
  getSimilarProducts(
    productId: string,
    similarityType?: SimilarityType,
    limit?: number,
  ): Promise<Product[]>;
  updateProductSimilarities(productId: string): Promise<void>;
  batchUpdateSimilarities(productIds: string[]): Promise<void>;
}
