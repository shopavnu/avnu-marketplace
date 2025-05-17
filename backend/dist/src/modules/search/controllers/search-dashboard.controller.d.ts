import { SearchMonitoringService, PerformanceStats } from '../services/search-monitoring.service';
import { SearchAnalyticsService } from '../../analytics/services/search-analytics.service';
import { SearchExperimentService } from '../services/search-experiment.service';
import { Timeframe } from '../enums/timeframe.enum';
export declare class SearchDashboardController {
    private readonly searchMonitoringService;
    private readonly searchAnalyticsService;
    private readonly searchExperimentService;
    private readonly logger;
    constructor(searchMonitoringService: SearchMonitoringService, searchAnalyticsService: SearchAnalyticsService, searchExperimentService: SearchExperimentService);
    getPerformanceStats(timeframe?: string): Promise<PerformanceStats>;
    getRelevanceMetrics(_timeframe?: string): Promise<{
        message: string;
    }>;
    getTopSearchQueries(limit?: number, timeframe?: Timeframe): Promise<any[]>;
    getZeroResultQueries(limit?: number, timeframe?: Timeframe): Promise<any[]>;
    getEntityDistribution(_timeframe?: string): Promise<{
        message: string;
    }>;
    getSearchConversionRate(timeframe?: Timeframe): Promise<number>;
    getExperiments(): Promise<import("../services/search-experiment.service").SearchExperiment[]>;
    getExperiment(id: string): Promise<import("../services/search-experiment.service").SearchExperiment>;
    getExperimentResults(id: string): Promise<{
        message: string;
    }>;
    getHealthStatus(): Promise<{
        message: string;
    }>;
    getSearchPaths(_limit?: number): Promise<{
        message: string;
    }>;
    getSearchRefinements(_limit?: number): Promise<{
        message: string;
    }>;
    getValueAlignmentMetrics(): Promise<{
        message: string;
    }>;
}
