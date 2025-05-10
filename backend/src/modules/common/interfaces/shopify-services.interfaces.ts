/**
 * Service interfaces for the Shopify integration
 * These interfaces define the contracts between different modules to avoid circular dependencies
 */

import {
  ShopifyProduct,
  ShopifyOrder,
  ShopifyCustomer,
  ShopifyWebhookSubscription,
  ShopifyWebhookTopic,
  ShopifyFulfillment,
  ShopifyBulkOperation,
  ShopifyLocalizedField,
  ShopifyFulfillmentHold,
} from '../types/shopify-models.types';

/**
 * Shopify GraphQL Error
 */
export interface ShopifyGraphQLError {
  message: string;
  path?: string[];
  extensions?: Record<string, any>;
}

/**
 * Shopify User Error
 */
export interface ShopifyUserError {
  message: string;
  field?: string[];
  code?: string;
}

/**
 * Interface for Shopify client service that handles API communication
 */
export interface IShopifyClientService {
  /**
   * Execute a GraphQL query against the Shopify Admin API
   */
  query<T>(
    shop: string,
    accessToken: string,
    query: string,
    variables?: Record<string, any>,
  ): Promise<T>;

  /**
   * Make a REST API request to the Shopify Admin API
   */
  request<T>(
    shop: string,
    accessToken: string,
    endpoint: string,
    method?: string,
    data?: any,
  ): Promise<T>;

  /**
   * Get the shop information
   */
  getShopInfo(shop: string, accessToken: string): Promise<any>;
}

/**
 * Interface for Shopify authentication service
 */
export interface IShopifyAuthService {
  /**
   * Generate the OAuth authorization URL
   */
  generateAuthUrl(shop: string): string;

  /**
   * Handle OAuth callback and exchange code for access token
   */
  handleCallback(shop: string, code: string, state: string): Promise<string>;

  /**
   * Verify the authenticity of a session token
   */
  verifySessionToken(token: string): Promise<any>;

  /**
   * Store an access token securely
   */
  storeAccessToken(shop: string, accessToken: string, merchantId: string): Promise<void>;

  /**
   * Retrieve an access token for a merchant
   */
  getAccessToken(merchantId: string): Promise<{ shop: string; accessToken: string }>;

  /**
   * Handle app uninstallation
   */
  handleUninstall(shop: string): Promise<void>;
}

/**
 * Interface for webhook service
 */
export interface IShopifyWebhookService {
  /**
   * Register a webhook subscription
   */
  registerWebhook(
    shop: string,
    accessToken: string,
    topic: ShopifyWebhookTopic,
    address: string,
  ): Promise<ShopifyWebhookSubscription>;

  /**
   * Register all required webhooks for a shop
   */
  registerAllWebhooks(shop: string, accessToken: string): Promise<ShopifyWebhookSubscription[]>;

  /**
   * Get all webhook subscriptions for a shop
   */
  getWebhooks(shop: string, accessToken: string): Promise<ShopifyWebhookSubscription[]>;

  /**
   * Verify the authenticity of a webhook request
   * @param rawBody The raw request body buffer
   * @param hmacHeader The HMAC header or complete headers object
   */
  verifyWebhookSignature(rawBody: Buffer, hmacHeader: string | Record<string, string>): boolean;

  /**
   * Process a webhook payload
   */
  processWebhook(topic: ShopifyWebhookTopic, shop: string, payload: any): Promise<void>;
}

/**
 * Interface for product service
 */
export interface IShopifyProductService {
  /**
   * Get a product by ID
   */
  getProduct(merchantId: string, productId: string): Promise<ShopifyProduct>;

  /**
   * Get products with pagination
   */
  getProducts(
    merchantId: string,
    limit?: number,
    cursor?: string,
  ): Promise<{ products: ShopifyProduct[]; hasNextPage: boolean; endCursor: string }>;

  /**
   * Create a product
   */
  createProduct(merchantId: string, productData: Partial<ShopifyProduct>): Promise<ShopifyProduct>;

  /**
   * Update a product
   */
  updateProduct(
    merchantId: string,
    productId: string,
    productData: Partial<ShopifyProduct>,
  ): Promise<ShopifyProduct>;

  /**
   * Delete a product
   */
  deleteProduct(merchantId: string, productId: string): Promise<void>;

  /**
   * Sync a product from Shopify to the local database
   */
  syncProductFromShopify(merchantId: string, shopifyProductId: string): Promise<any>;

  /**
   * Sync a product from the local database to Shopify
   */
  syncProductToShopify(merchantId: string, localProductId: string): Promise<any>;
}

/**
 * Interface for bulk operations service
 */
export interface IShopifyBulkOperationService {
  /**
   * Start a bulk operation
   */
  startBulkOperation(merchantId: string, query: string): Promise<string>;

  /**
   * Poll for the status of a bulk operation
   */
  pollBulkOperationStatus(
    merchantId: string,
    bulkOperationId: string,
  ): Promise<ShopifyBulkOperation>;

  /**
   * Download and process the results of a bulk operation
   * @param merchantId The merchant ID
   * @param url The URL to download the results from
   * @param entityType Optional entity type to parse results into specific model types
   * @returns Parsed results from the bulk operation
   */
  processResults<T = Record<string, any>[]>(
    merchantId: string,
    url: string,
    entityType?: string,
  ): Promise<T>;

