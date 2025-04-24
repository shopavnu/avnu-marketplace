import { MerchantAnalyticsService } from '../services/merchant-analytics.service';
import { MerchantService } from '../services/merchant.service';
import { MerchantAnalytics } from '../entities/merchant-analytics.entity';
import { User } from '../../users/entities/user.entity';
export declare class MerchantAnalyticsResolver {
    private readonly analyticsService;
    private readonly merchantService;
    constructor(analyticsService: MerchantAnalyticsService, merchantService: MerchantService);
    merchantAnalytics(merchantId: string, user: User, timeFrame: string, startDate?: Date, endDate?: Date, productId?: string, categoryId?: string): Promise<MerchantAnalytics[]>;
    merchantProductAnalytics(merchantId: string, productId: string, user: User, timeFrame: string, startDate?: Date, endDate?: Date): Promise<MerchantAnalytics[]>;
    merchantCategoryAnalytics(merchantId: string, categoryId: string, user: User, timeFrame: string, startDate?: Date, endDate?: Date): Promise<MerchantAnalytics[]>;
    merchantOverallAnalytics(merchantId: string, user: User, timeFrame: string, startDate?: Date, endDate?: Date): Promise<MerchantAnalytics[]>;
    merchantDemographicData(merchantId: string, timeFrame: string, user: User): Promise<Record<string, number>>;
    merchantTopProducts(merchantId: string, limit: number, timeFrame: string, user: User): Promise<{
        productId: string;
        revenue: number;
        orders: number;
    }[]>;
    private validateMerchantAccess;
}
