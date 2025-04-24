import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { MerchantAnalytics } from '../entities/merchant-analytics.entity';

type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

@Injectable()
export class MerchantRevenueAnalyticsService {
  private readonly logger = new Logger(MerchantRevenueAnalyticsService.name);

  constructor(
    @InjectRepository(MerchantAnalytics)
    private readonly analyticsRepository: Repository<MerchantAnalytics>,
  ) {
    // Initialize logger
    this.logger = new Logger(MerchantRevenueAnalyticsService.name);
  }

  /**
   * Get revenue time series data by specified time frame
   * @param merchantId The merchant ID
   * @param timeFrame The time frame for data aggregation
   * @param startDate Optional start date for custom date range
   * @param endDate Optional end date for custom date range
   */
  async getRevenueByTimeFrame(
    merchantId: string,
    timeFrame: TimeFrame = 'monthly',
    startDate?: Date,
    endDate?: Date,
  ) {
    try {
      // Set default date range if not provided
      if (!startDate) {
        startDate = new Date();
        switch (timeFrame) {
          case 'weekly':
            startDate.setDate(startDate.getDate() - 12 * 7); // Last 12 weeks
            break;
          case 'monthly':
            startDate.setMonth(startDate.getMonth() - 12); // Last 12 months
            break;
          case 'quarterly':
            startDate.setMonth(startDate.getMonth() - 12 * 4); // Last 4 quarters (12 months)
            break;
          case 'yearly':
            startDate.setFullYear(startDate.getFullYear() - 5); // Last 5 years
            break;
          default:
            startDate.setMonth(startDate.getMonth() - 6); // Default to 6 months
        }
      }

      if (!endDate) {
        endDate = new Date();
      }

      // Get analytics data
      const analytics = await this.analyticsRepository.find({
        where: {
          merchantId,
          timeFrame,
          date: Between(startDate, endDate),
          productId: null,
          categoryId: null,
        },
        order: { date: 'ASC' },
      });

      // Format data for time series
      return analytics.map(record => ({
        date: record.date,
        value: record.revenue,
      }));
    } catch (error) {
      this.logger.error(`Failed to get revenue by time frame: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get cart abandonment rate over time
   * @param merchantId The merchant ID
   * @param timeFrame The time frame for data aggregation
   * @param startDate Optional start date for custom date range
   * @param endDate Optional end date for custom date range
   */
  async getCartAbandonmentRateOverTime(
    merchantId: string,
    timeFrame: TimeFrame = 'monthly',
    startDate?: Date,
    endDate?: Date,
  ) {
    try {
      // Set default dates similar to getRevenueByTimeFrame
      if (!startDate) {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
      }

      if (!endDate) {
        endDate = new Date();
      }

      // Get analytics data
      const analytics = await this.analyticsRepository.find({
        where: {
          merchantId,
          timeFrame,
          date: Between(startDate, endDate),
          productId: null,
          categoryId: null,
        },
        order: { date: 'ASC' },
      });

      // Calculate abandonment rate for each time period
      return analytics.map(record => {
        const totalCarts = record.addToCarts || 0;
        const abandonedCarts = record.abandonedCarts || 0;
        const abandonmentRate = totalCarts > 0 ? (abandonedCarts / totalCarts) * 100 : 0;

        return {
          date: record.date,
          value: abandonmentRate,
        };
      });
    } catch (error) {
      this.logger.error(`Failed to get cart abandonment rate over time: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get organic vs paid impressions over time
   * @param merchantId The merchant ID
   * @param timeFrame The time frame for data aggregation
   * @param startDate Optional start date for custom date range
   * @param endDate Optional end date for custom date range
   */
  async getImpressionsBySourceOverTime(
    merchantId: string,
    timeFrame: TimeFrame = 'monthly',
    startDate?: Date,
    endDate?: Date,
  ) {
    try {
      // Set default dates
      if (!startDate) {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
      }

      if (!endDate) {
        endDate = new Date();
      }

      // Get analytics data
      const analytics = await this.analyticsRepository.find({
        where: {
          merchantId,
          timeFrame,
          date: Between(startDate, endDate),
          productId: null,
          categoryId: null,
        },
        order: { date: 'ASC' },
      });

      // Format data for time series with organic and paid values
      return analytics.map(record => ({
        date: record.date,
        organic: record.organicImpressions || 0,
        paid: record.paidImpressions || 0,
        total: (record.organicImpressions || 0) + (record.paidImpressions || 0),
      }));
    } catch (error) {
      this.logger.error(`Failed to get impressions by source over time: ${error.message}`);
      throw error;
    }
  }
}
