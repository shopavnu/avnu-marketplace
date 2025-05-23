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
exports.BrandsController = void 0;
const common_1 = require("@nestjs/common");
const brands_prisma_service_1 = require("../services/brands-prisma.service");
const clerk_auth_1 = require("../../clerk-auth");
let BrandsController = class BrandsController {
    constructor(brandsService) {
        this.brandsService = brandsService;
    }
    async list(skip, take) {
        return this.brandsService.findAll({
            skip,
            take,
            includeProducts: false,
        });
    }
    async findOne(id, includeProducts) {
        return this.brandsService.findOne(id, includeProducts === true);
    }
    async getBrandProducts(id) {
        return this.brandsService.getBrandWithProducts(id);
    }
    async create(data, userId) {
        console.log(`User ${userId} is creating a brand`);
        return this.brandsService.create(data);
    }
    async update(id, data, userId) {
        console.log(`User ${userId} is updating brand ${id}`);
        return this.brandsService.update(id, data);
    }
    async remove(id, userId) {
        console.log(`User ${userId} is deleting brand ${id}`);
        return this.brandsService.remove(id);
    }
};
exports.BrandsController = BrandsController;
__decorate([
    (0, clerk_auth_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('skip', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('take', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "list", null);
__decorate([
    (0, clerk_auth_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('includeProducts')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "findOne", null);
__decorate([
    (0, clerk_auth_1.Public)(),
    (0, common_1.Get)(':id/products'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "getBrandProducts", null);
__decorate([
    (0, common_1.UseGuards)(clerk_auth_1.ClerkAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, clerk_auth_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(clerk_auth_1.ClerkAuthGuard),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, clerk_auth_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(clerk_auth_1.ClerkAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, clerk_auth_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "remove", null);
exports.BrandsController = BrandsController = __decorate([
    (0, common_1.Controller)('brands'),
    __metadata("design:paramtypes", [brands_prisma_service_1.BrandsPrismaService])
], BrandsController);
//# sourceMappingURL=brands.controller.js.map