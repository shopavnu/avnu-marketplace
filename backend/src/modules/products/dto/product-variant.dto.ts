/**
 * Data transfer object for product variants
 */
export class ProductVariantDto {
  /**
   * Unique identifier for the variant
   */
  id?: string;

  /**
   * Title of the variant
   */
  title: string;

  /**
   * Price of the variant
   */
  price: number;

  /**
   * Optional compare-at price for showing discounts
   */
  compareAtPrice?: number;

  /**
   * Stock keeping unit identifier
   */
  sku?: string;

  /**
   * Current inventory quantity
   */
  inventoryQuantity?: number;

  /**
   * Options associated with this variant
   */
  options?: Record<string, string>[];
}
