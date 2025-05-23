import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../../products/products.service';
export declare class ShopifyService {
    private readonly configService;
    private readonly productsService;
    private readonly logger;
    constructor(configService: ConfigService, productsService: ProductsService);
    authenticate(shopDomain: string, apiKey: string, apiSecret: string, accessToken: string): Promise<boolean>;
    fetchProducts(shopDomain: string, accessToken: string, _merchantId: string, limit?: number, sinceId?: string): Promise<any[]>;
    syncProducts(shopDomain: string, accessToken: string, _merchantId: string): Promise<{
        created: number;
        updated: number;
        failed: number;
    }>;
    private mapShopifyProductToCreateDto;
    private mapShopifyProductToUpdateDto;
    handleWebhook(payload: any, topic: string, merchantId: string): Promise<void>;
    private handleProductCreate;
    private handleProductUpdate;
    private handleProductDelete;
    syncProductsPlaceholder(_merchantId: string): Promise<any>;
    syncOrdersPlaceholder(_merchantId: string): Promise<any>;
    fetchOrders(_merchantId: string, options?: any): Promise<any[]>;
}
