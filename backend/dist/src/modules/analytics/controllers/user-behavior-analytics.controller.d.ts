import { UserBehaviorAnalyticsService } from '../services/user-behavior-analytics.service';
import { ScrollAnalytics } from '../entities/scroll-analytics.entity';
import { HeatmapData, InteractionType } from '../entities/heatmap-data.entity';
export declare class UserBehaviorAnalyticsController {
    private readonly userBehaviorAnalyticsService;
    constructor(userBehaviorAnalyticsService: UserBehaviorAnalyticsService);
    trackScrolling(data: Partial<ScrollAnalytics>): Promise<ScrollAnalytics>;
    trackHeatmapData(data: Partial<HeatmapData>): Promise<HeatmapData>;
    trackBatchHeatmapData(dataItems: Partial<HeatmapData>[]): Promise<HeatmapData[]>;
    getVerticalScrollingAnalytics(period?: number): Promise<any>;
    getHeatmapAnalytics(pagePath: string, period?: number, interactionType?: InteractionType): Promise<any>;
    getVerticalNavigationFunnel(period?: number): Promise<any>;
}
