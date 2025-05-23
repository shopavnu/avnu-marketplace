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
exports.MerchantResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const merchant_service_1 = require("../services/merchant.service");
const merchant_entity_1 = require("../entities/merchant.entity");
const merchant_brand_entity_1 = require("../entities/merchant-brand.entity");
const merchant_product_entity_1 = require("../entities/merchant-product.entity");
const merchant_shipping_entity_1 = require("../entities/merchant-shipping.entity");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const user_entity_1 = require("../../users/entities/user.entity");
const dto_1 = require("../dto");
const merchant_only_decorator_1 = require("../../auth/decorators/merchant-only.decorator");
const common_1 = require("@nestjs/common");
let MerchantResolver = class MerchantResolver {
    constructor(merchantService) {
        this.merchantService = merchantService;
    }
    async merchants() {
        return this.merchantService.findAll();
    }
    async merchant(id) {
        return this.merchantService.findOne(id);
    }
    async myMerchants(_user) {
        return this.merchantService.findByUserId(_user.id);
    }
    async createMerchant(input, _user) {
        return this.merchantService.create({
            ...input,
        });
    }
    async updateMerchant(id, input, user) {
        const merchant = await this.merchantService.findOne(id);
        if (merchant.userId !== user.id && user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('You do not have permission to update this merchant');
        }
        return this.merchantService.update(id, input);
    }
    async removeMerchant(id, user) {
        const merchants = await this.merchantService.findByUserId(user.id);
        const canRemove = user.role === user_entity_1.UserRole.ADMIN || merchants.some(m => m.id === id);
        if (!canRemove) {
            throw new Error('You do not have permission to remove this merchant');
        }
        return this.merchantService.remove(id);
    }
    async merchantBrand(merchantId, user) {
        const merchants = await this.merchantService.findByUserId(user.id);
        const canView = user.role === user_entity_1.UserRole.ADMIN || merchants.some(m => m.id === merchantId);
        if (!canView) {
            throw new Error('You do not have permission to view this merchant brand');
        }
        return this.merchantService.getMerchantBrand(merchantId);
    }
    async createOrUpdateMerchantBrand(merchantId, input, user) {
        const merchants = await this.merchantService.findByUserId(user.id);
        const canEdit = user.role === user_entity_1.UserRole.ADMIN || merchants.some(m => m.id === merchantId);
        if (!canEdit) {
            throw new Error('You do not have permission to update this merchant brand');
        }
        return this.merchantService.createOrUpdateMerchantBrand(merchantId, input);
    }
    async merchantProducts(merchantId, user) {
        const merchants = await this.merchantService.findByUserId(user.id);
        const canView = user.role === user_entity_1.UserRole.ADMIN || merchants.some(m => m.id === merchantId);
        if (!canView) {
            throw new Error('You do not have permission to view these merchant products');
        }
        return this.merchantService.getMerchantProducts(merchantId);
    }
    async updateProductVisibility(merchantId, productId, isVisible, user) {
        const merchants = await this.merchantService.findByUserId(user.id);
        const canEdit = user.role === user_entity_1.UserRole.ADMIN || merchants.some(m => m.id === merchantId);
        if (!canEdit) {
            throw new Error('You do not have permission to update this product visibility');
        }
        return this.merchantService.updateProductVisibility(merchantId, productId, isVisible);
    }
    async updateProductPromotion(merchantId, productId, isPromoted, user, monthlyAdBudget) {
        const merchants = await this.merchantService.findByUserId(user.id);
        const canEdit = user.role === user_entity_1.UserRole.ADMIN || merchants.some(m => m.id === merchantId);
        if (!canEdit) {
            throw new Error('You do not have permission to update this product promotion');
        }
        return this.merchantService.updateProductPromotion(merchantId, productId, isPromoted, monthlyAdBudget);
    }
    async merchantShipping(merchantId, user) {
        const merchants = await this.merchantService.findByUserId(user.id);
        const canView = user.role === user_entity_1.UserRole.ADMIN || merchants.some(m => m.id === merchantId);
        if (!canView) {
            throw new Error('You do not have permission to view this merchant shipping settings');
        }
        return this.merchantService.getMerchantShipping(merchantId);
    }
    async updateMerchantShipping(merchantId, input, user) {
        const merchants = await this.merchantService.findByUserId(user.id);
        const canEdit = user.role === user_entity_1.UserRole.ADMIN || merchants.some(m => m.id === merchantId);
        if (!canEdit) {
            throw new Error('You do not have permission to update this merchant shipping settings');
        }
        return this.merchantService.createOrUpdateMerchantShipping(merchantId, input);
    }
};
exports.MerchantResolver = MerchantResolver;
__decorate([
    (0, graphql_1.Query)(() => [merchant_entity_1.Merchant]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MerchantResolver.prototype, "merchants", null);
__decorate([
    (0, graphql_1.Query)(() => merchant_entity_1.Merchant),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MerchantResolver.prototype, "merchant", null);
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Query)(() => [merchant_entity_1.Merchant]),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MerchantResolver.prototype, "myMerchants", null);
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Mutation)(() => merchant_entity_1.Merchant),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateMerchantInput,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MerchantResolver.prototype, "createMerchant", null);
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Mutation)(() => merchant_entity_1.Merchant),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateMerchantInput,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MerchantResolver.prototype, "updateMerchant", null);
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MerchantResolver.prototype, "removeMerchant", null);
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Query)(() => merchant_brand_entity_1.MerchantBrand),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MerchantResolver.prototype, "merchantBrand", null);
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Mutation)(() => merchant_brand_entity_1.MerchantBrand),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateMerchantBrandInput,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MerchantResolver.prototype, "createOrUpdateMerchantBrand", null);
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Query)(() => [merchant_product_entity_1.MerchantProduct]),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MerchantResolver.prototype, "merchantProducts", null);
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Mutation)(() => merchant_product_entity_1.MerchantProduct),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('productId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('isVisible', { type: () => Boolean })),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MerchantResolver.prototype, "updateProductVisibility", null);
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Mutation)(() => merchant_product_entity_1.MerchantProduct),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('productId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('isPromoted', { type: () => Boolean })),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __param(4, (0, graphql_1.Args)('monthlyAdBudget', { type: () => Number, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean, user_entity_1.User, Number]),
    __metadata("design:returntype", Promise)
], MerchantResolver.prototype, "updateProductPromotion", null);
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Query)(() => merchant_shipping_entity_1.MerchantShipping),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MerchantResolver.prototype, "merchantShipping", null);
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Mutation)(() => merchant_shipping_entity_1.MerchantShipping),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateMerchantShippingInput,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MerchantResolver.prototype, "updateMerchantShipping", null);
exports.MerchantResolver = MerchantResolver = __decorate([
    (0, graphql_1.Resolver)(() => merchant_entity_1.Merchant),
    __metadata("design:paramtypes", [merchant_service_1.MerchantService])
], MerchantResolver);
//# sourceMappingURL=merchant.resolver.js.map