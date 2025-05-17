import { IntegrationsService } from '../integrations.service';
export declare class MerchantAuthController {
    private readonly integrationsService;
    constructor(integrationsService: IntegrationsService);
    authenticateShopify(body: {
        shopDomain: string;
        accessToken: string;
    }): Promise<{
        success: boolean;
    }>;
    authenticateWooCommerce(body: {
        storeUrl: string;
        consumerKey: string;
        consumerSecret: string;
    }): Promise<{
        success: boolean;
    }>;
}
