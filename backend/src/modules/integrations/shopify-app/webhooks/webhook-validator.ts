import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as crypto from 'crypto';
import { shopifyConfig } from '../../../common/config/shopify-config';

/**
 * WebhookValidator - Responsible for validating Shopify webhooks
 *
 * This class implements proper HMAC verification for Shopify webhooks
 * using timing-safe comparison to prevent timing attacks.
 */
@Injectable()
export class WebhookValidator {
  private readonly logger = new Logger(WebhookValidator.name);

  constructor(
    @Inject(shopifyConfig.KEY)
    private readonly config: ConfigType<typeof shopifyConfig>,
  ) {}

  /**
   * Verify that a webhook request is authentic using HMAC validation
   *
   * @param rawBody Raw request body as a Buffer
   * @param headers Request headers including Shopify-HMAC-SHA256
   * @returns boolean indicating if the webhook is authentic
   */
  verifyWebhookSignature(rawBody: Buffer, headers: Record<string, string>): boolean {
    try {
      // Get the HMAC header from the request (case-insensitive check)
      const hmacHeader =
        this.getHeader(headers, 'X-Shopify-Hmac-Sha256') ||
        this.getHeader(headers, 'Shopify-Hmac-Sha256');

      if (!hmacHeader) {
        this.logger.warn('Missing HMAC signature in webhook headers');
        return false;
      }

      // Get the shop domain for additional validation
      const shopDomain =
        this.getHeader(headers, 'X-Shopify-Shop-Domain') ||
        this.getHeader(headers, 'Shopify-Shop-Domain');

      if (!shopDomain || !this.isValidShopDomain(shopDomain)) {
        this.logger.warn(`Invalid shop domain in webhook headers: ${shopDomain}`);
        return false;
      }

      // Get the timestamp for freshness validation
      const timestamp =
        this.getHeader(headers, 'X-Shopify-Hmac-Timestamp') ||
        this.getHeader(headers, 'Shopify-Hmac-Timestamp');

      if (timestamp) {
        // Optional: check if webhook is fresh (within last 5 minutes)
        const webhookTime = new Date(timestamp);
        const currentTime = new Date();
        const fiveMinutesAgo = new Date(currentTime.getTime() - 5 * 60 * 1000);

        if (webhookTime < fiveMinutesAgo) {
          this.logger.warn('Webhook timestamp is too old, possible replay attack');
          return false;
        }
      }

      // Get the webhook secret from environment or config
      const webhookSecret =
        process.env.SHOPIFY_WEBHOOK_SECRET ||
        process.env.SHOPIFY_API_SECRET || // Fall back to API secret
        '';

      if (!webhookSecret) {
        this.logger.error('Webhook secret is not configured!');
        return false;
      }

      const calculatedHmac = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('base64');

      // Use timing-safe comparison
      return this.safeCompare(calculatedHmac, hmacHeader);
    } catch (error) {
      this.logger.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Helper to get header value case-insensitively
   */
  private getHeader(headers: Record<string, string>, key: string): string | undefined {
    const lowerCaseKey = key.toLowerCase();

    for (const [headerKey, headerValue] of Object.entries(headers)) {
      if (headerKey.toLowerCase() === lowerCaseKey) {
        return headerValue;
      }
    }

    return undefined;
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

      try {
        return crypto.timingSafeEqual(aPadded, bPadded);
      } catch (error) {
        this.logger.error('Error in timing-safe comparison:', error);
        // Last resort, not timing-safe but better than nothing
        return a === b;
      }
    }
  }

  /**
   * Validate an HMAC signature against a message body
   *
   * Used by the webhook controller to validate incoming webhooks
   *
   * @param hmac HMAC signature from Shopify
   * @param body Message body as string
   * @param secret Webhook secret key
   * @returns boolean indicating if the HMAC is valid
   */
  validateHmac(hmac: string, body: string, secret: string): boolean {
    try {
      if (!hmac || !body || !secret) {
        return false;
      }

      // Calculate the HMAC digest of the request body
      const calculatedHmac = crypto.createHmac('sha256', secret).update(body).digest('base64');

      // Use timing-safe comparison
      return this.safeCompare(calculatedHmac, hmac);
    } catch (error) {
      this.logger.error(`Error validating HMAC: ${error.message}`);
      return false;
    }
  }
}
