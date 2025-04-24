import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchSuggestionInput } from '../graphql/search-suggestion.input';
import {
  SearchSuggestionType,
  SearchSuggestionsResponseType,
} from '../graphql/search-suggestion.type';
import { User } from '../../users/entities/user.entity';
import { PersonalizationService } from '../../personalization/services/personalization.service';
import { SearchAnalyticsService } from './search-analytics.service';

@Injectable()
export class SearchSuggestionService {
  private readonly logger = new Logger(SearchSuggestionService.name);
  private readonly suggestionIndex: string;
  private readonly maxSuggestions: number;
  private readonly defaultLimit: number = 10;
  private readonly isFeatureEnabled: boolean = true;

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
    private readonly personalizationService: PersonalizationService,
    private readonly searchAnalyticsService: SearchAnalyticsService,
  ) {
    this.suggestionIndex = this.configService.get<string>(
      'ELASTICSEARCH_SUGGESTION_INDEX',
      'suggestions',
    );
    this.maxSuggestions = this.configService.get<number>('MAX_SUGGESTIONS', 20);
  }

  /**
   * Get search suggestions based on input parameters
   */
  async getSuggestions(
    input: SearchSuggestionInput,
    user?: User,
  ): Promise<SearchSuggestionsResponseType> {
    const {
      query,
      limit = this.defaultLimit,
      includePopular = true,
      includePersonalized = true,
    } = input;

    // Return empty results for queries that are too short
    if (!query || query.length < 2) {
      this.logger.debug('Query too short, returning empty results');
      return {
        suggestions: [],
        total: 0,
        isPersonalized: false,
        originalQuery: query,
      };
    }

    try {
      // Get suggestions from different sources
      const prefixSuggestions = await this.getPrefixSuggestions(query, limit);

      // Get popular suggestions if enabled
      const popularSuggestions = includePopular
        ? await this.getPopularSuggestions(query, limit)
        : [];

      // Get personalized suggestions if user is authenticated and feature is enabled
      const personalizedSuggestions =
        includePersonalized && user
          ? await this.getPersonalizedSuggestions(query, user, limit)
          : [];

      // Combine and deduplicate suggestions
      const combinedSuggestions = this.combineAndDeduplicate(
        prefixSuggestions,
        popularSuggestions,
        personalizedSuggestions,
        limit,
      );

      this.logger.debug(`Returning ${combinedSuggestions.length} suggestions`);

      // Track suggestion impression event in analytics
      if (combinedSuggestions.length > 0) {
        this.searchAnalyticsService
          .trackSuggestionImpression(query, combinedSuggestions.length, user)
          .catch(error => {
            this.logger.error(
              `Failed to track suggestion impression: ${error.message}`,
              error.stack,
            );
          });
      }

      return {
        suggestions: combinedSuggestions,
        total: combinedSuggestions.length,
        isPersonalized: personalizedSuggestions.length > 0,
        originalQuery: query,
      };
    } catch (error) {
      this.logger.error(`Error getting suggestions: ${error.message}`, error.stack);
      return {
        suggestions: [],
        total: 0,
        isPersonalized: false,
        originalQuery: query,
      };
    }
  }

  /**
   * Get prefix-based suggestions from Elasticsearch
   * @param query The query prefix
   * @param limit Maximum number of suggestions
   * @returns Array of prefix-based suggestions
   */
  private async getPrefixSuggestions(
    query: string,
    limit: number,
  ): Promise<SearchSuggestionType[]> {
    try {
      // Use the dedicated search suggestions index
      const response = await this.elasticsearchService.search({
        index: 'search_suggestions',
        body: {
          suggest: {
            completion: {
              prefix: query,
              completion: {
                field: 'text.completion',
                size: limit,
                skip_duplicates: true,
                fuzzy: {
                  fuzziness: 1,
                },
              },
            },
          },
        },
      });

      // Process suggestions from the suggestions index
      const options = response.suggest?.completion?.[0]?.options;
      let suggestions = Array.isArray(options) ? options : [];

      // If we don't have enough suggestions, fall back to product/merchant/brand indices
      if (suggestions.length < limit) {
        const fallbackResponse = await this.elasticsearchService.search({
          index: 'products,merchants,brands',
          body: {
            suggest: {
              completion: {
                prefix: query,
                completion: {
                  field: 'name.completion',
                  size: limit - suggestions.length,
                  skip_duplicates: true,
                  fuzzy: {
                    fuzziness: 1,
                  },
                },
              },
            },
          },
        });

        const fallbackOptions = fallbackResponse.suggest?.completion?.[0]?.options;
        if (Array.isArray(fallbackOptions) && fallbackOptions.length > 0) {
          suggestions = [...suggestions, ...fallbackOptions];
        }
      }

      // Map suggestions to a consistent format
      return suggestions.map(option => {
        const source = option._source;
        return {
          text: source.text || source.name,
          score: source.score || source.popularity || 1.0,
          category: source.category,
          type: source.type || option._index.replace(/s$/, ''), // Remove trailing 's' from index name
          isPopular: false,
          isPersonalized: false,
        };
      });
    } catch (error) {
      this.logger.error(
        `Error getting prefix suggestions for "${query}": ${error.message}`,
        error.stack,
        SearchSuggestionService.name,
      );
      return [];
    }
  }

  /**
   * Get popular search suggestions based on search history
   */
  async getPopularSuggestions(query: string, limit: number = 5): Promise<SearchSuggestionType[]> {
    if (!this.isFeatureEnabled || !query || query.length < 2) {
      return [];
    }

    try {
      // Get popular search queries from analytics
      const popularQueries = await this.searchAnalyticsService.getPopularSearchQueries(7, 20);

      // Filter and score popular queries that match the input query
      const matchingQueries = popularQueries
        .filter(item => item.query.toLowerCase().includes(query.toLowerCase()))
        .map(item => ({
          text: item.query,
          score: Math.min(10, 5 + Math.log(item.count)), // Score based on popularity
          category: this.getCategoryFromQuery(item.query),
          type: 'search',
          isPopular: true,
          isPersonalized: false,
        }))
        .slice(0, limit);

      return matchingQueries;
    } catch (error) {
      this.logger.error(`Error getting popular suggestions: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * Get personalized suggestions based on user behavior
   * @param query The query prefix
   * @param userId User ID
   * @param limit Maximum number of suggestions
   * @returns Array of personalized suggestions
   */
  private async getPersonalizedSuggestions(
    query: string,
    user: User,
    limit: number,
  ): Promise<SearchSuggestionType[]> {
    const userId = user.id;
    try {
      // Get personalized suggestions from personalization service
      const personalizedSuggestions = await this.personalizationService.getPersonalizedSuggestions(
        query,
        userId,
        limit,
      );

      return personalizedSuggestions.map(suggestion => ({
        text: suggestion.text,
        score: suggestion.relevance,
        category: suggestion.category,
        type: suggestion.type,
        isPopular: false,
        isPersonalized: true,
      }));
    } catch (error) {
      this.logger.error(
        `Error getting personalized suggestions for user ${userId}: ${error.message}`,
        error.stack,
        SearchSuggestionService.name,
      );
      return [];
    }
  }

  /**
   * Combine and deduplicate suggestions from different sources
   */
  private combineAndDeduplicate(
    prefixSuggestions: SearchSuggestionType[],
    popularSuggestions: SearchSuggestionType[],
    personalizedSuggestions: SearchSuggestionType[],
    limit: number,
  ): SearchSuggestionType[] {
    // Combine all suggestions
    const _allSuggestions = [
      ...prefixSuggestions,
      ...popularSuggestions,
      ...personalizedSuggestions,
    ];

    // Create a map to handle duplicates and prioritize suggestions
    const suggestionMap = new Map<string, SearchSuggestionType>();

    // Process suggestions in order of priority: personalized, popular, prefix
    // This ensures that if the same suggestion appears in multiple sources,
    // we keep the highest priority version
    for (const suggestion of personalizedSuggestions) {
      suggestionMap.set(suggestion.text.toLowerCase(), suggestion);
    }

    for (const suggestion of popularSuggestions) {
      const key = suggestion.text.toLowerCase();
      if (!suggestionMap.has(key) || suggestion.score > suggestionMap.get(key).score) {
        suggestionMap.set(key, suggestion);
      }
    }

    for (const suggestion of prefixSuggestions) {
      const key = suggestion.text.toLowerCase();
      if (!suggestionMap.has(key) || suggestion.score > suggestionMap.get(key).score) {
        suggestionMap.set(key, suggestion);
      }
    }

    // Convert map to array and sort by score
    const combinedSuggestions = Array.from(suggestionMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return combinedSuggestions;
  }

  /**
   * Detect category from query text
   * This is a simple implementation that could be enhanced with NLP
   */
  private getCategoryFromQuery(query: string): string | undefined {
    const lowerQuery = query.toLowerCase();

    // Simple category detection based on keywords
    if (
      lowerQuery.includes('shirt') ||
      lowerQuery.includes('dress') ||
      lowerQuery.includes('cotton')
    ) {
      return 'clothing';
    }

    if (
      lowerQuery.includes('table') ||
      lowerQuery.includes('chair') ||
      lowerQuery.includes('sofa')
    ) {
      return 'furniture';
    }

    if (
      lowerQuery.includes('phone') ||
      lowerQuery.includes('laptop') ||
      lowerQuery.includes('camera')
    ) {
      return 'electronics';
    }

    if (
      lowerQuery.includes('eco') ||
      lowerQuery.includes('sustainable') ||
      lowerQuery.includes('organic')
    ) {
      return 'eco-friendly';
    }

    return undefined;
  }
}
