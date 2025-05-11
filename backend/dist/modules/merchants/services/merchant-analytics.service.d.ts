import { Repository } from 'typeorm';
import { MerchantAnalytics } from '../entities/merchant-analytics.entity';
type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export declare class MerchantAnalyticsService {
  private analyticsRepository;
  constructor(analyticsRepository: Repository<MerchantAnalytics>);
  getAnalytics(
    merchantId: string,
    timeFrame?: TimeFrame,
    startDate?: Date,
    endDate?: Date,
    productId?: string,
    categoryId?: string,
  ): Promise<MerchantAnalytics[]>;
  getProductAnalytics(
    merchantId: string,
    productId: string,
    timeFrame?: TimeFrame,
    startDate?: Date,
    endDate?: Date,
  ): Promise<MerchantAnalytics[]>;
  getCategoryAnalytics(
    merchantId: string,
    categoryId: string,
    timeFrame?: TimeFrame,
    startDate?: Date,
    endDate?: Date,
  ): Promise<MerchantAnalytics[]>;
  getOverallAnalytics(
    merchantId: string,
    timeFrame?: TimeFrame,
    startDate?: Date,
    endDate?: Date,
  ): Promise<MerchantAnalytics[]>;
  getDemographicData(merchantId: string, timeFrame?: TimeFrame): Promise<Record<string, number>>;
  getTopProducts(
    merchantId: string,
    limit?: number,
    timeFrame?: TimeFrame,
  ): Promise<
    {
      productId: string;
      revenue: number;
      orders: number;
    }[]
  >;
  recordProductView(
    merchantId: string,
    productId: string,
    isOrganic?: boolean,
    demographics?: string[],
  ): Promise<void>;
  recordProductClick(
    merchantId: string,
    productId: string,
    _isOrganic?: boolean,
    demographics?: string[],
  ): Promise<void>;
  recordAddToCart(merchantId: string, productId: string, demographics?: string[]): Promise<void>;
  recordAbandonedCart(
    merchantId: string,
    productId: string,
    demographics?: string[],
  ): Promise<void>;
  recordPurchase(
    merchantId: string,
    productId: string,
    revenue: number,
    demographics?: string[],
  ): Promise<void>;
  private updateDailyAnalytics;
  private updateAnalyticsRecord;
  private updateTimeFrameAggregates;
  private getCategoryForProduct;
}
export {};
