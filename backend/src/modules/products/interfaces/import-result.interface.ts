/**
 * Interface representing the result of a product import operation
 */
export interface ImportResult {
  /**
   * Number of products successfully created
   */
  created: number;

  /**
   * Number of products successfully updated
   */
  updated: number;

  /**
   * Number of products that failed to import
   */
  failed: number;

  /**
   * Optional array of error messages for failed imports
   */
  errors?: string[];

  /**
   * Optional array of warning messages
   */
  warnings?: string[];

  /**
   * Optional array of successfully imported product IDs
   */
  successIds?: string[];

  /**
   * Optional array of failed product IDs or identifiers
   */
  failedIds?: string[];
}
