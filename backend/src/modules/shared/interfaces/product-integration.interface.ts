import { PlatformType } from '../enums/platform-type.enum';

/**
 * Data transfer object for platform products
 * Used for consistent representation of products across different platforms
 */
export interface PlatformProductDto {
  id?: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  quantity?: number;
  images?: string[];
  platformType: PlatformType;
  categories?: string[];
  tags?: string[];
  variants?: PlatformProductVariantDto[];
  attributes?: Record<string, string>;
  // Additional metadata that might be platform-specific
  metadata?: Record<string, unknown>;
}

/**
 * Data transfer object for product variants
 */
export interface PlatformProductVariantDto {
  id?: string;
  sku?: string;
  price?: number;
  quantity?: number;
  attributes?: Record<string, string>;
}

/**
 * Sync operation result interface
 */
export interface SyncResult {
  /**
   * Number of records created
   */
  created: number;

  /**
   * Number of records updated
   */
  updated: number;

  /**
   * Number of records that failed to sync
   */
  failed: number;

  /**
   * Total number of records processed
   * If not provided, it will be calculated as created + updated + failed
   */
  total?: number;

  /**
   * Alternative name for total
   * @deprecated Use total instead
   */
  totalProcessed?: number;

  /**
   * Optional success indicator
   * @deprecated Determined by failed count instead
   */
  success?: boolean;

  /**
   * Array of error messages if any occurred during sync
   */
  errors?: string[];

  /**
   * Optional errors by platform
   */
  platformErrors?: Record<string, string>;

  /**
   * Optional skipped records
   */
  skipped?: number;

  /**
   * Optional deleted records
   */
  deleted?: number;

  /**
   * Optional timestamp of the sync operation
   */
  timestamp?: Date;
}

/**
 * Interface for platform integration services that handle product operations
 *
 * This interface provides a contract for any service that deals with products
 * on external platforms (like Shopify, WooCommerce, etc.)
 *
 * The key benefits of this interface-based approach are:
 * 1. Decoupling: Services implementing this interface can be developed independently
 * 2. Preventing circular dependencies: By referencing this shared interface rather than concrete implementations
 * 3. Testability: Mock implementations can easily be created for testing
 * 4. Consistency: All platform integrations follow the same contract
 *
 * Each platform-specific service (e.g., ShopifyAppService, WooCommerceService) should implement this interface
 * and be registered in its respective module. The PlatformIntegrationService can then use these implementations
 * via dependency injection.
 */
export interface ProductIntegrationService {
  /**
   * Get a product from the platform
   * @param productId The platform's product ID
   * @param merchantId The merchant ID in our system
   * @returns The product data from the platform
   */
  getProduct(productId: string, merchantId: string): Promise<PlatformProductDto>;

  /**
   * Create a product on the platform
   * @param product The product data to create in our standardized format
   * @param merchantId The merchant ID in our system
   * @returns The created product data from the platform
   */
  createProduct(product: PlatformProductDto, merchantId: string): Promise<PlatformProductDto>;

  /**
   * Update a product on the platform
   * @param productId The platform's product ID
   * @param productUpdate Partial product data to update
   * @param merchantId The merchant ID in our system
   * @returns The updated product data from the platform
   */
  updateProduct(
    productId: string,
    productUpdate: Partial<PlatformProductDto>,
    merchantId: string,
  ): Promise<PlatformProductDto>;

  /**
   * Delete a product from the platform
   * @param productId The platform's product ID
   * @param merchantId The merchant ID in our system
   * @returns Success indicator (true if deleted successfully)
   */
  deleteProduct(productId: string, merchantId: string): Promise<boolean>;

  /**
   * Sync products from the platform to our database
   * @param merchantId The merchant ID in our system
   * @returns Sync result with counts of created, updated, failed, and total products
   */
  syncProducts(merchantId: string): Promise<SyncResult>;

  /**
   * Sync orders from the platform to our database
   * @param merchantId The merchant ID in our system
   * @returns Sync result with counts of created, updated, failed, and total orders
   */
  syncOrders(merchantId: string): Promise<SyncResult>;

  /**
   * Process an incoming product from an external platform
   * @param product The raw product data from the external platform
   * @param platformType The platform type (Shopify, WooCommerce, etc.)
   * @param merchantId Our internal merchant ID
   * @returns The product data converted to our standardized format
   */
  processIncomingProduct(
    product: Record<string, unknown>,
    platformType: PlatformType,
    merchantId: string,
  ): PlatformProductDto;

  /**
   * Prepare an outgoing product for an external platform
   * @param product The product data in our internal format
   * @param platformType The platform type (Shopify, WooCommerce, etc.)
   * @returns The product data formatted for the target platform
   */
  prepareOutgoingProduct(
    product: PlatformProductDto,
    platformType: PlatformType,
  ): Record<string, unknown>;
}
