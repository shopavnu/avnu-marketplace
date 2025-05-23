import { Repository } from 'typeorm';
import { ConfigType } from '@nestjs/config';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { PlatformProductDto, ProductIntegrationService, SyncResult } from '../../../shared';
import { IShopifyClientService } from '../../../common/interfaces/shopify-services.interfaces';
import { shopifyConfig } from '../../../common/config/shopify-config';
export declare class ShopifyAppService implements ProductIntegrationService {
    private readonly merchantPlatformConnectionRepository;
    private readonly shopifyClientService;
    private readonly config;
    processIncomingProduct(platformProduct: unknown): any;
    prepareOutgoingProduct(productData: unknown): any;
    syncOrders(storeIdentifier: string): Promise<SyncResult>;
    private readonly logger;
    constructor(merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>, shopifyClientService: IShopifyClientService, config: ConfigType<typeof shopifyConfig>);
    getShopifyConnection(merchantId: string): Promise<{
        shop: string;
        accessToken: string;
    }>;
    getProduct(productId: string, merchantId: string): Promise<PlatformProductDto>;
    getProducts(merchantId: string, limit?: number, cursor?: string): Promise<{
        products: PlatformProductDto[];
        hasNextPage: boolean;
        endCursor: string;
    }>;
    createProduct(data: PlatformProductDto, merchantId: string): Promise<PlatformProductDto>;
    updateProduct(productId: string, data: Partial<PlatformProductDto>, merchantId: string): Promise<PlatformProductDto>;
    deleteProduct(productId: string, merchantId: string): Promise<boolean>;
    syncProducts(merchantId: string): Promise<SyncResult>;
    private getProductStatus;
    private createProductVariants;
    private updateProductInventory;
    private uploadProductImages;
    private getProductImages;
    private updateProductImages;
}
