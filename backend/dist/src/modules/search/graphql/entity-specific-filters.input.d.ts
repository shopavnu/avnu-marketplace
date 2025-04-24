import { SortOrder } from '../dto/search-options.dto';
export declare class ProductFilterInput {
    categories?: string[];
    tags?: string[];
    values?: string[];
    brandIds?: string[];
    merchantIds?: string[];
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStock?: boolean;
    onSale?: boolean;
    colors?: string[];
    sizes?: string[];
    materials?: string[];
}
export declare class MerchantFilterInput {
    categories?: string[];
    values?: string[];
    locations?: string[];
    minRating?: number;
    verifiedOnly?: boolean;
    activeOnly?: boolean;
    minProductCount?: number;
}
export declare class BrandFilterInput {
    categories?: string[];
    values?: string[];
    locations?: string[];
    verifiedOnly?: boolean;
    activeOnly?: boolean;
    minFoundedYear?: number;
    maxFoundedYear?: number;
    minProductCount?: number;
}
export declare class EntitySortOptionInput {
    field: string;
    order: SortOrder;
}
export declare class EntityBoostingInput {
    productBoost: number;
    merchantBoost: number;
    brandBoost: number;
}
export declare class EnhancedSearchInput {
    query?: string;
    page: number;
    limit: number;
    enableNlp: boolean;
    personalized: boolean;
    productFilters?: ProductFilterInput;
    merchantFilters?: MerchantFilterInput;
    brandFilters?: BrandFilterInput;
    entityBoosting?: EntityBoostingInput;
    sortOptions?: EntitySortOptionInput[];
    boostByValues: boolean;
    includeSponsoredContent: boolean;
    experimentId?: string;
    enableHighlighting?: boolean;
    highlightFields?: string[];
    highlightPreTag?: string;
    highlightPostTag?: string;
    highlightFragmentSize?: number;
}
