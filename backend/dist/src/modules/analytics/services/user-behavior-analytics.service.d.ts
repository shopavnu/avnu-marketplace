import { Repository } from 'typeorm';
import { ScrollAnalytics } from '../entities/scroll-analytics.entity';
import { HeatmapData, InteractionType } from '../entities/heatmap-data.entity';
import { UserEngagement } from '../entities/user-engagement.entity';
export declare class UserBehaviorAnalyticsService {
    private readonly scrollAnalyticsRepository;
    private readonly heatmapDataRepository;
    private readonly userEngagementRepository;
    private readonly logger;
    constructor(scrollAnalyticsRepository: Repository<ScrollAnalytics>, heatmapDataRepository: Repository<HeatmapData>, userEngagementRepository: Repository<UserEngagement>);
    trackScrolling(data: Partial<ScrollAnalytics>): Promise<ScrollAnalytics>;
    trackHeatmapData(data: Partial<HeatmapData>): Promise<HeatmapData>;
    trackBatchHeatmapData(dataItems: Partial<HeatmapData>[]): Promise<HeatmapData[]>;
    getVerticalScrollingAnalytics(period?: number): Promise<any>;
    getHeatmapAnalytics(pagePath: string, period?: number, interactionType?: InteractionType): Promise<any>;
    getVerticalNavigationFunnel(period?: number): Promise<any>;
    private getScrollDepthConversionCorrelation;
}
