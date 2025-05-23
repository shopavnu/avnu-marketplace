import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchSuggestionInput } from '../graphql/search-suggestion.input';
import { SearchSuggestionType, SearchSuggestionsResponseType } from '../graphql/search-suggestion.type';
import { User } from '../../users/entities/user.entity';
import { PersonalizationService } from '../../personalization/services/personalization.service';
import { SearchAnalyticsService } from './search-analytics.service';
export declare class SearchSuggestionService {
    private readonly elasticsearchService;
    private readonly configService;
    private readonly personalizationService;
    private readonly searchAnalyticsService;
    private readonly logger;
    private readonly suggestionIndex;
    private readonly maxSuggestions;
    private readonly defaultLimit;
    private readonly isFeatureEnabled;
    constructor(elasticsearchService: ElasticsearchService, configService: ConfigService, personalizationService: PersonalizationService, searchAnalyticsService: SearchAnalyticsService);
    getSuggestions(input: SearchSuggestionInput, user?: User): Promise<SearchSuggestionsResponseType>;
    private getPrefixSuggestions;
    getPopularSuggestions(query: string, limit?: number): Promise<SearchSuggestionType[]>;
    private getPersonalizedSuggestions;
    private combineAndDeduplicate;
    private getCategoryFromQuery;
}
