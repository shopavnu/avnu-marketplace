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
var ProductCacheService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ProductCacheService = void 0;
const common_1 = require('@nestjs/common');
const cache_manager_1 = require('@nestjs/cache-manager');
const event_emitter_1 = require('@nestjs/event-emitter');
const product_entity_1 = require('../entities/product.entity');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const config_1 = require('@nestjs/config');
const services_1 = require('../../../common/services');
let ProductCacheService = (ProductCacheService_1 = class ProductCacheService {
  constructor(cacheManager, productsRepository, eventEmitter, configService, resilientCache) {
    this.cacheManager = cacheManager;
    this.productsRepository = productsRepository;
    this.eventEmitter = eventEmitter;
    this.configService = configService;
    this.resilientCache = resilientCache;
    this.logger = new common_1.Logger(ProductCacheService_1.name);
    this.productTTL = this.configService.get('PRODUCT_CACHE_TTL', 3600);
    this.popularProductsTTL = this.configService.get('POPULAR_PRODUCTS_CACHE_TTL', 1800);
    this.categoryProductsTTL = this.configService.get('CATEGORY_PRODUCTS_CACHE_TTL', 3600);
    this.merchantProductsTTL = this.configService.get('MERCHANT_PRODUCTS_CACHE_TTL', 3600);
  }
  getProductKey(id) {
    return `product:${id}`;
  }
  getProductsListKey(page, limit) {
    return `products:list:${page}:${limit}`;
  }
  getProductsByCursorKey(cursor, limit) {
    return `products:cursor:${cursor || 'initial'}:${limit}`;
  }
  getProductsByMerchantKey(merchantId, page, limit) {
    return `products:merchant:${merchantId}:${page}:${limit}`;
  }
  getProductsByCategoryKey(category, page, limit) {
    return `products:category:${category}:${page}:${limit}`;
  }
  getPopularProductsKey(limit) {
    return `products:popular:${limit}`;
  }
  getRecommendedProductsKey(userId, limit) {
    return `products:recommended:${userId}:${limit}`;
  }
  getDiscoveryProductsKey(limit) {
    return `products:discovery:${limit}`;
  }
  getSearchProductsKey(query, page, limit, filters) {
    return `products:search:${query}:${page}:${limit}:${filters || 'nofilters'}`;
  }
  async getCachedProduct(id) {
    try {
      const startTime = Date.now();
      const cachedProduct = await this.resilientCache.get(this.getProductKey(id));
      const endTime = Date.now();
      if (cachedProduct) {
        this.logger.debug(`Cache hit for product ${id}`);
        this.eventEmitter.emit('cache.hit');
        this.eventEmitter.emit('cache.response.time.with', endTime - startTime);
        return cachedProduct;
      }
      this.eventEmitter.emit('cache.miss');
      return null;
    } catch (error) {
      this.logger.error(`Error getting product from cache: ${error.message}`, error.stack);
      return null;
    }
  }
  async cacheProduct(product) {
    try {
      await this.resilientCache.set(this.getProductKey(product.id), product, this.productTTL);
      this.logger.debug(`Cached product ${product.id}`);
    } catch (error) {
      this.logger.error(`Error caching product: ${error.message}`, error.stack);
    }
  }
  async getCachedProductsList(page, limit) {
    try {
      const cachedProducts = await this.resilientCache.get(this.getProductsListKey(page, limit));
      if (cachedProducts) {
        this.logger.debug(`Cache hit for products list page ${page}, limit ${limit}`);
        return cachedProducts;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error getting products list from cache: ${error.message}`, error.stack);
      return null;
    }
  }
  async cacheProductsList(productsData, page, limit) {
    try {
      await this.resilientCache.set(
        this.getProductsListKey(page, limit),
        productsData,
        this.productTTL,
      );
      this.logger.debug(`Cached products list for page ${page}, limit ${limit}`);
    } catch (error) {
      this.logger.error(`Error caching products list: ${error.message}`, error.stack);
    }
  }
  async getCachedProductsByCursor(cursor, limit) {
    try {
      const cachedProducts = await this.resilientCache.get(
        this.getProductsByCursorKey(cursor, limit),
      );
      if (cachedProducts) {
        this.logger.debug(`Cache hit for products by cursor ${cursor}, limit ${limit}`);
        return cachedProducts;
      }
      return null;
    } catch (error) {
      this.logger.error(
        `Error getting products by cursor from cache: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }
  async cacheProductsByCursor(productsData, cursor, limit) {
    try {
      await this.resilientCache.set(
        this.getProductsByCursorKey(cursor, limit),
        productsData,
        this.productTTL,
      );
      this.logger.debug(`Cached products by cursor ${cursor}, limit ${limit}`);
    } catch (error) {
      this.logger.error(`Error caching products by cursor: ${error.message}`, error.stack);
    }
  }
  async getCachedProductsByMerchant(merchantId, page, limit) {
    try {
      const cachedProducts = await this.resilientCache.get(
        this.getProductsByMerchantKey(merchantId, page, limit),
      );
      if (cachedProducts) {
        this.logger.debug(
          `Cache hit for products by merchant ${merchantId}, page ${page}, limit ${limit}`,
        );
        return cachedProducts;
      }
      return null;
    } catch (error) {
      this.logger.error(
        `Error getting products by merchant from cache: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }
  async cacheProductsByMerchant(merchantId, productsData, page, limit) {
    try {
      await this.resilientCache.set(
        this.getProductsByMerchantKey(merchantId, page, limit),
        productsData,
        this.merchantProductsTTL,
      );
      this.logger.debug(`Cached products for merchant ${merchantId}, page ${page}, limit ${limit}`);
    } catch (error) {
      this.logger.error(`Error caching products by merchant: ${error.message}`, error.stack);
    }
  }
  async getCachedRecommendedProducts(userId, limit) {
    try {
      const cachedProducts = await this.resilientCache.get(
        this.getRecommendedProductsKey(userId, limit),
      );
      if (cachedProducts) {
        this.logger.debug(`Cache hit for recommended products for user ${userId}, limit ${limit}`);
        return cachedProducts;
      }
      return null;
    } catch (error) {
      this.logger.error(
        `Error getting recommended products from cache: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }
  async cacheRecommendedProducts(userId, products, limit) {
    try {
      await this.resilientCache.set(
        this.getRecommendedProductsKey(userId, limit),
        products,
        this.productTTL,
      );
      this.logger.debug(`Cached recommended products for user ${userId}, limit ${limit}`);
    } catch (error) {
      this.logger.error(`Error caching recommended products: ${error.message}`, error.stack);
    }
  }
  async getCachedDiscoveryProducts(limit) {
    try {
      const cachedProducts = await this.resilientCache.get(this.getDiscoveryProductsKey(limit));
      if (cachedProducts) {
        this.logger.debug(`Cache hit for discovery products, limit ${limit}`);
        return cachedProducts;
      }
      return null;
    } catch (error) {
      this.logger.error(
        `Error getting discovery products from cache: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }
  async cacheDiscoveryProducts(products, limit) {
    try {
      await this.resilientCache.set(
        this.getDiscoveryProductsKey(limit),
        products,
        this.popularProductsTTL,
      );
      this.logger.debug(`Cached discovery products, limit ${limit}`);
    } catch (error) {
      this.logger.error(`Error caching discovery products: ${error.message}`, error.stack);
    }
  }
  async getCachedSearchProducts(query, page, limit, filters) {
    const filtersString = filters ? JSON.stringify(filters) : 'nofilters';
    try {
      const cachedProducts = await this.resilientCache.get(
        this.getSearchProductsKey(query, page, limit, filtersString),
      );
      if (cachedProducts) {
        this.logger.debug(
          `Cache hit for search products, query ${query}, page ${page}, limit ${limit}`,
        );
        return cachedProducts;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error getting search products from cache: ${error.message}`, error.stack);
      return null;
    }
  }
  async cacheSearchProducts(query, productsData, page, limit, filters) {
    const filtersString = filters ? JSON.stringify(filters) : 'nofilters';
    try {
      await this.resilientCache.set(
        this.getSearchProductsKey(query, page, limit, filtersString),
        productsData,
        this.productTTL,
      );
      this.logger.debug(`Cached search products, query ${query}, page ${page}, limit ${limit}`);
    } catch (error) {
      this.logger.error(`Error caching search products: ${error.message}`, error.stack);
    }
  }
  async invalidateProduct(id) {
    try {
      await this.resilientCache.del(this.getProductKey(id));
      this.logger.debug(`Invalidated cache for product ${id}`);
      this.eventEmitter.emit('cache.invalidate');
    } catch (error) {
      this.logger.error(`Error invalidating product cache: ${error.message}`, error.stack);
    }
  }
  async invalidateProductsByMerchant(merchantId) {
    try {
      this.eventEmitter.emit('cache.merchant.invalidate', merchantId);
      this.logger.debug(`Triggered invalidation for merchant ${merchantId} products`);
      this.eventEmitter.emit('cache.invalidate');
    } catch (error) {
      this.logger.error(
        `Error invalidating merchant products cache: ${error.message}`,
        error.stack,
      );
    }
  }
  async invalidateAllProductsCache() {
    try {
      await this.resilientCache.reset();
      this.logger.debug('Invalidated all products cache');
      this.eventEmitter.emit('cache.invalidate');
    } catch (error) {
      this.logger.error(`Error invalidating all products cache: ${error.message}`, error.stack);
    }
  }
  async handleProductCreated(_product) {
    await this.invalidateAllProductsCache();
  }
  async handleProductUpdated(_product) {
    await this.invalidateProduct(_product.id);
    if (_product.merchantId) {
      await this.invalidateProductsByMerchant(_product.merchantId);
    }
  }
  async handleProductDeleted(productId) {
    await this.invalidateProduct(productId);
    await this.invalidateAllProductsCache();
  }
  async handleBulkProductsCreated(_products) {
    await this.invalidateAllProductsCache();
  }
  async handleBulkProductsUpdated(_products) {
    for (const product of _products) {
      await this.invalidateProduct(product.id);
      if (product.merchantId) {
        await this.invalidateProductsByMerchant(product.merchantId);
      }
    }
  }
  async warmPopularProductsCache() {
    try {
      this.logger.log('Warming popular products cache...');
      const popularProducts = await this.productsRepository.find({
        where: { isActive: true, inStock: true },
        take: 50,
        order: { createdAt: 'DESC' },
      });
      const limits = [10, 20, 30, 50];
      for (const limit of limits) {
        await this.resilientCache.set(
          this.getPopularProductsKey(limit),
          popularProducts.slice(0, limit),
          this.popularProductsTTL,
        );
      }
      this.logger.log('Popular products cache warmed successfully');
    } catch (error) {
      this.logger.error(`Error warming popular products cache: ${error.message}`, error.stack);
    }
  }
  async warmCategoryProductsCache() {
    try {
      this.logger.log('Warming category products cache...');
      const categories = ['electronics', 'clothing', 'home', 'beauty'];
      for (const category of categories) {
        const products = await this.productsRepository
          .createQueryBuilder('product')
          .where('product.categories LIKE :category', { category: `%${category}%` })
          .andWhere('product.isActive = :isActive', { isActive: true })
          .take(50)
          .orderBy('product.createdAt', 'DESC')
          .getMany();
        const total = products.length;
        const pages = [1, 2];
        const limits = [10, 20];
        for (const page of pages) {
          for (const limit of limits) {
            const start = (page - 1) * limit;
            const end = start + limit;
            await this.resilientCache.set(
              this.getProductsByCategoryKey(category, page, limit),
              {
                items: products.slice(start, end),
                total,
              },
              this.categoryProductsTTL,
            );
          }
        }
      }
      this.logger.log('Category products cache warmed successfully');
    } catch (error) {
      this.logger.error(`Error warming category products cache: ${error.message}`, error.stack);
    }
  }
  async warmMerchantProductsCache() {
    try {
      this.logger.log('Warming merchant products cache...');
      const topMerchantIds = await this.productsRepository
        .createQueryBuilder('product')
        .select('product.merchantId')
        .groupBy('product.merchantId')
        .orderBy('COUNT(*)', 'DESC')
        .limit(10)
        .getRawMany()
        .then(results => results.map(result => result.product_merchantId));
      for (const merchantId of topMerchantIds) {
        if (!merchantId) continue;
        const [items, total] = await this.productsRepository.findAndCount({
          where: { merchantId, isActive: true },
          take: 20,
          order: { createdAt: 'DESC' },
        });
        const limits = [10, 20];
        for (const limit of limits) {
          await this.resilientCache.set(
            this.getProductsByMerchantKey(merchantId, 1, limit),
            {
              items: items.slice(0, limit),
              total,
            },
            this.merchantProductsTTL,
          );
        }
      }
      this.logger.log('Merchant products cache warmed successfully');
    } catch (error) {
      this.logger.error(`Error warming merchant products cache: ${error.message}`, error.stack);
    }
  }
  async warmCache() {
    this.logger.log('Starting cache warming process...');
    const startTime = Date.now();
    await this.warmPopularProductsCache();
    await this.warmCategoryProductsCache();
    await this.warmMerchantProductsCache();
    const endTime = Date.now();
    const duration = endTime - startTime;
    this.logger.log(`Cache warming completed successfully in ${duration}ms`);
    this.eventEmitter.emit('cache.warming.complete', duration);
  }
});
exports.ProductCacheService = ProductCacheService;
__decorate(
  [
    (0, event_emitter_1.OnEvent)('product.created'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [product_entity_1.Product]),
    __metadata('design:returntype', Promise),
  ],
  ProductCacheService.prototype,
  'handleProductCreated',
  null,
);
__decorate(
  [
    (0, event_emitter_1.OnEvent)('product.updated'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [product_entity_1.Product]),
    __metadata('design:returntype', Promise),
  ],
  ProductCacheService.prototype,
  'handleProductUpdated',
  null,
);
__decorate(
  [
    (0, event_emitter_1.OnEvent)('product.deleted'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  ProductCacheService.prototype,
  'handleProductDeleted',
  null,
);
__decorate(
  [
    (0, event_emitter_1.OnEvent)('products.bulk_created'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Array]),
    __metadata('design:returntype', Promise),
  ],
  ProductCacheService.prototype,
  'handleBulkProductsCreated',
  null,
);
__decorate(
  [
    (0, event_emitter_1.OnEvent)('products.bulk_updated'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Array]),
    __metadata('design:returntype', Promise),
  ],
  ProductCacheService.prototype,
  'handleBulkProductsUpdated',
  null,
);
exports.ProductCacheService =
  ProductCacheService =
  ProductCacheService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
        __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
        __metadata('design:paramtypes', [
          Object,
          typeorm_2.Repository,
          event_emitter_1.EventEmitter2,
          config_1.ConfigService,
          services_1.ResilientCacheService,
        ]),
      ],
      ProductCacheService,
    );
//# sourceMappingURL=product-cache.service.js.map
