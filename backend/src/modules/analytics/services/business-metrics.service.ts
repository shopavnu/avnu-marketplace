import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BusinessMetrics, MetricType, TimeGranularity } from '../entities/business-metrics.entity';

@Injectable()
export class BusinessMetricsService {
  private readonly logger = new Logger(BusinessMetricsService.name);

  constructor(
    @InjectRepository(BusinessMetrics)
    private readonly businessMetricsRepository: Repository<BusinessMetrics>,
  ) {}

  /**
   * Record a business metric
   * @param data Business metric data
   */
  async recordMetric(data: Partial<BusinessMetrics>): Promise<BusinessMetrics> {
    try {
      const businessMetric = this.businessMetricsRepository.create(data);
      return this.businessMetricsRepository.save(businessMetric);
    } catch (error) {
      this.logger.error(`Failed to record business metric: ${error.message}`);
      throw error;
    }
  }

  /**
   * Record revenue metric
   * @param value Revenue amount
   * @param periodStart Period start date
   * @param periodEnd Period end date
   * @param timeGranularity Time granularity
   * @param dimension1 Optional dimension 1 (e.g., merchant ID)
   * @param dimension2 Optional dimension 2 (e.g., category)
   * @param dimension3 Optional dimension 3 (e.g., product type)
   */
  async recordRevenue(
    value: number,
    periodStart: Date,
    periodEnd: Date,
    timeGranularity: TimeGranularity = TimeGranularity.DAILY,
    dimension1?: string,
    dimension2?: string,
    dimension3?: string,
  ): Promise<BusinessMetrics> {
    return this.recordMetric({
      metricType: MetricType.REVENUE,
      value,
      periodStart,
      periodEnd,
      timeGranularity,
      dimension1,
      dimension2,
      dimension3,
    });
  }

  /**
   * Record orders metric
   * @param count Order count
   * @param periodStart Period start date
   * @param periodEnd Period end date
   * @param timeGranularity Time granularity
   * @param dimension1 Optional dimension 1 (e.g., merchant ID)
   * @param dimension2 Optional dimension 2 (e.g., category)
   * @param dimension3 Optional dimension 3 (e.g., product type)
   */
  async recordOrders(
    count: number,
    periodStart: Date,
    periodEnd: Date,
    timeGranularity: TimeGranularity = TimeGranularity.DAILY,
    dimension1?: string,
    dimension2?: string,
    dimension3?: string,
  ): Promise<BusinessMetrics> {
    return this.recordMetric({
      metricType: MetricType.ORDERS,
      value: 0, // Not used for order count
      count,
      periodStart,
      periodEnd,
      timeGranularity,
      dimension1,
      dimension2,
      dimension3,
    });
  }

  /**
   * Record average order value metric
   * @param value Average order value
   * @param periodStart Period start date
   * @param periodEnd Period end date
   * @param timeGranularity Time granularity
   * @param dimension1 Optional dimension 1 (e.g., merchant ID)
   * @param dimension2 Optional dimension 2 (e.g., category)
   * @param dimension3 Optional dimension 3 (e.g., product type)
   */
  async recordAverageOrderValue(
    value: number,
    periodStart: Date,
    periodEnd: Date,
    timeGranularity: TimeGranularity = TimeGranularity.DAILY,
    dimension1?: string,
    dimension2?: string,
    dimension3?: string,
  ): Promise<BusinessMetrics> {
    return this.recordMetric({
      metricType: MetricType.AOV,
      value,
      periodStart,
      periodEnd,
      timeGranularity,
      dimension1,
      dimension2,
      dimension3,
    });
  }

  /**
   * Record conversion rate metric
   * @param value Conversion rate (0-1)
   * @param periodStart Period start date
   * @param periodEnd Period end date
   * @param timeGranularity Time granularity
   * @param dimension1 Optional dimension 1 (e.g., merchant ID)
   * @param dimension2 Optional dimension 2 (e.g., category)
   * @param dimension3 Optional dimension 3 (e.g., product type)
   */
  async recordConversionRate(
    value: number,
    periodStart: Date,
    periodEnd: Date,
    timeGranularity: TimeGranularity = TimeGranularity.DAILY,
    dimension1?: string,
    dimension2?: string,
    dimension3?: string,
  ): Promise<BusinessMetrics> {
    return this.recordMetric({
      metricType: MetricType.CONVERSION_RATE,
      value,
      periodStart,
      periodEnd,
      timeGranularity,
      dimension1,
      dimension2,
      dimension3,
    });
  }

