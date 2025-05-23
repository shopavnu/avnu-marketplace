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
exports.BrandsPrismaResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const brands_prisma_service_1 = require("../services/brands-prisma.service");
let BrandsPrismaResolver = class BrandsPrismaResolver {
    constructor(brandsService) {
        this.brandsService = brandsService;
    }
    async getBrands(skip, take, includeProducts) {
        return this.brandsService.findAll({
            skip,
            take,
            includeProducts,
        });
    }
    async getBrand(id, includeProducts) {
        return this.brandsService.findOne(id, includeProducts);
    }
    async createBrand(name) {
        return this.brandsService.create({ name });
    }
    async updateBrand(id, name) {
        return this.brandsService.update(id, { name });
    }
    async deleteBrand(id) {
        return this.brandsService.remove(id);
    }
    async searchBrands(query) {
        return this.brandsService.searchBrands(query);
    }
    async getBrandWithProducts(id) {
        return this.brandsService.getBrandWithProducts(id);
    }
};
exports.BrandsPrismaResolver = BrandsPrismaResolver;
__decorate([
    (0, graphql_1.Query)('brands'),
    __param(0, (0, graphql_1.Args)('skip', { nullable: true, type: () => graphql_1.Int })),
    __param(1, (0, graphql_1.Args)('take', { nullable: true, type: () => graphql_1.Int })),
    __param(2, (0, graphql_1.Args)('includeProducts', { nullable: true, type: () => Boolean })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Boolean]),
    __metadata("design:returntype", Promise)
], BrandsPrismaResolver.prototype, "getBrands", null);
__decorate([
    (0, graphql_1.Query)('brand'),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('includeProducts', { nullable: true, type: () => Boolean })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], BrandsPrismaResolver.prototype, "getBrand", null);
__decorate([
    (0, graphql_1.Mutation)('createBrand'),
    __param(0, (0, graphql_1.Args)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandsPrismaResolver.prototype, "createBrand", null);
__decorate([
    (0, graphql_1.Mutation)('updateBrand'),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('name', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BrandsPrismaResolver.prototype, "updateBrand", null);
__decorate([
    (0, graphql_1.Mutation)('deleteBrand'),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandsPrismaResolver.prototype, "deleteBrand", null);
__decorate([
    (0, graphql_1.Query)('searchBrands'),
    __param(0, (0, graphql_1.Args)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandsPrismaResolver.prototype, "searchBrands", null);
__decorate([
    (0, graphql_1.Query)('brandWithProducts'),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandsPrismaResolver.prototype, "getBrandWithProducts", null);
exports.BrandsPrismaResolver = BrandsPrismaResolver = __decorate([
    (0, graphql_1.Resolver)('Brand'),
    __metadata("design:paramtypes", [brands_prisma_service_1.BrandsPrismaService])
], BrandsPrismaResolver);
//# sourceMappingURL=brands-prisma.resolver.js.map