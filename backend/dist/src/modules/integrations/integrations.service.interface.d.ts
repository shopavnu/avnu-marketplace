import { IntegrationType } from './types/integration-type.enum';
export interface IntegrationCredentials {
    shopify?: ShopifyCredentials;
    woocommerce?: WooCommerceCredentials;
}
export interface ShopifyCredentials {
    shopDomain: string;
    apiKey: string;
    apiSecret: string;
    accessToken: string;
}
export interface WooCommerceCredentials {
    storeUrl: string;
    consumerKey: string;
    consumerSecret: string;
    version?: string;
}
export interface SyncResult {
    created: number;
    updated: number;
    failed: number;
    errors?: string[];
}
export interface IntegrationsService {
    authenticate(type: IntegrationType, credentials: IntegrationCredentials): Promise<boolean>;
    syncProducts(type: IntegrationType, credentials: IntegrationCredentials, merchantId: string): Promise<SyncResult>;
    handleWebhook(type: IntegrationType, payload: Record<string, unknown>, topic: string, merchantId: string): Promise<boolean>;
}
