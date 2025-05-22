export interface ShopifyProductPayload {
  id: string;
  title: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  handle?: string;
  template_suffix?: string;
  status?: 'active' | 'archived' | 'draft';
  published_scope?: string;
  tags?: string;
  admin_graphql_api_id?: string;
  variants: ShopifyProductVariantPayload[];
  options?: ShopifyProductOptionPayload[];
  images?: ShopifyProductImagePayload[];
  image?: ShopifyProductImagePayload;
}
export interface ShopifyProductVariantPayload {
  id: string;
  product_id: string;
  title?: string;
  price: string;
  sku?: string;
  position?: number;
  inventory_policy?: string;
  compare_at_price?: string;
  fulfillment_service?: string;
  inventory_management?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  created_at?: string;
  updated_at?: string;
  taxable?: boolean;
  barcode?: string;
  grams?: number;
  image_id?: string;
  weight?: number;
  weight_unit?: string;
  inventory_item_id?: string;
  inventory_quantity?: number;
  old_inventory_quantity?: number;
  requires_shipping?: boolean;
  admin_graphql_api_id?: string;
}
export interface ShopifyProductOptionPayload {
  id: string;
  product_id: string;
  name: string;
  position?: number;
  values?: string[];
}
export interface ShopifyProductImagePayload {
  id: string;
  product_id: string;
  position?: number;
  created_at?: string;
  updated_at?: string;
  alt?: string;
  width?: number;
  height?: number;
  src: string;
  variant_ids?: string[];
  admin_graphql_api_id?: string;
}
export interface ShopifyOutgoingProductPayload {
  title: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  tags?: string;
  status?: 'active' | 'archived' | 'draft';
  variants?: Partial<ShopifyProductVariantPayload>[];
  options?: Partial<ShopifyProductOptionPayload>[];
  images?: Partial<ShopifyProductImagePayload>[];
  image?: Partial<ShopifyProductImagePayload>;
  metafields?: ShopifyMetafield[];
}
export interface ShopifyMetafield {
  key: string;
  value: string;
  value_type: 'string' | 'integer' | 'json_string';
  namespace: string;
}
