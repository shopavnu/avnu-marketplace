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
var SearchRelevanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchRelevanceService = exports.RelevanceAlgorithm = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const user_preference_service_1 = require("./user-preference.service");
const collaborative_filtering_service_1 = require("./collaborative-filtering.service");
const preference_decay_service_1 = require("./preference-decay.service");
var RelevanceAlgorithm;
(function (RelevanceAlgorithm) {
    RelevanceAlgorithm["STANDARD"] = "standard";
    RelevanceAlgorithm["INTENT_BOOSTED"] = "intent";
    RelevanceAlgorithm["USER_PREFERENCE"] = "preference";
    RelevanceAlgorithm["HYBRID"] = "hybrid";
    RelevanceAlgorithm["SEMANTIC"] = "semantic";
})(RelevanceAlgorithm || (exports.RelevanceAlgorithm = RelevanceAlgorithm = {}));
let SearchRelevanceService = SearchRelevanceService_1 = class SearchRelevanceService {
    constructor(configService, userPreferenceService, collaborativeFilteringService, preferenceDecayService) {
        this.configService = configService;
        this.userPreferenceService = userPreferenceService;
        this.collaborativeFilteringService = collaborativeFilteringService;
        this.preferenceDecayService = preferenceDecayService;
        this.logger = new common_1.Logger(SearchRelevanceService_1.name);
        this.scoringProfiles = new Map();
        this.activeABTests = [];
        this.userPreferencesCache = new Map();
        this.initializeScoringProfiles();
        this.loadActiveABTests();
    }
    initializeScoringProfiles() {
        this.scoringProfiles.set('standard', {
            name: 'standard',
            boostFactors: {
                name: 3.0,
                description: 1.0,
                categories: 2.0,
                brand: 1.5,
                tags: 1.2,
            },
            functions: [],
            scoreMode: 'multiply',
            boostMode: 'multiply',
        });
        this.scoringProfiles.set('popularity', {
            name: 'popularity',
            boostFactors: {
                name: 2.0,
                description: 0.8,
                categories: 1.5,
                brand: 1.2,
            },
            functions: [
                {
                    type: 'field_value_factor',
                    field: 'viewCount',
                    factor: 0.1,
                    modifier: 'log1p',
                    weight: 1.0,
                },
                {
                    type: 'field_value_factor',
                    field: 'rating',
                    factor: 1.0,
                    modifier: 'sqrt',
                    weight: 2.0,
                },
            ],
            scoreMode: 'sum',
            boostMode: 'multiply',
        });
        this.scoringProfiles.set('recency', {
            name: 'recency',
            boostFactors: {
                name: 2.0,
                description: 1.0,
                categories: 1.5,
            },
            functions: [
                {
                    type: 'decay',
                    field: 'createdAt',
                    params: {
                        scale: '30d',
                        offset: '1d',
                        decay: 0.5,
                    },
                    weight: 2.0,
                },
            ],
            scoreMode: 'multiply',
            boostMode: 'multiply',
        });
        this.scoringProfiles.set('preference', {
            name: 'preference',
            boostFactors: {
                name: 2.0,
                description: 0.8,
            },
            functions: [],
            scoreMode: 'sum',
            boostMode: 'multiply',
        });
        this.scoringProfiles.set('intent', {
            name: 'intent',
            boostFactors: {
                name: 2.0,
                description: 0.8,
            },
            functions: [],
            scoreMode: 'sum',
            boostMode: 'multiply',
        });
        this.scoringProfiles.set('hybrid', {
            name: 'hybrid',
            boostFactors: {
                name: 2.0,
                description: 0.8,
                categories: 1.5,
                brand: 1.2,
            },
            functions: [
                {
                    type: 'field_value_factor',
                    field: 'rating',
                    factor: 0.5,
                    modifier: 'sqrt',
                    weight: 1.0,
                },
                {
                    type: 'decay',
                    field: 'createdAt',
                    params: {
                        scale: '60d',
                        offset: '1d',
                        decay: 0.5,
                    },
                    weight: 1.0,
                },
            ],
            scoreMode: 'sum',
            boostMode: 'multiply',
        });
        this.logger.log(`Initialized ${this.scoringProfiles.size} scoring profiles`);
    }
    loadActiveABTests() {
        const sampleTest = {
            id: 'search_relevance_test_1',
            name: 'Search Relevance Algorithm Comparison',
            description: 'Testing different search relevance algorithms',
            variants: [
                {
                    id: 'control',
                    algorithm: RelevanceAlgorithm.STANDARD,
                    weight: 33,
                },
                {
                    id: 'preference_based',
                    algorithm: RelevanceAlgorithm.USER_PREFERENCE,
                    weight: 33,
                },
                {
                    id: 'hybrid',
                    algorithm: RelevanceAlgorithm.HYBRID,
                    weight: 34,
                },
            ],
            startDate: new Date(),
            isActive: true,
            analyticsEventName: 'search_relevance_test',
        };
        this.activeABTests.push(sampleTest);
        this.logger.log(`Loaded ${this.activeABTests.length} active A/B tests`);
    }
    async getUserPreferences(userId, sessionId) {
        try {
            if (!sessionId && this.userPreferencesCache.has(userId)) {
                return this.userPreferencesCache.get(userId);
            }
            const preferences = await this.userPreferenceService.getUserPreferences(userId);
            if (preferences && !sessionId) {
                this.userPreferencesCache.set(userId, preferences);
            }
            return preferences;
        }
        catch (error) {
            this.logger.error(`Error getting user preferences: ${error.message}`);
            return null;
        }
    }
    shouldApplyDecay(preferences) {
        if (!preferences.lastUpdated) {
            return true;
        }
        const now = Date.now();
        const lastUpdate = preferences.lastUpdated;
        const decayIntervalMs = this.configService.get('PREFERENCE_DECAY_INTERVAL_HOURS', 24) * 60 * 60 * 1000;
        return now - lastUpdate > decayIntervalMs;
    }
    applyScoringProfile(query, profileName, user, intent, entities) {
        const profile = this.scoringProfiles.get(profileName);
        if (!profile) {
            this.logger.warn(`Scoring profile ${profileName} not found, using standard`);
            return query;
        }
        const scoredQuery = {
            function_score: {
                query: query,
                functions: [],
                score_mode: profile.scoreMode,
                boost_mode: profile.boostMode,
            },
        };
        const functionScoreQuery = scoredQuery.function_score;
        for (const [field, boost] of Object.entries(profile.boostFactors)) {
            functionScoreQuery.functions.push({
                filter: {
                    exists: { field },
                },
                weight: boost,
            });
        }
        for (const func of profile.functions) {
            functionScoreQuery.functions.push(func);
        }
        if (user && profileName === 'preference') {
            this.applyUserPreferenceBoosts(functionScoreQuery, user);
        }
        if (intent && profileName === 'intent') {
            this.applyIntentBasedBoosts(functionScoreQuery, intent, entities);
        }
        scoredQuery.function_score.query = query;
        return scoredQuery;
    }
    async applyUserPreferenceBoosts(query, user) {
        try {
            let preferences = await this.getUserPreferences(user.id);
            if (!preferences) {
                this.logger.log(`No preferences found for user ${user.id}`);
                return;
            }
            if (this.shouldApplyDecay(preferences)) {
                this.logger.log(`Applying preference decay for user ${user.id}`);
                const decayApplied = await this.preferenceDecayService.applyDecayToUser(user.id);
                if (decayApplied) {
                    preferences = await this.userPreferenceService.getUserPreferences(user.id);
                }
            }
            const functions = query.functions;
            const topCategories = this.getTopItems(preferences.categories, 5);
            const topBrands = this.getTopItems(preferences.brands, 5);
            if (topCategories.length > 0) {
                this.logger.log(`Applying category boosting for user ${user.id}`);
                topCategories.forEach(([category, weight], index) => {
                    const positionBoost = 1 + (topCategories.length - index) / topCategories.length;
                    functions.push({
                        filter: {
                            match: {
                                categories: category,
                            },
                        },
                        weight: Number(weight) * 2.0 * positionBoost,
                    });
                    this.addRelatedCategoryBoosts(functions, category, Number(weight));
                });
            }
            if (topBrands.length > 0) {
                this.logger.log(`Applying brand boosting for user ${user.id}`);
                topBrands.forEach(([brand, weight], index) => {
                    const positionBoost = 1 + (topBrands.length - index) / topBrands.length;
                    functions.push({
                        filter: {
                            match: {
                                brand: brand,
                            },
                        },
                        weight: Number(weight) * 1.5 * positionBoost,
                    });
                });
            }
            if (preferences.priceRanges && preferences.priceRanges.length > 0) {
                preferences.priceRanges.forEach(range => {
                    functions.push({
                        filter: {
                            range: {
                                price: {
                                    gte: range.min,
                                    lte: range.max,
                                },
                            },
                        },
                        weight: range.weight * 1.2,
                    });
                });
            }
            this.logger.log(`Applied enhanced user preference boosts for user ${user.id}`);
        }
        catch (error) {
            this.logger.error(`Error applying user preference boosts: ${error.message}`);
        }
    }
    addRelatedCategoryBoosts(functions, category, weight) {
        try {
            const relatedCategories = this.collaborativeFilteringService.getRelatedCategories(category);
            if (relatedCategories && relatedCategories.length > 0) {
                relatedCategories.forEach(relatedCategory => {
                    functions.push({
                        filter: {
                            match: {
                                categories: relatedCategory.category,
                            },
                        },
                        weight: weight * 0.5 * relatedCategory.similarity,
                    });
                });
            }
        }
        catch (error) {
            this.logger.error(`Error adding related category boosts: ${error.message}`);
        }
    }
    getTopItems(preferenceMap, count) {
        if (!preferenceMap)
            return [];
        return Object.entries(preferenceMap)
            .filter(([_, weight]) => Number(weight) > 0)
            .sort(([_, weightA], [__, weightB]) => Number(weightB) - Number(weightA))
            .slice(0, count);
    }
    applyIntentBasedBoosts(query, intent, entities) {
        const functions = query.functions;
        switch (intent) {
            case 'product_search':
                break;
            case 'category_browse':
                functions.push({
                    filter: { exists: { field: 'categories' } },
                    weight: 3.0,
                });
                break;
            case 'brand_specific':
                functions.push({
                    filter: { exists: { field: 'brand' } },
                    weight: 3.0,
                });
                break;
            case 'value_driven':
                functions.push({
                    filter: { exists: { field: 'values' } },
                    weight: 3.0,
                });
                break;
            case 'comparison':
                break;
            case 'recommendation':
                functions.push({
                    field_value_factor: {
                        field: 'rating',
                        factor: 2.0,
                        modifier: 'sqrt',
                        missing: 1,
                    },
                });
                functions.push({
                    field_value_factor: {
                        field: 'reviewCount',
                        factor: 0.1,
                        modifier: 'log1p',
                        missing: 1,
                    },
                });
                break;
            case 'sort':
                break;
        }
        if (entities) {
            for (const entity of entities) {
                if (entity.confidence < 0.5)
                    continue;
                switch (entity.type) {
                    case 'category':
                        functions.push({
                            filter: {
                                match: {
                                    categories: entity.value,
                                },
                            },
                            weight: entity.confidence * 2.0,
                        });
                        break;
                    case 'brand':
                        functions.push({
                            filter: {
                                match: {
                                    brand: entity.value,
                                },
                            },
                            weight: entity.confidence * 2.0,
                        });
                        break;
                    case 'value':
                        functions.push({
                            filter: {
                                match: {
                                    values: entity.value,
                                },
                            },
                            weight: entity.confidence * 1.5,
                        });
                        break;
                    case 'color':
                        functions.push({
                            filter: {
                                match: {
                                    'attributes.color': entity.value,
                                },
                            },
                            weight: entity.confidence * 1.5,
                        });
                        break;
                    case 'material':
                        functions.push({
                            filter: {
                                match: {
                                    'attributes.material': entity.value,
                                },
                            },
                            weight: entity.confidence * 1.3,
                        });
                        break;
                }
            }
        }
    }
    selectABTestVariant(testId, userId) {
        const test = this.activeABTests.find(t => t.id === testId && t.isActive);
        if (!test)
            return null;
        const hash = this.hashString(`${userId}-${testId}`);
        const normalizedHash = hash % 100;
        let cumulativeWeight = 0;
        for (const variant of test.variants) {
            cumulativeWeight += variant.weight;
            if (normalizedHash < cumulativeWeight) {
                return {
                    testId: test.id,
                    variantId: variant.id,
                    algorithm: variant.algorithm,
                    params: variant.params,
                    analyticsEventName: test.analyticsEventName,
                };
            }
        }
        return {
            testId: test.id,
            variantId: test.variants[0].id,
            algorithm: test.variants[0].algorithm,
            params: test.variants[0].params,
            analyticsEventName: test.analyticsEventName,
        };
    }
    generateAnalyticsData(testInfo, searchQuery, resultCount) {
        return {
            event: testInfo.analyticsEventName,
            event_category: 'search',
            event_label: searchQuery,
            ab_test_id: testInfo.testId,
            variant_id: testInfo.variantId,
            result_count: resultCount,
            timestamp: new Date().toISOString(),
        };
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    getScoringProfiles() {
        return Array.from(this.scoringProfiles.keys());
    }
    getActiveABTests() {
        return this.activeABTests.filter(test => test.isActive);
    }
};
exports.SearchRelevanceService = SearchRelevanceService;
exports.SearchRelevanceService = SearchRelevanceService = SearchRelevanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        user_preference_service_1.UserPreferenceService,
        collaborative_filtering_service_1.CollaborativeFilteringService,
        preference_decay_service_1.PreferenceDecayService])
], SearchRelevanceService);
//# sourceMappingURL=search-relevance.service.js.map