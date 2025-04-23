import { Injectable, Logger, Inject } from '@nestjs/common';
import { Repository, Between, IsNull, Not, FindOptionsWhere, In } from 'typeorm';
import { MerchantAnalytics } from '../entities/merchant-analytics.entity';
import { MerchantAnalyticsService } from './merchant-analytics.service';
import { ProductService } from '../../products/services';

type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
type MetricType = 'revenue' | 'orders' | 'views' | 'clicks' | 'conversion' | 'ctr';

@Injectable()
export class MerchantDashboardAnalyticsService {
  private readonly logger = new Logger(MerchantDashboardAnalyticsService.name);

  constructor(
    @Inject('MerchantAnalyticsRepository')
    private readonly analyticsRepository: Repository<MerchantAnalytics>,
    private readonly merchantAnalyticsService: MerchantAnalyticsService,
    private readonly productService: ProductService,
  ) {}

  /**
   * Get comprehensive dashboard analytics for a merchant
   * @param merchantId The merchant ID
   * @param timeFrame The time frame for data aggregation
   * @param startDate Optional start date for custom date range
   * @param endDate Optional end date for custom date range
   */
  async getDashboardAnalytics(
    merchantId: string,
    timeFrame: TimeFrame = 'monthly',
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    try {
      // Get overall analytics
      const overallAnalytics = await this.merchantAnalyticsService.getOverallAnalytics(
        merchantId,
        timeFrame,
        startDate,
        endDate,
      );

      // Get top products
      const topProducts = await this.merchantAnalyticsService.getTopProducts(
        merchantId,
        10,
        timeFrame,
      );

      // Get demographic data
      const demographics = await this.merchantAnalyticsService.getDemographicData(
        merchantId,
        timeFrame,
      );

      // Get performance metrics over time
      const performanceOverTime = await this.getPerformanceOverTime(
        merchantId,
        timeFrame,
        startDate,
        endDate,
      );

      // Get conversion funnel data
      const conversionFunnel = await this.getConversionFunnel(
        merchantId,
        timeFrame,
        startDate,
        endDate,
      );

      // Get organic vs paid performance
      const organicVsPaidPerformance = await this.getOrganicVsPaidPerformance(
        merchantId,
        timeFrame,
        startDate,
        endDate,
      );

      // Combine all analytics
      return {
        summary: this.calculateSummaryMetrics(overallAnalytics),
        topProducts,
        demographics,
        performanceOverTime,
        conversionFunnel,
        organicVsPaidPerformance,
      };
    } catch (error) {
      this.logger.error(`Failed to get merchant dashboard analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate summary metrics from analytics data
   * @param analytics Array of merchant analytics records
   */
  private calculateSummaryMetrics(analytics: MerchantAnalytics[]) {
    // Initialize summary metrics
    const summary = {
      totalRevenue: 0,
      totalOrders: 0,
      totalViews: 0,
      totalClicks: 0,
      averageOrderValue: 0,
      overallConversionRate: 0,
      overallClickThroughRate: 0,
    };

    // Calculate totals
    analytics.forEach(record => {
      summary.totalRevenue += record.revenue;
      summary.totalOrders += record.orders;
      summary.totalViews += record.productViews;
      summary.totalClicks += record.clicks;
    });

    // Calculate averages and rates
    if (summary.totalOrders > 0) {
      summary.averageOrderValue = summary.totalRevenue / summary.totalOrders;
    }

    if (summary.totalClicks > 0) {
      summary.overallConversionRate = summary.totalOrders / summary.totalClicks;
    }

    if (summary.totalViews > 0) {
      summary.overallClickThroughRate = summary.totalClicks / summary.totalViews;
    }

    return summary;
  }

  /**
   * Get performance metrics over time
   * @param merchantId The merchant ID
   * @param timeFrame The time frame for data aggregation
   * @param startDate Optional start date for custom date range
   * @param endDate Optional end date for custom date range
   */
  async getPerformanceOverTime(
    merchantId: string,
    timeFrame: TimeFrame = 'monthly',
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const analytics = await this.merchantAnalyticsService.getOverallAnalytics(
      merchantId,
      timeFrame,
      startDate,
      endDate,
    );

    // Format data for time series chart
    return analytics.map(record => ({
      date: record.date,
      revenue: record.revenue,
      orders: record.orders,
      views: record.productViews,
      clicks: record.clicks,
      conversionRate: record.conversionRate,
      clickThroughRate: record.clickThroughRate,
    }));
  }

  /**
   * Get conversion funnel data
   * @param merchantId The merchant ID
   * @param timeFrame The time frame for data aggregation
   * @param startDate Optional start date for custom date range
   * @param endDate Optional end date for custom date range
   */
  async getConversionFunnel(
    merchantId: string,
    timeFrame: TimeFrame = 'monthly',
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const analytics = await this.merchantAnalyticsService.getOverallAnalytics(
      merchantId,
      timeFrame,
      startDate,
      endDate,
    );

    // Aggregate funnel data
    let totalViews = 0;
    let totalClicks = 0;
    let totalAddToCarts = 0;
    let totalAbandonedCarts = 0;
    let totalOrders = 0;

    analytics.forEach(record => {
      totalViews += record.productViews;
      totalClicks += record.clicks;
      totalAddToCarts += record.addToCarts;
      totalAbandonedCarts += record.abandonedCarts;
      totalOrders += record.orders;
    });

    // Calculate conversion rates between steps
    const viewToClickRate = totalViews > 0 ? totalClicks / totalViews : 0;
    const clickToCartRate = totalClicks > 0 ? totalAddToCarts / totalClicks : 0;
    const cartToOrderRate = totalAddToCarts > 0 ? totalOrders / totalAddToCarts : 0;
    const abandonmentRate = totalAddToCarts > 0 ? totalAbandonedCarts / totalAddToCarts : 0;

    return {
      stages: [
        { name: 'Product Views', count: totalViews },
        { name: 'Clicks', count: totalClicks },
        { name: 'Add to Cart', count: totalAddToCarts },
        { name: 'Orders', count: totalOrders },
      ],
      conversionRates: {
        viewToClickRate,
        clickToCartRate,
        cartToOrderRate,
        abandonmentRate,
        overallConversionRate: totalViews > 0 ? totalOrders / totalViews : 0,
      },
    };
  }

  /**
   * Get organic vs paid performance comparison
   * @param merchantId The merchant ID
   * @param timeFrame The time frame for data aggregation
   * @param startDate Optional start date for custom date range
   * @param endDate Optional end date for custom date range
   */
  async getOrganicVsPaidPerformance(
    merchantId: string,
    timeFrame: TimeFrame = 'monthly',
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const analytics = await this.merchantAnalyticsService.getOverallAnalytics(
      merchantId,
      timeFrame,
      startDate,
      endDate,
    );

    // Aggregate organic vs paid data
    const result = {
      impressions: {
        organic: 0,
        paid: 0,
      },
      clicks: {
        organic: 0,
        paid: 0,
      },
      conversionRates: {
        organic: 0,
        paid: 0,
      },
      revenue: {
        organic: 0,
        paid: 0,
      },
    };

    // For simplicity, we're assuming a proportional attribution model
    // In a real implementation, you would need more sophisticated attribution
    analytics.forEach(record => {
      const totalImpressions = record.organicImpressions + record.paidImpressions;

      result.impressions.organic += record.organicImpressions;
      result.impressions.paid += record.paidImpressions;

      if (totalImpressions > 0) {
        const organicRatio = record.organicImpressions / totalImpressions;
        const paidRatio = record.paidImpressions / totalImpressions;

        // Attribute clicks proportionally
        result.clicks.organic += record.clicks * organicRatio;
        result.clicks.paid += record.clicks * paidRatio;

        // Attribute revenue proportionally
        result.revenue.organic += record.revenue * organicRatio;
        result.revenue.paid += record.revenue * paidRatio;
      }
    });

    // Calculate conversion rates
    if (result.clicks.organic > 0) {
      result.conversionRates.organic = result.revenue.organic / result.clicks.organic;
    }

    if (result.clicks.paid > 0) {
      result.conversionRates.paid = result.revenue.paid / result.clicks.paid;
    }

    return result;
  }

  /**
   * Get period comparison data for analytics
   * @param merchantId The merchant ID
   * @param currentPeriodStart Start date for current period
   * @param currentPeriodEnd End date for current period
   * @param previousPeriodStart Start date for previous period
   * @param previousPeriodEnd End date for previous period
   * @param productIds Optional product IDs to filter by
   * @param categoryIds Optional category IDs to filter by
   */
  async getPeriodComparisonData(
    merchantId: string,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    previousPeriodStart: Date,
    previousPeriodEnd: Date,
    productIds?: string[],
    categoryIds?: string[],
  ): Promise<any> {
    try {
      // Get current period analytics
      const currentPeriodAnalytics = await this.merchantAnalyticsService.getAnalytics(
        merchantId,
        'custom',
        currentPeriodStart,
        currentPeriodEnd,
        productIds?.length > 0 ? productIds[0] : undefined,
        categoryIds?.length > 0 ? categoryIds[0] : undefined,
      );

      // Get previous period analytics
      const previousPeriodAnalytics = await this.merchantAnalyticsService.getAnalytics(
        merchantId,
        'custom',
        previousPeriodStart,
        previousPeriodEnd,
        productIds?.length > 0 ? productIds[0] : undefined,
        categoryIds?.length > 0 ? categoryIds[0] : undefined,
      );

      // Calculate current period metrics
      const currentPeriodSummary = this.calculateSummaryMetrics(currentPeriodAnalytics);
      const currentPeriodLabel = `${currentPeriodStart.toISOString().split('T')[0]} to ${currentPeriodEnd.toISOString().split('T')[0]}`;

      // Calculate previous period metrics
      const previousPeriodSummary = this.calculateSummaryMetrics(previousPeriodAnalytics);
      const previousPeriodLabel = `${previousPeriodStart.toISOString().split('T')[0]} to ${previousPeriodEnd.toISOString().split('T')[0]}`;

      // Get time series data for both periods
      const currentPeriodTimeSeries = await this.getPerformanceOverTime(
        merchantId,
        'custom',
        currentPeriodStart,
        currentPeriodEnd,
      );

      const previousPeriodTimeSeries = await this.getPerformanceOverTime(
        merchantId,
        'custom',
        previousPeriodStart,
        previousPeriodEnd,
      );

      return {
        currentPeriod: {
          label: currentPeriodLabel,
          revenue: currentPeriodSummary.totalRevenue,
          orders: currentPeriodSummary.totalOrders,
          views: currentPeriodSummary.totalViews,
          conversionRate: currentPeriodSummary.overallConversionRate,
        },
        previousPeriod: {
          label: previousPeriodLabel,
          revenue: previousPeriodSummary.totalRevenue,
          orders: previousPeriodSummary.totalOrders,
          views: previousPeriodSummary.totalViews,
          conversionRate: previousPeriodSummary.overallConversionRate,
        },
        currentPeriodTimeSeries,
        previousPeriodTimeSeries,
      };
    } catch (error) {
      this.logger.error(`Failed to get period comparison data: ${error.message}`);
      throw error;
    }
  }
}
