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
var OrderWebhookHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderWebhookHandler = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const webhook_handler_interface_1 = require("../webhook-handler.interface");
const merchant_platform_connection_entity_1 = require("../../../entities/merchant-platform-connection.entity");
const platform_type_enum_1 = require("../../../enums/platform-type.enum");
let OrderWebhookHandler = OrderWebhookHandler_1 = class OrderWebhookHandler extends webhook_handler_interface_1.BaseWebhookHandler {
    constructor(merchantPlatformConnectionRepository) {
        super('orders/create');
        this.merchantPlatformConnectionRepository = merchantPlatformConnectionRepository;
        this.logger = new common_1.Logger(OrderWebhookHandler_1.name);
    }
    async process(context) {
        try {
            const { shop, payload, topic } = context;
            const merchantId = await this.getMerchantIdByShop(shop);
            if (!merchantId) {
                this.logger.warn(`No merchant found for shop ${shop}`);
                return this.createErrorResult(new Error(`No merchant found for shop ${shop}`), 'Merchant not found');
            }
            const event = topic.split('/')[1];
            switch (event) {
                case 'create':
                    await this.handleOrderCreate(merchantId, payload);
                    break;
                case 'updated':
                    await this.handleOrderUpdate(merchantId, payload);
                    break;
                case 'cancelled':
                    await this.handleOrderCancel(merchantId, payload);
                    break;
                case 'fulfilled':
                    await this.handleOrderFulfill(merchantId, payload);
                    break;
                case 'paid':
                    await this.handleOrderPaid(merchantId, payload);
                    break;
                default:
                    this.logger.warn(`Unhandled order event: ${event}`);
                    return this.createErrorResult(new Error(`Unhandled order event: ${event}`), 'Unknown order event');
            }
            return this.createSuccessResult(`Successfully processed ${topic} webhook`, {
                merchantId,
                orderId: payload.id,
            });
        }
        catch (error) {
            this.logger.error(`Error processing order webhook: ${error.message}`, error.stack);
            return this.createErrorResult(error, `Failed to process order webhook: ${error.message}`);
        }
    }
    async handleOrderCreate(merchantId, orderData) {
        this.logger.log(`Order created: ${orderData.id} for merchant ${merchantId}`);
    }
    async handleOrderUpdate(merchantId, orderData) {
        this.logger.log(`Order updated: ${orderData.id} for merchant ${merchantId}`);
    }
    async handleOrderCancel(merchantId, orderData) {
        this.logger.log(`Order cancelled: ${orderData.id} for merchant ${merchantId}`);
    }
    async handleOrderFulfill(merchantId, orderData) {
        this.logger.log(`Order fulfilled: ${orderData.id} for merchant ${merchantId}`);
    }
    async handleOrderPaid(merchantId, orderData) {
        this.logger.log(`Order paid: ${orderData.id} for merchant ${merchantId}`);
    }
    async getMerchantIdByShop(shop) {
        const connection = await this.merchantPlatformConnectionRepository.findOne({
            where: {
                platformType: platform_type_enum_1.PlatformType.SHOPIFY,
                platformIdentifier: shop,
                isActive: true,
            },
        });
        return connection ? connection.merchantId : null;
    }
};
exports.OrderWebhookHandler = OrderWebhookHandler;
exports.OrderWebhookHandler = OrderWebhookHandler = OrderWebhookHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(merchant_platform_connection_entity_1.MerchantPlatformConnection)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], OrderWebhookHandler);
//# sourceMappingURL=order-webhook.handler.js.map