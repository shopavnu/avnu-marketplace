/**
 * Exception thrown when a product is not found
 */
export class ProductNotFoundException extends Error {
  /**
   * Create a new ProductNotFoundException
   * @param message Error message
   */
  constructor(message: string = 'Product not found') {
    super(message);
    this.name = 'ProductNotFoundException';
  }
}
