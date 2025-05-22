import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import NodeCache from 'node-cache';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

/**
 * Options for cache operations
 */
interface CacheOptions {
  // Time-to-live in seconds
  ttl?: number;

  // Should this be cached in-memory as well?
  useMemoryCache?: boolean;

  // Priority of this cache item (higher = stays in memory longer)
  priority?: number;
}

/**
 * Cache key parts
 */
interface CacheKeyParts {
  namespace: string;
  merchantId: string;
  resource: string;
  id?: string;
  subResource?: string;
}

/**
 * Multi-level cache for Shopify data
 *
 * Provides a layered caching approach with:
 * 1. In-memory cache (fastest, but limited size)
 * 2. Redis cache (slower than memory, but shared across instances)
 *
 * Implements cache invalidation strategies for efficient updates.
 */
@Injectable()
export class ShopifyCacheManager {
  private readonly logger = new Logger(ShopifyCacheManager.name);
  private memoryCache: NodeCache;

  // Default TTL values in seconds
  private readonly DEFAULT_MEMORY_TTL = 60; // 1 minute
  private readonly DEFAULT_REDIS_TTL = 300; // 5 minutes

  // Should we use Redis?
  private readonly useRedis: boolean;

  constructor(
    private configService: ConfigService,
    @InjectRedis() private readonly redisClient: Redis,
  ) {
    // Initialize memory cache
    this.memoryCache = new NodeCache({
      stdTTL: this.DEFAULT_MEMORY_TTL,
      checkperiod: 60,
      useClones: false, // For better performance
      maxKeys: 10000, // Limit memory usage
    });

    // Check if Redis is enabled
    this.useRedis = this.configService.get<boolean>('CACHE_REDIS_ENABLED', true);

    if (this.useRedis) {
      try {
        this.logger.log('Redis cache initialized');
      } catch (error) {
        this.logger.error(`Failed to initialize Redis cache: ${error.message}`);
        this.useRedis = false;
      }
    }

    // Set up listeners for cache events
    this.memoryCache.on('expired', (key, _value) => {
      this.logger.debug(`Memory cache item expired: ${key}`);
    });

    // Periodically report cache stats
    setInterval(() => this.logCacheStats(), 300000); // Every 5 minutes
  }

