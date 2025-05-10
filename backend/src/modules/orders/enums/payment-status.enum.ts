import { registerEnumType } from '@nestjs/graphql';

/**
 * PaymentStatus enum
 *
 * Defines the possible payment statuses for an order.
 * Used for tracking the payment state of an order in the system.
 */
export enum PaymentStatus {
  /**
   * Payment is pending processing
   */
  PENDING = 'pending',

  /**
   * Payment is being processed
   */
  PROCESSING = 'processing',

  /**
   * Payment has been completed successfully
   */
  COMPLETED = 'completed',

  /**
   * Payment has failed
   */
  FAILED = 'failed',

  /**
   * Payment has been refunded
   */
  REFUNDED = 'refunded',

  /**
   * Payment has been partially refunded
   */
  PARTIALLY_REFUNDED = 'partially_refunded',

  /**
   * Payment is on hold
   */
  ON_HOLD = 'on_hold',

  /**
   * Payment has been cancelled
   */
  CANCELLED = 'cancelled',

  /**
   * Payment is awaiting confirmation
   */
  AWAITING_CONFIRMATION = 'awaiting_confirmation',
}

// Register the enum with GraphQL
registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
  description: 'Possible payment statuses for an order',
});
