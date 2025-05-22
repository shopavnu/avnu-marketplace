export interface ShopifyProduct {
  id?: string;
  title?: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  handle?: string;
  published_scope?: string;
  tags?: string;
  status?: 'active' | 'archived' | 'draft';
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
  variants?: ShopifyVariant[];
  options?: ShopifyOption[];
  images?: ShopifyImage[];
  image?: ShopifyImage;
  template_suffix?: string | null;
  admin_graphql_api_id?: string;
  [key: string]: unknown;
}
export interface ShopifyVariant {
  id?: string;
  product_id?: string;
  title?: string;
  price: string;
  sku?: string;
  position?: number;
  inventory_policy?: 'deny' | 'continue';
  compare_at_price?: string | null;
  fulfillment_service?: string;
  inventory_management?: string | null;
  option1?: string | null;
  option2?: string | null;
  option3?: string | null;
  created_at?: string;
  updated_at?: string;
  taxable?: boolean;
  tax_code?: string | null;
  barcode?: string | null;
  grams?: number;
  image_id?: string | null;
  weight?: number;
  weight_unit?: 'g' | 'kg' | 'oz' | 'lb';
  inventory_item_id?: string;
  inventory_quantity?: number;
  requires_shipping?: boolean;
  admin_graphql_api_id?: string;
  [key: string]: unknown;
}
export interface ShopifyOption {
  id?: string;
  product_id?: string;
  name: string;
  position?: number;
  values: string[];
}
export interface ShopifyImage {
  id?: string;
  product_id?: string;
  position?: number;
  created_at?: string;
  updated_at?: string;
  alt?: string | null;
  width?: number;
  height?: number;
  src: string;
  variant_ids?: string[];
  admin_graphql_api_id?: string;
}
export interface ShopifyOrder {
  id: string;
  name: string;
  email?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  closed_at?: string | null;
  cancelled_at?: string | null;
  financial_status?: string;
  fulfillment_status?: string | null;
  currency: string;
  total_price: string;
  subtotal_price?: string;
  total_tax?: string;
  customer?: ShopifyCustomer;
  line_items: ShopifyLineItem[];
  shipping_address?: ShopifyAddress;
  billing_address?: ShopifyAddress;
  [key: string]: unknown;
}
export interface ShopifyLineItem {
  id: string;
  variant_id?: string;
  title: string;
  quantity: number;
  sku?: string;
  variant_title?: string;
  vendor?: string;
  price: string;
  total_discount?: string;
  properties?: Array<{
    name: string;
    value: string;
  }>;
  [key: string]: unknown;
}
export interface ShopifyCustomer {
  id: string;
  email?: string;
  accepts_marketing?: boolean;
  created_at?: string;
  updated_at?: string;
  first_name?: string;
  last_name?: string;
  orders_count?: number;
  state?: string;
  total_spent?: string;
  last_order_id?: string;
  note?: string | null;
  verified_email?: boolean;
  tax_exempt?: boolean;
  tags?: string;
  [key: string]: unknown;
}
export interface ShopifyAddress {
  first_name?: string;
  last_name?: string;
  address1?: string;
  address2?: string | null;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
  name?: string;
  province_code?: string;
  country_code?: string;
  [key: string]: unknown;
}
export interface ShopifyPaginationParams {
  limit?: number;
  page_info?: string;
  since_id?: string;
  created_at_min?: string;
  created_at_max?: string;
  updated_at_min?: string;
  updated_at_max?: string;
}
export interface ShopifyWebhookEvent {
  id: string;
  event: string;
  topic: string;
  shop_id: string;
  shop_domain: string;
  data: Record<string, unknown>;
  created_at: string;
}
export interface ShopifyResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}