  /**
   * Get data from cache with fallback to data source
   *
   * @param keyParts Parts to build the cache key
   * @param dataFetcher Function to fetch data if not in cache
   * @param options Cache options
   * @returns Promise with the data
   */
  async getOrFetch<T>(
    keyParts: CacheKeyParts,
    dataFetcher: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    const cacheKey = this.buildCacheKey(keyParts);

    // Try memory cache first (fastest)
    const memoryResult = this.getFromMemoryCache<T>(cacheKey);
    if (memoryResult !== undefined) {
      this.logger.debug(`Memory cache hit: ${cacheKey}`);
      return memoryResult;
    }

    // Try Redis cache next (if enabled)
    if (this.useRedis) {
      const redisResult = await this.getFromRedisCache<T>(cacheKey);
      if (redisResult !== undefined) {
        this.logger.debug(`Redis cache hit: ${cacheKey}`);

        // Update memory cache with Redis result
        const memoryTtl = options.ttl || this.DEFAULT_MEMORY_TTL;
        this.setInMemoryCache(cacheKey, redisResult, memoryTtl);

        return redisResult;
      }
    }

    // Cache miss - fetch from source
    this.logger.debug(`Cache miss: ${cacheKey}`);
    try {
      const fetchedData = await dataFetcher();

      // Store in cache if we got valid data
      if (fetchedData !== undefined && fetchedData !== null) {
        this.set(keyParts, fetchedData, options);
      }

      return fetchedData;
    } catch (error) {
      this.logger.error(`Error fetching data for cache key ${cacheKey}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Set a value in the cache
   */
  async set<T>(keyParts: CacheKeyParts, data: T, options: CacheOptions = {}): Promise<void> {
    const cacheKey = this.buildCacheKey(keyParts);
    const useMemory = options.useMemoryCache !== false;

    // Set in memory cache
    if (useMemory) {
      const memoryTtl = options.ttl || this.DEFAULT_MEMORY_TTL;
      this.setInMemoryCache(cacheKey, data, memoryTtl);
    }

    // Set in Redis cache
    if (this.useRedis) {
      const redisTtl = options.ttl || this.DEFAULT_REDIS_TTL;
      await this.setInRedisCache(cacheKey, data, redisTtl);
    }
  }

  /**
   * Remove a value from the cache
   */
  async invalidate(keyParts: CacheKeyParts): Promise<void> {
    const cacheKey = this.buildCacheKey(keyParts);

    // Remove from memory cache
    this.memoryCache.del(cacheKey);

    // Remove from Redis cache
    if (this.useRedis) {
      await this.redisClient.del(cacheKey);
    }

    this.logger.debug(`Invalidated cache key: ${cacheKey}`);
  }

  /**
   * Invalidate all cache entries for a specific merchant
   */
  async invalidateForMerchant(merchantId: string): Promise<void> {
    const pattern = `shopify:${merchantId}:*`;

    // For memory cache, we need to iterate all keys
    const memoryKeys = this.memoryCache.keys();
    const keysToDelete = memoryKeys.filter(key => key.includes(`shopify:${merchantId}:`));

    keysToDelete.forEach(key => {
      this.memoryCache.del(key);
    });

    // For Redis, we can use key pattern matching
    if (this.useRedis) {
      const redisKeys = await this.redisClient.keys(pattern);

      if (redisKeys.length > 0) {
        await this.redisClient.del(...redisKeys);
      }
    }

    this.logger.log(`Invalidated all cache entries for merchant: ${merchantId}`);
  }

  /**
   * Invalidate all cache entries for a specific resource type
   */
  async invalidateResource(merchantId: string, resource: string): Promise<void> {
    const pattern = `shopify:${merchantId}:${resource}:*`;

    // For memory cache, need to iterate all keys
    const memoryKeys = this.memoryCache.keys();
    const keysToDelete = memoryKeys.filter(key =>
      key.startsWith(`shopify:${merchantId}:${resource}:`),
    );

    keysToDelete.forEach(key => {
      this.memoryCache.del(key);
    });

    // For Redis, we can use key pattern matching
    if (this.useRedis) {
      const redisKeys = await this.redisClient.keys(pattern);

      if (redisKeys.length > 0) {
        await this.redisClient.del(...redisKeys);
      }
    }

    this.logger.log(
      `Invalidated all cache entries for merchant ${merchantId} and resource ${resource}`,
    );
  }

  /**
   * Build a standardized cache key from parts
   */
  private buildCacheKey(keyParts: CacheKeyParts): string {
    let key = `shopify:${keyParts.merchantId}:${keyParts.resource}`;

    if (keyParts.id) {
      key += `:${keyParts.id}`;

      if (keyParts.subResource) {
        key += `:${keyParts.subResource}`;
      }
    }

    return key;
  }

  /**
   * Get a value from the memory cache
   */
  private getFromMemoryCache<T>(key: string): T | undefined {
    return this.memoryCache.get<T>(key);
  }

  /**
   * Set a value in the memory cache
   */
  private setInMemoryCache<T>(key: string, value: T, ttl: number): boolean {
    return this.memoryCache.set(key, value, ttl);
  }

  /**
   * Get a value from the Redis cache
   */
  private async getFromRedisCache<T>(key: string): Promise<T | undefined> {
    if (!this.useRedis) return undefined;

    try {
      const value = await this.redisClient.get(key);

      if (!value) return undefined;

      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Redis cache get error for key ${key}: ${error.message}`);
      return undefined;
    }
  }

  /**
   * Set a value in the Redis cache
   */
  private async setInRedisCache(key: string, _value: any, _ttl?: number): Promise<void> {
    if (!this.useRedis) return;

    try {
      const serialized = JSON.stringify(_value);
      await this.redisClient.set(key, serialized, 'EX', _ttl);
    } catch (error) {
      this.logger.error(`Redis cache set error for key ${key}: ${error.message}`);
    }
  }

  /**
   * Log cache statistics
   */
  private logCacheStats(): void {
    const memStats = this.memoryCache.getStats();

    this.logger.debug('Cache statistics', {
      memoryKeys: this.memoryCache.keys().length,
      memoryHits: memStats.hits,
      memoryMisses: memStats.misses,
      memoryHitRate: memStats.hits / (memStats.hits + memStats.misses || 1),
    });
  }

  /**
   * Prefetch common data for a merchant to warm up the cache
   */
  async warmupCache(merchantId: string, _shopDomain: string): Promise<void> {
    // This would need to be implemented based on your specific needs
    // For example, prefetching product categories, common settings, etc.
    this.logger.log(`Warming cache for merchant ${merchantId}`);
  }
}
