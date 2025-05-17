import { NlpSearchService } from '../services/nlp-search.service';
import { SearchResponseDto } from '../dto/search-response.dto';
import { EnhancedSearchOptionsDto } from '../dto/entity-specific-filters.dto';
import { AnalyticsService } from '../../analytics/services/analytics.service';
import { SearchAnalyticsService } from '../../analytics/services/search-analytics.service';
import { EntityFacetGeneratorService } from '../services/entity-facet-generator.service';
import { EntityRelevanceScorerService } from '../services/entity-relevance-scorer.service';
import { Request } from 'express';
export declare class MultiEntitySearchController {
    private readonly nlpSearchService;
    private readonly analyticsService;
    private readonly searchAnalyticsService;
    private readonly entityFacetGenerator;
    private readonly entityRelevanceScorer;
    private readonly logger;
    constructor(nlpSearchService: NlpSearchService, analyticsService: AnalyticsService, searchAnalyticsService: SearchAnalyticsService, entityFacetGenerator: EntityFacetGeneratorService, entityRelevanceScorer: EntityRelevanceScorerService);
    enhancedSearch(options: EnhancedSearchOptionsDto, request: Request): Promise<SearchResponseDto>;
    private calculateEntityDistribution;
    private calculateRelevanceScores;
    enhancedProductSearch(query?: string, page?: number, limit?: number, enableNlp?: boolean, personalized?: boolean, categoriesStr?: string, tagsStr?: string, valuesStr?: string, brandIdsStr?: string, merchantIdsStr?: string, minPrice?: number, maxPrice?: number, minRating?: number, inStock?: boolean, onSale?: boolean, colorsStr?: string, sizesStr?: string, materialsStr?: string, request?: Request): Promise<SearchResponseDto>;
    enhancedMerchantSearch(query?: string, page?: number, limit?: number, enableNlp?: boolean, personalized?: boolean, categoriesStr?: string, valuesStr?: string, locationsStr?: string, minRating?: number, verifiedOnly?: boolean, activeOnly?: boolean, minProductCount?: number, request?: Request): Promise<SearchResponseDto>;
    enhancedBrandSearch(query?: string, page?: number, limit?: number, enableNlp?: boolean, personalized?: boolean, categoriesStr?: string, valuesStr?: string, locationsStr?: string, verifiedOnly?: boolean, activeOnly?: boolean, minFoundedYear?: number, maxFoundedYear?: number, minProductCount?: number, request?: Request): Promise<SearchResponseDto>;
    enhancedMultiEntitySearch(query?: string, page?: number, limit?: number, enableNlp?: boolean, personalized?: boolean, productBoost?: number, merchantBoost?: number, brandBoost?: number, request?: Request): Promise<SearchResponseDto>;
    private convertToSearchOptions;
}
