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
 * Handler for app uninstall webhook
 *
 * This is a critical webhook that needs to be handled reliably, as it's the only
 * notification we receive when a merchant uninstalls our app from their Shopify store.
 */
@Injectable()
export class AppUninstalledWebhookHandler extends BaseWebhookHandler {
  private readonly logger = new Logger(AppUninstalledWebhookHandler.name);

  constructor(
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
  ) {
    super('app/uninstalled');
  }

  /**
   * Process app/uninstalled webhook
   */
  async process(context: WebhookContext): Promise<WebhookHandlerResult> {
    try {
      const { shop, payload } = context;

      this.logger.log(`Processing app uninstall for shop: ${shop}`);

      // Find all active connections for this shop
      const connections = await this.merchantPlatformConnectionRepository.find({
        where: {
          platformType: PlatformType.SHOPIFY as unknown as PlatformType,
          platformIdentifier: shop,
          isActive: true,
        },
      });

      if (connections.length === 0) {
        this.logger.warn(`No active connections found for shop ${shop}`);
        return this.createSuccessResult('No active connections found to deactivate', {
          shop,
          connectionsFound: 0,
        });
      }

      // Deactivate all connections for this shop
      for (const connection of connections) {
        await this.deactivateConnection(connection, payload);
      }

      return this.createSuccessResult('Successfully processed app uninstall webhook', {
        shop,
        deactivatedConnections: connections.length,
      });
    } catch (error) {
      this.logger.error(`Error processing app uninstall webhook: ${error.message}`, error.stack);
      return this.createErrorResult(
        error,
        `Failed to process app uninstall webhook: ${error.message}`,
      );
    }
  }

  /**
   * Deactivate a merchant platform connection and perform cleanup
   */
  private async deactivateConnection(
    connection: MerchantPlatformConnection,
    payload: any,
  ): Promise<void> {
    try {
      this.logger.log(
        `Deactivating connection for merchant ${connection.merchantId} and shop ${connection.platformIdentifier}`,
      );

      // Update connection status
      connection.isActive = false;
      connection.updatedAt = new Date();
      connection.metadata = {
        ...connection.metadata,
        uninstalledAt: new Date().toISOString(),
        uninstallReason: payload.reason || 'unknown',
      };

      // Save the updated connection
      await this.merchantPlatformConnectionRepository.save(connection);

      this.logger.log(`Successfully deactivated connection for merchant ${connection.merchantId}`);

      // Here you would add any additional cleanup:
      // 1. Clear scheduled jobs related to this shop
      // 2. Stop any sync processes
      // 3. Notify other systems about the uninstallation
      // 4. Archive or clean up data as needed
    } catch (error) {
      this.logger.error(
        `Failed to deactivate connection for merchant ${connection.merchantId}:`,
        error,
      );
      throw error;
    }
  }
}
