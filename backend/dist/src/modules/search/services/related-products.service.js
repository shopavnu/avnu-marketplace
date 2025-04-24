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
var RelatedProductsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelatedProductsService = void 0;
const common_1 = require("@nestjs/common");
const elasticsearch_service_1 = require("./elasticsearch.service");
const personalization_service_1 = require("../../personalization/services/personalization.service");
let RelatedProductsService = RelatedProductsService_1 = class RelatedProductsService {
    constructor(elasticsearchService, personalizationService) {
        this.elasticsearchService = elasticsearchService;
        this.personalizationService = personalizationService;
        this.logger = new common_1.Logger(RelatedProductsService_1.name);
    }
    async getRelatedProducts(productId, userId, options = {}) {
        try {
            const limit = options.limit || 10;
            const categoryWeight = options.categoryWeight || 2.0;
            const tagWeight = options.tagWeight || 1.5;
            const valueWeight = options.valueWeight || 2.5;
            const brandWeight = options.brandWeight || 1.0;
            const priceRangeWeight = options.priceRangeWeight || 0.5;
            const includeOutOfStock = options.includeOutOfStock || false;
            const productResponse = await this.elasticsearchService.client
                .get({
                index: 'products',
                id: productId,
            })
                .catch(() => null);
            if (!productResponse || !productResponse._source) {
                throw new Error(`Product with ID ${productId} not found`);
            }
            const product = productResponse._source;
            const should = [];
            const must = [];
            const mustNot = [];
            mustNot.push({
                term: {
                    id: productId,
                },
            });
            if (!includeOutOfStock) {
                must.push({
                    term: {
                        inStock: true,
                    },
                });
            }
            if (product.categories && product.categories.length > 0) {
                should.push({
                    terms: {
                        'categories.keyword': product.categories,
                        boost: categoryWeight,
                    },
                });
            }
            if (product.tags && product.tags.length > 0) {
                should.push({
                    terms: {
                        'tags.keyword': product.tags,
                        boost: tagWeight,
                    },
                });
            }
            if (product.values && product.values.length > 0) {
                should.push({
                    terms: {
                        'values.keyword': product.values,
                        boost: valueWeight,
                    },
                });
            }
            if (product.brandName) {
                should.push({
                    term: {
                        'brandName.keyword': {
                            value: product.brandName,
                            boost: brandWeight,
                        },
                    },
                });
            }
            if (product.price) {
                const minPrice = Math.max(0, product.price * 0.7);
                const maxPrice = product.price * 1.3;
                should.push({
                    range: {
                        price: {
                            gte: minPrice,
                            lte: maxPrice,
                            boost: priceRangeWeight,
                        },
                    },
                });
            }
            const searchResponse = await this.elasticsearchService.client.search({
                index: 'products',
                body: {
                    size: limit * 2,
                    query: {
                        bool: {
                            must,
                            must_not: mustNot,
                            should,
                            minimum_should_match: 1,
                        },
                    },
                },
            });
            const hits = searchResponse.hits.hits;
            let relatedProducts = hits.map(hit => ({
                ...hit._source,
                score: hit._score,
                matchedOn: this.determineMatchFactors(hit._source, product),
            }));
            if (userId) {
                relatedProducts = await this.applyPersonalization(relatedProducts, userId);
            }
            relatedProducts = this.ensureDiversity(relatedProducts);
            return {
                items: relatedProducts.slice(0, limit),
                total: relatedProducts.length,
                sourceProduct: {
                    id: product.id,
                    title: product.title,
                    categories: product.categories,
                    tags: product.tags,
                    values: product.values,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to get related products: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async getComplementaryProducts(productId, userId, limit = 5) {
        try {
            const productResponse = await this.elasticsearchService.client
                .get({
                index: 'products',
                id: productId,
            })
                .catch(() => null);
            if (!productResponse || !productResponse._source) {
                throw new Error(`Product with ID ${productId} not found`);
            }
            const product = productResponse._source;
            const complementaryCategories = this.getComplementaryCategories(product.categories || []);
            const should = [];
            const must = [];
            const mustNot = [];
            mustNot.push({
                term: {
                    id: productId,
                },
            });
            must.push({
                term: {
                    inStock: true,
                },
            });
            if (complementaryCategories.length > 0) {
                should.push({
                    terms: {
                        'categories.keyword': complementaryCategories,
                        boost: 3.0,
                    },
                });
            }
            if (product.values && product.values.length > 0) {
                should.push({
                    terms: {
                        'values.keyword': product.values,
                        boost: 2.0,
                    },
                });
            }
            const searchResponse = await this.elasticsearchService.client.search({
                index: 'products',
                body: {
                    size: limit * 2,
                    query: {
                        bool: {
                            must,
                            must_not: mustNot,
                            should,
                            minimum_should_match: 1,
                        },
                    },
                },
            });
            const hits = searchResponse.hits.hits;
            let complementaryProducts = hits.map(hit => ({
                ...hit._source,
                score: hit._score,
                matchedOn: ['complementary'],
            }));
            if (userId) {
                complementaryProducts = await this.applyPersonalization(complementaryProducts, userId);
            }
            return {
                items: complementaryProducts.slice(0, limit),
                total: complementaryProducts.length,
                sourceProduct: {
                    id: product.id,
                    title: product.title,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to get complementary products: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async getFrequentlyBoughtTogether(productId, limit = 3) {
        try {
            return this.getRelatedProducts(productId, undefined, {
                limit,
                categoryWeight: 3.0,
                brandWeight: 0.5,
            });
        }
        catch (error) {
            this.logger.error(`Failed to get frequently bought together products: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async applyPersonalization(products, userId) {
        try {
            const personalizedBoosts = await this.personalizationService.generatePersonalizedBoosts(userId);
            const boostedProducts = products.map(product => {
                let boostFactor = 1.0;
                if (product.categories && personalizedBoosts.categoryBoosts) {
                    for (const category of product.categories) {
                        if (personalizedBoosts.categoryBoosts[category]) {
                            boostFactor += personalizedBoosts.categoryBoosts[category];
                        }
                    }
                }
                if (product.brandName && personalizedBoosts.brandBoosts) {
                    if (personalizedBoosts.brandBoosts[product.brandName]) {
                        boostFactor += personalizedBoosts.brandBoosts[product.brandName];
                    }
                }
                if (product.values && personalizedBoosts.valueBoosts) {
                    for (const value of product.values) {
                        if (personalizedBoosts.valueBoosts[value]) {
                            boostFactor += personalizedBoosts.valueBoosts[value] * 1.5;
                        }
                    }
                }
                return {
                    ...product,
                    boostFactor,
                    finalScore: product.score * boostFactor,
                };
            });
            boostedProducts.sort((a, b) => b.finalScore - a.finalScore);
            return boostedProducts;
        }
        catch (error) {
            this.logger.error(`Failed to apply personalization: ${error instanceof Error ? error.message : String(error)}`);
            return products;
        }
    }
    determineMatchFactors(relatedProduct, sourceProduct) {
        const matchFactors = [];
        if (sourceProduct.categories && relatedProduct.categories) {
            const hasMatchingCategory = sourceProduct.categories.some(category => relatedProduct.categories.includes(category));
            if (hasMatchingCategory) {
                matchFactors.push('category');
            }
        }
        if (sourceProduct.tags && relatedProduct.tags) {
            const hasMatchingTag = sourceProduct.tags.some(tag => relatedProduct.tags.includes(tag));
            if (hasMatchingTag) {
                matchFactors.push('tag');
            }
        }
        if (sourceProduct.values && relatedProduct.values) {
            const hasMatchingValue = sourceProduct.values.some(value => relatedProduct.values.includes(value));
            if (hasMatchingValue) {
                matchFactors.push('value');
            }
        }
        if (sourceProduct.brandName === relatedProduct.brandName) {
            matchFactors.push('brand');
        }
        if (sourceProduct.price && relatedProduct.price) {
            const minPrice = sourceProduct.price * 0.7;
            const maxPrice = sourceProduct.price * 1.3;
            if (relatedProduct.price >= minPrice && relatedProduct.price <= maxPrice) {
                matchFactors.push('price');
            }
        }
        return matchFactors;
    }
    ensureDiversity(products) {
        const categorizedProducts = {
            category: [],
            tag: [],
            value: [],
            brand: [],
            price: [],
            other: [],
        };
        for (const product of products) {
            if (!product.matchedOn || product.matchedOn.length === 0) {
                categorizedProducts.other.push(product);
                continue;
            }
            const primaryFactor = product.matchedOn[0];
            if (primaryFactor === 'category') {
                categorizedProducts.category.push(product);
            }
            else if (primaryFactor === 'tag') {
                categorizedProducts.tag.push(product);
            }
            else if (primaryFactor === 'value') {
                categorizedProducts.value.push(product);
            }
            else if (primaryFactor === 'brand') {
                categorizedProducts.brand.push(product);
            }
            else if (primaryFactor === 'price') {
                categorizedProducts.price.push(product);
            }
            else {
                categorizedProducts.other.push(product);
            }
        }
        const diverseResults = [];
        diverseResults.push(...categorizedProducts.value.slice(0, 3));
        diverseResults.push(...categorizedProducts.category.slice(0, 3));
        diverseResults.push(...categorizedProducts.tag.slice(0, 2));
        diverseResults.push(...categorizedProducts.brand.slice(0, 1));
        const remainingProducts = products
            .filter(product => !diverseResults.some(p => p.id === product.id))
            .sort((a, b) => b.score - a.score);
        diverseResults.push(...remainingProducts);
        return diverseResults;
    }
    getComplementaryCategories(categories) {
        if (!categories || categories.length === 0) {
            return [];
        }
        const complementaryMap = {
            clothing: ['accessories', 'jewelry', 'shoes'],
            tops: ['bottoms', 'accessories', 'outerwear'],
            bottoms: ['tops', 'shoes', 'belts'],
            dresses: ['shoes', 'jewelry', 'bags'],
            shoes: ['socks', 'shoe-care', 'insoles'],
            skincare: ['makeup', 'tools', 'haircare'],
            makeup: ['skincare', 'tools', 'accessories'],
            furniture: ['decor', 'lighting', 'textiles'],
            kitchenware: ['tableware', 'food', 'drinkware'],
            jewelry: ['accessories', 'clothing', 'gift-boxes'],
        };
        const complementaryCategories = new Set();
        for (const category of categories) {
            const lowerCategory = category.toLowerCase();
            if (complementaryMap[lowerCategory]) {
                for (const complementary of complementaryMap[lowerCategory]) {
                    complementaryCategories.add(complementary);
                }
            }
        }
        return Array.from(complementaryCategories);
    }
};
exports.RelatedProductsService = RelatedProductsService;
exports.RelatedProductsService = RelatedProductsService = RelatedProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [elasticsearch_service_1.ElasticsearchService,
        personalization_service_1.PersonalizationService])
], RelatedProductsService);
//# sourceMappingURL=related-products.service.js.map