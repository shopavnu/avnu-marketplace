import { registerEnumType } from '@nestjs/graphql';

/**
 * SyncStatus enum
 *
 * Defines the possible synchronization statuses for an order.
 * Used for tracking the sync state between the platform and external systems.
 */
export enum SyncStatus {
  /**
   * Order is pending synchronization
   */
  PENDING = 'pending',

  /**
   * Order has been successfully synchronized
   */
  SYNCED = 'synced',

  /**
   * Synchronization has failed
   */
  FAILED = 'failed',

  /**
   * Order is out of sync with external system
   */
  OUT_OF_SYNC = 'out_of_sync',

  /**
   * Order is currently being synchronized
   */
  SYNCING = 'syncing',

  /**
   * Order does not require synchronization
   */
  NOT_REQUIRED = 'not_required',
}

// Register the enum with GraphQL
registerEnumType(SyncStatus, {
  name: 'SyncStatus',
  description: 'Possible synchronization statuses for an order',
});
