import { ShopifyWebhookTopic } from '../../../common/types/shopify-models.types';

/**
 * Interface for webhook handler result
 */
export interface WebhookHandlerResult {
  success: boolean;
  message?: string;
  error?: Error;
  data?: any;
}

/**
 * Interface for webhook processing context
 */
export interface WebhookContext {
  topic: ShopifyWebhookTopic;
  shop: string;
  payload: any;
  webhookId: string;
  timestamp: Date;
  headers?: Record<string, string>;
}

/**
 * Interface for webhook handlers
 * Each handler is responsible for processing a specific webhook topic
 */
export interface WebhookHandler {
  /**
   * Get the topics this handler is responsible for
   * Can be a single topic or an array of topics
   */
  getTopics(): ShopifyWebhookTopic | ShopifyWebhookTopic[];

  /**
   * Process the webhook payload
   * @param context All relevant information about the webhook
   */
  process(context: WebhookContext): Promise<WebhookHandlerResult>;
}

/**
 * Abstract base class for webhook handlers to provide common functionality
 */
export abstract class BaseWebhookHandler implements WebhookHandler {
  protected topics: ShopifyWebhookTopic | ShopifyWebhookTopic[];

  constructor(topics: ShopifyWebhookTopic | ShopifyWebhookTopic[]) {
    this.topics = topics;
  }

  /**
   * Get the topics this handler is responsible for
   */
  getTopics(): ShopifyWebhookTopic | ShopifyWebhookTopic[] {
    return this.topics;
  }

  /**
   * Process the webhook payload - must be implemented by concrete handlers
   */
  abstract process(context: WebhookContext): Promise<WebhookHandlerResult>;

  /**
   * Create a successful result
   */
  protected createSuccessResult(message?: string, data?: any): WebhookHandlerResult {
    return {
      success: true,
      message: message || `Successfully processed webhook`,
      data,
    };
  }

  /**
   * Create an error result
   */
  protected createErrorResult(error: Error, message?: string): WebhookHandlerResult {
    return {
      success: false,
      message: message || `Error processing webhook`,
      error,
    };
  }
}
