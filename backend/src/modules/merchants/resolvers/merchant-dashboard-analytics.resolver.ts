import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MerchantDashboardAnalyticsService } from '../services/merchant-dashboard-analytics.service';
import { MerchantDataAggregationService } from '../services/merchant-data-aggregation.service';
import { MerchantAnalyticsFilterService } from '../services/merchant-analytics-filter.service';
import { MerchantRevenueAnalyticsService } from '../services/merchant-revenue-analytics.service';
import { MerchantDemographicAnalyticsService } from '../services/merchant-demographic-analytics.service';
import { MerchantAuthGuard } from '../../auth/guards/merchant-auth.guard';
import { CurrentMerchant } from '../../../modules/auth/decorators/current-merchant.decorator';
import { Merchant } from '../entities/merchant.entity';
import { GraphQLJSON } from 'graphql-type-json';
import { DemographicFilterInput } from '../graphql/inputs/demographic-filter.input';
import {
  MerchantDashboardAnalytics,
  TopProduct,
  TimeSeriesDataPoint,
  ConversionFunnel,
  OrganicVsPaidPerformance,
  PeriodComparisonData,
  RevenueAnalytics,
  ConversionAnalytics,
  ImpressionAnalytics,
  DemographicAnalytics,
} from '../graphql/types/analytics-dashboard.type';

@Resolver()
@UseGuards(MerchantAuthGuard)
export class MerchantDashboardAnalyticsResolver {
  constructor(
    private readonly dashboardAnalyticsService: MerchantDashboardAnalyticsService,
    private readonly dataAggregationService: MerchantDataAggregationService,
    private readonly analyticsFilterService: MerchantAnalyticsFilterService,
    private readonly revenueAnalyticsService: MerchantRevenueAnalyticsService,
    private readonly demographicAnalyticsService: MerchantDemographicAnalyticsService,
  ) {}

  @Query(() => MerchantDashboardAnalytics)
  async merchantDashboardAnalytics(
    @CurrentMerchant() merchant: Merchant,
    @Args('timeFrame', { nullable: true }) timeFrame?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
    @Args('productIds', { type: () => [String], nullable: true }) _productIds?: string[],
    @Args('categoryIds', { type: () => [String], nullable: true }) _categoryIds?: string[],
    @Args('sortBy', { nullable: true }) _sortBy?: string,
    @Args('sortOrder', { nullable: true }) _sortOrder?: string,
    @Args('page', { nullable: true }) _page?: number,
    @Args('limit', { nullable: true }) _limit?: number,
  ) {
    return this.dashboardAnalyticsService.getDashboardAnalytics(
      merchant.id,
      timeFrame as any,
      startDate,
      endDate,
    );
  }

  @Query(() => PeriodComparisonData)
  async merchantPeriodComparison(
    @CurrentMerchant() merchant: Merchant,
    @Args('currentPeriodStart', { nullable: false }) currentPeriodStart: Date,
    @Args('currentPeriodEnd', { nullable: false }) currentPeriodEnd: Date,
    @Args('previousPeriodStart', { nullable: false }) previousPeriodStart: Date,
    @Args('previousPeriodEnd', { nullable: false }) previousPeriodEnd: Date,
    @Args('productIds', { type: () => [String], nullable: true }) productIds?: string[],
    @Args('categoryIds', { type: () => [String], nullable: true }) categoryIds?: string[],
  ) {
    return this.dashboardAnalyticsService.getPeriodComparisonData(
      merchant.id,
      currentPeriodStart,
      currentPeriodEnd,
      previousPeriodStart,
      previousPeriodEnd,
      productIds,
      categoryIds,
    );
  }

  @Query(() => [TimeSeriesDataPoint])
  async merchantPerformanceOverTime(
    @CurrentMerchant() merchant: Merchant,
    @Args('metricName', { nullable: false }) metricName: string,
    @Args('timeFrame', { nullable: true }) timeFrame?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
  ) {
    return this.dashboardAnalyticsService.getPerformanceOverTime(
      merchant.id,
      timeFrame as any,
      startDate,
      endDate,
    );
  }

  @Query(() => ConversionFunnel)
  async merchantConversionFunnel(
    @CurrentMerchant() merchant: Merchant,
    @Args('timeFrame', { nullable: true }) timeFrame?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
  ) {
    return this.dashboardAnalyticsService.getConversionFunnel(
      merchant.id,
      timeFrame as any,
      startDate,
      endDate,
    );
  }

  @Query(() => OrganicVsPaidPerformance)
  async merchantOrganicVsPaidPerformance(
    @CurrentMerchant() merchant: Merchant,
    @Args('timeFrame', { nullable: true }) timeFrame?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
  ) {
    return this.dashboardAnalyticsService.getOrganicVsPaidPerformance(
      merchant.id,
      timeFrame as any,
      startDate,
      endDate,
    );
  }

