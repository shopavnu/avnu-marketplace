/**
 * Type definitions for Shopify API integration
 */

/**
 * Shopify product interface
 */
export interface ShopifyProduct {
  id: number;
  title: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  template_suffix?: string;
  status: 'active' | 'archived' | 'draft';
  published_scope?: string;
  tags?: string;
  admin_graphql_api_id?: string;
  variants: ShopifyProductVariant[];
  options: ShopifyProductOption[];
  images: ShopifyImage[];
  image?: ShopifyImage;
}

/**
 * Shopify product variant interface
 */
export interface ShopifyProductVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku?: string;
  position: number;
  inventory_policy: string;
  compare_at_price?: string;
  fulfillment_service: string;
  inventory_management?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode?: string;
  grams: number;
  image_id?: number;
  weight: number;
  weight_unit: string;
  inventory_item_id: number;
  inventory_quantity: number;
  old_inventory_quantity: number;
  requires_shipping: boolean;
  admin_graphql_api_id?: string;
}

/**
 * Shopify product option interface
 */
export interface ShopifyProductOption {
  id: number;
  product_id: number;
  name: string;
  position: number;
  values: string[];
}

/**
 * Shopify image interface
 */
export interface ShopifyImage {
  id: number;
  product_id: number;
  position: number;
  created_at: string;
  updated_at: string;
  alt?: string;
  width: number;
  height: number;
  src: string;
  variant_ids: number[];
  admin_graphql_api_id?: string;
}

/**
 * Shopify order interface
 */
export interface ShopifyOrder {
  id: number;
  admin_graphql_api_id?: string;
  app_id?: number;
  browser_ip?: string;
  buyer_accepts_marketing: boolean;
  cancel_reason?: string;
  cancelled_at?: string;
  cart_token?: string;
  checkout_id?: number;
  checkout_token?: string;
  client_details?: {
    accept_language?: string;
    browser_height?: number;
    browser_ip?: string;
    browser_width?: number;
    session_hash?: string;
    user_agent?: string;
  };
  closed_at?: string;
  confirmed: boolean;
  contact_email?: string;
  created_at: string;
  currency: string;
  current_subtotal_price: string;
  current_total_discounts: string;
  current_total_price: string;
  current_total_tax: string;
  customer?: ShopifyCustomer;
  customer_locale?: string;
  discount_applications?: ShopifyDiscountApplication[];
  discount_codes?: ShopifyDiscountCode[];
  email?: string;
  financial_status?: string;
  fulfillments?: ShopifyFulfillment[];
  fulfillment_status?: string;
  gateway?: string;
  landing_site?: string;
  landing_site_ref?: string;
  line_items: ShopifyLineItem[];
  location_id?: number;
  name: string;
  note?: string;
  note_attributes?: { name: string; value: string }[];
  number: number;
  order_number: number;
  order_status_url: string;
  payment_gateway_names?: string[];
  phone?: string;
  presentment_currency: string;
  processed_at: string;
  processing_method?: string;
  reference?: string;
  referring_site?: string;
  source_identifier?: string;
  source_name?: string;
  source_url?: string;
  subtotal_price: string;
  tags?: string;
  tax_lines: ShopifyTaxLine[];
  taxes_included: boolean;
  test: boolean;
  token: string;
  total_discounts: string;
  total_line_items_price: string;
  total_price: string;
  total_price_usd?: string;
  total_tax: string;
  total_tip_received?: string;
  total_weight: number;
  updated_at: string;
  user_id?: number;
  billing_address?: ShopifyAddress;
  shipping_address?: ShopifyAddress;
  shipping_lines: ShopifyShippingLine[];
}

/**
 * Shopify customer interface
 */
export interface ShopifyCustomer {
  id: number;
  email?: string;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
  orders_count: number;
  state: string;
  total_spent: string;
  last_order_id?: number;
  note?: string;
  verified_email: boolean;
  multipass_identifier?: string;
  tax_exempt: boolean;
  phone?: string;
  tags?: string;
  last_order_name?: string;
  currency?: string;
  addresses?: ShopifyAddress[];
  admin_graphql_api_id?: string;
  default_address?: ShopifyAddress;
}

