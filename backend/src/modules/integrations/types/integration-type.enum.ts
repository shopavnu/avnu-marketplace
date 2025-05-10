/**
 * Enum representing the integration types supported by the platform.
 * As of May 2025, we have adopted a Shopify-first approach and only support Shopify integration.
 * Other platform types are kept as comments for historical reference.
 */
export enum IntegrationType {
  SHOPIFY = 'shopify',
  // WooCommerce, Magento, BigCommerce and Custom integrations removed as part of Shopify-first approach
  // WOOCOMMERCE = 'woocommerce',
  // MAGENTO = 'magento',
  // BIGCOMMERCE = 'bigcommerce',
  // CUSTOM = 'custom'
}
