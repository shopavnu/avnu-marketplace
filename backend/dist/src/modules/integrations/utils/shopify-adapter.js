"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyAdapter = void 0;
const common_1 = require("@nestjs/common");
class ShopifyAdapter {
    static ensureString(value, defaultValue = '') {
        if (value === null || value === undefined)
            return defaultValue;
        return String(value);
    }
    static fromShopifyProduct(shopifyProduct, merchantId) {
        try {
            if (!shopifyProduct)
                return null;
            const images = shopifyProduct.images?.map(img => img.src) || [];
            const variants = shopifyProduct.variants?.map(variant => {
                const variantId = variant.id ? String(variant.id) : '';
                const sku = variant.sku || '';
                const price = variant.price ? parseFloat(variant.price) : 0;
                const compareAtPrice = variant.compare_at_price
                    ? parseFloat(variant.compare_at_price)
                    : 0;
                const weight = variant.weight ? parseFloat(String(variant.weight)) : 0;
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
            const options = shopifyProduct.options?.map(option => ({
                id: String(option.id),
                name: option.name,
                values: option.values,
            })) || [];
            const metafields = shopifyProduct.metafields?.map(metafield => ({
                key: metafield.key,
                namespace: metafield.namespace,
                value: metafield.value,
                valueType: metafield.value_type,
            })) || [];
            return {
                title: shopifyProduct.title,
                description: shopifyProduct.body_html,
                price: parseFloat(shopifyProduct.variants?.[0]?.price || '0'),
                compareAtPrice: parseFloat(shopifyProduct.variants?.[0]?.compare_at_price || '0'),
                inStock: shopifyProduct.status === 'active' &&
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
        }
        catch (error) {
            this.logger.error(`Error converting Shopify product: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    static toShopifyProduct(product) {
        try {
            if (!product)
                return null;
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
            const options = (product.platformMetadata?.options || []).map(option => ({
                name: option.name,
                values: option.values,
            }));
            const metafields = (product.platformMetadata?.metafields || []).map(metafield => ({
                key: metafield.key,
                namespace: metafield.namespace,
                value: metafield.value,
                value_type: metafield.valueType,
            }));
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
            if (product.platformMetadata?.handle) {
                shopifyProduct['handle'] = product.platformMetadata.handle;
            }
            return shopifyProduct;
        }
        catch (error) {
            this.logger.error(`Error converting to Shopify product: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    static fromShopifyOrder(shopifyOrder, merchantId) {
        try {
            if (!shopifyOrder)
                return null;
            const items = shopifyOrder.line_items?.map(item => ({
                productId: item.product_id ? String(item.product_id) : undefined,
                variantId: item.variant_id ? String(item.variant_id) : undefined,
                title: item.title,
                quantity: item.quantity || 1,
                price: parseFloat(item.price || '0'),
                total: parseFloat(item.price || '0') * (item.quantity || 1),
                sku: item.sku || '',
                fulfillmentStatus: item.fulfillment_status || 'unfulfilled',
            })) || [];
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
            return {
                externalId: String(shopifyOrder.id),
                externalSource: 'shopify',
                orderNumber: shopifyOrder.name ||
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
                customerName: `${shopifyOrder.customer?.first_name || ''} ${shopifyOrder.customer?.last_name || ''}`.trim(),
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
        }
        catch (error) {
            this.logger.error(`Error converting Shopify order: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
}
exports.ShopifyAdapter = ShopifyAdapter;
ShopifyAdapter.logger = new common_1.Logger(ShopifyAdapter.name);
//# sourceMappingURL=shopify-adapter.js.map