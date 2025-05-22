import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Category } from '../../categories/entities/category.entity';
export declare class ProductSuppressionAnalyticsService {
  private readonly productRepository;
  private readonly merchantRepository;
  private readonly categoryRepository;
  private readonly logger;
  constructor(
    productRepository: Repository<Product>,
    merchantRepository: Repository<Merchant>,
    categoryRepository: Repository<Category>,
  );
  getSuppressionMetrics(
    period?: number,
    merchantId?: string,
  ): Promise<{
    overview: {
      totalSuppressedProducts: number;
      totalActiveSuppressedProducts: number;
      totalResolvedSuppressions: number;
      avgResolutionTimeHours: number;
      suppressionRate: number;
    };
    byMerchant: {
      merchantId: any;
      merchantName: string;
      suppressedCount: number;
      resolvedCount: number;
      avgResolutionTimeHours: number;
      suppressionRate: number;
    }[];
    byCategory: {
      categoryId: any;
      categoryName: string;
      suppressedCount: number;
      resolvedCount: number;
      avgResolutionTimeHours: number;
      suppressionRate: number;
    }[];
    byTimeframe: {
      date: any;
      suppressedCount: number;
      resolvedCount: number;
      avgResolutionTimeHours: number;
      suppressionRate: number;
    }[];
    resolutionTimeDistribution: {
      timeRange: any;
      count: number;
      percentage: number;
    }[];
  }>;
  private getOverviewMetrics;
  private getMerchantMetrics;
  private getCategoryMetrics;
  private getTimeframeMetrics;
  private getResolutionTimeDistribution;
}
