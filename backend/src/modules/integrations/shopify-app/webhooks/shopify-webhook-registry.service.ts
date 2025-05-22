import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { ShopifyClientService } from '../services/shopify-client.service';
import { shopifyConfig } from '../../../common/config/shopify-config';
import { WebhookRegistry } from './webhook-registry';
import { WebhookValidator } from './webhook-validator';
import { WebhookContext } from './webhook-handler.interface';
import {
  ProductWebhookHandler,
  OrderWebhookHandler,
  AppUninstalledWebhookHandler,
} from './handlers';
import {
  ShopifyWebhookTopic,
  ShopifyWebhookSubscription,
} from '../../../common/types/shopify-models.types';
import { IShopifyWebhookService } from '../../../common/interfaces/shopify-services.interfaces';

/**
 * Enhanced Shopify Webhook Service using the Registry pattern
 *
 * This service implements the IShopifyWebhookService interface but uses
 * our new registry pattern internally for better separation of concerns.
 */
@Injectable()
export class ShopifyWebhookRegistryService implements IShopifyWebhookService, OnModuleInit {
  private readonly logger = new Logger(ShopifyWebhookRegistryService.name);

  constructor(
    @Inject(shopifyConfig.KEY)
    private readonly config: ConfigType<typeof shopifyConfig>,
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
    private readonly shopifyClientService: ShopifyClientService,
    private readonly webhookRegistry: WebhookRegistry,
    private readonly webhookValidator: WebhookValidator,
    // Inject all handlers
    private readonly productHandler: ProductWebhookHandler,
    private readonly orderHandler: OrderWebhookHandler,
    private readonly appUninstalledHandler: AppUninstalledWebhookHandler,
  ) {}

  /**
   * Register all handlers when the module is initialized
   */
  async onModuleInit() {
    // Register all webhook handlers
    this.webhookRegistry.registerHandlers([
      this.productHandler,
      this.orderHandler,
      this.appUninstalledHandler,
    ]);

    this.logger.log(
      `Registered ${this.webhookRegistry.getRegisteredTopics().length} webhook handlers`,
    );
  }

  /**
   * Register a webhook subscription with Shopify
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
            format: 'json',
          },
        },
      );

      // Check for errors and handle result
      if (
        result?.webhookSubscriptionCreate?.userErrors &&
        result.webhookSubscriptionCreate.userErrors.length > 0
      ) {
        const errors = result.webhookSubscriptionCreate.userErrors;
        this.logger.error(`Failed to register webhook ${topic} for shop ${shop}:`, errors);
        throw new Error(`Failed to register webhook: ${errors[0]?.message || 'Unknown error'}`);
      }

      const subscription = result?.webhookSubscriptionCreate?.webhookSubscription;

      if (!subscription) {
        throw new Error(`Failed to register webhook ${topic}: No subscription returned`);
      }

      // Return the webhook subscription data
      return {
        id: subscription.id,
        topic: this.formatTopicFromGraphQL(subscription.topic),
        address: subscription.endpoint?.callbackUrl || address,
        format: subscription.format as 'json' | 'xml',
        createdAt: new Date().toISOString(), // Default to now if not provided
        updatedAt: new Date().toISOString(), // Default to now if not provided
      };
    } catch (error) {
      this.logger.error(
        `Error registering webhook ${topic} for shop ${shop}: ${error.message}`,
        error.stack,
      );
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
    try {
      const webhookTopics = Object.keys(this.config.webhooks.topics) as ShopifyWebhookTopic[];
      const _results: ShopifyWebhookSubscription[] = [];

      // Get base URL for webhook endpoints
      const baseUrl = this.config.webhooks.baseUrl;

      // Log webhook registration attempt
      this.logger.log(`Registering ${webhookTopics.length} webhooks for shop ${shop}`);

      // Register each webhook in parallel for better performance
      const promises = webhookTopics.map(async topic => {
        try {
          const address = `${baseUrl}/${topic.replace('/', '_')}`;
          const result = await this.registerWebhook(shop, accessToken, topic, address);
          this.logger.log(`Successfully registered webhook ${topic} for shop ${shop}`);
          return result;
        } catch (error) {
          this.logger.error(`Failed to register webhook ${topic}: ${error.message}`);
          return null;
        }
      });

      // Wait for all registration attempts to complete
      const allResults = await Promise.all(promises);

      // Filter out failed registrations
      return allResults.filter(Boolean) as ShopifyWebhookSubscription[];
    } catch (error) {
      this.logger.error(`Error registering webhooks for shop ${shop}: ${error.message}`);
      throw error;
    }
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
      // Execute GraphQL query to get webhooks
      const result = await this.shopifyClientService.query<WebhookSubscriptionsResponse>(
        shop,
        accessToken,
        this.config.DEFAULT_GRAPHQL_QUERIES.GET_WEBHOOKS,
      );

      // Extract and transform webhook subscription data
      const webhooks = result?.webhookSubscriptions?.edges.map(({ node }) => ({
        id: node.id,
        topic: this.formatTopicFromGraphQL(node.topic),
        address: node.endpoint?.callbackUrl || '',
        format: node.format as 'json' | 'xml',
        createdAt: node.createdAt || new Date().toISOString(),
        updatedAt: node.updatedAt || new Date().toISOString(),
      }));

      return webhooks || [];
    } catch (error) {
      this.logger.error(`Error fetching webhooks for shop ${shop}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify the authenticity of a webhook request
   */
  verifyWebhookSignature(rawBody: Buffer, headers: Record<string, string>): boolean {
    return this.webhookValidator.verifyWebhookSignature(rawBody, headers);
  }

