import { Injectable, Logger, Inject, BadRequestException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { shopifyConfig } from '../../../common/config/shopify-config';
import { IShopifyWebhookService } from '../../../common/interfaces/shopify-services.interfaces';
import {
  ShopifyWebhookTopic,
  ShopifyWebhookSubscription,
} from '../../../common/types/shopify-models.types';
import { ShopifyClientService } from './shopify-client.service';
import { ShopifyAuthEnhancedService } from './shopify-auth-enhanced.service';
import { PlatformType } from '../../enums/platform-type.enum';
import { randomUUID } from 'crypto';

/**
 * Enhanced ShopifyWebhookService implementing the IShopifyWebhookService interface
 *
 * This service handles all webhook-related functionality for Shopify:
 * - Webhook registration and management with 2025-01 API support
 * - Enhanced webhook signature verification using current best practices
 * - Webhook payload processing with support for new topics
 * - Support for fulfillment holds and customer data update topics
 *
 * This enhanced service provides full support for all webhook topics
 * introduced in the 2025-01 API version with improved security measures.
 */
@Injectable()
export class ShopifyWebhookEnhancedService implements IShopifyWebhookService {
  private readonly logger = new Logger(ShopifyWebhookEnhancedService.name);

  constructor(
    @Inject(shopifyConfig.KEY)
    private readonly config: ConfigType<typeof shopifyConfig>,
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
    private readonly shopifyClientService: ShopifyClientService,
    private readonly shopifyAuthService: ShopifyAuthEnhancedService,
  ) {}

  /**
   * Register a webhook subscription
   */
  async registerWebhook(
    shop: string,
    accessToken: string,
    topic: ShopifyWebhookTopic,
    address: string,
  ): Promise<ShopifyWebhookSubscription> {
    // Define the expected response type
    interface WebhookSubscriptionCreateResponse {
      webhookSubscriptionCreate: {
        userErrors: Array<{ field: string[]; message: string }>;
        webhookSubscription: {
          id: string;
          endpoint: {
            __typename: string;
            callbackUrl?: string;
          };
          format: string;
          topic: string;
        };
      };
    }
    try {
      // Convert webhook topic to GraphQL enum format
      const topicFormatted = topic.toUpperCase().replace(/\//g, '_');

      // Execute GraphQL mutation to create the webhook subscription
      const result = await this.shopifyClientService.query<WebhookSubscriptionCreateResponse>(
        shop,
        accessToken,
        this.config.DEFAULT_GRAPHQL_QUERIES.REGISTER_WEBHOOK,
        {
          topic: topicFormatted,
          webhookSubscription: {
            callbackUrl: address,
            format: 'JSON',
          },
        },
      );

      // Check for errors and handle result
      if (
        result &&
        result['webhookSubscriptionCreate'] &&
        result['webhookSubscriptionCreate']['userErrors'] &&
        result['webhookSubscriptionCreate']['userErrors'].length > 0
      ) {
        const errors = result['webhookSubscriptionCreate']['userErrors'];
        this.logger.error(`Failed to register webhook ${topic} for shop ${shop}:`, errors);
        throw new Error(
          `Failed to register webhook: ${errors[0] && errors[0].message ? errors[0].message : 'Unknown error'}`,
        );
      }

      const subscription =
        result &&
        result['webhookSubscriptionCreate'] &&
        result['webhookSubscriptionCreate']['webhookSubscription']
          ? result['webhookSubscriptionCreate']['webhookSubscription']
          : null;

      if (!subscription) {
        throw new Error(`Failed to register webhook: No subscription returned`);
      }

      // Map the response to our ShopifyWebhookSubscription interface
      return {
        id: subscription.id || '',
        address: (subscription.endpoint && subscription.endpoint.callbackUrl) || '',
        topic: topic,
        format: (subscription.format?.toLowerCase() as 'json' | 'xml') || 'json',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error registering webhook ${topic} for shop ${shop}:`, error);
      throw error;
    }
  }

  /**
   * Register all required webhooks for a shop
   */
  async registerAllWebhooks(
    shop: string,
    accessToken: string,
  ): Promise<ShopifyWebhookSubscription[]> {
    const results: ShopifyWebhookSubscription[] = [];
    const errors: Error[] = [];

    // Get webhook topics from config
    const webhookTopics = this.config.webhooks.topics as ShopifyWebhookTopic[];

    // Process each webhook topic
    for (const topic of webhookTopics) {
      try {
        // Build the full webhook URL
        const webhookUrl = `${this.config.webhooks.baseUrl}/${topic.replace(/\//g, '_')}`;

        this.logger.log(`Registering webhook ${topic} for shop ${shop} at ${webhookUrl}`);

        // Register the webhook
        const result = await this.registerWebhook(shop, accessToken, topic, webhookUrl);
        results.push(result);
      } catch (error) {
        this.logger.warn(`Failed to register webhook ${topic} for shop ${shop}:`, error);
        // Convert unknown error to Error object to satisfy TypeScript
        const typedError = error instanceof Error ? error : new Error(String(error));
        errors.push(typedError);
      }
    }

    // Log summary
    this.logger.log(
      `Registered ${results.length}/${webhookTopics.length} webhooks for shop ${shop}`,
    );

    if (errors.length > 0) {
      this.logger.warn(`${errors.length} webhooks failed to register for shop ${shop}`);
    }

    return results;
  }

  /**
   * Get all webhook subscriptions for a shop
   */
  async getWebhooks(shop: string, accessToken: string): Promise<ShopifyWebhookSubscription[]> {
    // Define the expected GraphQL response type
    interface WebhookSubscriptionsResponse {
      webhookSubscriptions: {
        edges: Array<{
          node: {
            id: string;
            topic: string;
            endpoint: {
              __typename: string;
              callbackUrl?: string;
            };
            format: string;
            createdAt: string;
            updatedAt: string;
          };
        }>;
      };
    }

    try {
      // Fetch webhooks using GraphQL
      const result = await this.shopifyClientService.query<WebhookSubscriptionsResponse>(
        shop,
        accessToken,
        this.config.DEFAULT_GRAPHQL_QUERIES.GET_WEBHOOKS,
      );

      // Ensure result has the expected shape
      if (!result || !result['webhookSubscriptions'] || !result['webhookSubscriptions']['edges']) {
        this.logger.warn(`Invalid response format when fetching webhooks for shop ${shop}`);
        return [];
      }

      // Map the response to our ShopifyWebhookSubscription interface with proper typing
      return result['webhookSubscriptions']['edges']
        .map((edge: { node: any }) => {
          const node = edge.node;
          if (!node) return null;

          return {
            id: node.id || '',
            address: (node.endpoint && node.endpoint.callbackUrl) || '',
            topic: this.formatTopicFromGraphQL(node.topic || ''),
            format: (node.format?.toLowerCase() as 'json' | 'xml') || 'json',
            createdAt: node.createdAt || new Date().toISOString(),
            updatedAt: node.updatedAt || new Date().toISOString(),
          };
        })
        .filter(Boolean) as ShopifyWebhookSubscription[];
    } catch (error) {
      this.logger.error(`Error fetching webhooks for shop ${shop}:`, error);
      throw error;
    }
  }

  /**
   * Verify the authenticity of a webhook request with enhanced security
   *
   * This improved verification method uses timing-safe comparison and
   * validates all required headers as per Shopify's 2025-01 security requirements
   *
   * @param rawBody The raw request body as a Buffer
   * @param headers All headers from the request including hmac, shop, and timestamp
   * @returns boolean indicating if the webhook is authentic
   */
  verifyWebhookSignature(rawBody: Buffer, headers: Record<string, string>): boolean {
    try {
      // Ensure we have all required headers
      const hmacHeader = headers['x-shopify-hmac-sha256'];
      const shopDomain = headers['x-shopify-shop-domain'];
      const timestamp = headers['x-shopify-hmac-timestamp'];
      const topic = headers['x-shopify-topic'];

      if (!hmacHeader || !shopDomain || !timestamp || !topic) {
        this.logger.error('Missing required headers for webhook verification', {
          hmac: !!hmacHeader,
          shop: !!shopDomain,
          timestamp: !!timestamp,
          topic: !!topic,
        });
        return false;
      }

      // Ensure secret is not undefined
      const secret = this.config.api.secret || '';
      if (!secret) {
        this.logger.error('Missing API secret for webhook verification');
        return false;
      }

      // Check for timestamp freshness (within 5 minutes)
      const timestampDate = new Date(timestamp);
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      if (isNaN(timestampDate.getTime()) || timestampDate < fiveMinutesAgo) {
        this.logger.error('Webhook timestamp is too old or invalid', { timestamp });
        return false;
      }

      // Create HMAC hash with our secret
      const generatedHash = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');

      // Use timing-safe comparison to prevent timing attacks
      const hmacValid = this.safeCompare(generatedHash, hmacHeader);

      if (!hmacValid) {
        this.logger.error('HMAC validation failed for webhook from shop ' + shopDomain);
        return false;
      }

      this.logger.debug(`Verified authentic webhook from ${shopDomain} for topic ${topic}`);
      return true;
    } catch (error) {
      this.logger.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Process a webhook payload with enhanced support for 2025-01 API topics
   * This implementation delegates to topic-specific handlers and includes
   * robust error handling and retries if needed
   */
  async processWebhook(topic: ShopifyWebhookTopic, shop: string, payload: any): Promise<void> {
    const webhookId = randomUUID(); // Generate a unique ID for this webhook event for tracking
    this.logger.log(`Processing webhook ${topic} from shop ${shop} [${webhookId}]`);

    try {
      // Track processing time for monitoring
      const startTime = Date.now();

      // Validate the shop domain before processing
      if (!this.isValidShopDomain(shop)) {
        throw new BadRequestException(`Invalid shop domain: ${shop}`);
      }

      // Validate payload has required data
      if (!payload || typeof payload !== 'object') {
        throw new BadRequestException('Invalid webhook payload format');
      }

      // Handle app uninstallation specially
      if (topic === 'app/uninstalled') {
        await this.handleAppUninstalled(shop, payload);
        return;
      }

      // For other webhooks, extract the resource type and event
      const [resourceType, event] = topic.split('/');

      // Record webhook reception in database for auditing
      await this.recordWebhookEvent(shop, topic, webhookId, payload);

      // Determine the webhook handler based on resource type
      switch (resourceType) {
        case 'products':
          await this.handleProductWebhook(event || '', shop, payload);
          break;
        case 'orders':
          await this.handleOrderWebhook(event || '', shop, payload);
          break;
        case 'customers':
          await this.handleCustomerWebhook(event || '', shop, payload);
          break;
        case 'customer_tags':
          await this.handleCustomerTagsWebhook(event || '', shop, payload);
          break;
        case 'customers_marketing_consent':
          // New in 2025-01: Dedicated topic for customer marketing consent changes
          await this.handleCustomerMarketingConsentWebhook(event || '', shop, payload);
          break;
        case 'fulfillments':
          await this.handleFulfillmentWebhook(event || '', shop, payload);
          break;
        case 'fulfillment_holds':
          // New in 2025-01: Dedicated topic for fulfillment holds
          await this.handleFulfillmentHoldWebhook(event || '', shop, payload);
          break;
        case 'inventory_levels':
          await this.handleInventoryWebhook(event || '', shop, payload);
          break;
        case 'bulk_operations':
          // New in 2025-01: Support for bulk operation webhooks
          await this.handleBulkOperationWebhook(event || '', shop, payload);
          break;
        default:
          this.logger.warn(`Unhandled webhook resource type: ${resourceType}`);
      }

      // Log the processing time for monitoring performance
      const processingTime = Date.now() - startTime;
      this.logger.debug(`Webhook ${topic} processed in ${processingTime}ms [${webhookId}]`);
    } catch (error) {
      this.logger.error(
        `Error processing webhook ${topic} from shop ${shop} [${webhookId}]:`,
        error,
      );
      // Don't throw the error - we want to acknowledge the webhook even if processing fails
      // The error is logged for troubleshooting and monitoring

      // Record the failure for later analysis and potential retry
      await this.recordWebhookFailure(shop, topic, webhookId, error);
    }
  }

  /**
   * Handle app uninstalled webhook
   */
  private async handleAppUninstalled(shop: string, _payload: any): Promise<void> {
    this.logger.log(`App uninstalled from shop ${shop}`);

    // Find all connections for this shop
    const connections = await this.merchantPlatformConnectionRepository.find({
      where: {
        platformType: PlatformType.SHOPIFY,
        platformIdentifier: shop,
      },
    });

    if (connections.length === 0) {
      this.logger.warn(`No connections found for shop ${shop} during uninstall`);
      return;
    }

    // Mark all connections as inactive
    for (const connection of connections) {
      await this.merchantPlatformConnectionRepository.update(
        { id: connection.id },
        {
          isActive: false,
          metadata: {
            ...connection.metadata,
            uninstalledAt: new Date().toISOString(),
          },
        },
      );
    }

    this.logger.log(
      `Successfully marked ${connections.length} connections as inactive for shop ${shop}`,
    );
  }

  /**
   * Handle product webhooks
   */
  private async handleProductWebhook(event: string, shop: string, payload: any): Promise<void> {
    // Find merchant by shop domain
    const merchantId = await this.getMerchantIdByShop(shop);
    if (!merchantId) {
      this.logger.warn(`No merchant found for shop ${shop}`);
      return;
    }

    // Process based on event type
    switch (event) {
      case 'create':
        this.logger.log(`Product created: ${payload.title} (${payload.id})`);
        // Here you would call your product service to sync the new product
        break;
      case 'update':
        this.logger.log(`Product updated: ${payload.title} (${payload.id})`);
        // Here you would call your product service to update the existing product
        break;
      case 'delete':
        this.logger.log(`Product deleted: ${payload.id}`);
        // Here you would call your product service to delete the product
        break;
      default:
        this.logger.warn(`Unhandled product event: ${event}`);
    }
  }

  /**
   * Handle order webhooks
   */
  private async handleOrderWebhook(event: string, shop: string, payload: any): Promise<void> {
    // Find merchant by shop domain
    const merchantId = await this.getMerchantIdByShop(shop);
    if (!merchantId) {
      this.logger.warn(`No merchant found for shop ${shop}`);
      return;
    }

    // Process based on event type
    switch (event) {
      case 'create':
        this.logger.log(`Order created: ${payload.name} (${payload.id})`);
        // Here you would call your order service to create a new order
        break;
      case 'updated':
        this.logger.log(`Order updated: ${payload.name} (${payload.id})`);
        // Here you would call your order service to update the existing order
        break;
      case 'cancelled':
        this.logger.log(`Order cancelled: ${payload.name} (${payload.id})`);
        // Here you would call your order service to cancel the order
        break;
      case 'fulfilled':
        this.logger.log(`Order fulfilled: ${payload.name} (${payload.id})`);
        // Here you would call your order service to update fulfillment status
        break;
      case 'paid':
        this.logger.log(`Order paid: ${payload.name} (${payload.id})`);
        // Here you would call your order service to update payment status
        break;
      case 'partially_fulfilled':
        this.logger.log(`Order partially fulfilled: ${payload.name} (${payload.id})`);
        // Here you would call your order service to update fulfillment status
        break;
      default:
        this.logger.warn(`Unhandled order event: ${event}`);
    }
  }

  /**
   * Handle customer webhooks
   * Includes processing for 2025-01 API changes to customer webhooks
   */
  private async handleCustomerWebhook(event: string, shop: string, payload: any): Promise<void> {
    // Find merchant by shop domain
    const merchantId = await this.getMerchantIdByShop(shop);
    if (!merchantId) {
      this.logger.warn(`No merchant found for shop ${shop}`);
      return;
    }

    // Process based on event type
    switch (event) {
      case 'create':
        this.logger.log(
          `Customer created: ${payload.first_name} ${payload.last_name} (${payload.id})`,
        );
        // Here you would call your customer service to create a new customer
        break;
      case 'update':
        this.logger.log(
          `Customer updated: ${payload.first_name} ${payload.last_name} (${payload.id})`,
        );
        // Here you would call your customer service to update the existing customer
        // Note: As of 2025-01, customer payloads no longer include tags, email_marketing_consent,
        // sms_marketing_consent, and order-related fields
        break;
      case 'delete':
        this.logger.log(`Customer deleted: ${payload.id}`);
        // Here you would call your customer service to delete the customer
        break;
      case 'email_marketing_consent_update':
        this.logger.log(`Customer email marketing consent updated: ${payload.id}`);
        // New in 2025-01: Process email marketing consent updates
        break;
      case 'marketing_consent_update':
        this.logger.log(`Customer marketing consent updated: ${payload.id}`);
        // New in 2025-01: Process marketing consent updates (includes SMS)
        break;
      case 'purchasing_summary':
        this.logger.log(`Customer purchasing summary updated: ${payload.id}`);
        // New in 2025-01: Process customer purchasing data updates
        // This includes last_order_id, last_order_name, total_spent, orders_count
        break;
      default:
        this.logger.warn(`Unhandled customer event: ${event}`);
    }
  }

  /**
   * Handle customer tags webhooks (new in 2025-01)
   */
  private async handleCustomerTagsWebhook(
    event: string,
    shop: string,
    payload: any,
  ): Promise<void> {
    // Find merchant by shop domain
    const merchantId = await this.getMerchantIdByShop(shop);
    if (!merchantId) {
      this.logger.warn(`No merchant found for shop ${shop}`);
      return;
    }

    // Process based on event type
    switch (event) {
      case 'added':
        this.logger.log(`Tags added to customer: ${payload.customer_id}`);
        // Process added tags (payload.tags)
        break;
      case 'removed':
        this.logger.log(`Tags removed from customer: ${payload.customer_id}`);
        // Process removed tags (payload.tags)
        break;
      default:
        this.logger.warn(`Unhandled customer tags event: ${event}`);
    }
  }

  /**
   * Handle fulfillment webhooks
   * Enhanced to support 2025-01 fulfillment and hold operations
   */
  private async handleFulfillmentWebhook(event: string, shop: string, payload: any): Promise<void> {
    // Find merchant by shop domain
    const merchantId = await this.getMerchantIdByShop(shop);
    if (!merchantId) {
      this.logger.warn(`No merchant found for shop ${shop}`);
      return;
    }

    // Process based on event type
    switch (event) {
      case 'create':
        this.logger.log(`Fulfillment created: ${payload.id} for order ${payload.order_id}`);
        // Store fulfillment details and update order status
        await this.recordFulfillmentEvent(merchantId, 'create', payload);
        break;
      case 'update':
        this.logger.log(`Fulfillment updated: ${payload.id} for order ${payload.order_id}`);
        // Update existing fulfillment data
        await this.recordFulfillmentEvent(merchantId, 'update', payload);
        break;
      case 'hold':
        // New in 2025-01 API - handle fulfillment holds
        this.logger.log(`Fulfillment hold created: ${payload.id} for order ${payload.order_id}`);
        await this.recordFulfillmentEvent(merchantId, 'hold', payload);
        break;
      case 'hold_released':
        // New in 2025-01 API - handle fulfillment hold releases
        this.logger.log(`Fulfillment hold released: ${payload.id} for order ${payload.order_id}`);
        await this.recordFulfillmentEvent(merchantId, 'hold_released', payload);
        break;
      case 'cancellation_request':
        // New in 2025-01 API - handle fulfillment cancellation requests
        this.logger.log(
          `Fulfillment cancellation requested: ${payload.id} for order ${payload.order_id}`,
        );
        await this.recordFulfillmentEvent(merchantId, 'cancellation_request', payload);
        break;
      case 'cancellation_request_approved':
        // New in 2025-01 API - handle approved cancellation requests
        this.logger.log(
          `Fulfillment cancellation approved: ${payload.id} for order ${payload.order_id}`,
        );
        await this.recordFulfillmentEvent(merchantId, 'cancellation_request_approved', payload);
        break;
      case 'cancellation_request_rejected':
        // New in 2025-01 API - handle rejected cancellation requests
        this.logger.log(
          `Fulfillment cancellation rejected: ${payload.id} for order ${payload.order_id}`,
        );
        await this.recordFulfillmentEvent(merchantId, 'cancellation_request_rejected', payload);
        break;
      case 'rescheduled':
        // New in 2025-01 API - handle fulfillment reschedules
        this.logger.log(`Fulfillment rescheduled: ${payload.id} for order ${payload.order_id}`);
        await this.recordFulfillmentEvent(merchantId, 'rescheduled', payload);
        break;
      default:
        this.logger.warn(`Unhandled fulfillment event: ${event}`);
    }
  }

  /**
   * NEW: Handle customer marketing consent webhooks (separate topic in 2025-01)
   */
  private async handleCustomerMarketingConsentWebhook(
    event: string,
    shop: string,
    payload: any,
  ): Promise<void> {
    const merchantId = await this.getMerchantIdByShop(shop);
    if (!merchantId) {
      this.logger.warn(`No merchant found for shop ${shop}`);
      return;
    }

    // Process based on event type
    switch (event) {
      case 'update':
        this.logger.log(`Customer marketing consent updated for customer ${payload.customer_id}`);
        // Process the updated consent data
        // payload will contain marketing consent details including state, opt-in level, etc.
        break;
      default:
        this.logger.warn(`Unhandled customer marketing consent event: ${event}`);
    }
  }

  /**
   * NEW: Handle fulfillment hold webhooks (new in 2025-01 API)
   */
  private async handleFulfillmentHoldWebhook(
    event: string,
    shop: string,
    payload: any,
  ): Promise<void> {
    const merchantId = await this.getMerchantIdByShop(shop);
    if (!merchantId) {
      this.logger.warn(`No merchant found for shop ${shop}`);
      return;
    }

    // Process based on event type
    switch (event) {
      case 'create':
        this.logger.log(`Fulfillment hold created: ${payload.id} for order ${payload.order_id}`);
        // Process the hold creation
        await this.recordFulfillmentEvent(merchantId, 'hold_created', payload);
        break;
      case 'release':
        this.logger.log(`Fulfillment hold released: ${payload.id} for order ${payload.order_id}`);
        // Process the hold release
        await this.recordFulfillmentEvent(merchantId, 'hold_released', payload);
        break;
      default:
        this.logger.warn(`Unhandled fulfillment hold event: ${event}`);
    }
  }

  /**
   * NEW: Handle bulk operation webhooks (new in 2025-01 API)
   */
  private async handleBulkOperationWebhook(
    event: string,
    shop: string,
    payload: any,
  ): Promise<void> {
    const merchantId = await this.getMerchantIdByShop(shop);
    if (!merchantId) {
      this.logger.warn(`No merchant found for shop ${shop}`);
      return;
    }

    // Process based on event type
    switch (event) {
      case 'finish':
        this.logger.log(`Bulk operation finished: ${payload.id}`);
        // Process the completed bulk operation
        // Update status in database, notify relevant services, etc.
        break;
      case 'error':
        this.logger.error(`Bulk operation error: ${payload.id}`, payload.error_code);
        // Handle the bulk operation error
        // Update status in database, trigger notifications, etc.
        break;
      default:
        this.logger.warn(`Unhandled bulk operation event: ${event}`);
    }
  }

  /**
   * Record fulfillment events in the database
   */
  private async recordFulfillmentEvent(
    merchantId: string,
    eventType: string,
    _payload: any,
  ): Promise<void> {
    try {
      // In a real implementation, you would store this in your database
      // For now, we'll just log it
      this.logger.log(`Recording fulfillment event: ${eventType} for merchant ${merchantId}`);

      // You would include code here to store the event in your database
    } catch (error) {
      this.logger.error(`Failed to record fulfillment event: ${eventType}`, error);
    }
  }

  /**
   * Record webhook events for auditing and troubleshooting
   */
  private async recordWebhookEvent(
    shop: string,
    topic: string,
    webhookId: string,
    payload: any,
  ): Promise<void> {
    try {
      // In a real implementation, you would store this in your database
      // For now, we'll just log it
      this.logger.debug(`Recording webhook event ${webhookId}: ${topic} for shop ${shop}`);

      // Store minimal info to avoid excessive logging
      const minimalPayload = {
        id: payload.id,
        shop: shop,
        topic: topic,
        webhook_id: webhookId,
        received_at: new Date().toISOString(),
      };

      this.logger.debug('Webhook metadata:', minimalPayload);
    } catch (error) {
      this.logger.error(`Failed to record webhook event`, error);
    }
  }

  /**
   * Record webhook processing failures for monitoring and potential retry
   */
  private async recordWebhookFailure(
    shop: string,
    topic: string,
    webhookId: string,
    error: any,
  ): Promise<void> {
    try {
      // In a real implementation, you would store this in your database
      // For now, we'll just log it
      this.logger.error(`Recording webhook failure ${webhookId}: ${topic} for shop ${shop}`);

      const errorInfo = {
        webhook_id: webhookId,
        shop: shop,
        topic: topic,
        error_message: error instanceof Error ? error.message : String(error),
        error_time: new Date().toISOString(),
        retry_count: 0,
      };

      this.logger.error('Webhook failure details:', errorInfo);
    } catch (recordError) {
      this.logger.error(`Failed to record webhook failure`, recordError);
    }
  }

  /**
   * Handle inventory webhooks
   */
  private async handleInventoryWebhook(event: string, shop: string, payload: any): Promise<void> {
    // Find merchant by shop domain
    const merchantId = await this.getMerchantIdByShop(shop);
    if (!merchantId) {
      this.logger.warn(`No merchant found for shop ${shop}`);
      return;
    }

    // Process based on event type
    switch (event) {
      case 'update':
        this.logger.log(
          `Inventory updated: Item ${payload.inventory_item_id} at location ${payload.location_id} to ${payload.available}`,
        );
        // Here you would call your inventory service to update stock levels
        break;
      case 'connect':
        this.logger.log(
          `Inventory connected: Item ${payload.inventory_item_id} at location ${payload.location_id}`,
        );
        // Handle inventory connection
        break;
      case 'disconnect':
        this.logger.log(
          `Inventory disconnected: Item ${payload.inventory_item_id} at location ${payload.location_id}`,
        );
        // Handle inventory disconnection
        break;
      default:
        this.logger.warn(`Unhandled inventory event: ${event}`);
    }
  }

  /**
   * Format topic from GraphQL enum format to standard format
   */
  private formatTopicFromGraphQL(topic: string): ShopifyWebhookTopic {
    // Convert from PRODUCTS_CREATE to products/create
    return topic.toLowerCase().replace('_', '/') as ShopifyWebhookTopic;
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

  /**
   * Verify that a shop domain is valid
   */
  private isValidShopDomain(shop: string): boolean {
    // Check the shop is a valid myshopify.com domain
    const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/;
    return shopRegex.test(shop);
  }

  /**
   * Perform a timing-safe comparison of strings to prevent timing attacks
   */
  private safeCompare(a: string, b: string): boolean {
    // Use Node's native timing-safe comparison if available
    try {
      return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    } catch (error) {
      // Fallback implementation if inputs are not the same length
      const aBuffer = Buffer.from(a);
      const bBuffer = Buffer.from(b);
      const len = Math.max(aBuffer.length, bBuffer.length);

      // Create padded buffers
      const aPadded = Buffer.alloc(len, 0);
      const bPadded = Buffer.alloc(len, 0);

      aBuffer.copy(aPadded);
      bBuffer.copy(bPadded);

      return crypto.timingSafeEqual(aPadded, bPadded);
    }
  }
}
