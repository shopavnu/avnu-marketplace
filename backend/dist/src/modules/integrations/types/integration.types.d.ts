export declare enum PlatformType {
  SHOPIFY = 'shopify',
  WOOCOMMERCE = 'woocommerce',
  BIGCOMMERCE = 'bigcommerce',
  MAGENTO = 'magento',
  CUSTOM = 'custom',
}
export declare enum SyncStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SYNCED = 'synced',
  FAILED = 'failed',
}
export interface SyncResult {
  created: number;
  updated: number;
  failed: number;
  platformErrors?: Record<string, string>;
}
export interface RefundItem {
  id: string;
  quantity: number;
  amount?: number;
  reason?: string;
}
export interface FulfillmentData {
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  items?: Array<{
    id: string;
    quantity: number;
  }>;
}
export declare class OrderSyncError extends Error {
  context: Record<string, unknown>;
  constructor(message: string, context?: Record<string, unknown>);
}
export declare enum WebhookEventType {
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
export interface WebhookPayload {
  eventType: WebhookEventType;
  shop: string;
  platform: PlatformType;
  resourceId: string;
  data: Record<string, unknown>;
  timestamp: string;
}
export declare enum ConnectionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  ERROR = 'error',
}
export declare enum PlatformCapability {
  ORDERS = 'orders',
  PRODUCTS = 'products',
  INVENTORY = 'inventory',
  FULFILLMENTS = 'fulfillments',
  CUSTOMERS = 'customers',
  REFUNDS = 'refunds',
  SHIPPING = 'shipping',
  WEBHOOKS = 'webhooks',
}
export interface PlatformConnectionConfig {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  shopDomain?: string;
  apiUrl?: string;
  webhookSecret?: string;
  settings?: Record<string, unknown>;
}
