import { Repository } from 'typeorm';
import { MerchantAnalytics } from '../entities/merchant-analytics.entity';
type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export declare class MerchantRevenueAnalyticsService {
  private readonly analyticsRepository;
  private readonly logger;
  constructor(analyticsRepository: Repository<MerchantAnalytics>);
  getRevenueByTimeFrame(
    merchantId: string,
    timeFrame?: TimeFrame,
    startDate?: Date,
    endDate?: Date,
  ): Promise<
    {
      date: Date;
      value: number;
    }[]
  >;
  getCartAbandonmentRateOverTime(
    merchantId: string,
    timeFrame?: TimeFrame,
    startDate?: Date,
    endDate?: Date,
  ): Promise<
    {
      date: Date;
      value: number;
    }[]
  >;
  getImpressionsBySourceOverTime(
    merchantId: string,
    timeFrame?: TimeFrame,
    startDate?: Date,
    endDate?: Date,
  ): Promise<
    {
      date: Date;
      organic: number;
      paid: number;
      total: number;
    }[]
  >;
}
export {};
