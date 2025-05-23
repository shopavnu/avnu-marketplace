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
var EnhancedPersonalizationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedPersonalizationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_recommendation_entity_1 = require("../entities/product-recommendation.entity");
const recommendation_config_entity_1 = require("../entities/recommendation-config.entity");
const product_similarity_service_1 = require("./product-similarity.service");
const user_preference_profile_service_1 = require("../../personalization/services/user-preference-profile.service");
const services_1 = require("../../products/services");
const user_behavior_entity_1 = require("../../personalization/entities/user-behavior.entity");
let EnhancedPersonalizationService = EnhancedPersonalizationService_1 = class EnhancedPersonalizationService {
    constructor(productRecommendationRepository, recommendationConfigRepository, productSimilarityService, userPreferenceProfileService, productService) {
        this.productRecommendationRepository = productRecommendationRepository;
        this.recommendationConfigRepository = recommendationConfigRepository;
        this.productSimilarityService = productSimilarityService;
        this.userPreferenceProfileService = userPreferenceProfileService;
        this.productService = productService;
        this.logger = new common_1.Logger(EnhancedPersonalizationService_1.name);
    }
    async getPersonalizedRecommendations(userId, limit = 10, refresh = false, excludePurchased = true, freshness = 0.7) {
        try {
            if (refresh) {
                await this.generatePersonalizedRecommendations(userId, limit * 3);
            }
            let purchasedProductIds = new Set();
            if (excludePurchased) {
                const purchasedProducts = await this.getUserPurchasedProducts(userId);
                purchasedProductIds = new Set(purchasedProducts.map(p => p.entityId));
            }
            const recentlyViewedProducts = await this.getRecentlyViewedProducts(userId, 20);
            const recentlyViewedIds = new Set(recentlyViewedProducts.map(p => p.entityId));
            const recommendations = await this.productRecommendationRepository.find({
                where: { userId },
                order: { score: 'DESC' },
                take: limit * 3,
            });
            if (recommendations.length < limit * 2) {
                await this.generatePersonalizedRecommendations(userId, limit * 3);
                const newRecommendations = await this.productRecommendationRepository.find({
                    where: { userId },
                    order: { score: 'DESC' },
                    take: limit * 3,
                });
                return this.processRecommendations(newRecommendations, purchasedProductIds, recentlyViewedIds, limit, freshness);
            }
            return this.processRecommendations(recommendations, purchasedProductIds, recentlyViewedIds, limit, freshness);
        }
        catch (error) {
            this.logger.error(`Failed to get personalized recommendations: ${error.message}`);
            throw error;
        }
    }
    async getTrendingProducts(userId, limit = 10, excludePurchased = true) {
        try {
            const queryBuilder = this.productRecommendationRepository.manager
                .createQueryBuilder()
                .select('p')
                .from('products', 'p')
                .where('p.isSuppressed = :isSuppressed', { isSuppressed: false })
                .orderBy('p.viewCount', 'DESC')
                .addOrderBy('p.createdAt', 'DESC')
                .limit(limit * 2);
            const trendingProducts = (await queryBuilder.getMany());
            if (!excludePurchased || userId === 'anonymous') {
                return trendingProducts.slice(0, limit);
            }
            const purchasedProducts = await this.getUserPurchasedProducts(userId);
            const purchasedProductIds = new Set(purchasedProducts.map(p => p.entityId));
            const filteredProducts = trendingProducts.filter(product => !purchasedProductIds.has(product.id));
            return filteredProducts.slice(0, limit);
        }
        catch (error) {
            this.logger.error(`Failed to get trending products: ${error.message}`);
            return [];
        }
    }
    async processRecommendations(recommendations, purchasedProductIds, recentlyViewedIds, limit, freshness = 0.7) {
        try {
            const filteredRecommendations = recommendations.filter(rec => !purchasedProductIds.has(rec.productId));
            if (filteredRecommendations.length === 0) {
                return [];
            }
            const recentlyViewedRecommendations = filteredRecommendations.filter(rec => recentlyViewedIds.has(rec.productId));
            const freshRecommendations = filteredRecommendations.filter(rec => !recentlyViewedIds.has(rec.productId));
            const freshLimit = Math.floor(limit * freshness);
            const recentLimit = limit - freshLimit;
            let selectedRecommendations = [];
            selectedRecommendations = selectedRecommendations.concat(freshRecommendations.slice(0, freshLimit));
            const remainingSlots = limit - selectedRecommendations.length;
            if (remainingSlots > 0 && recentlyViewedRecommendations.length > 0) {
                selectedRecommendations = selectedRecommendations.concat(recentlyViewedRecommendations.slice(0, Math.min(remainingSlots, recentLimit)));
            }
            const stillRemainingSlots = limit - selectedRecommendations.length;
            if (stillRemainingSlots > 0 && freshRecommendations.length > freshLimit) {
                selectedRecommendations = selectedRecommendations.concat(freshRecommendations.slice(freshLimit, freshLimit + stillRemainingSlots));
            }
            const productIds = selectedRecommendations.map(rec => rec.productId);
            return this.productService
                .findByIds(productIds)
                .then(products => products.filter(product => !product.isSuppressed))
                .catch(error => {
                this.logger.error(`Failed to fetch products: ${error.message}`);
                return [];
            });
        }
        catch (error) {
            this.logger.error(`Failed to process recommendations: ${error.message}`);
            return [];
        }
    }
    async generatePersonalizedRecommendations(userId, limit = 10, algorithmId) {
        try {
            const userProfile = await this.userPreferenceProfileService.getUserPreferenceProfile(userId);
            if (!userProfile.hasEnoughData) {
                this.logger.log(`Not enough data for personalized recommendations for user ${userId}`);
                return this.generatePopularityBasedRecommendations(userId, limit);
            }
            const algorithm = algorithmId
                ? await this.recommendationConfigRepository.findOne({ where: { id: algorithmId } })
                : await this.recommendationConfigRepository.findOne({
                    where: {
                        isActive: true,
                        supportedRecommendationTypes: 'personalized',
                    },
                    order: { version: 'DESC' },
                });
            if (!algorithm) {
                throw new Error('No active recommendation algorithm found');
            }
            let recommendations = [];
            switch (algorithm.algorithmType) {
                case recommendation_config_entity_1.RecommendationAlgorithmType.CONTENT_BASED:
                    recommendations = await this.generateContentBasedRecommendations(userId, userProfile, algorithm.id, limit);
                    break;
                case recommendation_config_entity_1.RecommendationAlgorithmType.COLLABORATIVE_FILTERING:
                    recommendations = await this.generateCollaborativeFilteringRecommendations(userId, userProfile, algorithm.id, limit);
                    break;
                case recommendation_config_entity_1.RecommendationAlgorithmType.HYBRID:
                    recommendations = await this.generateHybridRecommendations(userId, userProfile, algorithm.id, limit);
                    break;
                default:
                    recommendations = await this.generateContentBasedRecommendations(userId, userProfile, algorithm.id, limit);
            }
            await this.productRecommendationRepository.save(recommendations);
            return recommendations;
        }
        catch (error) {
            this.logger.error(`Failed to generate personalized recommendations: ${error.message}`);
            throw error;
        }
    }
    async generateContentBasedRecommendations(_userId, _userProfile, _algorithmId, _limit) {
        return [];
    }
    async generateCollaborativeFilteringRecommendations(_userId, _userProfile, _algorithmId, _limit) {
        return [];
    }
    async generateHybridRecommendations(_userId, _userProfile, _algorithmId, _limit) {
        return [];
    }
    async generatePopularityBasedRecommendations(_userId, _limit) {
        return [];
    }
    async getUserPurchasedProducts(userId) {
        try {
            const queryBuilder = this.productRecommendationRepository.manager
                .createQueryBuilder()
                .select('ub')
                .from('user_behaviors', 'ub')
                .where('ub.userId = :userId', { userId })
                .andWhere('ub.entityType = :entityType', { entityType: 'product' })
                .andWhere('ub.behaviorType = :behaviorType', { behaviorType: user_behavior_entity_1.BehaviorType.PURCHASE });
            return queryBuilder.getMany();
        }
        catch (error) {
            this.logger.error(`Failed to get user purchased products: ${error.message}`);
            return [];
        }
    }
    async getRecentlyViewedProducts(userId, limit = 20) {
        try {
            const queryBuilder = this.productRecommendationRepository.manager
                .createQueryBuilder()
                .select('ub')
                .from('user_behaviors', 'ub')
                .where('ub.userId = :userId', { userId })
                .andWhere('ub.entityType = :entityType', { entityType: 'product' })
                .andWhere('ub.behaviorType = :behaviorType', { behaviorType: user_behavior_entity_1.BehaviorType.VIEW })
                .orderBy('ub.lastInteractionAt', 'DESC')
                .limit(limit);
            return queryBuilder.getMany();
        }
        catch (error) {
            this.logger.error(`Failed to get recently viewed products: ${error.message}`);
            return [];
        }
    }
};
exports.EnhancedPersonalizationService = EnhancedPersonalizationService;
exports.EnhancedPersonalizationService = EnhancedPersonalizationService = EnhancedPersonalizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_recommendation_entity_1.ProductRecommendation)),
    __param(1, (0, typeorm_1.InjectRepository)(recommendation_config_entity_1.RecommendationConfig)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        product_similarity_service_1.ProductSimilarityService,
        user_preference_profile_service_1.UserPreferenceProfileService,
        services_1.ProductService])
], EnhancedPersonalizationService);
//# sourceMappingURL=enhanced-personalization.service.js.map