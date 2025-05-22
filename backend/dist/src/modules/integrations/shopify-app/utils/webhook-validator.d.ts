import { ConfigType } from '@nestjs/config';
import { shopifyConfig } from '../config/shopify.config';
export declare class ShopifyWebhookValidator {
  private readonly config;
  private readonly logger;
  constructor(config: ConfigType<typeof shopifyConfig>);
  validateWebhook(hmac: string, body: string): boolean;
  logValidationResult(isValid: boolean, topic: string, shopDomain: string): void;
}
