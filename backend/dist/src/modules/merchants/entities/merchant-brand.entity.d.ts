import { Merchant } from './merchant.entity';
export declare class MerchantBrand {
  id: string;
  merchantId: string;
  merchant: Merchant;
  name: string;
  description: string;
  logo: string;
  colorPalette: string[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  brandStory: string;
  foundedYear: number;
  socialMediaLinks: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
