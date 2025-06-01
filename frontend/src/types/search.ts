export interface PriceRange {
  min: number;
  max: number;
}

export interface PartialPriceRange {
  min?: number;
  max?: number;
}

export interface SearchFilters {
  // Keep all property names consistent with what's used in components
  categories?: string[];
  brandName?: string;
  merchantId?: string;
  priceRange?: PartialPriceRange;
  values?: string[];
  inStock?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface SearchResponse {
  query: string;
  pagination: {
    total: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
  results: SearchResult[];
  facets: FacetType[];
  isPersonalized: boolean;
  experimentId?: string;
  appliedFilters: string[];
}

export interface SearchResult {
  id: string;
  type: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categories: string[];
  values: string[];
  brandName: string;
  merchantId: string;
  score: number;
  isSponsored: boolean;
  inStock: boolean;
}

export interface FacetValue {
  value: string;
  count: number;
  min?: number;
  max?: number;
}

export interface FacetType {
  name: string;
  displayName: string;
  values: FacetValue[];
}
