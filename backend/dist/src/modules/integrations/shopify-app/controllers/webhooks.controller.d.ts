import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { ShopifyWebhookTopic } from '../../../common/types/shopify-models.types';
import { WebhookRegistry } from '../webhooks/webhook-registry';
import { WebhookValidator } from '../webhooks/webhook-validator';
export declare class ShopifyWebhooksController {
  private readonly webhookRegistry;
  private readonly webhookValidator;
  private readonly logger;
  constructor(webhookRegistry: WebhookRegistry, webhookValidator: WebhookValidator);
  handleWebhook(
    topicParam: string,
    payload: any,
    headers: Record<string, string>,
    request: RawBodyRequest<Request>,
  ): Promise<any>;
  healthCheck(): {
    status: string;
    topics: ShopifyWebhookTopic[];
  };
}
