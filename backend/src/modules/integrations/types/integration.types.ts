/**
 * Integration types for platform integrations
 */

/**
 * Supported platform types
 */
export enum PlatformType {
  SHOPIFY = 'shopify',
  WOOCOMMERCE = 'woocommerce',
  BIGCOMMERCE = 'bigcommerce',
  MAGENTO = 'magento',
  CUSTOM = 'custom',
}

/**
 * Sync status for orders and fulfillments
 */
export enum SyncStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SYNCED = 'synced',
  FAILED = 'failed',
}

/**
 * Result of a sync operation
 */
export interface SyncResult {
  /**
   * Number of records created
   */
  created: number;

  /**
   * Number of records updated
   */
  updated: number;

  /**
   * Number of records that failed to sync
   */
  failed: number;

  /**
   * Optional errors by platform
   */
  platformErrors?: Record<string, string>;
}

/**
 * Item to be refunded
 */
export interface RefundItem {
  /**
   * ID of the item to refund
   */
  id: string;

  /**
   * Quantity to refund
   */
  quantity: number;

  /**
   * Optional amount to refund per item
   */
  amount?: number;

  /**
   * Optional reason for the refund
   */
  reason?: string;
}

/**
 * Fulfillment data for pushing to external platforms
 */
export interface FulfillmentData {
  /**
   * Tracking number for the shipment
   */
  trackingNumber?: string;

  /**
   * URL to track the shipment
   */
  trackingUrl?: string;

  /**
   * Shipping carrier
   */
  carrier?: string;

  /**
   * Items included in the fulfillment
   */
  items?: Array<{
    id: string;
    quantity: number;
  }>;
}

/**
 * Custom error class for order sync operations
 */
export class OrderSyncError extends Error {
  /**
   * Context information about the error
   */
  context: Record<string, unknown>;

  /**
   * Create a new OrderSyncError
   * @param message Error message
   * @param context Additional context information
   */
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message);
    this.name = 'OrderSyncError';
    this.context = context;
  }
}

/**
 * Webhook event types
 */
export enum WebhookEventType {
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_CANCELLED = 'order.cancelled',
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',
  INVENTORY_UPDATED = 'inventory.updated',
  FULFILLMENT_CREATED = 'fulfillment.created',
  FULFILLMENT_UPDATED = 'fulfillment.updated',
  REFUND_CREATED = 'refund.created',
}

/**
 * Webhook payload interface
 */
export interface WebhookPayload {
  /**
   * Event type
   */
  eventType: WebhookEventType;

  /**
   * Shop or store identifier
   */
  shop: string;

  /**
   * Platform type
   */
  platform: PlatformType;

  /**
   * External ID of the resource
   */
  resourceId: string;

  /**
   * Resource data
   */
  data: Record<string, unknown>;

  /**
   * Timestamp of the event
   */
  timestamp: string;
}

/**
 * Platform connection status
 */
export enum ConnectionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  ERROR = 'error',
}

/**
 * Platform capabilities
 */
export enum PlatformCapability {
  ORDERS = 'orders',
  PRODUCTS = 'products',
  INVENTORY = 'inventory',
  FULFILLMENTS = 'fulfillments',
  CUSTOMERS = 'customers',
  REFUNDS = 'refunds',
  SHIPPING = 'shipping',
  WEBHOOKS = 'webhooks',
}

/**
 * Platform connection configuration
 */
export interface PlatformConnectionConfig {
  /**
   * API key or client ID
   */
  apiKey?: string;

  /**
   * API secret or client secret
   */
  apiSecret?: string;

  /**
   * Access token
   */
  accessToken?: string;

  /**
   * Refresh token
   */
  refreshToken?: string;

  /**
   * Token expiration date
   */
  tokenExpiresAt?: Date;

  /**
   * Shop or store domain
   */
  shopDomain?: string;

  /**
   * API endpoint URL
   */
  apiUrl?: string;

  /**
   * Webhook secret for validating webhook requests
   */
  webhookSecret?: string;

  /**
   * Additional platform-specific settings
   */
  settings?: Record<string, unknown>;
}
