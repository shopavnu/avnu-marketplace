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
var MultiEntitySearchResolver_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiEntitySearchResolver = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const user_entity_1 = require("../../users/entities/user.entity");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const nlp_search_service_1 = require("../services/nlp-search.service");
const analytics_service_1 = require("../../analytics/services/analytics.service");
const entity_specific_filters_input_1 = require("../graphql/entity-specific-filters.input");
const search_response_type_1 = require("../graphql/search-response.type");
const search_entity_type_enum_1 = require("../enums/search-entity-type.enum");
const personalization_service_1 = require("../../personalization/services/personalization.service");
const user_behavior_entity_1 = require("../../personalization/entities/user-behavior.entity");
let MultiEntitySearchResolver = MultiEntitySearchResolver_1 = class MultiEntitySearchResolver {
    constructor(logger, nlpSearchService, analyticsService, personalizationService) {
        this.logger = logger;
        this.nlpSearchService = nlpSearchService;
        this.analyticsService = analyticsService;
        this.personalizationService = personalizationService;
    }
    transformFacets(searchFacets) {
        if (!searchFacets) {
            return [];
        }
        const facetMap = new Map();
        const categories = searchFacets.categories;
        const valueFacets = searchFacets.values;
        const priceFacet = searchFacets.price;
        if (categories?.length) {
            facetMap.set('category', {
                name: 'category',
                displayName: 'Category',
                values: categories.map((cat) => ({
                    value: cat.name,
                    count: cat.count,
                })),
            });
        }
        if (valueFacets?.length) {
            valueFacets.forEach(valueFacet => {
                let groupName = valueFacet.name;
                let valueName = valueFacet.name;
                const separatorIndex = valueFacet.name.indexOf(':');
                if (separatorIndex !== -1) {
                    groupName = valueFacet.name.substring(0, separatorIndex);
                    valueName = valueFacet.name.substring(separatorIndex + 1).trim();
                }
                const mapKey = groupName.toLowerCase().replace(/\s+/g, '_');
                if (!facetMap.has(mapKey)) {
                    facetMap.set(mapKey, {
                        name: mapKey,
                        displayName: groupName,
                        values: [],
                    });
                }
                facetMap.get(mapKey)?.values.push({
                    value: valueName,
                    count: valueFacet.count,
                });
            });
        }
        if (priceFacet) {
            facetMap.set('price', {
                name: 'price',
                displayName: 'Price',
                values: priceFacet.ranges.map((range) => ({
                    value: `$${range.min.toFixed(0)}-$${range.max.toFixed(0)}`,
                    count: range.count,
                })),
            });
        }
        return Array.from(facetMap.values());
    }
    async multiEntitySearch(input, user) {
        this.logger.log(`Received multi-entity search request: ${JSON.stringify(input)}`, MultiEntitySearchResolver_1.name);
        const startTime = Date.now();
        let searchResponseForLogging = null;
        try {
            const filters = [];
            const rangeFilters = [];
            if (input.productFilters) {
                const pf = input.productFilters;
                if (pf.categories?.length) {
                    filters.push({
                        field: 'category',
                        values: pf.categories,
                        exact: true,
                    });
                }
                if (pf.tags?.length) {
                    filters.push({
                        field: 'tags',
                        values: pf.tags,
                        exact: false,
                    });
                }
                if (pf.values?.length) {
                    filters.push({
                        field: 'values',
                        values: pf.values,
                        exact: true,
                    });
                }
                if (pf.brandIds?.length) {
                    filters.push({
                        field: 'brandId',
                        values: pf.brandIds,
                        exact: true,
                    });
                }
                if (pf.merchantIds?.length) {
                    filters.push({
                        field: 'merchantId',
                        values: pf.merchantIds,
                        exact: true,
                    });
                }
                if (pf.colors?.length) {
                    filters.push({
                        field: 'color',
                        values: pf.colors,
                        exact: false,
                    });
                }
                if (pf.sizes?.length) {
                    filters.push({
                        field: 'size',
                        values: pf.sizes,
                        exact: true,
                    });
                }
                if (pf.materials?.length) {
                    filters.push({
                        field: 'material',
                        values: pf.materials,
                        exact: false,
                    });
                }
                if (pf.inStock !== undefined) {
                    filters.push({
                        field: 'inStock',
                        values: [pf.inStock.toString()],
                        exact: true,
                    });
                }
                if (pf.onSale !== undefined) {
                    filters.push({
                        field: 'onSale',
                        values: [pf.onSale.toString()],
                        exact: true,
                    });
                }
                if (pf.minPrice !== undefined || pf.maxPrice !== undefined) {
                    rangeFilters.push({
                        field: 'price',
                        min: pf.minPrice,
                        max: pf.maxPrice,
                    });
                }
                if (pf.minRating !== undefined) {
                    rangeFilters.push({
                        field: 'rating',
                        min: pf.minRating,
                        max: undefined,
                    });
                }
            }
            if (input.merchantFilters) {
                const mf = input.merchantFilters;
                if (mf.categories?.length) {
                    filters.push({
                        field: 'merchantCategory',
                        values: mf.categories,
                        exact: true,
                    });
                }
                if (mf.values?.length) {
                    filters.push({
                        field: 'merchantValues',
                        values: mf.values,
                        exact: true,
                    });
                }
                if (mf.locations?.length) {
                    filters.push({
                        field: 'merchantLocation',
                        values: mf.locations,
                        exact: false,
                    });
                }
                if (mf.verifiedOnly !== undefined) {
                    filters.push({
                        field: 'merchantVerified',
                        values: [mf.verifiedOnly.toString()],
                        exact: true,
                    });
                }
                if (mf.activeOnly !== undefined) {
                    filters.push({
                        field: 'merchantActive',
                        values: [mf.activeOnly.toString()],
                        exact: true,
                    });
                }
                if (mf.minProductCount !== undefined) {
                    rangeFilters.push({
                        field: 'merchantProductCount',
                        min: mf.minProductCount,
                        max: undefined,
                    });
                }
                if (mf.minRating !== undefined) {
                    rangeFilters.push({
                        field: 'merchantRating',
                        min: mf.minRating,
                        max: undefined,
                    });
                }
            }
            if (input.brandFilters) {
                const bf = input.brandFilters;
                if (bf.categories?.length) {
                    filters.push({
                        field: 'brandCategory',
                        values: bf.categories,
                        exact: true,
                    });
                }
                if (bf.values?.length) {
                    filters.push({
                        field: 'brandValues',
                        values: bf.values,
                        exact: true,
                    });
                }
                if (bf.locations?.length) {
                    filters.push({
                        field: 'brandLocation',
                        values: bf.locations,
                        exact: false,
                    });
                }
                if (bf.verifiedOnly !== undefined) {
                    filters.push({
                        field: 'brandVerified',
                        values: [bf.verifiedOnly.toString()],
                        exact: true,
                    });
                }
                if (bf.activeOnly !== undefined) {
                    filters.push({
                        field: 'brandActive',
                        values: [bf.activeOnly.toString()],
                        exact: true,
                    });
                }
                if (bf.minFoundedYear !== undefined || bf.maxFoundedYear !== undefined) {
                    rangeFilters.push({
                        field: 'brandFoundedYear',
                        min: bf.minFoundedYear,
                        max: bf.maxFoundedYear,
                    });
                }
                if (bf.minProductCount !== undefined) {
                    rangeFilters.push({
                        field: 'brandProductCount',
                        min: bf.minProductCount,
                        max: undefined,
                    });
                }
            }
            let sortOptions;
            if (input.sortOptions?.length) {
                sortOptions = input.sortOptions.map(option => ({
                    field: option.field,
                    order: option.order,
                }));
            }
            const searchOptions = {
                query: input.query,
                page: input.page,
                limit: input.limit,
                filters: filters.length > 0 ? filters : undefined,
                rangeFilters: rangeFilters.length > 0 ? rangeFilters : undefined,
                sort: sortOptions,
                entityType: search_entity_type_enum_1.SearchEntityType.ALL,
                enableNlp: true,
                personalized: input.personalized,
                boostByValues: input.boostByValues,
                includeSponsoredContent: input.includeSponsoredContent,
                experimentId: input.experimentId,
                enableHighlighting: input.enableHighlighting || false,
                highlightFields: input.highlightFields,
                highlightPreTag: input.highlightPreTag,
                highlightPostTag: input.highlightPostTag,
                highlightFragmentSize: input.highlightFragmentSize,
            };
            if (input.personalized && user) {
                try {
                    const personalizedFilters = await this.personalizationService.generatePersonalizedFilters(user.id);
                    const personalizedBoosts = await this.personalizationService.generatePersonalizedBoosts(user.id);
                    if (personalizedFilters && Object.keys(personalizedFilters).length > 0) {
                        const userFilters = [];
                        if (personalizedFilters.categories?.length) {
                            userFilters.push({
                                field: 'category',
                                values: personalizedFilters.categories,
                                exact: false,
                            });
                        }
                        if (personalizedFilters.brands?.length) {
                            userFilters.push({
                                field: 'brandId',
                                values: personalizedFilters.brands,
                                exact: true,
                            });
                        }
                        if (personalizedFilters.sizes?.length) {
                            userFilters.push({
                                field: 'size',
                                values: personalizedFilters.sizes,
                                exact: true,
                            });
                        }
                        if (personalizedFilters.colors?.length) {
                            userFilters.push({
                                field: 'color',
                                values: personalizedFilters.colors,
                                exact: false,
                            });
                        }
                        if (personalizedFilters.materials?.length) {
                            userFilters.push({
                                field: 'material',
                                values: personalizedFilters.materials,
                                exact: false,
                            });
                        }
                        const valueFilters = [];
                        if (personalizedFilters.sustainable)
                            valueFilters.push('sustainable');
                        if (personalizedFilters.ethical)
                            valueFilters.push('ethical');
                        if (personalizedFilters.local)
                            valueFilters.push('local');
                        if (valueFilters.length > 0) {
                            userFilters.push({
                                field: 'values',
                                values: valueFilters,
                                exact: true,
                            });
                        }
                        if (searchOptions.filters) {
                            searchOptions.filters = [...searchOptions.filters, ...userFilters];
                        }
                        else {
                            searchOptions.filters = userFilters;
                        }
                    }
                    if (personalizedBoosts) {
                        if (!searchOptions.metadata) {
                            searchOptions.metadata = {};
                        }
                        searchOptions.metadata.personalizedBoosts = personalizedBoosts;
                    }
                    this.logger.log(`Applied personalization for user ${user.id}`, MultiEntitySearchResolver_1.name);
                }
                catch (error) {
                    this.logger.error(`Failed to apply personalization: ${error.message}`, error.stack, MultiEntitySearchResolver_1.name);
                }
            }
            const nlpResponse = await this.nlpSearchService.searchAsync(searchOptions, user);
            this.logger.log(`Search completed in ${Date.now() - startTime}ms`, MultiEntitySearchResolver_1.name);
            const allResults = [
                ...(nlpResponse.products?.map((p) => ({
                    ...p,
                    __typename: 'ProductResultType',
                    relevanceScore: p.score,
                    inStock: true,
                })) ?? []),
                ...(nlpResponse.merchants?.map((m) => ({
                    ...m,
                    __typename: 'MerchantResultType',
                    relevanceScore: m.score,
                })) ?? []),
                ...(nlpResponse.brands?.map((b) => ({
                    ...b,
                    __typename: 'BrandResultType',
                    relevanceScore: b.score,
                })) ?? []),
            ];
            allResults.sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
            const transformedFacets = this.transformFacets(nlpResponse.facets);
            const finalResponse = {
                query: input.query,
                pagination: nlpResponse.pagination,
                results: allResults,
                facets: transformedFacets,
                relevanceScores: undefined,
                entityDistribution: undefined,
                isNlpEnabled: true,
                isPersonalized: searchOptions.personalized ?? false,
                experimentId: searchOptions.experimentId,
                appliedFilters: searchOptions.filters || searchOptions.rangeFilters
                    ? Object.keys({ ...searchOptions.filters, ...searchOptions.rangeFilters })
                    : undefined,
                highlightsEnabled: nlpResponse.highlightsEnabled || false,
            };
            searchResponseForLogging = finalResponse;
            const currentFilters = searchOptions.filters;
            const currentRangeFilters = searchOptions.rangeFilters;
            const currentSortOptions = searchOptions.sort;
            const filterUsage = {};
            if (currentFilters?.length) {
                currentFilters.forEach(filter => {
                    filterUsage[filter.field] = {
                        type: 'exact',
                        valueCount: filter.values.length,
                        values: filter.values,
                    };
                });
            }
            if (currentRangeFilters?.length) {
                currentRangeFilters.forEach(filter => {
                    filterUsage[filter.field] = {
                        type: 'range',
                        min: filter.min,
                        max: filter.max,
                    };
                });
            }
            const sortUsage = {};
            if (currentSortOptions?.length) {
                currentSortOptions.forEach((sort, index) => {
                    sortUsage[sort.field] = {
                        order: sort.order,
                        priority: index + 1,
                    };
                });
            }
            const productFilterCount = input.productFilters
                ? Object.keys(input.productFilters).filter(key => input.productFilters[key] !== undefined)
                    .length
                : 0;
            const merchantFilterCount = input.merchantFilters
                ? Object.keys(input.merchantFilters).filter(key => input.merchantFilters[key] !== undefined)
                    .length
                : 0;
            const brandFilterCount = input.brandFilters
                ? Object.keys(input.brandFilters).filter(key => input.brandFilters[key] !== undefined)
                    .length
                : 0;
            const entityDistribution = {
                products: nlpResponse.products?.length || 0,
                merchants: nlpResponse.merchants?.length || 0,
                brands: nlpResponse.brands?.length || 0,
            };
            const facetUsage = {};
            if (nlpResponse.facets) {
                if (nlpResponse.facets.categories?.length) {
                    facetUsage['categories'] = {
                        count: nlpResponse.facets.categories.length,
                        values: nlpResponse.facets.categories.map(c => ({ name: c.name, count: c.count })),
                    };
                }
                if (nlpResponse.facets.values?.length) {
                    facetUsage['values'] = {
                        count: nlpResponse.facets.values.length,
                        values: nlpResponse.facets.values.map(v => ({ name: v.name, count: v.count })),
                    };
                }
                if (nlpResponse.facets.price) {
                    facetUsage['price'] = {
                        min: nlpResponse.facets.price.min,
                        max: nlpResponse.facets.price.max,
                        rangeCount: nlpResponse.facets.price.ranges?.length || 0,
                    };
                }
            }
            this.analyticsService
                .trackSearch({
                query: input.query,
                userId: user?.id,
                sessionId: undefined,
                resultCount: nlpResponse.pagination.total,
                hasFilters: Object.keys(filterUsage).length > 0,
                filters: Object.keys(filterUsage).length > 0 ? JSON.stringify(filterUsage) : undefined,
                categoryContext: undefined,
                deviceType: undefined,
                platform: undefined,
                isNlpEnhanced: true,
                isPersonalized: finalResponse.isPersonalized,
                experimentId: finalResponse.experimentId,
                filterCount: Object.keys(filterUsage).length,
                highlightsEnabled: finalResponse.highlightsEnabled,
                metadata: {
                    responseTimeMs: Date.now() - startTime,
                    sortOptions: Object.keys(sortUsage).length > 0 ? sortUsage : undefined,
                    entityDistribution,
                    facetUsage,
                    entityFilterCounts: {
                        product: productFilterCount,
                        merchant: merchantFilterCount,
                        brand: brandFilterCount,
                    },
                    queryLength: input.query?.length || 0,
                    page: input.page,
                    limit: input.limit,
                    totalPages: nlpResponse.pagination.totalPages,
                    hasNext: nlpResponse.pagination.hasNext,
                    hasPrevious: nlpResponse.pagination.hasPrevious,
                },
            })
                .catch(error => {
                this.logger.error(`Failed to track search analytics: ${error.message}`, error.stack, MultiEntitySearchResolver_1.name);
            });
            if (user && input.query) {
                this.personalizationService
                    .trackInteractionAndUpdatePreferences(user.id, user_behavior_entity_1.BehaviorType.SEARCH, input.query, 'search', input.query)
                    .catch(error => {
                    this.logger.error(`Failed to track search behavior: ${error.message}`, error.stack, MultiEntitySearchResolver_1.name);
                });
            }
            return finalResponse;
        }
        catch (error) {
            this.logger.error(`Multi-entity search failed for query "${input.query}": ${error.message}`, error.stack, MultiEntitySearchResolver_1.name);
            throw error;
        }
        finally {
            const duration = Date.now() - startTime;
            this.logger.log(`Finished processing multi-entity search for query "${input.query}" in ${duration}ms. Results: ${searchResponseForLogging?.results?.length ?? 'N/A'}`, MultiEntitySearchResolver_1.name);
        }
    }
};
exports.MultiEntitySearchResolver = MultiEntitySearchResolver;
__decorate([
    (0, graphql_1.Query)(() => search_response_type_1.SearchResponseType, { name: 'multiEntitySearch' }),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entity_specific_filters_input_1.EnhancedSearchInput,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MultiEntitySearchResolver.prototype, "multiEntitySearch", null);
exports.MultiEntitySearchResolver = MultiEntitySearchResolver = MultiEntitySearchResolver_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, graphql_1.Resolver)(() => search_response_type_1.SearchResponseType),
    __metadata("design:paramtypes", [common_1.Logger,
        nlp_search_service_1.NlpSearchService,
        analytics_service_1.AnalyticsService,
        personalization_service_1.PersonalizationService])
], MultiEntitySearchResolver);
//# sourceMappingURL=multi-entity-search.resolver.js.map