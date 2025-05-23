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
var CollaborativeFilteringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollaborativeFilteringService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const elasticsearch_1 = require("@nestjs/elasticsearch");
const user_preference_service_1 = require("./user-preference.service");
let CollaborativeFilteringService = CollaborativeFilteringService_1 = class CollaborativeFilteringService {
    constructor(configService, elasticsearchService, userPreferenceService) {
        this.configService = configService;
        this.elasticsearchService = elasticsearchService;
        this.userPreferenceService = userPreferenceService;
        this.logger = new common_1.Logger(CollaborativeFilteringService_1.name);
        this.similarityThreshold = this.configService.get('SIMILARITY_THRESHOLD', 0.3);
        this.maxSimilarUsers = this.configService.get('MAX_SIMILAR_USERS', 10);
        this.interactionsIndex = this.configService.get('ELASTICSEARCH_USER_INTERACTIONS_INDEX', 'user_interactions');
        this.preferencesIndex = this.configService.get('ELASTICSEARCH_USER_PREFERENCES_INDEX', 'user_preferences');
    }
    getRelatedCategories(category) {
        try {
            const relatedCategoriesMap = {
                electronics: [
                    { category: 'computers', similarity: 0.8 },
                    { category: 'accessories', similarity: 0.7 },
                    { category: 'phones', similarity: 0.6 },
                ],
                clothing: [
                    { category: 'shoes', similarity: 0.8 },
                    { category: 'accessories', similarity: 0.7 },
                    { category: 'outerwear', similarity: 0.6 },
                ],
                home: [
                    { category: 'furniture', similarity: 0.8 },
                    { category: 'kitchen', similarity: 0.7 },
                    { category: 'decor', similarity: 0.6 },
                ],
                beauty: [
                    { category: 'skincare', similarity: 0.8 },
                    { category: 'makeup', similarity: 0.7 },
                    { category: 'haircare', similarity: 0.6 },
                ],
            };
            return relatedCategoriesMap[category.toLowerCase()] || [];
        }
        catch (error) {
            this.logger.error(`Error getting related categories: ${error.message}`);
            return [];
        }
    }
    async findSimilarUsers(userId) {
        try {
            const userPreferences = await this.userPreferenceService.getUserPreferences(userId);
            if (!userPreferences) {
                this.logger.debug(`No preferences found for user ${userId}`);
                return [];
            }
            const userFeatures = this.extractPreferenceFeatures(userPreferences);
            const result = await this.elasticsearchService.search({
                index: this.preferencesIndex,
                body: {
                    query: {
                        bool: {
                            must_not: [
                                { term: { userId } },
                            ],
                            should: [
                                ...Object.keys(userPreferences.categories)
                                    .filter(category => userPreferences.categories[category] > 1)
                                    .map(category => ({
                                    match: {
                                        [`categories.${category}`]: {
                                            query: userPreferences.categories[category],
                                            boost: 2.0,
                                        },
                                    },
                                })),
                                ...Object.keys(userPreferences.brands)
                                    .filter(brand => userPreferences.brands[brand] > 1)
                                    .map(brand => ({
                                    match: {
                                        [`brands.${brand}`]: { query: userPreferences.brands[brand], boost: 1.5 },
                                    },
                                })),
                                ...userPreferences.priceRanges.map(range => ({
                                    range: {
                                        'priceRanges.min': { gte: range.min * 0.8, lte: range.min * 1.2 },
                                    },
                                })),
                                ...userPreferences.priceRanges.map(range => ({
                                    range: {
                                        'priceRanges.max': { gte: range.max * 0.8, lte: range.max * 1.2 },
                                    },
                                })),
                            ],
                            minimum_should_match: 2,
                        },
                    },
                    size: this.maxSimilarUsers * 2,
                },
            });
            const similarUsers = [];
            const hits = (result.hits?.hits || []);
            for (const hit of hits) {
                const similarUserPreferences = hit._source;
                const similarUserId = similarUserPreferences.userId;
                const similarUserFeatures = this.extractPreferenceFeatures(similarUserPreferences);
                const similarity = this.calculateCosineSimilarity(userFeatures, similarUserFeatures);
                if (similarity >= this.similarityThreshold) {
                    similarUsers.push({
                        userId: similarUserId,
                        similarity,
                    });
                }
            }
            return similarUsers
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, this.maxSimilarUsers);
        }
        catch (error) {
            this.logger.error(`Error finding similar users for ${userId}: ${error.message}`);
            return [];
        }
    }
    async enhanceUserPreferences(userId) {
        try {
            const userPreferences = await this.userPreferenceService.getUserPreferences(userId);
            if (!userPreferences) {
                this.logger.debug(`No preferences found for user ${userId}`);
                return false;
            }
            const similarUsers = await this.findSimilarUsers(userId);
            if (similarUsers.length === 0) {
                this.logger.debug(`No similar users found for user ${userId}`);
                return false;
            }
            const similarUserPreferences = await Promise.all(similarUsers.map(async (similar) => {
                const prefs = await this.userPreferenceService.getUserPreferences(similar.userId);
                return { preferences: prefs, similarity: similar.similarity };
            }));
            const validSimilarPreferences = similarUserPreferences.filter(item => item.preferences !== null);
            if (validSimilarPreferences.length === 0) {
                return false;
            }
            this.enhancePreferenceMap(userPreferences.categories, validSimilarPreferences.map(item => ({
                map: item.preferences.categories,
                weight: item.similarity,
            })), 0.5);
            this.enhancePreferenceMap(userPreferences.brands, validSimilarPreferences.map(item => ({
                map: item.preferences.brands,
                weight: item.similarity,
            })), 0.5);
            this.enhancePreferenceMap(userPreferences.values, validSimilarPreferences.map(item => ({
                map: item.preferences.values,
                weight: item.similarity,
            })), 0.4);
            const existingRanges = new Set(userPreferences.priceRanges.map(range => `${range.min}-${range.max}`));
            for (const { preferences, similarity } of validSimilarPreferences) {
                for (const range of preferences.priceRanges) {
                    const rangeKey = `${range.min}-${range.max}`;
                    if (!existingRanges.has(rangeKey)) {
                        userPreferences.priceRanges.push({
                            min: range.min,
                            max: range.max,
                            weight: range.weight * similarity * 0.3,
                        });
                        existingRanges.add(rangeKey);
                    }
                }
            }
            userPreferences.priceRanges.sort((a, b) => b.weight - a.weight);
            if (userPreferences.priceRanges.length > 8) {
                userPreferences.priceRanges = userPreferences.priceRanges.slice(0, 8);
            }
            if (!userPreferences.additionalData) {
                userPreferences.additionalData = {};
            }
            userPreferences.additionalData.collaborativeFiltering = {
                appliedAt: Date.now(),
                similarUsersCount: validSimilarPreferences.length,
                averageSimilarity: validSimilarPreferences.reduce((sum, item) => sum + item.similarity, 0) /
                    validSimilarPreferences.length,
            };
            const result = await this.userPreferenceService.saveUserPreferences(userPreferences);
            this.logger.debug(`Enhanced preferences for user ${userId} using collaborative filtering`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error enhancing preferences for user ${userId}: ${error.message}`);
            return false;
        }
    }
    async getCollaborativeRecommendations(userId, limit = 10) {
        try {
            const similarUsers = await this.findSimilarUsers(userId);
            if (similarUsers.length === 0) {
                return [];
            }
            const userPreferences = await this.userPreferenceService.getUserPreferences(userId);
            const viewedProductIds = userPreferences?.recentlyViewedProducts.map(item => item.productId) || [];
            const purchasedProductIds = userPreferences?.purchaseHistory.map(item => item.productId) || [];
            const excludeProductIds = [...new Set([...viewedProductIds, ...purchasedProductIds])];
            const result = await this.elasticsearchService.search({
                index: this.interactionsIndex,
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    terms: {
                                        userId: similarUsers.map(user => user.userId),
                                    },
                                },
                                {
                                    terms: {
                                        type: ['view_product', 'add_to_cart', 'purchase'],
                                    },
                                },
                            ],
                            must_not: excludeProductIds.length > 0
                                ? [
                                    {
                                        terms: {
                                            'data.productId': excludeProductIds,
                                        },
                                    },
                                ]
                                : [],
                        },
                    },
                    aggs: {
                        products: {
                            terms: {
                                field: 'data.productId',
                                size: limit * 3,
                            },
                            aggs: {
                                interaction_types: {
                                    terms: {
                                        field: 'type',
                                    },
                                },
                                users: {
                                    terms: {
                                        field: 'userId',
                                        size: similarUsers.length,
                                    },
                                },
                            },
                        },
                    },
                    size: 0,
                },
            });
            const aggregations = result.aggregations;
            const productBuckets = (aggregations?.products?.buckets || []);
            const recommendations = [];
            for (const bucket of productBuckets) {
                const productId = bucket.key;
                const _interactionCount = bucket.doc_count;
                let score = 0;
                const interactionTypes = bucket.interaction_types.buckets;
                for (const type of interactionTypes) {
                    switch (type.key) {
                        case 'purchase':
                            score += type.doc_count * 3;
                            break;
                        case 'add_to_cart':
                            score += type.doc_count * 2;
                            break;
                        case 'view_product':
                            score += type.doc_count * 1;
                            break;
                    }
                }
                const userBuckets = bucket.users.buckets;
                for (const userBucket of userBuckets) {
                    const userId = userBucket.key;
                    const similarUser = similarUsers.find(u => u.userId === userId);
                    if (similarUser) {
                        score *= 1 + similarUser.similarity;
                    }
                }
                recommendations.push({
                    productId,
                    score,
                });
            }
            return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
        }
        catch (error) {
            this.logger.error(`Error getting collaborative recommendations for user ${userId}: ${error.message}`);
            return [];
        }
    }
    async applyCollaborativeBoosts(query, userId, boostStrength = 1.0) {
        try {
            const recommendations = await this.getCollaborativeRecommendations(userId, 20);
            if (recommendations.length === 0) {
                return query;
            }
            const enhancedQuery = JSON.parse(JSON.stringify(query));
            if (!enhancedQuery.query.function_score) {
                enhancedQuery.query = {
                    function_score: {
                        query: enhancedQuery.query,
                        functions: [],
                        score_mode: 'sum',
                        boost_mode: 'multiply',
                    },
                };
            }
            const functions = enhancedQuery.query.function_score.functions;
            for (const recommendation of recommendations) {
                const normalizedScore = recommendation.score / recommendations[0].score;
                functions.push({
                    filter: {
                        term: {
                            _id: recommendation.productId,
                        },
                    },
                    weight: normalizedScore * boostStrength,
                });
            }
            if (!enhancedQuery.ext) {
                enhancedQuery.ext = {};
            }
            enhancedQuery.ext.collaborative_filtering = {
                applied: true,
                recommendations_count: recommendations.length,
                boost_strength: boostStrength,
            };
            return enhancedQuery;
        }
        catch (error) {
            this.logger.error(`Error applying collaborative boosts for user ${userId}: ${error.message}`);
            return query;
        }
    }
    extractPreferenceFeatures(preferences) {
        const features = [];
        const categoryValues = Object.values(preferences.categories);
        const maxCategoryWeight = Math.max(...categoryValues, 1);
        for (let i = 0; i < 10; i++) {
            features.push(i < categoryValues.length ? categoryValues[i] / maxCategoryWeight : 0);
        }
        const brandValues = Object.values(preferences.brands);
        const maxBrandWeight = Math.max(...brandValues, 1);
        for (let i = 0; i < 10; i++) {
            features.push(i < brandValues.length ? brandValues[i] / maxBrandWeight : 0);
        }
        if (preferences.priceRanges.length > 0) {
            const avgMin = preferences.priceRanges.reduce((sum, range) => sum + range.min, 0) /
                preferences.priceRanges.length;
            const avgMax = preferences.priceRanges.reduce((sum, range) => sum + range.max, 0) /
                preferences.priceRanges.length;
            features.push(avgMin / 1000);
            features.push(avgMax / 1000);
        }
        else {
            features.push(0);
            features.push(0);
        }
        return features;
    }
    calculateCosineSimilarity(a, b) {
        if (a.length !== b.length) {
            return 0;
        }
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA === 0 || normB === 0) {
            return 0;
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    enhancePreferenceMap(targetMap, sourceMaps, enhancementFactor) {
        const existingKeys = new Set(Object.keys(targetMap));
        for (const { map, weight } of sourceMaps) {
            for (const [key, value] of Object.entries(map)) {
                if (existingKeys.has(key)) {
                    targetMap[key] += value * weight * enhancementFactor * 0.2;
                }
                else {
                    targetMap[key] = value * weight * enhancementFactor;
                    existingKeys.add(key);
                }
            }
        }
    }
};
exports.CollaborativeFilteringService = CollaborativeFilteringService;
exports.CollaborativeFilteringService = CollaborativeFilteringService = CollaborativeFilteringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        elasticsearch_1.ElasticsearchService,
        user_preference_service_1.UserPreferenceService])
], CollaborativeFilteringService);
//# sourceMappingURL=collaborative-filtering.service.js.map