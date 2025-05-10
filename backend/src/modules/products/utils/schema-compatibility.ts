import { Product } from '../entities/product.entity';
import * as ProductSchema from './product-schema';

/**
 * Schema compatibility utilities to handle schema evolution in the Product entity
 * These helpers abstract away schema differences to provide consistent access patterns
 *
 * @deprecated Use the individual functions from product-schema.ts instead
 */
export class SchemaCompatibility {
  /**
   * Safely get the brand name from a product
   * Handles both old schema (product.brandName) and new schema (product.brandInfo)
   *
   * @param product Product or partial product object
   * @returns Brand name string or empty string if not available
   * @deprecated Use getBrandName from product-schema.ts instead
   */
  static getBrandName(product: Product | Partial<Product> | null | undefined): string {
    return ProductSchema.getBrandName(product);
  }

  /**
   * Safely get the product categories
   * Handles both string[] and object[] representations
   *
   * @param product Product or partial product object
   * @returns Array of category strings or empty array if not available
   * @deprecated Use getCategories from product-schema.ts instead
   */
  static getCategories(product: Product | Partial<Product> | null | undefined): string[] {
    return ProductSchema.getCategories(product);
  }

  /**
   * Safely get the primary image URL from a product
   *
   * @param product Product or partial product object
   * @returns Primary image URL or empty string if not available
   * @deprecated Use getPrimaryImage from product-schema.ts instead
   */
  static getPrimaryImage(product: Product | Partial<Product> | null | undefined): string {
    return ProductSchema.getPrimaryImage(product);
  }

  /**
   * Safely get the product price
   * Handles both number and string representations
   *
   * @param product Product or partial product object
   * @returns Price as a number or 0 if not available
   * @deprecated Use getPrice from product-schema.ts instead
   */
  static getPrice(product: Product | Partial<Product> | null | undefined): number {
    return ProductSchema.getPrice(product);
  }
}
