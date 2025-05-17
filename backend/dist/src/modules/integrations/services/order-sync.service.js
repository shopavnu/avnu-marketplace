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
var OrderSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderSyncService = void 0;
const common_1 = require("@nestjs/common");
const integration_type_enum_1 = require("../types/integration-type.enum");
const shopify_service_1 = require("./shopify.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const merchant_platform_connection_entity_1 = require("../entities/merchant-platform-connection.entity");
const platform_type_enum_1 = require("../enums/platform-type.enum");
let OrderSyncService = OrderSyncService_1 = class OrderSyncService {
    constructor(shopifyService, connectionsRepository) {
        this.shopifyService = shopifyService;
        this.connectionsRepository = connectionsRepository;
        this.logger = new common_1.Logger(OrderSyncService_1.name);
    }
    async syncOrders(type, merchantId) {
        try {
            this.logger.log(`Syncing orders for merchant ${merchantId} from ${type}`);
            if (type !== integration_type_enum_1.IntegrationType.SHOPIFY) {
                throw new Error(`Unsupported integration type: ${type}`);
            }
            return { created: 0, updated: 0, failed: 0 };
        }
        catch (error) {
            this.logger.error(`Failed to sync orders from ${type}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async handleOrderWebhook(type, payload, topic, merchantId) {
        try {
            this.logger.log(`Handling order webhook for merchant ${merchantId} from ${type}`);
            if (type !== integration_type_enum_1.IntegrationType.SHOPIFY) {
                throw new Error(`Unsupported integration type: ${type}`);
            }
            const connection = await this.connectionsRepository.findOne({
                where: { merchantId, platformType: platform_type_enum_1.PlatformType.SHOPIFY },
            });
            if (!connection) {
                throw new Error(`No Shopify connection found for merchant ${merchantId}`);
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to handle order webhook from ${type}: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }
};
exports.OrderSyncService = OrderSyncService;
exports.OrderSyncService = OrderSyncService = OrderSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(merchant_platform_connection_entity_1.MerchantPlatformConnection)),
    __metadata("design:paramtypes", [shopify_service_1.ShopifyService,
        typeorm_2.Repository])
], OrderSyncService);
//# sourceMappingURL=order-sync.service.js.map