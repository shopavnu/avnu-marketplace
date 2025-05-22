import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

// Define type aliases for axios types to avoid direct imports
type AxiosRequestConfig = any;
type AxiosResponse = any;
type AxiosInstance = any;

/**
 * Represents the status of a store's connection
 */
interface StoreConnectionState {
  // Current number of API calls made in this period
  currentCalls: number;

  // Max allowed calls per period
  maxCalls: number;

  // When the rate limit resets
  resetAt: Date;

  // Queue of pending requests
  pendingRequests: Array<{
    config: AxiosRequestConfig;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    priority: number;
    timestamp: number;
  }>;

  // Is this connection currently throttled?
  throttled: boolean;

  // Axios instance for this store
  client: AxiosInstance;
}

/**
 * Manages connection pools and rate limiting for Shopify stores
 *
 * This service implements store-specific rate limiting, request prioritization,
 * and adaptive throttling based on Shopify's API responses.
 */
@Injectable()
export class ShopifyConnectionPoolManager {
  private readonly logger = new Logger(ShopifyConnectionPoolManager.name);
  private connectionsByStore: Map<string, StoreConnectionState> = new Map();

  // Default Shopify rate limits (calls per leaky bucket - typically 2 req/sec = 40/20sec)
  private readonly DEFAULT_MAX_CALLS = 40;
  private readonly DEFAULT_WINDOW_MS = 20000; // 20 seconds

  // Prioritization constants
  private readonly PRIORITY = {
    CRITICAL: 100, // Checkout flows
    HIGH: 75, // Inventory updates
    MEDIUM: 50, // Product catalog updates
    LOW: 25, // Analytics, reporting
    BACKGROUND: 10, // Bulk operations
  };

  constructor(private configService: ConfigService) {
    // Periodically check and execute pending requests
    setInterval(() => this.processPendingRequests(), 100);
  }

