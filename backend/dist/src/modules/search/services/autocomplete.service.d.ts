import { ElasticsearchService } from './elasticsearch.service';
import { SearchAnalyticsService } from '../../analytics/services/search-analytics.service';
import { PersonalizationService } from '../../personalization/services/personalization.service';
import { AbTestingService } from '../../ab-testing/services/ab-testing.service';
export declare class AutocompleteService {
  private readonly elasticsearchService;
  private readonly searchAnalyticsService;
  private readonly personalizationService;
  private readonly abTestingService;
  private readonly logger;
  constructor(
    elasticsearchService: ElasticsearchService,
    searchAnalyticsService: SearchAnalyticsService,
    personalizationService: PersonalizationService,
    abTestingService: AbTestingService,
  );
  getAutocompleteSuggestions(
    query: string,
    userId?: string,
    sessionId?: string,
    options?: {
      limit?: number;
      includeCategories?: boolean;
      includeBrands?: boolean;
      includeValues?: boolean;
      includeTrending?: boolean;
    },
  ): Promise<any>;
  private getProductTitleSuggestions;
  private getCategorySuggestions;
  private getBrandSuggestions;
  private getValueSuggestions;
  private combineSuggestions;
  private calculateRelevanceScore;
  private calculateCompositeScore;
  private highlightMatches;
  trackSuggestionSelection(
    query: string,
    selectedSuggestion: string,
    suggestionType: string,
    userId?: string,
    sessionId?: string,
  ): Promise<void>;
}
