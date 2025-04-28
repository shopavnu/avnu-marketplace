import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { Cache } from 'cache-manager'; // Not directly used due to typing issues
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { CircuitBreakerService } from './circuit-breaker.service';
// Use require for NodeCache to avoid TypeScript module issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const NodeCache = require('node-cache');

/**
 * A cache service that uses Redis with circuit breaker pattern for resilience
 * Falls back to in-memory cache when Redis is unavailable
 */
@Injectable()
export class ResilientCacheService {
  private readonly logger = new Logger(ResilientCacheService.name);
  private readonly fallbackCache: any; // Using any for NodeCache to avoid TypeScript issues
  private readonly defaultTTL: number;

  constructor(
    @Inject(CACHE_MANAGER) private readonly primaryCache: any,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {
    // Create in-memory fallback cache
    this.fallbackCache = new NodeCache({
      stdTTL: this.configService.get<number>('FALLBACK_CACHE_TTL', 300), // 5 minutes
      checkperiod: 60, // Check for expired keys every 60 seconds
      maxKeys: this.configService.get<number>('FALLBACK_CACHE_MAX_KEYS', 1000),
    });

    this.defaultTTL = this.configService.get<number>('REDIS_TTL', 3600); // 1 hour default

    this.logger.log(
      'Resilient cache service initialized with Redis primary and in-memory fallback',
    );
  }

  /**
   * Get a value from cache with circuit breaker protection
   * @param key Cache key
   * @returns Cached value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    return this.circuitBreaker.execute<T | null>(
      // Primary operation using Redis
      async () => {
        const value = ((await this.primaryCache.get(key))) as T;

        // If found in primary cache, also update fallback cache
        if (value !== undefined && value !== null) {
          this.fallbackCache.set(key, value);
        }

        return value || null;
      },
      // Fallback operation using in-memory cache
      async () => {
        const value = this.fallbackCache.get(key) as T;
        this.logger.debug(`Fallback cache ${value ? 'hit' : 'miss'} for key: ${key}`);
        return value || null;
      },
    );
  }

  /**
   * Set a value in cache with circuit breaker protection
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time-to-live in seconds (optional)
   */
  async set<T>(key: string, value: T, ttl: number = this.defaultTTL): Promise<void> {
    try {
      // Always update fallback cache
      this.fallbackCache.set(key, value, ttl);

      // Try to update primary cache with circuit breaker
      await this.circuitBreaker.execute(
        async () => {
          await this.primaryCache.set(key, value, ttl);
        },
        async () => {
          // Fallback is already updated, nothing more to do
          this.logger.debug(`Primary cache unavailable, using fallback for key: ${key}`);
        },
      );
    } catch (error) {
      // If both caches fail, log error but don't crash
      this.logger.error(`Failed to set cache key ${key}: ${error.message}`, error.stack);
    }
  }

  /**
   * Delete a value from cache with circuit breaker protection
   * @param key Cache key
   */
  async del(key: string): Promise<void> {
    try {
      // Always delete from fallback cache
      this.fallbackCache.del(key);

      // Try to delete from primary cache with circuit breaker
      await this.circuitBreaker.execute(
        async () => {
          await this.primaryCache.del(key);
        },
        async () => {
          // Fallback is already deleted, nothing more to do
          this.logger.debug(
            `Primary cache unavailable, deleted from fallback only for key: ${key}`,
          );
        },
      );
    } catch (error) {
      // If primary cache deletion fails, log error but don't crash
      this.logger.error(`Failed to delete cache key ${key}: ${error.message}`, error.stack);
    }
  }

  /**
   * Reset the entire cache with circuit breaker protection
   */
  async reset(): Promise<void> {
    try {
      // Always reset fallback cache
      this.fallbackCache.flushAll();

      // Try to reset primary cache with circuit breaker
      await this.circuitBreaker.execute(
        async () => {
          await this.primaryCache.reset();
        },
        async () => {
          // Fallback is already reset, nothing more to do
          this.logger.debug('Primary cache unavailable, reset fallback cache only');
        },
      );
    } catch (error) {
      // If primary cache reset fails, log error but don't crash
      this.logger.error(`Failed to reset cache: ${error.message}`, error.stack);
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    const fallbackStats = this.fallbackCache.getStats();

    return {
      fallback: {
        keys: this.fallbackCache.keys().length,
        hits: fallbackStats.hits,
        misses: fallbackStats.misses,
        ksize: fallbackStats.ksize,
        vsize: fallbackStats.vsize,
      },
      circuitBreaker: this.circuitBreaker.getMetrics(),
    };
  }
}
