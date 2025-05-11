/**
 * Data transfer object for product images
 */
export class ProductImageDto {
  /**
   * URL of the image
   */
  url: string;

  /**
   * Width of the image in pixels
   */
  width?: number;

  /**
   * Height of the image in pixels
   */
  height?: number;

  /**
   * Alternative text for the image
   */
  altText?: string;

  /**
   * Position order of the image
   */
  position?: number;
}
