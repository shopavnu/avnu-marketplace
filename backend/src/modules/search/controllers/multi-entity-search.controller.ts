import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Logger,
  ValidationPipe,
  UsePipes,
  Req,
  DefaultValuePipe,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NlpSearchService } from '../services/nlp-search.service';
import {} from /* SearchResponseType */ '../graphql/search-response.type';
import { SearchOptionsInput } from '../dto/search-options.dto';
import { SearchEntityType } from '../enums/search-entity-type.enum';
import { SearchResponseDto } from '../dto/search-response.dto';
import {
  EnhancedSearchOptionsDto,
  ProductFilterDto,
  MerchantFilterDto,
  BrandFilterDto,
  EntityBoostingDto,
} from '../dto/entity-specific-filters.dto';
// import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { AnalyticsService } from '../../analytics/services/analytics.service';
import { SearchAnalyticsService } from '../../analytics/services/search-analytics.service';
import { EntityFacetGeneratorService } from '../services/entity-facet-generator.service';
import { EntityRelevanceScorerService } from '../services/entity-relevance-scorer.service';
import { Request } from 'express';
import { User } from '../../users/entities/user.entity';

@ApiTags('multi-entity-search')
@Controller('api/multi-search')
export class MultiEntitySearchController {
  private readonly logger = new Logger(MultiEntitySearchController.name);

  constructor(
    private readonly nlpSearchService: NlpSearchService,
    private readonly analyticsService: AnalyticsService,
    private readonly searchAnalyticsService: SearchAnalyticsService,
    private readonly entityFacetGenerator: EntityFacetGeneratorService,
    private readonly entityRelevanceScorer: EntityRelevanceScorerService,
  ) {}

