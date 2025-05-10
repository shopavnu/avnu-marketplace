import { Repository } from 'typeorm';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
export declare class ShopifyWebhookService {
    private readonly merchantPlatformConnectionRepository;
    private readonly logger;
    private readonly apiSecret;
    constructor(merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>);
    verifyWebhook(hmac: string, body: string): Promise<boolean>;
    private getConnectionByShopDomain;
    handleWebhook(topic: string, shop: string, data: unknown): Promise<void>;
    private handleProductCreate;
    private handleProductUpdate;
    private handleProductDelete;
    private handleOrderCreate;
    private handleOrderUpdate;
    private handleOrderCancel;
    private handleAppUninstalled;
}
