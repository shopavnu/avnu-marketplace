// TEMPORARY: This file contains some unused types and variables that are expected to be used
// in future development (e.g., when integrating real merchant data or new features).
// NOTE: ESLint disables have been added to allow builds to pass during development.
// BEFORE PRODUCTION: Remove these disables and clean up all unused code.

import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ProductRating 
} from '@/types/products';
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
