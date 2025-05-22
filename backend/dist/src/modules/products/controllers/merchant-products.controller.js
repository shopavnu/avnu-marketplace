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
Object.defineProperty(exports, '__esModule', { value: true });
exports.MerchantProductsController = void 0;
const common_1 = require('@nestjs/common');
const swagger_1 = require('@nestjs/swagger');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const product_entity_1 = require('../entities/product.entity');
const merchant_auth_guard_1 = require('../../auth/guards/merchant-auth.guard');
let MerchantProductsController = class MerchantProductsController {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }
  async getSuppressedProducts(merchantId, limit = 50) {
    const products = await this.productRepository.find({
      where: {
        merchantId,
        isSuppressed: true,
      },
      take: limit,
      order: {
        lastValidationDate: 'DESC',
      },
    });
    return {
      success: true,
      data: products,
      count: products.length,
    };
  }
};
exports.MerchantProductsController = MerchantProductsController;
__decorate(
  [
    (0, common_1.Get)('suppressed'),
    (0, swagger_1.ApiOperation)({ summary: 'Get suppressed products for a merchant' }),
    (0, swagger_1.ApiParam)({ name: 'merchantId', description: 'Merchant ID' }),
    (0, swagger_1.ApiQuery)({
      name: 'limit',
      description: 'Maximum number of products to return',
      required: false,
    }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: 'List of suppressed products for the merchant',
    }),
    __param(0, (0, common_1.Param)('merchantId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Object]),
    __metadata('design:returntype', Promise),
  ],
  MerchantProductsController.prototype,
  'getSuppressedProducts',
  null,
);
exports.MerchantProductsController = MerchantProductsController = __decorate(
  [
    (0, swagger_1.ApiTags)('merchant-products'),
    (0, common_1.Controller)('merchant/:merchantId/products'),
    (0, common_1.UseGuards)(merchant_auth_guard_1.MerchantAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata('design:paramtypes', [typeorm_2.Repository]),
  ],
  MerchantProductsController,
);
//# sourceMappingURL=merchant-products.controller.js.map
