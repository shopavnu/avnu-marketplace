import { Repository } from 'typeorm';
import { ConfigType } from '@nestjs/config';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { shopifyConfig } from '../../../common/config/shopify-config';
import {
  IShopifyBulkOperationService,
  IShopifyClientService,
} from '../../../common/interfaces/shopify-services.interfaces';
import { ShopifyBulkOperation } from '../../../common/types/shopify-models.types';
export declare class ShopifyBulkOperationService implements IShopifyBulkOperationService {
  private readonly merchantPlatformConnectionRepository;
  private readonly config;
  private readonly shopifyClientService;
  private readonly ERROR_CODES;
  private validateEntity;
  private transformEntity;
  private readonly logger;
  constructor(
    merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
    config: ConfigType<typeof shopifyConfig>,
    shopifyClientService: IShopifyClientService,
  );
  private getShopifyConnection;
  startBulkOperation(merchantId: string, query: string): Promise<string>;
  pollBulkOperationStatus(
    merchantId: string,
    bulkOperationId: string,
    maxRetries?: number,
    delayMs?: number,
  ): Promise<ShopifyBulkOperation>;
  processResults<T = Record<string, any>[]>(
    merchantId: string,
    url: string,
    entityType?: string,
    options?: {
      batchSize?: number;
      validateEntities?: boolean;
      transformEntities?: boolean;
    },
  ): Promise<T>;
  cancelBulkOperation(merchantId: string, bulkOperationId: string): Promise<boolean>;
}
