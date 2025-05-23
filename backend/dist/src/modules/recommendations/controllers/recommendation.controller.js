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
var RecommendationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const product_similarity_service_1 = require("../services/product-similarity.service");
const enhanced_personalization_service_1 = require("../services/enhanced-personalization.service");
const product_similarity_entity_1 = require("../entities/product-similarity.entity");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const optional_auth_guard_1 = require("../../auth/guards/optional-auth.guard");
let RecommendationController = RecommendationController_1 = class RecommendationController {
    constructor(productSimilarityService, enhancedPersonalizationService) {
        this.productSimilarityService = productSimilarityService;
        this.enhancedPersonalizationService = enhancedPersonalizationService;
        this.logger = new common_1.Logger(RecommendationController_1.name);
    }
    async getSimilarProducts(productId, type = product_similarity_entity_1.SimilarityType.HYBRID, limit = 10) {
        try {
            const similarProducts = await this.productSimilarityService.getSimilarProducts(productId, type, limit);
            return {
                success: true,
                data: similarProducts,
                meta: {
                    count: similarProducts.length,
                    similarityType: type,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to get similar products: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to get similar products',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPersonalizedRecommendations(req, limit = 10, refresh = false, excludePurchased = true, freshness = 0.7) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'User ID is required',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const recommendations = await this.enhancedPersonalizationService.getPersonalizedRecommendations(userId, limit, refresh, excludePurchased, freshness);
            return {
                success: true,
                data: recommendations,
                meta: {
                    count: recommendations.length,
                    refresh,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to get personalized recommendations: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to get personalized recommendations',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTrendingProducts(req, limit = 10, excludePurchased = true) {
        try {
            const userId = req.user?.id || 'anonymous';
            const trendingProducts = await this.enhancedPersonalizationService.getTrendingProducts(userId, limit, excludePurchased);
            return {
                success: true,
                data: trendingProducts,
                meta: {
                    count: trendingProducts.length,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to get trending products: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to get trending products',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async trackImpression(_recommendationId) {
        try {
            return {
                success: true,
                message: 'Impression tracked successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to track impression: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to track impression',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async trackClick(_recommendationId) {
        try {
            return {
                success: true,
                message: 'Click tracked successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to track click: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to track click',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async trackConversion(_recommendationId) {
        try {
            return {
                success: true,
                message: 'Conversion tracked successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to track conversion: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to track conversion',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateProductSimilarities(productId) {
        try {
            await this.productSimilarityService.updateProductSimilarities(productId);
            return {
                success: true,
                message: 'Product similarities updated successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to update product similarities: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to update product similarities',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async batchUpdateSimilarities(body) {
        try {
            await this.productSimilarityService.batchUpdateSimilarities(body.productIds);
            return {
                success: true,
                message: 'Product similarities updated successfully',
                meta: {
                    count: body.productIds.length,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to batch update similarities: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to batch update similarities',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.RecommendationController = RecommendationController;
__decorate([
    (0, common_1.Get)('similar-products/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get similar products' }),
    (0, swagger_1.ApiParam)({ name: 'productId', description: 'Product ID' }),
    (0, swagger_1.ApiQuery)({ name: 'type', enum: product_similarity_entity_1.SimilarityType, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns similar products' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getSimilarProducts", null);
__decorate([
    (0, common_1.Get)('personalized'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get personalized recommendations' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'refresh', type: Boolean, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'excludePurchased', type: Boolean, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'freshness', type: Number, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns personalized recommendations' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('refresh')),
    __param(3, (0, common_1.Query)('excludePurchased')),
    __param(4, (0, common_1.Query)('freshness')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Boolean, Boolean, Number]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getPersonalizedRecommendations", null);
__decorate([
    (0, common_1.Get)('trending'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get trending products' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'excludePurchased', type: Boolean, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns trending products' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('excludePurchased')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Boolean]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getTrendingProducts", null);
__decorate([
    (0, common_1.Post)('track/impression/:recommendationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Track recommendation impression' }),
    (0, swagger_1.ApiParam)({ name: 'recommendationId', description: 'Recommendation ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Impression tracked successfully' }),
    __param(0, (0, common_1.Param)('recommendationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "trackImpression", null);
__decorate([
    (0, common_1.Post)('track/click/:recommendationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Track recommendation click' }),
    (0, swagger_1.ApiParam)({ name: 'recommendationId', description: 'Recommendation ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Click tracked successfully' }),
    __param(0, (0, common_1.Param)('recommendationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "trackClick", null);
__decorate([
    (0, common_1.Post)('track/conversion/:recommendationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Track recommendation conversion' }),
    (0, swagger_1.ApiParam)({ name: 'recommendationId', description: 'Recommendation ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversion tracked successfully' }),
    __param(0, (0, common_1.Param)('recommendationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "trackConversion", null);
__decorate([
    (0, common_1.Post)('update-similarities/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update product similarities' }),
    (0, swagger_1.ApiParam)({ name: 'productId', description: 'Product ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Similarities updated successfully' }),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "updateProductSimilarities", null);
__decorate([
    (0, common_1.Post)('batch-update-similarities'),
    (0, swagger_1.ApiOperation)({ summary: 'Batch update product similarities' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Similarities updated successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "batchUpdateSimilarities", null);
exports.RecommendationController = RecommendationController = RecommendationController_1 = __decorate([
    (0, swagger_1.ApiTags)('recommendations'),
    (0, common_1.Controller)('recommendations'),
    __metadata("design:paramtypes", [product_similarity_service_1.ProductSimilarityService,
        enhanced_personalization_service_1.EnhancedPersonalizationService])
], RecommendationController);
//# sourceMappingURL=recommendation.controller.js.map