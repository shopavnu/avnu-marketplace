/**
 * Exception thrown when product validation fails
 */
export class ProductValidationException extends Error {
  /**
   * Create a new ProductValidationException
   * @param message Error message
   */
  constructor(message: string = 'Product validation failed') {
    super(message);
    this.name = 'ProductValidationException';
  }
}
