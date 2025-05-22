import { ProductCacheService } from './product-cache.service';
import { ConfigService } from '@nestjs/config';
export declare class CacheWarmingService {
  private readonly productCacheService;
  private readonly configService;
  private readonly logger;
  private readonly isEnabled;
  constructor(productCacheService: ProductCacheService, configService: ConfigService);
  handleHourlyCacheWarming(): Promise<void>;
  handleDailyCacheWarming(): Promise<void>;
  triggerCacheWarming(): Promise<{
    success: boolean;
    message: string;
  }>;
}
