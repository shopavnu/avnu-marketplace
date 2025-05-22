import { StructuredData } from './structured-data.interface';

/**
 * Interface for product accessibility metadata
 */
export interface AccessibilityMetadata {
  /**
   * Alt text for the primary product image
   */
  altText?: string;

  /**
   * ARIA label for the product
   */
  ariaLabel?: string;

  /**
   * ARIA role for the product
   */
  role?: string;

  /**
   * Long description for the product (for screen readers)
   */
  longDescription?: string;

  /**
   * Structured data for the product (JSON-LD)
   */
  structuredData?: StructuredData;
}
