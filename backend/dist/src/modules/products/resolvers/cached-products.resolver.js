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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedProductsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const user_entity_1 = require("../../users/entities/user.entity");
const cached_products_service_1 = require("../services/cached-products.service");
const product_cache_service_1 = require("../services/product-cache.service");
const cache_warming_service_1 = require("../services/cache-warming.service");
const product_entity_1 = require("../entities/product.entity");
const pagination_dto_1 = require("../../../common/dto/pagination.dto");
const cursor_pagination_dto_1 = require("../../../common/dto/cursor-pagination.dto");
let CachedProductsResolver = class CachedProductsResolver {
    constructor(cachedProductsService, productCacheService, cacheWarmingService) {
        this.cachedProductsService = cachedProductsService;
        this.productCacheService = productCacheService;
        this.cacheWarmingService = cacheWarmingService;
    }
    async findOne(id) {
        return this.cachedProductsService.findOne(id);
    }
    async findAll(paginationDto) {
        const result = await this.cachedProductsService.findAll(paginationDto);
        return result.items;
    }
    async findByCursor(paginationDto) {
        const result = await this.cachedProductsService.findWithCursor(paginationDto);
        return result.items;
    }
    async findByMerchant(merchantId, paginationDto) {
        const result = await this.cachedProductsService.findByMerchant(merchantId, paginationDto);
        return result.items;
    }
    async getRecommendedProducts(userId, limit) {
        return this.cachedProductsService.getRecommendedProducts(userId, limit);
    }
    async getDiscoveryProducts(limit) {
        return this.cachedProductsService.getDiscoveryProducts(limit);
    }
    async search(query, paginationDto, filters) {
        const result = await this.cachedProductsService.search(query, paginationDto, filters);
        return result.items;
    }
    async warmCache() {
        const result = await this.cacheWarmingService.triggerCacheWarming();
        return result.success;
    }
    async invalidateCache(productId, merchantId, all) {
        if (productId) {
            await this.productCacheService.invalidateProduct(productId);
            return true;
        }
        if (merchantId) {
            await this.productCacheService.invalidateProductsByMerchant(merchantId);
            return true;
        }
        if (all) {
            await this.productCacheService.invalidateAllProductsCache();
            return true;
        }
        return false;
    }
};
exports.CachedProductsResolver = CachedProductsResolver;
__decorate([
    (0, graphql_1.Query)(() => product_entity_1.Product, { name: 'cachedProduct' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CachedProductsResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Query)(() => [product_entity_1.Product], { name: 'cachedProducts' }),
    __param(0, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], CachedProductsResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => [product_entity_1.Product], { name: 'cachedProductsByCursor' }),
    __param(0, (0, graphql_1.Args)('pagination')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cursor_pagination_dto_1.CursorPaginationDto]),
    __metadata("design:returntype", Promise)
], CachedProductsResolver.prototype, "findByCursor", null);
__decorate([
    (0, graphql_1.Query)(() => [product_entity_1.Product], { name: 'cachedProductsByMerchant' }),
    __param(0, (0, graphql_1.Args)('merchantId')),
    __param(1, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], CachedProductsResolver.prototype, "findByMerchant", null);
__decorate([
    (0, graphql_1.Query)(() => [product_entity_1.Product], { name: 'cachedRecommendedProducts' }),
    __param(0, (0, graphql_1.Args)('userId')),
    __param(1, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], CachedProductsResolver.prototype, "getRecommendedProducts", null);
__decorate([
    (0, graphql_1.Query)(() => [product_entity_1.Product], { name: 'cachedDiscoveryProducts' }),
    __param(0, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CachedProductsResolver.prototype, "getDiscoveryProducts", null);
__decorate([
    (0, graphql_1.Query)(() => [product_entity_1.Product], { name: 'cachedSearchProducts' }),
    __param(0, (0, graphql_1.Args)('query')),
    __param(1, (0, graphql_1.Args)('pagination', { nullable: true })),
    __param(2, (0, graphql_1.Args)('filters', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto, Object]),
    __metadata("design:returntype", Promise)
], CachedProductsResolver.prototype, "search", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'warmProductCache' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CachedProductsResolver.prototype, "warmCache", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'invalidateProductCache' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('productId', { nullable: true })),
    __param(1, (0, graphql_1.Args)('merchantId', { nullable: true })),
    __param(2, (0, graphql_1.Args)('all', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean]),
    __metadata("design:returntype", Promise)
], CachedProductsResolver.prototype, "invalidateCache", null);
exports.CachedProductsResolver = CachedProductsResolver = __decorate([
    (0, graphql_1.Resolver)(() => product_entity_1.Product),
    __metadata("design:paramtypes", [cached_products_service_1.CachedProductsService,
        product_cache_service_1.ProductCacheService,
        cache_warming_service_1.CacheWarmingService])
], CachedProductsResolver);
//# sourceMappingURL=cached-products.resolver.js.map