  /**
   * Process a webhook request - now using the registry pattern
   */
  async processWebhook(topic: ShopifyWebhookTopic, shop: string, payload: any): Promise<void> {
    try {
      // Create a webhook ID for tracking
      const webhookId = randomUUID();
      this.logger.log(`Processing webhook ${topic} for shop ${shop} (ID: ${webhookId})`);

      // Create the webhook context
      const context: WebhookContext = {
        topic,
        shop,
        payload,
        webhookId,
        timestamp: new Date(),
      };

      // Record webhook receipt
      await this.recordWebhookEvent(context);

      // Process the webhook using the registry pattern
      const result = await this.webhookRegistry.process(context);

      if (!result.success) {
        this.logger.error(`Webhook processing failed: ${result.message}`, result.error);
        await this.recordWebhookFailure(shop, topic, webhookId, result.error);
      }
    } catch (error) {
      this.logger.error(
        `Unexpected error processing webhook ${topic} for ${shop}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Record a webhook event for monitoring and analytics
   */
  private async recordWebhookEvent(context: WebhookContext): Promise<void> {
    try {
      const { topic, shop, webhookId, timestamp } = context;

      // In a production environment, you would store this in a database
      const minimalPayload = {
        shop,
        topic,
        webhook_id: webhookId,
        received_at: timestamp.toISOString(),
      };

      this.logger.debug('Webhook metadata:', minimalPayload);
    } catch (error) {
      this.logger.error(`Failed to record webhook event: ${error.message}`);
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
      // In a production environment, you would store this in a database
      this.logger.error(`Recording webhook failure ${webhookId}: ${topic} for shop ${shop}`);

      const errorInfo = {
        webhook_id: webhookId,
        shop,
        topic,
        error_message: error instanceof Error ? error.message : String(error),
        error_time: new Date().toISOString(),
        retry_count: 0,
      };

      this.logger.error('Webhook failure details:', errorInfo);
    } catch (recordError) {
      this.logger.error(`Failed to record webhook failure: ${recordError.message}`);
    }
  }

  /**
   * Format topic from GraphQL enum format to standard format
   */
  private formatTopicFromGraphQL(topic: string): ShopifyWebhookTopic {
    // Convert from PRODUCTS_CREATE to products/create
    return topic.toLowerCase().replace('_', '/') as ShopifyWebhookTopic;
  }
}
