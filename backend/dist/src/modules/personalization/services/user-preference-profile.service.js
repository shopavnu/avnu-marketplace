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
var UserPreferenceProfileService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPreferenceProfileService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_preference_profile_entity_1 = require("../entities/user-preference-profile.entity");
const session_service_1 = require("./session.service");
const session_interaction_type_enum_1 = require("../enums/session-interaction-type.enum");
let UserPreferenceProfileService = UserPreferenceProfileService_1 = class UserPreferenceProfileService {
    constructor(userPreferenceProfileRepository, sessionService) {
        this.userPreferenceProfileRepository = userPreferenceProfileRepository;
        this.sessionService = sessionService;
        this.logger = new common_1.Logger(UserPreferenceProfileService_1.name);
    }
    async getOrCreateProfile(userId) {
        try {
            let profile = await this.userPreferenceProfileRepository.findOne({
                where: { userId },
            });
            if (!profile) {
                profile = this.userPreferenceProfileRepository.create({
                    userId,
                    lastUpdated: new Date(),
                    hasEnoughData: false,
                });
                await this.userPreferenceProfileRepository.save(profile);
            }
            return profile;
        }
        catch (error) {
            this.logger.error(`Failed to get or create user preference profile: ${error.message}`);
            throw error;
        }
    }
    async updateProfileFromSession(userId, sessionId) {
        try {
            const profile = await this.getOrCreateProfile(userId);
            const sessionWeights = await this.sessionService.calculateSessionWeights(sessionId);
            const interactions = await this.sessionService.getRecentInteractions(sessionId, null, 1000);
            await this.processInteractionsForProfile(profile, interactions, sessionWeights);
            return profile;
        }
        catch (error) {
            this.logger.error(`Failed to update user preference profile: ${error.message}`);
            throw error;
        }
    }
    async processInteractionsForProfile(profile, interactions, _sessionWeights) {
        try {
            let totalPageViews = profile.totalPageViews || 0;
            let totalProductViews = profile.totalProductViews || 0;
            let totalScrollDepth = 0;
            let scrollDepthCount = 0;
            let totalProductViewTime = 0;
            let productViewCount = 0;
            let productEngagementCount = profile.productEngagementCount || 0;
            const categoryPreferences = profile.categoryPreferences || {};
            const brandPreferences = profile.brandPreferences || {};
            const productPreferences = profile.productPreferences || {};
            const viewTimeByCategory = profile.viewTimeByCategory || {};
            const viewTimeByBrand = profile.viewTimeByBrand || {};
            const scrollDepthByPageType = profile.scrollDepthByPageType || {};
            const priceRangePreferences = profile.priceRangePreferences || {};
            const recentlyViewedProducts = profile.recentlyViewedProducts || [];
            for (const interaction of interactions) {
                const { type, data } = interaction;
                switch (type) {
                    case session_interaction_type_enum_1.SessionInteractionType.VIEW:
                        totalPageViews++;
                        if (data.type === 'category' && data.categoryId) {
                            categoryPreferences[data.categoryId] =
                                (categoryPreferences[data.categoryId] || 0) + 1;
                        }
                        else if (data.type === 'brand' && data.brandId) {
                            brandPreferences[data.brandId] = (brandPreferences[data.brandId] || 0) + 1;
                        }
                        break;
                    case session_interaction_type_enum_1.SessionInteractionType.PRODUCT_VIEW:
                        totalProductViews++;
                        if (data.productId) {
                            productPreferences[data.productId] = (productPreferences[data.productId] || 0) + 1;
                            if (!recentlyViewedProducts.includes(data.productId)) {
                                recentlyViewedProducts.unshift(data.productId);
                                if (recentlyViewedProducts.length > 20) {
                                    recentlyViewedProducts.pop();
                                }
                            }
                            if (data.viewTimeMs) {
                                const viewTimeSeconds = data.viewTimeMs / 1000;
                                totalProductViewTime += viewTimeSeconds;
                                productViewCount++;
                                if (data.categoryId) {
                                    viewTimeByCategory[data.categoryId] =
                                        (viewTimeByCategory[data.categoryId] || 0) + viewTimeSeconds;
                                }
                                if (data.brandId) {
                                    viewTimeByBrand[data.brandId] =
                                        (viewTimeByBrand[data.brandId] || 0) + viewTimeSeconds;
                                }
                            }
                            if (data.price) {
                                const priceRange = this.getPriceRangeKey(data.price);
                                priceRangePreferences[priceRange] = (priceRangePreferences[priceRange] || 0) + 1;
                            }
                        }
                        break;
                    case session_interaction_type_enum_1.SessionInteractionType.SCROLL_DEPTH:
                        if (data.scrollPercentage) {
                            totalScrollDepth += data.scrollPercentage;
                            scrollDepthCount++;
                            if (data.pageType) {
                                scrollDepthByPageType[data.pageType] = Math.max(scrollDepthByPageType[data.pageType] || 0, data.scrollPercentage);
                            }
                        }
                        break;
                    case session_interaction_type_enum_1.SessionInteractionType.CLICK:
                    case session_interaction_type_enum_1.SessionInteractionType.ADD_TO_CART:
                    case session_interaction_type_enum_1.SessionInteractionType.PURCHASE:
                        if (data.productId) {
                            productEngagementCount++;
                            const engagementWeight = type === session_interaction_type_enum_1.SessionInteractionType.CLICK
                                ? 2
                                : type === session_interaction_type_enum_1.SessionInteractionType.ADD_TO_CART
                                    ? 5
                                    : type === session_interaction_type_enum_1.SessionInteractionType.PURCHASE
                                        ? 10
                                        : 1;
                            productPreferences[data.productId] =
                                (productPreferences[data.productId] || 0) + engagementWeight;
                            if (data.categoryId) {
                                categoryPreferences[data.categoryId] =
                                    (categoryPreferences[data.categoryId] || 0) + engagementWeight;
                            }
                            if (data.brandId) {
                                brandPreferences[data.brandId] =
                                    (brandPreferences[data.brandId] || 0) + engagementWeight;
                            }
                        }
                        break;
                }
            }
            const averageScrollDepth = scrollDepthCount > 0 ? totalScrollDepth / scrollDepthCount : profile.averageScrollDepth;
            const averageProductViewTimeSeconds = productViewCount > 0
                ? totalProductViewTime / productViewCount
                : profile.averageProductViewTimeSeconds;
            const topViewedCategories = this.getTopItems(categoryPreferences, 10);
            const topViewedBrands = this.getTopItems(brandPreferences, 10);
            const hasEnoughData = totalProductViews >= 5 && productEngagementCount >= 3;
            profile.totalPageViews = totalPageViews;
            profile.totalProductViews = totalProductViews;
            profile.averageScrollDepth = averageScrollDepth;
            profile.averageProductViewTimeSeconds = averageProductViewTimeSeconds;
            profile.productEngagementCount = productEngagementCount;
            profile.topViewedCategories = topViewedCategories;
            profile.topViewedBrands = topViewedBrands;
            profile.recentlyViewedProducts = recentlyViewedProducts;
            profile.categoryPreferences = categoryPreferences;
            profile.brandPreferences = brandPreferences;
            profile.productPreferences = productPreferences;
            profile.viewTimeByCategory = viewTimeByCategory;
            profile.viewTimeByBrand = viewTimeByBrand;
            profile.scrollDepthByPageType = scrollDepthByPageType;
            profile.priceRangePreferences = priceRangePreferences;
            profile.hasEnoughData = hasEnoughData;
            profile.lastUpdated = new Date();
            await this.userPreferenceProfileRepository.save(profile);
        }
        catch (error) {
            this.logger.error(`Failed to process interactions for profile: ${error.message}`);
            throw error;
        }
    }
    getTopItems(preferencesMap, limit) {
        return Object.entries(preferencesMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([key]) => key);
    }
    getPriceRangeKey(price) {
        if (price < 25)
            return 'under_25';
        if (price < 50)
            return '25_to_50';
        if (price < 100)
            return '50_to_100';
        if (price < 250)
            return '100_to_250';
        if (price < 500)
            return '250_to_500';
        return 'over_500';
    }
    async getUserPreferenceProfile(userId) {
        try {
            return this.getOrCreateProfile(userId);
        }
        catch (error) {
            this.logger.error(`Failed to get user preference profile: ${error.message}`);
            throw error;
        }
    }
    async getPersonalizedRecommendations(userId, limit = 10) {
        try {
            const profile = await this.getOrCreateProfile(userId);
            if (!profile.hasEnoughData) {
                this.logger.log(`Not enough data for personalized recommendations for user ${userId}`);
                return [];
            }
            const topProducts = this.getTopItems(profile.productPreferences || {}, limit);
            return topProducts;
        }
        catch (error) {
            this.logger.error(`Failed to get personalized recommendations: ${error.message}`);
            return [];
        }
    }
};
exports.UserPreferenceProfileService = UserPreferenceProfileService;
exports.UserPreferenceProfileService = UserPreferenceProfileService = UserPreferenceProfileService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_preference_profile_entity_1.UserPreferenceProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        session_service_1.SessionService])
], UserPreferenceProfileService);
//# sourceMappingURL=user-preference-profile.service.js.map