import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BaseWebhookHandler,
  WebhookContext,
  WebhookHandlerResult,
} from '../webhook-handler.interface';
import { MerchantPlatformConnection } from '../../../entities/merchant-platform-connection.entity';
import { PlatformType } from '../../../enums/platform-type.enum';

/**
 * Handler for order-related webhooks
 */
@Injectable()
export class OrderWebhookHandler extends BaseWebhookHandler {
  private readonly logger = new Logger(OrderWebhookHandler.name);

  constructor(
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
  ) {
    super('orders/create');
  }

  /**
   * Process order webhooks
   */
  async process(context: WebhookContext): Promise<WebhookHandlerResult> {
    try {
      const { shop, payload, topic } = context;

      // Find merchant by shop domain
      const merchantId = await this.getMerchantIdByShop(shop);
      if (!merchantId) {
        this.logger.warn(`No merchant found for shop ${shop}`);
        return this.createErrorResult(
          new Error(`No merchant found for shop ${shop}`),
          'Merchant not found',
        );
      }

      // Extract the event from the topic (e.g., 'create' from 'orders/create')
      const event = topic.split('/')[1];

      // Process based on event type
      switch (event) {
        case 'create':
          await this.handleOrderCreate(merchantId, payload);
          break;
        case 'updated': // Note: Shopify uses 'updated' not 'update' for orders
          await this.handleOrderUpdate(merchantId, payload);
          break;
        case 'cancelled':
          await this.handleOrderCancel(merchantId, payload);
          break;
        case 'fulfilled':
          await this.handleOrderFulfill(merchantId, payload);
          break;
        case 'paid':
          await this.handleOrderPaid(merchantId, payload);
          break;
        default:
          this.logger.warn(`Unhandled order event: ${event}`);
          return this.createErrorResult(
            new Error(`Unhandled order event: ${event}`),
            'Unknown order event',
          );
      }

      return this.createSuccessResult(`Successfully processed ${topic} webhook`, {
        merchantId,
        orderId: payload.id,
      });
    } catch (error) {
      this.logger.error(`Error processing order webhook: ${error.message}`, error.stack);
      return this.createErrorResult(error, `Failed to process order webhook: ${error.message}`);
    }
  }

  /**
   * Handle order creation
   */
  private async handleOrderCreate(merchantId: string, orderData: any): Promise<void> {
    this.logger.log(`Order created: ${orderData.id} for merchant ${merchantId}`);

    // Here you would:
    // 1. Transform the Shopify order data to your internal format
    // 2. Save the order to your database
    // 3. Trigger any necessary events or side effects (notifications, etc)
  }

  /**
   * Handle order update
   */
  private async handleOrderUpdate(merchantId: string, orderData: any): Promise<void> {
    this.logger.log(`Order updated: ${orderData.id} for merchant ${merchantId}`);

    // Here you would:
    // 1. Find the existing order in your database
    // 2. Update it with the new data
    // 3. Trigger any necessary events or side effects
  }

  /**
   * Handle order cancellation
   */
  private async handleOrderCancel(merchantId: string, orderData: any): Promise<void> {
    this.logger.log(`Order cancelled: ${orderData.id} for merchant ${merchantId}`);

    // Here you would:
    // 1. Find the order in your database
    // 2. Mark it as cancelled
    // 3. Handle any inventory adjustments
    // 4. Trigger any necessary events or side effects
  }

  /**
   * Handle order fulfillment
   */
  private async handleOrderFulfill(merchantId: string, orderData: any): Promise<void> {
    this.logger.log(`Order fulfilled: ${orderData.id} for merchant ${merchantId}`);

    // Here you would:
    // 1. Find the order in your database
    // 2. Update its fulfillment status
    // 3. Trigger any necessary events (tracking notifications, etc)
  }

  /**
   * Handle order payment
   */
  private async handleOrderPaid(merchantId: string, orderData: any): Promise<void> {
    this.logger.log(`Order paid: ${orderData.id} for merchant ${merchantId}`);

    // Here you would:
    // 1. Find the order in your database
    // 2. Update its payment status
    // 3. Trigger any necessary events (receipts, etc)
  }

  /**
   * Get merchant ID by shop domain
   */
  private async getMerchantIdByShop(shop: string): Promise<string | null> {
    const connection = await this.merchantPlatformConnectionRepository.findOne({
      where: {
        platformType: PlatformType.SHOPIFY as unknown as PlatformType,
        platformIdentifier: shop,
        isActive: true,
      },
    });

    return connection ? connection.merchantId : null;
  }
}
