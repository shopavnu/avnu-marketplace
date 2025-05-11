import { AnonymousUserAnalyticsService } from '../services/anonymous-user-analytics.service';
import { AnonymousUserMetricsDto } from '../dto/anonymous-user-metrics.dto';
export declare class AnonymousUserAnalyticsResolver {
  private readonly anonymousUserAnalyticsService;
  constructor(anonymousUserAnalyticsService: AnonymousUserAnalyticsService);
  getAnonymousUserMetrics(period?: number): Promise<AnonymousUserMetricsDto>;
}
