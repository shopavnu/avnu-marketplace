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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyCallbackDto = exports.ShopifyAuthorizeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ShopifyAuthorizeDto {
}
exports.ShopifyAuthorizeDto = ShopifyAuthorizeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Merchant ID', example: '1' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShopifyAuthorizeDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shopify shop domain', example: 'my-store.myshopify.com' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShopifyAuthorizeDto.prototype, "shopDomain", void 0);
class ShopifyCallbackDto {
}
exports.ShopifyCallbackDto = ShopifyCallbackDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Authorization code from Shopify', example: '1234567890' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShopifyCallbackDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'State parameter for CSRF protection', example: 'state-token' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShopifyCallbackDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shopify shop domain', example: 'my-store.myshopify.com' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShopifyCallbackDto.prototype, "shop", void 0);
//# sourceMappingURL=shopify-auth.dto.js.map