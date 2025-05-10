import { Logger } from '@nestjs/common';

/**
 * Adapter for converting between Shopify product format and our internal format
 *
 * Shopify API Reference: https://shopify.dev/api/admin-rest/current/resources/product
 */
export class ShopifyAdapter {
  private static readonly logger = new Logger(ShopifyAdapter.name);

  /**
   * Convert a Shopify product to our internal product format
   * @param shopifyProduct Product from Shopify API
   * @param merchantId Our internal merchant ID
   */
  public static fromShopifyProduct(shopifyProduct: unknown, merchantId: string): unknown {
    try {
      if (!shopifyProduct) return null;

      // Extract product images
      const images = shopifyProduct.images?.map(img => img.src) || [];

      // Extract product variants
      const variants =
        shopifyProduct.variants?.map(variant => ({
          id: variant.id.toString(),
          sku: variant.sku || '',
          price: parseFloat(variant.price || '0'),
          compareAtPrice: parseFloat(variant.compare_at_price || '0'),
          weight: parseFloat(variant.weight || '0'),
          weightUnit: variant.weight_unit || 'kg',
          inventoryQuantity: variant.inventory_quantity || 0,
          requiresShipping: variant.requires_shipping || false,
          title: variant.title,
          option1: variant.option1,
          option2: variant.option2,
          option3: variant.option3,
        })) || [];

      // Extract product options
      const options =
        shopifyProduct.options?.map(option => ({
          id: option.id.toString(),
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
          externalId: shopifyProduct.id.toString(),
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
  public static toShopifyProduct(product: unknown): unknown {
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
  public static fromShopifyOrder(shopifyOrder: unknown, merchantId: string): unknown {
    try {
      if (!shopifyOrder) return null;

      // Extract line items
      const items =
        shopifyOrder.line_items?.map(item => ({
          productId: item.product_id?.toString(),
          variantId: item.variant_id?.toString(),
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
        externalId: shopifyOrder.id.toString(),
        externalSource: 'shopify',
        orderNumber: shopifyOrder.name || shopifyOrder.order_number?.toString() || '',
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
          externalId: shopifyOrder.id.toString(),
          externalSource: 'shopify',
          merchantId,
          shopifyGid: shopifyOrder.admin_graphql_api_id,
          paymentGateway: shopifyOrder.payment_gateway_names?.[0] || '',
          checkoutId: shopifyOrder.checkout_id?.toString(),
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
