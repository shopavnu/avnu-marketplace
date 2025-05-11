import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan as _LessThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { WebhookHandlerResult } from './webhook-handler.interface';
import { ShopifyWebhookTopic } from '../../../common/types/shopify-models.types';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';

/**
 * Interface for tracking webhook events
 */
interface WebhookEvent {
  id: string;
  topic: ShopifyWebhookTopic;
  shop: string;
  merchantId: string;
  receivedAt: Date;
  processedAt?: Date;
  success: boolean;
  errorMessage?: string;
  retryCount: number;
  lastRetryAt?: Date;
}

/**
 * Webhook monitoring service for tracking webhook events and failures
 */
@Injectable()
export class WebhookMonitorService {
  private readonly logger = new Logger(WebhookMonitorService.name);
  private webhookEvents: Map<string, WebhookEvent> = new Map();

  // In a production environment, you would use a database table instead of an in-memory map
  // Here we're using an in-memory solution for simplicity

  constructor(
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
  ) {}

  /**
   * Record a webhook event
   */
  async recordWebhookEvent(
    webhookId: string,
    topic: ShopifyWebhookTopic,
    shop: string,
  ): Promise<void> {
    try {
      // Find merchant ID for the shop
      const merchantId = await this.getMerchantIdForShop(shop);

      // Create webhook event record
      const event: WebhookEvent = {
        id: webhookId,
        topic,
        shop,
        merchantId: merchantId || 'unknown',
        receivedAt: new Date(),
        success: false, // Will be updated after processing
        retryCount: 0,
      };

      // Save the event
      this.webhookEvents.set(webhookId, event);

      this.logger.debug(`Recorded webhook event ${webhookId} for topic ${topic} and shop ${shop}`);
    } catch (error) {
      this.logger.error(`Failed to record webhook event: ${error.message}`, error.stack);
    }
  }

  /**
   * Update webhook event after processing
   */
  updateWebhookEventResult(webhookId: string, result: WebhookHandlerResult): void {
    try {
      const event = this.webhookEvents.get(webhookId);
      if (!event) {
        this.logger.warn(`Unable to find webhook event with ID ${webhookId}`);
        return;
      }

      // Update event with processing result
      event.processedAt = new Date();
      event.success = result.success;
      event.errorMessage = result.success ? undefined : result.message;

      // Save updated event
      this.webhookEvents.set(webhookId, event);

      // Log appropriate message
      if (result.success) {
        this.logger.debug(`Webhook ${webhookId} processed successfully`);
      } else {
        this.logger.warn(`Webhook ${webhookId} processing failed: ${result.message}`);
      }
    } catch (error) {
      this.logger.error(`Failed to update webhook event: ${error.message}`, error.stack);
    }
  }

  /**
   * Get event by webhook ID
   */
  getWebhookEvent(webhookId: string): WebhookEvent | undefined {
    return this.webhookEvents.get(webhookId);
  }

  /**
   * Get failed webhook events for reporting or retry
   */
  getFailedWebhookEvents(): WebhookEvent[] {
    return Array.from(this.webhookEvents.values()).filter(event => !event.success);
  }

  /**
   * Get all webhook events for a specific shop
   */
  getWebhookEventsByShop(shop: string): WebhookEvent[] {
    return Array.from(this.webhookEvents.values()).filter(event => event.shop === shop);
  }

  /**
   * Get all webhook events for a specific merchant
   */
  getWebhookEventsByMerchant(merchantId: string): WebhookEvent[] {
    return Array.from(this.webhookEvents.values()).filter(event => event.merchantId === merchantId);
  }

  /**
   * Record a retry attempt for a failed webhook
   */
  recordRetryAttempt(webhookId: string, success: boolean, errorMessage?: string): void {
    try {
      const event = this.webhookEvents.get(webhookId);
      if (!event) {
        this.logger.warn(`Unable to find webhook event with ID ${webhookId}`);
        return;
      }

      // Update retry information
      event.retryCount += 1;
      event.lastRetryAt = new Date();
      event.success = success;
      event.errorMessage = success ? undefined : errorMessage;

      // Save updated event
      this.webhookEvents.set(webhookId, event);

      this.logger.log(
        `Webhook ${webhookId} retry attempt ${event.retryCount}: ${success ? 'successful' : 'failed'}`,
      );
    } catch (error) {
      this.logger.error(`Failed to record retry attempt: ${error.message}`, error.stack);
    }
  }

  /**
   * Clean up old webhook events to prevent memory leaks
   * In a production environment, you would archive these to a database
   *
   * This runs daily at midnight
   */
  @Cron('0 0 * * *')
  cleanupOldEvents(): void {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Count events before cleanup
      const beforeCount = this.webhookEvents.size;

      // Remove events older than 30 days
      for (const [id, event] of this.webhookEvents.entries()) {
        if (event.receivedAt < thirtyDaysAgo) {
          this.webhookEvents.delete(id);
        }
      }

      // Count events after cleanup
      const afterCount = this.webhookEvents.size;

      this.logger.log(`Cleaned up ${beforeCount - afterCount} old webhook events`);
    } catch (error) {
      this.logger.error(`Failed to clean up old webhook events: ${error.message}`, error.stack);
    }
  }

  /**
   * Helper method to get merchant ID for a shop
   */
  private async getMerchantIdForShop(shop: string): Promise<string | null> {
    try {
      const connection = await this.merchantPlatformConnectionRepository.findOne({
        where: {
          platformType: 'SHOPIFY' as any,
          platformIdentifier: shop,
          isActive: true,
        },
      });

      return connection ? connection.merchantId : null;
    } catch (error) {
      this.logger.error(`Failed to get merchant ID for shop ${shop}: ${error.message}`);
      return null;
    }
  }
}
