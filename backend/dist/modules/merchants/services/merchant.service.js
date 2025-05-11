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
exports.MerchantService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const merchant_entity_1 = require('../entities/merchant.entity');
const merchant_brand_entity_1 = require('../entities/merchant-brand.entity');
const merchant_product_entity_1 = require('../entities/merchant-product.entity');
const merchant_shipping_entity_1 = require('../entities/merchant-shipping.entity');
let MerchantService = class MerchantService {
  constructor(
    merchantRepository,
    merchantBrandRepository,
    merchantProductRepository,
    merchantShippingRepository,
  ) {
    this.merchantRepository = merchantRepository;
    this.merchantBrandRepository = merchantBrandRepository;
    this.merchantProductRepository = merchantProductRepository;
    this.merchantShippingRepository = merchantShippingRepository;
  }
  async findAll() {
    return this.merchantRepository.find({ where: { isActive: true } });
  }
  async findOne(id) {
    const merchant = await this.merchantRepository.findOne({ where: { id } });
    if (!merchant) {
      throw new common_1.NotFoundException(`Merchant with ID ${id} not found`);
    }
    return merchant;
  }
  async findByUserId(userId) {
    return this.merchantRepository.find({ where: { userId } });
  }
  async associateWithUser(merchantId, userId) {
    const _merchant = await this.findOne(merchantId);
    await this.merchantRepository.update(merchantId, { userId });
    return this.findOne(merchantId);
  }
  async create(merchantData) {
    const merchant = this.merchantRepository.create(merchantData);
    return this.merchantRepository.save(merchant);
  }
  async update(id, merchantData) {
    await this.findOne(id);
    await this.merchantRepository.update(id, merchantData);
    return this.findOne(id);
  }
  async remove(id) {
    const merchant = await this.findOne(id);
    merchant.isActive = false;
    await this.merchantRepository.save(merchant);
    return true;
  }
  async permanentlyRemove(id) {
    const result = await this.merchantRepository.delete(id);
    return result.affected > 0;
  }
  async getMerchantBrand(merchantId) {
    const brand = await this.merchantBrandRepository.findOne({
      where: { merchantId, isActive: true },
    });
    if (!brand) {
      throw new common_1.NotFoundException(`Brand for merchant ${merchantId} not found`);
    }
    return brand;
  }
  async createOrUpdateMerchantBrand(merchantId, brandData) {
    await this.findOne(merchantId);
    let brand = await this.merchantBrandRepository.findOne({
      where: { merchantId },
    });
    if (brand) {
      await this.merchantBrandRepository.update(brand.id, {
        ...brandData,
        merchantId,
      });
      return this.getMerchantBrand(merchantId);
    } else {
      brand = this.merchantBrandRepository.create({
        ...brandData,
        merchantId,
      });
      return this.merchantBrandRepository.save(brand);
    }
  }
  async getMerchantProducts(merchantId) {
    return this.merchantProductRepository.find({
      where: { merchantId },
    });
  }
  async getMerchantProduct(merchantId, productId) {
    const merchantProduct = await this.merchantProductRepository.findOne({
      where: { merchantId, productId },
    });
    if (!merchantProduct) {
      throw new common_1.NotFoundException(
        `Product ${productId} for merchant ${merchantId} not found`,
      );
    }
    return merchantProduct;
  }
  async updateProductVisibility(merchantId, productId, isVisible) {
    await this.findOne(merchantId);
    let merchantProduct = await this.merchantProductRepository.findOne({
      where: { merchantId, productId },
    });
    if (merchantProduct) {
      await this.merchantProductRepository.update(merchantProduct.id, {
        isVisible,
      });
      return this.getMerchantProduct(merchantId, productId);
    } else {
      merchantProduct = this.merchantProductRepository.create({
        merchantId,
        productId,
        isVisible,
      });
      return this.merchantProductRepository.save(merchantProduct);
    }
  }
  async updateProductPromotion(merchantId, productId, isPromoted, monthlyAdBudget) {
    await this.findOne(merchantId);
    let merchantProduct = await this.merchantProductRepository.findOne({
      where: { merchantId, productId },
    });
    if (merchantProduct) {
      await this.merchantProductRepository.update(merchantProduct.id, {
        isPromoted,
        monthlyAdBudget,
        lastPromotedAt: isPromoted ? new Date() : merchantProduct.lastPromotedAt,
      });
      return this.getMerchantProduct(merchantId, productId);
    } else {
      merchantProduct = this.merchantProductRepository.create({
        merchantId,
        productId,
        isPromoted,
        monthlyAdBudget,
        lastPromotedAt: isPromoted ? new Date() : null,
      });
      return this.merchantProductRepository.save(merchantProduct);
    }
  }
  async getMerchantShipping(merchantId) {
    const shipping = await this.merchantShippingRepository.findOne({
      where: { merchantId },
    });
    if (!shipping) {
      throw new common_1.NotFoundException(
        `Shipping settings for merchant ${merchantId} not found`,
      );
    }
    return shipping;
  }
  async createOrUpdateMerchantShipping(merchantId, shippingData) {
    await this.findOne(merchantId);
    let shipping = await this.merchantShippingRepository.findOne({
      where: { merchantId },
    });
    if (shipping) {
      await this.merchantShippingRepository.update(shipping.id, {
        ...shippingData,
        merchantId,
      });
      return this.getMerchantShipping(merchantId);
    } else {
      shipping = this.merchantShippingRepository.create({
        ...shippingData,
        merchantId,
      });
      return this.merchantShippingRepository.save(shipping);
    }
  }
};
exports.MerchantService = MerchantService;
exports.MerchantService = MerchantService = __decorate(
  [
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(merchant_entity_1.Merchant)),
    __param(1, (0, typeorm_1.InjectRepository)(merchant_brand_entity_1.MerchantBrand)),
    __param(2, (0, typeorm_1.InjectRepository)(merchant_product_entity_1.MerchantProduct)),
    __param(3, (0, typeorm_1.InjectRepository)(merchant_shipping_entity_1.MerchantShipping)),
    __metadata('design:paramtypes', [
      typeorm_2.Repository,
      typeorm_2.Repository,
      typeorm_2.Repository,
      typeorm_2.Repository,
    ]),
  ],
  MerchantService,
);
//# sourceMappingURL=merchant.service.js.map
