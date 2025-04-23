import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchEventType } from '../graphql/search-event.input';
import { User } from '../../users/entities/user.entity';

/**
 * Service for tracking and analyzing search-related events
 */
@Injectable()
export class SearchAnalyticsService {
  private readonly logger = new Logger(SearchAnalyticsService.name);
  private readonly analyticsIndex: string;
  private readonly analyticsEnabled: boolean;

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
  ) {
    this.analyticsIndex = this.configService.get<string>(
      'ELASTICSEARCH_ANALYTICS_INDEX',
      'search_analytics',
    );
    this.analyticsEnabled = this.configService.get<boolean>('SEARCH_ANALYTICS_ENABLED', true);
  }

  /**
   * Track a search-related event
   * @param eventType Type of search event
   * @param data Event data
   * @param user Optional user who triggered the event
   */
  async trackEvent(
    eventType: SearchEventType,
    data: Record<string, any>,
    user?: User,
  ): Promise<boolean> {
    if (!this.analyticsEnabled) {
      this.logger.debug(`Search analytics disabled, not tracking event: ${eventType}`);
      return true;
    }

    try {
      const timestamp = new Date().toISOString();

      const eventDocument = {
        eventType,
        timestamp,
        data,
        userId: user?.id || null,
        isAuthenticated: !!user,
        sessionId: data.sessionId || null,
      };

      await this.elasticsearchService.index({
        index: this.analyticsIndex,
        body: eventDocument,
      });

      this.logger.debug(`Tracked search event: ${eventType}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to track search event: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Track a search query event
   */
  async trackSearchQuery(query: string, user?: User): Promise<boolean> {
    return this.trackEvent(SearchEventType.SEARCH_QUERY, { query }, user);
  }

  /**
   * Track when a user clicks on a search suggestion
   */
  async trackSuggestionClick(
    suggestionText: string,
    originalQuery: string,
    suggestionData: Record<string, any>,
    user?: User,
  ): Promise<boolean> {
    return this.trackEvent(
      SearchEventType.SUGGESTION_CLICK,
      {
        suggestionText,
        originalQuery,
        ...suggestionData,
      },
      user,
    );
  }

  /**
   * Track when search suggestions are shown to the user
   */
  async trackSuggestionImpression(
    query: string,
    suggestionsCount: number,
    user?: User,
  ): Promise<boolean> {
    return this.trackEvent(
      SearchEventType.SUGGESTION_IMPRESSION,
      {
        query,
        suggestionsCount,
      },
      user,
    );
  }

  /**
   * Track when a user clicks on a search result
   */
  async trackSearchResultClick(
    resultId: string,
    position: number,
    query: string,
    user?: User,
  ): Promise<boolean> {
    return this.trackEvent(
      SearchEventType.SEARCH_RESULT_CLICK,
      {
        resultId,
        position,
        query,
      },
      user,
    );
  }

  /**
   * Get popular search queries for a given time period
   * @param days Number of days to look back
   * @param limit Maximum number of results to return
   */
  async getPopularSearchQueries(
    days = 7,
    limit = 10,
  ): Promise<Array<{ query: string; count: number }>> {
    if (!this.analyticsEnabled) {
      this.logger.debug('Search analytics disabled, returning empty popular queries');
      return [];
    }

    try {
      const now = new Date();
      const startDate = new Date();
      startDate.setDate(now.getDate() - days);

      const response = await this.elasticsearchService.search({
        index: this.analyticsIndex,
        size: 0,
        query: {
          bool: {
            must: [
              { term: { eventType: SearchEventType.SEARCH_QUERY } },
              {
                range: {
                  timestamp: {
                    gte: startDate.toISOString(),
                    lte: now.toISOString(),
                  },
                },
              },
            ],
          },
        },
        aggs: {
          popular_queries: {
            terms: {
              field: 'data.query.keyword',
              size: limit,
            },
          },
        },
      });

      // Handle the aggregation response safely with type checking
      const popularQueries = response.aggregations?.popular_queries as any;
      const buckets = popularQueries?.buckets || [];

      return buckets.map((bucket: any) => ({
        query: bucket.key,
        count: bucket.doc_count,
      }));
    } catch (error) {
      this.logger.error(`Failed to get popular search queries: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * Create the analytics index if it doesn't exist
   */
  async createAnalyticsIndexIfNotExists(): Promise<void> {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.analyticsIndex,
      });

      if (indexExists) {
        this.logger.log(`Analytics index ${this.analyticsIndex} already exists`);
        return;
      }

      await this.elasticsearchService.indices.create({
        index: this.analyticsIndex,
        body: {
          mappings: {
            properties: {
              eventType: { type: 'keyword' },
              timestamp: { type: 'date' },
              data: {
                type: 'object',
                properties: {
                  query: { type: 'text', fields: { keyword: { type: 'keyword' } } },
                  suggestionText: { type: 'text', fields: { keyword: { type: 'keyword' } } },
                  originalQuery: { type: 'text', fields: { keyword: { type: 'keyword' } } },
                  suggestionCategory: { type: 'keyword' },
                  suggestionType: { type: 'keyword' },
                  isPopular: { type: 'boolean' },
                  isPersonalized: { type: 'boolean' },
                  resultId: { type: 'keyword' },
                  position: { type: 'integer' },
                  suggestionsCount: { type: 'integer' },
                },
              },
              userId: { type: 'keyword' },
              isAuthenticated: { type: 'boolean' },
              sessionId: { type: 'keyword' },
            },
          },
          settings: {
            number_of_shards: 1,
            number_of_replicas: 1,
          },
        },
      });

      this.logger.log(`Created analytics index ${this.analyticsIndex}`);
    } catch (error) {
      this.logger.error(`Failed to create analytics index: ${error.message}`, error.stack);
    }
  }
}
