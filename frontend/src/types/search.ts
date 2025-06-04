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

// Search filters interface - merged from both branches
export interface SearchFilters {
  // From both branches
  category?: string;
  categories?: string[];
  
  // Brand and merchant filtering
  brandName?: string;
  merchantId?: string;
  
  // Price range filtering
  priceRange?: PartialPriceRange;
  
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
  
  // Additional filters from main branch
  inStock?: boolean;
}

// Search result interfaces - merged from both branches
export interface SearchResult {
  id: string;
  name: string;
  type?: string;            // From main branch
  description?: string;
  price: number;
  compareAtPrice?: number;  // From main branch
  imageUrl?: string;        // From feature branch
  images?: string[];        // From main branch
  categories?: string[];    // From main branch
  values?: string[];        // From main branch
  brandName?: string;
  merchantId?: string;      // From main branch
  score?: number;           // From main branch
  isSponsored?: boolean;    // From main branch
  inStock?: boolean;        // From main branch
  category?: string;        // From feature branch
}

// Search response interface - merged from both branches
export interface SearchResponse {
  results: SearchResult[];
  query?: string;            // From main branch
  total?: number;            // From feature branch
  page?: number;             // From feature branch
  limit?: number;            // From feature branch
  facets: FacetType[];
  pagination?: {             // From main branch
    total: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
  isPersonalized?: boolean;  // From main branch
  experimentId?: string;     // From main branch
  appliedFilters?: string[]; // From main branch
}
