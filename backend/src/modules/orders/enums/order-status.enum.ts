import { registerEnumType } from '@nestjs/graphql';

/**
 * OrderStatus enum
 *
 * Defines the possible statuses for an order throughout its lifecycle.
 * Used for tracking the overall state of an order in the system.
 */
export enum OrderStatus {
  /**
   * Order has been created but not yet processed
   */
  PENDING = 'pending',

  /**
   * Order has been accepted and is being processed
   */
  PROCESSING = 'processing',

  /**
   * Order has been shipped but not yet delivered
   */
  SHIPPED = 'shipped',

  /**
   * Order has been delivered to the customer
   */
  DELIVERED = 'delivered',

  /**
   * Order has been completed (delivered and confirmed)
   */
  COMPLETED = 'completed',

  /**
   * Order has been cancelled before fulfillment
   */
  CANCELLED = 'cancelled',

  /**
   * Order has been returned by the customer
   */
  RETURNED = 'returned',

  /**
   * Order has been refunded
   */
  REFUNDED = 'refunded',

  /**
   * Order is on hold (payment or fulfillment issues)
   */
  ON_HOLD = 'on_hold',

  /**
   * Order failed during processing
   */
  FAILED = 'failed',
}

// Register the enum with GraphQL
registerEnumType(OrderStatus, {
  name: 'OrderStatus',
  description: 'Possible statuses for an order throughout its lifecycle',
});
