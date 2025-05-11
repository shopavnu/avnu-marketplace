import { Merchant } from './merchant.entity';
export declare class MerchantProduct {
  id: string;
  merchantId: string;
  merchant: Merchant;
  productId: string;
  isVisible: boolean;
  isPromoted: boolean;
  monthlyAdBudget: number;
  adSpendToDate: number;
  organicImpressions: number;
  paidImpressions: number;
  conversionRate: number;
  clicks: number;
  cartAdds: number;
  cartAbandons: number;
  enableRetargeting: boolean;
  retargetingBudget: number;
  createdAt: Date;
  updatedAt: Date;
  lastPromotedAt: Date;
}
