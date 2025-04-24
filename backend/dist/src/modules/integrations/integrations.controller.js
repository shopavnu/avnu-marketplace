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
exports.IntegrationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const integrations_service_1 = require("./integrations.service");
let IntegrationsController = class IntegrationsController {
    constructor(integrationsService) {
        this.integrationsService = integrationsService;
    }
    authenticate(type, credentials) {
        return this.integrationsService.authenticate(type, credentials);
    }
    syncProducts(type, body) {
        return this.integrationsService.syncProducts(type, body.credentials, body.merchantId);
    }
    handleWebhook(type, body) {
        return this.integrationsService.handleWebhook(type, body.payload, body.topic, body.merchantId);
    }
};
exports.IntegrationsController = IntegrationsController;
__decorate([
    (0, common_1.Post)(':type/authenticate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Authenticate with an e-commerce platform' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Successfully authenticated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid credentials' }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "authenticate", null);
__decorate([
    (0, common_1.Post)(':type/sync-products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Sync products from an e-commerce platform' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Products synced successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request' }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "syncProducts", null);
__decorate([
    (0, common_1.Post)(':type/webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle webhook from an e-commerce platform' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook handled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid webhook payload' }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "handleWebhook", null);
exports.IntegrationsController = IntegrationsController = __decorate([
    (0, swagger_1.ApiTags)('integrations'),
    (0, common_1.Controller)('integrations'),
    __metadata("design:paramtypes", [integrations_service_1.IntegrationsService])
], IntegrationsController);
//# sourceMappingURL=integrations.controller.js.map