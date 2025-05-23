import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { shopifyConfig } from '../../../common/config/shopify-config';
import { IShopifyProductService, IShopifyClientService } from '../../../common/interfaces/shopify-services.interfaces';
import { ShopifyProduct } from '../../../common/types/shopify-models.types';
export declare class ShopifyProductService implements IShopifyProductService {
    private readonly config;
    private readonly merchantPlatformConnectionRepository;
    private readonly shopifyClientService;
    private readonly logger;
    constructor(config: ConfigType<typeof shopifyConfig>, merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>, shopifyClientService: IShopifyClientService);
    getProduct(merchantId: string, productId: string): Promise<ShopifyProduct>;
    getProducts(merchantId: string, limit?: number, cursor?: string): Promise<{
        products: ShopifyProduct[];
        hasNextPage: boolean;
        endCursor: string;
    }>;
    createProduct(merchantId: string, productData: Partial<ShopifyProduct>): Promise<ShopifyProduct>;
    updateProduct(merchantId: string, productId: string, productData: Partial<ShopifyProduct>): Promise<ShopifyProduct>;
    deleteProduct(merchantId: string, productId: string): Promise<void>;
    syncProductFromShopify(merchantId: string, shopifyProductId: string): Promise<any>;
    syncProductToShopify(_merchantId: string, _localProductId: string): Promise<any>;
    private transformShopifyGraphQLProduct;
    private extractLocalizedFields;
    private extractAllLocalizedFields;
    private prepareProductInput;
    private ensureGlobalId;
    private extractIdFromGid;
    private getMerchantShopifyConnection;
}
