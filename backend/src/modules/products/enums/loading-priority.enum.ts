// @ts-strict-mode: enabled

/**
 * Enum for product loading priority levels
 * Used to optimize loading based on visibility and scroll position
 */
export enum LoadingPriority {
  /**
   * High priority - visible content
   * Load with full details and normalization
   */
  HIGH = 'high',

  /**
   * Medium priority - just outside viewport
   * Load with essential fields only
   */
  MEDIUM = 'medium',

  /**
   * Low priority - far from viewport
   * Load with minimal data
   */
  LOW = 'low',

  /**
   * Prefetch - not visible but likely to be needed soon
   * Load only IDs and minimal data to prepare cache
   */
  PREFETCH = 'prefetch',
}
