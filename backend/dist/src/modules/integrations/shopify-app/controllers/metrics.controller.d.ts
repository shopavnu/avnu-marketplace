import { WebhookMetricsService } from '../webhooks/webhook-metrics.service';
export declare class ShopifyMetricsController {
    private readonly metricsService;
    private readonly logger;
    constructor(metricsService: WebhookMetricsService);
    getWebhookMetrics(): any;
    resetWebhookMetrics(): {
        success: boolean;
        message: string;
    };
    getWebhookSuccessRate(): {
        success: boolean;
        successRate: number;
        status: string;
    };
}
