import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from '../entities/merchant.entity';
import { MerchantBrand } from '../entities/merchant-brand.entity';
import { MerchantProduct } from '../entities/merchant-product.entity';
import { MerchantShipping } from '../entities/merchant-shipping.entity';

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    @InjectRepository(MerchantBrand)
    private merchantBrandRepository: Repository<MerchantBrand>,
    @InjectRepository(MerchantProduct)
    private merchantProductRepository: Repository<MerchantProduct>,
    @InjectRepository(MerchantShipping)
    private merchantShippingRepository: Repository<MerchantShipping>,
  ) {}

  async findAll(): Promise<Merchant[]> {
    return this.merchantRepository.find({ where: { isActive: true } });
  }

  async findOne(id: string): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({ where: { id } });
    if (!merchant) {
      throw new NotFoundException(`Merchant with ID ${id} not found`);
    }
    return merchant;
  }

  async findByUserId(userId: string): Promise<Merchant[]> {
    return this.merchantRepository.find({ where: { userId } });
  }

  /**
   * Associate a merchant with a user
   * @param merchantId Merchant ID
   * @param userId User ID
   * @returns Updated merchant
   */
  async associateWithUser(merchantId: string, userId: string): Promise<Merchant> {
    // Verify merchant exists
    const _merchant = await this.findOne(merchantId); // Prefixed with underscore as it's unused

    // Update the merchant with the user ID
    await this.merchantRepository.update(merchantId, { userId });

    // Return the updated merchant
    return this.findOne(merchantId);
  }

  async create(merchantData: Partial<Merchant>): Promise<Merchant> {
    const merchant = this.merchantRepository.create(merchantData);
    return this.merchantRepository.save(merchant);
  }

  async update(id: string, merchantData: Partial<Merchant>): Promise<Merchant> {
    await this.findOne(id); // Verify merchant exists
    await this.merchantRepository.update(id, merchantData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<boolean> {
    const merchant = await this.findOne(id);
    merchant.isActive = false;
    await this.merchantRepository.save(merchant);
    return true;
  }

  async permanentlyRemove(id: string): Promise<boolean> {
    const result = await this.merchantRepository.delete(id);
    return result.affected > 0;
  }

  // Brand related methods
  async getMerchantBrand(merchantId: string): Promise<MerchantBrand> {
    const brand = await this.merchantBrandRepository.findOne({
      where: { merchantId, isActive: true },
    });

    if (!brand) {
      throw new NotFoundException(`Brand for merchant ${merchantId} not found`);
    }

    return brand;
  }

  async createOrUpdateMerchantBrand(
    merchantId: string,
    brandData: Partial<MerchantBrand>,
  ): Promise<MerchantBrand> {
    // Check if merchant exists
    await this.findOne(merchantId);

    // Check if brand already exists
    let brand = await this.merchantBrandRepository.findOne({
      where: { merchantId },
    });

    if (brand) {
      // Update existing brand
      await this.merchantBrandRepository.update(brand.id, {
        ...brandData,
        merchantId,
      });
      return this.getMerchantBrand(merchantId);
    } else {
      // Create new brand
      brand = this.merchantBrandRepository.create({
        ...brandData,
        merchantId,
      });
      return this.merchantBrandRepository.save(brand);
    }
  }

  // Product related methods
  async getMerchantProducts(merchantId: string): Promise<MerchantProduct[]> {
    return this.merchantProductRepository.find({
      where: { merchantId },
    });
  }

  async getMerchantProduct(merchantId: string, productId: string): Promise<MerchantProduct> {
    const merchantProduct = await this.merchantProductRepository.findOne({
      where: { merchantId, productId },
    });

    if (!merchantProduct) {
      throw new NotFoundException(`Product ${productId} for merchant ${merchantId} not found`);
    }

    return merchantProduct;
  }

  async updateProductVisibility(
    merchantId: string,
    productId: string,
    isVisible: boolean,
  ): Promise<MerchantProduct> {
    // Check if merchant exists
    await this.findOne(merchantId);

    // Check if merchant product exists
    let merchantProduct = await this.merchantProductRepository.findOne({
      where: { merchantId, productId },
    });

    if (merchantProduct) {
      // Update existing record
      await this.merchantProductRepository.update(merchantProduct.id, {
        isVisible,
      });
      return this.getMerchantProduct(merchantId, productId);
    } else {
      // Create new record
      merchantProduct = this.merchantProductRepository.create({
        merchantId,
        productId,
        isVisible,
      });
      return this.merchantProductRepository.save(merchantProduct);
    }
  }

  async updateProductPromotion(
    merchantId: string,
    productId: string,
    isPromoted: boolean,
    monthlyAdBudget?: number,
  ): Promise<MerchantProduct> {
    // Check if merchant exists
    await this.findOne(merchantId);

    // Check if merchant product exists
    let merchantProduct = await this.merchantProductRepository.findOne({
      where: { merchantId, productId },
    });

    if (merchantProduct) {
      // Update existing record
      await this.merchantProductRepository.update(merchantProduct.id, {
        isPromoted,
        monthlyAdBudget,
        lastPromotedAt: isPromoted ? new Date() : merchantProduct.lastPromotedAt,
      });
      return this.getMerchantProduct(merchantId, productId);
    } else {
      // Create new record
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

  // Shipping related methods
  async getMerchantShipping(merchantId: string): Promise<MerchantShipping> {
    const shipping = await this.merchantShippingRepository.findOne({
      where: { merchantId },
    });

    if (!shipping) {
      throw new NotFoundException(`Shipping settings for merchant ${merchantId} not found`);
    }

    return shipping;
  }

  async createOrUpdateMerchantShipping(
    merchantId: string,
    shippingData: Partial<MerchantShipping>,
  ): Promise<MerchantShipping> {
    // Check if merchant exists
    await this.findOne(merchantId);

    // Check if shipping settings already exist
    let shipping = await this.merchantShippingRepository.findOne({
      where: { merchantId },
    });

    if (shipping) {
      // Update existing settings
      await this.merchantShippingRepository.update(shipping.id, {
        ...shippingData,
        merchantId,
      });
      return this.getMerchantShipping(merchantId);
    } else {
      // Create new settings
      shipping = this.merchantShippingRepository.create({
        ...shippingData,
        merchantId,
      });
      return this.merchantShippingRepository.save(shipping);
    }
  }
}
