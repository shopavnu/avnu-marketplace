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
var IndicesConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndicesConfigService = void 0;
const common_1 = require("@nestjs/common");
const elasticsearch_1 = require("@nestjs/elasticsearch");
const config_1 = require("@nestjs/config");
const logger_service_1 = require("../../../common/services/logger.service");
let IndicesConfigService = IndicesConfigService_1 = class IndicesConfigService {
    constructor(elasticsearchService, configService, logger) {
        this.elasticsearchService = elasticsearchService;
        this.configService = configService;
        this.logger = logger;
        this.logger.setContext(IndicesConfigService_1.name);
    }
    async initIndices() {
        this.logger.log('Initializing Elasticsearch indices');
        await this.createProductIndex();
        await this.createMerchantIndex();
        await this.createBrandIndex();
        await this.createSuggestionsIndex();
        const seedSuggestions = this.configService.get('SEED_SUGGESTIONS_INDEX');
        if (seedSuggestions === 'true') {
            await this.seedSuggestionsIndex();
        }
        this.logger.log('Elasticsearch indices initialization completed');
    }
    async createProductIndex() {
        const indexName = 'products';
        try {
            const indexExists = await this.elasticsearchService.indices.exists({
                index: indexName,
            });
            if (indexExists) {
                this.logger.debug(`Index ${indexName} already exists`);
                return;
            }
            await this.elasticsearchService.indices.create({
                index: indexName,
                body: {
                    settings: {
                        number_of_shards: 3,
                        number_of_replicas: 1,
                        analysis: {
                            analyzer: {
                                product_analyzer: {
                                    type: 'custom',
                                    tokenizer: 'standard',
                                    filter: ['lowercase', 'asciifolding', 'synonym'],
                                },
                                product_index_analyzer: {
                                    type: 'custom',
                                    tokenizer: 'standard',
                                    filter: ['lowercase', 'asciifolding'],
                                },
                            },
                            filter: {
                                synonym: {
                                    type: 'synonym',
                                    synonyms_path: 'analysis/synonyms.txt',
                                    updateable: true,
                                },
                            },
                        },
                    },
                    mappings: {
                        properties: {
                            id: { type: 'keyword' },
                            name: {
                                type: 'text',
                                analyzer: 'product_index_analyzer',
                                search_analyzer: 'product_analyzer',
                                fields: {
                                    keyword: { type: 'keyword' },
                                    completion: { type: 'completion' },
                                },
                            },
                            description: {
                                type: 'text',
                                analyzer: 'product_index_analyzer',
                                search_analyzer: 'product_analyzer',
                            },
                            price: { type: 'float' },
                            salePrice: { type: 'float' },
                            currency: { type: 'keyword' },
                            categories: { type: 'keyword' },
                            tags: { type: 'keyword' },
                            values: { type: 'keyword' },
                            brand: {
                                type: 'text',
                                fields: {
                                    keyword: { type: 'keyword' },
                                },
                            },
                            merchant: {
                                type: 'text',
                                fields: {
                                    keyword: { type: 'keyword' },
                                },
                            },
                            images: { type: 'keyword' },
                            variants: {
                                type: 'nested',
                                properties: {
                                    id: { type: 'keyword' },
                                    name: { type: 'text' },
                                    price: { type: 'float' },
                                    salePrice: { type: 'float' },
                                    attributes: {
                                        type: 'nested',
                                        properties: {
                                            name: { type: 'keyword' },
                                            value: { type: 'keyword' },
                                        },
                                    },
                                },
                            },
                            attributes: {
                                type: 'nested',
                                properties: {
                                    name: { type: 'keyword' },
                                    value: { type: 'keyword' },
                                },
                            },
                            rating: { type: 'float' },
                            reviewCount: { type: 'integer' },
                            createdAt: { type: 'date' },
                            updatedAt: { type: 'date' },
                            isAvailable: { type: 'boolean' },
                            popularity: { type: 'float' },
                            vector_embedding: { type: 'dense_vector', dims: 384 },
                        },
                    },
                },
            });
            this.logger.log(`Index ${indexName} created successfully`);
        }
        catch (error) {
            this.logger.error(`Error creating index ${indexName}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async createMerchantIndex() {
        const indexName = 'merchants';
        try {
            const indexExists = await this.elasticsearchService.indices.exists({
                index: indexName,
            });
            if (indexExists) {
                this.logger.debug(`Index ${indexName} already exists`);
                return;
            }
            await this.elasticsearchService.indices.create({
                index: indexName,
                body: {
                    settings: {
                        number_of_shards: 2,
                        number_of_replicas: 1,
                        analysis: {
                            analyzer: {
                                merchant_analyzer: {
                                    type: 'custom',
                                    tokenizer: 'standard',
                                    filter: ['lowercase', 'asciifolding'],
                                },
                            },
                        },
                    },
                    mappings: {
                        properties: {
                            id: { type: 'keyword' },
                            name: {
                                type: 'text',
                                analyzer: 'merchant_analyzer',
                                fields: {
                                    keyword: { type: 'keyword' },
                                    completion: { type: 'completion' },
                                },
                            },
                            description: { type: 'text' },
                            logo: { type: 'keyword' },
                            website: { type: 'keyword' },
                            values: { type: 'keyword' },
                            categories: { type: 'keyword' },
                            location: { type: 'geo_point' },
                            rating: { type: 'float' },
                            reviewCount: { type: 'integer' },
                            productCount: { type: 'integer' },
                            createdAt: { type: 'date' },
                            updatedAt: { type: 'date' },
                            isActive: { type: 'boolean' },
                            popularity: { type: 'float' },
                            vector_embedding: { type: 'dense_vector', dims: 384 },
                        },
                    },
                },
            });
            this.logger.log(`Index ${indexName} created successfully`);
        }
        catch (error) {
            this.logger.error(`Error creating index ${indexName}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async seedSuggestionsIndex() {
        const indexName = 'search_suggestions';
        this.logger.log('Seeding search suggestions index with initial data');
        try {
            const commonSearchTerms = [
                { text: 'sustainable clothing', category: 'clothing', type: 'search', score: 10.0 },
                { text: 'eco-friendly products', category: 'home', type: 'search', score: 9.5 },
                { text: 'organic cotton', category: 'clothing', type: 'search', score: 9.0 },
                { text: 'vegan leather', category: 'accessories', type: 'search', score: 8.5 },
                { text: 'recycled materials', category: 'home', type: 'search', score: 8.0 },
                { text: 'fair trade coffee', category: 'food', type: 'search', score: 7.5 },
                { text: 'zero waste products', category: 'home', type: 'search', score: 7.0 },
                { text: 'biodegradable packaging', category: 'home', type: 'search', score: 6.5 },
                { text: 'solar powered', category: 'electronics', type: 'search', score: 6.0 },
                { text: 'ethical fashion', category: 'clothing', type: 'search', score: 5.5 },
                { text: 'reusable bags', category: 'home', type: 'search', score: 5.0 },
                { text: 'bamboo products', category: 'home', type: 'search', score: 4.5 },
                { text: 'natural skincare', category: 'beauty', type: 'search', score: 4.0 },
                { text: 'cruelty-free cosmetics', category: 'beauty', type: 'search', score: 3.5 },
                { text: 'local artisans', category: 'home', type: 'search', score: 3.0 },
            ];
            const operations = [];
            for (const term of commonSearchTerms) {
                operations.push({ index: { _index: indexName } });
                operations.push({
                    id: `search_${term.text.replace(/\s+/g, '_')}`,
                    text: term.text,
                    type: term.type,
                    category: term.category,
                    score: term.score,
                    popularity: term.score,
                    isPersonalized: false,
                    metadata: { source: 'seed' },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            }
            if (operations.length > 0) {
                const response = await this.elasticsearchService.bulk({
                    refresh: true,
                    body: operations,
                });
                if (response.errors) {
                    this.logger.error(`Errors occurred during suggestions seeding: ${JSON.stringify(response.items)}`);
                }
                else {
                    this.logger.log(`Successfully seeded ${commonSearchTerms.length} suggestions`);
                }
            }
        }
        catch (error) {
            this.logger.error(`Error seeding suggestions index: ${error.message}`, error.stack);
        }
    }
    async createSuggestionsIndex() {
        const indexName = 'search_suggestions';
        try {
            const indexExists = await this.elasticsearchService.indices.exists({
                index: indexName,
            });
            if (indexExists) {
                this.logger.debug(`Index ${indexName} already exists`);
                return;
            }
            await this.elasticsearchService.indices.create({
                index: indexName,
                body: {
                    settings: {
                        number_of_shards: 1,
                        number_of_replicas: 1,
                        'index.max_ngram_diff': 18,
                        analysis: {
                            analyzer: {
                                suggestion_analyzer: {
                                    type: 'custom',
                                    tokenizer: 'standard',
                                    filter: ['lowercase', 'asciifolding'],
                                },
                                ngram_analyzer: {
                                    type: 'custom',
                                    tokenizer: 'standard',
                                    filter: ['lowercase', 'asciifolding', 'ngram_filter'],
                                },
                            },
                            filter: {
                                ngram_filter: {
                                    type: 'ngram',
                                    min_gram: 2,
                                    max_gram: 20,
                                },
                            },
                        },
                    },
                    mappings: {
                        properties: {
                            id: { type: 'keyword' },
                            text: {
                                type: 'text',
                                analyzer: 'suggestion_analyzer',
                                fields: {
                                    ngram: {
                                        type: 'text',
                                        analyzer: 'ngram_analyzer',
                                    },
                                    keyword: { type: 'keyword' },
                                    completion: {
                                        type: 'completion',
                                        contexts: [
                                            {
                                                name: 'category',
                                                type: 'category',
                                            },
                                        ],
                                    },
                                },
                            },
                            type: { type: 'keyword' },
                            category: { type: 'keyword' },
                            score: { type: 'float' },
                            popularity: { type: 'float' },
                            isPersonalized: { type: 'boolean' },
                            metadata: { type: 'object' },
                            createdAt: { type: 'date' },
                            updatedAt: { type: 'date' },
                        },
                    },
                },
            });
            this.logger.log(`Index ${indexName} created successfully`);
        }
        catch (error) {
            this.logger.error(`Error creating index ${indexName}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async createBrandIndex() {
        const indexName = 'brands';
        try {
            const indexExists = await this.elasticsearchService.indices.exists({
                index: indexName,
            });
            if (indexExists) {
                this.logger.debug(`Index ${indexName} already exists`);
                return;
            }
            await this.elasticsearchService.indices.create({
                index: indexName,
                body: {
                    settings: {
                        number_of_shards: 2,
                        number_of_replicas: 1,
                        analysis: {
                            analyzer: {
                                brand_analyzer: {
                                    type: 'custom',
                                    tokenizer: 'standard',
                                    filter: ['lowercase', 'asciifolding'],
                                },
                            },
                        },
                    },
                    mappings: {
                        properties: {
                            id: { type: 'keyword' },
                            name: {
                                type: 'text',
                                analyzer: 'brand_analyzer',
                                fields: {
                                    keyword: { type: 'keyword' },
                                    completion: { type: 'completion' },
                                },
                            },
                            description: { type: 'text' },
                            logo: { type: 'keyword' },
                            website: { type: 'keyword' },
                            values: { type: 'keyword' },
                            categories: { type: 'keyword' },
                            foundedYear: { type: 'integer' },
                            origin: { type: 'keyword' },
                            rating: { type: 'float' },
                            reviewCount: { type: 'integer' },
                            productCount: { type: 'integer' },
                            createdAt: { type: 'date' },
                            updatedAt: { type: 'date' },
                            isActive: { type: 'boolean' },
                            popularity: { type: 'float' },
                            vector_embedding: { type: 'dense_vector', dims: 384 },
                        },
                    },
                },
            });
            this.logger.log(`Index ${indexName} created successfully`);
        }
        catch (error) {
            this.logger.error(`Error creating index ${indexName}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.IndicesConfigService = IndicesConfigService;
exports.IndicesConfigService = IndicesConfigService = IndicesConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [elasticsearch_1.ElasticsearchService,
        config_1.ConfigService,
        logger_service_1.LoggerService])
], IndicesConfigService);
//# sourceMappingURL=indices.config.js.map