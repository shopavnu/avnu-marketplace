import { Repository } from 'typeorm';
import { WebhookHandlerResult } from './webhook-handler.interface';
import { ShopifyWebhookTopic } from '../../../common/types/shopify-models.types';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
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
export declare class WebhookMonitorService {
  private readonly merchantPlatformConnectionRepository;
  private readonly logger;
  private webhookEvents;
  constructor(merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>);
  recordWebhookEvent(webhookId: string, topic: ShopifyWebhookTopic, shop: string): Promise<void>;
  updateWebhookEventResult(webhookId: string, result: WebhookHandlerResult): void;
  getWebhookEvent(webhookId: string): WebhookEvent | undefined;
  getFailedWebhookEvents(): WebhookEvent[];
  getWebhookEventsByShop(shop: string): WebhookEvent[];
  getWebhookEventsByMerchant(merchantId: string): WebhookEvent[];
  recordRetryAttempt(webhookId: string, success: boolean, errorMessage?: string): void;
  cleanupOldEvents(): void;
  private getMerchantIdForShop;
}
export {};
