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
var ProductWebhookHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductWebhookHandler = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const webhook_handler_interface_1 = require("../webhook-handler.interface");
const merchant_platform_connection_entity_1 = require("../../../entities/merchant-platform-connection.entity");
const platform_type_enum_1 = require("../../../enums/platform-type.enum");
let ProductWebhookHandler = ProductWebhookHandler_1 = class ProductWebhookHandler extends webhook_handler_interface_1.BaseWebhookHandler {
    constructor(merchantPlatformConnectionRepository) {
        super('products/update');
        this.merchantPlatformConnectionRepository = merchantPlatformConnectionRepository;
        this.logger = new common_1.Logger(ProductWebhookHandler_1.name);
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
                    await this.handleProductCreate(merchantId, payload);
                    break;
                case 'update':
                    await this.handleProductUpdate(merchantId, payload);
                    break;
                case 'delete':
                    await this.handleProductDelete(merchantId, payload);
                    break;
                default:
                    this.logger.warn(`Unhandled product event: ${event}`);
                    return this.createErrorResult(new Error(`Unhandled product event: ${event}`), 'Unknown product event');
            }
            return this.createSuccessResult(`Successfully processed ${topic} webhook`, {
                merchantId,
                productId: payload.id,
            });
        }
        catch (error) {
            this.logger.error(`Error processing product webhook: ${error.message}`, error.stack);
            return this.createErrorResult(error, `Failed to process product webhook: ${error.message}`);
        }
    }
    async handleProductCreate(merchantId, productData) {
        this.logger.log(`Product created: ${productData.id} for merchant ${merchantId}`);
    }
    async handleProductUpdate(merchantId, productData) {
        this.logger.log(`Product updated: ${productData.id} for merchant ${merchantId}`);
    }
    async handleProductDelete(merchantId, productData) {
        this.logger.log(`Product deleted: ${productData.id} for merchant ${merchantId}`);
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
exports.ProductWebhookHandler = ProductWebhookHandler;
exports.ProductWebhookHandler = ProductWebhookHandler = ProductWebhookHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(merchant_platform_connection_entity_1.MerchantPlatformConnection)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductWebhookHandler);
//# sourceMappingURL=product-webhook.handler.js.map