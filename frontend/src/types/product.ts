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
  
  // Inventory fields
  inStock?: boolean;
  quantity?: number;
  lowStockThreshold?: number; // Threshold to show "low stock" indicator
  
  // Variant fields
  hasVariants?: boolean;
  variants?: ProductVariant[];
  variantOptions?: VariantOption[]; // Available option types like "Size", "Color"
  selectedVariantId?: string; // Currently selected variant
  
  attributes?: Record<string, string>;
  // Personalization tracking fields
  viewCount?: number;
  totalViewTimeSeconds?: number;
  lastViewed?: number;
  // Suppression fields
  isSuppressed?: boolean;
  suppressedFrom?: string[];
  lastValidationDate?: string;
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
 * Product variant definition
 */
export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  inventoryQuantity: number;
  inStock: boolean;
  options: Record<string, string>; // e.g. { "Size": "M", "Color": "Blue" }
  imageUrl?: string; // Optional specific image for this variant
}

/**
 * Variant option type (e.g., "Size", "Color")
 */
export interface VariantOption {
  name: string; // e.g., "Size", "Color"
  values: string[]; // e.g., ["S", "M", "L"] or ["Red", "Blue", "Green"]
}

/**
 * Inventory status enumeration for UI indicators
 */
export enum InventoryStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
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
