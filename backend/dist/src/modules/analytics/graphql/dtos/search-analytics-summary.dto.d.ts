import { QueryCountDto } from './query-count.dto';
export declare class SearchAnalyticsSummaryDto {
    topSearchQueries?: QueryCountDto[];
    zeroResultQueries?: QueryCountDto[];
    searchConversionRate?: number;
    searchClickThroughRate?: number;
    nlpVsRegularSearchAnalytics?: any;
    searchPerformance?: any;
    personalizedVsRegularSearchAnalytics?: any;
    searchTrends?: any;
}