/**
 * Shopify address interface
 */
export interface ShopifyAddress {
  id?: number;
  customer_id?: number;
  first_name?: string;
  last_name?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
  name?: string;
  province_code?: string;
  country_code?: string;
  country_name?: string;
  default?: boolean;
}

/**
 * Shopify line item interface
 */
export interface ShopifyLineItem {
  id: number;
  admin_graphql_api_id?: string;
  fulfillable_quantity: number;
  fulfillment_service: string;
  fulfillment_status?: string;
  gift_card: boolean;
  grams: number;
  name: string;
  price: string;
  price_set?: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  product_exists: boolean;
  product_id?: number;
  properties?: { name: string; value: string }[];
  quantity: number;
  requires_shipping: boolean;
  sku?: string;
  taxable: boolean;
  title: string;
  total_discount: string;
  total_discount_set?: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  variant_id?: number;
  variant_inventory_management?: string;
  variant_title?: string;
  vendor?: string;
  tax_lines: ShopifyTaxLine[];
  duties?: unknown[];
  discount_allocations?: ShopifyDiscountAllocation[];
}

/**
 * Shopify tax line interface
 */
export interface ShopifyTaxLine {
  price: string;
  rate: number;
  title: string;
  price_set?: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
}

/**
 * Shopify discount application interface
 */
export interface ShopifyDiscountApplication {
  type: string;
  value: string;
  value_type: string;
  allocation_method: string;
  target_selection: string;
  target_type: string;
  code?: string;
  title?: string;
  description?: string;
}

/**
 * Shopify discount code interface
 */
export interface ShopifyDiscountCode {
  code: string;
  amount: string;
  type: string;
}

/**
 * Shopify discount allocation interface
 */
export interface ShopifyDiscountAllocation {
  amount: string;
  discount_application_index: number;
  amount_set?: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
}

/**
 * Shopify shipping line interface
 */
export interface ShopifyShippingLine {
  id: number;
  carrier_identifier?: string;
  code?: string;
  delivery_category?: string;
  discounted_price: string;
  discounted_price_set?: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  phone?: string;
  price: string;
  price_set?: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  requested_fulfillment_service_id?: string;
  source: string;
  title: string;
  tax_lines: ShopifyTaxLine[];
  discount_allocations?: ShopifyDiscountAllocation[];
}

/**
 * Shopify fulfillment interface
 */
export interface ShopifyFulfillment {
  id: number;
  admin_graphql_api_id?: string;
  created_at: string;
  location_id: number;
  name: string;
  order_id: number;
  receipt?: {
    testcase?: boolean;
    authorization?: string;
  };
  service: string;
  shipment_status?: string;
  status: string;
  tracking_company?: string;
  tracking_numbers?: string[];
  tracking_urls?: string[];
  updated_at: string;
  line_items: ShopifyLineItem[];
}

/**
 * Shopify webhook topic enum
 */
export enum ShopifyWebhookTopic {
  PRODUCTS_CREATE = 'products/create',
  PRODUCTS_UPDATE = 'products/update',
  PRODUCTS_DELETE = 'products/delete',
  ORDERS_CREATE = 'orders/create',
  ORDERS_UPDATE = 'orders/update',
  ORDERS_DELETE = 'orders/delete',
  ORDERS_CANCELLED = 'orders/cancelled',
  FULFILLMENTS_CREATE = 'fulfillments/create',
  FULFILLMENTS_UPDATE = 'fulfillments/update',
}

/**
 * Shopify API response for products
 */
export interface ShopifyProductsResponse {
  products: ShopifyProduct[];
}

/**
 * Shopify API response for orders
 */
export interface ShopifyOrdersResponse {
  orders: ShopifyOrder[];
}

/**
 * Sync result interface
 */
export interface SyncResult {
  created: number;
  updated: number;
  failed: number;
}