  @Post()
  // @UseGuards(OptionalJwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Enhanced search across products, merchants, and brands with entity-specific filters',
  })
  @ApiBody({ type: EnhancedSearchOptionsDto })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: SearchResponseDto,
  })
  @ApiBearerAuth()
  async enhancedSearch(
    @Body() options: EnhancedSearchOptionsDto,
    @Req() request: Request,
  ): Promise<SearchResponseDto> {
    this.logger.debug(`Enhanced search request: ${JSON.stringify(options)}`);

    // Extract user from request if authenticated
    const user = request.user as User;

    // Convert enhanced options to standard search options
    const searchOptions = this.convertToSearchOptions(options);

    // Perform search
    const results = await this.nlpSearchService.searchAsync(searchOptions, user);

    // Track search analytics
    this.searchAnalyticsService.trackEvent('enhanced_search', {
      query: options.query,
      entityType: searchOptions.entityType,
      productFilters: options.productFilters,
      merchantFilters: options.merchantFilters,
      brandFilters: options.brandFilters,
      entityBoosting: options.entityBoosting,
      enableNlp: options.enableNlp,
      personalized: options.personalized,
      resultCount: results.pagination.total,
      userId: user?.id || null,
      sessionId: request.headers['x-session-id'] as string,
      userAgent: request.headers['user-agent'],
      timestamp: new Date().toISOString(),
      entityDistribution: this.calculateEntityDistribution(results),
      relevanceScores: this.calculateRelevanceScores(results, options.query),
      experimentId: options.experimentId,
    });

    return results;
  }

  /**
   * Calculate entity distribution from search results
   * @param searchResponse Search response
   * @returns Entity distribution
   */
  private calculateEntityDistribution(searchResponse: SearchResponseDto): Record<string, number> {
    const distribution: Record<string, number> = {
      Product: 0,
      Merchant: 0,
      Brand: 0,
    };

    // Count items from each entity type array if it exists
    if (searchResponse.products) {
      distribution['Product'] = searchResponse.products.length;
    }
    if (searchResponse.merchants) {
      distribution['Merchant'] = searchResponse.merchants.length;
    }
    if (searchResponse.brands) {
      distribution['Brand'] = searchResponse.brands.length;
    }

    this.logger.debug(`Calculated entity distribution: ${JSON.stringify(distribution)}`);
    return distribution;
  }

  /**
   * Calculate relevance scores for search results
   * @param searchResponse Search response
   * @param _query Search query
   * @returns Relevance scores
   */
  private calculateRelevanceScores(
    searchResponse: SearchResponseDto,
    _query: string,
  ): Record<string, number> {
    const scores: Record<string, number> = {};

    const processItems = (items: any[] | undefined) => {
      if (items) {
        for (const item of items) {
          if (item && item.id && typeof item.score === 'number') {
            scores[item.id] = item.score;
          }
        }
      }
    };

    // Process each entity type array
    processItems(searchResponse.products);
    processItems(searchResponse.merchants);
    processItems(searchResponse.brands);

    this.logger.debug(`Calculated relevance scores for ${Object.keys(scores).length} items.`);
    return scores;
  }

  @Get('products')
  // @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Enhanced product search with specialized filters' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (0-indexed)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (max 100)' })
  @ApiQuery({
    name: 'enableNlp',
    required: false,
    description: 'Enable natural language processing',
  })
  @ApiQuery({ name: 'personalized', required: false, description: 'Include personalized results' })
  @ApiQuery({
    name: 'categories',
    required: false,
    description: 'Filter by categories (comma-separated)',
  })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)' })
  @ApiQuery({ name: 'values', required: false, description: 'Filter by values (comma-separated)' })
  @ApiQuery({
    name: 'brandIds',
    required: false,
    description: 'Filter by brand IDs (comma-separated)',
  })
  @ApiQuery({
    name: 'merchantIds',
    required: false,
    description: 'Filter by merchant IDs (comma-separated)',
  })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Filter by minimum price' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Filter by maximum price' })
  @ApiQuery({ name: 'minRating', required: false, description: 'Filter by minimum rating' })
  @ApiQuery({ name: 'inStock', required: false, description: 'Filter by product availability' })
  @ApiQuery({ name: 'onSale', required: false, description: 'Filter by products on sale' })
  @ApiQuery({ name: 'colors', required: false, description: 'Filter by colors (comma-separated)' })
  @ApiQuery({ name: 'sizes', required: false, description: 'Filter by sizes (comma-separated)' })
  @ApiQuery({
    name: 'materials',
    required: false,
    description: 'Filter by materials (comma-separated)',
  })
  @ApiResponse({
    status: 200,
    description: 'Product search results',
    type: SearchResponseDto,
  })
  @ApiBearerAuth()
  async enhancedProductSearch(
    @Query('query') query?: string,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('enableNlp', new DefaultValuePipe(false), ParseBoolPipe) enableNlp?: boolean,
    @Query('personalized', new DefaultValuePipe(true), ParseBoolPipe) personalized?: boolean,
    @Query('categories') categoriesStr?: string,
    @Query('tags') tagsStr?: string,
    @Query('values') valuesStr?: string,
    @Query('brandIds') brandIdsStr?: string,
    @Query('merchantIds') merchantIdsStr?: string,
    @Query('minPrice', new DefaultValuePipe(undefined), ParseIntPipe) minPrice?: number,
    @Query('maxPrice', new DefaultValuePipe(undefined), ParseIntPipe) maxPrice?: number,
    @Query('minRating', new DefaultValuePipe(undefined), ParseIntPipe) minRating?: number,
    @Query('inStock', new DefaultValuePipe(undefined), ParseBoolPipe) inStock?: boolean,
    @Query('onSale', new DefaultValuePipe(undefined), ParseBoolPipe) onSale?: boolean,
    @Query('colors') colorsStr?: string,
    @Query('sizes') sizesStr?: string,
    @Query('materials') materialsStr?: string,
    @Req() request?: Request,
  ): Promise<SearchResponseDto> {
    // Parse comma-separated strings into arrays
    const categories = categoriesStr ? categoriesStr.split(',') : undefined;
    const tags = tagsStr ? tagsStr.split(',') : undefined;
    const values = valuesStr ? valuesStr.split(',') : undefined;
    const brandIds = brandIdsStr ? brandIdsStr.split(',') : undefined;
    const merchantIds = merchantIdsStr ? merchantIdsStr.split(',') : undefined;
    const colors = colorsStr ? colorsStr.split(',') : undefined;
    const sizes = sizesStr ? sizesStr.split(',') : undefined;
    const materials = materialsStr ? materialsStr.split(',') : undefined;

    // Create product filter
    const productFilters: ProductFilterDto = Object.assign(new ProductFilterDto(), {
      categories,
      tags,
      values,
      brandIds,
      merchantIds,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      onSale,
      colors,
      sizes,
      materials,
    });

    // Create enhanced search options
    const options: EnhancedSearchOptionsDto = {
      query,
      page,
      limit,
      enableNlp,
      personalized,
      productFilters,
    };

    // Extract user from request if authenticated
    const user = request.user as User;

    // Convert enhanced options to standard search options
    const searchOptions = this.convertToSearchOptions(options);
    searchOptions.entityType = SearchEntityType.PRODUCT;

    // Perform search
    return this.nlpSearchService.searchAsync(searchOptions, user);
  }

  @Get('merchants')
  // @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Enhanced merchant search with specialized filters' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (0-indexed)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (max 100)' })
  @ApiQuery({
    name: 'enableNlp',
    required: false,
    description: 'Enable natural language processing',
  })
  @ApiQuery({ name: 'personalized', required: false, description: 'Include personalized results' })
  @ApiQuery({
    name: 'categories',
    required: false,
    description: 'Filter by categories (comma-separated)',
  })
  @ApiQuery({ name: 'values', required: false, description: 'Filter by values (comma-separated)' })
  @ApiQuery({
    name: 'locations',
    required: false,
    description: 'Filter by locations (comma-separated)',
  })
  @ApiQuery({ name: 'minRating', required: false, description: 'Filter by minimum rating' })
  @ApiQuery({
    name: 'verifiedOnly',
    required: false,
    description: 'Filter by verified merchants only',
  })
  @ApiQuery({ name: 'activeOnly', required: false, description: 'Filter by active merchants only' })
  @ApiQuery({
    name: 'minProductCount',
    required: false,
    description: 'Filter by minimum product count',
  })
  @ApiResponse({
    status: 200,
    description: 'Merchant search results',
    type: SearchResponseDto,
  })
  @ApiBearerAuth()
  async enhancedMerchantSearch(
    @Query('query') query?: string,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('enableNlp', new DefaultValuePipe(false), ParseBoolPipe) enableNlp?: boolean,
    @Query('personalized', new DefaultValuePipe(true), ParseBoolPipe) personalized?: boolean,
    @Query('categories') categoriesStr?: string,
    @Query('values') valuesStr?: string,
    @Query('locations') locationsStr?: string,
    @Query('minRating', new DefaultValuePipe(undefined), ParseIntPipe) minRating?: number,
    @Query('verifiedOnly', new DefaultValuePipe(undefined), ParseBoolPipe) verifiedOnly?: boolean,
    @Query('activeOnly', new DefaultValuePipe(undefined), ParseBoolPipe) activeOnly?: boolean,
    @Query('minProductCount', new DefaultValuePipe(undefined), ParseIntPipe)
    minProductCount?: number,
    @Req() request?: Request,
  ): Promise<SearchResponseDto> {
    // Parse comma-separated strings into arrays
    const categories = categoriesStr ? categoriesStr.split(',') : undefined;
    const values = valuesStr ? valuesStr.split(',') : undefined;
    const locations = locationsStr ? locationsStr.split(',') : undefined;

    // Create merchant filter
    const merchantFilters: MerchantFilterDto = Object.assign(new MerchantFilterDto(), {
      categories,
      values,
      locations,
      minRating,
      verifiedOnly,
      activeOnly,
      minProductCount,
    });

    // Create enhanced search options
    const options: EnhancedSearchOptionsDto = {
      query,
      page,
      limit,
      enableNlp,
      personalized,
      merchantFilters,
    };

    // Extract user from request if authenticated
    const user = request.user as User;

    // Convert enhanced options to standard search options
    const searchOptions = this.convertToSearchOptions(options);
    searchOptions.entityType = SearchEntityType.MERCHANT;

    // Perform search
    return this.nlpSearchService.searchAsync(searchOptions, user);
  }

  @Get('brands')
  // @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Enhanced brand search with specialized filters' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (0-indexed)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (max 100)' })
  @ApiQuery({
    name: 'enableNlp',
    required: false,
    description: 'Enable natural language processing',
  })
  @ApiQuery({ name: 'personalized', required: false, description: 'Include personalized results' })
  @ApiQuery({
    name: 'categories',
    required: false,
    description: 'Filter by categories (comma-separated)',
  })
  @ApiQuery({ name: 'values', required: false, description: 'Filter by values (comma-separated)' })
  @ApiQuery({
    name: 'locations',
    required: false,
    description: 'Filter by locations (comma-separated)',
  })
  @ApiQuery({
    name: 'verifiedOnly',
    required: false,
    description: 'Filter by verified brands only',
  })
  @ApiQuery({ name: 'activeOnly', required: false, description: 'Filter by active brands only' })
  @ApiQuery({
    name: 'minFoundedYear',
    required: false,
    description: 'Filter by minimum founded year',
  })
  @ApiQuery({
    name: 'maxFoundedYear',
    required: false,
    description: 'Filter by maximum founded year',
  })
  @ApiQuery({
    name: 'minProductCount',
    required: false,
    description: 'Filter by minimum product count',
  })
  @ApiResponse({
    status: 200,
    description: 'Brand search results',
    type: SearchResponseDto,
  })
  @ApiBearerAuth()
  async enhancedBrandSearch(
    @Query('query') query?: string,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('enableNlp', new DefaultValuePipe(false), ParseBoolPipe) enableNlp?: boolean,
    @Query('personalized', new DefaultValuePipe(true), ParseBoolPipe) personalized?: boolean,
    @Query('categories') categoriesStr?: string,
    @Query('values') valuesStr?: string,
    @Query('locations') locationsStr?: string,
    @Query('verifiedOnly', new DefaultValuePipe(undefined), ParseBoolPipe) verifiedOnly?: boolean,
    @Query('activeOnly', new DefaultValuePipe(undefined), ParseBoolPipe) activeOnly?: boolean,
    @Query('minFoundedYear', new DefaultValuePipe(undefined), ParseIntPipe) minFoundedYear?: number,
    @Query('maxFoundedYear', new DefaultValuePipe(undefined), ParseIntPipe) maxFoundedYear?: number,
    @Query('minProductCount', new DefaultValuePipe(undefined), ParseIntPipe)
    minProductCount?: number,
    @Req() request?: Request,
  ): Promise<SearchResponseDto> {
    // Parse comma-separated strings into arrays
    const categories = categoriesStr ? categoriesStr.split(',') : undefined;
    const values = valuesStr ? valuesStr.split(',') : undefined;
    const locations = locationsStr ? locationsStr.split(',') : undefined;

    // Create brand filter
    const brandFilters: BrandFilterDto = Object.assign(new BrandFilterDto(), {
      categories,
      values,
      locations,
      verifiedOnly,
      activeOnly,
      minFoundedYear,
      maxFoundedYear,
      minProductCount,
    });

    // Create enhanced search options
    const options: EnhancedSearchOptionsDto = {
      query,
      page,
      limit,
      enableNlp,
      personalized,
      brandFilters,
    };

    // Extract user from request if authenticated
    const user = request.user as User;

    // Convert enhanced options to standard search options
    const searchOptions = this.convertToSearchOptions(options);
    searchOptions.entityType = SearchEntityType.BRAND;

    // Perform search
    return this.nlpSearchService.searchAsync(searchOptions, user);
  }

  @Get('all')
  // @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Enhanced search across all entity types with entity boosting' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (0-indexed)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (max 100)' })
  @ApiQuery({
    name: 'enableNlp',
    required: false,
    description: 'Enable natural language processing',
  })
  @ApiQuery({ name: 'personalized', required: false, description: 'Include personalized results' })
  @ApiQuery({ name: 'productBoost', required: false, description: 'Boost factor for products' })
  @ApiQuery({ name: 'merchantBoost', required: false, description: 'Boost factor for merchants' })
  @ApiQuery({ name: 'brandBoost', required: false, description: 'Boost factor for brands' })
  @ApiResponse({
    status: 200,
    description: 'Multi-entity search results',
    type: SearchResponseDto,
  })
  @ApiBearerAuth()
  async enhancedMultiEntitySearch(
    @Query('query') query?: string,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('enableNlp', new DefaultValuePipe(false), ParseBoolPipe) enableNlp?: boolean,
    @Query('personalized', new DefaultValuePipe(true), ParseBoolPipe) personalized?: boolean,
    @Query('productBoost', new DefaultValuePipe(1.0)) productBoost?: number,
    @Query('merchantBoost', new DefaultValuePipe(1.0)) merchantBoost?: number,
    @Query('brandBoost', new DefaultValuePipe(1.0)) brandBoost?: number,
    @Req() request?: Request,
  ): Promise<SearchResponseDto> {
    // Create entity boosting
    const entityBoosting: EntityBoostingDto = {
      productBoost,
      merchantBoost,
      brandBoost,
    };

    // Create enhanced search options
    const options: EnhancedSearchOptionsDto = {
      query,
      page,
      limit,
      enableNlp,
      personalized,
      entityBoosting,
    };

    // Extract user from request if authenticated
    const user = request.user as User;

    // Convert enhanced options to standard search options
    const searchOptions = this.convertToSearchOptions(options);
    searchOptions.entityType = SearchEntityType.ALL;

    // Perform search
    return this.nlpSearchService.searchAsync(searchOptions, user);
  }

  /**
   * Convert enhanced search options to standard search options
   * @param options Enhanced search options
   * @returns Standard search options
   */
  private convertToSearchOptions(options: EnhancedSearchOptionsDto): SearchOptionsInput {
    const {
      query,
      page,
      limit,
      enableNlp,
      personalized,
      productFilters,
      merchantFilters,
      brandFilters,
      entityBoosting,
      boostByValues,
      includeSponsoredContent,
      experimentId,
    } = options;

    // Initialize filters and range filters
    let filters = [];
    let rangeFilters = [];

    // Add product filters if provided
    if (productFilters) {
      const { filters: pFilters, rangeFilters: pRangeFilters } = productFilters.toGenericFilters();
      filters = [...filters, ...pFilters];
      rangeFilters = [...rangeFilters, ...pRangeFilters];
    }

    // Add merchant filters if provided
    if (merchantFilters) {
      const { filters: mFilters, rangeFilters: mRangeFilters } = merchantFilters.toGenericFilters();
      filters = [...filters, ...mFilters];
      rangeFilters = [...rangeFilters, ...mRangeFilters];
    }

    // Add brand filters if provided
    if (brandFilters) {
      const { filters: bFilters, rangeFilters: bRangeFilters } = brandFilters.toGenericFilters();
      filters = [...filters, ...bFilters];
      rangeFilters = [...rangeFilters, ...bRangeFilters];
    }

    // Create metadata for entity boosting
    const metadata: any = {};
    if (entityBoosting) {
      metadata.entityBoosting = entityBoosting;
    }

    // Create standard search options
    return {
      query,
      entityType: SearchEntityType.ALL, // Default to ALL, can be overridden
      page,
      limit,
      enableNlp,
      personalized,
      filters,
      rangeFilters,
      boostByValues,
      includeSponsoredContent,
      experimentId,
      metadata, // Store entity boosting in metadata
    };
  }
}
