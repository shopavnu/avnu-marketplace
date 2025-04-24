export interface Brand {
  id: string;
  name: string;
  description: string;
  logo?: string;
  coverImage: string;
  values?: string[];
  location: string;
  categories: string[];
  primaryCategory: BrandCategory;
  secondaryCategories?: BrandCategory[];
  rating: number;
  isVerified: boolean;
  productCount: number;
  joinedDate: string;
}

export type BrandCategory = 
  | 'Apparel'
  | 'Accessories'
  | 'Home Goods'
  | 'Beauty'
  | 'Electronics'
  | 'Baby'
  | 'Pet Products'
  | 'Outdoor'
  | 'Sports'
  | 'Books'
  | 'Food & Beverage'
  | 'Art & Crafts'
  | 'Toys & Games'
  | 'Wellness'
  | 'Stationery';

export interface CategoryFilter {
  id: string;
  name: string;
  subCategory?: string;
}

export interface CategoryConfig {
  name: string;
  filters: CategoryFilter[];
  attributes?: {
    [key: string]: string[];
  };
  productCount: number;
  rating: number;
  isVerified: boolean;
  joinedDate: string;
}
