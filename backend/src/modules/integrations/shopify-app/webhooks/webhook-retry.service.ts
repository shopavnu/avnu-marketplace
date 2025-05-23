import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { WebhookRegistry } from './webhook-registry';
import { WebhookMonitorService } from './webhook-monitor.service';
import { WebhookContext } from './webhook-handler.interface';

/**
 * Configuration for retry behavior
 */
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
}

/**
 * Service for retrying failed webhook executions
 */
@Injectable()
export class WebhookRetryService {
  private readonly logger = new Logger(WebhookRetryService.name);

  // Default retry configuration
  private readonly defaultRetryConfig: RetryConfig = {
    maxRetries: 5,
    initialDelayMs: 60000, // 1 minute
    backoffMultiplier: 2, // Exponential backoff
    maxDelayMs: 3600000, // 1 hour max delay
  };

  // Map to track scheduled retries
  private scheduledRetries: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    @Inject(forwardRef(() => WebhookRegistry)) private readonly webhookRegistry: WebhookRegistry,
    private readonly webhookMonitor: WebhookMonitorService,
  ) {}

  /**
   * Schedule a retry for a failed webhook
   */
  scheduleRetry(
    webhookId: string,
    context: WebhookContext,
    retryCount = 0,
    config: RetryConfig = this.defaultRetryConfig,
  ): void {
    try {
      // Get the webhook event
      const event = this.webhookMonitor.getWebhookEvent(webhookId);
      if (!event) {
        this.logger.warn(`Cannot schedule retry for unknown webhook ${webhookId}`);
        return;
      }

      // Check if we've exceeded max retries
      if (retryCount >= config.maxRetries) {
        this.logger.warn(
          `Webhook ${webhookId} for topic ${context.topic} has exceeded maximum retry attempts (${config.maxRetries})`,
        );
        return;
      }

      // Calculate delay using exponential backoff
      const delayMs = Math.min(
        config.initialDelayMs * Math.pow(config.backoffMultiplier, retryCount),
        config.maxDelayMs,
      );

      this.logger.log(
        `Scheduling retry #${retryCount + 1} for webhook ${webhookId} in ${delayMs / 1000} seconds`,
      );

      // Clear any existing scheduled retry
      if (this.scheduledRetries.has(webhookId)) {
        clearTimeout(this.scheduledRetries.get(webhookId));
      }

      // Schedule the retry
      const timeout = setTimeout(async () => {
        await this.executeRetry(webhookId, context, retryCount + 1, config);
      }, delayMs);

      // Store the timeout reference
      this.scheduledRetries.set(webhookId, timeout);
    } catch (error) {
      this.logger.error(
        `Failed to schedule retry for webhook ${webhookId}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Execute a webhook retry
   */
  private async executeRetry(
    webhookId: string,
    context: WebhookContext,
    retryCount: number,
    config: RetryConfig,
  ): Promise<void> {
    try {
      this.logger.log(`Executing retry #${retryCount} for webhook ${webhookId}`);

      // Process the webhook using the registry
      const result = await this.webhookRegistry.process(context);

      // Record the retry result
      this.webhookMonitor.recordRetryAttempt(
        webhookId,
        result.success,
        result.success ? undefined : result.message,
      );

      // If still failed and under max retries, schedule another retry
      if (!result.success && retryCount < config.maxRetries) {
        this.scheduleRetry(webhookId, context, retryCount, config);
      } else if (!result.success) {
        this.logger.warn(
          `Webhook ${webhookId} for ${context.shop} failed after maximum retries (${config.maxRetries})`,
        );
      } else {
        this.logger.log(`Successfully processed webhook ${webhookId} on retry #${retryCount}`);

        // Clean up the scheduled retry
        this.scheduledRetries.delete(webhookId);
      }
    } catch (error) {
      this.logger.error(`Error during webhook retry: ${error.message}`, error.stack);

      // Record the failed retry
      this.webhookMonitor.recordRetryAttempt(
        webhookId,
        false,
        `Exception during retry: ${error.message}`,
      );

      // Schedule another retry if under max retries
      if (retryCount < config.maxRetries) {
        this.scheduleRetry(webhookId, context, retryCount, config);
      }
    }
  }

  /**
   * Retry all failed webhooks
   * This can be called manually to retry all failed webhooks,
   * for example after a service restart
   */
  async retryAllFailedWebhooks(): Promise<void> {
    try {
      const failedEvents = this.webhookMonitor.getFailedWebhookEvents();

      this.logger.log(`Retrying ${failedEvents.length} failed webhooks`);

      // Process each failed event
      for (const event of failedEvents) {
        // Skip events that have already been retried too many times
        if (event.retryCount >= this.defaultRetryConfig.maxRetries) {
          this.logger.warn(
            `Skipping webhook ${event.id} as it already exceeded maximum retries (${this.defaultRetryConfig.maxRetries})`,
          );
          continue;
        }

        // Create context for the retry
        const context: WebhookContext = {
          topic: event.topic,
          shop: event.shop,
          payload: {}, // We'd need to store the payload in the monitor service for this to work
          webhookId: event.id,
          timestamp: new Date(),
        };

        // Schedule an immediate retry (with a small delay to avoid overwhelming the system)
        this.scheduleRetry(event.id, context, event.retryCount, {
          ...this.defaultRetryConfig,
          initialDelayMs: 5000 * (event.retryCount + 1), // Stagger retries
        });
      }

      this.logger.log(`Scheduled retries for ${failedEvents.length} webhooks`);
    } catch (error) {
      this.logger.error(`Failed to retry all failed webhooks: ${error.message}`, error.stack);
    }
  }

  /**
   * Scheduled job to retry failed webhooks
   * Runs every hour
   */
  @Cron('0 * * * *')
  async scheduledRetryFailedWebhooks(): Promise<void> {
    this.logger.log('Running scheduled retry of failed webhooks');
    await this.retryAllFailedWebhooks();
  }
}
