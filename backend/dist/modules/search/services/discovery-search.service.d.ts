import { ElasticsearchService } from './elasticsearch.service';
import { NaturalLanguageSearchService } from '../../nlp/services/natural-language-search.service';
import { PersonalizationService } from '../../personalization/services/personalization.service';
import { AbTestingService } from '../../ab-testing/services/ab-testing.service';
import { SearchAnalyticsService } from '../../analytics/services/search-analytics.service';
import { SearchOptionsInput } from '../dto/search-options.dto';
import { SearchResponseType } from '../graphql/search-response.type';
export declare class DiscoverySearchService {
  private readonly elasticsearchService;
  private readonly naturalLanguageSearchService;
  private readonly personalizationService;
  private readonly abTestingService;
  private readonly searchAnalyticsService;
  private readonly logger;
  constructor(
    elasticsearchService: ElasticsearchService,
    naturalLanguageSearchService: NaturalLanguageSearchService,
    personalizationService: PersonalizationService,
    abTestingService: AbTestingService,
    searchAnalyticsService: SearchAnalyticsService,
  );
  discoverySearch(
    query: string,
    userId?: string,
    sessionId?: string,
    options?: SearchOptionsInput,
  ): Promise<SearchResponseType>;
  private getEmergingBrandsProducts;
  private getSponsoredProducts;
  getDiscoverySuggestions(query: string, userId?: string, limit?: number): Promise<any>;
  getDiscoveryHomepage(
    userId?: string,
    sessionId?: string,
    options?: SearchOptionsInput,
  ): Promise<any>;
}
