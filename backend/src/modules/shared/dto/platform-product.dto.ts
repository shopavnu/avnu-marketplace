import { PlatformType } from '../enums/platform-type.enum';
import { PlatformProductVariantDto } from '../interfaces/product-integration.interface';

/**
 * Data Transfer Object for platform product data
 *
 * This DTO is used for exchanging product data with external platforms
 * like Shopify, WooCommerce, etc. It standardizes the format and ensures
 * consistent typing across different platform integrations.
 */
export class PlatformProductDto {
  /**
   * ID of the product (string format to ensure compatibility)
   */
  id?: string;

  /**
   * Name or title of the product
   */
  name: string;

  /**
   * Product description (may contain HTML)
   */
  description?: string;

  /**
   * Product price
   */
  price: number;

  /**
   * SKU (Stock Keeping Unit)
   */
  sku?: string;

  /**
   * Quantity available in inventory
   */
  quantity?: number;

  /**
   * Array of product image URLs
   */
  images?: string[];

  /**
   * Type of platform (SHOPIFY, WOOCOMMERCE, etc.)
   */
  platformType: PlatformType;

  /**
   * Categories for the product
   */
  categories?: string[];

  /**
   * Tags for the product
   */
  tags?: string[];

  /**
   * Variants of the product
   */
  variants?: PlatformProductVariantDto[];

  /**
   * Product attributes
   */
  attributes?: Record<string, string>;

  /**
   * Map for additional platform-specific fields
   */
  metadata?: Record<string, unknown>;
}