  /**
   * Record search conversion metric
   * @param value Search conversion rate (0-1)
   * @param periodStart Period start date
   * @param periodEnd Period end date
   * @param timeGranularity Time granularity
   * @param dimension1 Optional dimension 1 (e.g., search type)
   * @param dimension2 Optional dimension 2 (e.g., category)
   * @param dimension3 Optional dimension 3 (e.g., device type)
   */
  async recordSearchConversion(
    value: number,
    periodStart: Date,
    periodEnd: Date,
    timeGranularity: TimeGranularity = TimeGranularity.DAILY,
    dimension1?: string,
    dimension2?: string,
    dimension3?: string,
  ): Promise<BusinessMetrics> {
    return this.recordMetric({
      metricType: MetricType.SEARCH_CONVERSION,
      value,
      periodStart,
      periodEnd,
      timeGranularity,
      dimension1,
      dimension2,
      dimension3,
    });
  }

  /**
   * Get metrics by type and time period
   * @param metricType Metric type
   * @param startDate Start date
   * @param endDate End date
   * @param timeGranularity Time granularity
   */
  async getMetricsByTypeAndPeriod(
    metricType: MetricType,
    startDate: Date,
    endDate: Date,
    timeGranularity: TimeGranularity = TimeGranularity.DAILY,
  ): Promise<BusinessMetrics[]> {
    try {
      return this.businessMetricsRepository.find({
        where: {
          metricType,
          timeGranularity,
          periodStart: Between(startDate, endDate),
        },
        order: {
          periodStart: 'ASC',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get metrics by type and period: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get revenue metrics by period
   * @param period Period in days
   * @param timeGranularity Time granularity
   */
  async getRevenueMetrics(
    period = 30,
    timeGranularity: TimeGranularity = TimeGranularity.DAILY,
  ): Promise<BusinessMetrics[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    return this.getMetricsByTypeAndPeriod(MetricType.REVENUE, startDate, endDate, timeGranularity);
  }

  /**
   * Get order metrics by period
   * @param period Period in days
   * @param timeGranularity Time granularity
   */
  async getOrderMetrics(
    period = 30,
    timeGranularity: TimeGranularity = TimeGranularity.DAILY,
  ): Promise<BusinessMetrics[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    return this.getMetricsByTypeAndPeriod(MetricType.ORDERS, startDate, endDate, timeGranularity);
  }

  /**
   * Get average order value metrics by period
   * @param period Period in days
   * @param timeGranularity Time granularity
   */
  async getAverageOrderValueMetrics(
    period = 30,
    timeGranularity: TimeGranularity = TimeGranularity.DAILY,
  ): Promise<BusinessMetrics[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    return this.getMetricsByTypeAndPeriod(MetricType.AOV, startDate, endDate, timeGranularity);
  }

  /**
   * Get conversion rate metrics by period
   * @param period Period in days
   * @param timeGranularity Time granularity
   */
  async getConversionRateMetrics(
    period = 30,
    timeGranularity: TimeGranularity = TimeGranularity.DAILY,
  ): Promise<BusinessMetrics[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    return this.getMetricsByTypeAndPeriod(
      MetricType.CONVERSION_RATE,
      startDate,
      endDate,
      timeGranularity,
    );
  }

  /**
   * Get search conversion metrics by period
   * @param period Period in days
   * @param timeGranularity Time granularity
   */
  async getSearchConversionMetrics(
    period = 30,
    timeGranularity: TimeGranularity = TimeGranularity.DAILY,
  ): Promise<BusinessMetrics[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    return this.getMetricsByTypeAndPeriod(
      MetricType.SEARCH_CONVERSION,
      startDate,
      endDate,
      timeGranularity,
    );
  }

  /**
   * Get metrics summary for dashboard
   * @param period Period in days
   */
  async getMetricsSummary(period = 30): Promise<any> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      // Previous period for comparison
      const previousEndDate = new Date(startDate);
      const previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - period);

      // Get current period metrics
      const currentRevenue = await this.getTotalMetricValue(MetricType.REVENUE, startDate, endDate);

      const currentOrders = await this.getTotalMetricCount(MetricType.ORDERS, startDate, endDate);

      const currentAOV = currentOrders > 0 ? currentRevenue / currentOrders : 0;

      const currentConversionRate = await this.getAverageMetricValue(
        MetricType.CONVERSION_RATE,
        startDate,
        endDate,
      );

      const currentSearchConversion = await this.getAverageMetricValue(
        MetricType.SEARCH_CONVERSION,
        startDate,
        endDate,
      );

      // Get previous period metrics
      const previousRevenue = await this.getTotalMetricValue(
        MetricType.REVENUE,
        previousStartDate,
        previousEndDate,
      );

      const previousOrders = await this.getTotalMetricCount(
        MetricType.ORDERS,
        previousStartDate,
        previousEndDate,
      );

      const previousAOV = previousOrders > 0 ? previousRevenue / previousOrders : 0;

      const previousConversionRate = await this.getAverageMetricValue(
        MetricType.CONVERSION_RATE,
        previousStartDate,
        previousEndDate,
      );

      const previousSearchConversion = await this.getAverageMetricValue(
        MetricType.SEARCH_CONVERSION,
        previousStartDate,
        previousEndDate,
      );

      // Calculate changes
      const revenueChange =
        previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      const ordersChange =
        previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0;

      const aovChange = previousAOV > 0 ? ((currentAOV - previousAOV) / previousAOV) * 100 : 0;

      const conversionRateChange =
        previousConversionRate > 0
          ? ((currentConversionRate - previousConversionRate) / previousConversionRate) * 100
          : 0;

      const searchConversionChange =
        previousSearchConversion > 0
          ? ((currentSearchConversion - previousSearchConversion) / previousSearchConversion) * 100
          : 0;

      return {
        revenue: {
          current: currentRevenue,
          previous: previousRevenue,
          change: revenueChange,
        },
        orders: {
          current: currentOrders,
          previous: previousOrders,
          change: ordersChange,
        },
        averageOrderValue: {
          current: currentAOV,
          previous: previousAOV,
          change: aovChange,
        },
        conversionRate: {
          current: currentConversionRate,
          previous: previousConversionRate,
          change: conversionRateChange,
        },
        searchConversion: {
          current: currentSearchConversion,
          previous: previousSearchConversion,
          change: searchConversionChange,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get metrics summary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get total metric value for a period
   * @param metricType Metric type
   * @param startDate Start date
   * @param endDate End date
   */
  private async getTotalMetricValue(
    metricType: MetricType,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    try {
      const result = await this.businessMetricsRepository
        .createQueryBuilder('metric')
        .select('SUM(metric.value)', 'total')
        .where('metric.metricType = :metricType', { metricType })
        .andWhere('metric.periodStart >= :startDate', { startDate })
        .andWhere('metric.periodEnd <= :endDate', { endDate })
        .getRawOne();

      return parseFloat(result?.total || '0');
    } catch (error) {
      this.logger.error(`Failed to get total metric value: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get total metric count for a period
   * @param metricType Metric type
   * @param startDate Start date
   * @param endDate End date
   */
  private async getTotalMetricCount(
    metricType: MetricType,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    try {
      const result = await this.businessMetricsRepository
        .createQueryBuilder('metric')
        .select('SUM(metric.count)', 'total')
        .where('metric.metricType = :metricType', { metricType })
        .andWhere('metric.periodStart >= :startDate', { startDate })
        .andWhere('metric.periodEnd <= :endDate', { endDate })
        .getRawOne();

      return parseInt(result?.total || '0');
    } catch (error) {
      this.logger.error(`Failed to get total metric count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get average metric value for a period
   * @param metricType Metric type
   * @param startDate Start date
   * @param endDate End date
   */
  private async getAverageMetricValue(
    metricType: MetricType,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    try {
      const result = await this.businessMetricsRepository
        .createQueryBuilder('metric')
        .select('AVG(metric.value)', 'average')
        .where('metric.metricType = :metricType', { metricType })
        .andWhere('metric.periodStart >= :startDate', { startDate })
        .andWhere('metric.periodEnd <= :endDate', { endDate })
        .getRawOne();

      return parseFloat(result?.average || '0');
    } catch (error) {
      this.logger.error(`Failed to get average metric value: ${error.message}`);
      return 0;
    }
  }
}
