import { Injectable, Logger as _Logger } from '@nestjs/common';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { WebhookRegistry } from './webhook-registry';
import { WebhookValidator } from './webhook-validator';
import { ShopifyStructuredLogger } from '../utils/structured-logger';
import { ShopifyWebhookDeduplicator } from '../utils/webhook-deduplicator';
import { ShopifyWebhookTopic } from '../../../common/types/shopify-models.types';

/**
 * Webhook job data structure
 */
interface WebhookJobData {
  // Shopify shop domain
  shop: string;

  // Webhook topic (e.g., products/update)
  topic: string;

  // Webhook payload
  payload: any;

  // Webhook ID for deduplication
  webhookId: string;

  // Processing metadata
  metadata: {
    receivedAt: string;
    attempts?: number;
    merchantId?: string;
    priority?: number;
  };
}

/**
 * Distributed webhook processor using Bull queue
 *
 * This service provides reliable, distributed webhook processing by:
 * 1. Queuing incoming webhooks in Redis-backed Bull queue
 * 2. Processing webhooks asynchronously with retries
 * 3. Preventing duplicate processing using deduplication
 * 4. Distributing load across multiple workers
 */
@Injectable()
@Processor('shopify-webhooks')
export class DistributedWebhookProcessor {
  private readonly logger: ShopifyStructuredLogger;

  constructor(
    @InjectQueue('shopify-webhooks') private webhookQueue: Queue,
    private readonly webhookRegistry: WebhookRegistry,
    private readonly webhookValidator: WebhookValidator,
    private readonly webhookDeduplicator: ShopifyWebhookDeduplicator,
    private readonly configService: ConfigService,
    logger: ShopifyStructuredLogger,
  ) {
    this.logger = logger;
  }

  /**
   * Queue a webhook for processing
   *
   * This method adds the webhook to a distributed queue for reliable processing.
   * It implements prioritization, deduplication, and retry mechanisms.
   */
  async queueWebhook(
    shop: string,
    topic: string,
    payload: any,
    webhookId: string,
    merchantId?: string,
  ): Promise<void> {
    try {
      // Check if already processed (deduplication)
      const alreadyProcessed = await this.webhookDeduplicator.isAlreadyProcessed(webhookId);
      if (alreadyProcessed) {
        this.logger.warn(`Duplicate webhook received and skipped: ${webhookId}`, {
          shopDomain: shop,
          topic,
          webhookId,
        });
        return;
      }

      // Determine priority based on topic
      const priority = this.calculatePriority(topic);

      // Add to queue with appropriate options
      await this.webhookQueue.add(
        'process',
        {
          shop,
          topic,
          payload,
          webhookId,
          metadata: {
            receivedAt: new Date().toISOString(),
            attempts: 0,
            merchantId,
            priority,
          },
        } as WebhookJobData,
        {
          priority,
          attempts: 3, // Retry up to 3 times
          backoff: {
            type: 'exponential',
            delay: 5000, // Start with 5 seconds, then exponential backoff
          },
          // Prevent duplicate jobs with same ID
          jobId: webhookId,
          // Remove completed jobs after 1 day
          removeOnComplete: 24 * 60 * 60,
          // Remove failed jobs after 7 days
          removeOnFail: 7 * 24 * 60 * 60,
        },
      );

      this.logger.log(`Webhook queued for processing: ${topic}`, {
        shopDomain: shop,
        topic,
        webhookId,
        priority,
      });
    } catch (error) {
      this.logger.error(`Failed to queue webhook: ${error.message}`, {
        shopDomain: shop,
        topic,
        webhookId,
        errorMessage: error.message,
      });
      throw error;
    }
  }

  /**
   * Process a webhook from the queue
   *
   * This method is called automatically by Bull when a job is ready.
   * It handles validation, deduplication and delegates to the appropriate handler.
   */
  @Process('process')
  async processWebhook(job: Job<WebhookJobData>): Promise<void> {
    const { shop, topic, payload, webhookId, metadata } = job.data;

    try {
      // Update attempt counter
      metadata.attempts = (metadata.attempts || 0) + 1;

      // Log processing start
      this.logger.log(`Processing webhook: ${topic} (attempt ${metadata.attempts})`, {
        shopDomain: shop,
        topic,
        webhookId,
        attempt: metadata.attempts,
      });

      // Handle deduplication (in case it wasn't caught at queue time)
      const alreadyProcessed = await this.webhookDeduplicator.isAlreadyProcessed(webhookId);
      if (alreadyProcessed) {
        this.logger.warn(`Duplicate webhook processing prevented: ${webhookId}`, {
          shopDomain: shop,
          topic,
          webhookId,
        });
        return;
      }

      // Process with deduplication
      await this.webhookDeduplicator.processWithDeduplication(webhookId, async () => {
        // Get the appropriate handler for this topic
        const handler = this.webhookRegistry.getHandler(topic as ShopifyWebhookTopic);
        if (!handler) {
          throw new Error(`No handler registered for topic: ${topic}`);
        }

        // Process the webhook with the handler
        const startTime = Date.now();
        await handler.process({
          topic: topic as ShopifyWebhookTopic,
          shop,
          payload,
          webhookId,
          timestamp: new Date(),
        });
        const duration = Date.now() - startTime;

        // Log successful processing
        this.logger.log(`Webhook processed successfully: ${topic}`, {
          shopDomain: shop,
          topic,
          webhookId,
          duration,
        });
      });
    } catch (error) {
      // Log the error
      this.logger.error(`Webhook processing failed: ${error.message}`, {
        shopDomain: shop,
        topic,
        webhookId,
        attempt: metadata.attempts,
        errorMessage: error.message,
        errorStack: error.stack,
      });

      // Determine if we should retry
      const maxAttempts = job.opts.attempts || 3;
      if (metadata.attempts >= maxAttempts) {
        this.logger.error(`Max retry attempts reached for webhook: ${webhookId}`, {
          shopDomain: shop,
          topic,
          webhookId,
          maxAttempts,
        });

        // Mark as processed with error so we don't try again if duplicate received
        await this.webhookDeduplicator.markAsProcessed(webhookId, {
          topic,
          shopDomain: shop,
          error: error.message,
          maxAttemptsReached: true,
        });
      }

      // Re-throw to trigger Bull's retry mechanism
      throw error;
    }
  }

  /**
   * Calculate priority for a webhook topic
   */
  private calculatePriority(topic: string): number {
    // Lower number = higher priority in Bull

    // Critical priority (1) - Essential operations that affect customer experience
    if (
      topic.includes('orders/') ||
      topic.includes('checkouts/') ||
      topic.includes('fulfillments/')
    ) {
      return 1;
    }

    // High priority (5) - Important updates that should be processed quickly
    if (
      topic.includes('products/update') ||
      topic.includes('inventory_levels/') ||
      topic.includes('customers/') ||
      topic.includes('cart/')
    ) {
      return 5;
    }

    // Medium priority (10) - Regular updates
    if (
      topic.includes('products/create') ||
      topic.includes('collections/') ||
      topic.includes('price_rules/') ||
      topic.includes('discounts/')
    ) {
      return 10;
    }

    // Low priority (15) - Background processes and non-critical updates
    return 15;
  }
}
