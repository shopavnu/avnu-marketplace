import { DiscoverySearchService } from '../services/discovery-search.service';
import { SearchResponseType } from '../graphql/search-response.type';
import { SearchOptionsInput } from '../dto/search-options.dto';
export declare class DiscoverySearchResolver {
    private readonly discoverySearchService;
    constructor(discoverySearchService: DiscoverySearchService);
    discoverySearch(context: any, query?: string, options?: SearchOptionsInput): Promise<SearchResponseType>;
    discoverySuggestions(query: string, limit?: number): Promise<any>;
    discoveryHomepage(context: any, options?: SearchOptionsInput): Promise<any>;
}
