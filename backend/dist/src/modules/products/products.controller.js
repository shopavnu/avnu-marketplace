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
var ProductsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const swagger_1 = require("@nestjs/swagger");
const data_normalization_service_1 = require("./services/data-normalization.service");
const common_2 = require("@nestjs/common");
const cursor_pagination_dto_1 = require("../../common/dto/cursor-pagination.dto");
let ProductsController = ProductsController_1 = class ProductsController {
    constructor(productsService, dataNormalizationService) {
        this.productsService = productsService;
        this.dataNormalizationService = dataNormalizationService;
        this.logger = new common_2.Logger(ProductsController_1.name);
    }
    async create(createProductDto) {
        try {
            const normalizedProduct = await this.dataNormalizationService.normalizeProductData(createProductDto, createProductDto.externalSource || data_normalization_service_1.DataSource.MANUAL);
            const product = await this.productsService.create(normalizedProduct);
            return product;
        }
        catch (error) {
            this.logger.error(`Error creating product: ${error.message}`, error.stack);
            throw error;
        }
    }
    findAll(paginationDto) {
        return this.productsService.findAll(paginationDto);
    }
    async findWithCursor(cursorPaginationDto) {
        const result = await this.productsService.findWithCursor(cursorPaginationDto);
        if (result.items.length > 0) {
            const normalizedProducts = await Promise.all(result.items.map(product => this.dataNormalizationService.normalizeProduct(product)));
            result.items = normalizedProducts;
        }
        return result;
    }
    search(query, paginationDto, categories, priceMin, priceMax, merchantId, inStock, values) {
        return this.productsService.search(query, paginationDto, {
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
        return this.productsService.findByMerchant(merchantId, paginationDto);
    }
    async findOne(id) {
        const product = await this.productsService.findOne(id);
        return this.dataNormalizationService.normalizeProduct(product);
    }
    async update(id, updateProductDto) {
        try {
            const normalizedUpdateData = await this.dataNormalizationService.updateProductWithDto(id, updateProductDto);
            const updatedProduct = await this.productsService.update(id, normalizedUpdateData);
            return this.dataNormalizationService.normalizeProduct(updatedProduct);
        }
        catch (error) {
            this.logger.error(`Error updating product ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    remove(id) {
        return this.productsService.remove(id);
    }
    updateStock(id, body) {
        return this.productsService.updateStock(id, body.inStock, body.quantity);
    }
    bulkCreate(products) {
        return this.productsService.bulkCreate(products);
    }
    bulkUpdate(products) {
        return this.productsService.bulkUpdate(products);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new product' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Product successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all products with offset-based pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return all products' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('cursor'),
    (0, swagger_1.ApiOperation)({ summary: 'Get products with cursor-based pagination (for continuous scroll)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return products with cursor for next page' }),
    (0, swagger_1.ApiQuery)({
        name: 'cursor',
        required: false,
        type: String,
        description: 'Cursor for the next page',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'withCount',
        required: false,
        type: Boolean,
        description: 'Include total count in response',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cursor_pagination_dto_1.CursorPaginationDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findWithCursor", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search products' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return search results' }),
    (0, swagger_1.ApiQuery)({ name: 'query', required: false, description: 'Search query' }),
    (0, swagger_1.ApiQuery)({
        name: 'categories',
        required: false,
        isArray: true,
        description: 'Filter by categories',
    }),
    (0, swagger_1.ApiQuery)({ name: 'priceMin', required: false, description: 'Minimum price' }),
    (0, swagger_1.ApiQuery)({ name: 'priceMax', required: false, description: 'Maximum price' }),
    (0, swagger_1.ApiQuery)({ name: 'merchantId', required: false, description: 'Filter by merchant ID' }),
    (0, swagger_1.ApiQuery)({ name: 'inStock', required: false, description: 'Filter by stock status' }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Query)('categories')),
    __param(3, (0, common_1.Query)('priceMin')),
    __param(4, (0, common_1.Query)('priceMax')),
    __param(5, (0, common_1.Query)('merchantId')),
    __param(6, (0, common_1.Query)('inStock')),
    __param(7, (0, common_1.Query)('values')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto, Array, Number, Number, String, Boolean, Array]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('recommended/:userId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get recommended products for a user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return recommended products' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of products to return' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getRecommendedProducts", null);
__decorate([
    (0, common_1.Get)('discovery'),
    (0, swagger_1.ApiOperation)({ summary: 'Get discovery products' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return discovery products' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of products to return' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getDiscoveryProducts", null);
__decorate([
    (0, common_1.Get)('merchant/:merchantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get products by merchant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return merchant products' }),
    __param(0, (0, common_1.Param)('merchantId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findByMerchant", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a product by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return the product' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a product' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product successfully updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a product' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product successfully deleted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/stock'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update product stock' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stock successfully updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "updateStock", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk create products' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Products successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "bulkCreate", null);
__decorate([
    (0, common_1.Patch)('bulk'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk update products' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Products successfully updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'One or more products not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "bulkUpdate", null);
exports.ProductsController = ProductsController = ProductsController_1 = __decorate([
    (0, swagger_1.ApiTags)('products'),
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        data_normalization_service_1.DataNormalizationService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map