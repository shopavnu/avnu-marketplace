import { Merchant } from './merchant.entity';
export declare class MerchantAnalytics {
    id: string;
    merchantId: string;
    merchant: Merchant;
    productId: string;
    categoryId: string;
    date: Date;
    timeFrame: string;
    revenue: number;
    orders: number;
    productViews: number;
    organicImpressions: number;
    paidImpressions: number;
    clicks: number;
    addToCarts: number;
    abandonedCarts: number;
    conversionRate: number;
    clickThroughRate: number;
    demographics: string[];
    createdAt: Date;
    updatedAt: Date;
}
