import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { SearchCacheService } from './search-cache.service';
import { SearchExperimentService } from './search-experiment.service';
import { SearchMonitoringService } from './search-monitoring.service';
import { NlpService } from '../../nlp/services/nlp.service';
import { PersonalizationService } from '../../personalization/services/personalization.service';
import { ExperimentAssignmentService } from '../../ab-testing/services/experiment-assignment.service';
import { SearchOptionsInput, SearchResponseDto } from '../dto';
import { User } from '../../users/entities/user.entity';
export declare class NlpSearchService {
  private readonly elasticsearchService;
  private readonly configService;
  private readonly nlpService;
  private readonly searchCacheService;
  private readonly searchMonitoringService;
  private readonly personalizationService;
  private readonly experimentAssignmentService;
  private readonly searchExperimentService;
  private readonly logger;
  private readonly enableSynonyms;
  private readonly enableSemanticSearch;
  private readonly enableQueryExpansion;
  private readonly enableEntityRecognition;
  constructor(
    elasticsearchService: ElasticsearchService,
    configService: ConfigService,
    nlpService: NlpService,
    searchCacheService: SearchCacheService,
    searchMonitoringService: SearchMonitoringService,
    personalizationService: PersonalizationService,
    experimentAssignmentService: ExperimentAssignmentService,
    searchExperimentService: SearchExperimentService,
  );
  private getDefaultHighlightFields;
  private processHighlights;
  searchAsync(
    options: SearchOptionsInput,
    user?: User,
    sessionId?: string,
  ): Promise<SearchResponseDto>;
  private processQuery;
  private buildElasticsearchQuery;
  private buildAggregations;
  private getIndexForEntityType;
  searchProducts(
    query: string,
    options?: Partial<SearchOptionsInput>,
    _user?: User,
  ): Promise<Pick<SearchResponseDto, 'products' | 'pagination' | 'facets'>>;
  searchMerchants(
    query: string,
    options?: Partial<SearchOptionsInput>,
    _user?: User,
  ): Promise<Pick<SearchResponseDto, 'merchants' | 'pagination' | 'facets'>>;
  searchBrands(
    query: string,
    options?: Partial<SearchOptionsInput>,
    _user?: User,
  ): Promise<Pick<SearchResponseDto, 'brands' | 'pagination' | 'facets'>>;
  private transformFacets;
  private transformMerchantSearchResults;
  private transformBrandSearchResults;
  private transformProductSearchResults;
}
