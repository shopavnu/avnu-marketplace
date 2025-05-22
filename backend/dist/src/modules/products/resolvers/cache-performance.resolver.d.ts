import { CachePerformanceMonitorService } from '../services/cache-performance-monitor.service';
import { CacheWarmingService } from '../services/cache-warming.service';
import { ProductCacheService } from '../services/product-cache.service';
import { ResilientCacheService } from '../../../common/services';
declare class FallbackCacheStats {
  keys: number;
  hits: number;
  misses: number;
  ksize: number;
  vsize: number;
}
declare class CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  maxRetries: number;
  retryDelay: number;
  monitorInterval: number;
}
declare class CircuitBreakerMetrics {
  state: string;
  failures: number;
  lastFailureTime: Date | null;
  options: CircuitBreakerOptions;
}
declare class CacheStats {
  fallback: FallbackCacheStats;
  circuitBreaker: CircuitBreakerMetrics;
}
declare class CachePerformanceMetrics {
  cacheHits: number;
  cacheMisses: number;
  cacheInvalidations: number;
  cacheHitRate: number;
  averageResponseTimeWithCache: number;
  averageResponseTimeWithoutCache: number;
  responseTimeImprovement: number;
  cacheWarmingTime: number;
  lastResetTime: Date;
  cacheStats: CacheStats;
}
export declare class CachePerformanceResolver {
  private readonly cachePerformanceMonitorService;
  private readonly cacheWarmingService;
  private readonly productCacheService;
  private readonly resilientCacheService;
  constructor(
    cachePerformanceMonitorService: CachePerformanceMonitorService,
    cacheWarmingService: CacheWarmingService,
    productCacheService: ProductCacheService,
    resilientCacheService: ResilientCacheService,
  );
  getCachePerformanceMetrics(): Promise<CachePerformanceMetrics>;
  resetCachePerformanceMetrics(): Promise<boolean>;
  warmCache(): Promise<boolean>;
  invalidateAllCache(): Promise<boolean>;
  invalidateProductCache(productId: string): Promise<boolean>;
  invalidateMerchantCache(merchantId: string): Promise<boolean>;
}
export {};
