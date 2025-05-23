import { AnalyticsDashboardService } from '../services/analytics-dashboard.service';
export declare class AnalyticsDashboardResolver {
    private readonly analyticsDashboardService;
    constructor(analyticsDashboardService: AnalyticsDashboardService);
    dashboardOverview(period: number): Promise<any>;
    searchPerformance(period: number): Promise<any>;
    entitySearchPerformance(period: number): Promise<any>;
    userPreferenceAnalytics(limit: number): Promise<any>;
    abTestingAnalytics(): Promise<any>;
    personalizationEffectiveness(period: number): Promise<any>;
}
