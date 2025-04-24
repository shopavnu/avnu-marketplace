import { ProductRating } from '@/types/products';
import { BrandCategory } from '@/types/brand';

/**
 * Represents a brand in the marketplace
 */
export interface Brand {
  id: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  values: string[];
  location: string;
  categories: string[];
  primaryCategory: BrandCategory;
  secondaryCategories?: BrandCategory[];
  rating?: number;
  isVerified: boolean;
  productCount?: number;
  joinedDate: string;
}
