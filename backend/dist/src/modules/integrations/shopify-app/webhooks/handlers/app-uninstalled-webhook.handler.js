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
var AppUninstalledWebhookHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppUninstalledWebhookHandler = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const webhook_handler_interface_1 = require("../webhook-handler.interface");
const merchant_platform_connection_entity_1 = require("../../../entities/merchant-platform-connection.entity");
const platform_type_enum_1 = require("../../../enums/platform-type.enum");
let AppUninstalledWebhookHandler = AppUninstalledWebhookHandler_1 = class AppUninstalledWebhookHandler extends webhook_handler_interface_1.BaseWebhookHandler {
    constructor(merchantPlatformConnectionRepository) {
        super('app/uninstalled');
        this.merchantPlatformConnectionRepository = merchantPlatformConnectionRepository;
        this.logger = new common_1.Logger(AppUninstalledWebhookHandler_1.name);
    }
    async process(context) {
        try {
            const { shop, payload } = context;
            this.logger.log(`Processing app uninstall for shop: ${shop}`);
            const connections = await this.merchantPlatformConnectionRepository.find({
                where: {
                    platformType: platform_type_enum_1.PlatformType.SHOPIFY,
                    platformIdentifier: shop,
                    isActive: true,
                },
            });
            if (connections.length === 0) {
                this.logger.warn(`No active connections found for shop ${shop}`);
                return this.createSuccessResult('No active connections found to deactivate', {
                    shop,
                    connectionsFound: 0,
                });
            }
            for (const connection of connections) {
                await this.deactivateConnection(connection, payload);
            }
            return this.createSuccessResult('Successfully processed app uninstall webhook', {
                shop,
                deactivatedConnections: connections.length,
            });
        }
        catch (error) {
            this.logger.error(`Error processing app uninstall webhook: ${error.message}`, error.stack);
            return this.createErrorResult(error, `Failed to process app uninstall webhook: ${error.message}`);
        }
    }
    async deactivateConnection(connection, payload) {
        try {
            this.logger.log(`Deactivating connection for merchant ${connection.merchantId} and shop ${connection.platformIdentifier}`);
            connection.isActive = false;
            connection.updatedAt = new Date();
            connection.metadata = {
                ...connection.metadata,
                uninstalledAt: new Date().toISOString(),
                uninstallReason: payload.reason || 'unknown',
            };
            await this.merchantPlatformConnectionRepository.save(connection);
            this.logger.log(`Successfully deactivated connection for merchant ${connection.merchantId}`);
        }
        catch (error) {
            this.logger.error(`Failed to deactivate connection for merchant ${connection.merchantId}:`, error);
            throw error;
        }
    }
};
exports.AppUninstalledWebhookHandler = AppUninstalledWebhookHandler;
exports.AppUninstalledWebhookHandler = AppUninstalledWebhookHandler = AppUninstalledWebhookHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(merchant_platform_connection_entity_1.MerchantPlatformConnection)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AppUninstalledWebhookHandler);
//# sourceMappingURL=app-uninstalled-webhook.handler.js.map