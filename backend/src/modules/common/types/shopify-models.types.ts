/**
 * Core Shopify model types used across the Avnu Marketplace integration
 * These types represent the core data structures from Shopify's API
 */

/**
 * Shopify shop/store information
 */
export interface ShopifyShop {
  id: string;
  name: string;
  email: string;
  domain: string;
  myshopifyDomain: string;
  primaryLocale: string;
  address?: ShopifyAddress;
  currency: string;
  iana_timezone: string;
  weightUnit: 'kg' | 'g' | 'lb' | 'oz';
  plan: {
    displayName: string;
    partnerDevelopment: boolean;
    shopifyPlus: boolean;
  };
}

/**
 * Shopify address structure used across multiple entities
 */
export interface ShopifyAddress {
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  provinceCode?: string;
  country: string;
  countryCode: string;
  zip: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Shopify product structure
 */
export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  vendor: string;
  status: 'active' | 'archived' | 'draft';
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  options: ShopifyProductOption[];
  variants: ShopifyProductVariant[];
  images: ShopifyImage[];
  metafields: ShopifyMetafield[];
}

/**
 * Shopify product option
 */
export interface ShopifyProductOption {
  id: string;
  name: string;
  position: number;
  values: string[];
}

/**
 * Shopify product variant
 */
export interface ShopifyProductVariant {
  id: string;
  title: string;
  price: string;
  compareAtPrice: string | null;
  sku: string;
  position: number;
  inventoryPolicy: 'deny' | 'continue';
  inventoryQuantity: number;
  inventoryManagement: 'shopify' | 'fulfillment_service' | null;
  requiresShipping: boolean;
  taxable: boolean;
  weight: number;
  weightUnit: 'kg' | 'g' | 'lb' | 'oz';
  availableForSale: boolean;
  barcode: string;
  image?: ShopifyImage;
  selectedOptions: ShopifySelectedOption[];
  metafields: ShopifyMetafield[];
}

/**
 * Shopify selected option for a product variant
 */
export interface ShopifySelectedOption {
  name: string;
  value: string;
}

/**
 * Shopify image structure
 */
export interface ShopifyImage {
  id: string;
  src: string;
  altText: string | null;
  width: number;
  height: number;
  position?: number;
}

/**
 * Shopify metafield structure
 */
export interface ShopifyMetafield {
  id: string;
  namespace: string;
  key: string;
  value: string;
  valueType: 'string' | 'integer' | 'json_string' | 'boolean';
  description?: string;
}

/**
 * Shopify customer structure
 */
export interface ShopifyCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  verifiedEmail: boolean;
  addresses: ShopifyAddress[];
  defaultAddress?: ShopifyAddress;
  createdAt: string;
  updatedAt: string;
  ordersCount: number;
  state: 'enabled' | 'disabled' | 'invited' | 'declined';
  totalSpent: string;
  note?: string;
  marketingConsent?: ShopifyMarketingConsent;
}

/**
 * Shopify marketing consent information
 */
export interface ShopifyMarketingConsent {
  marketingState: 'subscribed' | 'not_subscribed' | 'pending' | 'unsubscribed';
  marketingOptInLevel: 'single_opt_in' | 'confirmed_opt_in' | 'unknown';
  consentUpdatedAt: string;
}

/**
 * Shopify order structure
 */
