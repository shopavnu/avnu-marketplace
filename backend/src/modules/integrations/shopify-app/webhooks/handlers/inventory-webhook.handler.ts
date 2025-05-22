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
 * Handler for inventory-related webhooks
 *
 * Processes inventory level updates and other inventory-related events
 */
@Injectable()
export class InventoryWebhookHandler extends BaseWebhookHandler {
  private readonly logger = new Logger(InventoryWebhookHandler.name);

  constructor(
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
  ) {
    super(['inventory_levels/update', 'inventory_items/update', 'inventory_items/delete']);
  }

  /**
   * Process inventory webhooks
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

      // Process based on topic - inventory webhooks have a different structure
      // than other Shopify webhooks (they use _ instead of /)
      if (topic === 'inventory_levels/update') {
        await this.handleInventoryLevelUpdate(merchantId, payload);
      } else if (topic === 'inventory_items/update') {
        await this.handleInventoryItemUpdate(merchantId, payload);
      } else if (topic === 'inventory_items/delete') {
        await this.handleInventoryItemDelete(merchantId, payload);
      } else {
        this.logger.warn(`Unhandled inventory event: ${topic}`);
        return this.createErrorResult(
          new Error(`Unhandled inventory event: ${topic}`),
          'Unknown inventory event',
        );
      }

      return this.createSuccessResult(`Successfully processed ${topic} webhook`, {
        merchantId,
        inventoryData: {
          itemId: payload.inventory_item_id || payload.id,
          locationId: payload.location_id,
        },
      });
    } catch (error) {
      this.logger.error(`Error processing inventory webhook: ${error.message}`, error.stack);
      return this.createErrorResult(error, `Failed to process inventory webhook: ${error.message}`);
    }
  }

  /**
   * Handle inventory level updates
   *
   * This occurs when a product's inventory quantity changes at a location
   */
  private async handleInventoryLevelUpdate(merchantId: string, data: any): Promise<void> {
    this.logger.log(
      `Inventory level updated for item ${data.inventory_item_id} at location ${data.location_id} to ${data.available}`,
    );

    // Here you would:
    // 1. Find the corresponding product variant in your database
    // 2. Update its inventory level
    // 3. Trigger any necessary events (low stock alerts, etc)
    // 4. Update any related metafields or records
  }

  /**
   * Handle inventory item updates
   *
   * This occurs when inventory item properties change (like SKU, cost, etc.)
   */
  private async handleInventoryItemUpdate(merchantId: string, data: any): Promise<void> {
    this.logger.log(`Inventory item updated: ${data.id} for merchant ${merchantId}`);

    // Here you would:
    // 1. Find the corresponding inventory item in your database
    // 2. Update its properties (cost, SKU, etc.)
    // 3. Update any related product variants
  }

  /**
   * Handle inventory item deletion
   */
  private async handleInventoryItemDelete(merchantId: string, data: any): Promise<void> {
    this.logger.log(`Inventory item deleted: ${data.id} for merchant ${merchantId}`);

    // Here you would:
    // 1. Find the corresponding inventory item in your database
    // 2. Mark it as deleted or remove it
    // 3. Update any related product variants
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
