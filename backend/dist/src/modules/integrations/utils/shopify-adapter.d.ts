export declare class ShopifyAdapter {
    private static readonly logger;
    static fromShopifyProduct(shopifyProduct: unknown, merchantId: string): unknown;
    static toShopifyProduct(product: unknown): unknown;
    static fromShopifyOrder(shopifyOrder: unknown, merchantId: string): unknown;
}
