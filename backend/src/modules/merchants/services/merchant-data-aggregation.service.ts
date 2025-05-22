import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, _IsNull, _Not, FindOptionsWhere, _In, _Raw } from 'typeorm';
import { MerchantAnalytics } from '../entities/merchant-analytics.entity';
import { MerchantAnalyticsService } from './merchant-analytics.service';

type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
type AggregationFunction = 'sum' | 'avg' | 'min' | 'max' | 'count';

@Injectable()
export class MerchantDataAggregationService {
  private readonly logger = new Logger(MerchantDataAggregationService.name);

  constructor(
    @InjectRepository(MerchantAnalytics)
    private readonly analyticsRepository: Repository<MerchantAnalytics>,
    private readonly merchantAnalyticsService: MerchantAnalyticsService,
  ) {}

  /**
   * Aggregate data for a specific metric over time
   * @param merchantId The merchant ID
   * @param metricName The metric to aggregate (revenue, orders, etc.)
   * @param timeFrame The time frame for aggregation
   * @param aggregationFunction The aggregation function to apply
   * @param startDate Optional start date
   * @param endDate Optional end date
   * @param productId Optional product ID filter
   * @param categoryId Optional category ID filter
   */
  async aggregateMetric(
    merchantId: string,
    metricName: string,
    timeFrame: TimeFrame = 'monthly',
    aggregationFunction: AggregationFunction = 'sum',
    startDate?: Date,
    endDate?: Date,
    productId?: string,
    categoryId?: string,
  ): Promise<any[]> {
    try {
      if (!startDate) {
        startDate = this.getDefaultStartDate(timeFrame);
      }

      if (!endDate) {
        endDate = new Date();
      }

      // Build base query conditions
      const whereConditions: FindOptionsWhere<MerchantAnalytics> = {
        merchantId,
        timeFrame,
        date: Between(startDate, endDate),
      };

      // Add optional filters
      if (productId) {
        whereConditions.productId = productId;
      }

      if (categoryId) {
        whereConditions.categoryId = categoryId;
      }

      // Get the data
      const analytics = await this.analyticsRepository.find({
        where: whereConditions,
        order: { date: 'ASC' },
      });

      // Apply aggregation function
      return this.applyAggregation(analytics, metricName, aggregationFunction);
    } catch (error) {
      this.logger.error(
        `Failed to aggregate metric ${metricName} for merchant ${merchantId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Compare metrics across different time periods
   * @param merchantId The merchant ID
   * @param metricName The metric to compare
   * @param currentTimeFrame The current time frame
   * @param previousTimeFrame The previous time frame to compare against
   * @param productId Optional product ID filter
   * @param categoryId Optional category ID filter
   */
  async compareTimePeriods(
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
  ): Promise<any> {
    try {
      // Get current period data
      const currentPeriodData = await this.aggregateMetric(
        merchantId,
        metricName,
        'daily', // Use daily for most granular data
        'sum',
        currentTimeFrame.startDate,
        currentTimeFrame.endDate,
        productId,
        categoryId,
      );

      // Get previous period data
      const previousPeriodData = await this.aggregateMetric(
        merchantId,
        metricName,
        'daily', // Use daily for most granular data
        'sum',
        previousTimeFrame.startDate,
        previousTimeFrame.endDate,
        productId,
        categoryId,
      );

      // Calculate totals
      const currentTotal = currentPeriodData.reduce((sum, item) => sum + item.value, 0);
      const previousTotal = previousPeriodData.reduce((sum, item) => sum + item.value, 0);

      // Calculate change
      const absoluteChange = currentTotal - previousTotal;
      const percentageChange =
        previousTotal !== 0 ? (absoluteChange / previousTotal) * 100 : currentTotal > 0 ? 100 : 0;

      return {
        currentPeriod: {
          startDate: currentTimeFrame.startDate,
          endDate: currentTimeFrame.endDate,
          total: currentTotal,
          data: currentPeriodData,
        },
        previousPeriod: {
          startDate: previousTimeFrame.startDate,
          endDate: previousTimeFrame.endDate,
          total: previousTotal,
          data: previousPeriodData,
        },
        change: {
          absolute: absoluteChange,
          percentage: percentageChange,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to compare time periods for metric ${metricName} for merchant ${merchantId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get data aggregated by time buckets (e.g., by hour, day, week, month)
   * @param merchantId The merchant ID
   * @param metricName The metric to aggregate
   * @param timeFrame The time frame to use
   * @param startDate Start date
   * @param endDate End date
   * @param productId Optional product ID filter
   * @param categoryId Optional category ID filter
   */
  async getTimeSeriesData(
    merchantId: string,
    metricName: string,
    timeFrame: TimeFrame = 'daily',
    startDate?: Date,
    endDate?: Date,
    productId?: string,
    categoryId?: string,
  ): Promise<any[]> {
    try {
      if (!startDate) {
        startDate = this.getDefaultStartDate(timeFrame);
      }

      if (!endDate) {
        endDate = new Date();
      }

      // Build base query conditions
      const whereConditions: FindOptionsWhere<MerchantAnalytics> = {
        merchantId,
        timeFrame,
        date: Between(startDate, endDate),
      };

      // Add optional filters
      if (productId) {
        whereConditions.productId = productId;
      }

      if (categoryId) {
        whereConditions.categoryId = categoryId;
      }

      // Get the data
      const analytics = await this.analyticsRepository.find({
        where: whereConditions,
        order: { date: 'ASC' },
      });

      // Format for time series
      return analytics.map(record => ({
        date: record.date,
        value: record[metricName] || 0,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get time series data for metric ${metricName} for merchant ${merchantId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get rolling averages for a metric
   * @param merchantId The merchant ID
   * @param metricName The metric to analyze
   * @param windowSize The size of the rolling window (in days)
   * @param startDate Start date
   * @param endDate End date
   * @param productId Optional product ID filter
   * @param categoryId Optional category ID filter
   */
  async getRollingAverages(
    merchantId: string,
    metricName: string,
    windowSize: number = 7,
    startDate?: Date,
    endDate?: Date,
    productId?: string,
    categoryId?: string,
  ): Promise<any[]> {
    try {
      // Get daily data
      const dailyData = await this.getTimeSeriesData(
        merchantId,
        metricName,
        'daily',
        startDate,
        endDate,
        productId,
        categoryId,
      );

      // Calculate rolling averages
      const rollingAverages = [];

      for (let i = windowSize - 1; i < dailyData.length; i++) {
        const windowData = dailyData.slice(i - windowSize + 1, i + 1);
        const sum = windowData.reduce((total, item) => total + item.value, 0);
        const average = sum / windowSize;

        rollingAverages.push({
          date: dailyData[i].date,
          value: average,
          rawValue: dailyData[i].value,
        });
      }

      return rollingAverages;
    } catch (error) {
      this.logger.error(
        `Failed to get rolling averages for metric ${metricName} for merchant ${merchantId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get default start date based on time frame
   * @param timeFrame The time frame
   */
  private getDefaultStartDate(timeFrame: TimeFrame): Date {
    const startDate = new Date();

    switch (timeFrame) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 30); // Last 30 days
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 90); // Last ~12 weeks
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 12); // Last 12 months
        break;
      case 'quarterly':
        startDate.setMonth(startDate.getMonth() - 24); // Last 8 quarters
        break;
      case 'yearly':
        startDate.setFullYear(startDate.getFullYear() - 5); // Last 5 years
        break;
    }

    return startDate;
  }

  /**
   * Apply aggregation function to data
   * @param data The data to aggregate
   * @param metricName The metric to aggregate
   * @param aggregationFunction The aggregation function to apply
   */
  private applyAggregation(
    data: MerchantAnalytics[],
    metricName: string,
    aggregationFunction: AggregationFunction,
  ): any[] {
    // Group data by date
    const groupedByDate = data.reduce((groups, item) => {
      const date = item.date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
      return groups;
    }, {});

    // Apply aggregation function to each group
    return Object.entries(groupedByDate)
      .map(([date, items]) => {
        const values = (items as MerchantAnalytics[]).map(item => item[metricName] || 0);

        let aggregatedValue = 0;
        switch (aggregationFunction) {
          case 'sum':
            aggregatedValue = values.reduce((sum, val) => sum + val, 0);
            break;
          case 'avg':
            aggregatedValue =
              values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
            break;
          case 'min':
            aggregatedValue = values.length > 0 ? Math.min(...values) : 0;
            break;
          case 'max':
            aggregatedValue = values.length > 0 ? Math.max(...values) : 0;
            break;
          case 'count':
            aggregatedValue = values.length;
            break;
        }

        return {
          date: new Date(date),
          value: aggregatedValue,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}
