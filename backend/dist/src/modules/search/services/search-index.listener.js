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
var SearchIndexListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchIndexListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const elasticsearch_service_1 = require("./elasticsearch.service");
const elasticsearch_indexing_service_1 = require("./elasticsearch-indexing.service");
const products_1 = require("../../products");
const merchants_1 = require("../../merchants");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const logger_service_1 = require("../../../common/services/logger.service");
let SearchIndexListener = SearchIndexListener_1 = class SearchIndexListener {
    constructor(elasticsearchService, elasticsearchIndexingService, configService, productRepository, merchantRepository, brandRepository, loggerService) {
        this.elasticsearchService = elasticsearchService;
        this.elasticsearchIndexingService = elasticsearchIndexingService;
        this.configService = configService;
        this.productRepository = productRepository;
        this.merchantRepository = merchantRepository;
        this.brandRepository = brandRepository;
        this.loggerService = loggerService;
        this.logger = loggerService;
        this.logger.setContext(SearchIndexListener_1.name);
        this.maxRetries = this.configService.get('ELASTICSEARCH_MAX_RETRIES', 3);
        this.retryDelay = this.configService.get('ELASTICSEARCH_RETRY_DELAY_MS', 1000);
    }
    async handleProductCreatedEvent(product) {
        this.logger.log(`Indexing new product: ${product.id}`);
        await this.executeWithRetry(() => this.elasticsearchService.indexProduct(product), `index product ${product.id}`);
    }
    async handleProductUpdatedEvent(product) {
        this.logger.log(`Updating product in index: ${product.id}`);
        await this.executeWithRetry(() => this.elasticsearchService.updateProduct(product), `update product ${product.id}`);
    }
    async handleProductDeletedEvent(productId) {
        this.logger.log(`Removing product from index: ${productId}`);
        await this.executeWithRetry(() => this.elasticsearchService.deleteProduct(productId), `delete product ${productId}`);
    }
    async handleProductsBulkCreatedEvent(products) {
        this.logger.log(`Bulk indexing ${products.length} products`);
        await this.executeWithRetry(() => this.elasticsearchService.bulkIndexProducts(products), `bulk index ${products.length} products`);
    }
    async handleProductsBulkUpdatedEvent(products) {
        this.logger.log(`Bulk updating ${products.length} products`);
        await this.executeWithRetry(() => this.elasticsearchIndexingService.bulkUpdateProducts(products), `bulk update ${products.length} products`);
    }
    async handleProductsBulkIndexEvent(payload) {
        this.logger.log(`Bulk indexing ${payload.productIds.length} products by ID`);
        try {
            const products = await this.productRepository.find({
                where: { id: (0, typeorm_2.In)(payload.productIds) },
                relations: ['categories', 'tags', 'brand', 'merchant'],
            });
            if (products.length === 0) {
                this.logger.warn('No products found for bulk indexing');
                return;
            }
            await this.executeWithRetry(() => this.elasticsearchService.bulkIndexProducts(products), `bulk index ${products.length} products`);
        }
        catch (error) {
            this.logger.error(`Failed to bulk index products: ${error.message}`);
            throw error;
        }
    }
    async handleMerchantCreatedEvent(merchant) {
        this.logger.log(`Indexing new merchant: ${merchant.id}`);
        await this.executeWithRetry(() => this.elasticsearchIndexingService.indexMerchant(merchant), `index merchant ${merchant.id}`);
    }
    async handleMerchantUpdatedEvent(merchant) {
        this.logger.log(`Updating merchant in index: ${merchant.id}`);
        await this.executeWithRetry(() => this.elasticsearchIndexingService.updateMerchant(merchant), `update merchant ${merchant.id}`);
    }
    async handleMerchantDeletedEvent(merchantId) {
        this.logger.log(`Removing merchant from index: ${merchantId}`);
        await this.executeWithRetry(() => this.elasticsearchIndexingService.deleteMerchant(merchantId), `delete merchant ${merchantId}`);
    }
    async handleMerchantsBulkCreatedEvent(merchants) {
        this.logger.log(`Bulk indexing ${merchants.length} merchants`);
        await this.executeWithRetry(() => this.elasticsearchIndexingService.bulkIndexMerchants(merchants), `bulk index ${merchants.length} merchants`);
    }
    async handleMerchantsBulkIndexEvent(payload) {
        this.logger.log(`Bulk indexing ${payload.merchantIds.length} merchants by ID`);
        try {
            const merchants = await this.merchantRepository.find({
                where: { id: (0, typeorm_2.In)(payload.merchantIds) },
                relations: ['categories', 'values'],
            });
            if (merchants.length === 0) {
                this.logger.warn('No merchants found for bulk indexing');
                return;
            }
            await this.executeWithRetry(() => this.elasticsearchIndexingService.bulkIndexMerchants(merchants), `bulk index ${merchants.length} merchants`);
        }
        catch (error) {
            this.logger.error(`Failed to bulk index merchants: ${error.message}`);
            throw error;
        }
    }
    async handleBrandCreatedEvent(brand) {
        this.logger.log(`Indexing new brand: ${brand.id}`);
        await this.executeWithRetry(() => this.elasticsearchIndexingService.indexBrand(brand), `index brand ${brand.id}`);
    }
    async handleBrandUpdatedEvent(brand) {
        this.logger.log(`Updating brand in index: ${brand.id}`);
        await this.executeWithRetry(() => this.elasticsearchIndexingService.updateBrand(brand), `update brand ${brand.id}`);
    }
    async handleBrandDeletedEvent(brandId) {
        this.logger.log(`Removing brand from index: ${brandId}`);
        await this.executeWithRetry(() => this.elasticsearchIndexingService.deleteBrand(brandId), `delete brand ${brandId}`);
    }
    async handleBrandsBulkCreatedEvent(brands) {
        this.logger.log(`Bulk indexing ${brands.length} brands`);
        await this.executeWithRetry(() => this.elasticsearchIndexingService.bulkIndexBrands(brands), `bulk index ${brands.length} brands`);
    }
    async handleBrandsBulkIndexEvent(payload) {
        this.logger.log(`Bulk indexing ${payload.brandIds.length} brands by ID`);
        try {
            const brands = await this.brandRepository.find({
                where: { id: (0, typeorm_2.In)(payload.brandIds) },
                relations: ['categories', 'values'],
            });
            if (brands.length === 0) {
                this.logger.warn('No brands found for bulk indexing');
                return;
            }
            await this.executeWithRetry(() => this.elasticsearchIndexingService.bulkIndexBrands(brands), `bulk index ${brands.length} brands`);
        }
        catch (error) {
            this.logger.error(`Failed to bulk index brands: ${error.message}`);
            throw error;
        }
    }
    async handleReindexAllEvent(payload) {
        const entityType = payload?.entityType || 'all';
        this.logger.log(`Reindexing all ${entityType} entities`);
        try {
            if (entityType === 'all' || entityType === 'products') {
                await this.elasticsearchIndexingService.reindexAllProducts();
            }
            if (entityType === 'all' || entityType === 'merchants') {
                await this.elasticsearchIndexingService.reindexAllMerchants();
            }
            if (entityType === 'all' || entityType === 'brands') {
                await this.elasticsearchIndexingService.reindexAllBrands();
            }
            this.logger.log(`Successfully reindexed ${entityType} entities`);
        }
        catch (error) {
            this.logger.error(`Failed to reindex ${entityType} entities: ${error.message}`);
            throw error;
        }
    }
    async executeWithRetry(fn, operationName, retries = this.maxRetries) {
        try {
            return await fn();
        }
        catch (error) {
            if (retries > 0) {
                this.logger.warn(`Failed to ${operationName}, retrying... (${retries} attempts left): ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.executeWithRetry(fn, operationName, retries - 1);
            }
            else {
                this.logger.error(`Failed to ${operationName} after ${this.maxRetries} attempts: ${error.message}`);
                throw error;
            }
        }
    }
};
exports.SearchIndexListener = SearchIndexListener;
__decorate([
    (0, event_emitter_1.OnEvent)('product.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [products_1.Product]),
    __metadata("design:returntype", Promise)
], SearchIndexListener.prototype, "handleProductCreatedEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('product.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [products_1.Product]),
    __metadata("design:returntype", Promise)
], SearchIndexListener.prototype, "handleProductUpdatedEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('product.deleted'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SearchIndexListener.prototype, "handleProductDeletedEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('products.bulk_created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], SearchIndexListener.prototype, "handleProductsBulkCreatedEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('products.bulk_updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], SearchIndexListener.prototype, "handleProductsBulkUpdatedEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('products.bulk_index'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SearchIndexListener.prototype, "handleProductsBulkIndexEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('merchant.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchants_1.Merchant]),
    __metadata("design:returntype", Promise)
], SearchIndexListener.prototype, "handleMerchantCreatedEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('merchant.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchants_1.Merchant]),
    __metadata("design:returntype", Promise)
], SearchIndexListener.prototype, "handleMerchantUpdatedEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('merchant.deleted'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SearchIndexListener.prototype, "handleMerchantDeletedEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('merchants.bulk_created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], SearchIndexListener.prototype, "handleMerchantsBulkCreatedEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('merchants.bulk_index'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SearchIndexListener.prototype, "handleMerchantsBulkIndexEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('brand.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [products_1.Brand]),
    __metadata("design:returntype", Promise)
], SearchIndexListener.prototype, "handleBrandCreatedEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('brand.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [products_1.Brand]),
    __metadata("design:returntype", Promise)
], SearchIndexListener.prototype, "handleBrandUpdatedEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('brand.deleted'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SearchIndexListener.prototype, "handleBrandDeletedEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('brands.bulk_created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], SearchIndexListener.prototype, "handleBrandsBulkCreatedEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('brands.bulk_index'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SearchIndexListener.prototype, "handleBrandsBulkIndexEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('search.reindex_all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SearchIndexListener.prototype, "handleReindexAllEvent", null);
exports.SearchIndexListener = SearchIndexListener = SearchIndexListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectRepository)(products_1.Product)),
    __param(4, (0, typeorm_1.InjectRepository)(merchants_1.Merchant)),
    __param(5, (0, typeorm_1.InjectRepository)(products_1.Brand)),
    __metadata("design:paramtypes", [elasticsearch_service_1.ElasticsearchService,
        elasticsearch_indexing_service_1.ElasticsearchIndexingService,
        config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        logger_service_1.LoggerService])
], SearchIndexListener);
//# sourceMappingURL=search-index.listener.js.map