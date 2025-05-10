// @ts-strict-mode: enabled
import { Injectable, Logger } from '@nestjs/common';
import { ShopifyService } from './services/shopify.service';
// WooCommerceAdapter removed as part of Shopify-first approach
import { IntegrationType } from './types/integration-type.enum';

export interface IntegrationCredentials {
  shopify?: {
    shopDomain: string;
    apiKey: string;
    apiSecret: string;
    accessToken: string;
  };
  shopDomain?: string; // These flat properties are for backward compatibility
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  // WooCommerce properties removed as part of Shopify-first approach
}

export interface SyncResult {
  added: number; // Changed to match ShopifyService's SyncResult interface
  updated: number;
  failed: number;
  errors?: string[];
}

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(private readonly shopifyService: ShopifyService) {}

  // WooCommerce connection methods removed as part of Shopify-first approach

  /**
   * Authenticate with an e-commerce platform
   * @param type The integration type
   * @param credentials The integration credentials
   */
  async authenticate(type: IntegrationType, credentials: IntegrationCredentials): Promise<boolean> {
    try {
      // Only Shopify is supported as part of our Shopify-first approach
      if (type !== IntegrationType.SHOPIFY) {
        throw new Error(`Unsupported integration type: ${type}`);
      }

      // Handle both nested and flat credential structures
      const shopDomain = credentials.shopify?.shopDomain || credentials.shopDomain || '';
      const accessToken = credentials.shopify?.accessToken || credentials.accessToken || '';

      if (!shopDomain || !accessToken) {
        throw new Error('Shopify domain and access token are required');
      }

      // The ShopifyService.authenticate returns string | null, so we convert to boolean
      const result = await this.shopifyService.authenticate(shopDomain, accessToken);
      return result !== null;
    } catch (error) {
      this.logger.error(
        `Failed to authenticate with ${type}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * Sync products from an e-commerce platform
   * @param type The integration type
   * @param credentials The integration credentials
   * @param merchantId The merchant ID in our system
   */
  async syncProducts(
    type: IntegrationType,
    credentials: IntegrationCredentials, // keep param for backward compatibility
    merchantId: string,
  ): Promise<SyncResult> {
    try {
      // Only Shopify is supported as part of our Shopify-first approach
      if (type !== IntegrationType.SHOPIFY) {
        throw new Error(`Unsupported integration type: ${type}`);
      }

      // ShopifyService.syncProducts only needs merchantId now
      const result = await this.shopifyService.syncProducts(merchantId);

      // Convert between SyncResult interfaces
      return {
        added: result.added || 0,
        updated: result.updated || 0,
        failed: result.failed || 0,
        errors: result.errors || [],
      };
    } catch (error) {
      this.logger.error(
        `Failed to sync products from ${type}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return { added: 0, updated: 0, failed: 0, errors: [`${error}`] };
    }
  }

  /**
   * Handle webhook from an e-commerce platform
   * @param type The integration type
   * @param payload The webhook payload
   * @param topic The webhook topic
   * @param merchantId The merchant ID
   */
  async handleWebhook(
    type: IntegrationType,
    payload: Record<string, unknown>,
    topic: string,
    merchantId: string,
  ): Promise<boolean> {
    try {
      // Only Shopify is supported as part of our Shopify-first approach
      if (type !== IntegrationType.SHOPIFY) {
        throw new Error(`Unsupported integration type: ${type}`);
      }

      // Get the merchant connection to extract the shop domain
      const connection = await this.shopifyService.getMerchantConnection(merchantId, 'shopify');

      if (!connection) {
        throw new Error(`No Shopify connection found for merchant ${merchantId}`);
      }

      // ShopifyService.handleWebhook expects (topic, shop, webhookData)
      await this.shopifyService.handleWebhook(topic, connection.platformStoreUrl, payload as any);
      return true; // Return true on successful processing
    } catch (error) {
      this.logger.error(
        `Failed to handle webhook from ${type}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }
}
