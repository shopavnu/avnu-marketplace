import { UserBehaviorAnalyticsService } from '../services/user-behavior-analytics.service';
import { ScrollAnalytics } from '../entities/scroll-analytics.entity';
import { HeatmapData, InteractionType } from '../entities/heatmap-data.entity';
export declare class UserBehaviorAnalyticsResolver {
    private readonly userBehaviorAnalyticsService;
    constructor(userBehaviorAnalyticsService: UserBehaviorAnalyticsService);
    trackScrolling(data: Partial<ScrollAnalytics>): Promise<ScrollAnalytics>;
    trackHeatmapData(data: Partial<HeatmapData>): Promise<HeatmapData>;
    trackBatchHeatmapData(dataItems: Partial<HeatmapData>[]): Promise<HeatmapData[]>;
    verticalScrollingAnalytics(period?: number): Promise<any>;
    heatmapAnalytics(pagePath: string, period?: number, interactionType?: InteractionType): Promise<any>;
    verticalNavigationFunnel(period?: number): Promise<any>;
}