  /**
   * Execute a request to Shopify, respecting rate limits
   *
   * @param shopDomain The Shopify store domain
   * @param config Axios request configuration
   * @param priority Request priority (higher numbers = higher priority)
   * @returns Promise resolving to the API response
   */
  async executeRequest(
    shopDomain: string,
    config: AxiosRequestConfig,
    priority = this.PRIORITY.MEDIUM,
  ): Promise<AxiosResponse> {
    // Initialize connection for this store if it doesn't exist
    if (!this.connectionsByStore.has(shopDomain)) {
      this.initializeConnectionForStore(shopDomain);
    }

    const connection = this.connectionsByStore.get(shopDomain);

    // If we're under the rate limit and not throttled, execute immediately
    if (
      connection.currentCalls < connection.maxCalls &&
      !connection.throttled &&
      connection.pendingRequests.length === 0 // No higher priority requests waiting
    ) {
      return this.executeRequestImmediately(shopDomain, config);
    }

    // Otherwise, queue the request
    return new Promise((resolve, reject) => {
      connection.pendingRequests.push({
        config,
        resolve,
        reject,
        priority,
        timestamp: Date.now(),
      });

      // Sort the queue by priority (highest first), then timestamp (earliest first)
      connection.pendingRequests.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.timestamp - b.timestamp;
      });

      this.logger.debug(
        `Request queued for ${shopDomain} (priority: ${priority}). ` +
          `Queue size: ${connection.pendingRequests.length}`,
      );
    });
  }

  /**
   * Process any pending requests that can now be executed
   */
  private processPendingRequests(): void {
    for (const [shopDomain, connection] of this.connectionsByStore.entries()) {
      // Skip if no pending requests
      if (connection.pendingRequests.length === 0) {
        continue;
      }

      // Skip if we're still throttled
      if (connection.throttled) {
        // Check if enough time has passed to unthrottle
        if (new Date() >= connection.resetAt) {
          connection.throttled = false;
          connection.currentCalls = 0;
          this.logger.log(`Connection unthrottled for ${shopDomain}`);
        } else {
          continue;
        }
      }

      // Skip if we're at the rate limit
      if (connection.currentCalls >= connection.maxCalls) {
        continue;
      }

      // Process the highest priority request
      const nextRequest = connection.pendingRequests.shift();
      if (nextRequest) {
        // Execute the request
        this.executeRequestImmediately(shopDomain, nextRequest.config)
          .then(response => nextRequest.resolve(response))
          .catch(error => nextRequest.reject(error));

        this.logger.debug(
          `Processing queued request for ${shopDomain}. ` +
            `Remaining in queue: ${connection.pendingRequests.length}`,
        );
      }
    }
  }

  /**
   * Execute a request immediately (bypassing the queue)
   */
  private async executeRequestImmediately(
    shopDomain: string,
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse> {
    const connection = this.connectionsByStore.get(shopDomain);

    try {
      // Increment the current call count
      connection.currentCalls++;

      // Execute the request
      const response = await connection.client(config);

      // Update rate limit information from response headers
      this.updateRateLimitInfo(shopDomain, response);

      return response;
    } catch (error) {
      // Check if this is a rate limit error
      if (error.response && error.response.status === 429) {
        this.handleRateLimitExceeded(shopDomain, error.response);

        // Re-queue this request with a slight delay
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            this.executeRequest(shopDomain, config).then(resolve).catch(reject);
          }, 1000); // Wait 1 second before retrying
        });
      }

      // For other errors, just propagate them
      throw error;
    }
  }

  /**
   * Initialize a connection for a store
   */
  private initializeConnectionForStore(shopDomain: string): void {
    const client = axios.create({
      timeout: 10000, // 10 seconds
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.connectionsByStore.set(shopDomain, {
      currentCalls: 0,
      maxCalls: this.DEFAULT_MAX_CALLS,
      resetAt: new Date(Date.now() + this.DEFAULT_WINDOW_MS),
      pendingRequests: [],
      throttled: false,
      client,
    });

    this.logger.log(`Initialized connection pool for store: ${shopDomain}`);
  }

  /**
   * Update rate limit information based on response headers
   */
  private updateRateLimitInfo(shopDomain: string, response: AxiosResponse): void {
    const connection = this.connectionsByStore.get(shopDomain);

    // Check for rate limit headers
    const rateLimitHeader = response.headers['x-shopify-shop-api-call-limit'];
    if (rateLimitHeader) {
      const [current, max] = rateLimitHeader.split('/').map(Number);

      // Update connection state
      connection.currentCalls = current;
      connection.maxCalls = max;

      // Calculate when the rate limit resets - Shopify's leaky bucket drains at ~2 calls/sec
      const secondsToReset = Math.ceil(current / 2);
      connection.resetAt = new Date(Date.now() + secondsToReset * 1000);

      // If we're at >80% of the limit, start throttling
      if (current >= 0.8 * max) {
        this.logger.warn(
          `Approaching rate limit for ${shopDomain}: ${current}/${max} (${Math.round((current / max) * 100)}%)`,
        );

        // Slow down but not fully throttle
        if (!connection.throttled) {
          setTimeout(() => {
            connection.throttled = false;
          }, 1000); // Pause for 1 second
        }
      }

      // If we're at >95% of the limit, stop all requests until reset
      if (current >= 0.95 * max) {
        this.logger.warn(`Rate limit critical for ${shopDomain}: ${current}/${max}`);
        connection.throttled = true;
      }
    }
  }

  /**
   * Handle a rate limit exceeded error
   */
  private handleRateLimitExceeded(shopDomain: string, response: AxiosResponse): void {
    const connection = this.connectionsByStore.get(shopDomain);

    // Get retry-after header if available
    const retryAfter = response.headers['retry-after']
      ? parseInt(response.headers['retry-after'], 10) * 1000
      : 5000; // Default to 5 seconds

    this.logger.error(
      `Rate limit exceeded for ${shopDomain}. ` + `Throttling for ${retryAfter / 1000} seconds.`,
    );

    // Throttle the connection
    connection.throttled = true;
    connection.resetAt = new Date(Date.now() + retryAfter);
  }

  /**
   * Get the current state of a store's connection
   */
  getConnectionState(shopDomain: string): StoreConnectionState | undefined {
    return this.connectionsByStore.get(shopDomain);
  }

  /**
   * Get the priority constants
   */
  getPriorities() {
    return this.PRIORITY;
  }
}
