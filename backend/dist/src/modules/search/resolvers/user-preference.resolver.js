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
exports.UserPreferenceResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const user_entity_1 = require("../../users/entities/user.entity");
const preference_collector_service_1 = require("../services/preference-collector.service");
const user_preference_service_1 = require("../services/user-preference.service");
const products_service_1 = require("../../products/products.service");
const user_preferences_survey_dto_1 = require("../dto/user-preferences-survey.dto");
const search_filters_input_1 = require("../dto/search-filters.input");
const graphql_2 = require("@nestjs/graphql");
var PreferenceType;
(function (PreferenceType) {
    PreferenceType["CATEGORIES"] = "categories";
    PreferenceType["BRANDS"] = "brands";
    PreferenceType["VALUES"] = "values";
    PreferenceType["PRICE_RANGES"] = "priceRanges";
})(PreferenceType || (PreferenceType = {}));
(0, graphql_2.registerEnumType)(PreferenceType, {
    name: 'PreferenceType',
    description: 'Types of user preferences that can be managed',
});
let UserPreferenceResolver = class UserPreferenceResolver {
    constructor(preferenceCollectorService, userPreferenceService, productsService) {
        this.preferenceCollectorService = preferenceCollectorService;
        this.userPreferenceService = userPreferenceService;
        this.productsService = productsService;
    }
    async trackSearch(user, query, filters, resultCount) {
        return this.preferenceCollectorService.trackSearch(user.id, query, filters?.filters, resultCount);
    }
    async trackProductView(user, productId, referrer) {
        const products = await this.productsService.findByIds([productId]);
        const product = products.length > 0 ? products[0] : null;
        if (!product) {
            return false;
        }
        return this.preferenceCollectorService.trackProductView(user.id, product, referrer);
    }
    async trackAddToCart(user, productId, quantity) {
        const products = await this.productsService.findByIds([productId]);
        const product = products.length > 0 ? products[0] : null;
        if (!product) {
            return false;
        }
        return this.preferenceCollectorService.trackAddToCart(user.id, product, quantity);
    }
    async trackPurchase(user, productId, quantity) {
        const products = await this.productsService.findByIds([productId]);
        const product = products.length > 0 ? products[0] : null;
        if (!product) {
            return false;
        }
        return this.preferenceCollectorService.trackPurchase(user.id, product, quantity);
    }
    async trackFilterApply(user, filters) {
        return this.preferenceCollectorService.trackFilterApply(user.id, filters.filters);
    }
    async trackCategoryClick(user, category) {
        return this.preferenceCollectorService.trackCategoryClick(user.id, category);
    }
    async trackBrandClick(user, brand) {
        return this.preferenceCollectorService.trackBrandClick(user.id, brand);
    }
    async submitPreferencesSurvey(user, surveyData) {
        return this.preferenceCollectorService.processPreferencesSurvey(user.id, surveyData);
    }
    async clearPreferencesCache() {
        this.userPreferenceService.clearCache();
        return true;
    }
    async applyPreferenceDecay(user) {
        return this.preferenceCollectorService.applyPreferenceDecay(user.id);
    }
    async applyImmediateDecay(user, preferenceType, decayFactor) {
        return this.preferenceCollectorService.applyImmediateDecay(user.id, preferenceType, decayFactor);
    }
};
exports.UserPreferenceResolver = UserPreferenceResolver;
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('query')),
    __param(2, (0, graphql_1.Args)('filters', { nullable: true, type: () => search_filters_input_1.SearchFiltersInput })),
    __param(3, (0, graphql_1.Args)('resultCount', { nullable: true, type: () => Number })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, search_filters_input_1.SearchFiltersInput, Number]),
    __metadata("design:returntype", Promise)
], UserPreferenceResolver.prototype, "trackSearch", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('productId')),
    __param(2, (0, graphql_1.Args)('referrer', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, String]),
    __metadata("design:returntype", Promise)
], UserPreferenceResolver.prototype, "trackProductView", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('productId')),
    __param(2, (0, graphql_1.Args)('quantity', { nullable: true, defaultValue: 1 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, Number]),
    __metadata("design:returntype", Promise)
], UserPreferenceResolver.prototype, "trackAddToCart", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('productId')),
    __param(2, (0, graphql_1.Args)('quantity', { nullable: true, defaultValue: 1 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, Number]),
    __metadata("design:returntype", Promise)
], UserPreferenceResolver.prototype, "trackPurchase", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('filters', { type: () => search_filters_input_1.SearchFiltersInput })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        search_filters_input_1.SearchFiltersInput]),
    __metadata("design:returntype", Promise)
], UserPreferenceResolver.prototype, "trackFilterApply", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], UserPreferenceResolver.prototype, "trackCategoryClick", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('brand')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], UserPreferenceResolver.prototype, "trackBrandClick", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('surveyData')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        user_preferences_survey_dto_1.UserPreferencesSurveyInput]),
    __metadata("design:returntype", Promise)
], UserPreferenceResolver.prototype, "submitPreferencesSurvey", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserPreferenceResolver.prototype, "clearPreferencesCache", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], UserPreferenceResolver.prototype, "applyPreferenceDecay", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('preferenceType')),
    __param(2, (0, graphql_1.Args)('decayFactor', { nullable: true, defaultValue: 0.5 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, Number]),
    __metadata("design:returntype", Promise)
], UserPreferenceResolver.prototype, "applyImmediateDecay", null);
exports.UserPreferenceResolver = UserPreferenceResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [preference_collector_service_1.PreferenceCollectorService,
        user_preference_service_1.UserPreferenceService,
        products_service_1.ProductsService])
], UserPreferenceResolver);
//# sourceMappingURL=user-preference.resolver.js.map