/**
 * Interface for structured data (JSON-LD)
 */
export interface StructuredData {
  /**
   * JSON-LD context
   */
  '@context': string;

  /**
   * JSON-LD type
   */
  '@type': string;

  /**
   * Product name
   */
  name?: string;

  /**
   * Product description
   */
  description?: string;

  /**
   * Product brand
   */
  brand?: {
    '@type': string;
    name: string;
  };

  /**
   * Product images
   */
  image?: string[];

  /**
   * Product offers
   */
  offers?: {
    '@type': string;
    price?: number;
    priceCurrency?: string;
    availability?: string;
  };

  /**
   * Additional properties as needed
   */
  [key: string]: unknown;
}
