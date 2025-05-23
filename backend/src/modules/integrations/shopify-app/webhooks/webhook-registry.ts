import { Injectable, Logger, Optional, Inject, forwardRef } from '@nestjs/common';
import { WebhookHandler, WebhookContext, WebhookHandlerResult } from './webhook-handler.interface';
import { ShopifyWebhookTopic } from '../../../common/types/shopify-models.types';
import { WebhookMonitorService } from './webhook-monitor.service';
import { WebhookRetryService } from './webhook-retry.service';

/**
 * Registry for webhook handlers implementing the registry pattern
 * This class maintains a mapping of webhook topics to their handlers
 * and provides methods to register and process webhooks
 */
@Injectable()
export class WebhookRegistry {
  private readonly logger = new Logger(WebhookRegistry.name);
  private handlers: Map<string, WebhookHandler> = new Map();
  private topicToHandlerMap: Map<ShopifyWebhookTopic, WebhookHandler> = new Map();

  /**
   * Constructor with optional dependencies
   * The monitor and retry services are optional to maintain backward compatibility
   */
  constructor(
    @Optional() private readonly webhookMonitor?: WebhookMonitorService,
    @Optional() @Inject(forwardRef(() => WebhookRetryService)) private readonly webhookRetry?: WebhookRetryService,
  ) {}

  /**
   * Register a handler for one or more webhook topics
   * @param handler The handler to register
   */
  register(handler: WebhookHandler): void {
    const topics = handler.getTopics();

    // Handle both single topic and arrays of topics
    if (Array.isArray(topics)) {
      topics.forEach(topic => {
        this.registerSingleTopic(topic, handler);
      });
    } else {
      this.registerSingleTopic(topics, handler);
    }
  }

  /**
   * Register a handler for a single topic
   */
  private registerSingleTopic(topic: ShopifyWebhookTopic, handler: WebhookHandler): void {
    if (this.topicToHandlerMap.has(topic)) {
      this.logger.warn(`Overriding existing handler for topic ${topic}`);
    }

    this.topicToHandlerMap.set(topic, handler);

    // Add to the handler collection if it's not already there
    // We use the handler's toString() as the key since a handler might handle multiple topics
    const handlerId = handler.constructor.name;
    if (!this.handlers.has(handlerId)) {
      this.handlers.set(handlerId, handler);
    }

    this.logger.log(`Registered handler ${handlerId} for webhook topic: ${topic}`);
  }

  /**
   * Register multiple handlers at once
   * @param handlers Array of handlers to register
   */
  registerHandlers(handlers: WebhookHandler[]): void {
    handlers.forEach(handler => this.register(handler));
  }

  /**
   * Check if a handler is registered for a specific topic
   * @param topic The webhook topic to check
   */
  hasHandlerFor(topic: ShopifyWebhookTopic): boolean {
    return this.topicToHandlerMap.has(topic);
  }

  /**
   * Get a handler for a specific topic
   * @param topic The webhook topic
   */
  getHandler(topic: ShopifyWebhookTopic): WebhookHandler | null {
    return this.topicToHandlerMap.get(topic) || null;
  }

  /**
   * Get all registered topics
   */
  getRegisteredTopics(): ShopifyWebhookTopic[] {
    return Array.from(this.topicToHandlerMap.keys());
  }

  /**
   * Get all registered handlers
   */
  getRegisteredHandlers(): WebhookHandler[] {
    return Array.from(this.handlers.values());
  }

  /**
   * Process a webhook with proper error boundaries and monitoring
   * @param context The webhook context including topic, shop, and payload
   */
  async process(context: WebhookContext): Promise<WebhookHandlerResult> {
    const { topic, webhookId } = context;
    const handler = this.topicToHandlerMap.get(topic);

    // Record webhook event if monitoring is available
    if (this.webhookMonitor) {
      await this.webhookMonitor.recordWebhookEvent(webhookId, topic, context.shop);
    }

    if (!handler) {
      const message = `No handler registered for webhook topic: ${topic}`;
      this.logger.warn(message);
      const result = {
        success: false,
        message,
        error: new Error(`Unhandled webhook topic: ${topic}`),
      };

      // Update monitoring if available
      if (this.webhookMonitor) {
        this.webhookMonitor.updateWebhookEventResult(webhookId, result);
      }

      return result;
    }

    try {
      this.logger.debug(`Processing webhook ${webhookId} for topic: ${topic}`);

      // Track execution metrics if we're in a production environment
      const startTime = Date.now();

      // Execute the webhook handler
      const result = await handler.process(context);

      // Track execution time
      const processingTime = Date.now() - startTime;
      this.logger.debug(`Webhook processing time: ${processingTime}ms`);

      // Log result
      if (result.success) {
        this.logger.log(`Successfully processed webhook for topic: ${topic}`);
      } else {
        this.logger.error(`Failed to process webhook for topic: ${topic}`, result.error);

        // Schedule a retry if retry service is available
        if (this.webhookRetry && !result.success) {
          this.webhookRetry.scheduleRetry(webhookId, context);
        }
      }

      // Update monitoring if available
      if (this.webhookMonitor) {
        this.webhookMonitor.updateWebhookEventResult(webhookId, result);
      }

      return result;
    } catch (error) {
      const errorMessage = `Unexpected error processing webhook topic ${topic}: ${error.message}`;
      this.logger.error(errorMessage, error.stack);

      const result = {
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error : new Error(String(error)),
      };

      // Update monitoring if available
      if (this.webhookMonitor) {
        this.webhookMonitor.updateWebhookEventResult(webhookId, result);
      }

      // Schedule a retry if retry service is available
      if (this.webhookRetry) {
        this.webhookRetry.scheduleRetry(webhookId, context);
      }

      return result;
    }
  }
}
