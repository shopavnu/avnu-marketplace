'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ProductNotFoundException = void 0;
class ProductNotFoundException extends Error {
  constructor(message = 'Product not found') {
    super(message);
    this.name = 'ProductNotFoundException';
  }
}
exports.ProductNotFoundException = ProductNotFoundException;
//# sourceMappingURL=product-not-found.exception.js.map
