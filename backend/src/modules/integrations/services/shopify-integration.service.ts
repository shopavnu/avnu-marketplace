import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { ShopifyAppService } from '../shopify-app/services/shopify-app.service';
import {
  ProductIntegrationService,
  SyncResult,
  PlatformType,
  PlatformProductDto,
  INTEGRATION_EVENTS,
  ProductImportedEvent,
  ProductExportedEvent,
  ProductUpdatedEvent,
  ProductDeletedEvent,
  WebhookEvent,
} from '../../shared';
import { ShopifyProduct, ShopifyOrder, ShopifyWebhookEvent } from '../interfaces/shopify.interface';

/**
 * Service for integrating with Shopify platform
 *
 * This service implements the ProductIntegrationService interface
 * specifically for Shopify integrations.
 */
@Injectable()
export class ShopifyIntegrationService implements ProductIntegrationService {
  private readonly logger = new Logger(ShopifyIntegrationService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly shopifyService: ShopifyAppService,
  ) {}

  /**
   * Process an incoming product from Shopify
   *
   * @param product The product data from Shopify
   * @param platformType Always PlatformType.SHOPIFY
   * @param merchantId Our internal merchant ID
   * @returns The product data in our internal format
   */
  processIncomingProduct(
    product: ShopifyProduct,
    platformType: PlatformType,
    merchantId: string,
  ): PlatformProductDto {
    try {
      this.logger.debug(`Processing incoming Shopify product`);

      // Ensure this is actually a Shopify product
      if (platformType !== PlatformType.SHOPIFY) {
        throw new Error(`Expected Shopify product but received ${platformType}`);
      }

      return this.shopifyService.processIncomingProduct(product, platformType, merchantId);
    } catch (error) {
      this.logger.error(
        `Error processing incoming Shopify product: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Prepare an outgoing product for Shopify
   *
   * @param product The product data in our internal format
   * @param platformType Always PlatformType.SHOPIFY
   * @returns The product data in Shopify's format
   */
  prepareOutgoingProduct(product: PlatformProductDto, platformType: PlatformType): ShopifyProduct {
    try {
      this.logger.debug(`Preparing outgoing product for Shopify`);

      // Ensure this is actually for Shopify
      if (platformType !== PlatformType.SHOPIFY) {
        throw new Error(`Expected Shopify platform but received ${platformType}`);
      }

      return this.shopifyService.prepareOutgoingProduct(product, platformType);
    } catch (error) {
      this.logger.error(
        `Error preparing outgoing Shopify product: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get a product from Shopify
   *
   * @param productId The Shopify product ID
   * @param merchantId ID of the merchant who owns the product
   * @returns Shopify product data
   */
  async getProduct(productId: string, merchantId: string): Promise<PlatformProductDto> {
    try {
      this.logger.debug(`Getting product ${productId} from Shopify for merchant ${merchantId}`);

      const product = await this.shopifyService.getProduct(productId, merchantId);

      // Emit product imported event
      const event: ProductImportedEvent = {
        eventId: uuidv4(),
        timestamp: new Date(),
        platformType: PlatformType.SHOPIFY,
        merchantId,
        externalProductId: productId,
        internalProductId: 'unknown', // Will be updated by handler if available
        productData: product,
        origin: 'marketplace',
        status: 'success',
      };

      this.eventEmitter.emit(INTEGRATION_EVENTS.PRODUCT_IMPORTED, event);

      return product;
    } catch (error) {
      this.logger.error(
        `Error getting product from Shopify: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Emit failure event
      const event: ProductImportedEvent = {
        eventId: uuidv4(),
        timestamp: new Date(),
        platformType: PlatformType.SHOPIFY,
        merchantId,
        externalProductId: productId,
        internalProductId: 'unknown',
        productData: null,
        origin: 'marketplace',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : String(error),
      };

      this.eventEmitter.emit(INTEGRATION_EVENTS.PRODUCT_IMPORTED, event);

      throw error;
    }
  }

  /**
   * Create a product on Shopify
   *
   * @param productData Product data to create
   * @param merchantId ID of the merchant who owns the product
   * @returns Shopify product data including the newly created external ID
   */
  async createProduct(
    productData: PlatformProductDto,
    merchantId: string,
  ): Promise<PlatformProductDto> {
    try {
      this.logger.debug(`Creating product on Shopify for merchant ${merchantId}`);

      // Ensure the product is properly formatted for Shopify
      const shopifyProductData = {
        ...productData,
        platformType: PlatformType.SHOPIFY,
      };

      // Create the product via Shopify service
      const createdProduct = await this.shopifyService.createProduct(
        shopifyProductData,
        merchantId,
      );

      // Emit product exported event
      const event: ProductExportedEvent = {
        eventId: uuidv4(),
        timestamp: new Date(),
        platformType: PlatformType.SHOPIFY,
        merchantId: merchantId || 'unknown', // Ensure merchantId is never undefined
        externalProductId: createdProduct.id || 'unknown',
        internalProductId: productData.id || 'unknown',
        productData: createdProduct,
        origin: 'marketplace',
        status: 'success',
      };

      this.eventEmitter.emit(INTEGRATION_EVENTS.PRODUCT_EXPORTED, event);

      return createdProduct;
    } catch (error) {
      this.logger.error(
        `Error creating product on Shopify: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Emit failure event
      const event: ProductExportedEvent = {
        eventId: uuidv4(),
        timestamp: new Date(),
        platformType: PlatformType.SHOPIFY,
        merchantId,
        externalProductId: 'unknown',
        internalProductId: productData.id || 'unknown',
        productData: productData,
        origin: 'marketplace',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : String(error),
      };

      this.eventEmitter.emit(INTEGRATION_EVENTS.PRODUCT_EXPORTED, event);

      throw error;
    }
  }

  /**
   * Update a product on Shopify
   *
   * @param productId Shopify product ID
   * @param productData Updated product data
   * @param merchantId ID of the merchant who owns the product
   * @returns Updated Shopify product data
   */
  async updateProduct(
    productId: string,
    productData: Partial<PlatformProductDto>,
    merchantId: string,
  ): Promise<PlatformProductDto> {
    try {
      this.logger.debug(`Updating product ${productId} on Shopify for merchant ${merchantId}`);

      // Ensure the product is properly formatted for Shopify
      const shopifyProductData = {
        ...productData,
        platformType: PlatformType.SHOPIFY,
      };

      // Update the product via Shopify service
      const updatedProduct = await this.shopifyService.updateProduct(
        productId,
        shopifyProductData,
        merchantId,
      );

      // Emit product updated event
      const event: ProductUpdatedEvent = {
        eventId: uuidv4(),
        timestamp: new Date(),
        platformType: PlatformType.SHOPIFY,
        merchantId,
        externalProductId: productId,
        internalProductId: productData.id || 'unknown',
        // Include required updatedFields property
        updatedFields: Object.keys(productData),
        origin: 'marketplace',
        status: 'success',
      };

      this.eventEmitter.emit(INTEGRATION_EVENTS.PRODUCT_UPDATED, event);

      return updatedProduct;
    } catch (error) {
      this.logger.error(
        `Error updating product on Shopify: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Emit failure event
      const event: ProductUpdatedEvent = {
        eventId: uuidv4(),
        timestamp: new Date(),
        platformType: PlatformType.SHOPIFY,
        merchantId,
        externalProductId: productId,
        internalProductId: productData.id || 'unknown',
        // Include required updatedFields property
        updatedFields: Object.keys(productData),
        origin: 'marketplace',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : String(error),
      };

      this.eventEmitter.emit(INTEGRATION_EVENTS.PRODUCT_UPDATED, event);

      throw error;
    }
  }

  /**
   * Delete a product from Shopify
   *
   * @param productId Shopify product ID
   * @param merchantId ID of the merchant who owns the product
   * @returns Success indicator
   */
  async deleteProduct(productId: string, merchantId: string): Promise<boolean> {
    try {
      this.logger.debug(`Deleting product ${productId} from Shopify for merchant ${merchantId}`);

      // Delete the product via Shopify service
      await this.shopifyService.deleteProduct(productId, merchantId);

      // Emit product deleted event
      const event: ProductDeletedEvent = {
        eventId: uuidv4(),
        timestamp: new Date(),
        platformType: PlatformType.SHOPIFY,
        merchantId,
        externalProductId: productId,
        internalProductId: 'unknown', // Will be updated by handler if available
        origin: 'marketplace',
        status: 'success',
      };

      this.eventEmitter.emit(INTEGRATION_EVENTS.PRODUCT_DELETED, event);

      return true;
    } catch (error) {
      this.logger.error(
        `Error deleting product from Shopify: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Emit failure event
      const event: ProductDeletedEvent = {
        eventId: uuidv4(),
        timestamp: new Date(),
        platformType: PlatformType.SHOPIFY,
        merchantId,
        externalProductId: productId,
        internalProductId: 'unknown',
        origin: 'marketplace',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : String(error),
      };

      this.eventEmitter.emit(INTEGRATION_EVENTS.PRODUCT_DELETED, event);

      return false;
    }
  }

  /**
   * Sync products from Shopify to our database
   *
   * @param merchantId The merchant ID in our system
   * @returns Sync result with counts of created, updated, failed, and total products
   */
  async syncProducts(merchantId: string): Promise<SyncResult> {
    try {
      this.logger.debug(`Syncing products from Shopify for merchant ${merchantId}`);

      return await this.shopifyService.syncProducts(merchantId);
    } catch (error) {
      this.logger.error(
        `Error syncing products from Shopify: ${error instanceof Error ? error.message : String(error)}`,
      );

      return {
        created: 0,
        updated: 0,
        failed: 1,
        total: 1,
        errors: [error instanceof Error ? error.message : String(error)],
        success: false,
      };
    }
  }

  /**
   * Sync orders from Shopify to our database
   *
   * @param merchantId The merchant ID in our system
   * @returns Sync result with counts of created, updated, failed, and total orders
   */
  async syncOrders(merchantId: string): Promise<SyncResult> {
    try {
      this.logger.debug(`Syncing orders from Shopify for merchant ${merchantId}`);

      return await this.shopifyService.syncOrders(merchantId);
    } catch (error) {
      this.logger.error(
        `Error syncing orders from Shopify: ${error instanceof Error ? error.message : String(error)}`,
      );

      return {
        created: 0,
        updated: 0,
        failed: 1,
        total: 1,
        errors: [error instanceof Error ? error.message : String(error)],
        success: false,
      };
    }
  }

  /**
   * Handle webhook events from Shopify
   *
   * @param event The webhook event type (e.g., 'products/create', 'orders/updated')
   * @param data The webhook payload data
   * @param merchantId The merchant ID associated with the webhook
   * @returns Promise resolving to a boolean indicating success or failure
   */
  async handleWebhook(
    event: string,
    data: Record<string, unknown>,
    merchantId: string,
  ): Promise<boolean> {
    try {
      this.logger.debug(`Handling Shopify webhook event: ${event} for merchant ${merchantId}`);

      // Process different types of webhook events
      if (event.toLowerCase().includes('product')) {
        // Handle product-related webhook
        return await this.handleProductWebhook(event, data as ShopifyProduct, merchantId);
      } else if (event.toLowerCase().includes('order')) {
        // Handle order-related webhook
        return await this.handleOrderWebhook(event, data as ShopifyOrder, merchantId);
      } else {
        this.logger.warn(`Unsupported Shopify webhook event type: ${event}`);
        return false;
      }
    } catch (error) {
      this.logger.error(
        `Error handling Shopify webhook: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * Handle Shopify product webhook events
   *
   * @private
   * @param event The webhook event type
   * @param data The webhook payload data
   * @param merchantId The merchant ID associated with the webhook
   */
  private async handleProductWebhook(
    event: string,
    data: ShopifyProduct,
    merchantId: string,
  ): Promise<boolean> {
    try {
      this.logger.debug(`Handling Shopify product webhook: ${event}`);

      // Emit webhook event
      const webhookEvent: WebhookEvent = {
        eventId: uuidv4(),
        timestamp: new Date(),
        platformType: PlatformType.SHOPIFY,
        merchantId,
        eventType: event,
        eventData: data,
        status: 'received',
      };

      this.eventEmitter.emit(INTEGRATION_EVENTS.WEBHOOK_RECEIVED, webhookEvent);

      // Process the webhook based on event type
      if (event.toLowerCase().includes('create')) {
        // Process created product
        const productDto = this.processIncomingProduct(data, PlatformType.SHOPIFY, merchantId);

        // TODO: Create or update the product in our database
        this.logger.debug(`Processed created product from Shopify webhook: ${productDto.name}`);
        return true;
      } else if (event.toLowerCase().includes('update')) {
        // Process updated product
        const productDto = this.processIncomingProduct(data, PlatformType.SHOPIFY, merchantId);

        // TODO: Update the product in our database
        this.logger.debug(`Processed updated product from Shopify webhook: ${productDto.name}`);
        return true;
      } else if (event.toLowerCase().includes('delete')) {
        // Process deleted product
        // Data might be limited for deleted products
        const externalId = data.id?.toString() || 'unknown';

        // TODO: Mark the product as deleted in our database
        this.logger.debug(`Processing deleted product from Shopify webhook: ${externalId}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Error handling Shopify product webhook: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * Handle Shopify order webhook events
   *
   * @private
   * @param event The webhook event type
   * @param data The webhook payload data
   * @param merchantId The merchant ID associated with the webhook
   */
  private async handleOrderWebhook(
    event: string,
    data: ShopifyOrder,
    merchantId: string,
  ): Promise<boolean> {
    try {
      this.logger.debug(`Handling Shopify order webhook: ${event}`);

      // Emit webhook event
      const webhookEvent: WebhookEvent = {
        eventId: uuidv4(),
        timestamp: new Date(),
        platformType: PlatformType.SHOPIFY,
        merchantId,
        eventType: event,
        eventData: data,
        status: 'received',
      };

      this.eventEmitter.emit(INTEGRATION_EVENTS.WEBHOOK_RECEIVED, webhookEvent);

      // Process the webhook based on event type
      // Implementation would be similar to product webhook processing
      this.logger.debug(`Processed order from Shopify webhook`);

      return true;
    } catch (error) {
      this.logger.error(
        `Error handling Shopify order webhook: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }
}
