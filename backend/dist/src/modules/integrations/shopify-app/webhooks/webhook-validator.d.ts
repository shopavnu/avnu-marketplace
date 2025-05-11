import { ConfigType } from '@nestjs/config';
import { shopifyConfig } from '../../../common/config/shopify-config';
export declare class WebhookValidator {
  private readonly config;
  private readonly logger;
  constructor(config: ConfigType<typeof shopifyConfig>);
  verifyWebhookSignature(rawBody: Buffer, headers: Record<string, string>): boolean;
  private getHeader;
  private isValidShopDomain;
  private safeCompare;
  validateHmac(hmac: string, body: string, secret: string): boolean;
}
