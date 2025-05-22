import { ElasticsearchService } from './elasticsearch.service';
import { NaturalLanguageSearchService } from '../../nlp/services/natural-language-search.service';
import { PersonalizationService } from '../../personalization/services/personalization.service';
export declare class PersonalizedSearchService {
  private readonly elasticsearchService;
  private readonly naturalLanguageSearchService;
  private readonly personalizationService;
  private readonly logger;
  constructor(
    elasticsearchService: ElasticsearchService,
    naturalLanguageSearchService: NaturalLanguageSearchService,
    personalizationService: PersonalizationService,
  );
  personalizedSearch(userId: string, query: string, options?: any): Promise<any>;
  getPersonalizedRecommendations(userId: string, limit?: number): Promise<any>;
  getDiscoveryFeed(userId: string, options?: any): Promise<any>;
  getSimilarProducts(productId: string, userId?: string, limit?: number): Promise<any>;
  private applyValueAlignmentBoost;
}
