import { NlpSearchService } from '../services/nlp-search.service';
import { SearchOptionsInput } from '../dto/search-options.dto';
import { SearchEntityType } from '../enums/search-entity-type.enum';
import { SearchResponseDto } from '../dto/search-response.dto';
import { AnalyticsService } from '../../analytics/services/analytics.service';
import { Request } from 'express';
export declare class SearchApiController {
  private readonly nlpSearchService;
  private readonly analyticsService;
  private readonly logger;
  constructor(nlpSearchService: NlpSearchService, analyticsService: AnalyticsService);
  search(options: SearchOptionsInput, request: Request): Promise<SearchResponseDto>;
  searchGet(
    query?: string,
    entityType?: SearchEntityType,
    page?: number,
    limit?: number,
    sortString?: string,
    enableNlp?: string,
    personalized?: string,
    request?: Request,
  ): Promise<SearchResponseDto>;
  searchProducts(
    query?: string,
    page?: number,
    limit?: number,
    sortString?: string,
    enableNlp?: string,
    personalized?: string,
    request?: Request,
  ): Promise<SearchResponseDto>;
  searchMerchants(
    query?: string,
    page?: number,
    limit?: number,
    sortString?: string,
    enableNlp?: string,
    personalized?: string,
    request?: Request,
  ): Promise<SearchResponseDto>;
  searchBrands(
    query?: string,
    page?: number,
    limit?: number,
    sortString?: string,
    enableNlp?: string,
    personalized?: string,
    request?: Request,
  ): Promise<SearchResponseDto>;
  processQuery(query: string, request: Request): Promise<any>;
}
