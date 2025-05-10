import { registerEnumType } from '@nestjs/graphql';

/**
 * PlatformType enum
 *
 * Defines the possible external platform types that can be integrated with the Avnu Marketplace.
 * Used for identifying the source/destination of products, orders, and other synchronized data.
 *
 * As of May 2025, Avnu has adopted a Shopify-first approach, focusing exclusively on Shopify integration.
 * Other platform types are kept for reference and potential future expansion.
 */
export enum PlatformType {
  /**
   * Shopify platform (primary integration platform)
   */
  SHOPIFY = 'shopify',

  /**
   * Magento platform
   */
  MAGENTO = 'magento',

  /**
   * BigCommerce platform
   */
  BIGCOMMERCE = 'bigcommerce',

  /**
   * PrestaShop platform
   */
  PRESTASHOP = 'prestashop',

  /**
   * Custom platform
   */
  CUSTOM = 'custom',

  /**
   * Manual entry (no external platform)
   */
  MANUAL = 'manual',
}

// Register the enum with GraphQL
registerEnumType(PlatformType, {
  name: 'PlatformType',
  description: 'External platform types that can be integrated with Avnu Marketplace',
});