export interface ShopifyOrder {
  id: string;
  name: string; // Order number
  email: string;
  phone?: string;
  test: boolean;
  confirmationNumber: string;
  confirmed: boolean;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
  processedAt: string;
  closedAt: string | null;
  cancelledAt: string | null;
  cancelReason?: 'customer' | 'fraud' | 'inventory' | 'declined' | 'other';
  currency: string;
  customer: ShopifyCustomer;
  customerLocale: string;
  billingAddress?: ShopifyAddress;
  shippingAddress?: ShopifyAddress;
  financialStatus: ShopifyOrderFinancialStatus;
  fulfillmentStatus: ShopifyOrderFulfillmentStatus;
  tags: string[];
  lineItems: ShopifyLineItem[];
  shippingLines: ShopifyShippingLine[];
  note?: string;
  noteAttributes: ShopifyNoteAttribute[];
  localizedFields?: ShopifyLocalizedField[]; // 2025-01 renamed from localizationExtensions
  subtotalPrice: string;
  totalDiscounts: string;
  totalLineItemsPrice: string;
  totalPrice: string;
  totalShippingPrice: string;
  totalTax: string;
  taxesIncluded: boolean;
  totalWeight: number;
  fulfillments: ShopifyFulfillment[];
  refunds: ShopifyRefund[];
}

/**
 * Shopify order financial status
 */
export type ShopifyOrderFinancialStatus =
  | 'pending'
  | 'authorized'
  | 'partially_paid'
  | 'paid'
  | 'partially_refunded'
  | 'refunded'
  | 'voided';

/**
 * Shopify order fulfillment status
 */
export type ShopifyOrderFulfillmentStatus = null | 'fulfilled' | 'partial' | 'restocked';

/**
 * Shopify line item (order item)
 */
export interface ShopifyLineItem {
  id: string;
  title: string;
  quantity: number;
  price: string;
  sku: string;
  variantId: string;
  productId: string;
  taxable: boolean;
  giftCard: boolean;
  name: string;
  variantTitle: string;
  vendor: string;
  requiresShipping: boolean;
  fulfillmentService: string;
  properties: ShopifyLineItemProperty[];
  taxLines: ShopifyTaxLine[];
  totalDiscount: string;
  fulfillmentStatus: 'fulfilled' | 'partial' | null;
}

/**
 * Shopify line item property
 */
export interface ShopifyLineItemProperty {
  name: string;
  value: string;
}

/**
 * Shopify tax line
 */
export interface ShopifyTaxLine {
  title: string;
  price: string;
  rate: number;
}

/**
 * Shopify shipping line
 */
export interface ShopifyShippingLine {
  id: string;
  title: string;
  price: string;
  code?: string;
  source: string;
  phone?: string;
  discountedPrice: string;
  carrierIdentifier?: string;
  requestedFulfillmentServiceId?: string;
  taxLines: ShopifyTaxLine[];
}

/**
 * Shopify note attribute
 */
export interface ShopifyNoteAttribute {
  name: string;
  value: string;
}

/**
 * Shopify localized field (renamed from localizationExtension in 2025-01)
 */
export interface ShopifyLocalizedField {
  keys: string[];
  values: string[];
  locale: string;
}

/**
 * Shopify fulfillment
 */
export interface ShopifyFulfillment {
  id: string;
  orderId: string;
  status: 'pending' | 'open' | 'success' | 'cancelled' | 'error' | 'failure';
  createdAt: string;
  updatedAt: string;
  trackingCompany?: string;
  trackingNumbers: string[];
  trackingUrls: string[];
  receipt?: Record<string, any>;
  lineItems: ShopifyLineItem[];
}

/**
 * Shopify fulfillment hold
 */
/**
 * Shopify Fulfillment Hold (2025-01 API version)
 */
export interface ShopifyFulfillmentHold {
  id: string;
  reason: string;
  reasonNotes?: string;
  heldByApp: {
    id: string;
    title: string;
  }; // Updated in 2025-01, was string 'heldBy' previously
  createdAt: string;
  updatedAt: string;
  releaseDate?: string;
  releaseStatus?: 'scheduled' | 'pending' | 'expired' | 'released';
  fulfillmentOrderId: string;
}

/**
 * Shopify refund
 */
export interface ShopifyRefund {
  id: string;
  orderId: string;
  createdAt: string;
  note?: string;
  userId?: string;
  processedAt: string;
  refundLineItems: ShopifyRefundLineItem[];
  transactions: ShopifyTransaction[];
}

