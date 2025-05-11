import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { WebhookValidator } from './webhook-validator';
import { DistributedWebhookProcessor } from './distributed-webhook-processor';
import { ShopifyStructuredLogger } from '../utils/structured-logger';
export declare class ShopifyWebhookController {
  private readonly webhookValidator;
  private readonly webhookProcessor;
  private readonly configService;
  private readonly logger;
  constructor(
    webhookValidator: WebhookValidator,
    webhookProcessor: DistributedWebhookProcessor,
    configService: ConfigService,
    logger: ShopifyStructuredLogger,
  );
  processWebhook(
    shop: string,
    topic: string,
    hmac: string,
    webhookId: string,
    payload: any,
    request: RawBodyRequest<Request>,
  ): Promise<{
    success: boolean;
    message: string;
  }>;
  private generateWebhookId;
  private extractMerchantId;
}
