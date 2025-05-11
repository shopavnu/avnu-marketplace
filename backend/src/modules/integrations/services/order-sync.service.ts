// @ts-strict-mode: enabled
import { Injectable, Logger } from '@nestjs/common';
import { IntegrationType } from '../types/integration-type.enum';
import { ShopifyService } from './shopify.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantPlatformConnection } from '../entities/merchant-platform-connection.entity';
import { PlatformType } from '../enums/platform-type.enum';

/**
 * Service for syncing orders from e-commerce platforms
 *
 * This service handles synchronization of orders from various platform integrations (primarily Shopify).
 * It includes proper type handling for platform connections and uses the PlatformType enum
 * for better type safety when querying connections.
 *
 * Key features:
 * - Type-safe repository queries using proper entity field names
 * - Error handling with detailed logging
 * - Platform-agnostic design with platform-specific implementations
 */
@Injectable()
export class OrderSyncService {
  private readonly logger = new Logger(OrderSyncService.name);

  constructor(
    private readonly shopifyService: ShopifyService,
    @InjectRepository(MerchantPlatformConnection)
    private readonly connectionsRepository: Repository<MerchantPlatformConnection>,
  ) {}

  /**
   * Sync orders from a platform
   * @param type Integration type
   * @param merchantId Merchant ID
   */
  async syncOrders(
    type: IntegrationType,
    merchantId: string,
  ): Promise<{ created: number; updated: number; failed: number }> {
    try {
      this.logger.log(`Syncing orders for merchant ${merchantId} from ${type}`);

      if (type !== IntegrationType.SHOPIFY) {
        throw new Error(`Unsupported integration type: ${type}`);
      }

      // Placeholder: In a real implementation, we would:
      // 1. Get the merchant's connection details
      // 2. Call the appropriate platform service to fetch orders
      // 3. Process and save the orders
      // 4. Return results

      return { created: 0, updated: 0, failed: 0 };
    } catch (error) {
      this.logger.error(
        `Failed to sync orders from ${type}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Handle order webhook from a platform
   * @param type Integration type
   * @param payload Webhook payload
   * @param topic Webhook topic
   * @param merchantId Merchant ID
   */
  async handleOrderWebhook(
    type: IntegrationType,
    payload: Record<string, unknown>,
    topic: string,
    merchantId: string,
  ): Promise<boolean> {
    try {
      this.logger.log(`Handling order webhook for merchant ${merchantId} from ${type}`);

      if (type !== IntegrationType.SHOPIFY) {
        throw new Error(`Unsupported integration type: ${type}`);
      }

      // Get the merchant connection to extract the shop domain
      const connection = await this.connectionsRepository.findOne({
        where: { merchantId, platformType: PlatformType.SHOPIFY },
      });

      if (!connection) {
        throw new Error(`No Shopify connection found for merchant ${merchantId}`);
      }

      // Placeholder: In a real implementation, we would:
      // Process the webhook data based on the topic

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to handle order webhook from ${type}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return false;
    }
  }
}
