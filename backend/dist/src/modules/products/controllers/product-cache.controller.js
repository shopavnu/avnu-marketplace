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
var ProductCacheController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductCacheController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const user_entity_1 = require("../../users/entities/user.entity");
const cache_warming_service_1 = require("../services/cache-warming.service");
const product_cache_service_1 = require("../services/product-cache.service");
let ProductCacheController = ProductCacheController_1 = class ProductCacheController {
    constructor(cacheWarmingService, productCacheService) {
        this.cacheWarmingService = cacheWarmingService;
        this.productCacheService = productCacheService;
        this.logger = new common_1.Logger(ProductCacheController_1.name);
    }
    async warmCache() {
        this.logger.log('Admin triggered cache warming');
        return this.cacheWarmingService.triggerCacheWarming();
    }
    async invalidateAllCache() {
        this.logger.log('Admin triggered full cache invalidation');
        await this.productCacheService.invalidateAllProductsCache();
        return { success: true, message: 'All product cache invalidated successfully' };
    }
    async invalidateMerchantCache(merchantId) {
        this.logger.log(`Admin triggered cache invalidation for merchant ${merchantId}`);
        await this.productCacheService.invalidateProductsByMerchant(merchantId);
        return { success: true, message: `Cache for merchant ${merchantId} invalidated successfully` };
    }
};
exports.ProductCacheController = ProductCacheController;
__decorate([
    (0, common_1.Post)('warm'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductCacheController.prototype, "warmCache", null);
__decorate([
    (0, common_1.Post)('invalidate/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductCacheController.prototype, "invalidateAllCache", null);
__decorate([
    (0, common_1.Post)('invalidate/merchant/:merchantId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductCacheController.prototype, "invalidateMerchantCache", null);
exports.ProductCacheController = ProductCacheController = ProductCacheController_1 = __decorate([
    (0, common_1.Controller)('admin/products/cache'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [cache_warming_service_1.CacheWarmingService,
        product_cache_service_1.ProductCacheService])
], ProductCacheController);
//# sourceMappingURL=product-cache.controller.js.map