  @Query(() => GraphQLJSON)
  async merchantMetricAggregation(
    @CurrentMerchant() merchant: Merchant,
    @Args('metricName') metricName: string,
    @Args('timeFrame', { nullable: true }) timeFrame?: string,
    @Args('aggregationFunction', { nullable: true }) aggregationFunction?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
    @Args('productId', { nullable: true }) productId?: string,
    @Args('categoryId', { nullable: true }) categoryId?: string,
  ) {
    return this.dataAggregationService.aggregateMetric(
      merchant.id,
      metricName,
      timeFrame as any,
      aggregationFunction as any,
      startDate,
      endDate,
      productId,
      categoryId,
    );
  }

  @Query(() => GraphQLJSON)
  async merchantCompareTimePeriods(
    @CurrentMerchant() merchant: Merchant,
    @Args('metricName') metricName: string,
    @Args('currentStartDate') currentStartDate: Date,
    @Args('currentEndDate') currentEndDate: Date,
    @Args('previousStartDate') previousStartDate: Date,
    @Args('previousEndDate') previousEndDate: Date,
    @Args('productId', { nullable: true }) productId?: string,
    @Args('categoryId', { nullable: true }) categoryId?: string,
  ) {
    return this.dataAggregationService.compareTimePeriods(
      merchant.id,
      metricName,
      {
        startDate: currentStartDate,
        endDate: currentEndDate,
      },
      {
        startDate: previousStartDate,
        endDate: previousEndDate,
      },
      productId,
      categoryId,
    );
  }

  @Query(() => GraphQLJSON)
  async merchantTimeSeriesData(
    @CurrentMerchant() merchant: Merchant,
    @Args('metricName') metricName: string,
    @Args('timeFrame', { nullable: true }) timeFrame?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
    @Args('productId', { nullable: true }) productId?: string,
    @Args('categoryId', { nullable: true }) categoryId?: string,
  ) {
    return this.dataAggregationService.getTimeSeriesData(
      merchant.id,
      metricName,
      timeFrame as any,
      startDate,
      endDate,
      productId,
      categoryId,
    );
  }

  @Query(() => GraphQLJSON)
  async merchantRollingAverages(
    @CurrentMerchant() merchant: Merchant,
    @Args('metricName') metricName: string,
    @Args('windowSize', { type: () => Int, nullable: true }) windowSize?: number,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
    @Args('productId', { nullable: true }) productId?: string,
    @Args('categoryId', { nullable: true }) categoryId?: string,
  ) {
    return this.dataAggregationService.getRollingAverages(
      merchant.id,
      metricName,
      windowSize,
      startDate,
      endDate,
      productId,
      categoryId,
    );
  }

  @Query(() => GraphQLJSON)
  async merchantFilteredAnalytics(
    @CurrentMerchant() merchant: Merchant,
    @Args('timeFrame', { nullable: true }) timeFrame?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
    @Args('productIds', { type: () => [String], nullable: true }) productIds?: string[],
    @Args('categoryIds', { type: () => [String], nullable: true }) categoryIds?: string[],
    @Args('sortBy', { nullable: true }) sortBy?: string,
    @Args('sortOrder', { nullable: true }) sortOrder?: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.analyticsFilterService.getFilteredAnalytics(merchant.id, {
      timeFrame: timeFrame as any,
      startDate,
      endDate,
      productIds,
      categoryIds,
      sortBy,
      sortOrder: sortOrder as any,
      page,
      limit,
    });
  }

  @Query(() => [TopProduct])
  async merchantTopPerformingProducts(
    @CurrentMerchant() merchant: Merchant,
    @Args('metric', { nullable: true }) metric?: string,
    @Args('timeFrame', { nullable: true }) timeFrame?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
    @Args('categoryIds', { type: () => [String], nullable: true }) categoryIds?: string[],
  ) {
    return this.analyticsFilterService.getTopPerformingProducts(
      merchant.id,
      metric,
      timeFrame as any,
      limit,
      startDate,
      endDate,
      categoryIds,
    );
  }

  @Query(() => GraphQLJSON)
  async merchantCategoryPerformance(
    @CurrentMerchant() merchant: Merchant,
    @Args('metric', { nullable: true }) metric?: string,
    @Args('timeFrame', { nullable: true }) timeFrame?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
  ) {
    return this.analyticsFilterService.getCategoryPerformance(
      merchant.id,
      metric,
      timeFrame as any,
      startDate,
      endDate,
    );
  }

  @Query(() => GraphQLJSON)
  async merchantProductPerformanceOverTime(
    @CurrentMerchant() merchant: Merchant,
    @Args('productId') productId: string,
    @Args('metric', { nullable: true }) metric?: string,
    @Args('timeFrame', { nullable: true }) timeFrame?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
  ) {
    return this.analyticsFilterService.getProductPerformanceOverTime(
      merchant.id,
      productId,
      metric,
      timeFrame as any,
      startDate,
      endDate,
    );
  }

  @Query(() => GraphQLJSON)
  async merchantCategoryPerformanceOverTime(
    @CurrentMerchant() merchant: Merchant,
    @Args('categoryId') categoryId: string,
    @Args('metric', { nullable: true }) metric?: string,
    @Args('timeFrame', { nullable: true }) timeFrame?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
  ) {
    return this.analyticsFilterService.getCategoryPerformanceOverTime(
      merchant.id,
      categoryId,
      metric,
      timeFrame as any,
      startDate,
      endDate,
    );
  }

