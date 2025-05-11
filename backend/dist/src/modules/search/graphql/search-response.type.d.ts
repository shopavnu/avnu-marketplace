export declare class PaginationType {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export declare class FacetValueType {
  value: string;
  count: number;
  selected?: boolean;
}
export declare class FacetType {
  name: string;
  displayName: string;
  values: FacetValueType[];
}
export declare class HighlightFieldType {
  field: string;
  snippets: string[];
}
export declare class HighlightResultType {
  fields: HighlightFieldType[];
  matchedTerms?: string[];
}
export declare class ProductResultType {
  id: string;
  title: string;
  description?: string;
  highlights?: HighlightResultType;
  price: number;
  salePrice?: number;
  inStock: boolean;
  onSale?: boolean;
  rating?: number;
  reviewCount?: number;
  images?: string[];
  thumbnailImage?: string;
  categories?: string[];
  tags?: string[];
  values?: string[];
  brandId?: string;
  brandName?: string;
  merchantId?: string;
  merchantName?: string;
  colors?: string[];
  sizes?: string[];
  materials?: string[];
  relevanceScore?: number;
  sponsored?: boolean;
}
export declare class MerchantResultType {
  id: string;
  name: string;
  description?: string;
  highlights?: HighlightResultType;
  logo?: string;
  coverImage?: string;
  images?: string[];
  categories?: string[];
  values?: string[];
  location?: string;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  active?: boolean;
  productCount?: number;
  relevanceScore?: number;
  sponsored?: boolean;
}
export declare class BrandResultType {
  id: string;
  name: string;
  description?: string;
  highlights?: HighlightResultType;
  logo?: string;
  coverImage?: string;
  images?: string[];
  categories?: string[];
  values?: string[];
  location?: string;
  foundedYear?: number;
  story?: string;
  verified?: boolean;
  active?: boolean;
  productCount?: number;
  relevanceScore?: number;
  sponsored?: boolean;
}
export declare const SearchResultUnion: ProductResultType | MerchantResultType | BrandResultType;
export declare class EntityRelevanceScoresType {
  products: number;
  merchants: number;
  brands: number;
}
export declare class EntityDistributionType {
  products: number;
  merchants: number;
  brands: number;
}
export declare class SearchResponseType {
  query?: string;
  pagination: PaginationType;
  results: (typeof SearchResultUnion)[];
  highlightsEnabled: boolean;
  facets?: FacetType[];
  relevanceScores?: EntityRelevanceScoresType;
  entityDistribution?: EntityDistributionType;
  isNlpEnabled?: boolean;
  isPersonalized?: boolean;
  experimentId?: string;
  appliedFilters?: string[];
}
