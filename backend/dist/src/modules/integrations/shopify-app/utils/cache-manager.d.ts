import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
interface CacheOptions {
    ttl?: number;
    useMemoryCache?: boolean;
    priority?: number;
}
interface CacheKeyParts {
    namespace: string;
    merchantId: string;
    resource: string;
    id?: string;
    subResource?: string;
}
export declare class ShopifyCacheManager {
    private configService;
    private readonly redisClient;
    private readonly logger;
    private memoryCache;
    private readonly DEFAULT_MEMORY_TTL;
    private readonly DEFAULT_REDIS_TTL;
    private readonly useRedis;
    constructor(configService: ConfigService, redisClient: Redis);
    getOrFetch<T>(keyParts: CacheKeyParts, dataFetcher: () => Promise<T>, options?: CacheOptions): Promise<T>;
    set<T>(keyParts: CacheKeyParts, data: T, options?: CacheOptions): Promise<void>;
    invalidate(keyParts: CacheKeyParts): Promise<void>;
    invalidateForMerchant(merchantId: string): Promise<void>;
    invalidateResource(merchantId: string, resource: string): Promise<void>;
    private buildCacheKey;
    private getFromMemoryCache;
    private setInMemoryCache;
    private getFromRedisCache;
    private setInRedisCache;
    private logCacheStats;
    warmupCache(merchantId: string, _shopDomain: string): Promise<void>;
}
export {};
