import { Repository } from 'typeorm';
import { ConfigType } from '@nestjs/config';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { shopifyConfig } from '../../../common/config/shopify-config';
import {
  IShopifyClientService,
  IShopifyFulfillmentService,
} from '../../../common/interfaces/shopify-services.interfaces';
import {
  ShopifyFulfillment,
  ShopifyFulfillmentHold,
} from '../../../common/types/shopify-models.types';
export declare class ShopifyFulfillmentService implements IShopifyFulfillmentService {
  private readonly merchantPlatformConnectionRepository;
  private readonly config;
  private readonly shopifyClientService;
  static readonly HOLD_REASONS: {
    AWAITING_INVENTORY: string;
    AWAITING_PAYMENT: string;
    AWAITING_RISK_ASSESSMENT: string;
    AWAITING_THIRD_PARTY_FULFILLER: string;
    AWAITING_PROCESSING: string;
    AWAITING_PICKUP: string;
    OTHER: string;
  };
  private readonly logger;
  constructor(
    merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
    config: ConfigType<typeof shopifyConfig>,
    shopifyClientService: IShopifyClientService,
  );
  private getShopifyConnection;
  createFulfillment(
    merchantId: string,
    orderId: string,
    lineItems: {
      id: string;
      quantity: number;
    }[],
    trackingInfo?: {
      number: string;
      company?: string;
      url?: string;
    },
  ): Promise<ShopifyFulfillment>;
  updateFulfillment(
    merchantId: string,
    fulfillmentId: string,
    data: Partial<ShopifyFulfillment>,
  ): Promise<ShopifyFulfillment>;
  cancelFulfillment(merchantId: string, fulfillmentId: string): Promise<void>;
  createFulfillmentHold(
    merchantId: string,
    fulfillmentOrderId: string,
    reason: string,
    reasonNotes?: string,
    releaseDate?: string,
    notifyCustomer?: boolean,
    metadata?: Record<string, any>,
  ): Promise<ShopifyFulfillmentHold>;
  releaseFulfillmentHold(
    merchantId: string,
    fulfillmentOrderId: string,
    holdId: string,
    notes?: string,
    metadata?: Record<string, any>,
  ): Promise<void>;
  getFulfillmentHolds(
    merchantId: string,
    fulfillmentOrderId: string,
    includeReleased?: boolean,
  ): Promise<ShopifyFulfillmentHold[]>;
  registerAsFulfillmentService(
    merchantId: string,
    options?: {
      name?: string;
      callbackPath?: string;
      inventoryManagement?: boolean;
      trackingSupport?: boolean;
      requiresShippingMethod?: boolean;
    },
  ): Promise<any>;
  createMultipleFulfillmentHolds(
    merchantId: string,
    fulfillmentOrderId: string,
    holds: Array<{
      reason: string;
      reasonNotes?: string;
      releaseDate?: string;
    }>,
  ): Promise<ShopifyFulfillmentHold[]>;
  deleteFulfillmentService(merchantId: string, fulfillmentServiceId: string): Promise<boolean>;
  getFulfillmentServices(merchantId: string): Promise<any[]>;
  updateFulfillmentService(
    merchantId: string,
    fulfillmentServiceId: string,
    updateData: {
      name?: string;
      callbackUrl?: string;
      inventoryManagement?: boolean;
      trackingSupport?: boolean;
      requiresShippingMethod?: boolean;
    },
  ): Promise<any>;
}
