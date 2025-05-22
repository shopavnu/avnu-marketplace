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
export interface ShopifyGraphQLError {
  message: string;
  path?: string[];
  extensions?: Record<string, any>;
}
export interface ShopifyUserError {
  message: string;
  field?: string[];
  code?: string;
}
export interface IShopifyClientService {
  query<T>(
    shop: string,
    accessToken: string,
    query: string,
    variables?: Record<string, any>,
  ): Promise<T>;
  request<T>(
    shop: string,
    accessToken: string,
    endpoint: string,
    method?: string,
    data?: any,
  ): Promise<T>;
  getShopInfo(shop: string, accessToken: string): Promise<any>;
}
export interface IShopifyAuthService {
  generateAuthUrl(shop: string): string;
  handleCallback(shop: string, code: string, state: string): Promise<string>;
  verifySessionToken(token: string): Promise<any>;
  storeAccessToken(shop: string, accessToken: string, merchantId: string): Promise<void>;
  getAccessToken(merchantId: string): Promise<{
    shop: string;
    accessToken: string;
  }>;
  handleUninstall(shop: string): Promise<void>;
}
export interface IShopifyWebhookService {
  registerWebhook(
    shop: string,
    accessToken: string,
    topic: ShopifyWebhookTopic,
    address: string,
  ): Promise<ShopifyWebhookSubscription>;
  registerAllWebhooks(shop: string, accessToken: string): Promise<ShopifyWebhookSubscription[]>;
  getWebhooks(shop: string, accessToken: string): Promise<ShopifyWebhookSubscription[]>;
  verifyWebhookSignature(rawBody: Buffer, hmacHeader: string | Record<string, string>): boolean;
  processWebhook(topic: ShopifyWebhookTopic, shop: string, payload: any): Promise<void>;
}
export interface IShopifyProductService {
  getProduct(merchantId: string, productId: string): Promise<ShopifyProduct>;
  getProducts(
    merchantId: string,
    limit?: number,
    cursor?: string,
  ): Promise<{
    products: ShopifyProduct[];
    hasNextPage: boolean;
    endCursor: string;
  }>;
  createProduct(merchantId: string, productData: Partial<ShopifyProduct>): Promise<ShopifyProduct>;
  updateProduct(
    merchantId: string,
    productId: string,
    productData: Partial<ShopifyProduct>,
  ): Promise<ShopifyProduct>;
  deleteProduct(merchantId: string, productId: string): Promise<void>;
  syncProductFromShopify(merchantId: string, shopifyProductId: string): Promise<any>;
  syncProductToShopify(merchantId: string, localProductId: string): Promise<any>;
}
export interface IShopifyBulkOperationService {
  startBulkOperation(merchantId: string, query: string): Promise<string>;
  pollBulkOperationStatus(
    merchantId: string,
    bulkOperationId: string,
  ): Promise<ShopifyBulkOperation>;
  processResults<T = Record<string, any>[]>(
    merchantId: string,
    url: string,
    entityType?: string,
  ): Promise<T>;
  cancelBulkOperation?(merchantId: string, bulkOperationId: string): Promise<boolean>;
}
export interface IShopifyOrderService {
  getOrder(merchantId: string, orderId: string): Promise<ShopifyOrder>;
  getOrders(
    merchantId: string,
    limit?: number,
    cursor?: string,
    status?: string,
  ): Promise<{
    orders: ShopifyOrder[];
    hasNextPage: boolean;
    endCursor: string;
  }>;
  createOrder(merchantId: string, orderData: Partial<ShopifyOrder>): Promise<ShopifyOrder>;
  updateOrder(
    merchantId: string,
    orderId: string,
    orderData: Partial<ShopifyOrder>,
  ): Promise<ShopifyOrder>;
  cancelOrder(merchantId: string, orderId: string, reason?: string): Promise<ShopifyOrder>;
  syncOrderFromShopify(merchantId: string, shopifyOrderId: string): Promise<any>;
  updateOrderLocalizedFields(
    merchantId: string,
    orderId: string,
    localizedFields: ShopifyLocalizedField[],
  ): Promise<ShopifyOrder>;
}
export interface IShopifyFulfillmentService {
  createFulfillment(
    merchantId: string,
    orderId: string,
    lineItems: {
      id: string;
      quantity: number;
    }[],
  ): Promise<ShopifyFulfillment>;
  updateFulfillment(
    merchantId: string,
    fulfillmentId: string,
    data: Partial<ShopifyFulfillment>,
  ): Promise<ShopifyFulfillment>;
  cancelFulfillment(merchantId: string, fulfillmentId: string): Promise<void>;
  registerAsFulfillmentService(merchantId: string): Promise<any>;
  createFulfillmentHold(
    merchantId: string,
    fulfillmentOrderId: string,
    reason: string,
  ): Promise<ShopifyFulfillmentHold>;
  getFulfillmentHolds(
    merchantId: string,
    fulfillmentOrderId: string,
  ): Promise<ShopifyFulfillmentHold[]>;
  releaseFulfillmentHold(
    merchantId: string,
    fulfillmentOrderId: string,
    holdId: string,
  ): Promise<void>;
}
export interface IShopifyCustomerService {
  getCustomer(merchantId: string, customerId: string): Promise<ShopifyCustomer>;
  getCustomers(
    merchantId: string,
    limit?: number,
    cursor?: string,
  ): Promise<{
    customers: ShopifyCustomer[];
    hasNextPage: boolean;
    endCursor: string;
  }>;
  createCustomer(
    merchantId: string,
    customerData: Partial<ShopifyCustomer>,
  ): Promise<ShopifyCustomer>;
  updateCustomer(
    merchantId: string,
    customerId: string,
    customerData: Partial<ShopifyCustomer>,
  ): Promise<ShopifyCustomer>;
  deleteCustomer(merchantId: string, customerId: string): Promise<void>;
  syncCustomerFromShopify(merchantId: string, shopifyCustomerId: string): Promise<any>;
}
export interface IShopifyInventoryService {
  updateInventoryLevel(
    merchantId: string,
    inventoryItemId: string,
    locationId: string,
    quantity: number,
  ): Promise<any>;
  getInventoryLevel(merchantId: string, inventoryItemId: string, locationId: string): Promise<any>;
  getAllInventoryLevels(merchantId: string): Promise<any[]>;
}
export interface IShopifyErrorHandlerService {
  handleApiError(error: any, shop: string, endpoint: string): void;
  handleWebhookError(error: any, topic: string, shop: string): void;
  handleBulkOperationError(error: any, merchantId: string, operationId: string): void;
  retryFailedOperation(errorId: string): Promise<boolean>;
}
export interface IShopifyEventService {
  publish(eventName: string, payload: any): void;
  subscribe(eventName: string, handler: (payload: any) => Promise<void>): void;
}
