import { Repository } from 'typeorm';
import { MerchantPlatformConnection } from '../entities/merchant-platform-connection.entity';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';
import { SyncResult } from '../../shared';
import { ShopifyService } from './shopify.service';
export declare class ShopifySyncService {
    private readonly merchantPlatformConnectionRepository;
    private readonly productRepository;
    private readonly orderRepository;
    private readonly shopifyService;
    private readonly logger;
    constructor(merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>, productRepository: Repository<Product>, orderRepository: Repository<Order>, shopifyService: ShopifyService);
    mapOrderStatus(status: string): string;
    fetchProducts(connection: MerchantPlatformConnection): Promise<any[]>;
    fetchOrders(connection: MerchantPlatformConnection): Promise<any[]>;
    syncProducts(connection: MerchantPlatformConnection): Promise<SyncResult>;
    syncOrders(connection: MerchantPlatformConnection): Promise<SyncResult>;
    handleWebhook(event: string, data: Record<string, unknown>, merchantId?: string): Promise<boolean>;
    private handleProductWebhook;
    private handleOrderWebhook;
}
