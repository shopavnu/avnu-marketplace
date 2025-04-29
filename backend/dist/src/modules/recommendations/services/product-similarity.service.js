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
var ProductSimilarityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSimilarityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_similarity_entity_1 = require("../entities/product-similarity.entity");
const product_service_1 = require("../../products/services/product.service");
const user_behavior_service_1 = require("../../personalization/services/user-behavior.service");
let ProductSimilarityService = ProductSimilarityService_1 = class ProductSimilarityService {
    constructor(productSimilarityRepository, productService, userBehaviorService) {
        this.productSimilarityRepository = productSimilarityRepository;
        this.productService = productService;
        this.userBehaviorService = userBehaviorService;
        this.logger = new common_1.Logger(ProductSimilarityService_1.name);
    }
    async calculateAttributeBasedSimilarity(productId, limit = 20) {
        try {
            const sourceProduct = await this.productService.findOne(productId);
            if (!sourceProduct) {
                throw new Error(`Product with ID ${productId} not found`);
            }
            const allProductsResult = await this.productService.findAll({
                limit: 1000,
            });
            const similarities = [];
            const allProducts = allProductsResult.items || [];
            const filteredProducts = allProducts.filter(product => product.id !== productId);
            for (const targetProduct of filteredProducts) {
                const similarityScore = this.calculateProductAttributeSimilarity(sourceProduct, targetProduct);
                const similarity = this.productSimilarityRepository.create({
                    sourceProductId: productId,
                    targetProductId: targetProduct.id,
                    similarityType: product_similarity_entity_1.SimilarityType.ATTRIBUTE_BASED,
                    score: similarityScore,
                    metadata: {
                        matchedAttributes: this.getMatchedAttributes(sourceProduct, targetProduct),
                    },
                });
                similarities.push(similarity);
            }
            similarities.sort((a, b) => b.score - a.score);
            const topSimilarities = similarities.slice(0, limit);
            await this.productSimilarityRepository.save(topSimilarities);
            return topSimilarities;
        }
        catch (error) {
            this.logger.error(`Failed to calculate attribute-based similarity: ${error.message}`);
            throw error;
        }
    }
    calculateProductAttributeSimilarity(sourceProduct, targetProduct) {
        let score = 0;
        let totalWeight = 0;
        const categoryWeight = 0.4;
        totalWeight += categoryWeight;
        if (this.hasCommonElements(sourceProduct.categories, targetProduct.categories)) {
            score += categoryWeight;
        }
        const brandWeight = 0.2;
        totalWeight += brandWeight;
        if (sourceProduct.brandName === targetProduct.brandName) {
            score += brandWeight;
        }
        const priceWeight = 0.15;
        totalWeight += priceWeight;
        const priceDiff = Math.abs(sourceProduct.price - targetProduct.price);
        const priceAvg = (sourceProduct.price + targetProduct.price) / 2;
        if (priceAvg > 0 && priceDiff / priceAvg <= 0.2) {
            score += priceWeight;
        }
        const descriptionWeight = 0.1;
        totalWeight += descriptionWeight;
        if (sourceProduct.description &&
            targetProduct.description &&
            this.hasCommonKeywords(sourceProduct.description, targetProduct.description)) {
            score += descriptionWeight;
        }
        return totalWeight > 0 ? score / totalWeight : 0;
    }
    getMatchedAttributes(sourceProduct, targetProduct) {
        const matches = {};
        if (this.hasCommonElements(sourceProduct.categories, targetProduct.categories)) {
            matches.categories = this.getCommonElements(sourceProduct.categories, targetProduct.categories);
        }
        if (sourceProduct.brandName === targetProduct.brandName) {
            matches.brand = sourceProduct.brandName;
        }
        const priceDiff = Math.abs(sourceProduct.price - targetProduct.price);
        const priceAvg = (sourceProduct.price + targetProduct.price) / 2;
        if (priceAvg > 0 && priceDiff / priceAvg <= 0.2) {
            matches.priceRange = {
                sourcePrice: sourceProduct.price,
                targetPrice: targetProduct.price,
                difference: priceDiff,
                percentDifference: priceAvg > 0 ? (priceDiff / priceAvg) * 100 : 0,
            };
        }
        return matches;
    }
    hasCommonElements(arr1, arr2) {
        if (!arr1 || !arr2)
            return false;
        return arr1.some(item => arr2.includes(item));
    }
    getCommonElements(arr1, arr2) {
        if (!arr1 || !arr2)
            return [];
        return arr1.filter(item => arr2.includes(item));
    }
    hasCommonKeywords(text1, text2) {
        if (!text1 || !text2)
            return false;
        const keywords1 = this.extractKeywords(text1);
        const keywords2 = this.extractKeywords(text2);
        return this.hasCommonElements(keywords1, keywords2);
    }
    extractKeywords(text) {
        if (!text)
            return [];
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3)
            .filter(word => !['this', 'that', 'with', 'from', 'have', 'your'].includes(word));
    }
    async calculateViewBasedSimilarity(productId, _limit = 20) {
        try {
            this.logger.log(`Calculating view-based similarity for product ${productId}`);
            return [];
        }
        catch (error) {
            this.logger.error(`Failed to calculate view-based similarity: ${error.message}`);
            throw error;
        }
    }
    async calculateHybridSimilarity(productId, limit = 20) {
        try {
            this.logger.log(`Calculating hybrid similarity for product ${productId}`);
            const attributeSimilarities = await this.calculateAttributeBasedSimilarity(productId, limit);
            return attributeSimilarities;
        }
        catch (error) {
            this.logger.error(`Failed to calculate hybrid similarity: ${error.message}`);
            throw error;
        }
    }
    async getSimilarProducts(productId, similarityType = product_similarity_entity_1.SimilarityType.HYBRID, limit = 10) {
        try {
            let similarities = [];
            switch (similarityType) {
                case product_similarity_entity_1.SimilarityType.ATTRIBUTE_BASED:
                    similarities = await this.productSimilarityRepository.find({
                        where: {
                            sourceProductId: productId,
                            similarityType: product_similarity_entity_1.SimilarityType.ATTRIBUTE_BASED,
                        },
                        order: {
                            score: 'DESC',
                        },
                        take: limit,
                    });
                    if (similarities.length === 0) {
                        similarities = await this.calculateAttributeBasedSimilarity(productId, limit);
                    }
                    break;
                case product_similarity_entity_1.SimilarityType.VIEW_BASED:
                    similarities = await this.productSimilarityRepository.find({
                        where: {
                            sourceProductId: productId,
                            similarityType: product_similarity_entity_1.SimilarityType.VIEW_BASED,
                        },
                        order: {
                            score: 'DESC',
                        },
                        take: limit,
                    });
                    if (similarities.length === 0) {
                        similarities = await this.calculateViewBasedSimilarity(productId, limit);
                    }
                    break;
                case product_similarity_entity_1.SimilarityType.HYBRID:
                default:
                    similarities = await this.productSimilarityRepository.find({
                        where: {
                            sourceProductId: productId,
                            similarityType: product_similarity_entity_1.SimilarityType.HYBRID,
                        },
                        order: {
                            score: 'DESC',
                        },
                        take: limit,
                    });
                    if (similarities.length === 0) {
                        similarities = await this.calculateHybridSimilarity(productId, limit);
                    }
                    break;
            }
            const productIds = similarities.map(similarity => similarity.targetProductId);
            const products = await this.productService.findByIds(productIds);
            const productMap = new Map(products.map(product => [product.id, product]));
            return similarities
                .map(similarity => productMap.get(similarity.targetProductId))
                .filter((product) => !!product);
        }
        catch (error) {
            this.logger.error(`Failed to get similar products: ${error.message}`);
            throw error;
        }
    }
    async updateProductSimilarities(productId) {
        try {
            await this.calculateAttributeBasedSimilarity(productId);
            await this.calculateViewBasedSimilarity(productId);
            await this.calculateHybridSimilarity(productId);
        }
        catch (error) {
            this.logger.error(`Failed to update product similarities: ${error.message}`);
            throw error;
        }
    }
    async batchUpdateSimilarities(productIds) {
        try {
            for (const productId of productIds) {
                await this.updateProductSimilarities(productId);
            }
        }
        catch (error) {
            this.logger.error(`Failed to batch update similarities: ${error.message}`);
            throw error;
        }
    }
};
exports.ProductSimilarityService = ProductSimilarityService;
exports.ProductSimilarityService = ProductSimilarityService = ProductSimilarityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_similarity_entity_1.ProductSimilarity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        product_service_1.ProductService,
        user_behavior_service_1.UserBehaviorService])
], ProductSimilarityService);
//# sourceMappingURL=product-similarity.service.js.map