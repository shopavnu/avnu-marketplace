import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Product } from '../entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ResilientCacheService } from '../../../common/services';

@Injectable()
export class ProductCacheService {
  private readonly logger = new Logger(ProductCacheService.name);
  private readonly productTTL: number;
  private readonly popularProductsTTL: number;
  private readonly categoryProductsTTL: number;
  private readonly merchantProductsTTL: number;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
    private readonly resilientCache: ResilientCacheService,
  ) {
    // Get TTL values from config or use defaults
    this.productTTL = this.configService.get<number>('PRODUCT_CACHE_TTL', 3600); // 1 hour
    this.popularProductsTTL = this.configService.get<number>('POPULAR_PRODUCTS_CACHE_TTL', 1800); // 30 minutes
    this.categoryProductsTTL = this.configService.get<number>('CATEGORY_PRODUCTS_CACHE_TTL', 3600); // 1 hour
    this.merchantProductsTTL = this.configService.get<number>('MERCHANT_PRODUCTS_CACHE_TTL', 3600); // 1 hour
  }

  // Cache key generators
  private getProductKey(id: string): string {
    return `product:${id}`;
  }

  private getProductsListKey(page: number, limit: number): string {
    return `products:list:${page}:${limit}`;
  }

  private getProductsByCursorKey(cursor: string, limit: number): string {
    return `products:cursor:${cursor || 'initial'}:${limit}`;
  }

  private getProductsByMerchantKey(merchantId: string, page: number, limit: number): string {
    return `products:merchant:${merchantId}:${page}:${limit}`;
  }

  private getProductsByCategoryKey(category: string, page: number, limit: number): string {
    return `products:category:${category}:${page}:${limit}`;
  }

  private getPopularProductsKey(limit: number): string {
    return `products:popular:${limit}`;
  }

  private getRecommendedProductsKey(userId: string, limit: number): string {
    return `products:recommended:${userId}:${limit}`;
  }

  private getDiscoveryProductsKey(limit: number): string {
    return `products:discovery:${limit}`;
  }

  private getSearchProductsKey(
    query: string,
    page: number,
    limit: number,
    filters?: string,
  ): string {
    return `products:search:${query}:${page}:${limit}:${filters || 'nofilters'}`;
  }

  // Cache operations
  async getCachedProduct(id: string): Promise<Product | null> {
    try {
      const startTime = Date.now();
      const cachedProduct = await this.resilientCache.get<Product>(this.getProductKey(id));
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

  async cacheProduct(product: Product): Promise<void> {
    try {
      await this.resilientCache.set(this.getProductKey(product.id), product, this.productTTL);
      this.logger.debug(`Cached product ${product.id}`);
    } catch (error) {
      this.logger.error(`Error caching product: ${error.message}`, error.stack);
    }
  }

  async getCachedProductsList(
    page: number,
    limit: number,
  ): Promise<{ items: Product[]; total: number } | null> {
    try {
      const cachedProducts = await this.resilientCache.get<{ items: Product[]; total: number }>(
        this.getProductsListKey(page, limit),
      );
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

  async cacheProductsList(
    productsData: { items: Product[]; total: number },
    page: number,
    limit: number,
  ): Promise<void> {
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

  async getCachedProductsByCursor(cursor: string, limit: number): Promise<any | null> {
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

  async cacheProductsByCursor(productsData: any, cursor: string, limit: number): Promise<void> {
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

  async getCachedProductsByMerchant(
    merchantId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Product[]; total: number } | null> {
    try {
      const cachedProducts = await this.resilientCache.get<{ items: Product[]; total: number }>(
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

  async cacheProductsByMerchant(
    merchantId: string,
    productsData: { items: Product[]; total: number },
    page: number,
    limit: number,
  ): Promise<void> {
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

  async getCachedRecommendedProducts(userId: string, limit: number): Promise<Product[] | null> {
    try {
      const cachedProducts = await this.resilientCache.get<Product[]>(
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

  async cacheRecommendedProducts(
    userId: string,
    products: Product[],
    limit: number,
  ): Promise<void> {
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

  async getCachedDiscoveryProducts(limit: number): Promise<Product[] | null> {
    try {
      const cachedProducts = await this.resilientCache.get<Product[]>(
        this.getDiscoveryProductsKey(limit),
      );
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

  async cacheDiscoveryProducts(products: Product[], limit: number): Promise<void> {
    try {
      await this.resilientCache.set(
        this.getDiscoveryProductsKey(limit),
        products,
        this.popularProductsTTL, // Use popular products TTL for discovery products
      );
      this.logger.debug(`Cached discovery products, limit ${limit}`);
    } catch (error) {
      this.logger.error(`Error caching discovery products: ${error.message}`, error.stack);
    }
  }

  async getCachedSearchProducts(
    query: string,
    page: number,
    limit: number,
    filters?: any,
  ): Promise<{ items: Product[]; total: number } | null> {
    const filtersString = filters ? JSON.stringify(filters) : 'nofilters';
    try {
      const cachedProducts = await this.resilientCache.get<{ items: Product[]; total: number }>(
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

  async cacheSearchProducts(
    query: string,
    productsData: { items: Product[]; total: number },
    page: number,
    limit: number,
    filters?: any,
  ): Promise<void> {
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

  // Cache invalidation
  async invalidateProduct(id: string): Promise<void> {
    try {
      await this.resilientCache.del(this.getProductKey(id));
      this.logger.debug(`Invalidated cache for product ${id}`);
      this.eventEmitter.emit('cache.invalidate');
    } catch (error) {
      this.logger.error(`Error invalidating product cache: ${error.message}`, error.stack);
    }
  }

  async invalidateProductsByMerchant(merchantId: string): Promise<void> {
    try {
      // We can't easily delete all merchant-related keys without a pattern matching feature
      // So we'll emit an event that will trigger a full cache clear
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

  async invalidateAllProductsCache(): Promise<void> {
    try {
      // Use the resilient cache service to reset the cache
      await this.resilientCache.reset();
      this.logger.debug('Invalidated all products cache');
      this.eventEmitter.emit('cache.invalidate');
    } catch (error) {
      this.logger.error(`Error invalidating all products cache: ${error.message}`, error.stack);
    }
  }

  // Event handlers for cache invalidation
  @OnEvent('product.created')
  async handleProductCreated(_product: Product): Promise<void> {
    // Invalidate list caches when a new product is created
    await this.invalidateAllProductsCache();
  }

  @OnEvent('product.updated')
  async handleProductUpdated(_product: Product): Promise<void> {
    // Invalidate specific product cache and related lists
    await this.invalidateProduct(_product.id);

    // If the product belongs to a merchant, invalidate merchant product lists
    if (_product.merchantId) {
      await this.invalidateProductsByMerchant(_product.merchantId);
    }
  }

  @OnEvent('product.deleted')
  async handleProductDeleted(productId: string): Promise<void> {
    // Invalidate specific product cache and all lists
    await this.invalidateProduct(productId);
    await this.invalidateAllProductsCache();
  }

  @OnEvent('products.bulk_created')
  async handleBulkProductsCreated(_products: Product[]): Promise<void> {
    // Invalidate all product lists when bulk products are created
    await this.invalidateAllProductsCache();
  }

  @OnEvent('products.bulk_updated')
  async handleBulkProductsUpdated(_products: Product[]): Promise<void> {
    // Invalidate specific products and related lists
    for (const product of _products) {
      await this.invalidateProduct(product.id);

      // If the product belongs to a merchant, invalidate merchant product lists
      if (product.merchantId) {
        await this.invalidateProductsByMerchant(product.merchantId);
      }
    }
  }

  // Cache warming methods
  async warmPopularProductsCache(): Promise<void> {
    try {
      this.logger.log('Warming popular products cache...');

      // Get popular products (this is a placeholder - implement your logic)
      // In a real implementation, you would have a viewCount field or use analytics data
      const popularProducts = await this.productsRepository.find({
        where: { isActive: true, inStock: true },
        take: 50,
        order: { createdAt: 'DESC' }, // Using createdAt as a proxy for popularity
      });

      // Cache popular products with different limits
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

  async warmCategoryProductsCache(): Promise<void> {
    try {
      this.logger.log('Warming category products cache...');

      // Get all active categories (simplified - you would need to implement this)
      const categories = ['electronics', 'clothing', 'home', 'beauty']; // Example categories

      // For each category, cache the first few pages of products
      for (const category of categories) {
        // Get products for this category (simplified query)
        // Using a raw query because TypeORM's array handling can be tricky
        const products = await this.productsRepository
          .createQueryBuilder('product')
          .where('product.categories LIKE :category', { category: `%${category}%` })
          .andWhere('product.isActive = :isActive', { isActive: true })
          .take(50)
          .orderBy('product.createdAt', 'DESC')
          .getMany();

        const total = products.length;

        // Cache first 2 pages
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

  async warmMerchantProductsCache(): Promise<void> {
    try {
      this.logger.log('Warming merchant products cache...');

      // Get top merchants (simplified - you would need to implement this)
      // In a real implementation, you might get merchants with the most products or highest sales
      const topMerchantIds = await this.productsRepository
        .createQueryBuilder('product')
        .select('product.merchantId')
        .groupBy('product.merchantId')
        .orderBy('COUNT(*)', 'DESC')
        .limit(10)
        .getRawMany()
        .then(results => results.map(result => result.product_merchantId));

      // For each merchant, cache the first page of products
      for (const merchantId of topMerchantIds) {
        if (!merchantId) continue;

        const [items, total] = await this.productsRepository.findAndCount({
          where: { merchantId, isActive: true },
          take: 20,
          order: { createdAt: 'DESC' },
        });

        // Cache first page with common limits
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

  // Main cache warming method to be called by scheduler
  async warmCache(): Promise<void> {
    this.logger.log('Starting cache warming process...');
    const startTime = Date.now();

    // Warm different types of caches
    await this.warmPopularProductsCache();
    await this.warmCategoryProductsCache();
    await this.warmMerchantProductsCache();

    const endTime = Date.now();
    const duration = endTime - startTime;

    this.logger.log(`Cache warming completed successfully in ${duration}ms`);
    this.eventEmitter.emit('cache.warming.complete', duration);
  }
}
