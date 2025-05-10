/**
 * Interface for integration sync results
 * Provides a standardized format for reporting sync operations results
 */
export interface SyncResult {
  /**
   * Whether the sync operation was successful overall
   */
  success: boolean;

  /**
   * Number of items added during the sync
   */
  added: number;

  /**
   * Number of items updated during the sync
   */
  updated: number;

  /**
   * Number of items that failed to sync
   */
  failed: number;

  /**
   * Array of error messages if any occurred during sync
   */
  errors: string[];
}

/**
 * Interface for platform integration events
 * This interface defines events that can be emitted by platform integrations
 */
export interface IntegrationEvents {
  /**
   * Event emitted when a sync operation starts
   * @param storeIdentifier The store identifier (domain, URL, etc.)
   * @param syncType The type of sync (products, orders, etc.)
   */
  onSyncStart?(storeIdentifier: string, syncType: string): void;

  /**
   * Event emitted when a sync operation completes
   * @param storeIdentifier The store identifier (domain, URL, etc.)
   * @param syncType The type of sync (products, orders, etc.)
   * @param result The result of the sync operation
   */
  onSyncComplete?(storeIdentifier: string, syncType: string, result: SyncResult): void;

  /**
   * Event emitted when a product is created on the platform
   * @param merchantId The merchant ID
   * @param platformProductId The platform's product ID
   * @param productData The product data
   */
  onProductCreated?(merchantId: string, platformProductId: string, productData: unknown): void;

  /**
   * Event emitted when a product is updated on the platform
   * @param merchantId The merchant ID
   * @param platformProductId The platform's product ID
   * @param productData The updated product data
   */
  onProductUpdated?(merchantId: string, platformProductId: string, productData: unknown): void;

  /**
   * Event emitted when a product is deleted from the platform
   * @param merchantId The merchant ID
   * @param platformProductId The platform's product ID
   */
  onProductDeleted?(merchantId: string, platformProductId: string): void;
}
