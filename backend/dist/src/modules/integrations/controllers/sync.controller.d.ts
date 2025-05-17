import { IntegrationsService } from '../integrations.service';
import { OrderSyncService } from '../services/order-sync.service';
export declare class SyncController {
    private readonly integrationsService;
    private readonly orderSyncService;
    constructor(integrationsService: IntegrationsService, orderSyncService: OrderSyncService);
    syncShopifyProducts(req: {
        user: {
            merchantId: string;
        };
    }): Promise<{
        added: number;
        updated: number;
        failed: number;
        errors?: string[];
    }>;
    syncShopifyOrders(req: {
        user: {
            merchantId: string;
        };
    }): Promise<{
        created: number;
        updated: number;
        failed: number;
    }>;
    handleShopifyWebhook(payload: Record<string, unknown>, req: {
        headers: Record<string, string>;
    }): Promise<{
        success: boolean;
    }>;
}
