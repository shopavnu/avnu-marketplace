import { Repository } from 'typeorm';
import { Merchant } from '../entities/merchant.entity';
import { MerchantBrand } from '../entities/merchant-brand.entity';
import { MerchantProduct } from '../entities/merchant-product.entity';
import { MerchantShipping } from '../entities/merchant-shipping.entity';
export declare class MerchantService {
  private merchantRepository;
  private merchantBrandRepository;
  private merchantProductRepository;
  private merchantShippingRepository;
  constructor(
    merchantRepository: Repository<Merchant>,
    merchantBrandRepository: Repository<MerchantBrand>,
    merchantProductRepository: Repository<MerchantProduct>,
    merchantShippingRepository: Repository<MerchantShipping>,
  );
  findAll(): Promise<Merchant[]>;
  findOne(id: string): Promise<Merchant>;
  findByUserId(userId: string): Promise<Merchant[]>;
  associateWithUser(merchantId: string, userId: string): Promise<Merchant>;
  create(merchantData: Partial<Merchant>): Promise<Merchant>;
  update(id: string, merchantData: Partial<Merchant>): Promise<Merchant>;
  remove(id: string): Promise<boolean>;
  permanentlyRemove(id: string): Promise<boolean>;
  getMerchantBrand(merchantId: string): Promise<MerchantBrand>;
  createOrUpdateMerchantBrand(
    merchantId: string,
    brandData: Partial<MerchantBrand>,
  ): Promise<MerchantBrand>;
  getMerchantProducts(merchantId: string): Promise<MerchantProduct[]>;
  getMerchantProduct(merchantId: string, productId: string): Promise<MerchantProduct>;
  updateProductVisibility(
    merchantId: string,
    productId: string,
    isVisible: boolean,
  ): Promise<MerchantProduct>;
  updateProductPromotion(
    merchantId: string,
    productId: string,
    isPromoted: boolean,
    monthlyAdBudget?: number,
  ): Promise<MerchantProduct>;
  getMerchantShipping(merchantId: string): Promise<MerchantShipping>;
  createOrUpdateMerchantShipping(
    merchantId: string,
    shippingData: Partial<MerchantShipping>,
  ): Promise<MerchantShipping>;
}
