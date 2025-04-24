export declare class LegacySearchFiltersInput {
    categories?: string[];
    priceMin?: number;
    priceMax?: number;
    merchantId?: string;
    inStock?: boolean;
    values?: string[];
    brandName?: string;
}
export declare class LegacySearchSortInput {
    field: string;
    order: 'asc' | 'desc';
}
export declare class LegacySearchOptionsInput {
    page?: number;
    limit?: number;
    filters?: LegacySearchFiltersInput;
    sort?: LegacySearchSortInput;
    includeMetadata?: boolean;
}
