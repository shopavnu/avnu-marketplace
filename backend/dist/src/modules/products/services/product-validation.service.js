'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var ProductValidationService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ProductValidationService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const event_emitter_1 = require('@nestjs/event-emitter');
const product_entity_1 = require('../entities/product.entity');
const merchant_entity_1 = require('../../merchants/entities/merchant.entity');
let ProductValidationService = (ProductValidationService_1 = class ProductValidationService {
  constructor(productRepository, merchantRepository, eventEmitter) {
    this.productRepository = productRepository;
    this.merchantRepository = merchantRepository;
    this.eventEmitter = eventEmitter;
    this.logger = new common_1.Logger(ProductValidationService_1.name);
  }
  async validateProduct(product) {
    const issues = [];
    const suppressedFrom = [];
    if (!product.images || product.images.length === 0) {
      issues.push('Missing product images');
      suppressedFrom.push('search results');
      suppressedFrom.push('product recommendations');
    }
    if (!product.title || product.title.trim() === '') {
      issues.push('Missing product title');
      suppressedFrom.push('search results');
      suppressedFrom.push('product recommendations');
      suppressedFrom.push('category pages');
    }
    if (product.price === undefined || product.price === null) {
      issues.push('Missing product price');
      suppressedFrom.push('search results');
      suppressedFrom.push('product recommendations');
    }
    if (!product.description || product.description.trim() === '') {
      issues.push('Missing product description');
    }
    if (!product.brandName || product.brandName.trim() === '') {
      issues.push('Missing brand name');
    }
    if (suppressedFrom.length > 0) {
      await this.updateProductSuppressionStatus(product.id, true, suppressedFrom);
    } else if (product.isSuppressed) {
      await this.updateProductSuppressionStatus(product.id, false, []);
    }
    return {
      isValid: issues.length === 0,
      issues,
      suppressedFrom,
    };
  }
  async updateProductSuppressionStatus(productId, isSuppressed, suppressedFrom) {
    try {
      await this.productRepository.update(
        { id: productId },
        {
          isSuppressed,
          suppressedFrom: suppressedFrom.length > 0 ? suppressedFrom : null,
          lastValidationDate: new Date(),
        },
      );
      this.logger.log(
        `Updated product ${productId} suppression status: ${isSuppressed ? 'Suppressed' : 'Visible'}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update product suppression status: ${error.message}`,
        error.stack,
      );
    }
  }
  async validateMerchantProducts(merchantId) {
    try {
      const products = await this.productRepository.find({
        where: { merchantId },
      });
      if (!products || products.length === 0) {
        this.logger.log(`No products found for merchant ${merchantId}`);
        return;
      }
      const productIssues = [];
      for (const product of products) {
        const validation = await this.validateProduct(product);
        if (validation.issues.length > 0) {
          productIssues.push({
            productId: product.id,
            productTitle: product.title || 'Untitled Product',
            merchantId,
            issues: validation.issues,
            suppressedFrom: validation.suppressedFrom,
          });
        }
      }
      if (productIssues.length > 0) {
        const merchant = await this.merchantRepository.findOne({
          where: { id: merchantId },
        });
        if (merchant) {
          this.eventEmitter.emit('merchant.product.issues', {
            merchantId,
            merchantEmail: merchant.email,
            productIssues,
          });
          this.logger.log(
            `Emitted product issues notification event for merchant ${merchantId} with ${productIssues.length} affected products`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to validate products for merchant ${merchantId}: ${error.message}`,
        error.stack,
      );
    }
  }
  async validateAllProducts() {
    try {
      const merchants = await this.merchantRepository.find();
      for (const merchant of merchants) {
        await this.validateMerchantProducts(merchant.id);
      }
      this.logger.log(`Completed validation of all products for ${merchants.length} merchants`);
    } catch (error) {
      this.logger.error(`Failed to validate all products: ${error.message}`, error.stack);
    }
  }
});
exports.ProductValidationService = ProductValidationService;
exports.ProductValidationService =
  ProductValidationService =
  ProductValidationService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
        __param(1, (0, typeorm_1.InjectRepository)(merchant_entity_1.Merchant)),
        __metadata('design:paramtypes', [
          typeorm_2.Repository,
          typeorm_2.Repository,
          event_emitter_1.EventEmitter2,
        ]),
      ],
      ProductValidationService,
    );
//# sourceMappingURL=product-validation.service.js.map
