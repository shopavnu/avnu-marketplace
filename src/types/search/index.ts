import { Product } from '../products';
import { Brand } from '../brand';

export interface SearchFilters {
  categories?: string[];
  causes?: string[];
  attributes?: Record<string, Record<string, string[]>>;
  isLocal?: boolean;
  isNew?: boolean;
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
  attributes: ProductAttribute[];
}

export interface ProductAttribute {
  name: string;
  type: 'size' | 'color' | 'material' | 'style';
  values: string[];
}

export interface SearchResult {
  query: string;
  filters: SearchFilters;
  totalResults: number;
  products: Product[];
  brands: Brand[];
  suggestedFilters: SearchFilters[];
}
