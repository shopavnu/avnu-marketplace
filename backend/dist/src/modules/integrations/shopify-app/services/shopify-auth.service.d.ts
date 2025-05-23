import { Repository } from 'typeorm';
import { ConfigType } from '@nestjs/config';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { shopifyConfig } from '../../../common/config/shopify-config';
export declare class ShopifyAuthService {
    private readonly merchantPlatformConnectionRepository;
    private readonly config;
    private readonly logger;
    constructor(merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>, config: ConfigType<typeof shopifyConfig>);
    private generateNonce;
    getAuthUrl(shop: string): Promise<string>;
    handleCallback(shop: string, code: string, state: string): Promise<boolean>;
    private exchangeCodeForToken;
    private saveShopifyConnection;
}
