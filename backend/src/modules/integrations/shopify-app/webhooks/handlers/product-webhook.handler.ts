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
 * Handler for product-related webhooks
 */
@Injectable()
export class ProductWebhookHandler extends BaseWebhookHandler {
  private readonly logger = new Logger(ProductWebhookHandler.name);

  constructor(
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
  ) {
    super('products/update');
  }

  /**
   * Process product webhooks
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

      // Extract the event from the topic (e.g., 'create' from 'products/create')
      const event = topic.split('/')[1];

      // Process based on event type
      switch (event) {
        case 'create':
          await this.handleProductCreate(merchantId, payload);
          break;
        case 'update':
          await this.handleProductUpdate(merchantId, payload);
          break;
        case 'delete':
          await this.handleProductDelete(merchantId, payload);
          break;
        default:
          this.logger.warn(`Unhandled product event: ${event}`);
          return this.createErrorResult(
            new Error(`Unhandled product event: ${event}`),
            'Unknown product event',
          );
      }

      return this.createSuccessResult(`Successfully processed ${topic} webhook`, {
        merchantId,
        productId: payload.id,
      });
    } catch (error) {
      this.logger.error(`Error processing product webhook: ${error.message}`, error.stack);
      return this.createErrorResult(error, `Failed to process product webhook: ${error.message}`);
    }
  }

  /**
   * Handle product creation
   */
  private async handleProductCreate(merchantId: string, productData: any): Promise<void> {
    this.logger.log(`Product created: ${productData.id} for merchant ${merchantId}`);

    // Here you would:
    // 1. Transform the Shopify product data to your internal format
    // 2. Save the product to your database
    // 3. Trigger any necessary events or side effects
  }

  /**
   * Handle product update
   */
  private async handleProductUpdate(merchantId: string, productData: any): Promise<void> {
    this.logger.log(`Product updated: ${productData.id} for merchant ${merchantId}`);

    // Here you would:
    // 1. Find the existing product in your database
    // 2. Update it with the new data
    // 3. Trigger any necessary events or side effects
  }

  /**
   * Handle product deletion
   */
  private async handleProductDelete(merchantId: string, productData: any): Promise<void> {
    this.logger.log(`Product deleted: ${productData.id} for merchant ${merchantId}`);

    // Here you would:
    // 1. Find the product in your database
    // 2. Mark it as deleted or remove it entirely
    // 3. Trigger any necessary events or side effects
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
