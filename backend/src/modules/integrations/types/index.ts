// Export all platform-specific types
export * from './shopify-product.types';
export * from './woocommerce-product.types';
// Explicitly re-export from integration.types to avoid ambiguity with shared/interfaces
export {
  PlatformType,
  SyncStatus,
  RefundItem,
  FulfillmentData,
  OrderSyncError,
  WebhookEventType,
  WebhookPayload,
  ConnectionStatus,
  PlatformCapability,
  PlatformConnectionConfig,
} from './integration.types';
export * from './shopify.types';
