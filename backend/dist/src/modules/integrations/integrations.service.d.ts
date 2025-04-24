import { ShopifyService } from './services/shopify.service';
import { WooCommerceService } from './services/woocommerce.service';
export type IntegrationType = 'shopify' | 'woocommerce';
export interface IntegrationCredentials {
    shopify?: {
        shopDomain: string;
        apiKey: string;
        apiSecret: string;
        accessToken: string;
    };
    woocommerce?: {
        storeUrl: string;
        consumerKey: string;
        consumerSecret: string;
    };
}
export declare class IntegrationsService {
    private readonly shopifyService;
    private readonly wooCommerceService;
    private readonly logger;
    constructor(shopifyService: ShopifyService, wooCommerceService: WooCommerceService);
    authenticate(type: IntegrationType, credentials: IntegrationCredentials): Promise<boolean>;
    syncProducts(type: IntegrationType, credentials: IntegrationCredentials, merchantId: string): Promise<{
        created: number;
        updated: number;
        failed: number;
    }>;
    handleWebhook(type: IntegrationType, payload: any, topic: string, merchantId: string): Promise<void>;
}
