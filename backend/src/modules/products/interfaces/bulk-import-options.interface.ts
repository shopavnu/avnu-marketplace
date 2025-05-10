import { DataSource } from '../enums/data-source.enum';

/**
 * Interface representing options for bulk product imports
 */
export interface BulkImportOptions {
  /**
   * Data source for the import
   */
  source: DataSource;

  /**
   * Whether to skip validation
   */
  skipValidation?: boolean;

  /**
   * Whether to update existing products if found
   */
  updateExisting?: boolean;

  /**
   * Whether to process images
   */
  processImages?: boolean;

  /**
   * Whether to generate slugs
   */
  generateSlugs?: boolean;

  /**
   * Batch size for processing
   */
  batchSize?: number;

  /**
   * Merchant ID to associate products with
   */
  merchantId?: string;

  /**
   * Whether to normalize data before import
   */
  normalize?: boolean;

  /**
   * Custom mapping for fields
   */
  fieldMapping?: Record<string, string>;
}
