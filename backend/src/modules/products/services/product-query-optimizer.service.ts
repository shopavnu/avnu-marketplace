import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, DataSource } from 'typeorm';
import { Product } from '../entities/product.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ProductCacheService } from './product-cache.service';
import { ResilientCacheService } from '../../../common/services/resilient-cache.service';
import { QueryAnalyticsService } from './query-analytics.service';
import { PaginationCacheService } from './pagination-cache.service';

interface QueryFilters {
  categories?: string[];
  priceMin?: number;
  priceMax?: number;
  merchantId?: string;
  inStock?: boolean;
  featured?: boolean;
  values?: string[];
  isActive?: boolean;
  isSuppressed?: boolean;
  searchQuery?: string;
  orderByRelevance?: boolean;
}

@Injectable()
export class ProductQueryOptimizerService {
  private readonly logger = new Logger(ProductQueryOptimizerService.name);

  private isPostgres: boolean = false;

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly productCacheService: ProductCacheService,
    private readonly resilientCacheService: ResilientCacheService,
    private readonly queryAnalyticsService: QueryAnalyticsService,
    private readonly paginationCacheService: PaginationCacheService,
    private readonly dataSource: DataSource,
  ) {
    // Determine if we're using PostgreSQL
    this.isPostgres = this.dataSource.options.type === 'postgres';
    this.logger.log(
      `Database type: ${this.dataSource.options.type}, PostgreSQL optimizations ${this.isPostgres ? 'enabled' : 'disabled'}`,
    );
  }

  /**
   * Generate a cache key for a specific query with filters
   */
  generateQueryCacheKey(filters: QueryFilters, page: number, limit: number): string {
    // Sort filter keys for consistent cache key generation
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((obj, key) => {
        obj[key] = filters[key];
        return obj;
      }, {});

    return `products:query:${JSON.stringify(sortedFilters)}:page:${page}:limit:${limit}`;
  }

  /**
   * Determine the optimal cache TTL based on query analytics
   */
  async determineOptimalCacheTtl(
    queryPattern: string,
    filters: Record<string, any>,
    executionTime: number,
  ): Promise<number> {
    // Default TTL values
    const DEFAULT_TTL = 300; // 5 minutes
    const MIN_TTL = 60; // 1 minute
    const MAX_TTL = 3600; // 1 hour

    try {
      // Generate query ID
      const queryId = this.queryAnalyticsService.generateQueryId(queryPattern, filters);

      // Get analytics for this query
      const analytics = await this.queryAnalyticsService.getQueryAnalyticsById(queryId);

      if (!analytics) {
        return DEFAULT_TTL;
      }

      // Determine TTL based on frequency and execution time
      // High frequency queries should have longer TTL to reduce database load
      // Slow queries should have longer TTL to avoid performance impact

      let ttl = DEFAULT_TTL;

      // Adjust TTL based on frequency (queries per hour)
      if (analytics.frequency > 100) {
        // Very high frequency - longer cache time
        ttl = Math.min(MAX_TTL, ttl * 2);
      } else if (analytics.frequency > 50) {
        // High frequency - slightly longer cache time
        ttl = Math.min(MAX_TTL, ttl * 1.5);
      } else if (analytics.frequency < 5) {
        // Low frequency - shorter cache time
        ttl = Math.max(MIN_TTL, ttl * 0.8);
      }

      // Adjust TTL based on execution time
      if (executionTime > 500) {
        // Very slow query - longer cache time
        ttl = Math.min(MAX_TTL, ttl * 1.5);
      } else if (executionTime > 200) {
        // Slow query - slightly longer cache time
        ttl = Math.min(MAX_TTL, ttl * 1.2);
      }

      return Math.round(ttl);
    } catch (error) {
      this.logger.warn(`Error determining optimal cache TTL: ${error.message}`);
      return DEFAULT_TTL;
    }
  }

  /**
   * Optimize query for product listings with advanced filtering
   */
  async optimizedQuery(
    filters: QueryFilters,
    paginationDto: PaginationDto,
  ): Promise<{ items: Product[]; total: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const cacheKey = this.generateQueryCacheKey(filters, page, limit);
    const queryPattern = 'ProductListing';

    // Try to get from pagination cache first (more efficient for paginated data)
    try {
      const paginatedResult = await this.paginationCacheService.getPage(
        queryPattern,
        filters,
        page,
      );
      if (paginatedResult) {
        this.logger.debug(`Pagination cache hit for query: ${queryPattern}, page: ${page}`);
        return {
          items: paginatedResult.items,
          total: paginatedResult.metadata.totalItems,
        };
      }
    } catch (error) {
      this.logger.warn(`Pagination cache retrieval error: ${error.message}`);
    }

    // Fall back to regular cache if pagination cache misses
    try {
      const cachedResult = await this.resilientCacheService.get<{
        items: Product[];
        total: number;
      }>(cacheKey);
      if (cachedResult) {
        this.logger.debug(`Cache hit for query: ${cacheKey}`);
        return cachedResult;
      }
    } catch (error) {
      this.logger.warn(`Cache retrieval error: ${error.message}`);
    }

    // Cache miss, build optimized query
    const startTime = performance.now();
    const skip = (page - 1) * limit;

    // Create query builder with optimized joins and where clauses
    const queryBuilder = this.buildOptimizedQuery(filters);

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [items, total] = await queryBuilder.getManyAndCount();

    const endTime = performance.now();
    const executionTime = endTime - startTime;
    this.logger.debug(`Query execution time: ${executionTime}ms`);

    // Record query metrics for analytics
    this.queryAnalyticsService.recordQuery(queryPattern, filters, executionTime, items.length);

    // Cache the results
    const result = { items, total };
    try {
      // Determine cache TTL based on query frequency and performance
      const cacheTtl = await this.determineOptimalCacheTtl(queryPattern, filters, executionTime);

      // Store in regular cache
      await this.resilientCacheService.set(cacheKey, result, cacheTtl);

      // Also store in pagination cache for more efficient pagination
      await this.paginationCacheService.cachePage(page, items, {
        keyPrefix: queryPattern,
        filters,
        totalItems: total,
        pageSize: limit,
        ttl: cacheTtl,
      });
    } catch (error) {
      this.logger.warn(`Cache storage error: ${error.message}`);
    }

    return result;
  }

  /**
   * Build an optimized query with the given filters
   */
  private buildOptimizedQuery(filters: QueryFilters): SelectQueryBuilder<Product> {
    const queryBuilder = this.productsRepository.createQueryBuilder('product');

    // Apply PostgreSQL-specific optimizations if available
    if (this.isPostgres) {
      return this.buildPostgresOptimizedQuery(queryBuilder, filters);
    } else {
      return this.buildStandardOptimizedQuery(queryBuilder, filters);
    }
  }

  /**
   * Build a standard optimized query for any database
   */
  private buildStandardOptimizedQuery(
    queryBuilder: SelectQueryBuilder<Product>,
    filters: QueryFilters,
  ): SelectQueryBuilder<Product> {
    // Apply filters
    if (filters.merchantId) {
      queryBuilder.andWhere('product.merchantId = :merchantId', { merchantId: filters.merchantId });
    }

    if (filters.inStock !== undefined) {
      queryBuilder.andWhere('product.inStock = :inStock', { inStock: filters.inStock });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.isSuppressed !== undefined) {
      queryBuilder.andWhere('product.isSuppressed = :isSuppressed', {
        isSuppressed: filters.isSuppressed,
      });
    }

    if (filters.featured !== undefined) {
      queryBuilder.andWhere('product.featured = :featured', { featured: filters.featured });
    }

    if (filters.priceMin !== undefined) {
      queryBuilder.andWhere('product.price >= :priceMin', { priceMin: filters.priceMin });
    }

    if (filters.priceMax !== undefined) {
      queryBuilder.andWhere('product.price <= :priceMax', { priceMax: filters.priceMax });
    }

    if (filters.categories && filters.categories.length > 0) {
      // For each category, check if it's in the categories array
      // This is a workaround for simple-array column type
      filters.categories.forEach((category, index) => {
        queryBuilder.andWhere(`product.categories LIKE :category${index}`, {
          [`category${index}`]: `%${category}%`,
        });
      });
    }

    if (filters.values && filters.values.length > 0) {
      // Similar approach for values array
      filters.values.forEach((value, index) => {
        queryBuilder.andWhere(`product.values LIKE :value${index}`, {
          [`value${index}`]: `%${value}%`,
        });
      });
    }

    if (filters.searchQuery) {
      queryBuilder.andWhere(
        '(product.title LIKE :query OR product.description LIKE :query OR product.brandName LIKE :query)',
        { query: `%${filters.searchQuery}%` },
      );
    }

    // Add default ordering
    queryBuilder.orderBy('product.createdAt', 'DESC');
    queryBuilder.addOrderBy('product.id', 'DESC'); // Ensure stable sorting

    return queryBuilder;
  }

  /**
   * Build a PostgreSQL-optimized query using PostgreSQL-specific features
   */
  private buildPostgresOptimizedQuery(
    queryBuilder: SelectQueryBuilder<Product>,
    filters: QueryFilters,
  ): SelectQueryBuilder<Product> {
    // Apply standard filters first
    if (filters.merchantId) {
      queryBuilder.andWhere('product.merchantId = :merchantId', { merchantId: filters.merchantId });
    }

    if (filters.inStock !== undefined) {
      queryBuilder.andWhere('product.inStock = :inStock', { inStock: filters.inStock });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.isSuppressed !== undefined) {
      queryBuilder.andWhere('product.isSuppressed = :isSuppressed', {
        isSuppressed: filters.isSuppressed,
      });
    }

    if (filters.featured !== undefined) {
      queryBuilder.andWhere('product.featured = :featured', { featured: filters.featured });
    }

    // Use price range index for price filtering
    if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
      // If both min and max are specified, use BETWEEN for better performance
      queryBuilder.andWhere('product.price BETWEEN :priceMin AND :priceMax', {
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
      });
    } else if (filters.priceMin !== undefined) {
      queryBuilder.andWhere('product.price >= :priceMin', { priceMin: filters.priceMin });
    } else if (filters.priceMax !== undefined) {
      queryBuilder.andWhere('product.price <= :priceMax', { priceMax: filters.priceMax });
    }

    // Use GIN index for category filtering
    if (filters.categories && filters.categories.length > 0) {
      // Join categories with | for OR search in PostgreSQL
      const categoryPattern = filters.categories.join('|');
      queryBuilder.andWhere('product.categories ~ :categoryPattern', { categoryPattern });
    }

    if (filters.values && filters.values.length > 0) {
      // Similar approach for values array
      const valuesPattern = filters.values.join('|');
      queryBuilder.andWhere('product.values ~ :valuesPattern', { valuesPattern });
    }

    // Use full-text search for search queries
    if (filters.searchQuery) {
      // Use PostgreSQL's full-text search capabilities
      queryBuilder.andWhere(
        "to_tsvector('english', product.title || ' ' || product.description) @@ plainto_tsquery('english', :searchQuery)",
        { searchQuery: filters.searchQuery },
      );

      // Add relevance ranking for ordering by search relevance
      if (filters.orderByRelevance) {
        queryBuilder.addSelect(
          "ts_rank(to_tsvector('english', product.title || ' ' || product.description), plainto_tsquery('english', :searchQuery))",
          'relevance',
        );
        queryBuilder.orderBy('relevance', 'DESC');
      }
    }

    // Add default ordering if not ordering by relevance
    if (!filters.orderByRelevance || !filters.searchQuery) {
      queryBuilder.orderBy('product.createdAt', 'DESC');
      queryBuilder.addOrderBy('product.id', 'DESC'); // Ensure stable sorting
    }

    return queryBuilder;
  }

  /**
   * Warm up cache for common filter combinations
   */
  async warmupQueryCache(): Promise<void> {
    this.logger.log('Starting query cache warmup...');

    const commonFilters: QueryFilters[] = [
      { inStock: true, isActive: true },
      { featured: true, inStock: true, isActive: true },
      { isSuppressed: false, isActive: true },
      // Add more common filter combinations as needed
    ];

    const paginationOptions = [
      { page: 1, limit: 10 },
      { page: 1, limit: 20 },
      { page: 1, limit: 50 },
    ];

    const promises = [];

    for (const filter of commonFilters) {
      for (const pagination of paginationOptions) {
        promises.push(this.optimizedQuery(filter, pagination));
      }
    }

    await Promise.all(promises);
    this.logger.log('Query cache warmup completed');
  }
}
