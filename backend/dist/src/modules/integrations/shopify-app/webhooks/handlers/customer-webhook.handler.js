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
var CustomerWebhookHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerWebhookHandler = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const webhook_handler_interface_1 = require("../webhook-handler.interface");
const merchant_platform_connection_entity_1 = require("../../../entities/merchant-platform-connection.entity");
const platform_type_enum_1 = require("../../../enums/platform-type.enum");
let CustomerWebhookHandler = CustomerWebhookHandler_1 = class CustomerWebhookHandler extends webhook_handler_interface_1.BaseWebhookHandler {
    constructor(merchantPlatformConnectionRepository) {
        super([
            'customers/create',
            'customers/update',
            'customers/delete',
            'customers/data_request',
            'customers/redact',
        ]);
        this.merchantPlatformConnectionRepository = merchantPlatformConnectionRepository;
        this.logger = new common_1.Logger(CustomerWebhookHandler_1.name);
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
                    await this.handleCustomerCreate(merchantId, payload);
                    break;
                case 'update':
                    await this.handleCustomerUpdate(merchantId, payload);
                    break;
                case 'delete':
                    await this.handleCustomerDelete(merchantId, payload);
                    break;
                case 'data_request':
                    await this.handleCustomerDataRequest(merchantId, payload);
                    break;
                case 'redact':
                    await this.handleCustomerRedact(merchantId, payload);
                    break;
                default:
                    this.logger.warn(`Unhandled customer event: ${event}`);
                    return this.createErrorResult(new Error(`Unhandled customer event: ${event}`), 'Unknown customer event');
            }
            return this.createSuccessResult(`Successfully processed ${topic} webhook`, {
                merchantId,
                customerId: payload.id,
            });
        }
        catch (error) {
            this.logger.error(`Error processing customer webhook: ${error.message}`, error.stack);
            return this.createErrorResult(error, `Failed to process customer webhook: ${error.message}`);
        }
    }
    async handleCustomerCreate(merchantId, customerData) {
        this.logger.log(`Customer created: ${customerData.id} for merchant ${merchantId}`);
    }
    async handleCustomerUpdate(merchantId, customerData) {
        this.logger.log(`Customer updated: ${customerData.id} for merchant ${merchantId}`);
    }
    async handleCustomerDelete(merchantId, customerData) {
        this.logger.log(`Customer deleted: ${customerData.id} for merchant ${merchantId}`);
    }
    async handleCustomerDataRequest(merchantId, requestData) {
        this.logger.log(`Customer data request for: ${requestData.customer.id} for merchant ${merchantId}`);
    }
    async handleCustomerRedact(merchantId, redactData) {
        this.logger.log(`Customer redaction request for: ${redactData.customer.id} for merchant ${merchantId}`);
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
exports.CustomerWebhookHandler = CustomerWebhookHandler;
exports.CustomerWebhookHandler = CustomerWebhookHandler = CustomerWebhookHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(merchant_platform_connection_entity_1.MerchantPlatformConnection)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomerWebhookHandler);
//# sourceMappingURL=customer-webhook.handler.js.map