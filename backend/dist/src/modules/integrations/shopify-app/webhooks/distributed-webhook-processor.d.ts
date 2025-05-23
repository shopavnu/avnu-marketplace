import { Queue, Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { WebhookRegistry } from './webhook-registry';
import { WebhookValidator } from './webhook-validator';
import { ShopifyStructuredLogger } from '../utils/structured-logger';
import { ShopifyWebhookDeduplicator } from '../utils/webhook-deduplicator';
interface WebhookJobData {
    shop: string;
    topic: string;
    payload: any;
    webhookId: string;
    metadata: {
        receivedAt: string;
        attempts?: number;
        merchantId?: string;
        priority?: number;
    };
}
export declare class DistributedWebhookProcessor {
    private webhookQueue;
    private readonly webhookRegistry;
    private readonly webhookValidator;
    private readonly webhookDeduplicator;
    private readonly configService;
    private readonly logger;
    constructor(webhookQueue: Queue, webhookRegistry: WebhookRegistry, webhookValidator: WebhookValidator, webhookDeduplicator: ShopifyWebhookDeduplicator, configService: ConfigService, logger: ShopifyStructuredLogger);
    queueWebhook(shop: string, topic: string, payload: any, webhookId: string, merchantId?: string): Promise<void>;
    processWebhook(job: Job<WebhookJobData>): Promise<void>;
    private calculatePriority;
}
export {};
