export declare enum SyncStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  NEVER_SYNCED = 'never_synced',
}
export declare enum ShopifyWebhookTopic {
  PRODUCTS_CREATE = 'products/create',
  PRODUCTS_UPDATE = 'products/update',
  PRODUCTS_DELETE = 'products/delete',
  ORDERS_CREATE = 'orders/create',
  ORDERS_UPDATE = 'orders/update',
  ORDERS_CANCELLED = 'orders/cancelled',
  ORDERS_FULFILLED = 'orders/fulfilled',
  FULFILLMENTS_CREATE = 'fulfillments/create',
  FULFILLMENTS_UPDATE = 'fulfillments/update',
}
export declare enum WooCommerceWebhookTopic {
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_DELETED = 'order.deleted',
}
export declare class ShopifyWebhookHeadersDto {
  'x-shopify-topic': ShopifyWebhookTopic;
  'x-shopify-hmac-sha256': string;
  'x-shopify-shop-domain': string;
}
export declare class WooCommerceWebhookHeadersDto {
  'x-wc-webhook-topic': WooCommerceWebhookTopic;
  'x-wc-webhook-signature': string;
  'x-wc-webhook-source': string;
}
export declare class WebhookQueryDto {
  merchantId?: string;
}
export declare class SyncStatusResponseDto {
  lastSyncedAt: Date | null;
  status: SyncStatus;
}
export declare class SyncSuccessResponseDto {
  success: boolean;
}
export declare class SyncCountResponseDto {
  count: number;
}
