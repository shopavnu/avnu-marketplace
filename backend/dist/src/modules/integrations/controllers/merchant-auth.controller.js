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
exports.MerchantAuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const merchant_guard_1 = require("../../../modules/auth/guards/merchant.guard");
const integrations_service_1 = require("../integrations.service");
const integration_type_enum_1 = require("../types/integration-type.enum");
let MerchantAuthController = class MerchantAuthController {
    constructor(integrationsService) {
        this.integrationsService = integrationsService;
    }
    async authenticateShopify(body) {
        const result = await this.integrationsService.authenticate(integration_type_enum_1.IntegrationType.SHOPIFY, {
            shopify: {
                shopDomain: body.shopDomain,
                accessToken: body.accessToken,
                apiKey: '',
                apiSecret: '',
            },
        });
        return { success: result };
    }
    async authenticateWooCommerce(_body) {
        return { success: false };
    }
};
exports.MerchantAuthController = MerchantAuthController;
__decorate([
    (0, common_1.Post)('shopify'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, merchant_guard_1.MerchantGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Authenticate with Shopify' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MerchantAuthController.prototype, "authenticateShopify", null);
__decorate([
    (0, common_1.Post)('woocommerce'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, merchant_guard_1.MerchantGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Authenticate with WooCommerce' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MerchantAuthController.prototype, "authenticateWooCommerce", null);
exports.MerchantAuthController = MerchantAuthController = __decorate([
    (0, swagger_1.ApiTags)('Integrations'),
    (0, common_1.Controller)('merchant-auth'),
    __metadata("design:paramtypes", [integrations_service_1.IntegrationsService])
], MerchantAuthController);
//# sourceMappingURL=merchant-auth.controller.js.map