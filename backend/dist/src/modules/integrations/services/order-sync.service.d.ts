import { IntegrationType } from '../types/integration-type.enum';
import { ShopifyService } from './shopify.service';
import { Repository } from 'typeorm';
import { MerchantPlatformConnection } from '../entities/merchant-platform-connection.entity';
export declare class OrderSyncService {
    private readonly shopifyService;
    private readonly connectionsRepository;
    private readonly logger;
    constructor(shopifyService: ShopifyService, connectionsRepository: Repository<MerchantPlatformConnection>);
    syncOrders(type: IntegrationType, merchantId: string): Promise<{
        created: number;
        updated: number;
        failed: number;
    }>;
    handleOrderWebhook(type: IntegrationType, payload: Record<string, unknown>, topic: string, merchantId: string): Promise<boolean>;
}
