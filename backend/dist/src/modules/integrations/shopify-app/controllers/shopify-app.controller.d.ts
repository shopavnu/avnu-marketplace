import { ShopifyAuthService } from '../services/shopify-auth.service';
import { ShopifyAppService } from '../services/shopify-app.service';
import { ShopifyWebhookService } from '../services/shopify-webhook.service';
import { Request, Response } from 'express';
export declare class ShopifyAppController {
    private readonly shopifyAuthService;
    private readonly shopifyAppService;
    private readonly shopifyWebhookService;
    private readonly logger;
    constructor(shopifyAuthService: ShopifyAuthService, shopifyAppService: ShopifyAppService, shopifyWebhookService: ShopifyWebhookService);
    auth(shop: string, response: Response): Promise<void>;
    callback(shop: string, code: string, state: string, response: Response): Promise<void>;
    handleWebhook(topic: string, shop: string, hmac: string, request: Request, response: Response): Promise<void>;
    syncProducts(shop: string, response: Response): Promise<void>;
    syncOrders(shop: string, response: Response): Promise<void>;
}
