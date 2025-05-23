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
exports.ProductsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const product_entity_1 = require("./entities/product.entity");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const gql_auth_guard_1 = require("../auth/guards/gql-auth.guard");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const product_paginated_dto_1 = require("./dto/product-paginated.dto");
let UpdateProductInput = class UpdateProductInput {
};
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], UpdateProductInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => update_product_dto_1.UpdateProductDto),
    __metadata("design:type", update_product_dto_1.UpdateProductDto)
], UpdateProductInput.prototype, "data", void 0);
UpdateProductInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateProductInput);
let ProductsResolver = class ProductsResolver {
    constructor(productsService) {
        this.productsService = productsService;
    }
    createProduct(createProductDto) {
        return this.productsService.create(createProductDto);
    }
    findAll(paginationDto) {
        return this.productsService.findAll(paginationDto || { page: 1, limit: 10 });
    }
    findOne(id) {
        return this.productsService.findOne(id);
    }
    search(query, paginationDto, categories, priceMin, priceMax, merchantId, inStock, values) {
        return this.productsService.search(query, paginationDto || { page: 1, limit: 10 }, {
            categories,
            priceMin,
            priceMax,
            merchantId,
            inStock,
            values,
        });
    }
    getRecommendedProducts(userId, limit) {
        return this.productsService.getRecommendedProducts(userId, limit);
    }
    getDiscoveryProducts(limit) {
        return this.productsService.getDiscoveryProducts(limit);
    }
    findByMerchant(merchantId, paginationDto) {
        return this.productsService.findByMerchant(merchantId, paginationDto || { page: 1, limit: 10 });
    }
    updateProduct(id, updateProductDto) {
        return this.productsService.update(id, updateProductDto);
    }
    removeProduct(id) {
        this.productsService.remove(id);
        return true;
    }
    updateProductStock(id, inStock, quantity) {
        return this.productsService.updateStock(id, inStock, quantity);
    }
    bulkCreateProducts(products) {
        return this.productsService.bulkCreate(products);
    }
    bulkUpdateProducts(products) {
        return this.productsService.bulkUpdate(products);
    }
};
exports.ProductsResolver = ProductsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => product_entity_1.Product),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('createProductInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsResolver.prototype, "createProduct", null);
__decorate([
    (0, graphql_1.Query)(() => product_paginated_dto_1.ProductPaginatedResponse, { name: 'products' }),
    __param(0, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], ProductsResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => product_entity_1.Product, { name: 'product' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Query)(() => product_paginated_dto_1.ProductPaginatedResponse, { name: 'searchProducts' }),
    __param(0, (0, graphql_1.Args)('query', { nullable: true })),
    __param(1, (0, graphql_1.Args)('pagination', { nullable: true })),
    __param(2, (0, graphql_1.Args)('categories', { type: () => [String], nullable: true })),
    __param(3, (0, graphql_1.Args)('priceMin', { type: () => graphql_1.Int, nullable: true })),
    __param(4, (0, graphql_1.Args)('priceMax', { type: () => graphql_1.Int, nullable: true })),
    __param(5, (0, graphql_1.Args)('merchantId', { nullable: true })),
    __param(6, (0, graphql_1.Args)('inStock', { nullable: true })),
    __param(7, (0, graphql_1.Args)('values', { type: () => [String], nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto, Array, Number, Number, String, Boolean, Array]),
    __metadata("design:returntype", void 0)
], ProductsResolver.prototype, "search", null);
__decorate([
    (0, graphql_1.Query)(() => [product_entity_1.Product], { name: 'recommendedProducts' }),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('userId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], ProductsResolver.prototype, "getRecommendedProducts", null);
__decorate([
    (0, graphql_1.Query)(() => [product_entity_1.Product], { name: 'discoveryProducts' }),
    __param(0, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsResolver.prototype, "getDiscoveryProducts", null);
__decorate([
    (0, graphql_1.Query)(() => product_paginated_dto_1.ProductPaginatedResponse, { name: 'merchantProducts' }),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], ProductsResolver.prototype, "findByMerchant", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_entity_1.Product),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('updateProductInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsResolver.prototype, "updateProduct", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsResolver.prototype, "removeProduct", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_entity_1.Product),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('inStock')),
    __param(2, (0, graphql_1.Args)('quantity', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Number]),
    __metadata("design:returntype", void 0)
], ProductsResolver.prototype, "updateProductStock", null);
__decorate([
    (0, graphql_1.Mutation)(() => [product_entity_1.Product]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('products', { type: () => [create_product_dto_1.CreateProductDto] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], ProductsResolver.prototype, "bulkCreateProducts", null);
__decorate([
    (0, graphql_1.Mutation)(() => [product_entity_1.Product]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('products', { type: () => [UpdateProductInput] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], ProductsResolver.prototype, "bulkUpdateProducts", null);
exports.ProductsResolver = ProductsResolver = __decorate([
    (0, graphql_1.Resolver)(() => product_entity_1.Product),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsResolver);
//# sourceMappingURL=products.resolver.js.map