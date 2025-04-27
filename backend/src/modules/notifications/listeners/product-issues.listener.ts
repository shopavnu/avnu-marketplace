import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from '../services/notification.service';

interface ProductIssueEvent {
  merchantId: string;
  merchantEmail: string;
  productIssues: Array<{
    productId: string;
    productTitle: string;
    issues: string[];
    suppressedFrom: string[];
  }>;
}

@Injectable()
export class ProductIssuesListener {
  private readonly logger = new Logger(ProductIssuesListener.name);

  constructor(private notificationService: NotificationService) {}

  /**
   * Handle product issues event and send notification to merchant
   * @param payload Event payload with merchant and product issues information
   */
  @OnEvent('merchant.product.issues')
  async handleProductIssuesEvent(payload: ProductIssueEvent): Promise<void> {
    try {
      this.logger.log(
        `Received product issues event for merchant ${payload.merchantId} with ${payload.productIssues.length} affected products`,
      );

      // Only send notification for products that are actually suppressed
      const suppressedProducts = payload.productIssues.filter(
        issue => issue.suppressedFrom && issue.suppressedFrom.length > 0,
      );

      if (suppressedProducts.length === 0) {
        this.logger.log('No suppressed products to notify about, skipping notification');
        return;
      }

      // Send email notification to merchant
      const success = await this.notificationService.notifyMerchantOfProductIssues(
        payload.merchantId,
        payload.merchantEmail,
        suppressedProducts,
      );

      if (success) {
        this.logger.log(
          `Successfully sent product issues notification to ${payload.merchantEmail}`,
        );
      } else {
        this.logger.error(`Failed to send product issues notification to ${payload.merchantEmail}`);
      }
    } catch (error) {
      this.logger.error(`Error handling product issues event: ${error.message}`, error.stack);
    }
  }
}
