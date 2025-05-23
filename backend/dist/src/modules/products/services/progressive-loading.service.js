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
var ProgressiveLoadingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressiveLoadingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../entities/product.entity");
const data_normalization_service_1 = require("./data-normalization.service");
const progressive_loading_dto_1 = require("../dto/progressive-loading.dto");
let ProgressiveLoadingService = ProgressiveLoadingService_1 = class ProgressiveLoadingService {
    constructor(productRepository, dataNormalizationService) {
        this.productRepository = productRepository;
        this.dataNormalizationService = dataNormalizationService;
        this.logger = new common_1.Logger(ProgressiveLoadingService_1.name);
    }
    async loadProgressively(options) {
        const startTime = Date.now();
        const { cursor, limit = 20, priority = progressive_loading_dto_1.LoadingPriority.HIGH, fullDetails = false, withMetadata = false, exclude = [], } = options;
        const where = {};
        if (exclude.length > 0) {
            where.id = (0, typeorm_2.Not)((0, typeorm_2.In)(exclude));
        }
        if (cursor) {
            try {
                const decodedCursor = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
                where.createdAt = (0, typeorm_2.LessThan)(decodedCursor.createdAt);
            }
            catch (error) {
                this.logger.warn(`Invalid cursor format: ${error.message}`);
            }
        }
        const query = this.productRepository
            .createQueryBuilder('product')
            .where(where)
            .take(limit + 1)
            .orderBy('product.createdAt', 'DESC')
            .addOrderBy('product.id', 'DESC');
        if (priority === progressive_loading_dto_1.LoadingPriority.HIGH) {
            if (fullDetails) {
                query.leftJoinAndSelect('product.categories', 'categories');
            }
        }
        else if (priority === progressive_loading_dto_1.LoadingPriority.MEDIUM) {
            query.select([
                'product.id',
                'product.title',
                'product.price',
                'product.compareAtPrice',
                'product.images',
                'product.slug',
                'product.createdAt',
            ]);
        }
        else if (priority === progressive_loading_dto_1.LoadingPriority.LOW || priority === progressive_loading_dto_1.LoadingPriority.PREFETCH) {
            query.select(['product.id', 'product.title', 'product.images', 'product.createdAt']);
        }
        const items = await query.getMany();
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
        let metadata = undefined;
        if (withMetadata) {
            const totalCount = await this.productRepository.count();
            const estimatedRemainingItems = Math.max(0, totalCount - (exclude.length + items.length));
            const loadTimeMs = Date.now() - startTime;
            metadata = {
                totalCount,
                estimatedRemainingItems,
                loadTimeMs,
            };
        }
        let normalizedItems = items;
        if (priority !== progressive_loading_dto_1.LoadingPriority.LOW && priority !== progressive_loading_dto_1.LoadingPriority.PREFETCH) {
            normalizedItems = await Promise.all(items.map(product => this.dataNormalizationService.normalizeProduct(product)));
        }
        return {
            items: normalizedItems,
            nextCursor,
            hasMore,
            metadata,
        };
    }
    async prefetchProducts(cursor, limit = 20) {
        try {
            const prefetchResult = await this.loadProgressively({
                cursor,
                limit,
                priority: progressive_loading_dto_1.LoadingPriority.PREFETCH,
                fullDetails: false,
                withMetadata: false,
            });
            return prefetchResult.items.map(item => item.id);
        }
        catch (error) {
            this.logger.error(`Error prefetching products: ${error.message}`);
            return [];
        }
    }
};
exports.ProgressiveLoadingService = ProgressiveLoadingService;
exports.ProgressiveLoadingService = ProgressiveLoadingService = ProgressiveLoadingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        data_normalization_service_1.DataNormalizationService])
], ProgressiveLoadingService);
//# sourceMappingURL=progressive-loading.service.js.map