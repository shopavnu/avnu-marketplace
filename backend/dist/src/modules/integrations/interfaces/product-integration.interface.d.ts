export interface ProductIntegrationService {
    getProduct(productId: string, merchantId: string): Promise<any>;
    createProduct(productData: unknown, merchantId: string): Promise<any>;
    updateProduct(productId: string, productData: unknown, merchantId: string): Promise<any>;
    deleteProduct(productId: string, merchantId: string): Promise<boolean>;
    syncProducts(storeIdentifier: string): Promise<any>;
    syncOrders(storeIdentifier: string): Promise<any>;
}
