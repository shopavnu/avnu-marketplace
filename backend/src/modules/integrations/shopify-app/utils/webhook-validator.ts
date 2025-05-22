import * as crypto from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { shopifyConfig } from '../config/shopify.config';

/**
 * Validates Shopify webhook requests to ensure they are genuine
 * Based on Shopify's documentation: https://shopify.dev/docs/apps/webhooks/configuration/https#step-5-verify-the-webhook
 */
@Injectable()
export class ShopifyWebhookValidator {
  private readonly logger = new Logger(ShopifyWebhookValidator.name);

  constructor(
    @Inject(shopifyConfig.KEY)
    private readonly config: ConfigType<typeof shopifyConfig>,
  ) {}

  /**
   * Validates a webhook request from Shopify
   *
   * @param hmac HMAC header from the request
   * @param body Raw request body as a string
   * @returns Boolean indicating if the webhook is valid
   */
  public validateWebhook(hmac: string, body: string): boolean {
    if (!hmac || !body) {
      this.logger.warn('Missing HMAC or request body');
      return false;
    }

    try {
      const generatedHash = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(body, 'utf8')
        .digest('base64');

      // Compare the generated hash with the HMAC from the request
      return crypto.timingSafeEqual(Buffer.from(generatedHash), Buffer.from(hmac));
    } catch (error) {
      this.logger.error(
        `Webhook validation error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * Convenience method for logging webhook validation results
   *
   * @param isValid Result of validation
   * @param topic Webhook topic
   * @param shopDomain Shopify shop domain
   */
  public logValidationResult(isValid: boolean, topic: string, shopDomain: string): void {
    if (isValid) {
      this.logger.log(`Valid webhook received for topic ${topic} from shop ${shopDomain}`);
    } else {
      this.logger.warn(
        `Invalid webhook attempt for topic ${topic} claiming to be from ${shopDomain}`,
      );
    }
  }
}
