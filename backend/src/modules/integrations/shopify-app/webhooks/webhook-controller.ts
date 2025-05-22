import {
  Controller,
  Post,
  Headers,
  Body,
  RawBodyRequest,
  Req,
  Logger as _Logger,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { WebhookValidator } from './webhook-validator';
import { DistributedWebhookProcessor } from './distributed-webhook-processor';
import { ShopifyStructuredLogger } from '../utils/structured-logger';
import crypto from 'crypto';

/**
 * Controller for handling Shopify webhook requests
 *
 * This controller:
 * 1. Validates incoming webhook signatures
 * 2. Routes webhooks to the appropriate topic handler
 * 3. Queues webhooks for reliable processing
 */
@Controller('shopify/webhooks')
export class ShopifyWebhookController {
  private readonly logger: ShopifyStructuredLogger;

  constructor(
    private readonly webhookValidator: WebhookValidator,
    private readonly webhookProcessor: DistributedWebhookProcessor,
    private readonly configService: ConfigService,
    logger: ShopifyStructuredLogger,
  ) {
    this.logger = logger;
  }

  /**
   * Main webhook endpoint that handles all Shopify webhook topics
   *
   * This method:
   * 1. Validates the HMAC signature to ensure it's a legitimate Shopify request
   * 2. Identifies the webhook topic from the headers
   * 3. Queues the webhook for distributed processing
   */
  @Post()
  @HttpCode(200) // Always return 200 to Shopify, even if processing fails
  async processWebhook(
    @Headers('x-shopify-shop-domain') shop: string,
    @Headers('x-shopify-topic') topic: string,
    @Headers('x-shopify-hmac-sha256') hmac: string,
    @Headers('x-shopify-webhook-id') webhookId: string,
    @Body() payload: any,
    @Req() request: RawBodyRequest<Request>,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Log webhook received
      this.logger.logWebhookEvent(topic, shop, webhookId);

      // Get the raw body for HMAC validation
      const rawBody = request.rawBody ? request.rawBody.toString('utf8') : JSON.stringify(payload);

      // Validate the HMAC signature
      const isValid = this.webhookValidator.validateHmac(
        hmac,
        rawBody,
        this.configService.get('SHOPIFY_WEBHOOK_SECRET'),
      );

      if (!isValid) {
        this.logger.error(`Invalid webhook signature for ${shop}`, {
          shopDomain: shop,
          topic,
          webhookId,
        });

        // Still return 200 to avoid Shopify retrying invalid signatures
        return {
          success: false,
          message: 'Invalid signature',
        };
      }

      // Generate a unique ID if not provided by Shopify
      const uniqueWebhookId = webhookId || this.generateWebhookId(shop, topic, rawBody);

      // Extract merchant ID from the payload if available
      const merchantId = this.extractMerchantId(payload, shop);

      // Queue the webhook for distributed processing
      await this.webhookProcessor.queueWebhook(shop, topic, payload, uniqueWebhookId, merchantId);

      return {
        success: true,
        message: 'Webhook received and queued for processing',
      };
    } catch (error) {
      // Log error but still return 200 to Shopify
      this.logger.error(`Error handling webhook: ${error.message}`, {
        shopDomain: shop,
        topic,
        webhookId,
        errorMessage: error.message,
        errorStack: error.stack,
      });

      return {
        success: false,
        message: 'Webhook received but encountered an error during queueing',
      };
    }
  }

  /**
   * Generate a unique webhook ID if not provided by Shopify
   */
  private generateWebhookId(shop: string, topic: string, body: string): string {
    const hash = crypto
      .createHash('sha256')
      .update(`${shop}:${topic}:${body}:${Date.now()}`)
      .digest('hex');

    return `gen_${hash.substring(0, 20)}`;
  }

  /**
   * Extract merchant ID from the payload if available
   */
  private extractMerchantId(payload: any, shop: string): string | undefined {
    // Try to extract merchant ID from different payload structures

    // From shop payload
    if (payload.shop && payload.shop.id) {
      return payload.shop.id.toString();
    }

    // From order payload
    if (payload.admin_graphql_api_id) {
      const matches = payload.admin_graphql_api_id.match(/gid:\/\/shopify\/\w+\/(\d+)/);
      if (matches && matches[1]) {
        return matches[1];
      }
    }

    // From product payload
    if (payload.id) {
      return `${shop}_${payload.id}`;
    }

    return undefined;
  }
}
