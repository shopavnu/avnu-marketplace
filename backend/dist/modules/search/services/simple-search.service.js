'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var SimpleSearchService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.SimpleSearchService = void 0;
const common_1 = require('@nestjs/common');
const elasticsearch_service_1 = require('./elasticsearch.service');
const search_entity_type_enum_1 = require('../enums/search-entity-type.enum');
const search_relevance_service_1 = require('./search-relevance.service');
const user_preference_service_1 = require('./user-preference.service');
const ab_testing_service_1 = require('./ab-testing.service');
const google_analytics_service_1 = require('../../analytics/services/google-analytics.service');
let SimpleSearchService = (SimpleSearchService_1 = class SimpleSearchService {
  constructor(
    elasticsearchService,
    searchRelevanceService,
    userPreferenceService,
    abTestingService,
    googleAnalyticsService,
  ) {
    this.elasticsearchService = elasticsearchService;
    this.searchRelevanceService = searchRelevanceService;
    this.userPreferenceService = userPreferenceService;
    this.abTestingService = abTestingService;
    this.googleAnalyticsService = googleAnalyticsService;
    this.logger = new common_1.Logger(SimpleSearchService_1.name);
  }
  async applyCategoryAndBrandBoosting(query, preferences, boostStrength = 1.0) {
    try {
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
      const topCategories = this.getTopItems(preferences.categories, 5);
      const topBrands = this.getTopItems(preferences.brands, 5);
      if (topCategories.length > 0) {
        this.logger.log(`Applying progressive category boosting`);
        topCategories.forEach(([category, weight], index) => {
          const positionBoost = 1 + (topCategories.length - index) / topCategories.length;
          functions.push({
            filter: {
              match: {
                categories: category,
              },
            },
            weight: Number(weight) * 2.0 * positionBoost * boostStrength,
          });
        });
      }
      if (topBrands.length > 0) {
        this.logger.log(`Applying progressive brand boosting`);
        topBrands.forEach(([brand, weight], index) => {
          const positionBoost = 1 + (topBrands.length - index) / topBrands.length;
          functions.push({
            filter: {
              match: {
                brand: brand,
              },
            },
            weight: Number(weight) * 1.8 * positionBoost * boostStrength,
          });
        });
      }
      return enhancedQuery;
    } catch (error) {
      this.logger.error(`Error applying category and brand boosting: ${error.message}`);
      return query;
    }
  }
  getTopItems(preferenceMap, count) {
    if (!preferenceMap) return [];
    return Object.entries(preferenceMap)
      .filter(([_, weight]) => Number(weight) > 0)
      .sort(([_, weightA], [__, weightB]) => Number(weightB) - Number(weightA))
      .slice(0, count);
  }
  extractCategoriesFromResults(results) {
    if (!results || !Array.isArray(results)) return [];
    const categories = new Set();
    results.forEach(result => {
      if (result.categories && Array.isArray(result.categories)) {
        result.categories.forEach(category => categories.add(category));
      }
    });
    return Array.from(categories);
  }
  extractBrandsFromResults(results) {
    if (!results || !Array.isArray(results)) return [];
    const brands = new Set();
    results.forEach(result => {
      if (result.brand) {
        brands.add(result.brand);
      }
    });
    return Array.from(brands);
  }
  async searchAsync(options, user) {
    const startTime = Date.now();
    this.logger.log(`Starting searchAsync with query: "${options.query}"`);
    const clientId = options.clientId || this.googleAnalyticsService.generateClientId();
    let testInfo;
    let relevanceAlgorithm = search_relevance_service_1.RelevanceAlgorithm.STANDARD;
    let scoringProfile = 'standard';
    if (options.enableABTesting && user) {
      testInfo = this.abTestingService.assignUserToVariant(
        'search-relevance-test-001',
        user.id,
        clientId,
      );
      if (testInfo) {
        relevanceAlgorithm = testInfo.algorithm;
        this.logger.log(
          `Using A/B test variant: ${testInfo.variantId} with algorithm: ${relevanceAlgorithm}`,
        );
        switch (relevanceAlgorithm) {
          case search_relevance_service_1.RelevanceAlgorithm.INTENT_BOOSTED:
            scoringProfile = 'intent';
            break;
          case search_relevance_service_1.RelevanceAlgorithm.USER_PREFERENCE:
            scoringProfile = 'preference';
            break;
          case search_relevance_service_1.RelevanceAlgorithm.HYBRID:
            scoringProfile = 'hybrid';
            break;
          default:
            scoringProfile = 'standard';
        }
      }
    }
    const {
      query,
      page = 0,
      limit = 20,
      entityType = search_entity_type_enum_1.SearchEntityType.PRODUCT,
      filters,
      sort,
    } = options;
    const _searchQuery = this.buildSimpleSearchQuery(query, filters, sort ? sort[0] : undefined);
    try {
      let _results;
      let responseData = {};
      switch (entityType) {
        case search_entity_type_enum_1.SearchEntityType.PRODUCT:
          const _productFilters = this.convertFilters(filters, options.rangeFilters);
          let searchQuery = this.buildFacetedSearchQuery(
            query,
            search_entity_type_enum_1.SearchEntityType.PRODUCT,
            filters,
            options.rangeFilters,
            sort && sort.length > 0 ? sort[0] : undefined,
          );
          if (options.enablePersonalization && user) {
            this.logger.log(`Applying personalization for user: ${user.id}`);
            const userPreferences = await this.userPreferenceService.getUserPreferences(user.id);
            if (userPreferences) {
              const personalizationStrength = options.personalizationStrength || 1.0;
              searchQuery = await this.applyCategoryAndBrandBoosting(
                searchQuery,
                userPreferences,
                personalizationStrength,
              );
              searchQuery = this.userPreferenceService.applyPreferencesToQuery(
                searchQuery,
                userPreferences,
                personalizationStrength,
              );
              this.logger.log(`Applied personalization with strength: ${personalizationStrength}`);
            } else {
              this.logger.log(`No preferences found for user: ${user.id}`);
            }
          }
          if (options.enableNlp && options.nlpData) {
            searchQuery = this.searchRelevanceService.applyScoringProfile(
              searchQuery,
              'intent',
              user,
              options.nlpData.intent,
              options.nlpData.entities,
            );
          } else if (options.enableABTesting && testInfo) {
            searchQuery = this.searchRelevanceService.applyScoringProfile(
              searchQuery,
              scoringProfile,
              user,
            );
          } else if (options.enablePersonalization && user) {
            const userPreferences = await this.userPreferenceService.getUserPreferences(user.id);
            if (userPreferences) {
              searchQuery = this.userPreferenceService.applyPreferencesToQuery(
                searchQuery,
                userPreferences,
                options.personalizationStrength || 1.0,
              );
            }
          }
          const searchResponse = await this.elasticsearchService.performSearch(
            'products',
            searchQuery,
          );
          const hits = searchResponse.hits.hits;
          const total = searchResponse.hits.total.value;
          const products = hits.map(hit => {
            const source = hit._source;
            const highlight = hit.highlight || {};
            const hasHighlights = Object.keys(highlight).length > 0;
            const highlightFields = Object.entries(highlight).map(([field, snippets]) => ({
              field,
              snippets: Array.isArray(snippets) ? snippets : [snippets],
            }));
            return {
              id: source.id,
              title: source.title,
              description: source.description,
              price: source.price,
              brandName: source.brandName,
              categories: source.categories,
              merchantId: source.merchantId,
              inStock: source.inStock,
              score: hit._score || 0,
              highlights: hasHighlights
                ? {
                    fields: highlightFields,
                    matchedTerms: query.split(' '),
                  }
                : undefined,
            };
          });
          const facets = this.generateFacetsFromAggregations(searchResponse.aggregations);
          if (options.enableAnalytics) {
            await this.trackSearchInAnalytics(
              clientId,
              query,
              products.length,
              total,
              testInfo,
              user?.id,
            );
            if (user && options.enablePersonalization) {
              try {
                await this.userPreferenceService.recordInteraction({
                  userId: user.id,
                  type: user_preference_service_1.UserInteractionType.SEARCH,
                  timestamp: Date.now(),
                  data: {
                    query,
                    filters: options.filters,
                    resultCount: total,
                    categories: this.extractCategoriesFromResults(products),
                    brands: this.extractBrandsFromResults(products),
                  },
                });
                this.logger.log(`Recorded search interaction for user: ${user.id}`);
              } catch (error) {
                this.logger.error(`Failed to record search interaction: ${error.message}`);
              }
            }
          }
          responseData = {
            products,
            pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
              pages: Math.ceil(total / limit),
              hasNext: page < Math.ceil(total / limit) - 1,
              hasPrevious: page > 0,
            },
            facets,
          };
          break;
        case search_entity_type_enum_1.SearchEntityType.MERCHANT:
          const merchantSearchQuery = this.buildFacetedSearchQuery(
            query,
            search_entity_type_enum_1.SearchEntityType.MERCHANT,
            filters,
            options.rangeFilters,
            sort && sort.length > 0 ? sort[0] : undefined,
          );
          const merchantSearchResponse = await this.elasticsearchService.performSearch(
            'merchants',
            merchantSearchQuery,
          );
          const merchantHits = merchantSearchResponse.hits.hits;
          const merchantTotal = merchantSearchResponse.hits.total.value;
          const merchants = merchantHits.map(hit => {
            const source = hit._source;
            const highlight = hit.highlight || {};
            const hasHighlights = Object.keys(highlight).length > 0;
            const highlightFields = Object.entries(highlight).map(([field, snippets]) => ({
              field,
              snippets: Array.isArray(snippets) ? snippets : [snippets],
            }));
            return {
              id: source.id,
              name: source.name,
              description: source.description,
              logo: source.logo,
              categories: source.categories,
              score: hit._score || 0,
              highlights: hasHighlights
                ? {
                    fields: highlightFields,
                    matchedTerms: query.split(' '),
                  }
                : undefined,
            };
          });
          const merchantFacets = this.generateFacetsFromAggregations(
            merchantSearchResponse.aggregations,
          );
          responseData = {
            merchants,
            pagination: {
              total: merchantTotal,
              page,
              limit,
              totalPages: Math.ceil(merchantTotal / limit),
              pages: Math.ceil(merchantTotal / limit),
              hasNext: page < Math.ceil(merchantTotal / limit) - 1,
              hasPrevious: page > 0,
            },
            facets: merchantFacets,
          };
          break;
        case search_entity_type_enum_1.SearchEntityType.BRAND:
          const brandSearchQuery = this.buildFacetedSearchQuery(
            query,
            search_entity_type_enum_1.SearchEntityType.BRAND,
            filters,
            options.rangeFilters,
            sort && sort.length > 0 ? sort[0] : undefined,
          );
          const brandSearchResponse = await this.elasticsearchService.performSearch(
            'brands',
            brandSearchQuery,
          );
          const brandHits = brandSearchResponse.hits.hits;
          const brandTotal = brandSearchResponse.hits.total.value;
          const brands = brandHits.map(hit => {
            const source = hit._source;
            const highlight = hit.highlight || {};
            const hasHighlights = Object.keys(highlight).length > 0;
            const highlightFields = Object.entries(highlight).map(([field, snippets]) => ({
              field,
              snippets: Array.isArray(snippets) ? snippets : [snippets],
            }));
            return {
              id: source.id,
              name: source.name,
              description: source.description,
              logo: source.logo,
              score: hit._score || 0,
              highlights: hasHighlights
                ? {
                    fields: highlightFields,
                    matchedTerms: query.split(' '),
                  }
                : undefined,
            };
          });
          const brandFacets = this.generateFacetsFromAggregations(brandSearchResponse.aggregations);
          responseData = {
            brands,
            pagination: {
              total: brandTotal,
              page,
              limit,
              totalPages: Math.ceil(brandTotal / limit),
              pages: Math.ceil(brandTotal / limit),
              hasNext: page < Math.ceil(brandTotal / limit) - 1,
              hasPrevious: page > 0,
            },
            facets: brandFacets,
          };
          break;
        default:
          throw new common_1.HttpException(
            `Unsupported entity type: ${entityType}`,
            common_1.HttpStatus.BAD_REQUEST,
          );
      }
      responseData.query = query;
      const endTime = Date.now();
      const searchDuration = endTime - startTime;
      this.logger.log(`Search completed in ${searchDuration}ms`);
      if (responseData) {
        responseData.metadata = {
          searchDuration,
          algorithm: relevanceAlgorithm,
          ...(testInfo ? { testId: testInfo.testId, variantId: testInfo.variantId } : {}),
        };
      }
      return responseData;
    } catch (error) {
      this.logger.error(`Search error: ${error.message}`, error.stack);
      this.logger.error(
        `Search parameters: ${JSON.stringify({ query, entityType, filters, options: options.rangeFilters })}`,
      );
      throw new common_1.HttpException(
        `Search failed: ${error.message}`,
        common_1.HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  buildSimpleSearchQuery(query, filters, sort, rangeFilters) {
    const filterClauses = [];
    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        if (filter.values && filter.values.length > 0) {
          if (filter.exact) {
            filterClauses.push({
              terms: {
                [`${filter.field}.keyword`]: filter.values,
              },
            });
          } else {
            const shouldClauses = filter.values.map(value => ({
              match: {
                [filter.field]: {
                  query: value,
                  fuzziness: 'AUTO',
                },
              },
            }));
            filterClauses.push({
              bool: {
                should: shouldClauses,
                minimum_should_match: 1,
              },
            });
          }
        }
      });
    }
    if (rangeFilters && rangeFilters.length > 0) {
      rangeFilters.forEach(rangeFilter => {
        const rangeQuery = {};
        if (rangeFilter.min !== undefined) {
          rangeQuery.gte = rangeFilter.min;
        }
        if (rangeFilter.max !== undefined) {
          rangeQuery.lte = rangeFilter.max;
        }
        if (Object.keys(rangeQuery).length > 0) {
          filterClauses.push({
            range: {
              [rangeFilter.field]: rangeQuery,
            },
          });
        }
      });
    }
    if (!query || query.trim() === '') {
      return {
        query: {
          bool: {
            must: { match_all: {} },
            ...(filterClauses.length > 0 && { filter: filterClauses }),
          },
        },
        aggs: this.buildProductAggregations(),
        ...(sort && { sort: { [sort.field]: { order: sort.order } } }),
      };
    }
    return {
      query: {
        bool: {
          should: [
            {
              match_phrase: {
                title: {
                  query,
                  boost: 10,
                },
              },
            },
            {
              match_phrase: {
                brandName: {
                  query,
                  boost: 5,
                },
              },
            },
            {
              match: {
                title: {
                  query,
                  boost: 4,
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              match: {
                description: {
                  query,
                  boost: 2,
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              match: {
                categories: {
                  query,
                  boost: 2,
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              match: {
                brandName: {
                  query,
                  boost: 3,
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              match: {
                tags: {
                  query,
                  boost: 1,
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              multi_match: {
                query,
                fields: ['title^3', 'description^2', 'brandName^2', 'categories', 'tags'],
                type: 'best_fields',
                fuzziness: 'AUTO',
                tie_breaker: 0.3,
              },
            },
          ],
          minimum_should_match: 1,
        },
      },
      highlight: {
        fields: {
          title: { number_of_fragments: 1, fragment_size: 150 },
          description: { number_of_fragments: 1, fragment_size: 150 },
          brandName: { number_of_fragments: 1 },
          categories: { number_of_fragments: 1 },
        },
        pre_tags: ['<em>'],
        post_tags: ['</em>'],
      },
      aggs: this.buildProductAggregations(),
      ...(sort && { sort: { [sort.field]: { order: sort.order } } }),
    };
  }
  createEmptyFacets() {
    return {
      categories: [],
      values: [],
      price: {
        min: 0,
        max: 1000,
        ranges: [],
      },
    };
  }
  getAggregationsForEntityType(entityType, filters, rangeFilters) {
    const filteredFields = new Set();
    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        if (filter.values && filter.values.length > 0) {
          filteredFields.add(filter.field);
        }
      });
    }
    if (rangeFilters && rangeFilters.length > 0) {
      rangeFilters.forEach(rangeFilter => {
        filteredFields.add(rangeFilter.field);
      });
    }
    let aggregations;
    switch (entityType) {
      case search_entity_type_enum_1.SearchEntityType.MERCHANT:
        aggregations = this.buildMerchantAggregations();
        break;
      case search_entity_type_enum_1.SearchEntityType.BRAND:
        aggregations = this.buildBrandAggregations();
        break;
      case search_entity_type_enum_1.SearchEntityType.PRODUCT:
      default:
        aggregations = this.buildProductAggregations();
        break;
    }
    if (filteredFields.size === 0) {
      return aggregations;
    }
    const postFilterAggs = {};
    Object.entries(aggregations).forEach(([key, agg]) => {
      const fieldName = this.getFieldNameFromAggKey(key);
      if (filteredFields.has(fieldName)) {
        const otherFilters = this.buildFiltersExcept(fieldName, filters, rangeFilters);
        if (otherFilters.length > 0) {
          postFilterAggs[key] = {
            filter: {
              bool: {
                filter: otherFilters,
              },
            },
            aggs: { [key]: agg },
          };
        } else {
          postFilterAggs[key] = agg;
        }
      } else {
        postFilterAggs[key] = agg;
      }
    });
    return postFilterAggs;
  }
  buildMerchantAggregations() {
    return {
      categories: {
        terms: {
          field: 'categories.keyword',
          size: 30,
        },
      },
      locations: {
        terms: {
          field: 'location.keyword',
          size: 20,
        },
      },
      values: {
        terms: {
          field: 'values.keyword',
          size: 20,
        },
      },
    };
  }
  buildBrandAggregations() {
    return {
      categories: {
        terms: {
          field: 'categories.keyword',
          size: 30,
        },
      },
      values: {
        terms: {
          field: 'values.keyword',
          size: 20,
        },
      },
      founded_years: {
        terms: {
          field: 'foundedYear',
          size: 20,
        },
      },
    };
  }
  buildProductAggregations() {
    return {
      categories: {
        terms: {
          field: 'categories.keyword',
          size: 30,
        },
      },
      brands: {
        terms: {
          field: 'brandName.keyword',
          size: 20,
        },
      },
      price_ranges: {
        range: {
          field: 'price',
          ranges: [
            { to: 25 },
            { from: 25, to: 50 },
            { from: 50, to: 100 },
            { from: 100, to: 200 },
            { from: 200 },
          ],
        },
      },
      price_stats: {
        stats: {
          field: 'price',
        },
      },
      merchants: {
        terms: {
          field: 'merchantId.keyword',
          size: 20,
        },
      },
      in_stock: {
        terms: {
          field: 'inStock',
        },
      },
      tags: {
        terms: {
          field: 'tags.keyword',
          size: 30,
        },
      },
    };
  }
  buildMerchantSearchQuery(query, sort, _filters, _rangeFilters) {
    if (!query || query.trim() === '') {
      return {
        query: { match_all: {} },
        ...(sort && { sort: { [sort.field]: { order: sort.order } } }),
      };
    }
    return {
      query: {
        bool: {
          should: [
            {
              match_phrase: {
                name: {
                  query,
                  boost: 10,
                },
              },
            },
            {
              match: {
                name: {
                  query,
                  boost: 4,
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              match: {
                description: {
                  query,
                  boost: 2,
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              match: {
                categories: {
                  query,
                  boost: 2,
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              multi_match: {
                query,
                fields: ['name^3', 'description^2', 'categories'],
                type: 'best_fields',
                fuzziness: 'AUTO',
                tie_breaker: 0.3,
              },
            },
          ],
          minimum_should_match: 1,
        },
      },
      highlight: {
        fields: {
          name: { number_of_fragments: 1, fragment_size: 150 },
          description: { number_of_fragments: 1, fragment_size: 150 },
          categories: { number_of_fragments: 1 },
        },
        pre_tags: ['<em>'],
        post_tags: ['</em>'],
      },
      aggs: {
        categories: {
          terms: {
            field: 'categories.keyword',
            size: 30,
          },
        },
        locations: {
          terms: {
            field: 'location.keyword',
            size: 20,
          },
        },
        values: {
          terms: {
            field: 'values.keyword',
            size: 20,
          },
        },
      },
      ...(sort && { sort: { [sort.field]: { order: sort.order } } }),
    };
  }
  buildBrandSearchQuery(query, sort, _filters, _rangeFilters) {
    if (!query || query.trim() === '') {
      return {
        query: { match_all: {} },
        ...(sort && { sort: { [sort.field]: { order: sort.order } } }),
      };
    }
    return {
      query: {
        bool: {
          should: [
            {
              match_phrase: {
                name: {
                  query,
                  boost: 10,
                },
              },
            },
            {
              match: {
                name: {
                  query,
                  boost: 4,
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              match: {
                description: {
                  query,
                  boost: 2,
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              multi_match: {
                query,
                fields: ['name^3', 'description^2'],
                type: 'best_fields',
                fuzziness: 'AUTO',
                tie_breaker: 0.3,
              },
            },
          ],
          minimum_should_match: 1,
        },
      },
      highlight: {
        fields: {
          name: { number_of_fragments: 1, fragment_size: 150 },
          description: { number_of_fragments: 1, fragment_size: 150 },
        },
        pre_tags: ['<em>'],
        post_tags: ['</em>'],
      },
      aggs: {
        categories: {
          terms: {
            field: 'categories.keyword',
            size: 30,
          },
        },
        values: {
          terms: {
            field: 'values.keyword',
            size: 20,
          },
        },
        founded_years: {
          terms: {
            field: 'foundedYear',
            size: 20,
          },
        },
      },
      ...(sort && { sort: { [sort.field]: { order: sort.order } } }),
    };
  }
  generateFacetsFromAggregations(aggregations) {
    if (!aggregations) {
      return this.createEmptyFacets();
    }
    const categories =
      aggregations.categories?.buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];
    const brands =
      aggregations.brands?.buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];
    const merchants =
      aggregations.merchants?.buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];
    const tags =
      aggregations.tags?.buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];
    const inStock =
      aggregations.in_stock?.buckets.map(bucket => ({
        name: bucket.key ? 'In Stock' : 'Out of Stock',
        count: bucket.doc_count,
      })) || [];
    const priceRanges =
      aggregations.price_ranges?.buckets.map(bucket => ({
        min: bucket.from || 0,
        max: bucket.to || Number.MAX_VALUE,
        count: bucket.doc_count,
      })) || [];
    const priceStats = aggregations.price_stats;
    const minPrice = priceStats?.min || 0;
    const maxPrice = priceStats?.max || 1000;
    return {
      categories,
      values: tags,
      price: {
        min: minPrice,
        max: maxPrice,
        ranges: priceRanges,
      },
      brands,
      merchants,
      inStock,
    };
  }
  generateFacetsFromResults(hits) {
    if (!hits || hits.length === 0) {
      return this.createEmptyFacets();
    }
    const categoriesMap = new Map();
    const valuesMap = new Map();
    let minPrice = Number.MAX_VALUE;
    let maxPrice = 0;
    hits.forEach(hit => {
      const source = hit._source;
      if (source.categories && Array.isArray(source.categories)) {
        source.categories.forEach(category => {
          const count = categoriesMap.get(category) || 0;
          categoriesMap.set(category, count + 1);
        });
      }
      if (source.values && Array.isArray(source.values)) {
        source.values.forEach(value => {
          const count = valuesMap.get(value) || 0;
          valuesMap.set(value, count + 1);
        });
      }
      if (source.price !== undefined) {
        const price = parseFloat(source.price);
        if (!isNaN(price)) {
          minPrice = Math.min(minPrice, price);
          maxPrice = Math.max(maxPrice, price);
        }
      }
    });
    const categories = Array.from(categoriesMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));
    const values = Array.from(valuesMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));
    const priceRange = maxPrice - minPrice;
    const step = priceRange / 4;
    const priceRanges = [];
    if (priceRange > 0) {
      for (let i = 0; i < 4; i++) {
        const start = minPrice + i * step;
        const end = i === 3 ? maxPrice : minPrice + (i + 1) * step;
        priceRanges.push({
          min: Math.floor(start),
          max: Math.ceil(end),
          count: hits.filter(hit => {
            const price = parseFloat(hit._source.price);
            return price >= start && price <= end;
          }).length,
        });
      }
    }
    return {
      categories: categories.sort((a, b) => b.count - a.count),
      values: values.sort((a, b) => b.count - a.count),
      price: {
        min: minPrice === Number.MAX_VALUE ? 0 : Math.floor(minPrice),
        max: Math.ceil(maxPrice),
        ranges: priceRanges,
      },
    };
  }
  buildFilteredQuery(
    query,
    filters,
    rangeFilters,
    sort,
    entityType = search_entity_type_enum_1.SearchEntityType.PRODUCT,
  ) {
    const filteredFields = new Set();
    const filterClauses = [];
    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        if (filter.values && filter.values.length > 0) {
          filteredFields.add(filter.field);
          if (filter.exact) {
            filterClauses.push({
              terms: {
                [`${filter.field}.keyword`]: filter.values,
              },
            });
          } else {
            const shouldClauses = filter.values.map(value => ({
              match: {
                [filter.field]: {
                  query: value,
                  fuzziness: 'AUTO',
                },
              },
            }));
            filterClauses.push({
              bool: {
                should: shouldClauses,
                minimum_should_match: 1,
              },
            });
          }
        }
      });
    }
    if (rangeFilters && rangeFilters.length > 0) {
      rangeFilters.forEach(rangeFilter => {
        const rangeQuery = {};
        if (rangeFilter.min !== undefined) {
          rangeQuery.gte = rangeFilter.min;
        }
        if (rangeFilter.max !== undefined) {
          rangeQuery.lte = rangeFilter.max;
        }
        if (Object.keys(rangeQuery).length > 0) {
          filterClauses.push({
            range: {
              [rangeFilter.field]: rangeQuery,
            },
          });
        }
      });
    }
    const searchQuery = {
      query: {
        bool: {
          ...(filterClauses.length > 0 ? { filter: filterClauses } : {}),
          ...(query && query.trim() !== ''
            ? {
                must: {
                  multi_match: {
                    query,
                    fields: ['title^3', 'description^2', 'brandName^2', 'categories', 'tags'],
                    type: 'best_fields',
                    fuzziness: 'AUTO',
                  },
                },
              }
            : { must: { match_all: {} } }),
        },
      },
      aggs: this.getAggregationsForEntityType(entityType, filters, rangeFilters),
      highlight: {
        fields: {
          title: { number_of_fragments: 1, fragment_size: 150 },
          description: { number_of_fragments: 1, fragment_size: 150 },
          brandName: { number_of_fragments: 1 },
          categories: { number_of_fragments: 1 },
        },
        pre_tags: ['<em>'],
        post_tags: ['</em>'],
      },
    };
    if (sort) {
      searchQuery.sort = { [sort.field]: { order: sort.order } };
    }
    return searchQuery;
  }
  getFieldNameFromAggKey(aggKey) {
    const aggToFieldMap = {
      categories: 'categories',
      brands: 'brandName',
      merchants: 'merchantId',
      price_ranges: 'price',
      price_stats: 'price',
      in_stock: 'inStock',
      tags: 'tags',
      locations: 'location',
      founded_years: 'foundedYear',
      values: 'values',
    };
    return aggToFieldMap[aggKey] || aggKey;
  }
  buildFiltersExcept(fieldToExclude, filters, rangeFilters) {
    const filterClauses = [];
    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        if (filter.field !== fieldToExclude && filter.values && filter.values.length > 0) {
          if (filter.exact) {
            filterClauses.push({
              terms: {
                [`${filter.field}.keyword`]: filter.values,
              },
            });
          } else {
            const shouldClauses = filter.values.map(value => ({
              match: {
                [filter.field]: {
                  query: value,
                  fuzziness: 'AUTO',
                },
              },
            }));
            filterClauses.push({
              bool: {
                should: shouldClauses,
                minimum_should_match: 1,
              },
            });
          }
        }
      });
    }
    if (rangeFilters && rangeFilters.length > 0) {
      rangeFilters.forEach(rangeFilter => {
        if (rangeFilter.field !== fieldToExclude) {
          const rangeQuery = {};
          if (rangeFilter.min !== undefined) {
            rangeQuery.gte = rangeFilter.min;
          }
          if (rangeFilter.max !== undefined) {
            rangeQuery.lte = rangeFilter.max;
          }
          if (Object.keys(rangeQuery).length > 0) {
            filterClauses.push({
              range: {
                [rangeFilter.field]: rangeQuery,
              },
            });
          }
        }
      });
    }
    return filterClauses;
  }
  buildFacetedSearchQuery(query, entityType, filters, rangeFilters, sort) {
    const searchQuery = {
      query: {
        bool: {
          filter: [],
          must:
            query && query.trim() !== ''
              ? {
                  multi_match: {
                    query,
                    fields: ['title^3', 'description^2', 'brandName^2', 'categories', 'tags'],
                    type: 'best_fields',
                    fuzziness: 'AUTO',
                  },
                }
              : { match_all: {} },
        },
      },
      highlight: {
        fields: {
          title: { number_of_fragments: 1, fragment_size: 150 },
          description: { number_of_fragments: 1, fragment_size: 150 },
          brandName: { number_of_fragments: 1 },
          categories: { number_of_fragments: 1 },
        },
        pre_tags: ['<em>'],
        post_tags: ['</em>'],
      },
    };
    searchQuery.aggs = this.getAggregationsForEntityType(entityType);
    if (sort) {
      searchQuery.sort = { [sort.field]: { order: sort.order } };
    }
    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        if (filter.values && filter.values.length > 0) {
          if (filter.exact) {
            searchQuery.query.bool.filter.push({
              terms: {
                [`${filter.field}.keyword`]: filter.values,
              },
            });
          } else {
            const shouldClauses = filter.values.map(value => ({
              match: {
                [filter.field]: {
                  query: value,
                  fuzziness: 'AUTO',
                },
              },
            }));
            searchQuery.query.bool.filter.push({
              bool: {
                should: shouldClauses,
                minimum_should_match: 1,
              },
            });
          }
        }
      });
    }
    if (rangeFilters && rangeFilters.length > 0) {
      rangeFilters.forEach(rangeFilter => {
        if (rangeFilter.min !== undefined || rangeFilter.max !== undefined) {
          const rangeQuery = {};
          if (rangeFilter.min !== undefined) {
            rangeQuery.gte = Number(rangeFilter.min);
          }
          if (rangeFilter.max !== undefined) {
            rangeQuery.lte = Number(rangeFilter.max);
          }
          searchQuery.query.bool.filter.push({
            range: {
              [rangeFilter.field]: rangeQuery,
            },
          });
        }
      });
    }
    return searchQuery;
  }
  async trackSearchInAnalytics(clientId, searchTerm, resultCount, totalResults, testInfo, userId) {
    try {
      await this.googleAnalyticsService.trackSearch(
        clientId,
        searchTerm,
        resultCount,
        testInfo,
        userId,
      );
      if (testInfo) {
        await this.abTestingService.trackSearchResults(
          clientId,
          testInfo.testId,
          testInfo.variantId,
          searchTerm,
          totalResults,
          userId,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to track search in analytics: ${error.message}`);
    }
  }
  convertFilters(filters, rangeFilters) {
    const result = {};
    if (filters && filters.length > 0) {
      for (const filter of filters) {
        if (filter.field === 'categories') {
          result.categories = filter.values;
        } else if (filter.field === 'merchantId') {
          result.merchantId = filter.values[0];
        } else if (filter.field === 'brandName') {
          result.brandName = filter.values[0];
        } else if (filter.field === 'inStock') {
          result.inStock = filter.values[0] === 'true';
        } else if (filter.field === 'values') {
          result.values = filter.values;
        }
      }
    }
    if (rangeFilters && rangeFilters.length > 0) {
      for (const rangeFilter of rangeFilters) {
        if (rangeFilter.field === 'price') {
          if (rangeFilter.min !== undefined) {
            result.priceMin = rangeFilter.min;
          }
          if (rangeFilter.max !== undefined) {
            result.priceMax = rangeFilter.max;
          }
        }
      }
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }
});
exports.SimpleSearchService = SimpleSearchService;
exports.SimpleSearchService =
  SimpleSearchService =
  SimpleSearchService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          elasticsearch_service_1.ElasticsearchService,
          search_relevance_service_1.SearchRelevanceService,
          user_preference_service_1.UserPreferenceService,
          ab_testing_service_1.ABTestingService,
          google_analytics_service_1.GoogleAnalyticsService,
        ]),
      ],
      SimpleSearchService,
    );
//# sourceMappingURL=simple-search.service.js.map