/**
 * Shopify refund line item
 */
export interface ShopifyRefundLineItem {
  id: string;
  lineItemId: string;
  quantity: number;
  restockType: 'no_restock' | 'cancel' | 'return' | 'legacy_restock';
  locationId?: string;
  subtotal: string;
  totalTax: string;
  lineItem: ShopifyLineItem;
}

/**
 * Shopify transaction
 */
export interface ShopifyTransaction {
  id: string;
  orderId: string;
  amount: string;
  currency: string;
  fee: string;
  gateway: string;
  source: string;
  kind: 'authorization' | 'capture' | 'sale' | 'void' | 'refund';
  status: 'pending' | 'failure' | 'success' | 'error';
  createdAt: string;
  processedAt: string;
  errorCode?: string;
  message?: string;
  test: boolean;
  authorization?: string;
  parentId?: string;
}

/**
 * Shopify bulk operation
 */
/**
 * Shopify Bulk Operation interface
 * Enhanced for 2025-01 API with additional fields
 */
export interface ShopifyBulkOperation {
  id: string;
  status:
    | 'created'
    | 'running'
    | 'completed'
    | 'failed'
    | 'canceling'
    | 'canceled'
    | 'CREATED'
    | 'RUNNING'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELING'
    | 'CANCELED';
  errorCode?: string | null;
  statusMessage?: string | null;
  createdAt: string;
  completedAt?: string | null;
  objectCount?: number;
  fileSize?: number;
  url?: string | null;
  partialDataUrl?: string | null;

  // Additional fields from 2025-01 API
  rootObjectCount?: number;
  type?: string;
  query?: string;
  rootObjectDeletionAllowed?: boolean;
}

/**
 * Shopify webhook topic
 */
export type ShopifyWebhookTopic =
  | 'app/uninstalled'
  | 'carts/create'
  | 'carts/update'
  | 'checkouts/create'
  | 'checkouts/update'
  | 'collections/create'
  | 'collections/update'
  | 'collections/delete'
  | 'customer_tags/added'
  | 'customer_tags/removed'
  | 'customers/create'
  | 'customers/delete'
  | 'customers/disable'
  | 'customers/enable'
  | 'customers/update'
  | 'customers/email_marketing_consent_update'
  | 'customers/marketing_consent_update'
  | 'customers/purchasing_summary'
  | 'customers/data_request' // GDPR data request
  | 'customers/redact' // GDPR data deletion
  | 'draft_orders/create'
  | 'draft_orders/update'
  | 'draft_orders/delete'
  | 'fulfillments/create'
  | 'fulfillments/update'
  | 'inventory_items/create'
  | 'inventory_items/update'
  | 'inventory_items/delete'
  | 'inventory_levels/connect'
  | 'inventory_levels/update'
  | 'inventory_levels/disconnect'
  | 'orders/cancelled'
  | 'orders/create'
  | 'orders/fulfilled'
  | 'orders/paid'
  | 'orders/partially_fulfilled'
  | 'orders/updated'
  | 'products/create'
  | 'products/update'
  | 'products/delete'
  | 'refunds/create'
  | 'shop/update'; // Shop update (for theme changes, etc)

/**
 * Shopify webhook subscription
 */
export interface ShopifyWebhookSubscription {
  id: string;
  address: string;
  topic: ShopifyWebhookTopic;
  format: 'json' | 'xml';
  createdAt: string;
  updatedAt: string;
}

/**
 * Shopify GraphQL error
 */
export interface ShopifyGraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
  extensions?: Record<string, any>;
}

/**
 * Shopify user error from GraphQL response
 */
export interface ShopifyUserError {
  field: string[];
  message: string;
  code?: string; // Added in 2025-01 API version
}

/**
 * Shopify bulk operation error
 */
export interface ShopifyBulkOperationError {
  code: string; // Added in 2025-01 API version
  message: string;
  field?: string[];
}
