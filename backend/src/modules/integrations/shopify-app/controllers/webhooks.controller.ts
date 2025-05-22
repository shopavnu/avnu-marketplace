import {
  Controller,
  Post,
  Param,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { ShopifyWebhookTopic } from '../../../common/types/shopify-models.types';
import { WebhookRegistry } from '../webhooks/webhook-registry';
import { WebhookValidator } from '../webhooks/webhook-validator';
import { WebhookContext } from '../webhooks/webhook-handler.interface';
import { randomUUID } from 'crypto';

/**
 * Controller for handling Shopify webhook requests
 */
@Controller('webhooks/shopify')
export class ShopifyWebhooksController {
  private readonly logger = new Logger(ShopifyWebhooksController.name);

  constructor(
    private readonly webhookRegistry: WebhookRegistry,
    private readonly webhookValidator: WebhookValidator,
  ) {}

  /**
   * Generic endpoint for handling all webhook topics
   * The topic is encoded in the URL path
   */
  @Post(':topic')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('topic') topicParam: string,
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
    @Req() request: RawBodyRequest<Request>,
  ): Promise<any> {
    try {
      // Convert URL topic parameter to Shopify webhook topic format
      // e.g. 'products_create' to 'products/create'
      const topic = topicParam.replace('_', '/') as ShopifyWebhookTopic;

      // Extract raw body for HMAC validation
      const rawBody = request.rawBody;
      if (!rawBody) {
        this.logger.error('Raw body not available for webhook verification');
        return { success: false, message: 'Invalid request' };
      }

      // Verify webhook signature
      const isValid = this.webhookValidator.verifyWebhookSignature(rawBody, headers);
      if (!isValid) {
        this.logger.warn(`Invalid webhook signature for topic ${topic}`);
        return { success: false, message: 'Invalid webhook signature' };
      }

      // Extract shop domain from headers
      const shop = headers['x-shopify-shop-domain'];
      if (!shop) {
        this.logger.warn('Shop domain not provided in webhook headers');
        return { success: false, message: 'Missing shop domain' };
      }

      // Generate a unique ID for this webhook
      const webhookId = randomUUID();

      // Create webhook context
      const context: WebhookContext = {
        topic,
        shop,
        payload,
        webhookId,
        timestamp: new Date(),
        headers,
      };

      // Process the webhook
      this.logger.log(`Processing webhook ${webhookId} for topic ${topic} from shop ${shop}`);
      const result = await this.webhookRegistry.process(context);

      // We always return 200 even on processing errors to prevent Shopify from retrying
      // Failed webhooks will be handled by our retry mechanism
      return {
        success: result.success,
        webhookId,
        message: result.message || 'Webhook received',
      };
    } catch (error) {
      this.logger.error(`Error handling webhook: ${error.message}`, error.stack);

      // We still return 200 to prevent Shopify from retrying
      // Our monitoring system will pick up the failure
      return { success: false, message: 'Error processing webhook' };
    }
  }

  /**
   * Generic health check endpoint
   */
  @Post('health')
  healthCheck(): { status: string; topics: ShopifyWebhookTopic[] } {
    return {
      status: 'ok',
      topics: this.webhookRegistry.getRegisteredTopics(),
    };
  }
}
