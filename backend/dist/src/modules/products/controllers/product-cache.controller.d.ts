import { CacheWarmingService } from '../services/cache-warming.service';
import { ProductCacheService } from '../services/product-cache.service';
export declare class ProductCacheController {
    private readonly cacheWarmingService;
    private readonly productCacheService;
    private readonly logger;
    constructor(cacheWarmingService: CacheWarmingService, productCacheService: ProductCacheService);
    warmCache(): Promise<{
        success: boolean;
        message: string;
    }>;
    invalidateAllCache(): Promise<{
        success: boolean;
        message: string;
    }>;
    invalidateMerchantCache(merchantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
