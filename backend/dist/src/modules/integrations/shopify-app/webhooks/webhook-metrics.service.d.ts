import { ShopifyWebhookTopic } from '../../../common/types/shopify-models.types';
interface WebhookMetricData {
  count: number;
  totalProcessingTime: number;
  successCount: number;
  failureCount: number;
  lastProcessedAt?: Date;
}
export declare class WebhookMetricsService {
  private readonly logger;
  private metrics;
  private shopMetrics;
  private globalMetrics;
  recordWebhookProcessing(
    topic: ShopifyWebhookTopic,
    shop: string,
    processingTimeMs: number,
    success: boolean,
  ): void;
  getTopicMetrics(topic: ShopifyWebhookTopic): WebhookMetricData | null;
  getAllTopicMetrics(): Map<ShopifyWebhookTopic, WebhookMetricData>;
  getShopMetrics(shop: string): Map<ShopifyWebhookTopic, WebhookMetricData> | null;
  getGlobalMetrics(): WebhookMetricData;
  getAverageProcessingTime(topic: ShopifyWebhookTopic): number;
  getSuccessRate(topic: ShopifyWebhookTopic): number;
  getGlobalSuccessRate(): number;
  resetAllMetrics(): void;
  generateMetricsReport(): any;
  private updateTopicMetrics;
  private updateShopMetrics;
  private updateGlobalMetrics;
}
export {};
