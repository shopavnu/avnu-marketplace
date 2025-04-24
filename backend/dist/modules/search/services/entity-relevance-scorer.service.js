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
var EntityRelevanceScorerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityRelevanceScorerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const search_entity_type_enum_1 = require("../enums/search-entity-type.enum");
let EntityRelevanceScorerService = EntityRelevanceScorerService_1 = class EntityRelevanceScorerService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EntityRelevanceScorerService_1.name);
        this.defaultProductBoost = this.configService.get('SEARCH_DEFAULT_PRODUCT_BOOST', 1.0);
        this.defaultMerchantBoost = this.configService.get('SEARCH_DEFAULT_MERCHANT_BOOST', 0.8);
        this.defaultBrandBoost = this.configService.get('SEARCH_DEFAULT_BRAND_BOOST', 0.8);
        this.userHistoryBoostFactor = this.configService.get('SEARCH_USER_HISTORY_BOOST_FACTOR', 1.2);
        this.userPreferencesBoostFactor = this.configService.get('SEARCH_USER_PREFERENCES_BOOST_FACTOR', 1.5);
    }
    applyEntityBoosting(results, entityType, entityBoosting) {
        if (entityType !== search_entity_type_enum_1.SearchEntityType.ALL) {
            return results;
        }
        const productBoost = entityBoosting?.productBoost ?? this.defaultProductBoost;
        const merchantBoost = entityBoosting?.merchantBoost ?? this.defaultMerchantBoost;
        const brandBoost = entityBoosting?.brandBoost ?? this.defaultBrandBoost;
        if (results.hits && results.hits.hits) {
            results.hits.hits.forEach(hit => {
                const index = hit._index;
                let boostFactor = 1.0;
                if (index === 'products') {
                    boostFactor = productBoost;
                }
                else if (index === 'merchants') {
                    boostFactor = merchantBoost;
                }
                else if (index === 'brands') {
                    boostFactor = brandBoost;
                }
                hit._score = hit._score * boostFactor;
            });
            results.hits.hits.sort((a, b) => b._score - a._score);
        }
        return results;
    }
    calculateUserEntityBoosts() {
        const boosts = {
            productBoost: 1.0,
            merchantBoost: 1.0,
            brandBoost: 1.0,
        };
        return boosts;
    }
    enhanceQueryWithEntityBoosting(baseQuery, entityType, entityBoosting) {
        if (entityType !== search_entity_type_enum_1.SearchEntityType.ALL) {
            return baseQuery;
        }
        const productBoost = entityBoosting?.productBoost ?? this.defaultProductBoost;
        const merchantBoost = entityBoosting?.merchantBoost ?? this.defaultMerchantBoost;
        const brandBoost = entityBoosting?.brandBoost ?? this.defaultBrandBoost;
        return {
            function_score: {
                query: baseQuery,
                functions: [
                    {
                        filter: { term: { _index: 'products' } },
                        weight: productBoost,
                    },
                    {
                        filter: { term: { _index: 'merchants' } },
                        weight: merchantBoost,
                    },
                    {
                        filter: { term: { _index: 'brands' } },
                        weight: brandBoost,
                    },
                ],
                score_mode: 'multiply',
                boost_mode: 'multiply',
            },
        };
    }
    normalizeScores(results) {
        if (!results.hits || !results.hits.hits || results.hits.hits.length === 0) {
            return results;
        }
        const hitsByType = {
            products: [],
            merchants: [],
            brands: [],
        };
        const maxScoreByType = {
            products: 0,
            merchants: 0,
            brands: 0,
        };
        results.hits.hits.forEach(hit => {
            const index = hit._index;
            if (index === 'products') {
                hitsByType.products.push(hit);
                maxScoreByType.products = Math.max(maxScoreByType.products, hit._score);
            }
            else if (index === 'merchants') {
                hitsByType.merchants.push(hit);
                maxScoreByType.merchants = Math.max(maxScoreByType.merchants, hit._score);
            }
            else if (index === 'brands') {
                hitsByType.brands.push(hit);
                maxScoreByType.brands = Math.max(maxScoreByType.brands, hit._score);
            }
        });
        Object.keys(hitsByType).forEach(type => {
            const hits = hitsByType[type];
            const maxScore = maxScoreByType[type];
            if (maxScore > 0) {
                hits.forEach(hit => {
                    hit._normalized_score = hit._score / maxScore;
                });
            }
        });
        const normalizedHits = [
            ...hitsByType.products,
            ...hitsByType.merchants,
            ...hitsByType.brands,
        ].sort((a, b) => (b._normalized_score || 0) - (a._normalized_score || 0));
        results.hits.hits = normalizedHits;
        return results;
    }
    calculateEntityRelevance(entityType, query, source) {
        if (!query || !source) {
            return 0.5;
        }
        const queryTerms = query.toLowerCase().split(/\s+/);
        let relevanceScore = 0;
        switch (entityType) {
            case search_entity_type_enum_1.SearchEntityType.PRODUCT:
                relevanceScore = this.calculateProductRelevance(queryTerms, source);
                break;
            case search_entity_type_enum_1.SearchEntityType.MERCHANT:
                relevanceScore = this.calculateMerchantRelevance(queryTerms, source);
                break;
            case search_entity_type_enum_1.SearchEntityType.BRAND:
                relevanceScore = this.calculateBrandRelevance(queryTerms, source);
                break;
            default:
                relevanceScore = 0.5;
        }
        return Math.min(1, Math.max(0, relevanceScore));
    }
    calculateProductRelevance(queryTerms, product) {
        let score = 0;
        const maxScore = 10;
        const title = (product.title || '').toLowerCase();
        queryTerms.forEach(term => {
            if (title.includes(term)) {
                score += 2;
            }
        });
        const description = (product.description || '').toLowerCase();
        queryTerms.forEach(term => {
            if (description.includes(term)) {
                score += 1;
            }
        });
        const categories = product.categories || [];
        categories.forEach(category => {
            const categoryName = category.toLowerCase();
            queryTerms.forEach(term => {
                if (categoryName.includes(term)) {
                    score += 1.5;
                }
            });
        });
        const tags = product.tags || [];
        tags.forEach(tag => {
            const tagName = tag.toLowerCase();
            queryTerms.forEach(term => {
                if (tagName.includes(term)) {
                    score += 1;
                }
            });
        });
        const brandName = (product.brandName || '').toLowerCase();
        queryTerms.forEach(term => {
            if (brandName.includes(term)) {
                score += 1;
            }
        });
        return Math.min(1, score / maxScore);
    }
    calculateMerchantRelevance(queryTerms, merchant) {
        let score = 0;
        const maxScore = 10;
        const name = (merchant.name || '').toLowerCase();
        queryTerms.forEach(term => {
            if (name.includes(term)) {
                score += 3;
            }
        });
        const description = (merchant.description || '').toLowerCase();
        queryTerms.forEach(term => {
            if (description.includes(term)) {
                score += 1;
            }
        });
        const categories = merchant.categories || [];
        categories.forEach(category => {
            const categoryName = category.toLowerCase();
            queryTerms.forEach(term => {
                if (categoryName.includes(term)) {
                    score += 1.5;
                }
            });
        });
        const values = merchant.values || [];
        values.forEach(value => {
            const valueName = value.toLowerCase();
            queryTerms.forEach(term => {
                if (valueName.includes(term)) {
                    score += 1.5;
                }
            });
        });
        const location = (merchant.location || '').toLowerCase();
        queryTerms.forEach(term => {
            if (location.includes(term)) {
                score += 1;
            }
        });
        return Math.min(1, score / maxScore);
    }
    calculateBrandRelevance(queryTerms, brand) {
        let score = 0;
        const maxScore = 10;
        const name = (brand.name || '').toLowerCase();
        queryTerms.forEach(term => {
            if (name.includes(term)) {
                score += 3;
            }
        });
        const description = (brand.description || '').toLowerCase();
        queryTerms.forEach(term => {
            if (description.includes(term)) {
                score += 1;
            }
        });
        const categories = brand.categories || [];
        categories.forEach(category => {
            const categoryName = category.toLowerCase();
            queryTerms.forEach(term => {
                if (categoryName.includes(term)) {
                    score += 1.5;
                }
            });
        });
        const values = brand.values || [];
        values.forEach(value => {
            const valueName = value.toLowerCase();
            queryTerms.forEach(term => {
                if (valueName.includes(term)) {
                    score += 1.5;
                }
            });
        });
        const location = (brand.location || '').toLowerCase();
        queryTerms.forEach(term => {
            if (location.includes(term)) {
                score += 1;
            }
        });
        const story = (brand.story || '').toLowerCase();
        queryTerms.forEach(term => {
            if (story.includes(term)) {
                score += 0.5;
            }
        });
        return Math.min(1, score / maxScore);
    }
};
exports.EntityRelevanceScorerService = EntityRelevanceScorerService;
exports.EntityRelevanceScorerService = EntityRelevanceScorerService = EntityRelevanceScorerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EntityRelevanceScorerService);
//# sourceMappingURL=entity-relevance-scorer.service.js.map