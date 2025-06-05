/**
 * Type definitions for search functionality
 */

// Interface definitions for search facets
export interface FacetValue {
  value: string;      // From main branch definition
  id?: string;        // From feature branch definition
  name?: string;      // From feature branch definition
  count: number;
  min?: number;       // From main branch definition
  max?: number;       // From main branch definition
}

export interface FacetType {
  name: string;
  displayName?: string; // From main branch definition
  id?: string;         // From feature branch definition
  values: FacetValue[];
}

// Price range interfaces
export interface PriceRange {
  min: number;
  max: number;
}

export interface PartialPriceRange {
  min?: number;
  max?: number;
}

// Define sort options
export type SortOption = 'relevance' | 'price_low' | 'price_high' | 'price' | 'name' | 'newest' | 'rating';

/**
 * Search filters interface - combines properties from both branches
 * to ensure compatibility with all shop pages and components
 */
export interface SearchFilters {
  // Category filtering
  category?: string;
  subCategory?: string;
  categories?: string[];
  
  // Brand and merchant filtering
  brandName?: string;
  brand?: string[];
  merchantId?: string;
  
  // Price range filtering
  minPrice?: number;
  maxPrice?: number;
  priceRange?: PartialPriceRange;
  price?: {
    min?: number;
    max?: number;
  };
  
  // General facet values filtering
  values?: string[];
  
  // Sorting
  sortBy?: SortOption | string;
  sortDirection?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Search query
  query?: string;
  
  // Product availability
  inStock?: boolean;
  
  // Quick filter properties used in FilterPanel
  isNew?: boolean;
  isLocal?: boolean;
  freeShipping?: boolean;
  causes?: string[];
}

/**
 * Search result interface - combines properties from both branches
 * to ensure compatibility with all shop pages and components
 */
export interface SearchResult {
  id: string;
  name: string;
  type?: string;           
  description?: string;
  price: number;
  compareAtPrice?: number;
  imageUrl?: string;       
  images?: string[];       
  categories?: string[];   
  values?: string[];       
  brandName?: string;
  merchantId?: string;     
  score?: number;          
  isSponsored?: boolean;   
  inStock?: boolean;       
  category?: string;       
}

/**
 * Search response interface - combines properties from both branches
 */
export interface SearchResponse {
  results: SearchResult[];
  query: string;            
  total?: number;           
  page?: number;            
  limit?: number;           
  facets: FacetType[];
  pagination: {
    total: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
  isPersonalized?: boolean;
  experimentId?: string;
  appliedFilters?: string[];
}

/**
 * Standardized shop search results interface for use across all shop pages
 * This provides a consistent type for useState hooks in shop pages
 */
export interface ShopSearchResults {
  query: string;
  filters: SearchFilters;
  totalResults: number;
  products: import('@/types/products').Product[];
  suggestedFilters: string[];
}
