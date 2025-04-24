import { Logger } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { NlpSearchService } from '../services/nlp-search.service';
import { AnalyticsService } from '../../analytics/services/analytics.service';
import { PersonalizationService } from '../../personalization/services/personalization.service';
import { CursorSearchResponseType } from '../graphql/cursor-search-response.type';
export declare class CursorSearchResolver {
    private readonly logger;
    private readonly nlpSearchService;
    private readonly analyticsService;
    private readonly personalizationService;
    constructor(logger: Logger, nlpSearchService: NlpSearchService, analyticsService: AnalyticsService, personalizationService: PersonalizationService);
    private transformFacets;
    private generateCursor;
    private decodeCursor;
    cursorSearch(query?: string, cursor?: string, limit?: number, sessionId?: string, user?: User): Promise<CursorSearchResponseType>;
}
