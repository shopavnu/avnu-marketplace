import { PlatformType } from '../enums/platform-type.enum';

/**
 * Interface for webhook events received from external platforms
 */
export interface WebhookEvent {
  /**
   * Unique ID for the event
   */
  eventId: string;

  /**
   * Timestamp when the event was received
   */
  timestamp: Date;

  /**
   * Type of platform the event came from (e.g., SHOPIFY, WOOCOMMERCE)
   */
  platformType: PlatformType;

  /**
   * ID of the merchant associated with the event
   */
  merchantId: string;

  /**
   * Type of event (e.g., 'products/create', 'orders/updated')
   */
  eventType: string;

  /**
   * The raw event data as received from the external platform
   */
  eventData: Record<string, unknown>;

  /**
   * Status of the event processing
   */
  status: 'received' | 'processed' | 'failed';

  /**
   * Optional error message if the event processing failed
   */
  errorMessage?: string;
}
