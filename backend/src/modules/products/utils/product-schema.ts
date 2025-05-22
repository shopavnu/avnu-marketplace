import { Product } from '../entities/product.entity';
// Import statement removed as these utilities weren't being used

/**
 * Product Schema Compatibility Utilities
 *
 * This module provides utilities for handling schema evolution in the Product entity.
 * It helps maintain backward compatibility when the Product schema changes over time.
 */

/**
 * Get the brand name from a product
 * Handles both old schema (product.brandName) and new schema (product.brandInfo)
 *
 * @param product Product or partial product
 * @returns Brand name or empty string if not available
 */
export function getBrandName(product: Product | Partial<Product> | null | undefined): string {
  if (!product) {
    return '';
  }

  // Try direct brandName property (old schema)
  if ('brandName' in product && typeof product['brandName'] === 'string') {
    return product['brandName'];
  }

  // Try brandInfo as string
  if (product.brandInfo && typeof product.brandInfo === 'string') {
    return product.brandInfo;
  }

  // Try brandInfo.name
  if (
    product.brandInfo &&
    typeof product.brandInfo === 'object' &&
    'name' in product.brandInfo &&
    typeof product.brandInfo.name === 'string'
  ) {
    return product.brandInfo.name;
  }

  // Try brandInfo.id
  if (
    product.brandInfo &&
    typeof product.brandInfo === 'object' &&
    'id' in product.brandInfo &&
    typeof product.brandInfo.id === 'string'
  ) {
    return product.brandInfo.id;
  }

  return '';
}

/**
 * Get the categories from a product
 * Handles both string[] and object[] representations
 *
 * @param product Product or partial product
 * @returns Array of category strings or empty array if not available
 */
export function getCategories(product: Product | Partial<Product> | null | undefined): string[] {
  if (!product || !product.categories) {
    return [];
  }

  // Handle array of strings
  if (
    Array.isArray(product.categories) &&
    product.categories.every(cat => typeof cat === 'string')
  ) {
    return product.categories;
  }

  // Handle array of objects with name property
  if (
    Array.isArray(product.categories) &&
    product.categories.some(cat => typeof cat === 'object')
  ) {
    return product.categories
      .map(cat => {
        if (typeof cat === 'string') return cat;
        if (typeof cat === 'object' && cat && 'name' in cat) {
          // Use type assertion to handle the property access safely
          return (cat as { name: string }).name;
        }
        return null;
      })
      .filter((cat): cat is string => cat !== null);
  }

  return [];
}

/**
 * Get the primary image URL from a product
 *
 * @param product Product or partial product
 * @returns Primary image URL or empty string if not available
 */
export function getPrimaryImage(product: Product | Partial<Product> | null | undefined): string {
  if (
    !product ||
    !product.images ||
    !Array.isArray(product.images) ||
    product.images.length === 0
  ) {
    return '';
  }

  return product.images[0];
}

/**
 * Get the price from a product
 * Handles both number and string representations
 *
 * @param product Product or partial product
 * @returns Price as a number or 0 if not available
 */
export function getPrice(product: Product | Partial<Product> | null | undefined): number {
  if (!product) {
    return 0;
  }

  if (typeof product.price === 'number') {
    return product.price;
  }

  if (typeof product.price === 'string') {
    const parsed = parseFloat(product.price);
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

/**
 * Get the title from a product
 *
 * @param product Product or partial product
 * @returns Title or empty string if not available
 */
export function getTitle(product: Product | Partial<Product> | null | undefined): string {
  if (!product) {
    return '';
  }

  return typeof product.title === 'string' ? product.title : '';
}

/**
 * Get the description from a product
 *
 * @param product Product or partial product
 * @returns Description or empty string if not available
 */
export function getDescription(product: Product | Partial<Product> | null | undefined): string {
  if (!product) {
    return '';
  }

  return typeof product.description === 'string' ? product.description : '';
}

/**
 * Get the in-stock status from a product
 *
 * @param product Product or partial product
 * @returns True if in stock, false otherwise
 */
export function getInStockStatus(product: Product | Partial<Product> | null | undefined): boolean {
  if (!product) {
    return false;
  }

  return product.inStock === true;
}

/**
 * Get the sale status from a product
 *
 * @param product Product or partial product
 * @returns True if on sale, false otherwise
 */
export function getOnSaleStatus(product: Product | Partial<Product> | null | undefined): boolean {
  if (!product) {
    return false;
  }

  return product.isOnSale === true;
}

/**
 * Get the discount percentage from a product
 *
 * @param product Product or partial product
 * @returns Discount percentage or 0 if not available
 */
export function getDiscountPercentage(
  product: Product | Partial<Product> | null | undefined,
): number {
  if (!product) {
    return 0;
  }

  if (typeof product.discountPercentage === 'number') {
    return product.discountPercentage;
  }

  if (typeof product.discountPercentage === 'string') {
    const parsed = parseFloat(product.discountPercentage);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Calculate discount percentage if we have both prices
  if (product.price !== undefined && product.compareAtPrice !== undefined) {
    const price = getPrice(product);
    const compareAtPrice = getCompareAtPrice(product);

    if (compareAtPrice > 0 && price < compareAtPrice) {
      return Math.round((1 - price / compareAtPrice) * 100);
    }
  }

  return 0;
}

/**
 * Get the compare-at price from a product
 *
 * @param product Product or partial product
 * @returns Compare-at price or 0 if not available
 */
export function getCompareAtPrice(product: Product | Partial<Product> | null | undefined): number {
  if (!product) {
    return 0;
  }

  if (typeof product.compareAtPrice === 'number') {
    return product.compareAtPrice;
  }

  if (typeof product.compareAtPrice === 'string') {
    const parsed = parseFloat(product.compareAtPrice);
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}
