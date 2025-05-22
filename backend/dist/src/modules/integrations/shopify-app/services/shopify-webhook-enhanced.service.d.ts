import { ConfigType } from '@nestjs/config';
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
export declare class ShopifyWebhookEnhancedService implements IShopifyWebhookService {
  private readonly config;
  private readonly merchantPlatformConnectionRepository;
  private readonly shopifyClientService;
  private readonly shopifyAuthService;
  private readonly logger;
  constructor(
    config: ConfigType<typeof shopifyConfig>,
    merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
    shopifyClientService: ShopifyClientService,
    shopifyAuthService: ShopifyAuthEnhancedService,
  );
  registerWebhook(
    shop: string,
    accessToken: string,
    topic: ShopifyWebhookTopic,
    address: string,
  ): Promise<ShopifyWebhookSubscription>;
  registerAllWebhooks(shop: string, accessToken: string): Promise<ShopifyWebhookSubscription[]>;
  getWebhooks(shop: string, accessToken: string): Promise<ShopifyWebhookSubscription[]>;
  verifyWebhookSignature(rawBody: Buffer, headers: Record<string, string>): boolean;
  processWebhook(topic: ShopifyWebhookTopic, shop: string, payload: any): Promise<void>;
  private handleAppUninstalled;
  private handleProductWebhook;
  private handleOrderWebhook;
  private handleCustomerWebhook;
  private handleCustomerTagsWebhook;
  private handleFulfillmentWebhook;
  private handleCustomerMarketingConsentWebhook;
  private handleFulfillmentHoldWebhook;
  private handleBulkOperationWebhook;
  private recordFulfillmentEvent;
  private recordWebhookEvent;
  private recordWebhookFailure;
  private handleInventoryWebhook;
  private formatTopicFromGraphQL;
  private getMerchantIdByShop;
  private isValidShopDomain;
  private safeCompare;
}
