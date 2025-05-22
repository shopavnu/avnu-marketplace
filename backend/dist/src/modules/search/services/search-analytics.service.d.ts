import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchEventType } from '../graphql/search-event.input';
import { User } from '../../users/entities/user.entity';
export declare class SearchAnalyticsService {
  private readonly elasticsearchService;
  private readonly configService;
  private readonly logger;
  private readonly analyticsIndex;
  private readonly analyticsEnabled;
  constructor(elasticsearchService: ElasticsearchService, configService: ConfigService);
  trackEvent(eventType: SearchEventType, data: Record<string, any>, user?: User): Promise<boolean>;
  trackSearchQuery(query: string, user?: User): Promise<boolean>;
  trackSuggestionClick(
    suggestionText: string,
    originalQuery: string,
    suggestionData: Record<string, any>,
    user?: User,
  ): Promise<boolean>;
  trackSuggestionImpression(query: string, suggestionsCount: number, user?: User): Promise<boolean>;
  trackSearchResultClick(
    resultId: string,
    position: number,
    query: string,
    user?: User,
  ): Promise<boolean>;
  getPopularSearchQueries(
    days?: number,
    limit?: number,
  ): Promise<
    Array<{
      query: string;
      count: number;
    }>
  >;
  createAnalyticsIndexIfNotExists(): Promise<void>;
}
