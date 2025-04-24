import { Product } from './products';
import { Brand } from './brand';

export interface Category {
  id: string;
  name: string;
  subCategories: string[];
}

export interface SearchFilters {
  [key: string]: string | string[] | number | undefined;

  category?: string;
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  location?: string;
  // Product attributes
  size?: string[];
  color?: string[];
  material?: string[];
  style?: string[];
  brand?: string[];
  condition?: string[];
  features?: string[];
  // Beauty specific
  skinType?: string[];
  concern?: string[];
  formulation?: string[];
  benefits?: string[];
  // Room specific
  room?: string[];
}

export interface SearchResult {
  query: string;
  filters: SearchFilters;
  totalResults: number;
  products?: Product[];
  brands?: Brand[];
  suggestedFilters: {
    name: string;
    value: string;
    count: number;
  }[];
}
