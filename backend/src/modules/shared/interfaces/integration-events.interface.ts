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
   * Number of items created/added during the sync
   */
  created: number;

  /**
   * @deprecated Use created instead
   * Legacy property for backward compatibility
   */
  added?: number;

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

  /**
   * Total number of records processed
   * If not provided, it will be calculated as created + updated + failed
   */
  total?: number;

  /**
   * Alternative name for total
   * @deprecated Use total instead
   */
  totalProcessed?: number;

  /**
   * Optional errors by platform
   */
  platformErrors?: Record<string, string>;

  /**
   * Optional skipped records
   */
  skipped?: number;

  /**
   * Optional deleted records
   */
  deleted?: number;

  /**
   * Optional timestamp of the sync operation
   */
  timestamp?: Date;
}

/**
 * Integration event names
 */
export const INTEGRATION_EVENTS = {
  PRODUCT_IMPORTED: 'product.imported',
  PRODUCT_EXPORTED: 'product.exported',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  SYNC_STARTED: 'sync.started',
  SYNC_COMPLETED: 'sync.completed',
  WEBHOOK_RECEIVED: 'webhook.received',
};

/**
 * Base event interface for all integration events
 */
export interface BaseIntegrationEvent {
  /**
   * Unique ID for the event
   */
  eventId: string;

  /**
   * Timestamp when the event occurred
   */
  timestamp: Date;

  /**
   * Type of platform (SHOPIFY, WOOCOMMERCE, etc.)
   */
  platformType: string;

  /**
   * ID of the merchant in our system
   */
  merchantId: string;

  /**
   * Success or failure status
   */
  status: 'success' | 'failed';

  /**
   * Error message if status is 'failed'
   */
  errorMessage?: string;

  /**
   * Where the event originated from
   */
  origin: 'marketplace' | 'platform';
}

/**
 * Event emitted when a product is imported from an external platform
 */
export interface ProductImportedEvent extends BaseIntegrationEvent {
  /**
   * ID of the product on the external platform
   */
  externalProductId: string;

  /**
   * ID of the product in our system
   */
  internalProductId: string;

  /**
   * Product data that was imported
   */
  productData: unknown;
}

/**
 * Event emitted when a product is exported to an external platform
 */
export interface ProductExportedEvent extends BaseIntegrationEvent {
  /**
   * ID of the product on the external platform
   */
  externalProductId: string;

  /**
   * ID of the product in our system
   */
  internalProductId: string;

  /**
   * Product data that was exported
   */
  productData: unknown;
}

/**
 * Event emitted when a product is updated on an external platform
 */
export interface ProductUpdatedEvent extends BaseIntegrationEvent {
  /**
   * ID of the product on the external platform
   */
  externalProductId: string;

  /**
   * ID of the product in our system
   */
  internalProductId: string;

  /**
   * Fields that were updated
   */
  updatedFields: string[];
}

/**
 * Event emitted when a product is deleted from an external platform
 */
export interface ProductDeletedEvent extends BaseIntegrationEvent {
  /**
   * ID of the product on the external platform
   */
  externalProductId: string;

  /**
   * ID of the product in our system
   */
  internalProductId: string;
}

/**
 * Event emitted when a sync operation starts
 */
export interface SyncStartedEvent extends BaseIntegrationEvent {
  /**
   * Type of sync (products, orders, etc.)
   */
  syncType: string;

  /**
   * Store identifier (domain, URL, etc.)
   */
  storeIdentifier: string;
}

/**
 * Event emitted when a sync operation completes
 */
export interface SyncCompletedEvent extends BaseIntegrationEvent {
  /**
   * Type of sync (products, orders, etc.)
   */
  syncType: string;

  /**
   * Store identifier (domain, URL, etc.)
   */
  storeIdentifier: string;

  /**
   * Result of the sync operation
   */
  result: SyncResult;
}
