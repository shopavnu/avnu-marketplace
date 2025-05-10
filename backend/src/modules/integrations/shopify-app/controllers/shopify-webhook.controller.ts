import {
  Controller,
  Post,
  Headers,
  Body,
  Logger,
  BadRequestException,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { Request } from 'express';
import { ShopifyWebhookService } from '../services/shopify-webhook.service';
import { ShopifyWebhookValidator } from '../utils/webhook-validator';

@ApiTags('shopify-webhooks')
@Controller('integrations/shopify/webhook')
export class ShopifyWebhookController {
  private readonly logger = new Logger(ShopifyWebhookController.name);

  constructor(
    private readonly shopifyWebhookService: ShopifyWebhookService,
    private readonly webhookValidator: ShopifyWebhookValidator,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Handle Shopify webhook requests' })
  @ApiHeader({ name: 'X-Shopify-Topic', description: 'Webhook topic' })
  @ApiHeader({ name: 'X-Shopify-Hmac-Sha256', description: 'HMAC signature for verification' })
  @ApiHeader({ name: 'X-Shopify-Shop-Domain', description: 'Shopify shop domain' })
  async handleWebhook(
    @Headers('x-shopify-topic') topic: string,
    @Headers('x-shopify-hmac-sha256') hmac: string,
    @Headers('x-shopify-shop-domain') shop: string,
    @Req() request: RawBodyRequest<Request>,
    @Body() data: unknown,
  ): Promise<{ success: boolean }> {
    try {
      this.logger.log(`Received Shopify webhook: ${topic} from ${shop}`);

      // Get the raw body for HMAC verification
      const rawBody = request.rawBody?.toString() || JSON.stringify(data);

      // Verify the webhook signature using our enhanced validator
      const isValid = this.webhookValidator.validateWebhook(hmac, rawBody);

      // Log the validation result
      this.webhookValidator.logValidationResult(isValid, topic, shop);

      if (!isValid) {
        this.logger.warn(`Invalid webhook signature from ${shop}`);
        throw new BadRequestException('Invalid webhook signature');
      }

      // Process the webhook
      await this.shopifyWebhookService.handleWebhook(topic, shop, data);

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error handling webhook: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Return 200 status even for errors to prevent Shopify from retrying
      // We will log the error but tell Shopify we processed it
      return { success: false };
    }
  }
}
