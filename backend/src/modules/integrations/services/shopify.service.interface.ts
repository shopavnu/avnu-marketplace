// @ts-strict-mode: enabled
import { SyncResult } from '../integrations.service.interface';

// Re-export SyncResult to make it available to importers
export { SyncResult };
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import { OrderStatus } from '../../orders/enums';

/**
 * Shopify product data interface
 */
export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: string;
  published_at: string;
  template_suffix: string | null;
  status: string;
  published_scope: string;
  tags: string;
  admin_graphql_api_id: string;
  variants: {
    id: number;
    product_id: number;
    title: string;
    price: string;
    sku: string;
    position: number;
    inventory_policy: string;
    compare_at_price: string | null;
    fulfillment_service: string;
    inventory_management: string | null;
    option1: string | null;
    option2: string | null;
    option3: string | null;
    created_at: string;
    updated_at: string;
    taxable: boolean;
    barcode: string | null;
    grams: number;
    image_id: number | null;
    weight: number;
    weight_unit: string;
    inventory_item_id: number;
    inventory_quantity: number;
    old_inventory_quantity: number;
    requires_shipping: boolean;
    admin_graphql_api_id: string;
  }[];
  options: {
    id: number;
    product_id: number;
    name: string;
    position: number;
    values: string[];
  }[];
  images: {
    id: number;
    product_id: number;
    position: number;
    created_at: string;
    updated_at: string;
    alt: string | null;
    width: number;
    height: number;
    src: string;
    variant_ids: number[];
    admin_graphql_api_id: string;
  }[];
  image: {
    id: number;
    product_id: number;
    position: number;
    created_at: string;
    updated_at: string;
    alt: string | null;
    width: number;
    height: number;
    src: string;
    variant_ids: number[];
    admin_graphql_api_id: string;
  };
}

/**
 * Shopify order data interface
 */
export interface ShopifyOrder {
  id: number;
  admin_graphql_api_id: string;
  app_id: number;
  browser_ip: string | null;
  buyer_accepts_marketing: boolean;
  cancel_reason: string | null;
  cancelled_at: string | null;
  cart_token: string | null;
  checkout_id: number | null;
  checkout_token: string | null;
  client_details: {
    accept_language: string | null;
    browser_height: number | null;
    browser_ip: string | null;
    browser_width: number | null;
    session_hash: string | null;
    user_agent: string | null;
  };
  closed_at: string | null;
  confirmed: boolean;
  contact_email: string | null;
  created_at: string;
  currency: string;
  current_subtotal_price: string;
  current_total_discounts: string;
  current_total_price: string;
  current_total_tax: string;
  customer: {
    id: number;
    email: string;
    accepts_marketing: boolean;
    created_at: string;
    updated_at: string;
    first_name: string;
    last_name: string;
    orders_count: number;
    state: string;
    total_spent: string;
    last_order_id: number;
    note: string | null;
    verified_email: boolean;
    multipass_identifier: string | null;
    tax_exempt: boolean;
    phone: string | null;
    tags: string;
    last_order_name: string;
    currency: string;
    admin_graphql_api_id: string;
  };
  customer_locale: string;
  device_id: number | null;
  discount_codes: {
    code: string;
    amount: string;
    type: string;
  }[];
  email: string;
  financial_status: string;
  fulfillment_status: string | null;
  gateway: string;
  landing_site: string | null;
  landing_site_ref: string | null;
  location_id: number | null;
  name: string;
  note: string | null;
  note_attributes: {
    name: string;
    value: string;
  }[];
  number: number;
  order_number: number;
  order_status_url: string;
  payment_gateway_names: string[];
  phone: string | null;
  presentment_currency: string;
  processed_at: string;
  processing_method: string;
  reference: string | null;
  referring_site: string | null;
  source_identifier: string | null;
  source_name: string;
  source_url: string | null;
  subtotal_price: string;
  tags: string;
  tax_lines: {
    price: string;
    rate: number;
    title: string;
  }[];
  taxes_included: boolean;
  test: boolean;
  token: string;
  total_discounts: string;
  total_line_items_price: string;
  total_price: string;
  total_price_usd: string;
  total_tax: string;
  total_tip_received: string;
  total_weight: number;
  updated_at: string;
  user_id: number | null;
  billing_address: {
    first_name: string;
    address1: string;
    phone: string;
    city: string;
    zip: string;
    province: string;
    country: string;
    last_name: string;
    address2: string;
    company: string | null;
    latitude: number | null;
    longitude: number | null;
    name: string;
    country_code: string;
    province_code: string;
  };
  shipping_address: {
    first_name: string;
    address1: string;
    phone: string;
    city: string;
    zip: string;
    province: string;
    country: string;
    last_name: string;
    address2: string;
    company: string | null;
    latitude: number | null;
    longitude: number | null;
    name: string;
    country_code: string;
    province_code: string;
  };
  line_items: {
    id: number;
    admin_graphql_api_id: string;
    fulfillable_quantity: number;
    fulfillment_service: string;
    fulfillment_status: string | null;
    gift_card: boolean;
    grams: number;
    name: string;
    price: string;
    price_set: {
      shop_money: {
        amount: string;
        currency_code: string;
      };
      presentment_money: {
        amount: string;
        currency_code: string;
      };
    };
    product_exists: boolean;
    product_id: number;
    properties: {
      name: string;
      value: string;
    }[];
    quantity: number;
    requires_shipping: boolean;
    sku: string;
    taxable: boolean;
    title: string;
    total_discount: string;
    variant_id: number;
    variant_inventory_management: string;
    variant_title: string;
    vendor: string;
  }[];
  fulfillments: {
    id: number;
    admin_graphql_api_id: string;
    created_at: string;
    location_id: number;
    name: string;
    order_id: number;
    receipt: {
      testcase: boolean;
      authorization: string;
    };
    service: string;
    status: string;
    tracking_company: string;
    tracking_number: string;
    tracking_numbers: string[];
    tracking_url: string;
    tracking_urls: string[];
    updated_at: string;
    line_items: {
      id: number;
      variant_id: number;
      title: string;
      quantity: number;
      price: string;
      sku: string;
      variant_title: string;
      vendor: string;
      fulfillment_service: string;
      product_id: number;
      requires_shipping: boolean;
      taxable: boolean;
      gift_card: boolean;
      name: string;
      variant_inventory_management: string;
      properties: unknown[];
      product_exists: boolean;
      fulfillable_quantity: number;
      grams: number;
      total_discount: string;
      fulfillment_status: string;
    }[];
  }[];
  refunds: unknown[];
}

