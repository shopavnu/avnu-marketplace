import { Injectable, Logger } from '@nestjs/common';
import { ResilientCacheService } from '../../../common/services/resilient-cache.service';
import { Product } from '../entities/product.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface PaginationCacheOptions {
  keyPrefix: string;
  filters: Record<string, any>;
  totalItems: number;
  pageSize: number;
  ttl?: number;
}

interface PaginationCacheMetadata {
  totalItems: number;
  pageSize: number;
  totalPages: number;
  lastUpdated: number;
  keyPrefix: string;
  filters: Record<string, any>;
}

/**
 * Service for efficient caching of paginated query results
 * This service optimizes caching for paginated data by:
 * 1. Storing page metadata separately from page content
 * 2. Using adaptive TTL based on page access patterns
 * 3. Supporting partial cache invalidation
 */
@Injectable()
export class PaginationCacheService {
  private readonly logger = new Logger(PaginationCacheService.name);
  private readonly DEFAULT_TTL = 300; // 5 minutes
  private readonly METADATA_TTL = 600; // 10 minutes

  constructor(
    private readonly cacheService: ResilientCacheService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    // Listen for product update events to invalidate affected pages
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

  /**
   * Cache a page of results
   */
  async cachePage(page: number, items: Product[], options: PaginationCacheOptions): Promise<void> {
    try {
      const { keyPrefix, filters, totalItems, pageSize, ttl = this.DEFAULT_TTL } = options;

      // Calculate total pages
      const totalPages = Math.ceil(totalItems / pageSize);

      // Store page metadata
      const metadataKey = `pagination:meta:${keyPrefix}:${JSON.stringify(filters)}`;
      const metadata: PaginationCacheMetadata = {
        totalItems,
        pageSize,
        totalPages,
        lastUpdated: Date.now(),
        keyPrefix,
        filters,
      };

      await this.cacheService.set(metadataKey, metadata, this.METADATA_TTL);

      // Store page content
      const pageKey = this.generatePageKey(keyPrefix, filters, page);
      await this.cacheService.set(pageKey, items, ttl);

      // Store page access time for adaptive TTL
      const accessKey = `pagination:access:${pageKey}`;
      await this.cacheService.set(accessKey, Date.now(), this.METADATA_TTL);

      this.logger.debug(`Cached page ${page} for ${keyPrefix} with ${items.length} items`);
    } catch (error) {
      this.logger.error(`Error caching page: ${error.message}`, error.stack);
    }
  }

  /**
   * Get a cached page of results
   */
  async getPage(
    keyPrefix: string,
    filters: Record<string, any>,
    page: number,
  ): Promise<{ items: Product[]; metadata: PaginationCacheMetadata } | null> {
    try {
      // Get page content
      const pageKey = this.generatePageKey(keyPrefix, filters, page);
      const items = await this.cacheService.get<Product[]>(pageKey);

      if (!items) {
        return null;
      }

      // Get metadata
      const metadataKey = `pagination:meta:${keyPrefix}:${JSON.stringify(filters)}`;
      const metadata = await this.cacheService.get<PaginationCacheMetadata>(metadataKey);

      if (!metadata) {
        // If metadata is missing but items exist, invalidate the page
        await this.cacheService.del(pageKey);
        return null;
      }

      // Update page access time for adaptive TTL
      const accessKey = `pagination:access:${pageKey}`;
      await this.cacheService.set(accessKey, Date.now(), this.METADATA_TTL);

      return { items, metadata };
    } catch (error) {
      this.logger.error(`Error getting cached page: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Invalidate all pages for a specific query
   */
  async invalidatePages(keyPrefix: string, filters: Record<string, any>): Promise<void> {
    try {
      // Get metadata
      const metadataKey = `pagination:meta:${keyPrefix}:${JSON.stringify(filters)}`;
      const metadata = await this.cacheService.get<PaginationCacheMetadata>(metadataKey);

      if (!metadata) {
        return;
      }

      // Invalidate metadata
      await this.cacheService.del(metadataKey);

      // Invalidate all pages
      const { totalPages } = metadata;
      for (let page = 1; page <= totalPages; page++) {
        const pageKey = this.generatePageKey(keyPrefix, filters, page);
        await this.cacheService.del(pageKey);

        // Also delete access time
        const accessKey = `pagination:access:${pageKey}`;
        await this.cacheService.del(accessKey);
      }

      this.logger.debug(`Invalidated all pages for ${keyPrefix}`);
    } catch (error) {
      this.logger.error(`Error invalidating pages: ${error.message}`, error.stack);
    }
  }

  /**
   * Invalidate all pagination caches
   */
  async invalidateAllPages(): Promise<void> {
    try {
      // This is a simplified implementation
      // In a real-world scenario, you would need to track all active pagination caches
      // and invalidate them individually

      // For now, we'll rely on TTL expiration for most cases
      this.logger.warn('Invalidating all pagination caches is not fully implemented');

      // Emit event for monitoring
      this.eventEmitter.emit('pagination.cache.invalidated.all');
    } catch (error) {
      this.logger.error(`Error invalidating all pages: ${error.message}`, error.stack);
    }
  }

  /**
   * Invalidate pages related to a specific product
   */
  async invalidateRelatedPages(product: Product): Promise<void> {
    try {
      // Invalidate pages that might contain this product
      // This is a simplified implementation

      // Invalidate merchant pages
      await this.invalidatePages('merchant', { merchantId: product.merchantId });

      // Invalidate category pages
      for (const category of product.categories) {
        await this.invalidatePages('category', { category });
      }

      // Invalidate featured pages if product is featured
      if (product.featured) {
        await this.invalidatePages('featured', {});
      }

      // Invalidate recent products pages
      await this.invalidatePages('recent', {});

      this.logger.debug(`Invalidated pages related to product ${product.id}`);
    } catch (error) {
      this.logger.error(`Error invalidating related pages: ${error.message}`, error.stack);
    }
  }

  /**
   * Generate a cache key for a specific page
   */
  private generatePageKey(keyPrefix: string, filters: Record<string, any>, page: number): string {
    return `pagination:page:${keyPrefix}:${JSON.stringify(filters)}:${page}`;
  }

  /**
   * Determine optimal TTL for a page based on access patterns
   */
  async determineOptimalTtl(
    keyPrefix: string,
    filters: Record<string, any>,
    page: number,
  ): Promise<number> {
    try {
      const DEFAULT_TTL = 300; // 5 minutes
      const MIN_TTL = 60; // 1 minute
      const MAX_TTL = 3600; // 1 hour

      // Get page access history
      const pageKey = this.generatePageKey(keyPrefix, filters, page);
      const accessKey = `pagination:access:${pageKey}`;
      const lastAccess = await this.cacheService.get<number>(accessKey);

      if (!lastAccess) {
        return DEFAULT_TTL;
      }

      // Calculate time since last access
      const now = Date.now();
      const timeSinceLastAccess = (now - lastAccess) / 1000; // in seconds

      // Determine TTL based on access pattern
      if (timeSinceLastAccess < 60) {
        // Accessed within the last minute - frequently accessed page
        return MAX_TTL;
      } else if (timeSinceLastAccess < 300) {
        // Accessed within the last 5 minutes - moderately accessed page
        return DEFAULT_TTL * 2;
      } else if (timeSinceLastAccess < 3600) {
        // Accessed within the last hour - infrequently accessed page
        return DEFAULT_TTL;
      } else {
        // Not accessed for over an hour - rarely accessed page
        return MIN_TTL;
      }
    } catch (error) {
      this.logger.error(`Error determining optimal TTL: ${error.message}`, error.stack);
      return this.DEFAULT_TTL;
    }
  }
}
