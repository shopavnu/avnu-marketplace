interface ShopifyImage {
  id?: string;
  src: string;
  position?: number;
  width?: number;
  height?: number;
  alt?: string;
}
interface ShopifyVariant {
  id: string | number;
  sku?: string;
  price?: string;
  compare_at_price?: string;
  weight?: string | number;
  weight_unit?: string;
  inventory_quantity?: number;
  requires_shipping?: boolean;
  title?: string;
  option1?: string;
  option2?: string;
  option3?: string;
}
interface ShopifyOption {
  id: string | number;
  name: string;
  values: string[];
}
interface ShopifyMetafield {
  key: string;
  namespace: string;
  value: string;
  value_type: string;
}
interface ShopifyProduct {
  id: string | number;
  title?: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  handle?: string;
  admin_graphql_api_id?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string;
  variants?: ShopifyVariant[];
  images?: ShopifyImage[];
  options?: ShopifyOption[];
  status?: string;
  metafields?: ShopifyMetafield[];
}
interface ShopifyAddress {
  first_name?: string;
  last_name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
  phone?: string;
}
interface ShopifyLineItem {
  product_id?: string | number;
  variant_id?: string | number;
  title?: string;
  quantity?: number;
  price?: string;
  sku?: string;
  fulfillment_status?: string;
}
interface ShopifyShippingLine {
  price?: string;
}
interface ShopifyCustomer {
  first_name?: string;
  last_name?: string;
  email?: string;
}
interface ShopifyOrder {
  id: string | number;
  name?: string;
  order_number?: string | number;
  financial_status?: string;
  fulfillment_status?: string;
  total_price?: string;
  subtotal_price?: string;
  total_tax?: string;
  currency?: string;
  email?: string;
  note?: string;
  tags?: string;
  created_at?: string;
  updated_at?: string;
  cancelled_at?: string | null;
  closed_at?: string | null;
  shipping_lines?: ShopifyShippingLine[];
  line_items?: ShopifyLineItem[];
  shipping_address?: ShopifyAddress;
  billing_address?: ShopifyAddress;
  customer?: ShopifyCustomer;
  admin_graphql_api_id?: string;
  payment_gateway_names?: string[];
  checkout_id?: string | number;
}
export declare class ShopifyAdapter {
  private static readonly logger;
  static fromShopifyProduct(
    shopifyProduct: ShopifyProduct,
    merchantId: string,
  ): Record<string, any>;
  static toShopifyProduct(product: Record<string, any>): Partial<ShopifyProduct>;
  static fromShopifyOrder(shopifyOrder: ShopifyOrder, merchantId: string): Record<string, any>;
}
export {};
