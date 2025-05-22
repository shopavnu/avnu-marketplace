'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
var ShopifyCacheManager_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ShopifyCacheManager = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const node_cache_1 = __importDefault(require('node-cache'));
const nestjs_redis_1 = require('nestjs-redis');
let ShopifyCacheManager = (ShopifyCacheManager_1 = class ShopifyCacheManager {
  constructor(configService, redisService) {
    this.configService = configService;
    this.redisService = redisService;
    this.logger = new common_1.Logger(ShopifyCacheManager_1.name);
    this.DEFAULT_MEMORY_TTL = 60;
    this.DEFAULT_REDIS_TTL = 300;
    this.memoryCache = new node_cache_1.default({
      stdTTL: this.DEFAULT_MEMORY_TTL,
      checkperiod: 60,
      useClones: false,
      maxKeys: 10000,
    });
    this.useRedis = this.configService.get('CACHE_REDIS_ENABLED', true);
    if (this.useRedis) {
      try {
        this.redisClient = this.redisService.getClient();
        this.logger.log('Redis cache initialized');
      } catch (error) {
        this.logger.error(`Failed to initialize Redis cache: ${error.message}`);
        this.useRedis = false;
      }
    }
    this.memoryCache.on('expired', (key, _value) => {
      this.logger.debug(`Memory cache item expired: ${key}`);
    });
    setInterval(() => this.logCacheStats(), 300000);
  }
  async getOrFetch(keyParts, dataFetcher, options = {}) {
    const cacheKey = this.buildCacheKey(keyParts);
    const memoryResult = this.getFromMemoryCache(cacheKey);
    if (memoryResult !== undefined) {
      this.logger.debug(`Memory cache hit: ${cacheKey}`);
      return memoryResult;
    }
    if (this.useRedis) {
      const redisResult = await this.getFromRedisCache(cacheKey);
      if (redisResult !== undefined) {
        this.logger.debug(`Redis cache hit: ${cacheKey}`);
        const memoryTtl = options.ttl || this.DEFAULT_MEMORY_TTL;
        this.setInMemoryCache(cacheKey, redisResult, memoryTtl);
        return redisResult;
      }
    }
    this.logger.debug(`Cache miss: ${cacheKey}`);
    try {
      const fetchedData = await dataFetcher();
      if (fetchedData !== undefined && fetchedData !== null) {
        this.set(keyParts, fetchedData, options);
      }
      return fetchedData;
    } catch (error) {
      this.logger.error(`Error fetching data for cache key ${cacheKey}: ${error.message}`);
      throw error;
    }
  }
  async set(keyParts, data, options = {}) {
    const cacheKey = this.buildCacheKey(keyParts);
    const useMemory = options.useMemoryCache !== false;
    if (useMemory) {
      const memoryTtl = options.ttl || this.DEFAULT_MEMORY_TTL;
      this.setInMemoryCache(cacheKey, data, memoryTtl);
    }
    if (this.useRedis) {
      const redisTtl = options.ttl || this.DEFAULT_REDIS_TTL;
      await this.setInRedisCache(cacheKey, data, redisTtl);
    }
  }
  async invalidate(keyParts) {
    const cacheKey = this.buildCacheKey(keyParts);
    this.memoryCache.del(cacheKey);
    if (this.useRedis) {
      await this.redisClient.del(cacheKey);
    }
    this.logger.debug(`Invalidated cache key: ${cacheKey}`);
  }
  async invalidateForMerchant(merchantId) {
    const pattern = `shopify:${merchantId}:*`;
    const memoryKeys = this.memoryCache.keys();
    const keysToDelete = memoryKeys.filter(key => key.includes(`shopify:${merchantId}:`));
    keysToDelete.forEach(key => {
      this.memoryCache.del(key);
    });
    if (this.useRedis) {
      const redisKeys = await this.redisClient.keys(pattern);
      if (redisKeys.length > 0) {
        await this.redisClient.del(...redisKeys);
      }
    }
    this.logger.log(`Invalidated all cache entries for merchant: ${merchantId}`);
  }
  async invalidateResource(merchantId, resource) {
    const pattern = `shopify:${merchantId}:${resource}:*`;
    const memoryKeys = this.memoryCache.keys();
    const keysToDelete = memoryKeys.filter(key =>
      key.startsWith(`shopify:${merchantId}:${resource}:`),
    );
    keysToDelete.forEach(key => {
      this.memoryCache.del(key);
    });
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
  buildCacheKey(keyParts) {
    let key = `shopify:${keyParts.merchantId}:${keyParts.resource}`;
    if (keyParts.id) {
      key += `:${keyParts.id}`;
      if (keyParts.subResource) {
        key += `:${keyParts.subResource}`;
      }
    }
    return key;
  }
  getFromMemoryCache(key) {
    return this.memoryCache.get(key);
  }
  setInMemoryCache(key, value, ttl) {
    return this.memoryCache.set(key, value, ttl);
  }
  async getFromRedisCache(key) {
    if (!this.useRedis) return undefined;
    try {
      const value = await this.redisClient.get(key);
      if (!value) return undefined;
      return JSON.parse(value);
    } catch (error) {
      this.logger.error(`Redis cache get error for key ${key}: ${error.message}`);
      return undefined;
    }
  }
  async setInRedisCache(key, _value, _ttl) {
    if (!this.useRedis) return;
    try {
      const serialized = JSON.stringify(_value);
      await this.redisClient.set(key, serialized, 'EX', _ttl);
    } catch (error) {
      this.logger.error(`Redis cache set error for key ${key}: ${error.message}`);
    }
  }
  logCacheStats() {
    const memStats = this.memoryCache.getStats();
    this.logger.debug('Cache statistics', {
      memoryKeys: this.memoryCache.keys().length,
      memoryHits: memStats.hits,
      memoryMisses: memStats.misses,
      memoryHitRate: memStats.hits / (memStats.hits + memStats.misses || 1),
    });
  }
  async warmupCache(merchantId, _shopDomain) {
    this.logger.log(`Warming cache for merchant ${merchantId}`);
  }
});
exports.ShopifyCacheManager = ShopifyCacheManager;
exports.ShopifyCacheManager =
  ShopifyCacheManager =
  ShopifyCacheManager_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [config_1.ConfigService, nestjs_redis_1.RedisService]),
      ],
      ShopifyCacheManager,
    );
//# sourceMappingURL=cache-manager.js.map
