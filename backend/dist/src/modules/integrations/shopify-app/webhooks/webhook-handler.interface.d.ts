import { ShopifyWebhookTopic } from '../../../common/types/shopify-models.types';
export interface WebhookHandlerResult {
  success: boolean;
  message?: string;
  error?: Error;
  data?: any;
}
export interface WebhookContext {
  topic: ShopifyWebhookTopic;
  shop: string;
  payload: any;
  webhookId: string;
  timestamp: Date;
  headers?: Record<string, string>;
}
export interface WebhookHandler {
  getTopics(): ShopifyWebhookTopic | ShopifyWebhookTopic[];
  process(context: WebhookContext): Promise<WebhookHandlerResult>;
}
export declare abstract class BaseWebhookHandler implements WebhookHandler {
  protected topics: ShopifyWebhookTopic | ShopifyWebhookTopic[];
  constructor(topics: ShopifyWebhookTopic | ShopifyWebhookTopic[]);
  getTopics(): ShopifyWebhookTopic | ShopifyWebhookTopic[];
  abstract process(context: WebhookContext): Promise<WebhookHandlerResult>;
  protected createSuccessResult(message?: string, data?: any): WebhookHandlerResult;
  protected createErrorResult(error: Error, message?: string): WebhookHandlerResult;
}
