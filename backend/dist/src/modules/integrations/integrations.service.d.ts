import { ShopifyService } from './services/shopify.service';
import { IntegrationType } from './types/integration-type.enum';
export interface IntegrationCredentials {
    shopify?: {
        shopDomain: string;
        apiKey: string;
        apiSecret: string;
        accessToken: string;
    };
    shopDomain?: string;
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
}
export interface SyncResult {
    added: number;
    updated: number;
    failed: number;
    errors?: string[];
}
export declare class IntegrationsService {
    private readonly shopifyService;
    private readonly logger;
    constructor(shopifyService: ShopifyService);
    authenticate(type: IntegrationType, credentials: IntegrationCredentials): Promise<boolean>;
    syncProducts(type: IntegrationType, credentials: IntegrationCredentials, merchantId: string): Promise<SyncResult>;
    handleWebhook(type: IntegrationType, payload: Record<string, unknown>, topic: string, merchantId: string): Promise<boolean>;
}
