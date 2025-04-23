import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';
import { SearchAnalyticsService } from '../../analytics/services/search-analytics.service';
import { PersonalizationService } from '../../personalization/services/personalization.service';
import { AbTestingService } from '../../ab-testing/services/ab-testing.service';
import { ExperimentType } from '../../ab-testing/entities/experiment.entity';

@Injectable()
export class AutocompleteService {
  private readonly logger = new Logger(AutocompleteService.name);

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly searchAnalyticsService: SearchAnalyticsService,
    private readonly personalizationService: PersonalizationService,
    private readonly abTestingService: AbTestingService,
  ) {}

  /**
   * Get autocomplete suggestions for a search query
   *
   * @param query Partial query to get suggestions for
   * @param userId User ID for personalization
   * @param sessionId Session ID
   * @param options Additional options
   */
  async getAutocompleteSuggestions(
    query: string,
    userId?: string,
    sessionId?: string,
    options: {
      limit?: number;
      includeCategories?: boolean;
      includeBrands?: boolean;
      includeValues?: boolean;
      includeTrending?: boolean;
    } = {},
  ): Promise<any> {
    try {
      // Set default options
      const limit = options.limit || 10;
      const includeCategories = options.includeCategories !== false;
      const includeBrands = options.includeBrands !== false;
      const includeValues = options.includeValues !== false;
      const includeTrending = options.includeTrending !== false;

      // Get A/B testing configuration for search suggestions
      const experimentConfig = await this.abTestingService.getVariantConfiguration(
        ExperimentType.SEARCH_ALGORITHM,
        userId,
        sessionId,
      );

      // Default suggestion parameters
      let suggestionParams = {
        productWeight: 1.0,
        categoryWeight: 0.8,
        brandWeight: 0.7,
        valueWeight: 0.9,
        trendingWeight: 0.8,
        personalizedWeight: 1.2,
        fuzzyMatching: true,
        maxFuzzyDistance: 2,
        highlightMatches: true,
      };

      // Override with A/B test configuration if available
      if (experimentConfig && Object.keys(experimentConfig).length > 0) {
        // Find the first active search algorithm experiment
        const experimentId = Object.keys(experimentConfig)[0];
        if (experimentId) {
          const variantConfig = experimentConfig[experimentId];
          if (variantConfig && variantConfig.configuration) {
            // Merge the variant configuration with default params
            suggestionParams = {
              ...suggestionParams,
              ...variantConfig.configuration,
            };

            // Track experiment impression
            await this.abTestingService.trackImpression(variantConfig.assignmentId);
          }
        }
      }

      // Execute parallel requests for different suggestion types
      const [
        productSuggestions,
        categorySuggestions,
        brandSuggestions,
        valueSuggestions,
        trendingSuggestions,
        personalizedSuggestions,
      ] = await Promise.all([
        // 1. Product title suggestions
        this.getProductTitleSuggestions(query, limit, suggestionParams.fuzzyMatching),

        // 2. Category suggestions
        includeCategories
          ? this.getCategorySuggestions(query, Math.ceil(limit / 2), suggestionParams.fuzzyMatching)
          : [],

        // 3. Brand suggestions
        includeBrands
          ? this.getBrandSuggestions(query, Math.ceil(limit / 2), suggestionParams.fuzzyMatching)
          : [],

        // 4. Value suggestions
        includeValues
          ? this.getValueSuggestions(query, Math.ceil(limit / 2), suggestionParams.fuzzyMatching)
          : [],

        // 5. Trending search suggestions
        includeTrending
          ? this.searchAnalyticsService
              .getTopSearchQueries(Math.ceil(limit / 2))
              .then(results => results.map(r => r.query))
          : [],

        // 6. Personalized suggestions
        userId
          ? this.personalizationService
              .generatePersonalizedSearchParams(userId)
              .then(params => params?.behavior?.recentSearches?.map(s => s.query) ?? [])
              .then(queries => queries.slice(0, Math.ceil(limit / 2)))
          : [],
      ]);

      // Combine and deduplicate suggestions
      const combinedSuggestions = this.combineSuggestions(
        query,
        productSuggestions,
        categorySuggestions,
        brandSuggestions,
        valueSuggestions,
        trendingSuggestions,
        personalizedSuggestions,
        suggestionParams,
        limit,
      );

      // Track suggestion impression
      this.searchAnalyticsService
        .trackEvent('autocomplete_impression', {
          query,
          suggestions: combinedSuggestions.map(s => s.text),
          userId,
          sessionId,
        })
        .catch(error => {
          this.logger.error(`Failed to track suggestion impression: ${error.message}`);
        });

      // If this is part of an A/B test, track interaction
      if (experimentConfig && Object.keys(experimentConfig).length > 0) {
        const experimentId = Object.keys(experimentConfig)[0];
        if (experimentId) {
          const variantConfig = experimentConfig[experimentId];
          if (variantConfig) {
            await this.abTestingService.trackInteraction(
              variantConfig.assignmentId,
              'suggestions_viewed',
              {
                query,
                suggestionCount: combinedSuggestions.length,
              },
            );
          }
        }
      }

      return {
        suggestions: combinedSuggestions,
        metadata: {
          productSuggestions: productSuggestions.length,
          categorySuggestions: categorySuggestions.length,
          brandSuggestions: brandSuggestions.length,
          valueSuggestions: valueSuggestions.length,
          trendingSuggestions: trendingSuggestions.length,
          personalizedSuggestions: personalizedSuggestions.length,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get autocomplete suggestions: ${error.message}`);

      // Fallback to basic product suggestions
      const suggestions = await this.elasticsearchService.getProductSuggestions(
        query,
        options.limit || 10,
      );
      return {
        suggestions: suggestions.map(text => ({ text, type: 'product' })),
      };
    }
  }

  /**
   * Get product title suggestions
   */
  private async getProductTitleSuggestions(
    query: string,
    limit: number,
    fuzzyMatching: boolean = true,
  ): Promise<string[]> {
    try {
      const body = {
        size: 0,
        query: {
          bool: {
            must: [
              {
                match_bool_prefix: {
                  title: {
                    query,
                    fuzziness: fuzzyMatching ? 'AUTO' : '0',
                  },
                },
              },
              {
                term: {
                  isActive: true,
                },
              },
            ],
          },
        },
        aggs: {
          title_suggestions: {
            terms: {
              field: 'title.keyword',
              size: limit,
              order: {
                _count: 'desc',
              },
            },
          },
        },
      };
      const response = await this.elasticsearchService.performSearch('products', body);

      return response.aggregations.title_suggestions.buckets.map(bucket => bucket.key);
    } catch (error) {
      this.logger.error(`Failed to get product title suggestions: ${error.message}`);
      return [];
    }
  }

  /**
   * Get category suggestions
   */
  private async getCategorySuggestions(
    query: string,
    limit: number,
    fuzzyMatching: boolean = true,
  ): Promise<string[]> {
    try {
      const body = {
        size: 0,
        query: {
          bool: {
            must: [
              {
                match: {
                  categories: {
                    query,
                    fuzziness: fuzzyMatching ? 'AUTO' : '0',
                  },
                },
              },
              {
                term: {
                  isActive: true,
                },
              },
            ],
          },
        },
        aggs: {
          category_suggestions: {
            terms: {
              field: 'categories.keyword',
              size: limit,
              order: {
                _count: 'desc',
              },
            },
          },
        },
      };
      const response = await this.elasticsearchService.performSearch('products', body);

      return response.aggregations.category_suggestions.buckets.map(bucket => bucket.key);
    } catch (error) {
      this.logger.error(`Failed to get category suggestions: ${error.message}`);
      return [];
    }
  }

  /**
   * Get brand suggestions
   */
  private async getBrandSuggestions(
    query: string,
    limit: number,
    fuzzyMatching: boolean = true,
  ): Promise<string[]> {
    try {
      const body = {
        size: 0,
        query: {
          bool: {
            must: [
              {
                match: {
                  brandName: {
                    query,
                    fuzziness: fuzzyMatching ? 'AUTO' : '0',
                  },
                },
              },
              {
                term: {
                  isActive: true,
                },
              },
            ],
          },
        },
        aggs: {
          brand_suggestions: {
            terms: {
              field: 'brandName.keyword',
              size: limit,
              order: {
                _count: 'desc',
              },
            },
          },
        },
      };
      const response = await this.elasticsearchService.performSearch('products', body);

      return response.aggregations.brand_suggestions.buckets.map(bucket => bucket.key);
    } catch (error) {
      this.logger.error(`Failed to get brand suggestions: ${error.message}`);
      return [];
    }
  }

  /**
   * Get value suggestions
   */
  private async getValueSuggestions(
    query: string,
    limit: number,
    fuzzyMatching: boolean = true,
  ): Promise<string[]> {
    try {
      const body = {
        size: 0,
        query: {
          bool: {
            must: [
              {
                match: {
                  values: {
                    query,
                    fuzziness: fuzzyMatching ? 'AUTO' : '0',
                  },
                },
              },
              {
                term: {
                  isActive: true,
                },
              },
            ],
          },
        },
        aggs: {
          value_suggestions: {
            terms: {
              field: 'values.keyword',
              size: limit,
              order: {
                _count: 'desc',
              },
            },
          },
        },
      };
      const response = await this.elasticsearchService.performSearch('products', body);

      return response.aggregations.value_suggestions.buckets.map(bucket => bucket.key);
    } catch (error) {
      this.logger.error(`Failed to get value suggestions: ${error.message}`);
      return [];
    }
  }

  /**
   * Combine and prioritize suggestions from different sources
   */
  private combineSuggestions(
    query: string,
    productSuggestions: string[],
    categorySuggestions: string[],
    brandSuggestions: string[],
    valueSuggestions: string[],
    trendingSuggestions: string[],
    personalizedSuggestions: string[],
    params: any,
    limit: number,
  ): any[] {
    // Create weighted suggestions
    const weightedSuggestions = [
      // Product suggestions
      ...productSuggestions.map(text => ({
        text,
        type: 'product',
        weight: params.productWeight,
        score: this.calculateRelevanceScore(query, text) * params.productWeight,
      })),

      // Category suggestions
      ...categorySuggestions.map(text => ({
        text,
        type: 'category',
        prefix: 'Category: ',
        weight: params.categoryWeight,
        score: this.calculateRelevanceScore(query, text) * params.categoryWeight,
      })),

      // Brand suggestions
      ...brandSuggestions.map(text => ({
        text,
        type: 'brand',
        prefix: 'Brand: ',
        weight: params.brandWeight,
        score: this.calculateRelevanceScore(query, text) * params.brandWeight,
      })),

      // Value suggestions
      ...valueSuggestions.map(text => ({
        text,
        type: 'value',
        prefix: 'Value: ',
        weight: params.valueWeight,
        score: this.calculateRelevanceScore(query, text) * params.valueWeight,
      })),

      // Trending suggestions
      ...trendingSuggestions.map(text => ({
        text,
        type: 'trending',
        prefix: 'Trending: ',
        weight: params.trendingWeight,
        score: 0.5 * params.trendingWeight, // Lower relevance score but still visible
      })),

      // Personalized suggestions
      ...personalizedSuggestions.map(text => ({
        text,
        type: 'personalized',
        prefix: 'For you: ',
        weight: params.personalizedWeight,
        score: 0.7 * params.personalizedWeight, // Medium relevance score
      })),
    ];

    // Deduplicate by text (case insensitive)
    const seen = new Set<string>();
    const uniqueSuggestions = [];

    for (const suggestion of weightedSuggestions) {
      const lowerText = suggestion.text.toLowerCase();

      if (!seen.has(lowerText)) {
        seen.add(lowerText);
        uniqueSuggestions.push(suggestion);
      }
    }

    // Sort by score
    uniqueSuggestions.sort((a, b) => b.score - a.score);

    // Limit to requested number
    const limitedSuggestions = uniqueSuggestions.slice(0, limit);

    // Add highlighting if enabled
    if (params.highlightMatches) {
      for (const suggestion of limitedSuggestions) {
        suggestion.highlighted = this.highlightMatches(query, suggestion.text);
      }
    }

    // Remove internal properties
    return limitedSuggestions.map(({ _weight, _score, ...suggestion }) => suggestion);
  }

  /**
   * Calculate relevance score for a suggestion based on the query
   */
  private calculateRelevanceScore(query: string, suggestion: string): number {
    if (!query || !suggestion) {
      return 0;
    }

    const queryLower = query.toLowerCase();
    const suggestionLower = suggestion.toLowerCase();

    // Exact match at start is highest score
    if (suggestionLower.startsWith(queryLower)) {
      return 1.0;
    }

    // Word match at start is next highest
    const words = suggestionLower.split(/\s+/);
    if (words.some(word => word.startsWith(queryLower))) {
      return 0.8;
    }

    // Contains match is next
    if (suggestionLower.includes(queryLower)) {
      return 0.6;
    }

    // Partial word match is lowest
    if (words.some(word => word.includes(queryLower))) {
      return 0.4;
    }

    // Default low score for other matches (fuzzy, etc.)
    return 0.2;
  }

  /**
   * Calculate composite score for a suggestion based on the query
   */
  private calculateCompositeScore(item: any, _weight: number, _score: number): number {
    // TODO: Define a proper scoring mechanism based on item type, popularity, recency etc.
    // Placeholder: Use the score from ElasticSearch if available, else default score
    return item.score || 0.5;
  }

  /**
   * Highlight matching parts of the suggestion
   */
  private highlightMatches(query: string, suggestion: string): string {
    if (!query || !suggestion) {
      return suggestion;
    }

    try {
      const queryLower = query.toLowerCase();
      const suggestionText = suggestion;

      // Find the position of the query in the suggestion (case insensitive)
      const startIndex = suggestion.toLowerCase().indexOf(queryLower);

      if (startIndex >= 0) {
        // Extract the matching part with original casing
        const matchingPart = suggestion.substring(startIndex, startIndex + query.length);

        // Replace with highlighted version
        return suggestionText.replace(matchingPart, `<strong>${matchingPart}</strong>`);
      }

      return suggestionText;
    } catch (error) {
      return suggestion;
    }
  }

  /**
   * Track when a user selects a suggestion
   */
  async trackSuggestionSelection(
    query: string,
    selectedSuggestion: string,
    suggestionType: string,
    userId?: string,
    sessionId?: string,
  ): Promise<void> {
    try {
      await this.searchAnalyticsService.trackEvent('autocomplete_selection', {
        query,
        selectedSuggestion,
        suggestionType,
        userId,
        sessionId,
      });
    } catch (error) {
      this.logger.error(`Failed to track suggestion selection: ${error.message}`);
    }
  }
}
