/**
 * Interface for platform integration services that handle product operations
 * This interface provides a contract for any service that deals with products
 * on external platforms (like Shopify, WooCommerce, etc.)
 */
export interface ProductIntegrationService {
  /**
   * Get a product from the platform
   * @param productId The platform's product ID
   * @param merchantId The merchant ID in our system
   * @returns The product data from the platform
   */
  getProduct(productId: string, merchantId: string): Promise<any>;

  /**
   * Create a product on the platform
   * @param productData The product data to create
   * @param merchantId The merchant ID in our system
   * @returns The created product data from the platform
   */
  createProduct(productData: unknown, merchantId: string): Promise<any>;

  /**
   * Update a product on the platform
   * @param productId The platform's product ID
   * @param productData The product data to update
   * @param merchantId The merchant ID in our system
   * @returns The updated product data from the platform
   */
  updateProduct(productId: string, productData: unknown, merchantId: string): Promise<any>;

  /**
   * Delete a product from the platform
   * @param productId The platform's product ID
   * @param merchantId The merchant ID in our system
   * @returns Success indicator
   */
  deleteProduct(productId: string, merchantId: string): Promise<boolean>;

  /**
   * Sync products from the platform to our database
   * @param storeIdentifier The store identifier (domain, URL, etc.)
   * @returns Sync result
   */
  syncProducts(storeIdentifier: string): Promise<any>;

  /**
   * Sync orders from the platform to our database
   * @param storeIdentifier The store identifier (domain, URL, etc.)
   * @returns Sync result
   */
  syncOrders(storeIdentifier: string): Promise<any>;
}
