import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { ShopifyWebhookService } from '../services/shopify-webhook.service';
import { ShopifyWebhookValidator } from '../utils/webhook-validator';
export declare class ShopifyWebhookController {
    private readonly shopifyWebhookService;
    private readonly webhookValidator;
    private readonly logger;
    constructor(shopifyWebhookService: ShopifyWebhookService, webhookValidator: ShopifyWebhookValidator);
    handleWebhook(topic: string, hmac: string, shop: string, request: RawBodyRequest<Request>, data: unknown): Promise<{
        success: boolean;
    }>;
}
