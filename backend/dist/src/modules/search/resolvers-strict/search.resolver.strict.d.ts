import { SearchService } from '../services/search.service.fixed.v4';
import { SearchResponseType } from '../types/search-response.type';
import { SearchOptions } from '../dto/search-options.dto';
export declare class SearchResolverStrict {
    private readonly searchService;
    private readonly logger;
    constructor(searchService: SearchService);
    search(query: string, options?: SearchOptions): Promise<SearchResponseType>;
    searchSuggestions(prefix: string, limit?: number): Promise<string[]>;
    private mapProductsToProductType;
    private mapMerchantsToMerchantType;
    private mapCategoriesToCategoryType;
}
