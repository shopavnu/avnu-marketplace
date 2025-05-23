export interface WooCommerceProductPayload {
    id: number;
    name: string;
    slug?: string;
    permalink?: string;
    date_created?: string;
    date_created_gmt?: string;
    date_modified?: string;
    date_modified_gmt?: string;
    type?: 'simple' | 'grouped' | 'external' | 'variable';
    status?: 'publish' | 'draft' | 'pending' | 'private';
    featured?: boolean;
    catalog_visibility?: 'visible' | 'catalog' | 'search' | 'hidden';
    description?: string;
    short_description?: string;
    sku?: string;
    price?: string;
    regular_price?: string;
    sale_price?: string;
    date_on_sale_from?: string;
    date_on_sale_from_gmt?: string;
    date_on_sale_to?: string;
    date_on_sale_to_gmt?: string;
    on_sale?: boolean;
    purchasable?: boolean;
    total_sales?: number;
    virtual?: boolean;
    downloadable?: boolean;
    downloads?: WooCommerceDownload[];
    download_limit?: number;
    download_expiry?: number;
    external_url?: string;
    button_text?: string;
    tax_status?: 'taxable' | 'shipping' | 'none';
    tax_class?: string;
    manage_stock?: boolean;
    stock_quantity?: number;
    stock_status?: 'instock' | 'outofstock' | 'onbackorder';
    backorders?: 'no' | 'notify' | 'yes';
    backorders_allowed?: boolean;
    backordered?: boolean;
    sold_individually?: boolean;
    weight?: string;
    dimensions?: {
        length?: string;
        width?: string;
        height?: string;
    };
    shipping_required?: boolean;
    shipping_taxable?: boolean;
    shipping_class?: string;
    shipping_class_id?: number;
    reviews_allowed?: boolean;
    average_rating?: string;
    rating_count?: number;
    upsell_ids?: number[];
    cross_sell_ids?: number[];
    parent_id?: number;
    purchase_note?: string;
    categories?: WooCommerceCategory[];
    tags?: WooCommerceTag[];
    images?: WooCommerceImage[];
    attributes?: WooCommerceAttribute[];
    default_attributes?: WooCommerceDefaultAttribute[];
    variations?: number[];
    grouped_products?: number[];
    menu_order?: number;
    meta_data?: WooCommerceMetaData[];
}
export interface WooCommerceDownload {
    id?: string;
    name?: string;
    file?: string;
}
export interface WooCommerceCategory {
    id: number;
    name?: string;
    slug?: string;
}
export interface WooCommerceTag {
    id: number;
    name?: string;
    slug?: string;
}
export interface WooCommerceImage {
    id: number;
    date_created?: string;
    date_created_gmt?: string;
    date_modified?: string;
    date_modified_gmt?: string;
    src: string;
    name?: string;
    alt?: string;
}
export interface WooCommerceAttribute {
    id: number;
    name: string;
    position?: number;
    visible?: boolean;
    variation?: boolean;
    options?: string[];
}
export interface WooCommerceDefaultAttribute {
    id: number;
    name: string;
    option: string;
}
export interface WooCommerceMetaData {
    id: number;
    key: string;
    value: string | number | boolean | Record<string, unknown>;
}
export interface WooCommerceVariationPayload {
    id: number;
    date_created?: string;
    date_created_gmt?: string;
    date_modified?: string;
    date_modified_gmt?: string;
    description?: string;
    permalink?: string;
    sku?: string;
    price?: string;
    regular_price?: string;
    sale_price?: string;
    date_on_sale_from?: string;
    date_on_sale_from_gmt?: string;
    date_on_sale_to?: string;
    date_on_sale_to_gmt?: string;
    on_sale?: boolean;
    status?: 'publish' | 'draft' | 'pending' | 'private';
    purchasable?: boolean;
    virtual?: boolean;
    downloadable?: boolean;
    downloads?: WooCommerceDownload[];
    download_limit?: number;
    download_expiry?: number;
    tax_status?: 'taxable' | 'shipping' | 'none';
    tax_class?: string;
    manage_stock?: boolean;
    stock_quantity?: number;
    stock_status?: 'instock' | 'outofstock' | 'onbackorder';
    backorders?: 'no' | 'notify' | 'yes';
    backorders_allowed?: boolean;
    backordered?: boolean;
    weight?: string;
    dimensions?: {
        length?: string;
        width?: string;
        height?: string;
    };
    shipping_class?: string;
    shipping_class_id?: number;
    image?: WooCommerceImage;
    attributes?: WooCommerceAttribute[];
    menu_order?: number;
    meta_data?: WooCommerceMetaData[];
}
export interface WooCommerceOutgoingProductPayload {
    name: string;
    type?: 'simple' | 'grouped' | 'external' | 'variable';
    status?: 'publish' | 'draft' | 'pending' | 'private';
    description?: string;
    short_description?: string;
    sku?: string;
    regular_price?: string;
    sale_price?: string;
    manage_stock?: boolean;
    stock_quantity?: number;
    stock_status?: 'instock' | 'outofstock' | 'onbackorder';
    categories?: Partial<WooCommerceCategory>[];
    tags?: Partial<WooCommerceTag>[];
    images?: Partial<WooCommerceImage>[];
    attributes?: Partial<WooCommerceAttribute>[];
    meta_data?: Partial<WooCommerceMetaData>[];
}
