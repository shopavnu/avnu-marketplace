"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductValidationException = void 0;
class ProductValidationException extends Error {
    constructor(message = 'Product validation failed') {
        super(message);
        this.name = 'ProductValidationException';
    }
}
exports.ProductValidationException = ProductValidationException;
//# sourceMappingURL=product-validation.exception.js.map