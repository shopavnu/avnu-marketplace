import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { SearchCacheService } from './search-cache.service';
import { SearchExperimentService } from './search-experiment.service';
import { SearchMonitoringService } from './search-monitoring.service';
import { NlpService } from '../../nlp/services/nlp.service';
import { SearchEntityType } from '../enums/search-entity-type.enum';
import { PersonalizationService } from '../../personalization/services/personalization.service';
import { ExperimentAssignmentService } from '../../ab-testing/services/experiment-assignment.service';
import {
  SearchOptionsInput,
  SearchResponseDto,
  PaginationInfo,
  SearchFacets,
  ProductSearchResult,
  MerchantSearchResult,
  BrandSearchResult,
  CategoryFacet,
  ValueFacet,
  PriceFacet,
} from '../dto';
import { User } from '../../users/entities/user.entity';
import { Logger } from '@nestjs/common';

/**
 * Service for handling natural language search queries
 * This service extends search capabilities with NLP processing
 */
@Injectable()
export class NlpSearchService {
  private readonly logger = new Logger(NlpSearchService.name);
  private readonly enableSynonyms: boolean;
  private readonly enableSemanticSearch: boolean;
  private readonly enableQueryExpansion: boolean;
  private readonly enableEntityRecognition: boolean;

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
    private readonly nlpService: NlpService,
    private readonly searchCacheService: SearchCacheService,
    private readonly searchMonitoringService: SearchMonitoringService,
    private readonly personalizationService: PersonalizationService,
    private readonly experimentAssignmentService: ExperimentAssignmentService,
    private readonly searchExperimentService: SearchExperimentService,
  ) {
    this.enableSynonyms = this.configService.get<boolean>('SEARCH_ENABLE_SYNONYMS', true);
    this.enableSemanticSearch = this.configService.get<boolean>('SEARCH_ENABLE_SEMANTIC', true);
    this.enableQueryExpansion = this.configService.get<boolean>(
      'SEARCH_ENABLE_QUERY_EXPANSION',
      true,
    );
    this.enableEntityRecognition = this.configService.get<boolean>(
      'SEARCH_ENABLE_ENTITY_RECOGNITION',
      true,
    );
  }

  /**
   * Get default fields to highlight based on entity type
   * @param entityType The type of entity being searched
   * @returns Array of field names to highlight
   */
  private getDefaultHighlightFields(entityType: SearchEntityType): string[] {
    switch (entityType) {
      case SearchEntityType.PRODUCT:
        return ['title', 'description', 'brandName', 'merchantName', 'categories', 'tags'];
      case SearchEntityType.MERCHANT:
        return ['name', 'description', 'categories', 'values', 'location'];
      case SearchEntityType.BRAND:
        return ['name', 'description', 'categories', 'values', 'location', 'story'];
      default:
        return ['title', 'name', 'description'];
    }
  }

  /**
   * Process highlights from Elasticsearch response
   * @param hit The Elasticsearch hit object
   * @returns Processed highlight result or undefined if no highlights
   */
  private processHighlights(
    hit: any,
  ): { fields: { field: string; snippets: string[] }[]; matchedTerms?: string[] } | undefined {
    if (!hit.highlight) {
      return undefined;
    }

    const fields = [];
    const allTerms = new Set<string>();

    // Process each highlighted field
    for (const [field, snippets] of Object.entries(hit.highlight)) {
      if (Array.isArray(snippets) && snippets.length > 0) {
        fields.push({
          field,
          snippets: snippets as string[],
        });

        // Extract matched terms from snippets
        snippets.forEach((snippet: string) => {
          const matches = snippet.match(/<em>([^<]+)<\/em>/g);
          if (matches) {
            matches.forEach(match => {
              // Extract the term without the tags
              const term = match.replace(/<\/?em>/g, '');
              allTerms.add(term.toLowerCase());
            });
          }
        });
      }
    }

    if (fields.length === 0) {
      return undefined;
    }

    return {
      fields,
      matchedTerms: Array.from(allTerms),
    };
  }

  async searchAsync(
    options: SearchOptionsInput,
    user?: User,
    sessionId?: string,
  ): Promise<SearchResponseDto> {
    const startTime = Date.now();
    this.logger.log(`Starting searchAsync with query: "${options.query}"`, 'NlpSearchService');

    const {
      query,
      page = 0,
      limit = 20,
      entityType = SearchEntityType.PRODUCT,
      filters,
      sort,
      enableNlp = false,
    } = options;

    const nlpResult = enableNlp
      ? await this.processQuery(query, user, sessionId)
      : { processedQuery: query, entities: {}, intent: 'search', expandedTerms: [] };

    // Build the Elasticsearch query with personalization
    const esQuery = await this.buildElasticsearchQuery(
      nlpResult.processedQuery,
      { page, limit, filters, sort, entityType },
      entityType,
      user,
      sessionId,
    );

    let searchResults: any;
    try {
      // Use the query directly as the body parameter
      searchResults = await this.elasticsearchService.search({
        index: this.getIndexForEntityType(entityType),
        body: esQuery,
      });
    } catch (error) {
      this.logger.error(`Elasticsearch error: ${error.message}`, error.stack, 'NlpSearchService');
      throw new HttpException('Search failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    let responseData: Partial<SearchResponseDto> = {
      // Add highlighting flag to the response
      highlightsEnabled: options.enableHighlighting || false,
    };

    switch (entityType) {
      case SearchEntityType.PRODUCT:
        const {
          products,
          pagination: prodPagination,
          facets: prodFacets,
        } = this.transformProductSearchResults(
          searchResults,
          page,
          limit,
          options.enableHighlighting,
        );
        responseData = {
          ...responseData,
          products,
          pagination: prodPagination,
          facets: prodFacets,
        };
        break;
      case SearchEntityType.MERCHANT:
        const {
          merchants,
          pagination: merchPagination,
          facets: merchFacets,
        } = this.transformMerchantSearchResults(
          searchResults,
          page,
          limit,
          options.enableHighlighting,
        );
        responseData = {
          ...responseData,
          merchants,
          pagination: merchPagination,
          facets: merchFacets,
        };
        break;
      case SearchEntityType.BRAND:
        const {
          brands,
          pagination: brandPagination,
          facets: brandFacets,
        } = this.transformBrandSearchResults(
          searchResults,
          page,
          limit,
          options.enableHighlighting,
        );
        responseData = {
          ...responseData,
          brands,
          pagination: brandPagination,
          facets: brandFacets,
        };
        break;
      default:
        this.logger.warn(
          `Unsupported entity type for searchAsync: ${entityType}`,
          'NlpSearchService',
        );
        const {
          products: defProducts,
          pagination: defPagination,
          facets: defFacets,
        } = this.transformProductSearchResults(searchResults, page, limit);
        responseData = { products: defProducts, pagination: defPagination, facets: defFacets };
    }

    const duration = Date.now() - startTime;

    const finalResponse: SearchResponseDto = {
      query: query,
      processedQuery: nlpResult.processedQuery,
      pagination: responseData.pagination,
      facets: responseData.facets,
      products: responseData.products,
      merchants: responseData.merchants,
      brands: responseData.brands,
      usedNlp: enableNlp,
    };

    this.logger.log(
      `Finished searchAsync for query: "${options.query}" in ${duration}ms`,
      'NlpSearchService',
    );
    return finalResponse;
  }

  private async processQuery(
    query: string,
    _user?: User,
    _sessionId?: string, // Prefixed with underscore as it's unused
  ): Promise<{
    processedQuery: string;
    entities: Record<string, string[]>;
    intent: string;
    expandedTerms: string[];
  }> {
    this.logger.debug(`Placeholder processQuery called for: "${query}"`, 'NlpSearchService');
    return {
      processedQuery: query,
      entities: {},
      intent: 'search',
      expandedTerms: [],
    };
  }

  private async buildElasticsearchQuery(
    query: string,
    options: Partial<SearchOptionsInput>,
    entityType: SearchEntityType,
    user?: User,
    sessionId?: string,
  ): Promise<Record<string, any>> {
    this.logger.debug(
      `Building Elasticsearch query for: "${query}" with${sessionId ? ' session-based' : ''} personalization`,
      'NlpSearchService',
    );

    const queryConditions = query ? [{ match: { name: query } }] : [];
    const filterConditions = [];
    const sortOptions = options.sort ? [options.sort] : [{ _score: 'desc' }];

    // Apply personalization if user is authenticated
    let personalizedParams = {};
    if (user?.id) {
      try {
        // Get personalized search parameters with session context if available
        personalizedParams = await this.personalizationService.generatePersonalizedSearchParams(
          user.id,
          query,
          sessionId,
        );

        this.logger.debug(
          `Applied ${sessionId ? 'session-based' : 'standard'} personalization for user ${user.id}`,
          'NlpSearchService',
        );
      } catch (error) {
        this.logger.error(`Failed to apply personalization: ${error.message}`, 'NlpSearchService');
      }
    }

    // Start building the Elasticsearch query
    let mainQuery: any = {
      bool: {
        must: queryConditions,
        filter: filterConditions,
      },
    };

    // Apply personalization boosting if available
    if (personalizedParams && Object.keys(personalizedParams).length > 0) {
      // Check if we have session data for personalization
      const personalizedParamsTyped = personalizedParams as {
        session?: { weights?: Record<string, any>; weightFactors?: Record<string, number> };
      };
      const sessionData = personalizedParamsTyped.session;
      const hasSessionWeights =
        sessionData && sessionData.weights && Object.keys(sessionData.weights).length > 0;

      if (hasSessionWeights) {
        this.logger.debug(
          `Applying session-based boosting for session ${sessionId}`,
          'NlpSearchService',
        );

        // Convert main query to function score query to apply boosting
        mainQuery = {
          function_score: {
            query: mainQuery,
            functions: [],
            score_mode: 'sum',
            boost_mode: 'sum',
          },
        };

        // Add entity boosting from session weights
        const entityWeights = sessionData.weights.entities || {};
        const entityIds = Object.keys(entityWeights);

        if (entityIds.length > 0) {
          // Add a function for each entity to boost
          entityIds.forEach(entityId => {
            const weight = entityWeights[entityId] * (sessionData.weightFactors?.entities || 1.0);

            if (weight > 0) {
              mainQuery.function_score.functions.push({
                filter: { term: { id: entityId } },
                weight: weight,
              });
            }
          });
        }

        // Add category boosting from session weights
        const categoryWeights = sessionData.weights.categories || {};
        const categories = Object.keys(categoryWeights);

        if (categories.length > 0) {
          // Add a function for each category to boost
          categories.forEach(category => {
            const weight =
              categoryWeights[category] * (sessionData.weightFactors?.categories || 0.8);

            if (weight > 0) {
              mainQuery.function_score.functions.push({
                filter: { term: { categories: category } },
                weight: weight,
              });
            }
          });
        }

        // Add brand boosting from session weights
        const brandWeights = sessionData.weights.brands || {};
        const brands = Object.keys(brandWeights);

        if (brands.length > 0 && entityType !== SearchEntityType.BRAND) {
          // Add a function for each brand to boost
          brands.forEach(brand => {
            const weight = brandWeights[brand] * (sessionData.weightFactors?.brands || 0.8);

            if (weight > 0) {
              mainQuery.function_score.functions.push({
                filter: { term: { brandName: brand } },
                weight: weight,
              });
            }
          });
        }
      }
    }

    // Construct the final Elasticsearch query
    const esQuery: any = {
      query: mainQuery,
      sort: sortOptions,
      aggs: this.buildAggregations(entityType),
    };

    if (options.enableHighlighting) {
      const highlightFields = options.highlightFields || this.getDefaultHighlightFields(entityType);
      const preTag = options.highlightPreTag || '<em>';
      const postTag = options.highlightPostTag || '</em>';
      const fragmentSize = options.highlightFragmentSize || 150;

      esQuery.highlight = {
        pre_tags: [preTag],
        post_tags: [postTag],
        fields: {},
        fragment_size: fragmentSize,
        number_of_fragments: 3,
        require_field_match: false,
      };

      highlightFields.forEach(field => {
        esQuery.highlight.fields[field] = {};
      });
    }

    esQuery.size = options.limit ?? 20;
    esQuery.from = (options.page ?? 0) * (options.limit ?? 20);

    return esQuery;
  }

  private buildAggregations(entityType: SearchEntityType): any {
    this.logger.debug(
      `Placeholder buildAggregations called for type: ${entityType}`,
      'NlpSearchService',
    );
    return {
      categories: { terms: { field: 'categories', size: 20 } },
      values: { terms: { field: 'values', size: 20 } },
    };
  }

  private getIndexForEntityType(entityType: SearchEntityType): string {
    switch (entityType) {
      case SearchEntityType.PRODUCT:
        return this.configService.get<string>('ELASTICSEARCH_PRODUCT_INDEX', 'products');
      case SearchEntityType.MERCHANT:
        return this.configService.get<string>('ELASTICSEARCH_MERCHANT_INDEX', 'merchants');
      case SearchEntityType.BRAND:
        return this.configService.get<string>('ELASTICSEARCH_BRAND_INDEX', 'brands');
      default:
        this.logger.warn(`Unknown entity type for index: ${entityType}`, 'NlpSearchService');
        return this.configService.get<string>('ELASTICSEARCH_PRODUCT_INDEX', 'products');
    }
  }

  async searchProducts(
    query: string,
    options: Partial<SearchOptionsInput> = {},
    _user?: User,
  ): Promise<Pick<SearchResponseDto, 'products' | 'pagination' | 'facets'>> {
    const startTime = Date.now();
    const { page = 0, limit = 20, filters, sort } = options;
    this.logger.log(`Starting searchProducts with query: "${query}"`, 'NlpSearchService');

    // Build the Elasticsearch query with personalization
    const esQuery = await this.buildElasticsearchQuery(
      query,
      { page, limit, filters, sort, entityType: SearchEntityType.PRODUCT },
      SearchEntityType.PRODUCT,
      _user,
    );

    let results: any;
    try {
      results = await this.elasticsearchService.search({
        index: this.getIndexForEntityType(SearchEntityType.PRODUCT),
        body: esQuery,
      });
    } catch (error) {
      this.logger.error(
        `Elasticsearch error in searchProducts: ${error.message}`,
        error.stack,
        'NlpSearchService',
      );
      throw new HttpException('Product search failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const { products, pagination, facets } = this.transformProductSearchResults(
      results,
      page,
      limit,
    );

    const duration = Date.now() - startTime;
    this.logger.log(
      `Finished searchProducts for query: "${query}" in ${duration}ms`,
      'NlpSearchService',
    );

    return { products, pagination, facets };
  }

  async searchMerchants(
    query: string,
    options: Partial<SearchOptionsInput> = {},
    _user?: User,
  ): Promise<Pick<SearchResponseDto, 'merchants' | 'pagination' | 'facets'>> {
    const startTime = Date.now();
    const { page = 0, limit = 20, filters, sort } = options;
    this.logger.log(`Starting searchMerchants with query: "${query}"`, 'NlpSearchService');

    // Build the Elasticsearch query with personalization
    const esQuery = await this.buildElasticsearchQuery(
      query,
      { page, limit, filters, sort, entityType: SearchEntityType.MERCHANT },
      SearchEntityType.MERCHANT,
      _user,
    );

    let results: any;
    try {
      results = await this.elasticsearchService.search({
        index: this.getIndexForEntityType(SearchEntityType.MERCHANT),
        body: esQuery,
      });
    } catch (error) {
      this.logger.error(
        `Elasticsearch error in searchMerchants: ${error.message}`,
        error.stack,
        'NlpSearchService',
      );
      throw new HttpException('Merchant search failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const { merchants, pagination, facets } = this.transformMerchantSearchResults(
      results,
      page,
      limit,
    );

    const duration = Date.now() - startTime;
    this.logger.log(
      `Finished searchMerchants for query: "${query}" in ${duration}ms`,
      'NlpSearchService',
    );

    return { merchants, pagination, facets };
  }

  async searchBrands(
    query: string,
    options: Partial<SearchOptionsInput> = {},
    _user?: User,
  ): Promise<Pick<SearchResponseDto, 'brands' | 'pagination' | 'facets'>> {
    const startTime = Date.now();
    const { page = 0, limit = 20, filters, sort } = options;
    this.logger.log(`Starting searchBrands with query: "${query}"`, 'NlpSearchService');

    // Build the Elasticsearch query with personalization
    const esQuery = await this.buildElasticsearchQuery(
      query,
      { page, limit, filters, sort, entityType: SearchEntityType.BRAND },
      SearchEntityType.BRAND,
      _user,
    );

    let results: any;
    try {
      results = await this.elasticsearchService.search({
        index: this.getIndexForEntityType(SearchEntityType.BRAND),
        body: esQuery,
      });
    } catch (error) {
      this.logger.error(
        `Elasticsearch error in searchBrands: ${error.message}`,
        error.stack,
        'NlpSearchService',
      );
      throw new HttpException('Brand search failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const { brands, pagination, facets } = this.transformBrandSearchResults(results, page, limit);

    const duration = Date.now() - startTime;
    this.logger.log(
      `Finished searchBrands for query: "${query}" in ${duration}ms`,
      'NlpSearchService',
    );

    return { brands, pagination, facets };
  }

  private transformFacets(aggregations: any): SearchFacets {
    this.logger.warn('Facet transformation not fully implemented yet.', 'NlpSearchService');

    const categories: CategoryFacet[] =
      aggregations?.categories?.buckets?.map((bucket: any) => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) ?? [];

    const values: ValueFacet[] =
      aggregations?.values?.buckets?.map((bucket: any) => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) ?? [];

    const price: PriceFacet | undefined = undefined;

    return {
      categories,
      values,
      price,
    };
  }

  private transformMerchantSearchResults(
    results: any,
    page: number,
    limit: number,
    enableHighlighting: boolean = false,
  ): Pick<SearchResponseDto, 'merchants' | 'pagination' | 'facets'> {
    if (!results || !results.hits) {
      const defaultPagination: PaginationInfo = {
        total: 0,
        page: page,
        limit: limit,
        totalPages: 0,
        pages: 0,
        hasNext: false,
        hasPrevious: false,
      };
      const defaultFacets: SearchFacets = { categories: [], values: [], price: undefined };
      return { merchants: [], pagination: defaultPagination, facets: defaultFacets };
    }

    const total = results.hits.total?.value ?? 0;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    const pagination: PaginationInfo = {
      total: total,
      page: page,
      limit: limit,
      totalPages: totalPages,
      pages: totalPages,
      hasNext: page < totalPages - 1,
      hasPrevious: page > 0,
    };

    const merchants: MerchantSearchResult[] =
      results.hits.hits?.map((hit: any) => {
        const source = hit._source;

        // Process highlights if enabled
        const highlights = enableHighlighting ? this.processHighlights(hit) : undefined;

        return {
          id: hit._id,
          name: source?.name ?? '',
          description: source?.description ?? '',
          logo: source?.logo ?? '',
          heroImage: source?.heroImage ?? '',
          location: source?.location ?? '',
          categories: source?.categories ?? [],
          values: source?.values ?? [],
          rating: source?.rating ?? 0,
          reviewCount: source?.reviewCount ?? 0,
          isSponsored: source?.isSponsored ?? false,
          score: hit._score ?? 0,
          highlights: highlights,
        };
      }) ?? [];

    const facets: SearchFacets = this.transformFacets(results.aggregations);

    return {
      merchants,
      pagination,
      facets,
    };
  }

  private transformBrandSearchResults(
    results: any,
    page: number,
    limit: number,
    enableHighlighting: boolean = false,
  ): Pick<SearchResponseDto, 'brands' | 'pagination' | 'facets'> {
    if (!results || !results.hits) {
      const defaultPagination: PaginationInfo = {
        total: 0,
        page: page,
        limit: limit,
        totalPages: 0,
        pages: 0,
        hasNext: false,
        hasPrevious: false,
      };
      const defaultFacets: SearchFacets = { categories: [], values: [], price: undefined };
      return { brands: [], pagination: defaultPagination, facets: defaultFacets };
    }

    const total = results.hits.total?.value ?? 0;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    const pagination: PaginationInfo = {
      total: total,
      page: page,
      limit: limit,
      totalPages: totalPages,
      pages: totalPages,
      hasNext: page < totalPages - 1,
      hasPrevious: page > 0,
    };

    const brands: BrandSearchResult[] =
      results.hits.hits?.map((hit: any) => {
        const source = hit._source;

        // Process highlights if enabled
        const highlights = enableHighlighting ? this.processHighlights(hit) : undefined;

        return {
          id: hit._id,
          name: source?.name ?? '',
          description: source?.description ?? '',
          logo: source?.logo ?? '',
          heroImage: source?.heroImage ?? '',
          location: source?.location ?? '',
          categories: source?.categories ?? [],
          values: source?.values ?? [],
          foundedYear: source?.foundedYear ?? undefined,
          isSponsored: source?.isSponsored ?? false,
          score: hit._score ?? 0,
          highlights: highlights,
        };
      }) ?? [];

    const facets: SearchFacets = this.transformFacets(results.aggregations);

    return {
      brands,
      pagination,
      facets,
    };
  }

  private transformProductSearchResults(
    results: any,
    page: number,
    limit: number,
    enableHighlighting: boolean = false,
  ): Pick<SearchResponseDto, 'products' | 'pagination' | 'facets'> {
    this.logger.debug(
      `Transforming product search results for page ${page}, limit ${limit}`,
      'NlpSearchService',
    );

    // Default response for invalid results
    if (!results || !results.hits) {
      this.logger.warn(
        'Invalid or empty Elasticsearch results received for products.',
        'NlpSearchService',
      );
      const defaultPagination: PaginationInfo = {
        total: 0,
        page: page,
        limit: limit,
        totalPages: 0,
        pages: 0,
        hasNext: false,
        hasPrevious: false,
      };
      const defaultFacets: SearchFacets = { categories: [], values: [], price: undefined };
      return { products: [], pagination: defaultPagination, facets: defaultFacets };
    }

    // Calculate pagination
    const total = results.hits.total?.value ?? 0;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
    const pagination: PaginationInfo = {
      total: total,
      page: page,
      limit: limit,
      totalPages: totalPages,
      pages: totalPages,
      hasNext: page < totalPages - 1,
      hasPrevious: page > 0,
    };

    // Map product results
    const products: ProductSearchResult[] =
      results.hits.hits?.map((hit: any) => {
        const source = hit._source;

        // Process highlights if enabled
        const highlights = enableHighlighting ? this.processHighlights(hit) : undefined;

        // Basic structure, can be expanded based on ProductSearchResult DTO
        return {
          id: hit._id,
          title: source?.title ?? 'N/A',
          description: source?.description ?? '',
          price: source?.price ?? 0,
          currency: source?.currency ?? 'USD',
          images: source?.images ?? [],
          merchantId: source?.merchantId ?? '',
          merchantName: source?.merchantName ?? '',
          brandId: source?.brandId ?? '',
          brandName: source?.brandName ?? '',
          categories: source?.categories ?? [],
          values: source?.values ?? [],
          rating: source?.rating ?? 0,
          reviewCount: source?.reviewCount ?? 0,
          isSponsored: source?.isSponsored ?? false,
          score: hit._score ?? 0,
          highlights: highlights,
        };
      }) ?? [];

    // Transform facets
    const facets: SearchFacets = this.transformFacets(results.aggregations);

    this.logger.debug(
      `Transformed ${products.length} products, total: ${total}`,
      'NlpSearchService',
    );
    return { products, pagination, facets };
  }
}
