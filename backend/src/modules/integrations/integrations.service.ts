import { Injectable, Logger } from '@nestjs/common';
import { ShopifyService } from './services/shopify.service';
import { WooCommerceService } from './services/woocommerce.service';

export type IntegrationType = 'shopify' | 'woocommerce';

export interface IntegrationCredentials {
  shopify?: {
    shopDomain: string;
    apiKey: string;
    apiSecret: string;
    accessToken: string;
  };
  woocommerce?: {
    storeUrl: string;
    consumerKey: string;
    consumerSecret: string;
  };
}

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    private readonly shopifyService: ShopifyService,
    private readonly wooCommerceService: WooCommerceService,
  ) {}

  /**
   * Authenticate with an e-commerce platform
   * @param type The integration type
   * @param credentials The integration credentials
   */
  async authenticate(type: IntegrationType, credentials: IntegrationCredentials): Promise<boolean> {
    try {
      switch (type) {
        case 'shopify':
          if (!credentials.shopify) {
            throw new Error('Shopify credentials are required');
          }

          return this.shopifyService.authenticate(
            credentials.shopify.shopDomain,
            credentials.shopify.apiKey,
            credentials.shopify.apiSecret,
            credentials.shopify.accessToken,
          );

        case 'woocommerce':
          if (!credentials.woocommerce) {
            throw new Error('WooCommerce credentials are required');
          }

          return this.wooCommerceService.authenticate(
            credentials.woocommerce.storeUrl,
            credentials.woocommerce.consumerKey,
            credentials.woocommerce.consumerSecret,
          );

        default:
          throw new Error(`Unsupported integration type: ${type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to authenticate with ${type}: ${error.message}`);
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
    credentials: IntegrationCredentials,
    merchantId: string,
  ): Promise<{ created: number; updated: number; failed: number }> {
    try {
      switch (type) {
        case 'shopify':
          if (!credentials.shopify) {
            throw new Error('Shopify credentials are required');
          }

          return this.shopifyService.syncProducts(
            credentials.shopify.shopDomain,
            credentials.shopify.accessToken,
            merchantId,
          );

        case 'woocommerce':
          if (!credentials.woocommerce) {
            throw new Error('WooCommerce credentials are required');
          }

          return this.wooCommerceService.syncProducts(
            credentials.woocommerce.storeUrl,
            credentials.woocommerce.consumerKey,
            credentials.woocommerce.consumerSecret,
            merchantId,
          );

        default:
          throw new Error(`Unsupported integration type: ${type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to sync products from ${type}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle webhook from an e-commerce platform
   * @param type The integration type
   * @param payload The webhook payload
   * @param topic The webhook topic
   * @param merchantId The merchant ID in our system
   */
  async handleWebhook(
    type: IntegrationType,
    payload: any,
    topic: string,
    merchantId: string,
  ): Promise<void> {
    try {
      switch (type) {
        case 'shopify':
          return this.shopifyService.handleWebhook(payload, topic, merchantId);

        case 'woocommerce':
          return this.wooCommerceService.handleWebhook(payload, topic, merchantId);

        default:
          throw new Error(`Unsupported integration type: ${type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle webhook from ${type}: ${error.message}`);
      throw error;
    }
  }
}
