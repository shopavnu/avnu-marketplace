import { EventEmitter2 } from '@nestjs/event-emitter';
import { ShopifyAppService } from '../shopify-app/services/shopify-app.service';
import { ProductIntegrationService, SyncResult, PlatformType, PlatformProductDto } from '../../shared';
import { ShopifyProduct } from '../interfaces/shopify.interface';
export declare class ShopifyIntegrationService implements ProductIntegrationService {
    private readonly eventEmitter;
    private readonly shopifyService;
    private readonly logger;
    constructor(eventEmitter: EventEmitter2, shopifyService: ShopifyAppService);
    processIncomingProduct(product: ShopifyProduct, platformType: PlatformType, merchantId: string): PlatformProductDto;
    prepareOutgoingProduct(product: PlatformProductDto, platformType: PlatformType): ShopifyProduct;
    getProduct(productId: string, merchantId: string): Promise<PlatformProductDto>;
    createProduct(productData: PlatformProductDto, merchantId: string): Promise<PlatformProductDto>;
    updateProduct(productId: string, productData: Partial<PlatformProductDto>, merchantId: string): Promise<PlatformProductDto>;
    deleteProduct(productId: string, merchantId: string): Promise<boolean>;
    syncProducts(merchantId: string): Promise<SyncResult>;
    syncOrders(merchantId: string): Promise<SyncResult>;
    handleWebhook(event: string, data: Record<string, unknown>, merchantId: string): Promise<boolean>;
    private handleProductWebhook;
    private handleOrderWebhook;
}
