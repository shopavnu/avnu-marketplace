import { Injectable, Logger } from '@nestjs/common';
import { SearchAnalyticsService } from './search-analytics.service';
import { UserEngagementService } from './user-engagement.service';
import { BusinessMetricsService } from './business-metrics.service';
import { SearchAnalytics } from '../entities/search-analytics.entity';
import { UserEngagement } from '../entities/user-engagement.entity';
import { BusinessMetrics, TimeGranularity } from '../entities/business-metrics.entity';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly searchAnalyticsService: SearchAnalyticsService,
    private readonly userEngagementService: UserEngagementService,
    private readonly businessMetricsService: BusinessMetricsService,
  ) {}

  /**
   * Track search query
   * @param data Search analytics data
   */
  async trackSearch(data: Partial<SearchAnalytics>): Promise<SearchAnalytics> {
    return this.searchAnalyticsService.trackSearch(data);
  }

  /**
   * Track user engagement
   * @param data User engagement data
   */
  async trackEngagement(data: Partial<UserEngagement>): Promise<UserEngagement> {
    return this.userEngagementService.trackEngagement(data);
  }

  /**
   * Record business metric
   * @param data Business metric data
   */
  async recordMetric(data: Partial<BusinessMetrics>): Promise<BusinessMetrics> {
    return this.businessMetricsService.recordMetric(data);
  }

  /**
   * Get dashboard analytics
   * @param period Period in days
   */
  async getDashboardAnalytics(period = 30): Promise<any> {
    try {
      // Get business metrics summary
      const businessMetrics = await this.businessMetricsService.getMetricsSummary(period);

      // Get search analytics
      const topSearchQueries = await this.searchAnalyticsService.getTopSearchQueries(10, period);
      const zeroResultQueries = await this.searchAnalyticsService.getZeroResultQueries(10, period);
      const searchConversionRate =
        await this.searchAnalyticsService.getSearchConversionRate(period);
      const searchClickThroughRate =
        await this.searchAnalyticsService.getSearchClickThroughRate(period);
      const nlpVsRegularSearchAnalytics =
        await this.searchAnalyticsService.getNlpVsRegularSearchAnalytics(period);
      const personalizedVsRegularSearchAnalytics =
        await this.searchAnalyticsService.getPersonalizedVsRegularSearchAnalytics(period);

      // Get user engagement analytics
      const userEngagementByType = await this.userEngagementService.getUserEngagementByType(period);
      const topViewedProducts = await this.userEngagementService.getTopViewedProducts(10, period);
      const topFavoritedProducts = await this.userEngagementService.getTopFavoritedProducts(
        10,
        period,
      );
      const userEngagementFunnel = await this.userEngagementService.getUserEngagementFunnel(period);
      const userRetentionMetrics = await this.userEngagementService.getUserRetentionMetrics(period);

      // Combine all analytics
      return {
        businessMetrics,
        searchAnalytics: {
          topSearchQueries,
          zeroResultQueries,
          searchConversionRate,
          searchClickThroughRate,
          nlpVsRegularSearchAnalytics,
          personalizedVsRegularSearchAnalytics,
        },
        userEngagement: {
          userEngagementByType,
          topViewedProducts,
          topFavoritedProducts,
          userEngagementFunnel,
          userRetentionMetrics,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get dashboard analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get search analytics
   * @param period Period in days
   */
  async getSearchAnalytics(period = 30): Promise<any> {
    try {
      const topSearchQueries = await this.searchAnalyticsService.getTopSearchQueries(20, period);
      const zeroResultQueries = await this.searchAnalyticsService.getZeroResultQueries(20, period);
      const searchConversionRate =
        await this.searchAnalyticsService.getSearchConversionRate(period);
      const searchClickThroughRate =
        await this.searchAnalyticsService.getSearchClickThroughRate(period);
      const searchAnalyticsByTime =
        await this.searchAnalyticsService.getSearchAnalyticsByTimePeriod(period, 'day');
      const nlpVsRegularSearchAnalytics =
        await this.searchAnalyticsService.getNlpVsRegularSearchAnalytics(period);
      const personalizedVsRegularSearchAnalytics =
        await this.searchAnalyticsService.getPersonalizedVsRegularSearchAnalytics(period);

      return {
        topSearchQueries,
        zeroResultQueries,
        searchConversionRate,
        searchClickThroughRate,
        searchAnalyticsByTime,
        nlpVsRegularSearchAnalytics,
        personalizedVsRegularSearchAnalytics,
      };
    } catch (error) {
      this.logger.error(`Failed to get search analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user engagement analytics
   * @param period Period in days
   */
  async getUserEngagementAnalytics(period = 30): Promise<any> {
    try {
      const userEngagementByType = await this.userEngagementService.getUserEngagementByType(period);
      const userEngagementByTime = await this.userEngagementService.getUserEngagementByTimePeriod(
        period,
        'day',
      );
      const topViewedProducts = await this.userEngagementService.getTopViewedProducts(20, period);
      const topFavoritedProducts = await this.userEngagementService.getTopFavoritedProducts(
        20,
        period,
      );
      const userEngagementFunnel = await this.userEngagementService.getUserEngagementFunnel(period);
      const userRetentionMetrics = await this.userEngagementService.getUserRetentionMetrics(period);

      return {
        userEngagementByType,
        userEngagementByTime,
        topViewedProducts,
        topFavoritedProducts,
        userEngagementFunnel,
        userRetentionMetrics,
      };
    } catch (error) {
      this.logger.error(`Failed to get user engagement analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get business metrics analytics
   * @param period Period in days
   */
  async getBusinessMetricsAnalytics(period = 30): Promise<any> {
    try {
      const metricsSummary = await this.businessMetricsService.getMetricsSummary(period);
      const revenueMetrics = await this.businessMetricsService.getRevenueMetrics(
        period,
        TimeGranularity.DAILY,
      );
      const orderMetrics = await this.businessMetricsService.getOrderMetrics(
        period,
        TimeGranularity.DAILY,
      );
      const aovMetrics = await this.businessMetricsService.getAverageOrderValueMetrics(
        period,
        TimeGranularity.DAILY,
      );
      const conversionRateMetrics = await this.businessMetricsService.getConversionRateMetrics(
        period,
        TimeGranularity.DAILY,
      );
      const searchConversionMetrics = await this.businessMetricsService.getSearchConversionMetrics(
        period,
        TimeGranularity.DAILY,
      );

      return {
        metricsSummary,
        revenueMetrics,
        orderMetrics,
        aovMetrics,
        conversionRateMetrics,
        searchConversionMetrics,
      };
    } catch (error) {
      this.logger.error(`Failed to get business metrics analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Track a complete order for analytics
   * @param orderId Order ID
   * @param userId User ID
   * @param sessionId Session ID
   * @param orderItems Order items
   * @param totalAmount Total amount
   * @param merchantId Optional merchant ID
   */
  async trackOrder(
    orderId: string,
    userId: string | null,
    sessionId: string,
    orderItems: any[],
    totalAmount: number,
    merchantId?: string,
  ): Promise<void> {
    try {
      // Track order completion engagement
      await this.userEngagementService.trackCheckoutComplete(
        userId,
        sessionId,
        orderId,
        orderItems,
        totalAmount,
        '/checkout/complete',
      );

      // Record business metrics
      const now = new Date();
      const periodStart = new Date(now);
      periodStart.setHours(0, 0, 0, 0);
      const periodEnd = new Date(now);
      periodEnd.setHours(23, 59, 59, 999);

      // Record revenue
      await this.businessMetricsService.recordRevenue(
        totalAmount,
        periodStart,
        periodEnd,
        TimeGranularity.DAILY,
        merchantId,
      );

      // Record order count
      await this.businessMetricsService.recordOrders(
        1,
        periodStart,
        periodEnd,
        TimeGranularity.DAILY,
        merchantId,
      );

      // Calculate and record AOV if we have enough data
      const orderMetrics = await this.businessMetricsService.getOrderMetrics(
        1,
        TimeGranularity.DAILY,
      );
      const revenueMetrics = await this.businessMetricsService.getRevenueMetrics(
        1,
        TimeGranularity.DAILY,
      );

      if (orderMetrics.length > 0 && revenueMetrics.length > 0) {
        const totalOrders = orderMetrics.reduce((sum, metric) => sum + (metric.count || 0), 0);
        const totalRevenue = revenueMetrics.reduce((sum, metric) => sum + metric.value, 0);

        if (totalOrders > 0) {
          const aov = totalRevenue / totalOrders;
          await this.businessMetricsService.recordAverageOrderValue(
            aov,
            periodStart,
            periodEnd,
            TimeGranularity.DAILY,
            merchantId,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Failed to track order: ${error.message}`);
    }
  }

  /**
   * Calculate and record conversion rates
   */
  /**
   * Get popular searches that match a prefix
   * @param prefix Search prefix to match
   * @param limit Maximum number of results to return
   * @param categories Optional category filter
   * @param days Number of days to look back
   * @returns Array of popular search queries
   */
  async getPopularSearches(
    prefix: string,
    limit: number = 10,
    categories?: string[],
    days: number = 30,
  ): Promise<Array<{ query: string; count: number; category?: string }>> {
    try {
      // Get top search queries from the search analytics service
      const topSearches = await this.searchAnalyticsService.getTopSearchQueries(100, days);

      // Filter by prefix (case insensitive)
      const prefixMatches = topSearches
        .filter(search => {
          const query = search.query.toLowerCase();
          return query.startsWith(prefix.toLowerCase());
        })
        // Filter by categories if provided
        .filter(search => {
          if (!categories || categories.length === 0) return true;

          try {
            // Check if search has category metadata
            const metadata = search.metadata ? JSON.parse(search.metadata) : {};
            if (!metadata.categories) return false;

            // Check if any of the search categories match the filter categories
            return categories.some(category => metadata.categories.includes(category));
          } catch (e) {
            return false;
          }
        })
        // Map to the expected format
        .map(search => {
          let category;
          try {
            const metadata = search.metadata ? JSON.parse(search.metadata) : {};
            category = metadata.categories?.[0];
          } catch (e) {
            // Ignore parsing errors
          }

          return {
            query: search.query,
            count: search.count,
            category,
          };
        })
        // Sort by count (descending)
        .sort((a, b) => b.count - a.count)
        // Limit results
        .slice(0, limit);

      return prefixMatches;
    } catch (error) {
      this.logger.error(
        `Failed to get popular searches for prefix "${prefix}": ${error.message}`,
        error.stack,
        AnalyticsService.name,
      );
      return [];
    }
  }

  async calculateAndRecordConversionRates(): Promise<void> {
    try {
      const now = new Date();
      const periodStart = new Date(now);
      periodStart.setHours(0, 0, 0, 0);
      const periodEnd = new Date(now);
      periodEnd.setHours(23, 59, 59, 999);

      // Get user engagement funnel for today
      const userEngagementFunnel = await this.userEngagementService.getUserEngagementFunnel(1);

      // Record overall conversion rate
      if (userEngagementFunnel.conversionRates.overallConversionRate !== undefined) {
        await this.businessMetricsService.recordConversionRate(
          userEngagementFunnel.conversionRates.overallConversionRate,
          periodStart,
          periodEnd,
          TimeGranularity.DAILY,
        );
      }

      // Get search conversion rate for today
      const searchConversionRate = await this.searchAnalyticsService.getSearchConversionRate(1);

      // Record search conversion rate
      await this.businessMetricsService.recordSearchConversion(
        searchConversionRate,
        periodStart,
        periodEnd,
        TimeGranularity.DAILY,
      );
    } catch (error) {
      this.logger.error(`Failed to calculate and record conversion rates: ${error.message}`);
    }
  }
}
