import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { CachePerformanceMonitorService } from '../services/cache-performance-monitor.service';
import { CacheWarmingService } from '../services/cache-warming.service';
import { ProductCacheService } from '../services/product-cache.service';
import { ResilientCacheService } from '../../../common/services';

// Define GraphQL types
class FallbackCacheStats {
  keys: number;
  hits: number;
  misses: number;
  ksize: number;
  vsize: number;
}

class CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  maxRetries: number;
  retryDelay: number;
  monitorInterval: number;
}

class CircuitBreakerMetrics {
  state: string;
  failures: number;
  lastFailureTime: Date | null;
  options: CircuitBreakerOptions;
}

class CacheStats {
  fallback: FallbackCacheStats;
  circuitBreaker: CircuitBreakerMetrics;
}

class CachePerformanceMetrics {
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

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CachePerformanceResolver {
  constructor(
    private readonly cachePerformanceMonitorService: CachePerformanceMonitorService,
    private readonly cacheWarmingService: CacheWarmingService,
    private readonly productCacheService: ProductCacheService,
    private readonly resilientCacheService: ResilientCacheService,
  ) {}

  @Query(() => CachePerformanceMetrics, { name: 'cachePerformanceMetrics' })
  async getCachePerformanceMetrics(): Promise<CachePerformanceMetrics> {
    const metrics = this.cachePerformanceMonitorService.getMetrics();
    const cacheStats = this.resilientCacheService.getStats();

    return {
      ...metrics,
      cacheStats,
    };
  }

  @Mutation(() => Boolean, { name: 'resetCachePerformanceMetrics' })
  async resetCachePerformanceMetrics(): Promise<boolean> {
    this.cachePerformanceMonitorService.resetMetrics();
    return true;
  }

  @Mutation(() => Boolean, { name: 'warmProductCache' })
  async warmCache(): Promise<boolean> {
    const result = await this.cacheWarmingService.triggerCacheWarming();
    return result.success;
  }

  @Mutation(() => Boolean, { name: 'invalidateAllProductCache' })
  async invalidateAllCache(): Promise<boolean> {
    await this.productCacheService.invalidateAllProductsCache();
    return true;
  }

  @Mutation(() => Boolean, { name: 'invalidateProductCache' })
  async invalidateProductCache(@Args('productId') productId: string): Promise<boolean> {
    await this.productCacheService.invalidateProduct(productId);
    return true;
  }

  @Mutation(() => Boolean, { name: 'invalidateMerchantProductCache' })
  async invalidateMerchantCache(@Args('merchantId') merchantId: string): Promise<boolean> {
    await this.productCacheService.invalidateProductsByMerchant(merchantId);
    return true;
  }
}
