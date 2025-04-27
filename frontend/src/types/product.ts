/**
 * Product type definition for the Avnu Marketplace
 * Used by product cards and product detail pages
 */
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  mobileImages?: string[]; // URLs for mobile-sized images (400x400)
  tabletImages?: string[]; // URLs for tablet-sized images (600x600)
  imageMetadata?: ImageMetadata[];
  categories: string[];
  categoryId?: string; // Primary category ID for personalization tracking
  tags?: string[];
  merchantId: string;
  brandName: string; // Used as brandId in personalization tracking
  brandId?: string; // Optional explicit brand ID
  externalId?: string;
  externalSource?: string;
  slug?: string;
  featured?: boolean;
  isOnSale?: boolean;
  discountPercentage?: number;
  inStock?: boolean;
  quantity?: number;
  attributes?: Record<string, string>;
  // Personalization tracking fields
  viewCount?: number;
  totalViewTimeSeconds?: number;
  lastViewed?: number;
}

/**
 * Image metadata for product images
 */
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  aspectRatio?: number;
  size?: number;
}

/**
 * Product section for batch loading
 */
export interface ProductSection {
  id: string;
  title: string;
  items: Product[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}
