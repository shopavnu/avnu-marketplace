import { Repository } from 'typeorm';
import { MerchantAnalytics } from '../entities/merchant-analytics.entity';
import { MerchantAnalyticsService } from './merchant-analytics.service';
type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
type AggregationFunction = 'sum' | 'avg' | 'min' | 'max' | 'count';
export declare class MerchantDataAggregationService {
  private readonly analyticsRepository;
  private readonly merchantAnalyticsService;
  private readonly logger;
  constructor(
    analyticsRepository: Repository<MerchantAnalytics>,
    merchantAnalyticsService: MerchantAnalyticsService,
  );
  aggregateMetric(
    merchantId: string,
    metricName: string,
    timeFrame?: TimeFrame,
    aggregationFunction?: AggregationFunction,
    startDate?: Date,
    endDate?: Date,
    productId?: string,
    categoryId?: string,
  ): Promise<any[]>;
  compareTimePeriods(
    merchantId: string,
    metricName: string,
    currentTimeFrame: {
      startDate: Date;
      endDate: Date;
    },
    previousTimeFrame: {
      startDate: Date;
      endDate: Date;
    },
    productId?: string,
    categoryId?: string,
  ): Promise<any>;
  getTimeSeriesData(
    merchantId: string,
    metricName: string,
    timeFrame?: TimeFrame,
    startDate?: Date,
    endDate?: Date,
    productId?: string,
    categoryId?: string,
  ): Promise<any[]>;
  getRollingAverages(
    merchantId: string,
    metricName: string,
    windowSize?: number,
    startDate?: Date,
    endDate?: Date,
    productId?: string,
    categoryId?: string,
  ): Promise<any[]>;
  private getDefaultStartDate;
  private applyAggregation;
}
export {};
