import { Merchant } from './merchant.entity';
export declare enum CampaignType {
  PRODUCT_PROMOTION = 'product_promotion',
  RETARGETING = 'retargeting',
  BRAND_AWARENESS = 'brand_awareness',
}
export declare enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}
export declare enum TargetAudience {
  ALL = 'all',
  PREVIOUS_VISITORS = 'previous_visitors',
  CART_ABANDONERS = 'cart_abandoners',
  PREVIOUS_CUSTOMERS = 'previous_customers',
}
export declare class MerchantAdCampaign {
  id: string;
  merchantId: string;
  merchant: Merchant;
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  productIds: string[];
  budget: number;
  spent: number;
  targetAudience: TargetAudience;
  targetDemographics: string[];
  targetLocations: string[];
  targetInterests: string[];
  startDate: Date;
  endDate: Date;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  conversions: number;
  conversionRate: number;
  createdAt: Date;
  updatedAt: Date;
  lastUpdatedByMerchantAt: Date;
}
