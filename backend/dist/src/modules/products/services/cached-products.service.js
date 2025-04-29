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
var CachedProductsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const product_entity_1 = require("../entities/product.entity");
const product_cache_service_1 = require("./product-cache.service");
const product_query_optimizer_service_1 = require("./product-query-optimizer.service");
let CachedProductsService = CachedProductsService_1 = class CachedProductsService {
    constructor(productsRepository, eventEmitter, productCacheService, queryOptimizerService) {
        this.productsRepository = productsRepository;
        this.eventEmitter = eventEmitter;
        this.productCacheService = productCacheService;
        this.queryOptimizerService = queryOptimizerService;
        this.logger = new common_1.Logger(CachedProductsService_1.name);
    }
    async create(createProductDto) {
        const newProduct = this.productsRepository.create(createProductDto);
        const savedProduct = await this.productsRepository.save(newProduct);
        this.eventEmitter.emit('product.created', savedProduct);
        return savedProduct;
    }
    async findAll(paginationDto) {
        const { page = 1, limit = 10 } = paginationDto || {};
        const cachedProducts = await this.productCacheService.getCachedProductsList(page, limit);
        if (cachedProducts) {
            return {
                ...cachedProducts,
                page,
                limit,
                totalPages: Math.ceil(cachedProducts.total / limit),
            };
        }
        const startTime = Date.now();
        const skip = (page - 1) * limit;
        const [items, total] = await this.productsRepository.findAndCount({
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        const endTime = Date.now();
        this.eventEmitter.emit('cache.response.time.without', endTime - startTime);
        const result = {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
        await this.productCacheService.cacheProductsList({ items, total }, page, limit);
        return result;
    }
    async findWithCursor(paginationDto, filter) {
        const { cursor, limit = 20, withCount = false } = paginationDto;
        const cachedProducts = await this.productCacheService.getCachedProductsByCursor(cursor, limit);
        if (cachedProducts) {
            return cachedProducts;
        }
        let where = filter || {};
        let prevCursor;
        if (cursor) {
            try {
                const decodedCursor = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
                prevCursor = cursor;
                where = {
                    createdAt: (0, typeorm_2.LessThan)(decodedCursor.createdAt),
                };
                if (decodedCursor.id) {
                    where = {
                        createdAt: (0, typeorm_2.LessThan)(decodedCursor.createdAt),
                    };
                }
            }
            catch (error) {
                this.logger.warn(`Invalid cursor format: ${error.message}`);
            }
        }
        const items = await this.productsRepository.find({
            where: where,
            take: limit + 1,
            order: {
                createdAt: 'DESC',
                id: 'DESC',
            },
        });
        const hasMore = items.length > limit;
        if (hasMore) {
            items.pop();
        }
        let nextCursor;
        if (hasMore && items.length > 0) {
            const lastItem = items[items.length - 1];
            const cursorData = {
                id: lastItem.id,
                createdAt: lastItem.createdAt,
            };
            nextCursor = Buffer.from(JSON.stringify(cursorData)).toString('base64');
        }
        let total;
        if (withCount) {
            total = await this.productsRepository.count(where);
        }
        const result = {
            items,
            nextCursor,
            prevCursor,
            hasMore,
            total,
        };
        await this.productCacheService.cacheProductsByCursor(result, cursor, limit);
        return result;
    }
    async findOne(id) {
        const cachedProduct = await this.productCacheService.getCachedProduct(id);
        if (cachedProduct) {
            return cachedProduct;
        }
        const startTime = Date.now();
        const product = await this.productsRepository.findOne({
            where: { id },
        });
        const endTime = Date.now();
        this.eventEmitter.emit('cache.response.time.without', endTime - startTime);
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        await this.productCacheService.cacheProduct(product);
        return product;
    }
    async findByExternalId(externalId, externalSource) {
        const product = await this.productsRepository.findOne({
            where: { externalId, externalSource },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with external ID ${externalId} from source ${externalSource} not found`);
        }
        return product;
    }
    async findByIds(ids) {
        const products = [];
        const missingIds = [];
        for (const id of ids) {
            const cachedProduct = await this.productCacheService.getCachedProduct(id);
            if (cachedProduct) {
                products.push(cachedProduct);
            }
            else {
                missingIds.push(id);
            }
        }
        if (missingIds.length > 0) {
            const fetchedProducts = await this.productsRepository.find({
                where: { id: (0, typeorm_2.In)(missingIds) },
            });
            for (const product of fetchedProducts) {
                await this.productCacheService.cacheProduct(product);
                products.push(product);
            }
        }
        return products;
    }
    async findAllForIndexing() {
        return this.productsRepository.find();
    }
    async update(id, updateProductDto) {
        const product = await this.findOne(id);
        const updatedProduct = this.productsRepository.merge(product, updateProductDto);
        const savedProduct = await this.productsRepository.save(updatedProduct);
        this.eventEmitter.emit('product.updated', savedProduct);
        return savedProduct;
    }
    async remove(id) {
        const product = await this.findOne(id);
        await this.productsRepository.remove(product);
        this.eventEmitter.emit('product.deleted', id);
    }
    async search(query, paginationDto, filters) {
        const { page = 1, limit = 10 } = paginationDto;
        const cachedResults = await this.productCacheService.getCachedSearchProducts(query, page, limit, filters);
        if (cachedResults) {
            return cachedResults;
        }
        const queryFilters = {
            ...filters,
            searchQuery: query,
            isActive: true,
        };
        return this.queryOptimizerService.optimizedQuery(queryFilters, paginationDto);
    }
    async findByMerchant(merchantId, paginationDto) {
        return this.queryOptimizerService.optimizedQuery({
            merchantId: merchantId,
            isActive: true,
        }, paginationDto);
    }
    async updateStock(id, inStock, quantity) {
        const product = await this.findOne(id);
        product.inStock = inStock;
        if (quantity !== undefined) {
            product.quantity = quantity;
        }
        const updatedProduct = await this.productsRepository.save(product);
        this.eventEmitter.emit('product.updated', updatedProduct);
        return updatedProduct;
    }
    async bulkCreate(products) {
        const newProducts = products.map(product => this.productsRepository.create(product));
        const savedProducts = await this.productsRepository.save(newProducts);
        this.eventEmitter.emit('products.bulk_created', savedProducts);
        return savedProducts;
    }
    async bulkUpdate(products) {
        const updatedProducts = [];
        for (const item of products) {
            const product = await this.findOne(item.id);
            const updatedProduct = this.productsRepository.merge(product, item.data);
            const savedProduct = await this.productsRepository.save(updatedProduct);
            updatedProducts.push(savedProduct);
            this.eventEmitter.emit('product.updated', savedProduct);
        }
        this.eventEmitter.emit('products.bulk_updated', updatedProducts);
        return updatedProducts;
    }
    async getRecommendedProducts(userId, limit = 10) {
        const cachedProducts = await this.productCacheService.getCachedRecommendedProducts(userId, limit);
        if (cachedProducts) {
            return cachedProducts;
        }
        const { items } = await this.queryOptimizerService.optimizedQuery({ isActive: true, inStock: true, featured: true }, { limit });
        await this.productCacheService.cacheRecommendedProducts(userId, items, limit);
        return items;
    }
    async getDiscoveryProducts(limit = 10) {
        const cachedProducts = await this.productCacheService.getCachedDiscoveryProducts(limit);
        if (cachedProducts) {
            return cachedProducts;
        }
        const { items } = await this.queryOptimizerService.optimizedQuery({ isActive: true, inStock: true }, { limit });
        await this.productCacheService.cacheDiscoveryProducts(items, limit);
        return items;
    }
};
exports.CachedProductsService = CachedProductsService;
exports.CachedProductsService = CachedProductsService = CachedProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        event_emitter_1.EventEmitter2,
        product_cache_service_1.ProductCacheService,
        product_query_optimizer_service_1.ProductQueryOptimizerService])
], CachedProductsService);
//# sourceMappingURL=cached-products.service.js.map