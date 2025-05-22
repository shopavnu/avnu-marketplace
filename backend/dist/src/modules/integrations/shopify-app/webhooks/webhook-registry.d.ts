import { WebhookHandler, WebhookContext, WebhookHandlerResult } from './webhook-handler.interface';
import { ShopifyWebhookTopic } from '../../../common/types/shopify-models.types';
import { WebhookMonitorService } from './webhook-monitor.service';
import { WebhookRetryService } from './webhook-retry.service';
export declare class WebhookRegistry {
  private readonly webhookMonitor?;
  private readonly webhookRetry?;
  private readonly logger;
  private handlers;
  private topicToHandlerMap;
  constructor(webhookMonitor?: WebhookMonitorService, webhookRetry?: WebhookRetryService);
  register(handler: WebhookHandler): void;
  private registerSingleTopic;
  registerHandlers(handlers: WebhookHandler[]): void;
  hasHandlerFor(topic: ShopifyWebhookTopic): boolean;
  getHandler(topic: ShopifyWebhookTopic): WebhookHandler | null;
  getRegisteredTopics(): ShopifyWebhookTopic[];
  getRegisteredHandlers(): WebhookHandler[];
  process(context: WebhookContext): Promise<WebhookHandlerResult>;
}
