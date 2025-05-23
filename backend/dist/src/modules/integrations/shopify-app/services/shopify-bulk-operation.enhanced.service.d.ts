import { Repository } from 'typeorm';
import { ConfigType } from '@nestjs/config';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { shopifyConfig } from '../../../common/config/shopify-config';
import { IShopifyBulkOperationService, IShopifyClientService } from '../../../common/interfaces/shopify-services.interfaces';
import { ShopifyBulkOperation } from '../../../common/types/shopify-models.types';
import { ShopifyBulkJobService } from './shopify-bulk-job.service';
import { ShopifyBulkOperationJob } from '../entities/shopify-bulk-operation-job.entity';
export interface BulkOperationPaginatedResults<T> {
    data: T[];
    hasNextPage: boolean;
    endCursor?: string;
    totalCount: number;
}
export declare class ShopifyBulkOperationEnhancedService implements IShopifyBulkOperationService {
    private readonly merchantPlatformConnectionRepository;
    private readonly config;
    private readonly shopifyClientService;
    private readonly bulkJobService;
    private readonly ERROR_CODES;
    private readonly entityValidators;
    private readonly entityTransformers;
    private readonly logger;
    constructor(merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>, config: ConfigType<typeof shopifyConfig>, shopifyClientService: IShopifyClientService, bulkJobService: ShopifyBulkJobService);
    private validateProductEntity;
    private validateOrderEntity;
    private validateCustomerEntity;
    private validateFulfillmentEntity;
    private transformProductEntity;
    private transformOrderEntity;
    private transformCustomerEntity;
    private transformFulfillmentEntity;
    private mapFulfillmentStatus;
    private getShopifyConnection;
    processResults<T = Record<string, any>[]>(merchantId: string, url: string, entityType?: string): Promise<T>;
    startBulkOperation(merchantId: string, query: string, description?: string, metadata?: Record<string, any>): Promise<string>;
    getJobStatus(jobId: string): Promise<ShopifyBulkOperationJob>;
    pollBulkOperationStatus(merchantId: string, bulkOperationId: string, maxRetries?: number, delayMs?: number): Promise<ShopifyBulkOperation>;
}
