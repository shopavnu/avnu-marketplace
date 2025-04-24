import { SearchService } from './search.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
declare class SearchFiltersInput {
    categories?: string[];
    priceMin?: number;
    priceMax?: number;
    merchantId?: string;
    inStock?: boolean;
    values?: string[];
    brandName?: string;
}
declare class SortInput {
    field: string;
    order: 'asc' | 'desc';
}
export declare class SearchResolver {
    private readonly searchService;
    constructor(searchService: SearchService);
    searchProducts(query: string, paginationDto: PaginationDto, filters?: SearchFiltersInput, sort?: SortInput): Promise<{
        items: import("../products").Product[];
        total: number;
        metadata?: any;
    }>;
    getProductSuggestions(query: string, limit?: number): Promise<string[]>;
    getRelatedProducts(productId: string, limit?: number): Promise<import("../products").Product[]>;
    getTrendingProducts(limit?: number): Promise<import("../products").Product[]>;
    getDiscoveryProducts(userId?: string, limit?: number, values?: string[]): Promise<import("../products").Product[]>;
    naturalLanguageSearch(query: string, paginationDto: PaginationDto): Promise<{
        items: import("../products").Product[];
        total: number;
        metadata?: any;
    }>;
    searchAll(query: string, paginationDto: PaginationDto): Promise<{
        products: {
            items: import("../products").Product[];
            total: number;
        };
        merchants: {
            items: any[];
            total: number;
        };
        brands: {
            items: any[];
            total: number;
        };
    }>;
    reindexAllProducts(): Promise<boolean>;
}
export {};
