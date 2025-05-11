import { Repository } from 'typeorm';
import { MerchantAnalytics } from '../entities/merchant-analytics.entity';
import { MerchantAnalyticsService } from './merchant-analytics.service';
import { ProductService } from '../../products/services';
type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export declare class MerchantDashboardAnalyticsService {
  private readonly analyticsRepository;
  private readonly merchantAnalyticsService;
  private readonly productService;
  private readonly logger;
  constructor(
    analyticsRepository: Repository<MerchantAnalytics>,
    merchantAnalyticsService: MerchantAnalyticsService,
    productService: ProductService,
  );
  getDashboardAnalytics(
    merchantId: string,
    timeFrame?: TimeFrame,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any>;
  private calculateSummaryMetrics;
  getPerformanceOverTime(
    merchantId: string,
    timeFrame?: TimeFrame,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any>;
  getConversionFunnel(
    merchantId: string,
    timeFrame?: TimeFrame,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any>;
  getOrganicVsPaidPerformance(
    merchantId: string,
    timeFrame?: TimeFrame,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any>;
  getPeriodComparisonData(
    merchantId: string,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    previousPeriodStart: Date,
    previousPeriodEnd: Date,
    productIds?: string[],
    categoryIds?: string[],
  ): Promise<any>;
}
export {};
