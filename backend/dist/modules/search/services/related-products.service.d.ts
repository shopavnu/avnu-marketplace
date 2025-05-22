import { ElasticsearchService } from './elasticsearch.service';
import { PersonalizationService } from '../../personalization/services/personalization.service';
export declare class RelatedProductsService {
  private readonly elasticsearchService;
  private readonly personalizationService;
  private readonly logger;
  constructor(
    elasticsearchService: ElasticsearchService,
    personalizationService: PersonalizationService,
  );
  getRelatedProducts(
    productId: string,
    userId?: string,
    options?: {
      limit?: number;
      categoryWeight?: number;
      tagWeight?: number;
      valueWeight?: number;
      brandWeight?: number;
      priceRangeWeight?: number;
      includeOutOfStock?: boolean;
    },
  ): Promise<any>;
  getComplementaryProducts(productId: string, userId?: string, limit?: number): Promise<any>;
  getFrequentlyBoughtTogether(productId: string, limit?: number): Promise<any>;
  private applyPersonalization;
  private determineMatchFactors;
  private ensureDiversity;
  private getComplementaryCategories;
}
