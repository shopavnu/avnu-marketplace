import { Repository } from 'typeorm';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { IShopifyClientService } from '../../../common/interfaces/shopify-services.interfaces';
import { ShopifyBulkJobService } from './shopify-bulk-job.service';
import { ShopifyBulkOperationJob } from '../entities/shopify-bulk-operation-job.entity';
import { BulkOperationPaginatedResults } from './shopify-bulk-operation.enhanced.service';
export declare class ShopifyBulkOperationEnhancedServicePart2 {
  private readonly shopifyClientService;
  private readonly merchantConnectionRepository;
  private readonly bulkJobService;
  constructor(
    shopifyClientService: IShopifyClientService,
    merchantConnectionRepository: Repository<MerchantPlatformConnection>,
    bulkJobService: ShopifyBulkJobService,
  );
  private readonly logger;
  private entityValidators;
  private entityTransformers;
  getShopifyConnection(merchantId: string): Promise<{
    platformStoreName: string;
    accessToken: string;
  }>;
  processResultsWithPagination<T>(
    jobId: string,
    options?: {
      entityType?: string;
      validateEntities?: boolean;
      transformEntities?: boolean;
      filters?: Record<string, any>;
    },
    cursor?: string,
    limit?: number,
  ): Promise<BulkOperationPaginatedResults<T>>;
  processAllResults<T>(
    jobId: string,
    options?: {
      entityType?: string;
      validateEntities?: boolean;
      transformEntities?: boolean;
      batchSize?: number;
    },
  ): Promise<T[]>;
  retryJob(jobId: string): Promise<ShopifyBulkOperationJob>;
  cancelJob(jobId: string): Promise<ShopifyBulkOperationJob>;
  cancelBulkOperation(merchantId: string, bulkOperationId: string): Promise<boolean>;
}
