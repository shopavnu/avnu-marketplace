import { Controller, Get, UseGuards, Logger } from '@nestjs/common';
import { WebhookMetricsService } from '../webhooks/webhook-metrics.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

/**
 * Controller for exposing webhook metrics for monitoring and admin purposes
 *
 * This controller is secured with JwtAuthGuard to prevent unauthorized access to metrics
 */
@Controller('admin/shopify/metrics')
@UseGuards(JwtAuthGuard)
export class ShopifyMetricsController {
  private readonly logger = new Logger(ShopifyMetricsController.name);

  constructor(private readonly metricsService: WebhookMetricsService) {}

  /**
   * Get a report of all webhook metrics
   */
  @Get('webhooks')
  getWebhookMetrics() {
    this.logger.log('Generating webhook metrics report');
    return this.metricsService.generateMetricsReport();
  }

  /**
   * Reset all webhook metrics
   */
  @Get('webhooks/reset')
  resetWebhookMetrics() {
    this.logger.log('Resetting webhook metrics');
    this.metricsService.resetAllMetrics();
    return { success: true, message: 'Webhook metrics have been reset' };
  }

  /**
   * Get webhook success rate
   */
  @Get('webhooks/success-rate')
  getWebhookSuccessRate() {
    const rate = this.metricsService.getGlobalSuccessRate();
    return {
      success: true,
      successRate: rate,
      status: rate > 95 ? 'healthy' : rate > 80 ? 'warning' : 'critical',
    };
  }
}
