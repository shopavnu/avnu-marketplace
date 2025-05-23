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
exports.CachePerformanceResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const user_entity_1 = require("../../users/entities/user.entity");
const cache_performance_monitor_service_1 = require("../services/cache-performance-monitor.service");
const cache_warming_service_1 = require("../services/cache-warming.service");
const product_cache_service_1 = require("../services/product-cache.service");
const services_1 = require("../../../common/services");
class FallbackCacheStats {
}
class CircuitBreakerOptions {
}
class CircuitBreakerMetrics {
}
class CacheStats {
}
class CachePerformanceMetrics {
}
let CachePerformanceResolver = class CachePerformanceResolver {
    constructor(cachePerformanceMonitorService, cacheWarmingService, productCacheService, resilientCacheService) {
        this.cachePerformanceMonitorService = cachePerformanceMonitorService;
        this.cacheWarmingService = cacheWarmingService;
        this.productCacheService = productCacheService;
        this.resilientCacheService = resilientCacheService;
    }
    async getCachePerformanceMetrics() {
        const metrics = this.cachePerformanceMonitorService.getMetrics();
        const cacheStats = this.resilientCacheService.getStats();
        return {
            ...metrics,
            cacheStats,
        };
    }
    async resetCachePerformanceMetrics() {
        this.cachePerformanceMonitorService.resetMetrics();
        return true;
    }
    async warmCache() {
        const result = await this.cacheWarmingService.triggerCacheWarming();
        return result.success;
    }
    async invalidateAllCache() {
        await this.productCacheService.invalidateAllProductsCache();
        return true;
    }
    async invalidateProductCache(productId) {
        await this.productCacheService.invalidateProduct(productId);
        return true;
    }
    async invalidateMerchantCache(merchantId) {
        await this.productCacheService.invalidateProductsByMerchant(merchantId);
        return true;
    }
};
exports.CachePerformanceResolver = CachePerformanceResolver;
__decorate([
    (0, graphql_1.Query)(() => CachePerformanceMetrics, { name: 'cachePerformanceMetrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CachePerformanceResolver.prototype, "getCachePerformanceMetrics", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'resetCachePerformanceMetrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CachePerformanceResolver.prototype, "resetCachePerformanceMetrics", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'warmProductCache' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CachePerformanceResolver.prototype, "warmCache", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'invalidateAllProductCache' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CachePerformanceResolver.prototype, "invalidateAllCache", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'invalidateProductCache' }),
    __param(0, (0, graphql_1.Args)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CachePerformanceResolver.prototype, "invalidateProductCache", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'invalidateMerchantProductCache' }),
    __param(0, (0, graphql_1.Args)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CachePerformanceResolver.prototype, "invalidateMerchantCache", null);
exports.CachePerformanceResolver = CachePerformanceResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [cache_performance_monitor_service_1.CachePerformanceMonitorService,
        cache_warming_service_1.CacheWarmingService,
        product_cache_service_1.ProductCacheService,
        services_1.ResilientCacheService])
], CachePerformanceResolver);
//# sourceMappingURL=cache-performance.resolver.js.map