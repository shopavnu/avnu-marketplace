import { Injectable, Logger } from '@nestjs/common';
import { ShopifyWebhookTopic } from '../../../common/types/shopify-models.types';

/**
 * Interface for webhook processing metrics
 */
interface WebhookMetricData {
  count: number;
  totalProcessingTime: number;
  successCount: number;
  failureCount: number;
  lastProcessedAt?: Date;
}

/**
 * Service for collecting and reporting metrics about webhook processing
 */
@Injectable()
export class WebhookMetricsService {
  private readonly logger = new Logger(WebhookMetricsService.name);

  // Store metrics by topic
  private metrics: Map<ShopifyWebhookTopic, WebhookMetricData> = new Map();

  // Store metrics by shop domain
  private shopMetrics: Map<string, Map<ShopifyWebhookTopic, WebhookMetricData>> = new Map();

  // Global metrics
  private globalMetrics: WebhookMetricData = {
    count: 0,
    totalProcessingTime: 0,
    successCount: 0,
    failureCount: 0,
  };

  /**
   * Record metrics for a webhook processing event
   */
  recordWebhookProcessing(
    topic: ShopifyWebhookTopic,
    shop: string,
    processingTimeMs: number,
    success: boolean,
  ): void {
    try {
      // Update topic metrics
      this.updateTopicMetrics(topic, processingTimeMs, success);

      // Update shop-specific metrics
      this.updateShopMetrics(shop, topic, processingTimeMs, success);

      // Update global metrics
      this.updateGlobalMetrics(processingTimeMs, success);

      // Log for real-time monitoring if processing time is high
      if (processingTimeMs > 1000) {
        // 1 second threshold
        this.logger.warn(
          `Slow webhook processing for ${topic} from ${shop}: ${processingTimeMs}ms`,
        );
      }
    } catch (error) {
      this.logger.error(`Error recording webhook metrics: ${error.message}`, error.stack);
    }
  }

  /**
   * Get metrics for a specific topic
   */
  getTopicMetrics(topic: ShopifyWebhookTopic): WebhookMetricData | null {
    return this.metrics.get(topic) || null;
  }

  /**
   * Get metrics for all topics
   */
  getAllTopicMetrics(): Map<ShopifyWebhookTopic, WebhookMetricData> {
    return new Map(this.metrics);
  }

  /**
   * Get metrics for a specific shop
   */
  getShopMetrics(shop: string): Map<ShopifyWebhookTopic, WebhookMetricData> | null {
    return this.shopMetrics.get(shop) || null;
  }

  /**
   * Get global metrics
   */
  getGlobalMetrics(): WebhookMetricData {
    return { ...this.globalMetrics };
  }

  /**
   * Get average processing time for a topic
   */
  getAverageProcessingTime(topic: ShopifyWebhookTopic): number {
    const metrics = this.metrics.get(topic);
    if (!metrics || metrics.count === 0) {
      return 0;
    }
    return metrics.totalProcessingTime / metrics.count;
  }

  /**
   * Get success rate for a topic (0-100%)
   */
  getSuccessRate(topic: ShopifyWebhookTopic): number {
    const metrics = this.metrics.get(topic);
    if (!metrics || metrics.count === 0) {
      return 0;
    }
    return (metrics.successCount / metrics.count) * 100;
  }

  /**
   * Get global success rate (0-100%)
   */
  getGlobalSuccessRate(): number {
    if (this.globalMetrics.count === 0) {
      return 0;
    }
    return (this.globalMetrics.successCount / this.globalMetrics.count) * 100;
  }

  /**
   * Reset all metrics
   */
  resetAllMetrics(): void {
    this.metrics.clear();
    this.shopMetrics.clear();
    this.globalMetrics = {
      count: 0,
      totalProcessingTime: 0,
      successCount: 0,
      failureCount: 0,
    };
    this.logger.log('All webhook metrics have been reset');
  }

  /**
   * Generate a report of webhook metrics
   */
  generateMetricsReport(): any {
    const topicMetrics: Record<string, any> = {};

    // Build topic metrics
    for (const [topic, data] of this.metrics.entries()) {
      const averageTime = data.count > 0 ? data.totalProcessingTime / data.count : 0;
      const successRate = data.count > 0 ? (data.successCount / data.count) * 100 : 0;

      topicMetrics[topic] = {
        count: data.count,
        averageProcessingTimeMs: Math.round(averageTime),
        successRate: Math.round(successRate * 100) / 100, // Round to 2 decimal places
        failures: data.failureCount,
        lastProcessedAt: data.lastProcessedAt?.toISOString(),
      };
    }

    // Build global metrics
    const globalAverageTime =
      this.globalMetrics.count > 0
        ? this.globalMetrics.totalProcessingTime / this.globalMetrics.count
        : 0;
    const globalSuccessRate =
      this.globalMetrics.count > 0
        ? (this.globalMetrics.successCount / this.globalMetrics.count) * 100
        : 0;

    return {
      global: {
        totalCount: this.globalMetrics.count,
        averageProcessingTimeMs: Math.round(globalAverageTime),
        successRate: Math.round(globalSuccessRate * 100) / 100,
        failures: this.globalMetrics.failureCount,
      },
      byTopic: topicMetrics,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Update metrics for a specific topic
   */
  private updateTopicMetrics(
    topic: ShopifyWebhookTopic,
    processingTimeMs: number,
    success: boolean,
  ): void {
    const existingMetrics = this.metrics.get(topic) || {
      count: 0,
      totalProcessingTime: 0,
      successCount: 0,
      failureCount: 0,
    };

    // Update metrics
    existingMetrics.count += 1;
    existingMetrics.totalProcessingTime += processingTimeMs;
    existingMetrics.lastProcessedAt = new Date();

    if (success) {
      existingMetrics.successCount += 1;
    } else {
      existingMetrics.failureCount += 1;
    }

    // Save updated metrics
    this.metrics.set(topic, existingMetrics);
  }

  /**
   * Update metrics for a specific shop and topic
   */
  private updateShopMetrics(
    shop: string,
    topic: ShopifyWebhookTopic,
    processingTimeMs: number,
    success: boolean,
  ): void {
    // Get or create shop metrics map
    if (!this.shopMetrics.has(shop)) {
      this.shopMetrics.set(shop, new Map());
    }

    const shopMetricsMap = this.shopMetrics.get(shop)!;

    // Get or create topic metrics for this shop
    const existingMetrics = shopMetricsMap.get(topic) || {
      count: 0,
      totalProcessingTime: 0,
      successCount: 0,
      failureCount: 0,
    };

    // Update metrics
    existingMetrics.count += 1;
    existingMetrics.totalProcessingTime += processingTimeMs;
    existingMetrics.lastProcessedAt = new Date();

    if (success) {
      existingMetrics.successCount += 1;
    } else {
      existingMetrics.failureCount += 1;
    }

    // Save updated metrics
    shopMetricsMap.set(topic, existingMetrics);
  }

  /**
   * Update global metrics
   */
  private updateGlobalMetrics(processingTimeMs: number, success: boolean): void {
    this.globalMetrics.count += 1;
    this.globalMetrics.totalProcessingTime += processingTimeMs;

    if (success) {
      this.globalMetrics.successCount += 1;
    } else {
      this.globalMetrics.failureCount += 1;
    }
  }
}
