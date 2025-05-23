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
exports.IndexingResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const user_entity_1 = require("../../users/entities/user.entity");
const elasticsearch_indexing_service_1 = require("../services/elasticsearch-indexing.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../../products/entities/product.entity");
const merchant_entity_1 = require("../../merchants/entities/merchant.entity");
const brand_entity_1 = require("../../products/entities/brand.entity");
let IndexingResolver = class IndexingResolver {
    constructor(elasticsearchIndexingService, eventEmitter, productRepository, merchantRepository, brandRepository) {
        this.elasticsearchIndexingService = elasticsearchIndexingService;
        this.eventEmitter = eventEmitter;
        this.productRepository = productRepository;
        this.merchantRepository = merchantRepository;
        this.brandRepository = brandRepository;
        this.reindexingStatus = {};
        this.eventEmitter.on('search.reindex_progress', payload => {
            this.reindexingStatus[payload.entityType] = {
                status: 'in_progress',
                processed: payload.processed,
                total: payload.total,
                percentage: payload.percentage,
                lastUpdated: new Date(),
            };
        });
        this.eventEmitter.on('search.reindex_complete', payload => {
            this.reindexingStatus[payload.entityType] = {
                status: 'completed',
                processed: payload.total,
                total: payload.total,
                percentage: 100,
                lastUpdated: new Date(),
                completedAt: new Date(),
            };
        });
        this.eventEmitter.on('search.reindex_error', payload => {
            this.reindexingStatus[payload.entityType] = {
                status: 'error',
                error: payload.error,
                lastUpdated: new Date(),
            };
        });
    }
    async reindexAll(entityType) {
        this.eventEmitter.emit('search.reindex_all', { entityType });
        return true;
    }
    getReindexingStatus(entityType) {
        if (entityType && entityType !== 'all') {
            return JSON.stringify({
                [entityType]: this.reindexingStatus[entityType] || { status: 'not_started' },
            });
        }
        return JSON.stringify({
            products: this.reindexingStatus.products || { status: 'not_started' },
            merchants: this.reindexingStatus.merchants || { status: 'not_started' },
            brands: this.reindexingStatus.brands || { status: 'not_started' },
        });
    }
    async bulkIndexProducts(productIds) {
        this.eventEmitter.emit('products.bulk_index', { productIds });
        return true;
    }
    async bulkIndexMerchants(merchantIds) {
        this.eventEmitter.emit('merchants.bulk_index', { merchantIds });
        return true;
    }
    async bulkIndexBrands(brandIds) {
        this.eventEmitter.emit('brands.bulk_index', { brandIds });
        return true;
    }
};
exports.IndexingResolver = IndexingResolver;
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { description: 'Reindex all entities or a specific entity type' }),
    __param(0, (0, graphql_1.Args)('entityType', { nullable: true, defaultValue: 'all' })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IndexingResolver.prototype, "reindexAll", null);
__decorate([
    (0, graphql_1.Query)(() => String, { description: 'Get reindexing status' }),
    __param(0, (0, graphql_1.Args)('entityType', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", String)
], IndexingResolver.prototype, "getReindexingStatus", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { description: 'Bulk index products by IDs' }),
    __param(0, (0, graphql_1.Args)('productIds', { type: () => [String] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], IndexingResolver.prototype, "bulkIndexProducts", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { description: 'Bulk index merchants by IDs' }),
    __param(0, (0, graphql_1.Args)('merchantIds', { type: () => [String] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], IndexingResolver.prototype, "bulkIndexMerchants", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { description: 'Bulk index brands by IDs' }),
    __param(0, (0, graphql_1.Args)('brandIds', { type: () => [String] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], IndexingResolver.prototype, "bulkIndexBrands", null);
exports.IndexingResolver = IndexingResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(3, (0, typeorm_1.InjectRepository)(merchant_entity_1.Merchant)),
    __param(4, (0, typeorm_1.InjectRepository)(brand_entity_1.Brand)),
    __metadata("design:paramtypes", [elasticsearch_indexing_service_1.ElasticsearchIndexingService,
        event_emitter_1.EventEmitter2,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], IndexingResolver);
//# sourceMappingURL=indexing.resolver.js.map