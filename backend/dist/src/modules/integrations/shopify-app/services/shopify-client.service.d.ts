import { ConfigType } from '@nestjs/config';
import { IShopifyClientService } from '../../../common/interfaces/shopify-services.interfaces';
import { shopifyConfig } from '../../../common/config/shopify-config';
export declare class ShopifyClientService implements IShopifyClientService {
    private readonly config;
    private readonly logger;
    private restClient;
    constructor(config: ConfigType<typeof shopifyConfig>);
    query<T>(shop: string, accessToken: string, query: string, variables?: Record<string, any>): Promise<T>;
    request<T>(shop: string, accessToken: string, endpoint: string, method?: string, data?: any): Promise<T>;
    getShopInfo(shop: string, accessToken: string): Promise<any>;
    private extractUserErrors;
    private handleGraphQLErrors;
    private handleUserErrors;
    private handleApiError;
    private maskShopDomain;
}
