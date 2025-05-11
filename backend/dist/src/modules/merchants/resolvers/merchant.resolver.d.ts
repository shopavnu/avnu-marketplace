import { MerchantService } from '../services/merchant.service';
import { Merchant } from '../entities/merchant.entity';
import { MerchantBrand } from '../entities/merchant-brand.entity';
import { MerchantProduct } from '../entities/merchant-product.entity';
import { MerchantShipping } from '../entities/merchant-shipping.entity';
import { User } from '../../users/entities/user.entity';
import {
  CreateMerchantInput,
  UpdateMerchantInput,
  CreateMerchantBrandInput,
  UpdateMerchantShippingInput,
} from '../dto';
export declare class MerchantResolver {
  private readonly merchantService;
  constructor(merchantService: MerchantService);
  merchants(): Promise<Merchant[]>;
  merchant(id: string): Promise<Merchant>;
  myMerchants(_user: User): Promise<Merchant[]>;
  createMerchant(input: CreateMerchantInput, _user: User): Promise<Merchant>;
  updateMerchant(id: string, input: UpdateMerchantInput, user: User): Promise<Merchant>;
  removeMerchant(id: string, user: User): Promise<boolean>;
  merchantBrand(merchantId: string, user: User): Promise<MerchantBrand>;
  createOrUpdateMerchantBrand(
    merchantId: string,
    input: CreateMerchantBrandInput,
    user: User,
  ): Promise<MerchantBrand>;
  merchantProducts(merchantId: string, user: User): Promise<MerchantProduct[]>;
  updateProductVisibility(
    merchantId: string,
    productId: string,
    isVisible: boolean,
    user: User,
  ): Promise<MerchantProduct>;
  updateProductPromotion(
    merchantId: string,
    productId: string,
    isPromoted: boolean,
    user: User,
    monthlyAdBudget?: number,
  ): Promise<MerchantProduct>;
  merchantShipping(merchantId: string, user: User): Promise<MerchantShipping>;
  updateMerchantShipping(
    merchantId: string,
    input: UpdateMerchantShippingInput,
    user: User,
  ): Promise<MerchantShipping>;
}
