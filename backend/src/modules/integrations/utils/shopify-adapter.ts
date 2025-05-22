import { Logger } from '@nestjs/common';

/**
 * Interfaces for Shopify API types
 */

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
  weight_unit?: string; // This should always be a string, but we'll handle it just in case
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

/**
 * Adapter for converting between Shopify product format and our internal format
 *
 * This class provides type-safe conversion between Shopify's API responses and our internal data models.
 * It has been updated to use proper TypeScript interfaces and type conversion to ensure type safety.
 *
 * Key features:
 * - Strongly typed interfaces for Shopify entities (ShopifyProduct, ShopifyOrder, etc.)
 * - Safe handling of string/number conversions for IDs and other fields
 * - Consistent error handling and logging
 * - Proper null/undefined checks with sensible defaults
 *
 * Shopify API Reference: https://shopify.dev/api/admin-rest/current/resources/product
 */
export class ShopifyAdapter {
  private static readonly logger = new Logger(ShopifyAdapter.name);

  // Helper function to ensure string conversion
  private static ensureString(value: unknown, defaultValue: string = ''): string {
    if (value === null || value === undefined) return defaultValue;
    return String(value);
  }

  /**
   * Convert a Shopify product to our internal product format
   * @param shopifyProduct Product from Shopify API
   * @param merchantId Our internal merchant ID
   */
  public static fromShopifyProduct(
    shopifyProduct: ShopifyProduct,
    merchantId: string,
  ): Record<string, any> {
    try {
      if (!shopifyProduct) return null;

      // Extract product images
      const images = shopifyProduct.images?.map(img => img.src) || [];

      // Extract product variants with explicit type handling for each property
      const variants =
        shopifyProduct.variants?.map(variant => {
          // Handle each property separately with explicit type conversions
          const variantId = variant.id ? String(variant.id) : '';
          const sku = variant.sku || '';
          const price = variant.price ? parseFloat(variant.price) : 0;
          const compareAtPrice = variant.compare_at_price
            ? parseFloat(variant.compare_at_price)
            : 0;
          const weight = variant.weight ? parseFloat(String(variant.weight)) : 0;

          // Handle weight_unit explicitly as a string
          let weightUnit = 'kg';
          if (variant.weight_unit !== undefined && variant.weight_unit !== null) {
            weightUnit = String(variant.weight_unit);
          }

          const inventoryQuantity = variant.inventory_quantity || 0;
          const requiresShipping = variant.requires_shipping || false;
          const title = variant.title || '';
          const option1 = variant.option1 || '';
          const option2 = variant.option2 || '';
          const option3 = variant.option3 || '';

          // Return a properly typed object
          return {
            id: variantId,
            sku,
            price,
            compareAtPrice,
            weight,
            weightUnit,
            inventoryQuantity,
            requiresShipping,
            title,
            option1,
            option2,
            option3,
          };
        }) || [];

      // Extract product options
      const options =
        shopifyProduct.options?.map(option => ({
          id: String(option.id),
          name: option.name,
          values: option.values,
        })) || [];

      // Extract product metafields
      const metafields =
        shopifyProduct.metafields?.map(metafield => ({
          key: metafield.key,
          namespace: metafield.namespace,
          value: metafield.value,
          valueType: metafield.value_type,
        })) || [];

      // Map to our internal format
      return {
        title: shopifyProduct.title,
        description: shopifyProduct.body_html,
        price: parseFloat(shopifyProduct.variants?.[0]?.price || '0'),
        compareAtPrice: parseFloat(shopifyProduct.variants?.[0]?.compare_at_price || '0'),
        inStock:
          shopifyProduct.status === 'active' &&
          shopifyProduct.variants?.some(v => v.inventory_quantity > 0),
        images,
        categories: shopifyProduct.product_type ? [shopifyProduct.product_type] : [],
        tags: shopifyProduct.tags ? shopifyProduct.tags.split(', ') : [],
        brandInfo: {
          name: shopifyProduct.vendor || '',
        },
        platformMetadata: {
          externalId: String(shopifyProduct.id),
          externalSource: 'shopify',
          merchantId,
          handle: shopifyProduct.handle,
          shopifyGid: shopifyProduct.admin_graphql_api_id,
          productType: shopifyProduct.product_type,
          publishedAt: shopifyProduct.published_at,
          createdAt: shopifyProduct.created_at,
          updatedAt: shopifyProduct.updated_at,
          variants,
          options,
          metafields,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error converting Shopify product: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Convert our internal product to Shopify product format
   * @param product Our internal product
   */
  public static toShopifyProduct(product: Record<string, any>): Partial<ShopifyProduct> {
    try {
      if (!product) return null;

      // Extract variants from platformMetadata or create a default one
      const variants = (product.platformMetadata?.variants || []).map(variant => ({
        sku: variant.sku || product.sku,
        price: variant.price || product.price,
        compare_at_price: variant.compareAtPrice,
        weight: variant.weight || 0,
        weight_unit: variant.weightUnit || 'kg',
        inventory_quantity: variant.inventoryQuantity || (product.inStock ? 1 : 0),
        requires_shipping: variant.requiresShipping || true,
        title: variant.title,
        option1: variant.option1,
        option2: variant.option2,
        option3: variant.option3,
      }));

      if (variants.length === 0) {
        variants.push({
          sku: product.sku,
          price: product.price,
          compare_at_price: product.compareAtPrice,
          inventory_quantity: product.inStock ? 1 : 0,
          requires_shipping: true,
        });
      }

      // Extract options from platformMetadata or create default ones
      const options = (product.platformMetadata?.options || []).map(option => ({
        name: option.name,
        values: option.values,
      }));

      // Extract metafields from platformMetadata
      const metafields = (product.platformMetadata?.metafields || []).map(metafield => ({
        key: metafield.key,
        namespace: metafield.namespace,
        value: metafield.value,
        value_type: metafield.valueType,
      }));

      // Map to Shopify format
      const shopifyProduct = {
        title: product.title,
        body_html: product.description,
        vendor: product.brandInfo?.name || '',
        product_type: product.categories?.[0] || '',
        tags: product.tags?.join(', ') || '',
        status: product.inStock ? 'active' : 'draft',
        variants,
        options,
        images: product.images?.map(img => ({ src: img })) || [],
        metafields,
      };

      // Add handle if it exists in platformMetadata
      if (product.platformMetadata?.handle) {
        shopifyProduct['handle'] = product.platformMetadata.handle;
      }

      return shopifyProduct;
    } catch (error) {
      this.logger.error(
        `Error converting to Shopify product: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Convert a Shopify order to our internal order format
   * @param shopifyOrder Order from Shopify API
   * @param merchantId Our internal merchant ID
   */
  public static fromShopifyOrder(
    shopifyOrder: ShopifyOrder,
    merchantId: string,
  ): Record<string, any> {
    try {
      if (!shopifyOrder) return null;

      // Extract line items
      const items =
        shopifyOrder.line_items?.map(item => ({
          productId: item.product_id ? String(item.product_id) : undefined,
          variantId: item.variant_id ? String(item.variant_id) : undefined,
          title: item.title,
          quantity: item.quantity || 1,
          price: parseFloat(item.price || '0'),
          total: parseFloat(item.price || '0') * (item.quantity || 1),
          sku: item.sku || '',
          fulfillmentStatus: item.fulfillment_status || 'unfulfilled',
        })) || [];

      // Extract shipping address
      const shippingAddress = shopifyOrder.shipping_address
        ? {
            name: `${shopifyOrder.shipping_address.first_name || ''} ${shopifyOrder.shipping_address.last_name || ''}`.trim(),
            address1: shopifyOrder.shipping_address.address1 || '',
            address2: shopifyOrder.shipping_address.address2 || '',
            city: shopifyOrder.shipping_address.city || '',
            province: shopifyOrder.shipping_address.province || '',
            zip: shopifyOrder.shipping_address.zip || '',
            country: shopifyOrder.shipping_address.country || '',
            phone: shopifyOrder.shipping_address.phone || '',
          }
        : null;

      // Extract billing address
      const billingAddress = shopifyOrder.billing_address
        ? {
            name: `${shopifyOrder.billing_address.first_name || ''} ${shopifyOrder.billing_address.last_name || ''}`.trim(),
            address1: shopifyOrder.billing_address.address1 || '',
            address2: shopifyOrder.billing_address.address2 || '',
            city: shopifyOrder.billing_address.city || '',
            province: shopifyOrder.billing_address.province || '',
            zip: shopifyOrder.billing_address.zip || '',
            country: shopifyOrder.billing_address.country || '',
            phone: shopifyOrder.billing_address.phone || '',
          }
        : null;

      // Map to our internal format
      return {
        externalId: String(shopifyOrder.id),
        externalSource: 'shopify',
        orderNumber:
          shopifyOrder.name ||
          (shopifyOrder.order_number ? String(shopifyOrder.order_number) : '') ||
          '',
        status: shopifyOrder.financial_status || 'pending',
        fulfillmentStatus: shopifyOrder.fulfillment_status || 'unfulfilled',
        total: parseFloat(shopifyOrder.total_price || '0'),
        subtotal: parseFloat(shopifyOrder.subtotal_price || '0'),
        tax: parseFloat(shopifyOrder.total_tax || '0'),
        shippingCost: parseFloat(shopifyOrder.shipping_lines?.[0]?.price || '0'),
        items,
        currency: shopifyOrder.currency || 'USD',
        customerEmail: shopifyOrder.email || '',
        customerName:
          `${shopifyOrder.customer?.first_name || ''} ${shopifyOrder.customer?.last_name || ''}`.trim(),
        shippingAddress,
        billingAddress,
        note: shopifyOrder.note || '',
        platformMetadata: {
          externalId: String(shopifyOrder.id),
          externalSource: 'shopify',
          merchantId,
          shopifyGid: shopifyOrder.admin_graphql_api_id,
          paymentGateway: shopifyOrder.payment_gateway_names?.[0] || '',
          checkoutId: shopifyOrder.checkout_id ? String(shopifyOrder.checkout_id) : undefined,
          tags: shopifyOrder.tags || '',
          createdAt: shopifyOrder.created_at,
          updatedAt: shopifyOrder.updated_at,
          cancelledAt: shopifyOrder.cancelled_at || null,
          closedAt: shopifyOrder.closed_at || null,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error converting Shopify order: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
