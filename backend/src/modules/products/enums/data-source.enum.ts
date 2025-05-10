/**
 * Enum representing the different data sources for product imports
 */
export enum DataSource {
  /**
   * Manual data entry
   */
  MANUAL = 'manual',

  /**
   * Shopify platform
   */
  SHOPIFY = 'shopify',

  // WooCommerce support has been removed as part of our Shopify-first approach

  // Etsy support has been completely removed

  /**
   * CSV file import
   */
  CSV = 'csv',

  /**
   * JSON file import
   */
  JSON = 'json',

  /**
   * API import
   */
  API = 'api',

  /**
   * Other data source
   */
  OTHER = 'other',
}
