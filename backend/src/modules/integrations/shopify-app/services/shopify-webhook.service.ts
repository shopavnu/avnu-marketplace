import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { PlatformType } from '../../enums/platform-type.enum';
import {
  ShopifyProduct,
  ShopifyOrder,
} from '../../../common/types/shopify-models.types';
import * as crypto from 'crypto';

@Injectable()
export class ShopifyWebhookService {
  private readonly logger = new Logger(ShopifyWebhookService.name);

  // This would typically come from environment variables
  private readonly apiSecret: string = process.env['SHOPIFY_API_SECRET'] || 'your-api-secret';

  constructor(
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
  ) {}

  /**
   * Verify the HMAC signature of a Shopify webhook
   */
  async verifyWebhook(hmac: string, body: string): Promise<boolean> {
    try {
      const calculatedHmac = crypto
        .createHmac('sha256', this.apiSecret)
        .update(body, 'utf8')
        .digest('base64');

      return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(calculatedHmac));
    } catch (error) {
      this.logger.error(
        `Error verifying webhook: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * Get a merchant connection for a Shopify store by domain
   */
  private async getConnectionByShopDomain(
    shopDomain: string,
  ): Promise<MerchantPlatformConnection | null> {
    try {
      return await this.merchantPlatformConnectionRepository.findOne({
        where: {
          platformStoreName: shopDomain,
          platformType: PlatformType.SHOPIFY,
          isActive: true,
        },
      });
    } catch (error) {
      this.logger.error(
        `Error getting connection for shop ${shopDomain}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  /**
   * Handle Shopify webhooks by topic
   */
  async handleWebhook(topic: string, shop: string, data: unknown): Promise<void> {
    try {
      this.logger.log(`Processing ${topic} webhook from ${shop}`);

      const connection = await this.getConnectionByShopDomain(shop);

      if (!connection) {
        this.logger.warn(`No connection found for shop ${shop}, can't process webhook`);
        return;
      }

      // Update the last synced timestamp
      connection.lastSyncedAt = new Date();
      await this.merchantPlatformConnectionRepository.save(connection);

      // Process based on topic
      switch (topic) {
        case 'products/create':
          await this.handleProductCreate(connection, data as ShopifyProduct);
          break;
        case 'products/update':
          await this.handleProductUpdate(connection, data as ShopifyProduct);
          break;
        case 'products/delete':
          await this.handleProductDelete(connection, data as ShopifyProduct);
          break;
        case 'orders/create':
          await this.handleOrderCreate(connection, data as ShopifyOrder);
          break;
        case 'orders/updated':
          await this.handleOrderUpdate(connection, data as ShopifyOrder);
          break;
        case 'orders/cancelled':
          await this.handleOrderCancel(connection, data as ShopifyOrder);
          break;
        case 'app/uninstalled':
          await this.handleAppUninstalled(connection);
          break;
        default:
          this.logger.warn(`Unhandled webhook topic: ${topic}`);
      }
    } catch (error) {
      this.logger.error(
        `Error handling webhook: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Handle Shopify product creation webhook
   */
  private async handleProductCreate(
    connection: MerchantPlatformConnection,
    data: ShopifyProduct,
  ): Promise<void> {
    // In a real implementation, this would:
    // 1. Map the Shopify product data to our product model
    // 2. Save it to our database

    this.logger.log(`Product created: ${data.id} for shop ${connection.platformStoreName}`);
  }

  /**
   * Handle Shopify product update webhook
   */
  private async handleProductUpdate(
    connection: MerchantPlatformConnection,
    data: ShopifyProduct,
  ): Promise<void> {
    // In a real implementation, this would:
    // 1. Find the existing product by external ID
    // 2. Update it with new data

    this.logger.log(`Product updated: ${data.id} for shop ${connection.platformStoreName}`);
  }

  /**
   * Handle Shopify product deletion webhook
   */
  private async handleProductDelete(
    connection: MerchantPlatformConnection,
    data: ShopifyProduct,
  ): Promise<void> {
    // In a real implementation, this would:
    // 1. Find the existing product by external ID
    // 2. Mark it as deleted or remove it

    this.logger.log(`Product deleted: ${data.id} for shop ${connection.platformStoreName}`);
  }

  /**
   * Handle Shopify order creation webhook
   */
  private async handleOrderCreate(
    connection: MerchantPlatformConnection,
    data: ShopifyOrder,
  ): Promise<void> {
    // In a real implementation, this would:
    // 1. Map the Shopify order data to our order model
    // 2. Save it to our database

    this.logger.log(`Order created: ${data.id} for shop ${connection.platformStoreName}`);
  }

  /**
   * Handle Shopify order update webhook
   */
  private async handleOrderUpdate(
    connection: MerchantPlatformConnection,
    data: ShopifyOrder,
  ): Promise<void> {
    // In a real implementation, this would:
    // 1. Find the existing order by external ID
    // 2. Update it with new data

    this.logger.log(`Order updated: ${data.id} for shop ${connection.platformStoreName}`);
  }

  /**
   * Handle Shopify order cancellation webhook
   */
  private async handleOrderCancel(
    connection: MerchantPlatformConnection,
    data: ShopifyOrder,
  ): Promise<void> {
    // In a real implementation, this would:
    // 1. Find the existing order by external ID
    // 2. Mark it as cancelled

    this.logger.log(`Order cancelled: ${data.id} for shop ${connection.platformStoreName}`);
  }

  /**
   * Handle Shopify app uninstallation webhook
   */
  private async handleAppUninstalled(connection: MerchantPlatformConnection): Promise<void> {
    // Mark the connection as inactive
    connection.isActive = false;
    await this.merchantPlatformConnectionRepository.save(connection);

    this.logger.log(`App uninstalled for shop ${connection.platformStoreName}`);
  }
}
