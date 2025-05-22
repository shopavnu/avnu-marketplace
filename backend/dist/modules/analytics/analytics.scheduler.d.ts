import { AnalyticsService } from './services/analytics.service';
import { BusinessMetricsService } from './services/business-metrics.service';
export declare class AnalyticsScheduler {
  private readonly analyticsService;
  private readonly businessMetricsService;
  private readonly logger;
  constructor(analyticsService: AnalyticsService, businessMetricsService: BusinessMetricsService);
  calculateHourlyConversionRates(): Promise<void>;
  calculateWeeklyMetrics(): Promise<void>;
  calculateMonthlyMetrics(): Promise<void>;
}
