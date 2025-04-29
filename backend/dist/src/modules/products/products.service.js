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
var ProductsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const product_entity_1 = require("./entities/product.entity");
let ProductsService = ProductsService_1 = class ProductsService {
    constructor(productsRepository, eventEmitter) {
        this.productsRepository = productsRepository;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(ProductsService_1.name);
    }
    async create(createProductDto) {
        const newProduct = this.productsRepository.create(createProductDto);
        const savedProduct = await this.productsRepository.save(newProduct);
        this.eventEmitter.emit('product.created', savedProduct);
        return savedProduct;
    }
    async findAll(paginationDto) {
        const { page = 1, limit = 10 } = paginationDto || {};
        const skip = (page - 1) * limit;
        const [items, total] = await this.productsRepository.findAndCount({
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findWithCursor(paginationDto, filter) {
        const { cursor, limit = 20, withCount = false } = paginationDto;
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
            where,
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
        let totalCount;
        if (withCount) {
            totalCount = await this.productsRepository.count();
        }
        return {
            items,
            nextCursor,
            prevCursor,
            hasMore,
            totalCount,
        };
    }
    async findOne(id) {
        const product = await this.productsRepository.findOne({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }
    async findByExternalId(externalId, externalSource) {
        const product = await this.productsRepository.findOne({
            where: { externalId, externalSource },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with external ID ${externalId} from ${externalSource} not found`);
        }
        return product;
    }
    async findByIds(ids) {
        if (!ids.length)
            return [];
        return this.productsRepository.find({
            where: { id: (0, typeorm_2.In)(ids) },
        });
    }
    async findAllForIndexing() {
        return this.productsRepository.find({
            where: { isActive: true },
        });
    }
    async update(id, updateProductDto) {
        const product = await this.findOne(id);
        const updatedProduct = this.productsRepository.merge(product, updateProductDto);
        const savedProduct = await this.productsRepository.save(updatedProduct);
        this.eventEmitter.emit('product.updated', savedProduct);
        return savedProduct;
    }
    async remove(id) {
        const result = await this.productsRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        this.eventEmitter.emit('product.deleted', id);
    }
    async search(query, paginationDto, filters) {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;
        const where = {};
        if (query) {
            where.title = (0, typeorm_2.Like)(`%${query}%`);
        }
        if (filters) {
            if (filters.categories && filters.categories.length > 0) {
                where.categories = (0, typeorm_2.Like)(`%${filters.categories[0]}%`);
            }
            if (filters.merchantId) {
                where.merchantId = filters.merchantId;
            }
            if (filters.inStock !== undefined) {
                where.inStock = filters.inStock;
            }
            let query = this.productsRepository.createQueryBuilder('product');
            if (filters.priceMin !== undefined) {
                query = query.andWhere('product.price >= :priceMin', { priceMin: filters.priceMin });
            }
            if (filters.priceMax !== undefined) {
                query = query.andWhere('product.price <= :priceMax', { priceMax: filters.priceMax });
            }
            query = query.skip(skip).take(limit).orderBy('product.createdAt', 'DESC');
            const [items, total] = await query.getManyAndCount();
            return { items, total };
        }
        const [items, total] = await this.productsRepository.findAndCount({
            where,
            take: limit,
            skip,
            order: { createdAt: 'DESC' },
        });
        return { items, total };
    }
    async findByMerchant(merchantId, paginationDto) {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;
        const [items, total] = await this.productsRepository.findAndCount({
            where: { merchantId },
            take: limit,
            skip,
            order: { createdAt: 'DESC' },
        });
        return { items, total };
    }
    async updateStock(id, inStock, quantity) {
        const product = await this.findOne(id);
        product.inStock = inStock;
        if (quantity !== undefined) {
            product.quantity = quantity;
        }
        return this.productsRepository.save(product);
    }
    async findProductsWithoutAltText(limit = 10) {
        this.logger.log(`Finding up to ${limit} products without alt text`);
        const products = await this.productsRepository
            .createQueryBuilder('product')
            .where('product.images IS NOT NULL')
            .andWhere('product.images != :emptyArray', { emptyArray: '{}' })
            .andWhere('(product.imageAltTexts IS NULL OR product.accessibilityMetadata IS NULL)')
            .orderBy('product.updatedAt', 'DESC')
            .take(limit)
            .getMany();
        this.logger.log(`Found ${products.length} products without alt text`);
        return products;
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
        return updatedProducts;
    }
    async getRecommendedProducts(userId, limit = 10) {
        const products = await this.productsRepository.find({
            where: { isActive: true, inStock: true },
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return products;
    }
    async getDiscoveryProducts(limit = 10) {
        const products = await this.productsRepository.find({
            where: { isActive: true, inStock: true },
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return products;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = ProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], ProductsService);
//# sourceMappingURL=products.service.js.map