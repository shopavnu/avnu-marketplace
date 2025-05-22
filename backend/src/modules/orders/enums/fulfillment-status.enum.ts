import { registerEnumType } from '@nestjs/graphql';

/**
 * FulfillmentStatus enum
 *
 * Defines the possible fulfillment statuses for an order.
 * Used for tracking the fulfillment state of an order in the system.
 */
export enum FulfillmentStatus {
  /**
   * Order has not been fulfilled yet
   */
  UNFULFILLED = 'unfulfilled',

  /**
   * Some items in the order have been fulfilled, but not all
   */
  PARTIALLY_FULFILLED = 'partially_fulfilled',

  /**
   * All items in the order have been fulfilled
   */
  FULFILLED = 'fulfilled',

  /**
   * Fulfillment has been initiated but not yet completed
   */
  PROCESSING = 'processing',

  /**
   * Fulfillment has been cancelled
   */
  CANCELLED = 'cancelled',

  /**
   * Fulfillment has failed
   */
  FAILED = 'failed',
}

// Register the enum with GraphQL
registerEnumType(FulfillmentStatus, {
  name: 'FulfillmentStatus',
  description: 'Possible fulfillment statuses for an order',
});