/**
 * Interface for the ShopifyService
 * Defines the contract that the ShopifyService must follow
 */
export interface IShopifyService {
  /**
   * Authenticate with Shopify API
   * @param shopDomain The Shopify shop domain
   * @param apiKey The Shopify API key
   * @param apiSecret The Shopify API secret
   * @param accessToken The Shopify access token
   * @returns True if authentication is successful
   */
  authenticate(
    shopDomain: string,
    apiKey: string,
    apiSecret: string,
    accessToken: string,
  ): Promise<boolean>;

  /**
   * Sync products from Shopify
   * @param shopDomain The Shopify shop domain
   * @param accessToken The Shopify access token
   * @param merchantId The merchant ID
   * @returns Sync result with counts of created, updated, and failed items
   */
  syncProducts(shopDomain: string, accessToken: string, merchantId: string): Promise<SyncResult>;

  /**
   * Sync orders from Shopify
   * @param shopDomain The Shopify shop domain
   * @param accessToken The Shopify access token
   * @param merchantId The merchant ID
   * @returns Sync result with counts of created, updated, and failed items
   */
  syncOrders(shopDomain: string, accessToken: string, merchantId: string): Promise<SyncResult>;

  /**
   * Update order status in Shopify
   * @param order The order to update
   * @param newStatus The new order status
   * @returns True if the update was successful
   */
  updateOrderStatus(order: Order, newStatus: OrderStatus): Promise<boolean>;

  /**
   * Create a product in Shopify
   * @param product The product to create
   * @param shopDomain The Shopify shop domain
   * @param accessToken The Shopify access token
   * @returns The created product's external ID
   */
  createProduct(product: Product, shopDomain: string, accessToken: string): Promise<string>;

  /**
   * Update a product in Shopify
   * @param product The product to update
   * @param shopDomain The Shopify shop domain
   * @param accessToken The Shopify access token
   * @returns True if the update was successful
   */
  updateProduct(product: Product, shopDomain: string, accessToken: string): Promise<boolean>;

  /**
   * Handle a webhook from Shopify
   * @param topic The webhook topic
   * @param data The webhook data
   * @param shopDomain The Shopify shop domain
   * @returns True if the webhook was handled successfully
   */
  handleWebhook(topic: string, data: Record<string, unknown>, shopDomain: string): Promise<boolean>;
}
