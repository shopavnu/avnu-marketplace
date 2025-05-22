import { OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { ShopifyClientService } from '../services/shopify-client.service';
import { shopifyConfig } from '../../../common/config/shopify-config';
import { WebhookRegistry } from './webhook-registry';
import { WebhookValidator } from './webhook-validator';
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
export declare class ShopifyWebhookRegistryService implements IShopifyWebhookService, OnModuleInit {
  private readonly config;
  private readonly merchantPlatformConnectionRepository;
  private readonly shopifyClientService;
  private readonly webhookRegistry;
  private readonly webhookValidator;
  private readonly productHandler;
  private readonly orderHandler;
  private readonly appUninstalledHandler;
  private readonly logger;
  constructor(
    config: ConfigType<typeof shopifyConfig>,
    merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
    shopifyClientService: ShopifyClientService,
    webhookRegistry: WebhookRegistry,
    webhookValidator: WebhookValidator,
    productHandler: ProductWebhookHandler,
    orderHandler: OrderWebhookHandler,
    appUninstalledHandler: AppUninstalledWebhookHandler,
  );
  onModuleInit(): Promise<void>;
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
  private recordWebhookEvent;
  private recordWebhookFailure;
  private formatTopicFromGraphQL;
}
