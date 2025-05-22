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
var PaginationCacheService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.PaginationCacheService = void 0;
const common_1 = require('@nestjs/common');
const resilient_cache_service_1 = require('../../../common/services/resilient-cache.service');
const event_emitter_1 = require('@nestjs/event-emitter');
let PaginationCacheService = (PaginationCacheService_1 = class PaginationCacheService {
  constructor(cacheService, eventEmitter) {
    this.cacheService = cacheService;
    this.eventEmitter = eventEmitter;
    this.logger = new common_1.Logger(PaginationCacheService_1.name);
    this.DEFAULT_TTL = 300;
    this.METADATA_TTL = 600;
    this.eventEmitter.on('product.created', product => {
      this.invalidateRelatedPages(product).catch(err =>
        this.logger.error(
          `Error invalidating pages after product creation: ${err.message}`,
          err.stack,
        ),
      );
    });
    this.eventEmitter.on('product.updated', product => {
      this.invalidateRelatedPages(product).catch(err =>
        this.logger.error(
          `Error invalidating pages after product update: ${err.message}`,
          err.stack,
        ),
      );
    });
    this.eventEmitter.on('product.deleted', _productId => {
      this.invalidateAllPages().catch(err =>
        this.logger.error(
          `Error invalidating pages after product deletion: ${err.message}`,
          err.stack,
        ),
      );
    });
  }
  async cachePage(page, items, options) {
    try {
      const { keyPrefix, filters, totalItems, pageSize, ttl = this.DEFAULT_TTL } = options;
      const totalPages = Math.ceil(totalItems / pageSize);
      const metadataKey = `pagination:meta:${keyPrefix}:${JSON.stringify(filters)}`;
      const metadata = {
        totalItems,
        pageSize,
        totalPages,
        lastUpdated: Date.now(),
        keyPrefix,
        filters,
      };
      await this.cacheService.set(metadataKey, metadata, this.METADATA_TTL);
      const pageKey = this.generatePageKey(keyPrefix, filters, page);
      await this.cacheService.set(pageKey, items, ttl);
      const accessKey = `pagination:access:${pageKey}`;
      await this.cacheService.set(accessKey, Date.now(), this.METADATA_TTL);
      this.logger.debug(`Cached page ${page} for ${keyPrefix} with ${items.length} items`);
    } catch (error) {
      this.logger.error(`Error caching page: ${error.message}`, error.stack);
    }
  }
  async getPage(keyPrefix, filters, page) {
    try {
      const pageKey = this.generatePageKey(keyPrefix, filters, page);
      const items = await this.cacheService.get(pageKey);
      if (!items) {
        return null;
      }
      const metadataKey = `pagination:meta:${keyPrefix}:${JSON.stringify(filters)}`;
      const metadata = await this.cacheService.get(metadataKey);
      if (!metadata) {
        await this.cacheService.del(pageKey);
        return null;
      }
      const accessKey = `pagination:access:${pageKey}`;
      await this.cacheService.set(accessKey, Date.now(), this.METADATA_TTL);
      return { items, metadata };
    } catch (error) {
      this.logger.error(`Error getting cached page: ${error.message}`, error.stack);
      return null;
    }
  }
  async invalidatePages(keyPrefix, filters) {
    try {
      const metadataKey = `pagination:meta:${keyPrefix}:${JSON.stringify(filters)}`;
      const metadata = await this.cacheService.get(metadataKey);
      if (!metadata) {
        return;
      }
      await this.cacheService.del(metadataKey);
      const { totalPages } = metadata;
      for (let page = 1; page <= totalPages; page++) {
        const pageKey = this.generatePageKey(keyPrefix, filters, page);
        await this.cacheService.del(pageKey);
        const accessKey = `pagination:access:${pageKey}`;
        await this.cacheService.del(accessKey);
      }
      this.logger.debug(`Invalidated all pages for ${keyPrefix}`);
    } catch (error) {
      this.logger.error(`Error invalidating pages: ${error.message}`, error.stack);
    }
  }
  async invalidateAllPages() {
    try {
      this.logger.warn('Invalidating all pagination caches is not fully implemented');
      this.eventEmitter.emit('pagination.cache.invalidated.all');
    } catch (error) {
      this.logger.error(`Error invalidating all pages: ${error.message}`, error.stack);
    }
  }
  async invalidateRelatedPages(product) {
    try {
      await this.invalidatePages('merchant', { merchantId: product.merchantId });
      for (const category of product.categories) {
        await this.invalidatePages('category', { category });
      }
      if (product.featured) {
        await this.invalidatePages('featured', {});
      }
      await this.invalidatePages('recent', {});
      this.logger.debug(`Invalidated pages related to product ${product.id}`);
    } catch (error) {
      this.logger.error(`Error invalidating related pages: ${error.message}`, error.stack);
    }
  }
  generatePageKey(keyPrefix, filters, page) {
    return `pagination:page:${keyPrefix}:${JSON.stringify(filters)}:${page}`;
  }
  async determineOptimalTtl(keyPrefix, filters, page) {
    try {
      const DEFAULT_TTL = 300;
      const MIN_TTL = 60;
      const MAX_TTL = 3600;
      const pageKey = this.generatePageKey(keyPrefix, filters, page);
      const accessKey = `pagination:access:${pageKey}`;
      const lastAccess = await this.cacheService.get(accessKey);
      if (!lastAccess) {
        return DEFAULT_TTL;
      }
      const now = Date.now();
      const timeSinceLastAccess = (now - lastAccess) / 1000;
      if (timeSinceLastAccess < 60) {
        return MAX_TTL;
      } else if (timeSinceLastAccess < 300) {
        return DEFAULT_TTL * 2;
      } else if (timeSinceLastAccess < 3600) {
        return DEFAULT_TTL;
      } else {
        return MIN_TTL;
      }
    } catch (error) {
      this.logger.error(`Error determining optimal TTL: ${error.message}`, error.stack);
      return this.DEFAULT_TTL;
    }
  }
});
exports.PaginationCacheService = PaginationCacheService;
exports.PaginationCacheService =
  PaginationCacheService =
  PaginationCacheService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          resilient_cache_service_1.ResilientCacheService,
          event_emitter_1.EventEmitter2,
        ]),
      ],
      PaginationCacheService,
    );
//# sourceMappingURL=pagination-cache.service.js.map
