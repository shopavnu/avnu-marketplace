"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProductQueryOptimizerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductQueryOptimizerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../entities/product.entity");
const product_cache_service_1 = require("./product-cache.service");
const resilient_cache_service_1 = require("../../../common/services/resilient-cache.service");
const query_analytics_service_1 = require("./query-analytics.service");
const pagination_cache_service_1 = require("./pagination-cache.service");
let ProductQueryOptimizerService = ProductQueryOptimizerService_1 = class ProductQueryOptimizerService {
    constructor(productsRepository, productCacheService, resilientCacheService, queryAnalyticsService, paginationCacheService, dataSource) {
        this.productsRepository = productsRepository;
        this.productCacheService = productCacheService;
        this.resilientCacheService = resilientCacheService;
        this.queryAnalyticsService = queryAnalyticsService;
        this.paginationCacheService = paginationCacheService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(ProductQueryOptimizerService_1.name);
        this.isPostgres = false;
        this.isPostgres = this.dataSource.options.type === 'postgres';
        this.logger.log(`Database type: ${this.dataSource.options.type}, PostgreSQL optimizations ${this.isPostgres ? 'enabled' : 'disabled'}`);
    }
    generateQueryCacheKey(filters, page, limit) {
        const sortedFilters = Object.keys(filters)
            .sort()
            .reduce((obj, key) => {
            obj[key] = filters[key];
            return obj;
        }, {});
        return `products:query:${JSON.stringify(sortedFilters)}:page:${page}:limit:${limit}`;
    }
    async determineOptimalCacheTtl(queryPattern, filters, executionTime) {
        const DEFAULT_TTL = 300;
        const MIN_TTL = 60;
        const MAX_TTL = 3600;
        try {
            const queryId = this.queryAnalyticsService.generateQueryId(queryPattern, filters);
            const analytics = await this.queryAnalyticsService.getQueryAnalyticsById(queryId);
            if (!analytics) {
                return DEFAULT_TTL;
            }
            let ttl = DEFAULT_TTL;
            if (analytics.frequency > 100) {
                ttl = Math.min(MAX_TTL, ttl * 2);
            }
            else if (analytics.frequency > 50) {
                ttl = Math.min(MAX_TTL, ttl * 1.5);
            }
            else if (analytics.frequency < 5) {
                ttl = Math.max(MIN_TTL, ttl * 0.8);
            }
            if (executionTime > 500) {
                ttl = Math.min(MAX_TTL, ttl * 1.5);
            }
            else if (executionTime > 200) {
                ttl = Math.min(MAX_TTL, ttl * 1.2);
            }
            return Math.round(ttl);
        }
        catch (error) {
            this.logger.warn(`Error determining optimal cache TTL: ${error.message}`);
            return DEFAULT_TTL;
        }
    }
    async optimizedQuery(filters, paginationDto) {
        const { page = 1, limit = 10 } = paginationDto;
        const cacheKey = this.generateQueryCacheKey(filters, page, limit);
        const queryPattern = 'ProductListing';
        try {
            const paginatedResult = await this.paginationCacheService.getPage(queryPattern, filters, page);
            if (paginatedResult) {
                this.logger.debug(`Pagination cache hit for query: ${queryPattern}, page: ${page}`);
                return {
                    items: paginatedResult.items,
                    total: paginatedResult.metadata.totalItems,
                };
            }
        }
        catch (error) {
            this.logger.warn(`Pagination cache retrieval error: ${error.message}`);
        }
        try {
            const cachedResult = await this.resilientCacheService.get(cacheKey);
            if (cachedResult) {
                this.logger.debug(`Cache hit for query: ${cacheKey}`);
                return cachedResult;
            }
        }
        catch (error) {
            this.logger.warn(`Cache retrieval error: ${error.message}`);
        }
        const startTime = performance.now();
        const skip = (page - 1) * limit;
        const queryBuilder = this.buildOptimizedQuery(filters);
        queryBuilder.skip(skip).take(limit);
        const [items, total] = await queryBuilder.getManyAndCount();
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        this.logger.debug(`Query execution time: ${executionTime}ms`);
        this.queryAnalyticsService.recordQuery(queryPattern, filters, executionTime, items.length);
        const result = { items, total };
        try {
            const cacheTtl = await this.determineOptimalCacheTtl(queryPattern, filters, executionTime);
            await this.resilientCacheService.set(cacheKey, result, cacheTtl);
            await this.paginationCacheService.cachePage(page, items, {
                keyPrefix: queryPattern,
                filters,
                totalItems: total,
                pageSize: limit,
                ttl: cacheTtl,
            });
        }
        catch (error) {
            this.logger.warn(`Cache storage error: ${error.message}`);
        }
        return result;
    }
    buildOptimizedQuery(filters) {
        const queryBuilder = this.productsRepository.createQueryBuilder('product');
        if (this.isPostgres) {
            return this.buildPostgresOptimizedQuery(queryBuilder, filters);
        }
        else {
            return this.buildStandardOptimizedQuery(queryBuilder, filters);
        }
    }
    buildStandardOptimizedQuery(queryBuilder, filters) {
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
            filters.categories.forEach((category, index) => {
                queryBuilder.andWhere(`product.categories LIKE :category${index}`, {
                    [`category${index}`]: `%${category}%`,
                });
            });
        }
        if (filters.values && filters.values.length > 0) {
            filters.values.forEach((value, index) => {
                queryBuilder.andWhere(`product.values LIKE :value${index}`, {
                    [`value${index}`]: `%${value}%`,
                });
            });
        }
        if (filters.searchQuery) {
            queryBuilder.andWhere('(product.title LIKE :query OR product.description LIKE :query OR product.brandName LIKE :query)', { query: `%${filters.searchQuery}%` });
        }
        queryBuilder.orderBy('product.createdAt', 'DESC');
        queryBuilder.addOrderBy('product.id', 'DESC');
        return queryBuilder;
    }
    buildPostgresOptimizedQuery(queryBuilder, filters) {
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
        if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
            queryBuilder.andWhere('product.price BETWEEN :priceMin AND :priceMax', {
                priceMin: filters.priceMin,
                priceMax: filters.priceMax,
            });
        }
        else if (filters.priceMin !== undefined) {
            queryBuilder.andWhere('product.price >= :priceMin', { priceMin: filters.priceMin });
        }
        else if (filters.priceMax !== undefined) {
            queryBuilder.andWhere('product.price <= :priceMax', { priceMax: filters.priceMax });
        }
        if (filters.categories && filters.categories.length > 0) {
            const categoryPattern = filters.categories.join('|');
            queryBuilder.andWhere('product.categories ~ :categoryPattern', { categoryPattern });
        }
        if (filters.values && filters.values.length > 0) {
            const valuesPattern = filters.values.join('|');
            queryBuilder.andWhere('product.values ~ :valuesPattern', { valuesPattern });
        }
        if (filters.searchQuery) {
            queryBuilder.andWhere("to_tsvector('english', product.title || ' ' || product.description) @@ plainto_tsquery('english', :searchQuery)", { searchQuery: filters.searchQuery });
            if (filters.orderByRelevance) {
                queryBuilder.addSelect("ts_rank(to_tsvector('english', product.title || ' ' || product.description), plainto_tsquery('english', :searchQuery))", 'relevance');
                queryBuilder.orderBy('relevance', 'DESC');
            }
        }
        if (!filters.orderByRelevance || !filters.searchQuery) {
            queryBuilder.orderBy('product.createdAt', 'DESC');
            queryBuilder.addOrderBy('product.id', 'DESC');
        }
        return queryBuilder;
    }
    async warmupQueryCache() {
        this.logger.log('Starting query cache warmup...');
        const commonFilters = [
            { inStock: true, isActive: true },
            { featured: true, inStock: true, isActive: true },
            { isSuppressed: false, isActive: true },
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
};
exports.ProductQueryOptimizerService = ProductQueryOptimizerService;
exports.ProductQueryOptimizerService = ProductQueryOptimizerService = ProductQueryOptimizerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        product_cache_service_1.ProductCacheService,
        resilient_cache_service_1.ResilientCacheService,
        query_analytics_service_1.QueryAnalyticsService,
        pagination_cache_service_1.PaginationCacheService,
        typeorm_2.DataSource])
], ProductQueryOptimizerService);
//# sourceMappingURL=product-query-optimizer.service.js.map