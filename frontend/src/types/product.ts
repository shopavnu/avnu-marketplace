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
  tags?: string[];
  merchantId: string;
  brandName: string;
  externalId?: string;
  externalSource?: string;
  slug?: string;
  featured?: boolean;
  isOnSale?: boolean;
  discountPercentage?: number;
  inStock?: boolean;
  quantity?: number;
  attributes?: Record<string, string>;
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
