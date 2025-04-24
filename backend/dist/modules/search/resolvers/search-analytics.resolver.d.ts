import { SearchAnalyticsService } from '../services/search-analytics.service';
import { SearchEventInput } from '../graphql/search-event.input';
import { User } from '../../users/entities/user.entity';
declare class TrackSearchEventResponse {
    success: boolean;
}
export declare class SearchAnalyticsResolver {
    private readonly searchAnalyticsService;
    private readonly logger;
    constructor(searchAnalyticsService: SearchAnalyticsService);
    trackSearchEvent(event: SearchEventInput, user?: User): Promise<TrackSearchEventResponse>;
}
export {};
