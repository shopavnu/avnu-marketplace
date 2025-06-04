/**
 * Type definitions for search functionality
 */

// Define the FacetType that components are looking for
export interface FacetType {
  id: string;
  name: string;
  values: FacetValue[];
}

// Define the FacetValue interface
export interface FacetValue {
  id: string;
  name: string;
  count: number;
}

// Define PartialPriceRange for price filtering
export interface PartialPriceRange {
  min?: number;
  max?: number;
}

// Define PriceRange (complete version)
export interface PriceRange {
  min: number;
  max: number;
}

// Define sort options
export type SortOption = 'relevance' | 'price_low' | 'price_high' | 'price' | 'name' | 'newest' | 'rating';

// Define the SearchFilters interface that matches how it's being used
export interface SearchFilters {
  // From the error messages, it seems there's confusion between 'category' and 'categories'
  // We'll include both to support existing code
  category?: string;
  categories?: string[];
  
  // Brand filtering
  brandName?: string;
  
  // Price range filtering
  priceRange?: PartialPriceRange;
  
  // General facet values filtering
  values?: string[];
  
  // Sorting
  sortBy?: SortOption;
  sortDirection?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Search query
  query?: string;
}

// Export any other types that might be needed by the search components
export interface SearchResult {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  brandName?: string;
  category?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  facets: FacetType[];
}