  @Query(() => GraphQLJSON)
  async merchantCompareProducts(
    @CurrentMerchant() merchant: Merchant,
    @Args('productIds', { type: () => [String] }) productIds: string[],
    @Args('metric', { nullable: true }) metric?: string,
    @Args('timeFrame', { nullable: true }) timeFrame?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
  ) {
    return this.analyticsFilterService.compareProducts(
      merchant.id,
      productIds,
      metric,
      timeFrame as any,
      startDate,
      endDate,
    );
  }

  @Query(() => RevenueAnalytics)
  async merchantRevenueAnalytics(
    @CurrentMerchant() merchant: Merchant,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
  ) {
    // Get revenue data for different time frames
    const weekly = await this.revenueAnalyticsService.getRevenueByTimeFrame(
      merchant.id,
      'weekly',
      startDate,
      endDate,
    );

    const monthly = await this.revenueAnalyticsService.getRevenueByTimeFrame(
      merchant.id,
      'monthly',
      startDate,
      endDate,
    );

    const quarterly = await this.revenueAnalyticsService.getRevenueByTimeFrame(
      merchant.id,
      'quarterly',
      startDate,
      endDate,
    );

    const yearly = await this.revenueAnalyticsService.getRevenueByTimeFrame(
      merchant.id,
      'yearly',
      startDate,
      endDate,
    );

    return {
      weekly,
      monthly,
      quarterly,
      yearly,
    };
  }

  @Query(() => ConversionAnalytics)
  async merchantConversionAnalytics(
    @CurrentMerchant() merchant: Merchant,
    @Args('timeFrame', { nullable: true }) timeFrame?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
  ) {
    // Get conversion rate over time
    const conversionRateOverTime = await this.dashboardAnalyticsService.getPerformanceOverTime(
      merchant.id,
      timeFrame as any,
      startDate,
      endDate,
    );

    // Get click-through rate over time
    const clickThroughRateOverTime = await this.dashboardAnalyticsService.getPerformanceOverTime(
      merchant.id,
      timeFrame as any,
      startDate,
      endDate,
    );

    // Get cart abandonment rate over time
    const cartAbandonmentRateOverTime =
      await this.revenueAnalyticsService.getCartAbandonmentRateOverTime(
        merchant.id,
        timeFrame as any,
        startDate,
        endDate,
      );

    return {
      conversionRateOverTime,
      clickThroughRateOverTime,
      cartAbandonmentRateOverTime,
    };
  }

  @Query(() => ImpressionAnalytics)
  async merchantImpressionAnalytics(
    @CurrentMerchant() merchant: Merchant,
    @Args('timeFrame', { nullable: true }) timeFrame?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
  ) {
    // Get organic vs paid impressions over time
    const impressionsOverTime = await this.revenueAnalyticsService.getImpressionsBySourceOverTime(
      merchant.id,
      timeFrame as any,
      startDate,
      endDate,
    );

    return {
      impressionsOverTime,
    };
  }

  @Query(() => DemographicAnalytics)
  async merchantDemographicAnalytics(
    @CurrentMerchant() merchant: Merchant,
    @Args('timeFrame', { nullable: true }) timeFrame?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
    @Args('filters', { type: () => [DemographicFilterInput], nullable: true })
    filters?: DemographicFilterInput[],
  ) {
    return this.demographicAnalyticsService.getDemographicAnalytics(
      merchant.id,
      timeFrame as any,
      startDate,
      endDate,
      filters,
    );
  }

  @Query(() => MerchantDashboardAnalytics)
  async merchantEnhancedDashboardAnalytics(
    @CurrentMerchant() merchant: Merchant,
    @Args('timeFrame', { nullable: true }) timeFrame?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
    @Args('demographicFilters', { type: () => [DemographicFilterInput], nullable: true })
    demographicFilters?: DemographicFilterInput[],
  ) {
    // Get base dashboard analytics
    const baseAnalytics = await this.dashboardAnalyticsService.getDashboardAnalytics(
      merchant.id,
      timeFrame as any,
      startDate,
      endDate,
    );

    // Get enhanced analytics
    const revenueAnalytics = await this.merchantRevenueAnalytics(merchant, startDate, endDate);
    const conversionAnalytics = await this.merchantConversionAnalytics(
      merchant,
      timeFrame,
      startDate,
      endDate,
    );
    const impressionAnalytics = await this.merchantImpressionAnalytics(
      merchant,
      timeFrame,
      startDate,
      endDate,
    );
    const demographicAnalytics = await this.demographicAnalyticsService.getDemographicAnalytics(
      merchant.id,
      timeFrame as any,
      startDate,
      endDate,
      demographicFilters,
    );

    // Combine all analytics
    return {
      ...baseAnalytics,
      revenueAnalytics,
      conversionAnalytics,
      impressionAnalytics,
      demographicAnalytics,
    };
  }
}
