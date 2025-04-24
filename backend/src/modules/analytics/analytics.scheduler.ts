import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnalyticsService } from './services/analytics.service';
import { BusinessMetricsService } from './services/business-metrics.service';
import { TimeGranularity } from './entities/business-metrics.entity';

@Injectable()
export class AnalyticsScheduler {
  private readonly logger = new Logger(AnalyticsScheduler.name);

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly businessMetricsService: BusinessMetricsService,
  ) {}

  /**
   * Calculate and record daily conversion rates
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async calculateHourlyConversionRates() {
    this.logger.log('Calculating hourly conversion rates');
    try {
      await this.analyticsService.calculateAndRecordConversionRates();
    } catch (error) {
      this.logger.error(`Failed to calculate hourly conversion rates: ${error.message}`);
    }
  }

  /**
   * Calculate and record weekly metrics
   * Runs every Sunday at midnight
   */
  @Cron(CronExpression.EVERY_WEEK)
  async calculateWeeklyMetrics() {
    this.logger.log('Calculating weekly metrics');
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of the week (Sunday)
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(now);
      weekEnd.setDate(weekStart.getDate() + 6); // End of the week (Saturday)
      weekEnd.setHours(23, 59, 59, 999);

      // Get metrics for the week
      const startDate = new Date(weekStart);
      startDate.setDate(startDate.getDate() - 7); // Previous week for comparison

      const endDate = new Date(weekEnd);
      endDate.setDate(endDate.getDate() - 7); // Previous week for comparison

      // Calculate weekly revenue
      const revenueMetrics = await this.businessMetricsService.getRevenueMetrics(
        7,
        TimeGranularity.DAILY,
      );
      const totalRevenue = revenueMetrics.reduce((sum, metric) => sum + metric.value, 0);

      // Record weekly revenue
      await this.businessMetricsService.recordRevenue(
        totalRevenue,
        weekStart,
        weekEnd,
        TimeGranularity.WEEKLY,
      );

      // Calculate weekly orders
      const orderMetrics = await this.businessMetricsService.getOrderMetrics(
        7,
        TimeGranularity.DAILY,
      );
      const totalOrders = orderMetrics.reduce((sum, metric) => sum + (metric.count || 0), 0);

      // Record weekly orders
      await this.businessMetricsService.recordOrders(
        totalOrders,
        weekStart,
        weekEnd,
        TimeGranularity.WEEKLY,
      );

      // Calculate weekly AOV
      const weeklyAOV = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Record weekly AOV
      await this.businessMetricsService.recordAverageOrderValue(
        weeklyAOV,
        weekStart,
        weekEnd,
        TimeGranularity.WEEKLY,
      );

      // Calculate weekly conversion rate
      const conversionRateMetrics = await this.businessMetricsService.getConversionRateMetrics(
        7,
        TimeGranularity.DAILY,
      );
      const avgConversionRate =
        conversionRateMetrics.length > 0
          ? conversionRateMetrics.reduce((sum, metric) => sum + metric.value, 0) /
            conversionRateMetrics.length
          : 0;

      // Record weekly conversion rate
      await this.businessMetricsService.recordConversionRate(
        avgConversionRate,
        weekStart,
        weekEnd,
        TimeGranularity.WEEKLY,
      );

      // Calculate weekly search conversion
      const searchConversionMetrics = await this.businessMetricsService.getSearchConversionMetrics(
        7,
        TimeGranularity.DAILY,
      );
      const avgSearchConversion =
        searchConversionMetrics.length > 0
          ? searchConversionMetrics.reduce((sum, metric) => sum + metric.value, 0) /
            searchConversionMetrics.length
          : 0;

      // Record weekly search conversion
      await this.businessMetricsService.recordSearchConversion(
        avgSearchConversion,
        weekStart,
        weekEnd,
        TimeGranularity.WEEKLY,
      );
    } catch (error) {
      this.logger.error(`Failed to calculate weekly metrics: ${error.message}`);
    }
  }

  /**
   * Calculate and record monthly metrics
   * Runs on the 1st day of every month at midnight
   */
  @Cron('0 0 1 * *')
  async calculateMonthlyMetrics() {
    this.logger.log('Calculating monthly metrics');
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      // Get metrics for the month
      const startDate = new Date(monthStart);
      startDate.setMonth(startDate.getMonth() - 1); // Previous month for comparison

      const endDate = new Date(monthEnd);
      endDate.setMonth(endDate.getMonth() - 1); // Previous month for comparison

      // Calculate monthly revenue
      const revenueMetrics = await this.businessMetricsService.getRevenueMetrics(
        30,
        TimeGranularity.DAILY,
      );
      const totalRevenue = revenueMetrics.reduce((sum, metric) => sum + metric.value, 0);

      // Record monthly revenue
      await this.businessMetricsService.recordRevenue(
        totalRevenue,
        monthStart,
        monthEnd,
        TimeGranularity.MONTHLY,
      );

      // Calculate monthly orders
      const orderMetrics = await this.businessMetricsService.getOrderMetrics(
        30,
        TimeGranularity.DAILY,
      );
      const totalOrders = orderMetrics.reduce((sum, metric) => sum + (metric.count || 0), 0);

      // Record monthly orders
      await this.businessMetricsService.recordOrders(
        totalOrders,
        monthStart,
        monthEnd,
        TimeGranularity.MONTHLY,
      );

      // Calculate monthly AOV
      const monthlyAOV = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Record monthly AOV
      await this.businessMetricsService.recordAverageOrderValue(
        monthlyAOV,
        monthStart,
        monthEnd,
        TimeGranularity.MONTHLY,
      );

      // Calculate monthly conversion rate
      const conversionRateMetrics = await this.businessMetricsService.getConversionRateMetrics(
        30,
        TimeGranularity.DAILY,
      );
      const avgConversionRate =
        conversionRateMetrics.length > 0
          ? conversionRateMetrics.reduce((sum, metric) => sum + metric.value, 0) /
            conversionRateMetrics.length
          : 0;

      // Record monthly conversion rate
      await this.businessMetricsService.recordConversionRate(
        avgConversionRate,
        monthStart,
        monthEnd,
        TimeGranularity.MONTHLY,
      );

      // Calculate monthly search conversion
      const searchConversionMetrics = await this.businessMetricsService.getSearchConversionMetrics(
        30,
        TimeGranularity.DAILY,
      );
      const avgSearchConversion =
        searchConversionMetrics.length > 0
          ? searchConversionMetrics.reduce((sum, metric) => sum + metric.value, 0) /
            searchConversionMetrics.length
          : 0;

      // Record monthly search conversion
      await this.businessMetricsService.recordSearchConversion(
        avgSearchConversion,
        monthStart,
        monthEnd,
        TimeGranularity.MONTHLY,
      );
    } catch (error) {
      this.logger.error(`Failed to calculate monthly metrics: ${error.message}`);
    }
  }
}
