import { HighlightResult } from './highlight.dto';
export declare class PaginationInfo {
    total: number;
    page: number;
    limit: number;
    pages: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
export declare class CategoryFacet {
    name: string;
    count: number;
}
export declare class ValueFacet {
    name: string;
    count: number;
}
export declare class PriceFacet {
    min: number;
    max: number;
    ranges: PriceRange[];
}
export declare class PriceRange {
    min: number;
    max: number;
    count: number;
}
export declare class SearchMetadata {
    searchDuration: number;
    algorithm: string;
    testId?: string;
    variantId?: string;
    personalized?: boolean;
    personalizationStrength?: number;
}
export declare class TermFacet {
    name: string;
    count: number;
}
export declare class SearchFacets {
    categories: CategoryFacet[];
    values: ValueFacet[];
    price?: PriceFacet;
    brands?: TermFacet[];
    locations?: TermFacet[];
    entityTypes?: TermFacet[];
    merchants?: TermFacet[];
    ratings?: TermFacet[];
    foundedYears?: TermFacet[];
    tags?: TermFacet[];
    verificationStatus?: TermFacet[];
    colors?: TermFacet[];
    sizes?: TermFacet[];
    materials?: TermFacet[];
    inStock?: TermFacet[];
}
export declare class ProductSearchResult {
    id: string;
    highlights?: HighlightResult;
    title: string;
    description: string;
    price: number;
    image: string;
    brandName: string;
    brandId: string;
    categories: string[];
    values: string[];
    rating: number;
    reviewCount: number;
    isSponsored: boolean;
    score: number;
}
export declare class MerchantSearchResult {
    id: string;
    highlights?: HighlightResult;
    name: string;
    description: string;
    logo: string;
    location: string;
    categories: string[];
    values: string[];
    rating: number;
    reviewCount: number;
    isSponsored: boolean;
    score: number;
}
export declare class BrandSearchResult {
    id: string;
    highlights?: HighlightResult;
    name: string;
    description: string;
    logo: string;
    heroImage: string;
    location: string;
    categories: string[];
    values: string[];
    foundedYear: number;
    isSponsored: boolean;
    score: number;
}
export declare class SearchResponseDto {
    pagination: PaginationInfo;
    highlightsEnabled?: boolean;
    facets: SearchFacets;
    products?: ProductSearchResult[];
    merchants?: MerchantSearchResult[];
    brands?: BrandSearchResult[];
    query: string;
    usedNlp: boolean;
    processedQuery?: string;
    experimentVariant?: string;
    relevanceScores?: Record<string, number>;
    entityDistribution?: Record<string, number>;
    experimentId?: string;
    metadata?: SearchMetadata;
}
