import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../../products/products.service';
export declare class WooCommerceService {
  private readonly configService;
  private readonly productsService;
  private readonly logger;
  constructor(configService: ConfigService, productsService: ProductsService);
  private createOAuth;
  authenticate(storeUrl: string, consumerKey: string, consumerSecret: string): Promise<boolean>;
  fetchProducts(
    storeUrl: string,
    consumerKey: string,
    consumerSecret: string,
    merchantId: string,
    page?: number,
    perPage?: number,
  ): Promise<any[]>;
  syncProducts(
    storeUrl: string,
    consumerKey: string,
    consumerSecret: string,
    merchantId: string,
  ): Promise<{
    created: number;
    updated: number;
    failed: number;
  }>;
  private mapWooProductToCreateDto;
  private mapWooProductToUpdateDto;
  private extractBrandFromAttributes;
  private extractValuesFromAttributes;
  handleWebhook(payload: any, topic: string, merchantId: string): Promise<void>;
  private handleProductCreate;
  private handleProductUpdate;
  private handleProductDelete;
  syncProductsPlaceholder(_merchantId: string): Promise<any>;
  syncOrdersPlaceholder(_merchantId: string): Promise<any>;
}
