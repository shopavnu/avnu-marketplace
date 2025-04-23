import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Logger,
  ValidationPipe,
  UsePipes,
  Req,
  DefaultValuePipe,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NlpSearchService } from '../services/nlp-search.service';
import { SearchOptionsInput, SortOption } from '../dto/search-options.dto';
// FilterOption is not used but kept for reference
import { SearchEntityType } from '../enums/search-entity-type.enum';
import { SearchResponseDto } from '../dto/search-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { AnalyticsService } from '../../analytics/services/analytics.service';
import { Request } from 'express';
import { User } from '../../users/entities/user.entity'; // Ensure User entity is imported

@ApiTags('search-api')
@Controller('api/search')
export class SearchApiController {
  private readonly logger = new Logger(SearchApiController.name);

  constructor(
    private readonly nlpSearchService: NlpSearchService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Search across products, merchants, and brands' })
  @ApiBody({ type: SearchOptionsInput })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: SearchResponseDto,
  })
  @ApiBearerAuth()
  async search(
    @Body() options: SearchOptionsInput,
    @Req() request: Request,
  ): Promise<SearchResponseDto> {
    this.logger.debug(`Search request: ${JSON.stringify(options)}`);

    // Extract user from request if authenticated
    const user = request.user as User;

    // Perform search
    const results = await this.nlpSearchService.searchAsync(options, user);

    // Track search analytics
    this.analyticsService.trackSearch({
      query: options.query,
      filters: options.filters ? JSON.stringify(options.filters) : undefined,
      hasFilters: !!(options.filters && options.filters.length > 0),
      filterCount: options.filters?.length,
      isNlpEnhanced: options.enableNlp,
      isPersonalized: options.personalized,
      resultCount: results.pagination.total,
      userId: user?.id,
      sessionId: request.headers['x-session-id'] as string,
      userAgent: request.headers['user-agent'],
      timestamp: new Date(),
      metadata: {
        page: options.page,
        limit: options.limit,
        sort: options.sort ? JSON.stringify(options.sort) : undefined,
        entityType: options.entityType,
        rangeFilters: options.rangeFilters,
      },
    });

    return results;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search with GET request' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({
    name: 'entityType',
    required: false,
    enum: SearchEntityType,
    description: 'Entity type to search',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (0-indexed)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (max 100)',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'JSON string of sort options (e.g., `[{"field":"createdAt","order":"desc"}]`)',
  })
  @ApiQuery({
    name: 'enableNlp',
    required: false,
    description: 'Enable natural language processing',
  })
  @ApiQuery({
    name: 'personalized',
    required: false,
    description: 'Include personalized results',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: SearchResponseDto,
  })
  @ApiBearerAuth()
  async searchGet(
    @Query('query') query?: string,
    @Query('entityType') entityType?: SearchEntityType,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('sort') sortString?: string,
    @Query('enableNlp') enableNlp?: string,
    @Query('personalized') personalized?: string,
    @Req() request?: Request,
  ): Promise<SearchResponseDto> {
    // Convert query parameters to SearchOptionsInput
    let parsedSort: SortOption[] | undefined;
    if (sortString) {
      try {
        parsedSort = JSON.parse(sortString);
        // Basic validation: ensure it's an array of objects with 'field'
        if (
          !Array.isArray(parsedSort) ||
          !parsedSort.every(s => typeof s === 'object' && s !== null && 'field' in s)
        ) {
          this.logger.warn(`Invalid sort JSON string received (invalid structure): ${sortString}`);
          parsedSort = undefined; // Reset if invalid structure
        }
      } catch (error) {
        this.logger.warn(`Invalid sort JSON string received (parse error): ${sortString}`);
        parsedSort = undefined;
      }
    }

    const options: SearchOptionsInput = {
      query,
      entityType: entityType || SearchEntityType.PRODUCT,
      page,
      limit,
      sort: parsedSort,
      enableNlp: enableNlp === 'true',
      personalized: personalized !== 'false',
    };

    // Extract user from request if authenticated
    const user = request.user as User;

    // Perform search
    const results = await this.nlpSearchService.searchAsync(options, user);

    // Track search analytics
    this.analyticsService.trackSearch({
      query: options.query,
      filters: options.filters ? JSON.stringify(options.filters) : undefined,
      hasFilters: !!(options.filters && options.filters.length > 0),
      filterCount: options.filters?.length,
      isNlpEnhanced: options.enableNlp,
      isPersonalized: options.personalized,
      resultCount: results.pagination.total,
      userId: user?.id,
      sessionId: request.headers['x-session-id'] as string,
      userAgent: request.headers['user-agent'],
      timestamp: new Date(),
      metadata: {
        page: options.page,
        limit: options.limit,
        sort: options.sort ? JSON.stringify(options.sort) : undefined,
        entityType: options.entityType,
        rangeFilters: options.rangeFilters,
      },
    });

    return results;
  }

  @Get('products')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CacheInterceptor) // Enable caching for this endpoint
  @CacheKey('search_products') // Set a specific cache key
  @CacheTTL(60) // Set TTL to 60 seconds
  @ApiOperation({ summary: 'Search products only' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (0-indexed)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (max 100)',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'JSON string of sort options (e.g., `[{"field":"createdAt","order":"desc"}]`)',
  })
  @ApiResponse({
    status: 200,
    description: 'Product search results',
    type: SearchResponseDto,
  })
  @ApiBearerAuth()
  async searchProducts(
    @Query('query') query?: string,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('sort') sortString?: string,
    @Query('enableNlp') enableNlp?: string,
    @Query('personalized') personalized?: string,
    @Req() request?: Request,
  ): Promise<SearchResponseDto> {
    // Convert query parameters to SearchOptionsInput
    let parsedSort: SortOption[] | undefined;
    if (sortString) {
      try {
        parsedSort = JSON.parse(sortString);
        // Basic validation: ensure it's an array of objects with 'field'
        if (
          !Array.isArray(parsedSort) ||
          !parsedSort.every(s => typeof s === 'object' && s !== null && 'field' in s)
        ) {
          this.logger.warn(`Invalid sort JSON string received (invalid structure): ${sortString}`);
          parsedSort = undefined; // Reset if invalid structure
        }
      } catch (error) {
        this.logger.warn(`Invalid sort JSON string received (parse error): ${sortString}`);
        parsedSort = undefined;
      }
    }

    const options: SearchOptionsInput = {
      query,
      entityType: SearchEntityType.PRODUCT,
      page,
      limit,
      sort: parsedSort,
      enableNlp: enableNlp === 'true',
      personalized: personalized !== 'false',
    };

    // Extract user from request if authenticated
    const user = request.user as User;

    // Perform search
    const results = await this.nlpSearchService.searchAsync(options, user);

    // Track search analytics
    this.analyticsService.trackSearch({
      query: options.query,
      filters: options.filters ? JSON.stringify(options.filters) : undefined,
      hasFilters: !!(options.filters && options.filters.length > 0),
      filterCount: options.filters?.length,
      isNlpEnhanced: options.enableNlp,
      isPersonalized: options.personalized,
      resultCount: results.pagination.total,
      userId: user?.id,
      sessionId: request.headers['x-session-id'] as string,
      userAgent: request.headers['user-agent'],
      timestamp: new Date(),
      metadata: {
        page: options.page,
        limit: options.limit,
        sort: options.sort ? JSON.stringify(options.sort) : undefined,
        entityType: options.entityType,
        rangeFilters: options.rangeFilters,
      },
    });

    return results;
  }

  @Get('merchants')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search merchants only' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (0-indexed)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (max 100)',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'JSON string of sort options (e.g., `[{"field":"createdAt","order":"desc"}]`)',
  })
  @ApiResponse({
    status: 200,
    description: 'Merchant search results',
    type: SearchResponseDto,
  })
  @ApiBearerAuth()
  async searchMerchants(
    @Query('query') query?: string,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('sort') sortString?: string,
    @Query('enableNlp') enableNlp?: string,
    @Query('personalized') personalized?: string,
    @Req() request?: Request,
  ): Promise<SearchResponseDto> {
    // Convert query parameters to SearchOptionsInput
    let parsedSort: SortOption[] | undefined;
    if (sortString) {
      try {
        parsedSort = JSON.parse(sortString);
        // Basic validation: ensure it's an array of objects with 'field'
        if (
          !Array.isArray(parsedSort) ||
          !parsedSort.every(s => typeof s === 'object' && s !== null && 'field' in s)
        ) {
          this.logger.warn(`Invalid sort JSON string received (invalid structure): ${sortString}`);
          parsedSort = undefined; // Reset if invalid structure
        }
      } catch (error) {
        this.logger.warn(`Invalid sort JSON string received (parse error): ${sortString}`);
        parsedSort = undefined;
      }
    }

    const options: SearchOptionsInput = {
      query,
      entityType: SearchEntityType.MERCHANT,
      page,
      limit,
      sort: parsedSort,
      enableNlp: enableNlp === 'true',
      personalized: personalized !== 'false',
    };

    // Extract user from request if authenticated
    const user = request.user as User;

    // Perform search
    const results = await this.nlpSearchService.searchAsync(options, user);

    // Track search analytics
    this.analyticsService.trackSearch({
      query: options.query,
      filters: options.filters ? JSON.stringify(options.filters) : undefined,
      hasFilters: !!(options.filters && options.filters.length > 0),
      filterCount: options.filters?.length,
      isNlpEnhanced: options.enableNlp,
      isPersonalized: options.personalized,
      resultCount: results.pagination.total,
      userId: user?.id,
      sessionId: request.headers['x-session-id'] as string,
      userAgent: request.headers['user-agent'],
      timestamp: new Date(),
      metadata: {
        page: options.page,
        limit: options.limit,
        sort: options.sort ? JSON.stringify(options.sort) : undefined,
        entityType: options.entityType,
        rangeFilters: options.rangeFilters,
      },
    });

    return results;
  }

  @Get('brands')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search brands only' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (0-indexed)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (max 100)',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'JSON string of sort options (e.g., `[{"field":"createdAt","order":"desc"}]`)',
  })
  @ApiResponse({
    status: 200,
    description: 'Brand search results',
    type: SearchResponseDto,
  })
  @ApiBearerAuth()
  async searchBrands(
    @Query('query') query?: string,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('sort') sortString?: string,
    @Query('enableNlp') enableNlp?: string,
    @Query('personalized') personalized?: string,
    @Req() request?: Request,
  ): Promise<SearchResponseDto> {
    // Convert query parameters to SearchOptionsInput
    let parsedSort: SortOption[] | undefined;
    if (sortString) {
      try {
        parsedSort = JSON.parse(sortString);
        // Basic validation: ensure it's an array of objects with 'field'
        if (
          !Array.isArray(parsedSort) ||
          !parsedSort.every(s => typeof s === 'object' && s !== null && 'field' in s)
        ) {
          this.logger.warn(`Invalid sort JSON string received (invalid structure): ${sortString}`);
          parsedSort = undefined; // Reset if invalid structure
        }
      } catch (error) {
        this.logger.warn(`Invalid sort JSON string received (parse error): ${sortString}`);
        parsedSort = undefined;
      }
    }

    const options: SearchOptionsInput = {
      query,
      entityType: SearchEntityType.BRAND,
      page,
      limit,
      sort: parsedSort,
      enableNlp: enableNlp === 'true',
      personalized: personalized !== 'false',
    };

    // Extract user from request if authenticated
    const user = request.user as User;

    // Perform search
    const results = await this.nlpSearchService.searchAsync(options, user);

    // Track search analytics
    this.analyticsService.trackSearch({
      query: options.query,
      filters: options.filters ? JSON.stringify(options.filters) : undefined,
      hasFilters: !!(options.filters && options.filters.length > 0),
      filterCount: options.filters?.length,
      isNlpEnhanced: options.enableNlp,
      isPersonalized: options.personalized,
      resultCount: results.pagination.total,
      userId: user?.id,
      sessionId: request.headers['x-session-id'] as string,
      userAgent: request.headers['user-agent'],
      timestamp: new Date(),
      metadata: {
        page: options.page,
        limit: options.limit,
        sort: options.sort ? JSON.stringify(options.sort) : undefined,
        entityType: options.entityType,
        rangeFilters: options.rangeFilters,
      },
    });

    return results;
  }

  @Get('process-query')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Process a query with NLP' })
  @ApiQuery({ name: 'query', required: true, description: 'Query to process' })
  @ApiResponse({
    status: 200,
    description: 'Processed query',
    schema: {
      type: 'object',
      properties: {
        processedQuery: { type: 'string' },
        entities: { type: 'object' },
        intent: { type: 'string' },
        expandedTerms: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiBearerAuth()
  async processQuery(@Query('query') query: string, @Req() request: Request): Promise<any> {
    // Extract user from request
    const user = request.user as User;

    // Process query with NLP
    // return this.nlpSearchService.processQuery(query, user);
    this.logger.warn(
      `Attempted to call private processQuery via API for query: ${query} by user: ${user?.id}`,
    );
    // TODO: Decide if this endpoint is needed and how it should interact with the service
    // For now, return an empty object or an error message
    return { message: 'Direct NLP processing via this endpoint is currently disabled.' };
  }
}