  /**
   * Cancel a running bulk operation
   * @param merchantId The merchant ID
   * @param bulkOperationId The ID of the bulk operation to cancel
   * @returns Success status of the cancellation
   */
  cancelBulkOperation?(merchantId: string, bulkOperationId: string): Promise<boolean>;
}

/**
 * Interface for order service
 */
export interface IShopifyOrderService {
  /**
   * Get an order by ID
   */
  getOrder(merchantId: string, orderId: string): Promise<ShopifyOrder>;

  /**
   * Get orders with pagination
   */
  getOrders(
    merchantId: string,
    limit?: number,
    cursor?: string,
    status?: string,
  ): Promise<{ orders: ShopifyOrder[]; hasNextPage: boolean; endCursor: string }>;

  /**
   * Create an order
   */
  createOrder(merchantId: string, orderData: Partial<ShopifyOrder>): Promise<ShopifyOrder>;

  /**
   * Update an order
   */
  updateOrder(
    merchantId: string,
    orderId: string,
    orderData: Partial<ShopifyOrder>,
  ): Promise<ShopifyOrder>;

  /**
   * Cancel an order
   */
  cancelOrder(merchantId: string, orderId: string, reason?: string): Promise<ShopifyOrder>;

  /**
   * Sync an order from Shopify to the local database
   */
  syncOrderFromShopify(merchantId: string, shopifyOrderId: string): Promise<any>;

  /**
   * Update order localized fields
   */
  updateOrderLocalizedFields(
    merchantId: string,
    orderId: string,
    localizedFields: ShopifyLocalizedField[],
  ): Promise<ShopifyOrder>;
}

/**
 * Interface for fulfillment service
 */
export interface IShopifyFulfillmentService {
  /**
   * Create a fulfillment
   */
  createFulfillment(
    merchantId: string,
    orderId: string,
    lineItems: { id: string; quantity: number }[],
  ): Promise<ShopifyFulfillment>;

  /**
   * Update a fulfillment
   */
  updateFulfillment(
    merchantId: string,
    fulfillmentId: string,
    data: Partial<ShopifyFulfillment>,
  ): Promise<ShopifyFulfillment>;

  /**
   * Cancel a fulfillment
   */
  cancelFulfillment(merchantId: string, fulfillmentId: string): Promise<void>;

  /**
   * Register as a fulfillment service with Shopify
   */
  registerAsFulfillmentService(merchantId: string): Promise<any>;

  /**
   * Create a fulfillment hold
   */
  createFulfillmentHold(
    merchantId: string,
    fulfillmentOrderId: string,
    reason: string,
  ): Promise<ShopifyFulfillmentHold>;

  /**
   * Get fulfillment holds for a fulfillment order
   */
  getFulfillmentHolds(
    merchantId: string,
    fulfillmentOrderId: string,
  ): Promise<ShopifyFulfillmentHold[]>;

  /**
   * Release a fulfillment hold
   */
  releaseFulfillmentHold(
    merchantId: string,
    fulfillmentOrderId: string,
    holdId: string,
  ): Promise<void>;
}

/**
 * Interface for customer service
 */
export interface IShopifyCustomerService {
  /**
   * Get a customer by ID
   */
  getCustomer(merchantId: string, customerId: string): Promise<ShopifyCustomer>;

  /**
   * Get customers with pagination
   */
  getCustomers(
    merchantId: string,
    limit?: number,
    cursor?: string,
  ): Promise<{ customers: ShopifyCustomer[]; hasNextPage: boolean; endCursor: string }>;

  /**
   * Create a customer
   */
  createCustomer(
    merchantId: string,
    customerData: Partial<ShopifyCustomer>,
  ): Promise<ShopifyCustomer>;

  /**
   * Update a customer
   */
  updateCustomer(
    merchantId: string,
    customerId: string,
    customerData: Partial<ShopifyCustomer>,
  ): Promise<ShopifyCustomer>;

  /**
   * Delete a customer
   */
  deleteCustomer(merchantId: string, customerId: string): Promise<void>;

  /**
   * Sync a customer from Shopify to the local database
   */
  syncCustomerFromShopify(merchantId: string, shopifyCustomerId: string): Promise<any>;
}

/**
 * Interface for inventory service
 */
export interface IShopifyInventoryService {
  /**
   * Update inventory levels
   */
  updateInventoryLevel(
    merchantId: string,
    inventoryItemId: string,
    locationId: string,
    quantity: number,
  ): Promise<any>;

  /**
   * Get inventory levels for a product variant
   */
  getInventoryLevel(merchantId: string, inventoryItemId: string, locationId: string): Promise<any>;

  /**
   * Get all inventory levels for a merchant
   */
  getAllInventoryLevels(merchantId: string): Promise<any[]>;
}

/**
 * Interface for error handling service
 */
export interface IShopifyErrorHandlerService {
  /**
   * Handle API errors
   */
  handleApiError(error: any, shop: string, endpoint: string): void;

  /**
   * Handle webhook processing errors
   */
  handleWebhookError(error: any, topic: string, shop: string): void;

  /**
   * Handle bulk operation errors
   */
  handleBulkOperationError(error: any, merchantId: string, operationId: string): void;

  /**
   * Retry a failed operation
   */
  retryFailedOperation(errorId: string): Promise<boolean>;
}

/**
 * Interface for event service
 */
export interface IShopifyEventService {
  /**
   * Publish a Shopify-related event
   */
  publish(eventName: string, payload: any): void;

  /**
   * Subscribe to a Shopify-related event
   */
  subscribe(eventName: string, handler: (payload: any) => Promise<void>): void;
}
