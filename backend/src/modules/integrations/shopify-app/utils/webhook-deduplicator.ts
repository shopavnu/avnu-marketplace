import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

/**
 * Webhook deduplication service
 *
 * Ensures webhooks are only processed once even if Shopify sends duplicates
 * (which is common with their retry systems).
 */
@Injectable()
export class ShopifyWebhookDeduplicator {
  private readonly logger = new Logger(ShopifyWebhookDeduplicator.name);
  private readonly useRedis: boolean;

  // Default processing window (how long to remember processed webhooks)
  private readonly processingWindowMs: number;

  // Fallback in-memory storage (only if Redis is unavailable)
  private readonly memoryProcessed: Map<string, number> = new Map();

  constructor(
    private configService: ConfigService,
    @InjectRedis() private readonly redisClient: Redis,
  ) {
    // Get configuration
    this.processingWindowMs = this.configService.get<number>(
      'WEBHOOK_DEDUPLICATION_WINDOW_MS',
      3600000, // Default: 1 hour
    );

    // Check if Redis is enabled
    this.useRedis = this.configService.get<boolean>('CACHE_REDIS_ENABLED', true);

    if (this.useRedis) {
      try {
        this.logger.log('Webhook deduplicator initialized with Redis');
      } catch (error) {
        this.logger.error(`Failed to initialize Redis for webhook deduplication: ${error.message}`);
        this.useRedis = false;
        this.logger.warn(
          'Falling back to in-memory webhook deduplication (not recommended for production)',
        );
      }
    } else {
      this.logger.warn(
        'Redis disabled for webhook deduplication - using in-memory (not recommended for production)',
      );
    }

    // Periodically clean up old in-memory entries (if using memory fallback)
    if (!this.useRedis) {
      setInterval(() => this.cleanupMemoryStorage(), 300000); // Every 5 minutes
    }
  }

  /**
   * Check if a webhook has already been processed
   *
   * @param webhookId The unique ID of the webhook
   * @returns Whether this webhook has already been processed
   */
  async isAlreadyProcessed(webhookId: string): Promise<boolean> {
    if (this.useRedis) {
      return this.isProcessedRedis(webhookId);
    } else {
      return this.isProcessedMemory(webhookId);
    }
  }

  /**
   * Mark a webhook as processed
   *
   * @param webhookId The unique ID of the webhook
   * @param metadata Optional metadata to store with the deduplication record
   */
  async markAsProcessed(webhookId: string, metadata: Record<string, any> = {}): Promise<void> {
    if (this.useRedis) {
      await this.markProcessedRedis(webhookId, metadata);
    } else {
      this.markProcessedMemory(webhookId);
    }
  }

  /**
   * Process a webhook with deduplication
   *
   * @param webhookId The unique ID of the webhook
   * @param processor Function to process the webhook
   * @returns Result of the processor function, or undefined if already processed
   */
  async processWithDeduplication<T>(
    webhookId: string,
    processor: () => Promise<T>,
    metadata: Record<string, any> = {},
  ): Promise<T | undefined> {
    // Check if already processed
    const isProcessed = await this.isAlreadyProcessed(webhookId);

    if (isProcessed) {
      this.logger.warn(`Duplicate webhook detected: ${webhookId}`);
      return undefined;
    }

    try {
      // Process the webhook
      const result = await processor();

      // Mark as processed
      await this.markAsProcessed(webhookId, {
        ...metadata,
        processedAt: new Date().toISOString(),
        success: true,
      });

      return result;
    } catch (error) {
      // Still mark as processed but include error details
      await this.markAsProcessed(webhookId, {
        ...metadata,
        processedAt: new Date().toISOString(),
        success: false,
        error: error.message,
      });

      // Re-throw the error
      throw error;
    }
  }

  /**
   * Check if a webhook is processed using Redis
   */
  private async isProcessedRedis(webhookId: string): Promise<boolean> {
    try {
      const key = this.getRedisKey(webhookId);
      const exists = await this.redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Redis error checking webhook ${webhookId}: ${error.message}`);
      // Fall back to memory check on Redis failure
      return this.isProcessedMemory(webhookId);
    }
  }

  /**
   * Mark a webhook as processed using Redis
   */
  private async markProcessedRedis(
    webhookId: string,
    metadata: Record<string, any> = {},
  ): Promise<void> {
    try {
      const key = this.getRedisKey(webhookId);
      const value = JSON.stringify({
        webhookId,
        timestamp: Date.now(),
        ...metadata,
      });

      // Set with expiration
      const ttlSeconds = Math.floor(this.processingWindowMs / 1000);
      await this.redisClient.set(key, value, 'EX', ttlSeconds);
    } catch (error) {
      this.logger.error(`Redis error marking webhook ${webhookId}: ${error.message}`);
      // Fall back to memory storage on Redis failure
      this.markProcessedMemory(webhookId);
    }
  }

  /**
   * Check if a webhook is processed using in-memory fallback
   */
  private isProcessedMemory(webhookId: string): boolean {
    return this.memoryProcessed.has(webhookId);
  }

  /**
   * Mark a webhook as processed using in-memory fallback
   */
  private markProcessedMemory(webhookId: string): void {
    this.memoryProcessed.set(webhookId, Date.now());
  }

  /**
   * Clean up old in-memory entries
   */
  private cleanupMemoryStorage(): void {
    const now = Date.now();
    const cutoff = now - this.processingWindowMs;

    let count = 0;
    for (const [key, timestamp] of this.memoryProcessed.entries()) {
      if (timestamp < cutoff) {
        this.memoryProcessed.delete(key);
        count++;
      }
    }

    if (count > 0) {
      this.logger.debug(`Cleaned up ${count} old webhook records from memory`);
    }
  }

  /**
   * Get Redis key for a webhook ID
   */
  private getRedisKey(webhookId: string): string {
    return `shopify:webhook:processed:${webhookId}`;
  }

  /**
   * Get information about a processed webhook
   */
  async getProcessedInfo(webhookId: string): Promise<Record<string, any> | null> {
    if (!this.useRedis) {
      // In-memory doesn't store metadata
      return this.memoryProcessed.has(webhookId)
        ? { webhookId, timestamp: this.memoryProcessed.get(webhookId) }
        : null;
    }

    try {
      const key = this.getRedisKey(webhookId);
      const value = await this.redisClient.get(key);

      if (!value) return null;

      return JSON.parse(value);
    } catch (error) {
      this.logger.error(`Redis error getting webhook info for ${webhookId}: ${error.message}`);
      return null;
    }
  }
}
