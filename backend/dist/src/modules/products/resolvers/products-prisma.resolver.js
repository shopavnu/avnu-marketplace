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
exports.ProductsPrismaResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const products_prisma_service_1 = require("../services/products-prisma.service");
let ProductsPrismaResolver = class ProductsPrismaResolver {
    constructor(productsService) {
        this.productsService = productsService;
    }
    async getProducts(skip, take) {
        return this.productsService.findAll({
            skip,
            take,
            includeVariants: true,
            includeBrand: true,
        });
    }
    async getProduct(id) {
        return this.productsService.findOne(id);
    }
    async createProduct(title, description, price, imageUrl, brandId, variants) {
        return this.productsService.create({
            title,
            description,
            price,
            imageUrl,
            brandId,
            variants,
        });
    }
    async updateProduct(id, title, description, price, imageUrl, brandId) {
        return this.productsService.update(id, {
            title,
            description,
            price,
            imageUrl,
            brandId,
        });
    }
    async deleteProduct(id) {
        return this.productsService.remove(id);
    }
    async searchProducts(query) {
        return this.productsService.searchProducts(query);
    }
    async getProductsByBrand(brandId) {
        return this.productsService.getProductsByBrand(brandId);
    }
};
exports.ProductsPrismaResolver = ProductsPrismaResolver;
__decorate([
    (0, graphql_1.Query)('products'),
    __param(0, (0, graphql_1.Args)('skip', { nullable: true, type: () => graphql_1.Int })),
    __param(1, (0, graphql_1.Args)('take', { nullable: true, type: () => graphql_1.Int })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ProductsPrismaResolver.prototype, "getProducts", null);
__decorate([
    (0, graphql_1.Query)('product'),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsPrismaResolver.prototype, "getProduct", null);
__decorate([
    (0, graphql_1.Mutation)('createProduct'),
    __param(0, (0, graphql_1.Args)('title')),
    __param(1, (0, graphql_1.Args)('description')),
    __param(2, (0, graphql_1.Args)('price')),
    __param(3, (0, graphql_1.Args)('imageUrl')),
    __param(4, (0, graphql_1.Args)('brandId')),
    __param(5, (0, graphql_1.Args)('variants', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, String, String, Array]),
    __metadata("design:returntype", Promise)
], ProductsPrismaResolver.prototype, "createProduct", null);
__decorate([
    (0, graphql_1.Mutation)('updateProduct'),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('title', { nullable: true })),
    __param(2, (0, graphql_1.Args)('description', { nullable: true })),
    __param(3, (0, graphql_1.Args)('price', { nullable: true })),
    __param(4, (0, graphql_1.Args)('imageUrl', { nullable: true })),
    __param(5, (0, graphql_1.Args)('brandId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, String, String]),
    __metadata("design:returntype", Promise)
], ProductsPrismaResolver.prototype, "updateProduct", null);
__decorate([
    (0, graphql_1.Mutation)('deleteProduct'),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsPrismaResolver.prototype, "deleteProduct", null);
__decorate([
    (0, graphql_1.Query)('searchProducts'),
    __param(0, (0, graphql_1.Args)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsPrismaResolver.prototype, "searchProducts", null);
__decorate([
    (0, graphql_1.Query)('productsByBrand'),
    __param(0, (0, graphql_1.Args)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsPrismaResolver.prototype, "getProductsByBrand", null);
exports.ProductsPrismaResolver = ProductsPrismaResolver = __decorate([
    (0, graphql_1.Resolver)('Product'),
    __metadata("design:paramtypes", [products_prisma_service_1.ProductsPrismaService])
], ProductsPrismaResolver);
//# sourceMappingURL=products-prisma.resolver.js.map