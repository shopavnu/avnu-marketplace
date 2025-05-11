import { Logger } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { NlpSearchService } from '../services/nlp-search.service';
import { AnalyticsService } from '../../analytics/services/analytics.service';
import { EnhancedSearchInput } from '../graphql/entity-specific-filters.input';
import { SearchResponseType } from '../graphql/search-response.type';
import { PersonalizationService } from '../../personalization/services/personalization.service';
export declare class MultiEntitySearchResolver {
  private readonly logger;
  private readonly nlpSearchService;
  private readonly analyticsService;
  private readonly personalizationService;
  constructor(
    logger: Logger,
    nlpSearchService: NlpSearchService,
    analyticsService: AnalyticsService,
    personalizationService: PersonalizationService,
  );
  private transformFacets;
  multiEntitySearch(input: EnhancedSearchInput, user?: User): Promise<SearchResponseType>;
}
