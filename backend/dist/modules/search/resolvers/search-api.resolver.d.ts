import { NlpSearchService } from '../services/nlp-search.service';
import { SimpleSearchService } from '../services/simple-search.service';
import { SearchOptionsInput } from '../dto/search-options.dto';
import { SearchResponseDto, ProductSearchResult, MerchantSearchResult, BrandSearchResult, PaginationInfo, SearchFacets } from '../dto/search-response.dto';
import { User } from '../../users/entities/user.entity';
import { AnalyticsService } from '../../analytics/services/analytics.service';
export declare class SearchApiResolver {
    private readonly nlpSearchService;
    private readonly simpleSearchService;
    private readonly analyticsService;
    private readonly logger;
    constructor(nlpSearchService: NlpSearchService, simpleSearchService: SimpleSearchService, analyticsService: AnalyticsService);
    search(input: SearchOptionsInput, user?: User): Promise<SearchResponseDto>;
    searchProducts(input: SearchOptionsInput, user?: User): Promise<SearchResponseDto>;
    searchMerchants(input: SearchOptionsInput, user?: User): Promise<SearchResponseDto>;
    searchBrands(input: SearchOptionsInput, user?: User): Promise<SearchResponseDto>;
    searchAll(input: SearchOptionsInput, user?: User): Promise<SearchResponseDto>;
    processQuery(query: string, user: User): Promise<SearchResponseDto>;
    products(searchResponse: SearchResponseDto): ProductSearchResult[];
    merchants(searchResponse: SearchResponseDto): MerchantSearchResult[];
    brands(searchResponse: SearchResponseDto): BrandSearchResult[];
    pagination(searchResponse: SearchResponseDto): PaginationInfo;
    facets(searchResponse: SearchResponseDto): SearchFacets;
}
