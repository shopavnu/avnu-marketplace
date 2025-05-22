export declare enum IntegrationType {
  SHOPIFY = 'shopify',
  WOOCOMMERCE = 'woocommerce',
}
export declare class IntegrationTypeParamDto {
  type: IntegrationType;
}
export declare class BaseCredentialsDto {
  apiKey: string;
  apiSecret: string;
}
export declare class ShopifyCredentialsDto extends BaseCredentialsDto {
  shopDomain: string;
}
export declare class WooCommerceCredentialsDto extends BaseCredentialsDto {
  storeUrl: string;
}
export declare class AuthenticateRequestDto {
  credentials: ShopifyCredentialsDto | WooCommerceCredentialsDto;
}
export declare class SyncProductsRequestDto {
  credentials: ShopifyCredentialsDto | WooCommerceCredentialsDto;
  merchantId: string;
}
export declare class WebhookRequestDto {
  payload: unknown;
  topic: string;
  merchantId: string;
}
