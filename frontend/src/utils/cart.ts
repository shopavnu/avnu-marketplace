import { ProductSummary } from '@/types/cart';

/**
 * Utility to construct a `ProductSummary` object from a generic product and optional variant / attributes.
 * This keeps Add-to-Cart logic consistent across pages so that Zustand cart store always
 * receives objects in the same shape.
 */
export function createProductSummary(
  product: any,
  variant?: any | null,
  selectedAttributes: Record<string, string> = {},
): ProductSummary {
  return {
    id: variant?.id || product.id,
    title: product.title,
    price: variant?.price ?? product.price,
    image: product.images?.[0] || product.image || '',
    brand: product.brandName || product.brand || 'Unknown',
    slug: product.slug || product.id,
    inStock:
      variant?.inStock ??
      (typeof product.inStock === 'boolean'
        ? product.inStock
        : !!product.quantity && product.quantity > 0),
    attributes: selectedAttributes,
    variant:
      variant
        ? {
            id: variant.id,
            name: variant.name || variant.title || 'Variant',
            value: variant.value || '',
            price: variant.price,
          }
        : undefined,
  };
}
