import { MerchantDashboardAnalyticsService } from '../services/merchant-dashboard-analytics.service';
import { MerchantDataAggregationService } from '../services/merchant-data-aggregation.service';
import { MerchantAnalyticsFilterService } from '../services/merchant-analytics-filter.service';
import { MerchantRevenueAnalyticsService } from '../services/merchant-revenue-analytics.service';
import { MerchantDemographicAnalyticsService } from '../services/merchant-demographic-analytics.service';
import { Merchant } from '../entities/merchant.entity';
import { DemographicFilterInput } from '../graphql/inputs/demographic-filter.input';
export declare class MerchantDashboardAnalyticsResolver {
  private readonly dashboardAnalyticsService;
  private readonly dataAggregationService;
  private readonly analyticsFilterService;
  private readonly revenueAnalyticsService;
  private readonly demographicAnalyticsService;
  constructor(
    dashboardAnalyticsService: MerchantDashboardAnalyticsService,
    dataAggregationService: MerchantDataAggregationService,
    analyticsFilterService: MerchantAnalyticsFilterService,
    revenueAnalyticsService: MerchantRevenueAnalyticsService,
    demographicAnalyticsService: MerchantDemographicAnalyticsService,
  );
  merchantDashboardAnalytics(
    merchant: Merchant,
    timeFrame?: string,
    startDate?: Date,
    endDate?: Date,
    _productIds?: string[],
    _categoryIds?: string[],
    _sortBy?: string,
    _sortOrder?: string,
    _page?: number,
    _limit?: number,
  ): Promise<any>;
  merchantPeriodComparison(
    merchant: Merchant,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    previousPeriodStart: Date,
    previousPeriodEnd: Date,
    productIds?: string[],
    categoryIds?: string[],
  ): Promise<any>;
  merchantPerformanceOverTime(
    merchant: Merchant,
    metricName: string,
    timeFrame?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any>;
  merchantConversionFunnel(
    merchant: Merchant,
    timeFrame?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any>;
  merchantOrganicVsPaidPerformance(
    merchant: Merchant,
    timeFrame?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any>;
  merchantMetricAggregation(
    merchant: Merchant,
    metricName: string,
    timeFrame?: string,
    aggregationFunction?: string,
    startDate?: Date,
    endDate?: Date,
    productId?: string,
    categoryId?: string,
  ): Promise<any[]>;
  merchantCompareTimePeriods(
    merchant: Merchant,
    metricName: string,
    currentStartDate: Date,
    currentEndDate: Date,
    previousStartDate: Date,
    previousEndDate: Date,
    productId?: string,
    categoryId?: string,
  ): Promise<any>;
  merchantTimeSeriesData(
    merchant: Merchant,
    metricName: string,
    timeFrame?: string,
    startDate?: Date,
    endDate?: Date,
    productId?: string,
    categoryId?: string,
  ): Promise<any[]>;
  merchantRollingAverages(
    merchant: Merchant,
    metricName: string,
    windowSize?: number,
    startDate?: Date,
    endDate?: Date,
    productId?: string,
    categoryId?: string,
  ): Promise<any[]>;
  merchantFilteredAnalytics(
    merchant: Merchant,
    timeFrame?: string,
    startDate?: Date,
    endDate?: Date,
    productIds?: string[],
    categoryIds?: string[],
    sortBy?: string,
    sortOrder?: string,
    page?: number,
    limit?: number,
  ): Promise<{
    data: import('../entities/merchant-analytics.entity').MerchantAnalytics[];
    total: number;
    page: number;
    limit: number;
  }>;
  merchantTopPerformingProducts(
    merchant: Merchant,
    metric?: string,
    timeFrame?: string,
    limit?: number,
    startDate?: Date,
    endDate?: Date,
    categoryIds?: string[],
  ): Promise<any[]>;
  merchantCategoryPerformance(
    merchant: Merchant,
    metric?: string,
    timeFrame?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]>;
  merchantProductPerformanceOverTime(
    merchant: Merchant,
    productId: string,
    metric?: string,
    timeFrame?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]>;
  merchantCategoryPerformanceOverTime(
    merchant: Merchant,
    categoryId: string,
    metric?: string,
    timeFrame?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]>;
  merchantCompareProducts(
    merchant: Merchant,
    productIds: string[],
    metric?: string,
    timeFrame?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any>;
  merchantRevenueAnalytics(
    merchant: Merchant,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    weekly: {
      date: Date;
      value: number;
    }[];
    monthly: {
      date: Date;
      value: number;
    }[];
    quarterly: {
      date: Date;
      value: number;
    }[];
    yearly: {
      date: Date;
      value: number;
    }[];
  }>;
  merchantConversionAnalytics(
    merchant: Merchant,
    timeFrame?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    conversionRateOverTime: any;
    clickThroughRateOverTime: any;
    cartAbandonmentRateOverTime: {
      date: Date;
      value: number;
    }[];
  }>;
  merchantImpressionAnalytics(
    merchant: Merchant,
    timeFrame?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    impressionsOverTime: {
      date: Date;
      organic: number;
      paid: number;
      total: number;
    }[];
  }>;
  merchantDemographicAnalytics(
    merchant: Merchant,
    timeFrame?: string,
    startDate?: Date,
    endDate?: Date,
    filters?: DemographicFilterInput[],
  ): Promise<{
    ageGroups: {
      distribution: {
        key: string;
        value: number;
        percentage: number;
      }[];
      averageAge: number;
      dominantAgeGroup: any;
    };
    location: {
      countries: {
        key: string;
        value: number;
        percentage: number;
      }[];
      regions: {
        key: string;
        value: number;
        percentage: number;
      }[];
      cities: {
        key: string;
        value: number;
        percentage: number;
      }[];
    };
    devices: {
      deviceTypes: {
        key: string;
        value: number;
        percentage: number;
      }[];
      browsers: {
        key: string;
        value: number;
        percentage: number;
      }[];
      operatingSystems: {
        key: string;
        value: number;
        percentage: number;
      }[];
    };
    gender: {
      key: string;
      value: number;
      percentage: number;
    }[];
    interests: {
      key: string;
      value: number;
      percentage: number;
    }[];
  }>;
  merchantEnhancedDashboardAnalytics(
    merchant: Merchant,
    timeFrame?: string,
    startDate?: Date,
    endDate?: Date,
    demographicFilters?: DemographicFilterInput[],
  ): Promise<any>;
}
