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
exports.AdPlacementResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const ad_placement_service_1 = require("../services/ad-placement.service");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const user_entity_1 = require("../../users/entities/user.entity");
const public_decorator_1 = require("../../auth/decorators/public.decorator");
const graphql_2 = require("@nestjs/graphql");
let AdPlacement = class AdPlacement {
};
__decorate([
    (0, graphql_2.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AdPlacement.prototype, "campaignId", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AdPlacement.prototype, "merchantId", void 0);
__decorate([
    (0, graphql_2.Field)(() => [graphql_1.ID]),
    __metadata("design:type", Array)
], AdPlacement.prototype, "productIds", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], AdPlacement.prototype, "type", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AdPlacement.prototype, "relevanceScore", void 0);
__decorate([
    (0, graphql_2.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], AdPlacement.prototype, "isSponsored", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AdPlacement.prototype, "impressionCost", void 0);
AdPlacement = __decorate([
    (0, graphql_2.ObjectType)()
], AdPlacement);
let ProductAdRecommendation = class ProductAdRecommendation {
};
__decorate([
    (0, graphql_2.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ProductAdRecommendation.prototype, "productId", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ProductAdRecommendation.prototype, "recommendedBudget", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], ProductAdRecommendation.prototype, "estimatedImpressions", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], ProductAdRecommendation.prototype, "estimatedClicks", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], ProductAdRecommendation.prototype, "estimatedConversions", void 0);
ProductAdRecommendation = __decorate([
    (0, graphql_2.ObjectType)()
], ProductAdRecommendation);
let AdPlacementOptionsInput = class AdPlacementOptionsInput {
};
__decorate([
    (0, graphql_2.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], AdPlacementOptionsInput.prototype, "location", void 0);
__decorate([
    (0, graphql_2.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], AdPlacementOptionsInput.prototype, "interests", void 0);
__decorate([
    (0, graphql_2.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], AdPlacementOptionsInput.prototype, "demographics", void 0);
__decorate([
    (0, graphql_2.Field)(() => [graphql_1.ID], { nullable: true }),
    __metadata("design:type", Array)
], AdPlacementOptionsInput.prototype, "previouslyViewedProductIds", void 0);
__decorate([
    (0, graphql_2.Field)(() => [graphql_1.ID], { nullable: true }),
    __metadata("design:type", Array)
], AdPlacementOptionsInput.prototype, "cartProductIds", void 0);
__decorate([
    (0, graphql_2.Field)(() => [graphql_1.ID], { nullable: true }),
    __metadata("design:type", Array)
], AdPlacementOptionsInput.prototype, "purchasedProductIds", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int, { nullable: true, defaultValue: 2 }),
    __metadata("design:type", Number)
], AdPlacementOptionsInput.prototype, "maxAds", void 0);
AdPlacementOptionsInput = __decorate([
    (0, graphql_2.InputType)()
], AdPlacementOptionsInput);
let AdPlacementResolver = class AdPlacementResolver {
    constructor(adPlacementService) {
        this.adPlacementService = adPlacementService;
    }
    async getAdsForDiscoveryFeed(options, user) {
        const placementOptions = {
            ...options,
            userId: user?.id,
            sessionId: user ? undefined : `anonymous-${Date.now()}`,
        };
        return this.adPlacementService.getAdsForDiscoveryFeed(placementOptions);
    }
    async recordAdClick(campaignId, user) {
        try {
            await this.adPlacementService.recordAdClick(campaignId, user?.id, user ? undefined : `anonymous-${Date.now()}`);
            return true;
        }
        catch (error) {
            console.error('Error recording ad click:', error);
            return false;
        }
    }
    async getRecommendedAdPlacements(merchantId, _user) {
        return this.adPlacementService.getRecommendedPlacements(merchantId);
    }
};
exports.AdPlacementResolver = AdPlacementResolver;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, graphql_1.Query)(() => [AdPlacement]),
    __param(0, (0, graphql_1.Args)('options', { nullable: true })),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AdPlacementOptionsInput,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], AdPlacementResolver.prototype, "getAdsForDiscoveryFeed", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('campaignId', { type: () => graphql_1.ID })),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], AdPlacementResolver.prototype, "recordAdClick", null);
__decorate([
    (0, graphql_1.Query)(() => [ProductAdRecommendation]),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], AdPlacementResolver.prototype, "getRecommendedAdPlacements", null);
exports.AdPlacementResolver = AdPlacementResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [ad_placement_service_1.AdPlacementService])
], AdPlacementResolver);
//# sourceMappingURL=ad-placement.resolver.js.map