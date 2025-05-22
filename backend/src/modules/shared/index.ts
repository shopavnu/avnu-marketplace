/**
 * Shared types and constants for the Avnu Marketplace backend
 */

/**
 * Enum for supported e-commerce platform types
 */
export enum PlatformType {
  SHOPIFY = 'SHOPIFY',
  WOOCOMMERCE = 'WOOCOMMERCE',
  MAGENTO = 'MAGENTO',
  BIGCOMMERCE = 'BIGCOMMERCE',
  CUSTOM = 'CUSTOM',
}

/**
 * Interface for synchronization operation results
 */
export interface SyncResult {
  /** Number of new items created during sync */
  created: number;
  /** Number of existing items updated during sync */
  updated: number;
  /** Number of items that failed to sync */
  failed: number;
  /** Total number of items processed */
  total: number;
  /** Array of error messages, if any */
  errors: string[];
  /** Overall success status of the sync operation */
  success: boolean;
}
