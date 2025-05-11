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
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var SearchCacheService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.SearchCacheService = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const cache_manager_1 = require('@nestjs/cache-manager');
const search_exceptions_1 = require('../../../common/exceptions/search-exceptions');
let SearchCacheService = (SearchCacheService_1 = class SearchCacheService {
  constructor(cacheManager, configService) {
    this.cacheManager = cacheManager;
    this.configService = configService;
    this.logger = new common_1.Logger(SearchCacheService_1.name);
    this.enabled = this.configService.get('SEARCH_CACHE_ENABLED', true);
    this.defaultTtl = this.configService.get('SEARCH_CACHE_TTL_SECONDS', 300);
    if (!this.enabled) {
      this.logger.warn('Search cache is disabled by configuration.');
    }
  }
  onModuleInit() {}
  generateCacheKey(options) {
    try {
      const keyParts = [
        `query:${options.query}`,
        `page:${options.page}`,
        `limit:${options.limit}`,
        `entity:${options.entityType || 'all'}`,
      ];
      if (options.filters) {
        const filterKeys = Object.keys(options.filters).sort();
        for (const key of filterKeys) {
          const value = options.filters[key];
          if (Array.isArray(value)) {
            keyParts.push(`${key}:[${value.sort().join(',')}]`);
          } else {
            keyParts.push(`${key}:${value}`);
          }
        }
      }
      if (options.sort) {
        keyParts.push(`sort:${options.sort}`);
      }
      if (options.enableNlp) {
        keyParts.push('nlp:true');
      }
      return `search:${options.entityType || 'all'}:${keyParts.join('|')}`;
    } catch (error) {
      this.logger.error(`Error generating cache key: ${error.message}`, error.stack);
      return `search:error:${Date.now()}`;
    }
  }
  shouldCache(options) {
    if (!this.enabled) {
      return false;
    }
    if (options.personalized) {
      return false;
    }
    if (options.experimentId) {
      return false;
    }
    return !options.query || options.query.length >= 2;
  }
  async getCachedResults(options) {
    try {
      if (!this.enabled) {
        return null;
      }
      if (options.personalized) {
        return null;
      }
      const cacheKey = this.generateCacheKey(options);
      const cachedResults = await this.cacheManager.get(cacheKey);
      if (cachedResults) {
        this.logger.debug(`Cache hit for search: ${options.query}`);
      } else {
        this.logger.debug(`Cache miss for search: ${options.query}`);
      }
      return cachedResults || null;
    } catch (error) {
      this.logger.error(`Error retrieving cached results: ${error.message}`, error.stack);
      return null;
    }
  }
  async cacheResults(options, results) {
    try {
      if (!this.enabled) {
        return;
      }
      if (options.personalized) {
        return;
      }
      if (results.pagination.total === 0) {
        return;
      }
      const cacheKey = this.generateCacheKey(options);
      await this.cacheManager.set(cacheKey, results, this.defaultTtl);
      this.logger.debug(`Cached search results for: ${options.query}`);
    } catch (error) {
      this.logger.error(`Error caching search results: ${error.message}`, error.stack);
    }
  }
  async invalidateCache(pattern) {
    try {
      if (!this.enabled) {
        return;
      }
      await this.cacheManager.del(pattern);
      this.logger.debug(`Invalidated cache entries matching pattern: ${pattern}`);
    } catch (error) {
      this.logger.error(`Error invalidating cache: ${error.message}`, error.stack);
      throw new search_exceptions_1.SearchCacheException(
        `Failed to invalidate cache: ${error.message}`,
      );
    }
  }
});
exports.SearchCacheService = SearchCacheService;
exports.SearchCacheService =
  SearchCacheService =
  SearchCacheService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
        __metadata('design:paramtypes', [Object, config_1.ConfigService]),
      ],
      SearchCacheService,
    );
//# sourceMappingURL=search-cache.service.js.map
