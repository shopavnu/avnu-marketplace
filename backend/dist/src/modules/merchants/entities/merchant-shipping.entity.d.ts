import { Merchant } from './merchant.entity';
export declare class MerchantShipping {
    id: string;
    merchantId: string;
    merchant: Merchant;
    offersFreeShipping: boolean;
    freeShippingThreshold: number;
    standardShippingRate: number;
    expeditedShippingRate: number;
    shippingCountries: string[];
    excludedRegions: string[];
    createdAt: Date;
    updatedAt: Date;
}
