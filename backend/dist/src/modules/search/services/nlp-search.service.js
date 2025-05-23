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
var NlpSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NlpSearchService = void 0;
const common_1 = require("@nestjs/common");
const elasticsearch_1 = require("@nestjs/elasticsearch");
const config_1 = require("@nestjs/config");
const search_cache_service_1 = require("./search-cache.service");
const search_experiment_service_1 = require("./search-experiment.service");
const search_monitoring_service_1 = require("./search-monitoring.service");
const nlp_service_1 = require("../../nlp/services/nlp.service");
const search_entity_type_enum_1 = require("../enums/search-entity-type.enum");
const personalization_service_1 = require("../../personalization/services/personalization.service");
const experiment_assignment_service_1 = require("../../ab-testing/services/experiment-assignment.service");
const common_2 = require("@nestjs/common");
let NlpSearchService = NlpSearchService_1 = class NlpSearchService {
    constructor(elasticsearchService, configService, nlpService, searchCacheService, searchMonitoringService, personalizationService, experimentAssignmentService, searchExperimentService) {
        this.elasticsearchService = elasticsearchService;
        this.configService = configService;
        this.nlpService = nlpService;
        this.searchCacheService = searchCacheService;
        this.searchMonitoringService = searchMonitoringService;
        this.personalizationService = personalizationService;
        this.experimentAssignmentService = experimentAssignmentService;
        this.searchExperimentService = searchExperimentService;
        this.logger = new common_2.Logger(NlpSearchService_1.name);
        this.enableSynonyms = this.configService.get('SEARCH_ENABLE_SYNONYMS', true);
        this.enableSemanticSearch = this.configService.get('SEARCH_ENABLE_SEMANTIC', true);
        this.enableQueryExpansion = this.configService.get('SEARCH_ENABLE_QUERY_EXPANSION', true);
        this.enableEntityRecognition = this.configService.get('SEARCH_ENABLE_ENTITY_RECOGNITION', true);
    }
    getDefaultHighlightFields(entityType) {
        switch (entityType) {
            case search_entity_type_enum_1.SearchEntityType.PRODUCT:
                return ['title', 'description', 'brandName', 'merchantName', 'categories', 'tags'];
            case search_entity_type_enum_1.SearchEntityType.MERCHANT:
                return ['name', 'description', 'categories', 'values', 'location'];
            case search_entity_type_enum_1.SearchEntityType.BRAND:
                return ['name', 'description', 'categories', 'values', 'location', 'story'];
            default:
                return ['title', 'name', 'description'];
        }
    }
    processHighlights(hit) {
        if (!hit.highlight) {
            return undefined;
        }
        const fields = [];
        const allTerms = new Set();
        for (const [field, snippets] of Object.entries(hit.highlight)) {
            if (Array.isArray(snippets) && snippets.length > 0) {
                fields.push({
                    field,
                    snippets: snippets,
                });
                snippets.forEach((snippet) => {
                    const matches = snippet.match(/<em>([^<]+)<\/em>/g);
                    if (matches) {
                        matches.forEach(match => {
                            const term = match.replace(/<\/?em>/g, '');
                            allTerms.add(term.toLowerCase());
                        });
                    }
                });
            }
        }
        if (fields.length === 0) {
            return undefined;
        }
        return {
            fields,
            matchedTerms: Array.from(allTerms),
        };
    }
    async searchAsync(options, user, sessionId) {
        const startTime = Date.now();
        this.logger.log(`Starting searchAsync with query: "${options.query}"`, 'NlpSearchService');
        const { query, page = 0, limit = 20, entityType = search_entity_type_enum_1.SearchEntityType.PRODUCT, filters, sort, enableNlp = false, } = options;
        const nlpResult = enableNlp
            ? await this.processQuery(query, user, sessionId)
            : { processedQuery: query, entities: {}, intent: 'search', expandedTerms: [] };
        const esQuery = await this.buildElasticsearchQuery(nlpResult.processedQuery, { page, limit, filters, sort, entityType }, entityType, user, sessionId);
        let searchResults;
        try {
            searchResults = await this.elasticsearchService.search({
                index: this.getIndexForEntityType(entityType),
                body: esQuery,
            });
        }
        catch (error) {
            this.logger.error(`Elasticsearch error: ${error.message}`, error.stack, 'NlpSearchService');
            throw new common_1.HttpException('Search failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        let responseData = {
            highlightsEnabled: options.enableHighlighting || false,
        };
        switch (entityType) {
            case search_entity_type_enum_1.SearchEntityType.PRODUCT:
                const { products, pagination: prodPagination, facets: prodFacets, } = this.transformProductSearchResults(searchResults, page, limit, options.enableHighlighting);
                responseData = {
                    ...responseData,
                    products,
                    pagination: prodPagination,
                    facets: prodFacets,
                };
                break;
            case search_entity_type_enum_1.SearchEntityType.MERCHANT:
                const { merchants, pagination: merchPagination, facets: merchFacets, } = this.transformMerchantSearchResults(searchResults, page, limit, options.enableHighlighting);
                responseData = {
                    ...responseData,
                    merchants,
                    pagination: merchPagination,
                    facets: merchFacets,
                };
                break;
            case search_entity_type_enum_1.SearchEntityType.BRAND:
                const { brands, pagination: brandPagination, facets: brandFacets, } = this.transformBrandSearchResults(searchResults, page, limit, options.enableHighlighting);
                responseData = {
                    ...responseData,
                    brands,
                    pagination: brandPagination,
                    facets: brandFacets,
                };
                break;
            default:
                this.logger.warn(`Unsupported entity type for searchAsync: ${entityType}`, 'NlpSearchService');
                const { products: defProducts, pagination: defPagination, facets: defFacets, } = this.transformProductSearchResults(searchResults, page, limit);
                responseData = { products: defProducts, pagination: defPagination, facets: defFacets };
        }
        const duration = Date.now() - startTime;
        const finalResponse = {
            query: query,
            processedQuery: nlpResult.processedQuery,
            pagination: responseData.pagination,
            facets: responseData.facets,
            products: responseData.products,
            merchants: responseData.merchants,
            brands: responseData.brands,
            usedNlp: enableNlp,
        };
        this.logger.log(`Finished searchAsync for query: "${options.query}" in ${duration}ms`, 'NlpSearchService');
        return finalResponse;
    }
    async processQuery(query, _user, _sessionId) {
        this.logger.debug(`Placeholder processQuery called for: "${query}"`, 'NlpSearchService');
        return {
            processedQuery: query,
            entities: {},
            intent: 'search',
            expandedTerms: [],
        };
    }
    async buildElasticsearchQuery(query, options, entityType, user, sessionId) {
        this.logger.debug(`Building Elasticsearch query for: "${query}" with${sessionId ? ' session-based' : ''} personalization`, 'NlpSearchService');
        const queryConditions = query ? [{ match: { name: query } }] : [];
        const filterConditions = [];
        const sortOptions = options.sort ? [options.sort] : [{ _score: 'desc' }];
        let personalizedParams = {};
        if (user?.id) {
            try {
                personalizedParams = await this.personalizationService.generatePersonalizedSearchParams(user.id, query, sessionId);
                this.logger.debug(`Applied ${sessionId ? 'session-based' : 'standard'} personalization for user ${user.id}`, 'NlpSearchService');
            }
            catch (error) {
                this.logger.error(`Failed to apply personalization: ${error.message}`, 'NlpSearchService');
            }
        }
        let mainQuery = {
            bool: {
                must: queryConditions,
                filter: filterConditions,
            },
        };
        if (personalizedParams && Object.keys(personalizedParams).length > 0) {
            const personalizedParamsTyped = personalizedParams;
            const sessionData = personalizedParamsTyped.session;
            const hasSessionWeights = sessionData && sessionData.weights && Object.keys(sessionData.weights).length > 0;
            if (hasSessionWeights) {
                this.logger.debug(`Applying session-based boosting for session ${sessionId}`, 'NlpSearchService');
                mainQuery = {
                    function_score: {
                        query: mainQuery,
                        functions: [],
                        score_mode: 'sum',
                        boost_mode: 'sum',
                    },
                };
                const entityWeights = sessionData.weights.entities || {};
                const entityIds = Object.keys(entityWeights);
                if (entityIds.length > 0) {
                    entityIds.forEach(entityId => {
                        const weight = entityWeights[entityId] * (sessionData.weightFactors?.entities || 1.0);
                        if (weight > 0) {
                            mainQuery.function_score.functions.push({
                                filter: { term: { id: entityId } },
                                weight: weight,
                            });
                        }
                    });
                }
                const categoryWeights = sessionData.weights.categories || {};
                const categories = Object.keys(categoryWeights);
                if (categories.length > 0) {
                    categories.forEach(category => {
                        const weight = categoryWeights[category] * (sessionData.weightFactors?.categories || 0.8);
                        if (weight > 0) {
                            mainQuery.function_score.functions.push({
                                filter: { term: { categories: category } },
                                weight: weight,
                            });
                        }
                    });
                }
                const brandWeights = sessionData.weights.brands || {};
                const brands = Object.keys(brandWeights);
                if (brands.length > 0 && entityType !== search_entity_type_enum_1.SearchEntityType.BRAND) {
                    brands.forEach(brand => {
                        const weight = brandWeights[brand] * (sessionData.weightFactors?.brands || 0.8);
                        if (weight > 0) {
                            mainQuery.function_score.functions.push({
                                filter: { term: { brandName: brand } },
                                weight: weight,
                            });
                        }
                    });
                }
            }
        }
        const esQuery = {
            query: mainQuery,
            sort: sortOptions,
            aggs: this.buildAggregations(entityType),
        };
        if (options.enableHighlighting) {
            const highlightFields = options.highlightFields || this.getDefaultHighlightFields(entityType);
            const preTag = options.highlightPreTag || '<em>';
            const postTag = options.highlightPostTag || '</em>';
            const fragmentSize = options.highlightFragmentSize || 150;
            esQuery.highlight = {
                pre_tags: [preTag],
                post_tags: [postTag],
                fields: {},
                fragment_size: fragmentSize,
                number_of_fragments: 3,
                require_field_match: false,
            };
            highlightFields.forEach(field => {
                esQuery.highlight.fields[field] = {};
            });
        }
        esQuery.size = options.limit ?? 20;
        esQuery.from = (options.page ?? 0) * (options.limit ?? 20);
        return esQuery;
    }
    buildAggregations(entityType) {
        this.logger.debug(`Placeholder buildAggregations called for type: ${entityType}`, 'NlpSearchService');
        return {
            categories: { terms: { field: 'categories', size: 20 } },
            values: { terms: { field: 'values', size: 20 } },
        };
    }
    getIndexForEntityType(entityType) {
        switch (entityType) {
            case search_entity_type_enum_1.SearchEntityType.PRODUCT:
                return this.configService.get('ELASTICSEARCH_PRODUCT_INDEX', 'products');
            case search_entity_type_enum_1.SearchEntityType.MERCHANT:
                return this.configService.get('ELASTICSEARCH_MERCHANT_INDEX', 'merchants');
            case search_entity_type_enum_1.SearchEntityType.BRAND:
                return this.configService.get('ELASTICSEARCH_BRAND_INDEX', 'brands');
            default:
                this.logger.warn(`Unknown entity type for index: ${entityType}`, 'NlpSearchService');
                return this.configService.get('ELASTICSEARCH_PRODUCT_INDEX', 'products');
        }
    }
    async searchProducts(query, options = {}, _user) {
        const startTime = Date.now();
        const { page = 0, limit = 20, filters, sort } = options;
        this.logger.log(`Starting searchProducts with query: "${query}"`, 'NlpSearchService');
        const esQuery = await this.buildElasticsearchQuery(query, { page, limit, filters, sort, entityType: search_entity_type_enum_1.SearchEntityType.PRODUCT }, search_entity_type_enum_1.SearchEntityType.PRODUCT, _user);
        let results;
        try {
            results = await this.elasticsearchService.search({
                index: this.getIndexForEntityType(search_entity_type_enum_1.SearchEntityType.PRODUCT),
                body: esQuery,
            });
        }
        catch (error) {
            this.logger.error(`Elasticsearch error in searchProducts: ${error.message}`, error.stack, 'NlpSearchService');
            throw new common_1.HttpException('Product search failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const { products, pagination, facets } = this.transformProductSearchResults(results, page, limit);
        const duration = Date.now() - startTime;
        this.logger.log(`Finished searchProducts for query: "${query}" in ${duration}ms`, 'NlpSearchService');
        return { products, pagination, facets };
    }
    async searchMerchants(query, options = {}, _user) {
        const startTime = Date.now();
        const { page = 0, limit = 20, filters, sort } = options;
        this.logger.log(`Starting searchMerchants with query: "${query}"`, 'NlpSearchService');
        const esQuery = await this.buildElasticsearchQuery(query, { page, limit, filters, sort, entityType: search_entity_type_enum_1.SearchEntityType.MERCHANT }, search_entity_type_enum_1.SearchEntityType.MERCHANT, _user);
        let results;
        try {
            results = await this.elasticsearchService.search({
                index: this.getIndexForEntityType(search_entity_type_enum_1.SearchEntityType.MERCHANT),
                body: esQuery,
            });
        }
        catch (error) {
            this.logger.error(`Elasticsearch error in searchMerchants: ${error.message}`, error.stack, 'NlpSearchService');
            throw new common_1.HttpException('Merchant search failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const { merchants, pagination, facets } = this.transformMerchantSearchResults(results, page, limit);
        const duration = Date.now() - startTime;
        this.logger.log(`Finished searchMerchants for query: "${query}" in ${duration}ms`, 'NlpSearchService');
        return { merchants, pagination, facets };
    }
    async searchBrands(query, options = {}, _user) {
        const startTime = Date.now();
        const { page = 0, limit = 20, filters, sort } = options;
        this.logger.log(`Starting searchBrands with query: "${query}"`, 'NlpSearchService');
        const esQuery = await this.buildElasticsearchQuery(query, { page, limit, filters, sort, entityType: search_entity_type_enum_1.SearchEntityType.BRAND }, search_entity_type_enum_1.SearchEntityType.BRAND, _user);
        let results;
        try {
            results = await this.elasticsearchService.search({
                index: this.getIndexForEntityType(search_entity_type_enum_1.SearchEntityType.BRAND),
                body: esQuery,
            });
        }
        catch (error) {
            this.logger.error(`Elasticsearch error in searchBrands: ${error.message}`, error.stack, 'NlpSearchService');
            throw new common_1.HttpException('Brand search failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const { brands, pagination, facets } = this.transformBrandSearchResults(results, page, limit);
        const duration = Date.now() - startTime;
        this.logger.log(`Finished searchBrands for query: "${query}" in ${duration}ms`, 'NlpSearchService');
        return { brands, pagination, facets };
    }
    transformFacets(aggregations) {
        this.logger.warn('Facet transformation not fully implemented yet.', 'NlpSearchService');
        const categories = aggregations?.categories?.buckets?.map((bucket) => ({
            name: bucket.key,
            count: bucket.doc_count,
        })) ?? [];
        const values = aggregations?.values?.buckets?.map((bucket) => ({
            name: bucket.key,
            count: bucket.doc_count,
        })) ?? [];
        const price = undefined;
        return {
            categories,
            values,
            price,
        };
    }
    transformMerchantSearchResults(results, page, limit, enableHighlighting = false) {
        if (!results || !results.hits) {
            const defaultPagination = {
                total: 0,
                page: page,
                limit: limit,
                totalPages: 0,
                pages: 0,
                hasNext: false,
                hasPrevious: false,
            };
            const defaultFacets = { categories: [], values: [], price: undefined };
            return { merchants: [], pagination: defaultPagination, facets: defaultFacets };
        }
        const total = results.hits.total?.value ?? 0;
        const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
        const pagination = {
            total: total,
            page: page,
            limit: limit,
            totalPages: totalPages,
            pages: totalPages,
            hasNext: page < totalPages - 1,
            hasPrevious: page > 0,
        };
        const merchants = results.hits.hits?.map((hit) => {
            const source = hit._source;
            const highlights = enableHighlighting ? this.processHighlights(hit) : undefined;
            return {
                id: hit._id,
                name: source?.name ?? '',
                description: source?.description ?? '',
                logo: source?.logo ?? '',
                heroImage: source?.heroImage ?? '',
                location: source?.location ?? '',
                categories: source?.categories ?? [],
                values: source?.values ?? [],
                rating: source?.rating ?? 0,
                reviewCount: source?.reviewCount ?? 0,
                isSponsored: source?.isSponsored ?? false,
                score: hit._score ?? 0,
                highlights: highlights,
            };
        }) ?? [];
        const facets = this.transformFacets(results.aggregations);
        return {
            merchants,
            pagination,
            facets,
        };
    }
    transformBrandSearchResults(results, page, limit, enableHighlighting = false) {
        if (!results || !results.hits) {
            const defaultPagination = {
                total: 0,
                page: page,
                limit: limit,
                totalPages: 0,
                pages: 0,
                hasNext: false,
                hasPrevious: false,
            };
            const defaultFacets = { categories: [], values: [], price: undefined };
            return { brands: [], pagination: defaultPagination, facets: defaultFacets };
        }
        const total = results.hits.total?.value ?? 0;
        const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
        const pagination = {
            total: total,
            page: page,
            limit: limit,
            totalPages: totalPages,
            pages: totalPages,
            hasNext: page < totalPages - 1,
            hasPrevious: page > 0,
        };
        const brands = results.hits.hits?.map((hit) => {
            const source = hit._source;
            const highlights = enableHighlighting ? this.processHighlights(hit) : undefined;
            return {
                id: hit._id,
                name: source?.name ?? '',
                description: source?.description ?? '',
                logo: source?.logo ?? '',
                heroImage: source?.heroImage ?? '',
                location: source?.location ?? '',
                categories: source?.categories ?? [],
                values: source?.values ?? [],
                foundedYear: source?.foundedYear ?? undefined,
                isSponsored: source?.isSponsored ?? false,
                score: hit._score ?? 0,
                highlights: highlights,
            };
        }) ?? [];
        const facets = this.transformFacets(results.aggregations);
        return {
            brands,
            pagination,
            facets,
        };
    }
    transformProductSearchResults(results, page, limit, enableHighlighting = false) {
        this.logger.debug(`Transforming product search results for page ${page}, limit ${limit}`, 'NlpSearchService');
        if (!results || !results.hits) {
            this.logger.warn('Invalid or empty Elasticsearch results received for products.', 'NlpSearchService');
            const defaultPagination = {
                total: 0,
                page: page,
                limit: limit,
                totalPages: 0,
                pages: 0,
                hasNext: false,
                hasPrevious: false,
            };
            const defaultFacets = { categories: [], values: [], price: undefined };
            return { products: [], pagination: defaultPagination, facets: defaultFacets };
        }
        const total = results.hits.total?.value ?? 0;
        const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
        const pagination = {
            total: total,
            page: page,
            limit: limit,
            totalPages: totalPages,
            pages: totalPages,
            hasNext: page < totalPages - 1,
            hasPrevious: page > 0,
        };
        const products = results.hits.hits?.map((hit) => {
            const source = hit._source;
            const highlights = enableHighlighting ? this.processHighlights(hit) : undefined;
            return {
                id: hit._id,
                title: source?.title ?? 'N/A',
                description: source?.description ?? '',
                price: source?.price ?? 0,
                currency: source?.currency ?? 'USD',
                images: source?.images ?? [],
                merchantId: source?.merchantId ?? '',
                merchantName: source?.merchantName ?? '',
                brandId: source?.brandId ?? '',
                brandName: source?.brandName ?? '',
                categories: source?.categories ?? [],
                values: source?.values ?? [],
                rating: source?.rating ?? 0,
                reviewCount: source?.reviewCount ?? 0,
                isSponsored: source?.isSponsored ?? false,
                score: hit._score ?? 0,
                highlights: highlights,
            };
        }) ?? [];
        const facets = this.transformFacets(results.aggregations);
        this.logger.debug(`Transformed ${products.length} products, total: ${total}`, 'NlpSearchService');
        return { products, pagination, facets };
    }
};
exports.NlpSearchService = NlpSearchService;
exports.NlpSearchService = NlpSearchService = NlpSearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [elasticsearch_1.ElasticsearchService,
        config_1.ConfigService,
        nlp_service_1.NlpService,
        search_cache_service_1.SearchCacheService,
        search_monitoring_service_1.SearchMonitoringService,
        personalization_service_1.PersonalizationService,
        experiment_assignment_service_1.ExperimentAssignmentService,
        search_experiment_service_1.SearchExperimentService])
], NlpSearchService);
//# sourceMappingURL=nlp-search.service.js.map