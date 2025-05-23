import { Repository } from 'typeorm';
import { MerchantAnalytics } from '../entities/merchant-analytics.entity';
import { ProductService, CategoryService } from '../../products/services';
type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
type SortOrder = 'asc' | 'desc';
export declare class MerchantAnalyticsFilterService {
    private readonly analyticsRepository;
    private readonly productService;
    private readonly categoryService;
    private readonly logger;
    constructor(analyticsRepository: Repository<MerchantAnalytics>, productService: ProductService, categoryService: CategoryService);
    getFilteredAnalytics(merchantId: string, filters: {
        timeFrame?: TimeFrame;
        startDate?: Date;
        endDate?: Date;
        productIds?: string[];
        categoryIds?: string[];
        sortBy?: string;
        sortOrder?: SortOrder;
        page?: number;
        limit?: number;
    }): Promise<{
        data: MerchantAnalytics[];
        total: number;
        page: number;
        limit: number;
    }>;
    getTopPerformingProducts(merchantId: string, metric?: string, timeFrame?: TimeFrame, limit?: number, startDate?: Date, endDate?: Date, categoryIds?: string[]): Promise<any[]>;
    getCategoryPerformance(merchantId: string, metric?: string, timeFrame?: TimeFrame, startDate?: Date, endDate?: Date): Promise<any[]>;
    getProductPerformanceOverTime(merchantId: string, productId: string, metric?: string, timeFrame?: TimeFrame, startDate?: Date, endDate?: Date): Promise<any[]>;
    getCategoryPerformanceOverTime(merchantId: string, categoryId: string, metric?: string, timeFrame?: TimeFrame, startDate?: Date, endDate?: Date): Promise<any[]>;
    compareProducts(merchantId: string, productIds: string[], metric?: string, timeFrame?: TimeFrame, startDate?: Date, endDate?: Date): Promise<any>;
}
export {};
