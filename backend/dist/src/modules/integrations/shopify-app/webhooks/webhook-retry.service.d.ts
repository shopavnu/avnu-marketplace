import { WebhookRegistry } from './webhook-registry';
import { WebhookMonitorService } from './webhook-monitor.service';
import { WebhookContext } from './webhook-handler.interface';
interface RetryConfig {
    maxRetries: number;
    initialDelayMs: number;
    backoffMultiplier: number;
    maxDelayMs: number;
}
export declare class WebhookRetryService {
    private readonly webhookRegistry;
    private readonly webhookMonitor;
    private readonly logger;
    private readonly defaultRetryConfig;
    private scheduledRetries;
    constructor(webhookRegistry: WebhookRegistry, webhookMonitor: WebhookMonitorService);
    scheduleRetry(webhookId: string, context: WebhookContext, retryCount?: number, config?: RetryConfig): void;
    private executeRetry;
    retryAllFailedWebhooks(): Promise<void>;
    scheduledRetryFailedWebhooks(): Promise<void>;
}
export {};
