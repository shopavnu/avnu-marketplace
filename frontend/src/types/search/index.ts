import { Product } from "../products";

export interface SearchFilters {
  isNew?: boolean;
  isLocal?: boolean;
  causes?: string[];
  category?: string;
  subCategory?: string;
  size?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  // Added for backward compatibility with existing code
  price?: {
    min?: number;
    max?: number;
  };
  // Added for backward compatibility with existing code
  brand?: string[];
  freeShipping?: boolean;
  rating?: number;
  sortBy?: "relevance" | "price_low" | "price_high" | "rating" | "newest";
}

export interface Cause {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  parentId: string;
  attributes?: ProductAttribute[];
}

export interface ProductAttribute {
  name: string;
  type: "size" | "color" | "material" | "style";
  values: string[];
}

export interface SearchResult {
  query: string;
  filters: SearchFilters;
  totalResults: number;
  products: Product[];
  suggestedFilters: SearchFilters[];
}
