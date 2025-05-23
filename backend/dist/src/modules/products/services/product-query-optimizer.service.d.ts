import { Repository, DataSource } from 'typeorm';
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
export declare class ProductQueryOptimizerService {
    private readonly productsRepository;
    private readonly productCacheService;
    private readonly resilientCacheService;
    private readonly queryAnalyticsService;
    private readonly paginationCacheService;
    private readonly dataSource;
    private readonly logger;
    private isPostgres;
    constructor(productsRepository: Repository<Product>, productCacheService: ProductCacheService, resilientCacheService: ResilientCacheService, queryAnalyticsService: QueryAnalyticsService, paginationCacheService: PaginationCacheService, dataSource: DataSource);
    generateQueryCacheKey(filters: QueryFilters, page: number, limit: number): string;
    determineOptimalCacheTtl(queryPattern: string, filters: Record<string, any>, executionTime: number): Promise<number>;
    optimizedQuery(filters: QueryFilters, paginationDto: PaginationDto): Promise<{
        items: Product[];
        total: number;
    }>;
    private buildOptimizedQuery;
    private buildStandardOptimizedQuery;
    private buildPostgresOptimizedQuery;
    warmupQueryCache(): Promise<void>;
}
export {};
