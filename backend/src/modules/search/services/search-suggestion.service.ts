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

    if (!this.isFeatureEnabled || !query || query.length < 2) {
      this.logger.debug('Query too short or feature disabled, returning empty results');
      return {
        suggestions: [],
        total: 0,
        isPersonalized: false,
        originalQuery: query,
      };
    }

    try {
      this.logger.debug(`Getting suggestions for query: "${query}", limit: ${limit}`);

      const promisesToSettle: Promise<SearchSuggestionType[]>[] = [];

      // Prefix Suggestions
      promisesToSettle.push(this.getPrefixSuggestions(query, limit));

      // Popular Suggestions
      if (includePopular) {
        promisesToSettle.push(this.getPopularSuggestions(query, limit));
      } else {
        promisesToSettle.push(Promise.resolve([])); // Placeholder for consistent array length and type
      }

      // Personalized Suggestions
      if (includePersonalized && user) {
        promisesToSettle.push(this.getPersonalizedSuggestions(query, user, limit));
      } else {
        promisesToSettle.push(Promise.resolve([])); // Placeholder for consistent array length and type
      }

      this.logger.debug(
        `DEBUG: getSuggestions - promisesToSettle.length: ${promisesToSettle.length}`,
      );
      const settledResults = await Promise.allSettled(promisesToSettle);

      const prefixPromiseResult: PromiseSettledResult<SearchSuggestionType[]> =
        settledResults.length > 0
          ? settledResults[0]
          : { status: 'rejected', reason: new Error('settledResults[0] is undefined (synthetic)') };

      const popularPromiseResult: PromiseSettledResult<SearchSuggestionType[]> =
        settledResults.length > 1
          ? settledResults[1]
          : { status: 'rejected', reason: new Error('settledResults[1] is undefined (synthetic)') };

      const personalizedPromiseResult: PromiseSettledResult<SearchSuggestionType[]> =
        settledResults.length > 2
          ? settledResults[2]
          : { status: 'rejected', reason: new Error('settledResults[2] is undefined (synthetic)') };

      this.logger.debug(
        `DEBUG: getSuggestions - prefixPromiseResult: ${JSON.stringify(prefixPromiseResult)}`,
      );
      this.logger.debug(
        `DEBUG: getSuggestions - popularPromiseResult: ${JSON.stringify(popularPromiseResult)}`,
      );
      this.logger.debug(
        `DEBUG: getSuggestions - personalizedPromiseResult: ${JSON.stringify(personalizedPromiseResult)}`,
      );

      const prefixSuggestions: SearchSuggestionType[] =
        prefixPromiseResult.status === 'fulfilled' ? prefixPromiseResult.value : [];
      if (prefixPromiseResult.status === 'rejected') {
        this.logger.error(
          `DEBUG: getSuggestions - prefixPromise failed: ${prefixPromiseResult.reason?.message}`,
          prefixPromiseResult.reason?.stack,
        );
      }

      const popularSuggestionsList: SearchSuggestionType[] =
        popularPromiseResult.status === 'fulfilled' ? popularPromiseResult.value : [];
      if (popularPromiseResult.status === 'rejected') {
        this.logger.warn(
          `Failed to get popular suggestions: ${popularPromiseResult.reason?.message}`,
          popularPromiseResult.reason?.stack,
        );
      }

      const personalizedSuggestionsList: SearchSuggestionType[] =
        personalizedPromiseResult.status === 'fulfilled' ? personalizedPromiseResult.value : [];
      if (personalizedPromiseResult.status === 'rejected') {
        // Log the reason if it exists, otherwise a generic message
        const reasonMessage =
          personalizedPromiseResult.reason instanceof Error
            ? personalizedPromiseResult.reason.message
            : String(personalizedPromiseResult.reason);
        const reasonStack =
          personalizedPromiseResult.reason instanceof Error
            ? personalizedPromiseResult.reason.stack
            : undefined;
        this.logger.warn(`Failed to get personalized suggestions: ${reasonMessage}`, reasonStack);
        // Check if the rejection was due to our synthetic error for settledResults[2] being undefined
        if (reasonMessage === 'settledResults[2] is undefined') {
          this.logger.debug(
            'Personalized suggestions were not applicable or the promise was not added.',
          );
        }
      }

      const combinedSuggestions = this.combineAndDeduplicate(
        prefixSuggestions,
        popularSuggestionsList,
        personalizedSuggestionsList,
        limit,
      );

      this.logger.debug(`Returning ${combinedSuggestions.length} suggestions`);

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
        isPersonalized: personalizedSuggestionsList.length > 0,
        originalQuery: query,
      };
    } catch (error) {
      this.logger.error(
        `Error getting suggestions for query "${query}": ${error.message}`,
        error.stack,
      );
      return {
        suggestions: [],
        total: 0,
        isPersonalized: false,
        originalQuery: query,
        error: error.message || 'Unknown error in getSuggestions',
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
      const mappedSuggestions = suggestions.map(option => {
        try {
          if (!option || !option._source) {
            this.logger.warn(
              `Skipping suggestion due to missing option or _source: ${JSON.stringify(option)}`,
            );
            return null; // Mark for filtering
          }
          const source = option._source;
          const text = source.text || source.name;
          const typeFromSource = source.type;
          const indexName = option._index;

          if (text === undefined || text === null) {
            this.logger.warn(`Skipping suggestion due to missing text: ${JSON.stringify(option)}`);
            return null; // Mark for filtering
          }

          return {
            text: String(text), // Ensure text is a string
            score: Number(source.score || source.popularity || 1.0),
            category: source.category || undefined, // Allow category to be undefined if not present
            type: typeFromSource || (indexName ? String(indexName).replace(/s$/, '') : 'unknown'),
            isPopular: false,
            isPersonalized: false,
          };
        } catch (mapError) {
          this.logger.error(
            `Error during suggestion mapping: ${mapError.message}, option: ${JSON.stringify(option)}`,
          );
          return null; // Mark for filtering
        }
      });
      // Filter out any nulls that resulted from mapping errors or invalid data
      const validSuggestions = mappedSuggestions.filter(s => s !== null) as SearchSuggestionType[];
      return Promise.resolve(validSuggestions);
    } catch (error) {
      this.logger.error(`Error getting prefix suggestions for "${query}": ${error.message}`);
      return Promise.resolve([]);
    }
  }

  /**
   * Get popular search suggestions based on search history
   */
  async getPopularSuggestions(query: string, limit: number = 5): Promise<SearchSuggestionType[]> {
    if (!this.isFeatureEnabled || !query || query.length < 2) {
      return Promise.resolve([]);
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
      this.logger.error(`Error getting popular suggestions: ${error.message}`);
      return Promise.resolve([]);
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
      this.logger.debug(
        `DEBUG: getPersonalizedSuggestions - raw suggestions from service: ${JSON.stringify(personalizedSuggestions)}`,
      );

      return personalizedSuggestions.map(suggestion => {
        this.logger.debug(
          `DEBUG: getPersonalizedSuggestions - mapping suggestion: ${JSON.stringify(suggestion)}`,
        );
        return {
          text: suggestion.text,
          score: suggestion.relevance,
          category: suggestion.category,
          type: suggestion.type,
          isPopular: false,
          isPersonalized: true,
        };
      });
    } catch (error) {
      this.logger.error(
        `Error getting personalized suggestions for user ${userId}: ${error.message}`,
        error.stack,
        SearchSuggestionService.name,
      );
      return Promise.resolve([]);
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
