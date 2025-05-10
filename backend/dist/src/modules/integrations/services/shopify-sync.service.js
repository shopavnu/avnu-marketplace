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
var ShopifySyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifySyncService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const merchant_platform_connection_entity_1 = require("../entities/merchant-platform-connection.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
const shared_1 = require("../../shared");
const shopify_service_1 = require("./shopify.service");
let ShopifySyncService = ShopifySyncService_1 = class ShopifySyncService {
    constructor(merchantPlatformConnectionRepository, productRepository, orderRepository, shopifyService) {
        this.merchantPlatformConnectionRepository = merchantPlatformConnectionRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.shopifyService = shopifyService;
        this.logger = new common_1.Logger(ShopifySyncService_1.name);
    }
    mapOrderStatus(status) {
        if (!status) {
            this.logger.warn('Received empty Shopify order status, defaulting to PENDING');
            return 'PENDING';
        }
        const normalizedStatus = status.toLowerCase().trim();
        switch (normalizedStatus) {
            case 'paid':
                return 'PAID';
            case 'pending':
                return 'PENDING';
            case 'refunded':
                return 'REFUNDED';
            case 'partially_refunded':
                return 'PARTIALLY_REFUNDED';
            case 'voided':
                return 'VOIDED';
            case 'authorized':
                return 'AUTHORIZED';
            case 'expired':
                return 'EXPIRED';
            case 'declined':
                return 'DECLINED';
            default:
                this.logger.warn(`Unmapped Shopify order status: ${status}, using uppercase version`);
                return normalizedStatus.toUpperCase();
        }
    }
    async fetchProducts(connection) {
        try {
            this.logger.log(`Fetching products from Shopify store ${connection.platformStoreName}`);
            return [];
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Error fetching Shopify products: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
            throw new Error(`Failed to fetch Shopify products: ${errorMessage}`);
        }
    }
    async fetchOrders(connection) {
        try {
            this.logger.log(`Fetching orders from Shopify store ${connection.platformStoreName}`);
            return [];
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Error fetching Shopify orders: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
            throw new Error(`Failed to fetch Shopify orders: ${errorMessage}`);
        }
    }
    async syncProducts(connection) {
        if (connection.platformType !== shared_1.PlatformType.SHOPIFY) {
            throw new Error('Connection is not a Shopify connection');
        }
        try {
            this.logger.log(`Starting product sync for Shopify store ${connection.platformStoreName}`);
            connection.lastSyncedAt = new Date();
            connection.lastSyncStatus = 'in_progress';
            await this.merchantPlatformConnectionRepository.save(connection);
            const externalProducts = await this.fetchProducts(connection);
            const result = {
                created: 0,
                updated: 0,
                failed: 0,
                total: externalProducts.length,
                errors: [],
                success: true,
            };
            for (const externalProduct of externalProducts) {
                try {
                    const externalId = externalProduct.id?.toString();
                    if (!externalId) {
                        this.logger.warn('Skipping Shopify product with no ID');
                        continue;
                    }
                    const existingProduct = await this.productRepository.findOne({
                        where: {
                            externalId: shopifyProduct.id.toString(),
                            platformType: shared_1.PlatformType.SHOPIFY,
                        },
                    });
                    if (existingProduct) {
                        result.updated++;
                    }
                    else {
                        result.created++;
                    }
                }
                catch (productError) {
                    const errorMessage = productError instanceof Error ? productError.message : 'Unknown error';
                    this.logger.error(`Error processing Shopify product: ${errorMessage}`, productError instanceof Error ? productError.stack : undefined);
                    result.failed++;
                    result.errors = result.errors || [];
                    result.errors.push(errorMessage);
                }
            }
            connection.lastSyncedAt = new Date();
            connection.lastSyncStatus = 'success';
            connection.lastSyncError = '';
            await this.merchantPlatformConnectionRepository.save(connection);
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Error syncing Shopify products: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
            try {
                connection.lastSyncedAt = new Date();
                connection.lastSyncStatus = 'error';
                connection.lastSyncError = errorMessage;
                await this.merchantPlatformConnectionRepository.save(connection);
            }
            catch (saveError) {
                this.logger.error(`Failed to update connection ${connection.id} sync status: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`);
            }
            return {
                created: 0,
                updated: 0,
                failed: 0,
                total: 0,
                errors: [errorMessage],
                success: false,
            };
        }
    }
    async syncOrders(connection) {
        if (connection.platformType !== shared_1.PlatformType.SHOPIFY) {
            throw new Error('Connection is not a Shopify connection');
        }
        try {
            this.logger.log(`Starting order sync for Shopify store ${connection.platformStoreName}`);
            const externalOrders = await this.fetchOrders(connection);
            const result = {
                created: 0,
                updated: 0,
                failed: 0,
                total: externalOrders.length,
                errors: [],
                success: true,
            };
            for (const order of externalOrders) {
                try {
                    const externalId = order.id?.toString();
                    if (!externalId) {
                        this.logger.warn('Skipping Shopify order with no ID');
                        continue;
                    }
                    const existingOrder = await this.orderRepository.findOne({
                        where: {
                            externalId: order.id.toString(),
                            platformType: shared_1.PlatformType.SHOPIFY,
                        },
                    });
                    if (existingOrder) {
                        result.updated++;
                    }
                    else {
                        result.created++;
                    }
                }
                catch (orderError) {
                    const errorMessage = orderError instanceof Error ? orderError.message : 'Unknown error';
                    this.logger.error(`Error processing Shopify order: ${errorMessage}`, orderError instanceof Error ? orderError.stack : undefined);
                    result.failed++;
                    result.errors = result.errors || [];
                    result.errors.push(errorMessage);
                }
            }
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Error syncing Shopify orders: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
            return {
                created: 0,
                updated: 0,
                failed: 0,
                total: 0,
                errors: [errorMessage],
                success: false,
            };
        }
    }
    async handleWebhook(event, data, merchantId) {
        try {
            this.logger.log(`Processing Shopify webhook event: ${event}`);
            const connection = merchantId
                ? await this.merchantPlatformConnectionRepository.findOne({
                    where: {
                        merchantId,
                        platformType: shared_1.PlatformType.SHOPIFY,
                    },
                })
                : null;
            if (!connection && merchantId) {
                this.logger.warn(`No Shopify connection found for merchant ${merchantId}`);
                return false;
            }
            if (event.toLowerCase().includes('product')) {
                await this.handleProductWebhook(event, data, connection);
                return true;
            }
            else if (event.toLowerCase().includes('order')) {
                await this.handleOrderWebhook(event, data, connection);
                return true;
            }
            else {
                this.logger.warn(`Unhandled Shopify webhook event type: ${event}`);
                return false;
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Error handling Shopify webhook: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
            return false;
        }
    }
    async handleProductWebhook(event, data, connection) {
        this.logger.log(`Handling Shopify product webhook: ${event}`);
        if (event.toLowerCase().includes('create')) {
            this.logger.log('Would create new product from Shopify webhook');
        }
        else if (event.toLowerCase().includes('update')) {
            this.logger.log('Would update existing product from Shopify webhook');
        }
        else if (event.toLowerCase().includes('delete')) {
            this.logger.log('Would delete product from Shopify webhook');
        }
    }
    async handleOrderWebhook(event, data, connection) {
        this.logger.log(`Handling Shopify order webhook: ${event}`);
        if (event.toLowerCase().includes('create')) {
            this.logger.log('Would create new order from Shopify webhook');
        }
        else if (event.toLowerCase().includes('update')) {
            this.logger.log('Would update existing order from Shopify webhook');
        }
        else if (event.toLowerCase().includes('delete')) {
            this.logger.log('Would delete order from Shopify webhook');
        }
    }
};
exports.ShopifySyncService = ShopifySyncService;
exports.ShopifySyncService = ShopifySyncService = ShopifySyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(merchant_platform_connection_entity_1.MerchantPlatformConnection)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        shopify_service_1.ShopifyService])
], ShopifySyncService);
//# sourceMappingURL=shopify-sync.service.js.map