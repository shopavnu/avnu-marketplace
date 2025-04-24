import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';
import { SearchEntityType } from '../enums/search-entity-type.enum';
import { SearchRelevanceService, RelevanceAlgorithm } from './search-relevance.service';
import { UserPreferenceService, UserInteractionType } from './user-preference.service';
import { ABTestingService } from './ab-testing.service';
import { GoogleAnalyticsService } from '../../analytics/services/google-analytics.service';
import {
  SearchOptionsInput,
  SortOption,
  FilterOption,
  RangeFilterOption,
} from '../dto/search-options.dto';
import {
  SearchResponseDto,
  PaginationInfo as _PaginationInfo,
  SearchFacets,
  PriceFacet as _PriceFacet,
} from '../dto/search-response.dto';
import { User } from '../../users/entities/user.entity';

/**
 * A simplified search service that directly uses Elasticsearch
 * without the complexity of NLP processing
 */
@Injectable()
export class SimpleSearchService {
  private readonly logger = new Logger(SimpleSearchService.name);

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly searchRelevanceService: SearchRelevanceService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly abTestingService: ABTestingService,
    private readonly googleAnalyticsService: GoogleAnalyticsService,
  ) {}

  /**
   * Search for products, merchants, or brands
   */
  /**
   * Apply enhanced category and brand boosting based on user history
   * This adds progressive boosting where top categories/brands get higher boosts
   */
  private async applyCategoryAndBrandBoosting(
    query: any,
    preferences: any,
    boostStrength: number = 1.0,
  ): Promise<any> {
    try {
      // Create a deep copy of the query to avoid modifying the original
      const enhancedQuery = JSON.parse(JSON.stringify(query));

      // Ensure we have a function_score query
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

      // Get top categories and brands for enhanced boosting
      const topCategories = this.getTopItems(preferences.categories, 5);
      const topBrands = this.getTopItems(preferences.brands, 5);

      // Add progressive category boosts (higher boost for top categories)
      if (topCategories.length > 0) {
        this.logger.log(`Applying progressive category boosting`);

        // Apply higher boosts to top categories (progressive boosting)
        topCategories.forEach(([category, weight], index) => {
          // Calculate a boost factor that decreases with position
          // First item gets highest boost, last gets lowest
          const positionBoost = 1 + (topCategories.length - index) / topCategories.length;

          functions.push({
            filter: {
              match: {
                categories: category,
              },
            },
            weight: Number(weight) * 2.0 * positionBoost * boostStrength, // Enhanced category boost with position factor
          });
        });
      }

      // Add progressive brand boosts (higher boost for top brands)
      if (topBrands.length > 0) {
        this.logger.log(`Applying progressive brand boosting`);

        // Apply higher boosts to top brands (progressive boosting)
        topBrands.forEach(([brand, weight], index) => {
          // Calculate a boost factor that decreases with position
          const positionBoost = 1 + (topBrands.length - index) / topBrands.length;

          functions.push({
            filter: {
              match: {
                brand: brand,
              },
            },
            weight: Number(weight) * 1.8 * positionBoost * boostStrength, // Enhanced brand boost with position factor
          });
        });
      }

      return enhancedQuery;
    } catch (error) {
      this.logger.error(`Error applying category and brand boosting: ${error.message}`);
      return query; // Return original query if there's an error
    }
  }

  /**
   * Get top N items from a preference map, sorted by weight
   */
  private getTopItems(preferenceMap: Record<string, number>, count: number): [string, number][] {
    if (!preferenceMap) return [];

    return Object.entries(preferenceMap)
      .filter(([_, weight]) => Number(weight) > 0)
      .sort(([_, weightA], [__, weightB]) => Number(weightB) - Number(weightA))
      .slice(0, count);
  }

  /**
   * Extract categories from search results for tracking
   */
  private extractCategoriesFromResults(results: any[]): string[] {
    if (!results || !Array.isArray(results)) return [];

    const categories = new Set<string>();

    results.forEach(result => {
      if (result.categories && Array.isArray(result.categories)) {
        result.categories.forEach((category: string) => categories.add(category));
      }
    });

    return Array.from(categories);
  }

  /**
   * Extract brands from search results for tracking
   */
  private extractBrandsFromResults(results: any[]): string[] {
    if (!results || !Array.isArray(results)) return [];

    const brands = new Set<string>();

    results.forEach(result => {
      if (result.brand) {
        brands.add(result.brand);
      }
    });

    return Array.from(brands);
  }

  async searchAsync(options: SearchOptionsInput, user?: User): Promise<SearchResponseDto> {
    const startTime = Date.now();
    this.logger.log(`Starting searchAsync with query: "${options.query}"`);

    // Generate a client ID for analytics if not provided
    const clientId = options.clientId || this.googleAnalyticsService.generateClientId();

    // Determine if we should use A/B testing
    let testInfo;
    let relevanceAlgorithm = RelevanceAlgorithm.STANDARD;
    let scoringProfile = 'standard';

    if (options.enableABTesting && user) {
      // Get the active test for search relevance
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

        // Map the algorithm to a scoring profile
        switch (relevanceAlgorithm) {
          case RelevanceAlgorithm.INTENT_BOOSTED:
            scoringProfile = 'intent';
            break;
          case RelevanceAlgorithm.USER_PREFERENCE:
            scoringProfile = 'preference';
            break;
          case RelevanceAlgorithm.HYBRID:
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
      entityType = SearchEntityType.PRODUCT,
      filters,
      sort,
    } = options;

    // Build a simple search query
    const _searchQuery = this.buildSimpleSearchQuery(query, filters, sort ? sort[0] : undefined);

    try {
      // Use the direct Elasticsearch methods we know are working
      let _results;
      let responseData: Partial<SearchResponseDto> = {};

      switch (entityType) {
        case SearchEntityType.PRODUCT:
          // Convert filter options to the format expected by ElasticsearchService
          const _productFilters = this.convertFilters(filters, options.rangeFilters);

          // Use the dedicated faceted search query builder for better filter handling
          let searchQuery = this.buildFacetedSearchQuery(
            query,
            SearchEntityType.PRODUCT,
            filters,
            options.rangeFilters,
            sort && sort.length > 0 ? sort[0] : undefined,
          );

          // Apply personalization if enabled
          if (options.enablePersonalization && user) {
            this.logger.log(`Applying personalization for user: ${user.id}`);

            // Get user preferences
            const userPreferences = await this.userPreferenceService.getUserPreferences(user.id);

            if (userPreferences) {
              // Apply user preferences to search query with specified strength
              const personalizationStrength = options.personalizationStrength || 1.0;

              // Apply enhanced category and brand boosting
              searchQuery = await this.applyCategoryAndBrandBoosting(
                searchQuery,
                userPreferences,
                personalizationStrength,
              );

              // Apply standard user preferences
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

          // Apply NLP enhancements if enabled
          if (options.enableNlp && options.nlpData) {
            // Apply intent-based scoring if NLP data is available
            searchQuery = this.searchRelevanceService.applyScoringProfile(
              searchQuery,
              'intent',
              user,
              options.nlpData.intent,
              options.nlpData.entities,
            );
          } else if (options.enableABTesting && testInfo) {
            // Apply the selected scoring profile from A/B testing
            searchQuery = this.searchRelevanceService.applyScoringProfile(
              searchQuery,
              scoringProfile,
              user,
            );
          } else if (options.enablePersonalization && user) {
            // Apply user preference-based scoring
            const userPreferences = await this.userPreferenceService.getUserPreferences(user.id);
            if (userPreferences) {
              searchQuery = this.userPreferenceService.applyPreferencesToQuery(
                searchQuery,
                userPreferences,
                options.personalizationStrength || 1.0,
              );
            }
          }

          // Perform the search directly using the Elasticsearch service
          const searchResponse = await this.elasticsearchService.performSearch(
            'products',
            searchQuery,
          );

          // Process the search results
          const hits = searchResponse.hits.hits;
          const total = searchResponse.hits.total.value;

          // Map the search results to the expected format
          const products = hits.map(hit => {
            const source = hit._source;
            const highlight = hit.highlight || {};

            // Create the product object with highlighting if available
            const hasHighlights = Object.keys(highlight).length > 0;

            // Map the highlights to the expected DTO format
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
              // Add highlight information in the format expected by GraphQL
              highlights: hasHighlights
                ? {
                    fields: highlightFields,
                    matchedTerms: query.split(' '),
                  }
                : undefined,
            };
          });

          // Generate facets from the aggregations
          const facets = this.generateFacetsFromAggregations(searchResponse.aggregations);

          // Track search in Google Analytics if enabled
          if (options.enableAnalytics) {
            await this.trackSearchInAnalytics(
              clientId,
              query,
              products.length,
              total,
              testInfo,
              user?.id,
            );

            // Record search interaction for user preference learning if user is logged in
            if (user && options.enablePersonalization) {
              try {
                await this.userPreferenceService.recordInteraction({
                  userId: user.id,
                  type: UserInteractionType.SEARCH,
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

        case SearchEntityType.MERCHANT:
          // Use the dedicated faceted search query builder for better filter handling
          const merchantSearchQuery = this.buildFacetedSearchQuery(
            query,
            SearchEntityType.MERCHANT,
            filters,
            options.rangeFilters,
            sort && sort.length > 0 ? sort[0] : undefined,
          );

          // Perform the search directly using the Elasticsearch service
          const merchantSearchResponse = await this.elasticsearchService.performSearch(
            'merchants',
            merchantSearchQuery,
          );

          // Process the search results
          const merchantHits = merchantSearchResponse.hits.hits;
          const merchantTotal = merchantSearchResponse.hits.total.value;

          // Map the search results to the expected format
          const merchants = merchantHits.map(hit => {
            const source = hit._source;
            const highlight = hit.highlight || {};

            // Map the highlights to the expected DTO format
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
              // Add highlight information in the format expected by GraphQL
              highlights: hasHighlights
                ? {
                    fields: highlightFields,
                    matchedTerms: query.split(' '),
                  }
                : undefined,
            };
          });

          // Generate facets from the aggregations
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

        case SearchEntityType.BRAND:
          // Use the dedicated faceted search query builder for better filter handling
          const brandSearchQuery = this.buildFacetedSearchQuery(
            query,
            SearchEntityType.BRAND,
            filters,
            options.rangeFilters,
            sort && sort.length > 0 ? sort[0] : undefined,
          );

          // Perform the search directly using the Elasticsearch service
          const brandSearchResponse = await this.elasticsearchService.performSearch(
            'brands',
            brandSearchQuery,
          );

          // Process the search results
          const brandHits = brandSearchResponse.hits.hits;
          const brandTotal = brandSearchResponse.hits.total.value;

          // Map the search results to the expected format
          const brands = brandHits.map(hit => {
            const source = hit._source;
            const highlight = hit.highlight || {};

            // Map the highlights to the expected DTO format
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
              // Add highlight information in the format expected by GraphQL
              highlights: hasHighlights
                ? {
                    fields: highlightFields,
                    matchedTerms: query.split(' '),
                  }
                : undefined,
            };
          });

          // Generate facets from the aggregations
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
          throw new HttpException(`Unsupported entity type: ${entityType}`, HttpStatus.BAD_REQUEST);
      }

      // Add query to response
      responseData.query = query;

      const endTime = Date.now();
      const searchDuration = endTime - startTime;
      this.logger.log(`Search completed in ${searchDuration}ms`);

      // Add search metadata if available
      if (responseData) {
        responseData.metadata = {
          searchDuration,
          algorithm: relevanceAlgorithm,
          ...(testInfo ? { testId: testInfo.testId, variantId: testInfo.variantId } : {}),
        };
      }

      return responseData as SearchResponseDto;
    } catch (error) {
      this.logger.error(`Search error: ${error.message}`, error.stack);
      this.logger.error(
        `Search parameters: ${JSON.stringify({ query, entityType, filters, options: options.rangeFilters })}`,
      );

      // Provide more detailed error information
      throw new HttpException(`Search failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Build an enhanced search query for products in Elasticsearch with improved relevance and faceted search
   */
  private buildSimpleSearchQuery(
    query: string,
    filters?: FilterOption[],
    sort?: SortOption,
    rangeFilters?: RangeFilterOption[],
  ): any {
    // Build filter clauses from filter options
    const filterClauses = [];

    // Process regular filters
    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        if (filter.values && filter.values.length > 0) {
          // Handle different filter types
          if (filter.exact) {
            // Exact match filter (terms query)
            filterClauses.push({
              terms: {
                [`${filter.field}.keyword`]: filter.values,
              },
            });
          } else {
            // Fuzzy match filter
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

    // Process range filters
    if (rangeFilters && rangeFilters.length > 0) {
      rangeFilters.forEach(rangeFilter => {
        const rangeQuery: any = {};

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

    // If no query is provided, use match_all with filters
    if (!query || query.trim() === '') {
      return {
        query: {
          bool: {
            must: { match_all: {} },
            ...(filterClauses.length > 0 && { filter: filterClauses }),
          },
        },
        // Add aggregations for faceted search
        aggs: this.buildProductAggregations(),
        ...(sort && { sort: { [sort.field]: { order: sort.order } } }),
      };
    }

    // Create a more sophisticated query structure for better relevance
    return {
      query: {
        bool: {
          should: [
            // Exact match on title with highest boost (most important)
            {
              match_phrase: {
                title: {
                  query,
                  boost: 10, // Highest boost for exact phrase matches in title
                },
              },
            },
            // Exact match on brand name (very important)
            {
              match_phrase: {
                brandName: {
                  query,
                  boost: 5,
                },
              },
            },
            // Fuzzy match on title (important)
            {
              match: {
                title: {
                  query,
                  boost: 4,
                  fuzziness: 'AUTO',
                },
              },
            },
            // Fuzzy match on description (somewhat important)
            {
              match: {
                description: {
                  query,
                  boost: 2,
                  fuzziness: 'AUTO',
                },
              },
            },
            // Fuzzy match on categories (somewhat important)
            {
              match: {
                categories: {
                  query,
                  boost: 2,
                  fuzziness: 'AUTO',
                },
              },
            },
            // Fuzzy match on brand name (somewhat important)
            {
              match: {
                brandName: {
                  query,
                  boost: 3,
                  fuzziness: 'AUTO',
                },
              },
            },
            // Fuzzy match on tags (less important)
            {
              match: {
                tags: {
                  query,
                  boost: 1,
                  fuzziness: 'AUTO',
                },
              },
            },
            // Multi-match for general relevance
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
          minimum_should_match: 1, // At least one of the should clauses must match
        },
      },
      // Add highlighting for search results
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
      // Add aggregations for faceted search
      aggs: this.buildProductAggregations(),
      ...(sort && { sort: { [sort.field]: { order: sort.order } } }),
    };
  }

  /**
   * Create empty facets object
   */
  private createEmptyFacets(): SearchFacets {
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

  /**
   * Get aggregations based on entity type with support for post-filter aggregations
   * This ensures facet counts remain accurate even when filters are applied
   */
  private getAggregationsForEntityType(
    entityType: SearchEntityType,
    filters?: FilterOption[],
    rangeFilters?: RangeFilterOption[],
  ): any {
    // Extract filtered fields to determine which aggregations need post-filtering
    const filteredFields = new Set<string>();

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

    // Get base aggregations based on entity type
    let aggregations;
    switch (entityType) {
      case SearchEntityType.MERCHANT:
        aggregations = this.buildMerchantAggregations();
        break;
      case SearchEntityType.BRAND:
        aggregations = this.buildBrandAggregations();
        break;
      case SearchEntityType.PRODUCT:
      default:
        aggregations = this.buildProductAggregations();
        break;
    }

    // If there are no filters, return the base aggregations
    if (filteredFields.size === 0) {
      return aggregations;
    }

    // Otherwise, create post-filter aggregations for accurate counts
    const postFilterAggs: any = {};

    // For each aggregation, check if it's for a filtered field
    // If it is, wrap it in a filter aggregation that excludes its own filter
    Object.entries(aggregations).forEach(([key, agg]) => {
      // Determine the field name from the aggregation key
      const fieldName = this.getFieldNameFromAggKey(key);

      // If this field is being filtered, create a post-filter aggregation
      if (filteredFields.has(fieldName)) {
        // Create a filter that includes all filters except for this field
        const otherFilters = this.buildFiltersExcept(fieldName, filters, rangeFilters);

        // Only create a filter aggregation if there are other filters
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
          // If there are no other filters, use the original aggregation
          postFilterAggs[key] = agg;
        }
      } else {
        // For fields that aren't being filtered, use the original aggregation
        postFilterAggs[key] = agg;
      }
    });

    return postFilterAggs;
  }

  /**
   * Build aggregations for merchant search
   */
  private buildMerchantAggregations(): any {
    return {
      // Category aggregation
      categories: {
        terms: {
          field: 'categories.keyword',
          size: 30,
        },
      },
      // Location aggregation
      locations: {
        terms: {
          field: 'location.keyword',
          size: 20,
        },
      },
      // Values aggregation
      values: {
        terms: {
          field: 'values.keyword',
          size: 20,
        },
      },
    };
  }

  /**
   * Build aggregations for brand search
   */
  private buildBrandAggregations(): any {
    return {
      // Category aggregation
      categories: {
        terms: {
          field: 'categories.keyword',
          size: 30,
        },
      },
      // Values aggregation
      values: {
        terms: {
          field: 'values.keyword',
          size: 20,
        },
      },
      // Founded year aggregation
      founded_years: {
        terms: {
          field: 'foundedYear',
          size: 20,
        },
      },
    };
  }

  /**
   * Build aggregations for product search
   */
  private buildProductAggregations(): any {
    return {
      // Category aggregation
      categories: {
        terms: {
          field: 'categories.keyword',
          size: 30, // Return top 30 categories
        },
      },
      // Brand aggregation
      brands: {
        terms: {
          field: 'brandName.keyword',
          size: 20, // Return top 20 brands
        },
      },
      // Price range aggregation
      price_ranges: {
        range: {
          field: 'price',
          ranges: [
            { to: 25 }, // $0-$25
            { from: 25, to: 50 }, // $25-$50
            { from: 50, to: 100 }, // $50-$100
            { from: 100, to: 200 }, // $100-$200
            { from: 200 }, // $200+
          ],
        },
      },
      // Price stats for min/max values
      price_stats: {
        stats: {
          field: 'price',
        },
      },
      // Merchant aggregation
      merchants: {
        terms: {
          field: 'merchantId.keyword',
          size: 20, // Return top 20 merchants
        },
      },
      // In-stock status aggregation
      in_stock: {
        terms: {
          field: 'inStock',
        },
      },
      // Tags aggregation
      tags: {
        terms: {
          field: 'tags.keyword',
          size: 30, // Return top 30 tags
        },
      },
    };
  }

  /**
   * Build an enhanced search query for merchants in Elasticsearch with improved relevance and faceted search
   */
  private buildMerchantSearchQuery(
    query: string,
    sort?: SortOption,
    _filters?: FilterOption[],
    _rangeFilters?: RangeFilterOption[],
  ): any {
    if (!query || query.trim() === '') {
      // Handle empty query case with a match_all query
      return {
        query: { match_all: {} },
        ...(sort && { sort: { [sort.field]: { order: sort.order } } }),
      };
    }

    // Create a more sophisticated query structure for better relevance
    return {
      query: {
        bool: {
          should: [
            // Exact match on name with highest boost (most important)
            {
              match_phrase: {
                name: {
                  query,
                  boost: 10, // Highest boost for exact phrase matches in name
                },
              },
            },
            // Fuzzy match on name (important)
            {
              match: {
                name: {
                  query,
                  boost: 4,
                  fuzziness: 'AUTO',
                },
              },
            },
            // Fuzzy match on description (somewhat important)
            {
              match: {
                description: {
                  query,
                  boost: 2,
                  fuzziness: 'AUTO',
                },
              },
            },
            // Fuzzy match on categories (somewhat important)
            {
              match: {
                categories: {
                  query,
                  boost: 2,
                  fuzziness: 'AUTO',
                },
              },
            },
            // Multi-match for general relevance
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
          minimum_should_match: 1, // At least one of the should clauses must match
        },
      },
      // Add highlighting for search results
      highlight: {
        fields: {
          name: { number_of_fragments: 1, fragment_size: 150 },
          description: { number_of_fragments: 1, fragment_size: 150 },
          categories: { number_of_fragments: 1 },
        },
        pre_tags: ['<em>'],
        post_tags: ['</em>'],
      },
      // Add aggregations for faceted search
      aggs: {
        // Category aggregation
        categories: {
          terms: {
            field: 'categories.keyword',
            size: 30, // Return top 30 categories
          },
        },
        // Location aggregation
        locations: {
          terms: {
            field: 'location.keyword',
            size: 20, // Return top 20 locations
          },
        },
        // Values/tags aggregation
        values: {
          terms: {
            field: 'values.keyword',
            size: 20, // Return top 20 values
          },
        },
      },
      ...(sort && { sort: { [sort.field]: { order: sort.order } } }),
    };
  }

  /**
   * Build an enhanced search query for brands in Elasticsearch with improved relevance and faceted search
   */
  private buildBrandSearchQuery(
    query: string,
    sort?: SortOption,
    _filters?: FilterOption[],
    _rangeFilters?: RangeFilterOption[],
  ): any {
    if (!query || query.trim() === '') {
      // Handle empty query case with a match_all query
      return {
        query: { match_all: {} },
        ...(sort && { sort: { [sort.field]: { order: sort.order } } }),
      };
    }

    // Create a more sophisticated query structure for better relevance
    return {
      query: {
        bool: {
          should: [
            // Exact match on name with highest boost (most important)
            {
              match_phrase: {
                name: {
                  query,
                  boost: 10, // Highest boost for exact phrase matches in name
                },
              },
            },
            // Fuzzy match on name (important)
            {
              match: {
                name: {
                  query,
                  boost: 4,
                  fuzziness: 'AUTO',
                },
              },
            },
            // Fuzzy match on description (somewhat important)
            {
              match: {
                description: {
                  query,
                  boost: 2,
                  fuzziness: 'AUTO',
                },
              },
            },
            // Multi-match for general relevance
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
          minimum_should_match: 1, // At least one of the should clauses must match
        },
      },
      // Add highlighting for search results
      highlight: {
        fields: {
          name: { number_of_fragments: 1, fragment_size: 150 },
          description: { number_of_fragments: 1, fragment_size: 150 },
        },
        pre_tags: ['<em>'],
        post_tags: ['</em>'],
      },
      // Add aggregations for faceted search
      aggs: {
        // Category aggregation
        categories: {
          terms: {
            field: 'categories.keyword',
            size: 30, // Return top 30 categories
          },
        },
        // Values aggregation
        values: {
          terms: {
            field: 'values.keyword',
            size: 20, // Return top 20 values
          },
        },
        // Founded year aggregation
        founded_years: {
          terms: {
            field: 'foundedYear',
            size: 20, // Return top 20 years
          },
        },
      },
      ...(sort && { sort: { [sort.field]: { order: sort.order } } }),
    };
  }

  /**
   * Generate facets from Elasticsearch aggregations
   */
  private generateFacetsFromAggregations(aggregations: any): SearchFacets {
    if (!aggregations) {
      return this.createEmptyFacets();
    }

    // Process category facets
    const categories =
      aggregations.categories?.buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    // Process brand facets
    const brands =
      aggregations.brands?.buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    // Process merchant facets
    const merchants =
      aggregations.merchants?.buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    // Process tag facets
    const tags =
      aggregations.tags?.buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    // Process in-stock facet
    const inStock =
      aggregations.in_stock?.buckets.map(bucket => ({
        name: bucket.key ? 'In Stock' : 'Out of Stock',
        count: bucket.doc_count,
      })) || [];

    // Process price ranges
    const priceRanges =
      aggregations.price_ranges?.buckets.map(bucket => ({
        min: bucket.from || 0,
        max: bucket.to || Number.MAX_VALUE,
        count: bucket.doc_count,
      })) || [];

    // Get price stats
    const priceStats = aggregations.price_stats;
    const minPrice = priceStats?.min || 0;
    const maxPrice = priceStats?.max || 1000;

    return {
      categories,
      values: tags, // Map tags to values for compatibility
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

  /**
   * Generate facets from search results (legacy method)
   */
  private generateFacetsFromResults(hits: any[]): SearchFacets {
    if (!hits || hits.length === 0) {
      return this.createEmptyFacets();
    }

    // Extract all categories and values from the search results
    const categoriesMap = new Map<string, number>();
    const valuesMap = new Map<string, number>();
    let minPrice = Number.MAX_VALUE;
    let maxPrice = 0;

    hits.forEach(hit => {
      const source = hit._source;

      // Process categories
      if (source.categories && Array.isArray(source.categories)) {
        source.categories.forEach((category: string) => {
          const count = categoriesMap.get(category) || 0;
          categoriesMap.set(category, count + 1);
        });
      }

      // Process values
      if (source.values && Array.isArray(source.values)) {
        source.values.forEach((value: string) => {
          const count = valuesMap.get(value) || 0;
          valuesMap.set(value, count + 1);
        });
      }

      // Process price for min/max
      if (source.price !== undefined) {
        const price = parseFloat(source.price);
        if (!isNaN(price)) {
          minPrice = Math.min(minPrice, price);
          maxPrice = Math.max(maxPrice, price);
        }
      }
    });

    // Convert maps to arrays of facet items
    const categories = Array.from(categoriesMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    const values = Array.from(valuesMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    // Create price ranges
    const priceRange = maxPrice - minPrice;
    const step = priceRange / 4; // Create 4 price ranges

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

  /**
   * Build a filtered search query with facets
   */
  private buildFilteredQuery(
    query: string,
    filters?: FilterOption[],
    rangeFilters?: RangeFilterOption[],
    sort?: SortOption,
    entityType: SearchEntityType = SearchEntityType.PRODUCT,
  ): any {
    // Track which fields are being filtered for post-filter aggregations
    const filteredFields = new Set<string>();
    // Build filter clauses
    const filterClauses = [];

    // Process regular filters
    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        if (filter.values && filter.values.length > 0) {
          // Track which fields are being filtered
          filteredFields.add(filter.field);

          if (filter.exact) {
            // Exact match filter
            filterClauses.push({
              terms: {
                [`${filter.field}.keyword`]: filter.values,
              },
            });
          } else {
            // Fuzzy match filter
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

    // Process range filters
    if (rangeFilters && rangeFilters.length > 0) {
      rangeFilters.forEach(rangeFilter => {
        const rangeQuery: any = {};

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

    // Build the query
    const searchQuery: any = {
      query: {
        bool: {
          // Apply filters
          ...(filterClauses.length > 0 ? { filter: filterClauses } : {}),
          // Add search query if provided
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
      // Add aggregations for faceted search based on entity type
      // Pass filters to support post-filter aggregations
      aggs: this.getAggregationsForEntityType(entityType, filters, rangeFilters),
      // Add highlighting
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

    // Add sorting if provided
    if (sort) {
      searchQuery.sort = { [sort.field]: { order: sort.order } };
    }

    return searchQuery;
  }

  /**
   * Get the field name from an aggregation key
   * This maps aggregation keys to their corresponding field names
   */
  private getFieldNameFromAggKey(aggKey: string): string {
    // Map common aggregation keys to field names
    const aggToFieldMap: Record<string, string> = {
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

  /**
   * Build filter clauses for all filters except the specified field
   * This is used for post-filter aggregations to maintain accurate counts
   */
  private buildFiltersExcept(
    fieldToExclude: string,
    filters?: FilterOption[],
    rangeFilters?: RangeFilterOption[],
  ): any[] {
    const filterClauses = [];

    // Process regular filters, excluding the specified field
    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        if (filter.field !== fieldToExclude && filter.values && filter.values.length > 0) {
          if (filter.exact) {
            // Exact match filter
            filterClauses.push({
              terms: {
                [`${filter.field}.keyword`]: filter.values,
              },
            });
          } else {
            // Fuzzy match filter
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

    // Process range filters, excluding the specified field
    if (rangeFilters && rangeFilters.length > 0) {
      rangeFilters.forEach(rangeFilter => {
        if (rangeFilter.field !== fieldToExclude) {
          const rangeQuery: any = {};

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

  /**
   * Build a faceted search query with proper filter handling
   * This method specifically handles faceted search with multiple filters
   */
  private buildFacetedSearchQuery(
    query: string,
    entityType: SearchEntityType,
    filters?: FilterOption[],
    rangeFilters?: RangeFilterOption[],
    sort?: SortOption,
  ): any {
    // Build the base query
    const searchQuery: any = {
      query: {
        bool: {
          // Start with an empty filter array
          filter: [],
          // Add the search query if provided, otherwise match all
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
      // Add highlighting
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

    // Add aggregations based on entity type
    searchQuery.aggs = this.getAggregationsForEntityType(entityType);

    // Add sorting if provided
    if (sort) {
      searchQuery.sort = { [sort.field]: { order: sort.order } };
    }

    // Process regular filters
    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        if (filter.values && filter.values.length > 0) {
          if (filter.exact) {
            // Exact match filter
            searchQuery.query.bool.filter.push({
              terms: {
                [`${filter.field}.keyword`]: filter.values,
              },
            });
          } else {
            // Fuzzy match filter
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

    // Process range filters
    if (rangeFilters && rangeFilters.length > 0) {
      rangeFilters.forEach(rangeFilter => {
        // Only process if min or max is defined
        if (rangeFilter.min !== undefined || rangeFilter.max !== undefined) {
          const rangeQuery: any = {};

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

  /**
   * Convert filter options to the format expected by ElasticsearchService
   */
  /**
   * Track search in Google Analytics
   */
  private async trackSearchInAnalytics(
    clientId: string,
    searchTerm: string,
    resultCount: number,
    totalResults: number,
    testInfo?: {
      testId: string;
      variantId: string;
    },
    userId?: string,
  ): Promise<void> {
    try {
      await this.googleAnalyticsService.trackSearch(
        clientId,
        searchTerm,
        resultCount,
        testInfo,
        userId,
      );

      // If this is part of an A/B test, track the test impression
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
      // Don't throw - analytics failures shouldn't break the search functionality
    }
  }

  /**
   * Convert filter options to the format expected by ElasticsearchService
   */
  private convertFilters(filters?: FilterOption[], rangeFilters?: RangeFilterOption[]): any {
    const result: any = {};

    // Process regular filters
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

    // Process range filters
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

    // Return undefined if no filters were applied
    return Object.keys(result).length > 0 ? result : undefined;
  }
}
