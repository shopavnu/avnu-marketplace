import { ShopifyClientService } from './shopify-client.service';
export declare class ShopifyClientExtensions {
  private readonly shopifyClientService;
  constructor(shopifyClientService: ShopifyClientService);
  isShopifyReachable(): Promise<boolean>;
}
