import { Repository } from 'typeorm';
import { SearchAnalytics } from '../entities/search-analytics.entity';
import { SearchEntityType } from '../../search/enums/search-entity-type.enum';
export declare class SearchAnalyticsService {
    private readonly searchAnalyticsRepository;
    private readonly logger;
    constructor(searchAnalyticsRepository: Repository<SearchAnalytics>);
    trackSearch(data: Partial<SearchAnalytics>): Promise<SearchAnalytics>;
    trackEvent(event: string, data: any): Promise<void>;
    trackSearchResultClick(searchId: string): Promise<SearchAnalytics>;
    trackSearchConversion(searchId: string): Promise<SearchAnalytics>;
    getTopSearchQueries(limit?: number, period?: number): Promise<any[]>;
    getZeroResultQueries(limit?: number, period?: number): Promise<any[]>;
    getSearchConversionRate(period?: number): Promise<number>;
    getSearchClickThroughRate(period?: number): Promise<number>;
    getSearchAnalyticsByTimePeriod(period?: number, interval?: 'day' | 'week' | 'month'): Promise<any[]>;
    getNlpVsRegularSearchAnalytics(period?: number): Promise<any>;
    getEntitySearchAnalytics(entityType: SearchEntityType, period?: number): Promise<any>;
    getPersonalizedVsRegularSearchAnalytics(period?: number): Promise<any>;
}
