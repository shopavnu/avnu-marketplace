import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql';
// Int is imported but not used directly
import { UseGuards, Logger } from '@nestjs/common';
import { NlpSearchService } from '../services/nlp-search.service';
import { SimpleSearchService } from '../services/simple-search.service';
import {
  SearchOptionsInput,
  SortOption as _SortOption,
  FilterOption as _FilterOption,
  RangeFilterOption as _RangeFilterOption,
} from '../dto/search-options.dto';
import {
  SearchResponseDto,
  ProductSearchResult,
  MerchantSearchResult,
  BrandSearchResult,
  PaginationInfo,
  SearchFacets,
} from '../dto/search-response.dto';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { AnalyticsService } from '../../analytics/services/analytics.service';
import { SearchEntityType } from '../enums/search-entity-type.enum';

@Resolver(() => SearchResponseDto)
export class SearchApiResolver {
  private readonly logger = new Logger(SearchApiResolver.name);

  constructor(
    private readonly nlpSearchService: NlpSearchService,
    private readonly simpleSearchService: SimpleSearchService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Query(() => SearchResponseDto, { description: 'Search across products, merchants, and brands' })
  // @UseGuards(GqlOptionalJwtAuthGuard)
  async search(
    @Args('input') input: SearchOptionsInput,
    @CurrentUser() user?: User,
  ): Promise<SearchResponseDto> {
    this.logger.log(`Search query: ${input.query} by user: ${user?.id}`);
    // Use the simpleSearchService instead of nlpSearchService
    const results = await this.simpleSearchService.searchAsync(input, user);

    // Track search event using trackSearch
    this.analyticsService.trackSearch({
      query: input.query,
      resultCount: results.pagination.total,
      isNlpEnhanced: input.enableNlp ?? false,
      userId: user?.id,
      filters: input.filters ? JSON.stringify(input.filters) : undefined,
      metadata: {
        ...(input.sort && { sortBy: JSON.stringify(input.sort) }),
        ...(input.page !== undefined && { page: input.page }),
        ...(input.limit !== undefined && { limit: input.limit }),
      },
    });

    return results;
  }

  @Query(() => SearchResponseDto, { description: 'Search products only' })
  // @UseGuards(GqlOptionalJwtAuthGuard)
  async searchProducts(
    @Args('input') input: SearchOptionsInput,
    @CurrentUser() user?: User,
  ): Promise<SearchResponseDto> {
    this.logger.log(`Product search query: ${input.query} by user: ${user?.id}`);
    const options = { ...input, entityType: SearchEntityType.PRODUCT };
    return this.simpleSearchService.searchAsync(options, user);
  }

  @Query(() => SearchResponseDto, { description: 'Search merchants only' })
  // @UseGuards(GqlOptionalJwtAuthGuard)
  async searchMerchants(
    @Args('input') input: SearchOptionsInput,
    @CurrentUser() user?: User,
  ): Promise<SearchResponseDto> {
    this.logger.log(`Merchant search query: ${input.query} by user: ${user?.id}`);
    const options = { ...input, entityType: SearchEntityType.MERCHANT };
    return this.simpleSearchService.searchAsync(options, user);
  }

  @Query(() => SearchResponseDto, { description: 'Search brands only' })
  // @UseGuards(GqlOptionalJwtAuthGuard)
  async searchBrands(
    @Args('input') input: SearchOptionsInput,
    @CurrentUser() user?: User,
  ): Promise<SearchResponseDto> {
    this.logger.log(`Brand search query: ${input.query} by user: ${user?.id}`);
    const options = { ...input, entityType: SearchEntityType.BRAND };
    return this.simpleSearchService.searchAsync(options, user);
  }

  @Query(() => SearchResponseDto, { description: 'Search all entity types' })
  // @UseGuards(GqlOptionalJwtAuthGuard)
  async searchAll(
    @Args('input') input: SearchOptionsInput,
    @CurrentUser() user?: User,
  ): Promise<SearchResponseDto> {
    this.logger.log(`Search query: ${input.query} by user: ${user?.id}`);
    const options = { ...input, entityType: SearchEntityType.ALL };
    return this.simpleSearchService.searchAsync(options, user);
  }

  @Query(() => SearchResponseDto, { description: 'Process a query with NLP' })
  @UseGuards(GqlAuthGuard)
  async processQuery(
    @Args('query') query: string,
    @CurrentUser() user: User,
  ): Promise<SearchResponseDto> {
    // Process query with SimpleSearch instead of NLP
    return this.simpleSearchService.searchAsync({ query }, user);
  }

  // Resolver field for products in SearchResponseDto
  @ResolveField(() => [ProductSearchResult], { nullable: true })
  products(@Parent() searchResponse: SearchResponseDto): ProductSearchResult[] {
    return searchResponse.products;
  }

  // Resolver field for merchants in SearchResponseDto
  @ResolveField(() => [MerchantSearchResult], { nullable: true })
  merchants(@Parent() searchResponse: SearchResponseDto): MerchantSearchResult[] {
    return searchResponse.merchants;
  }

  // Resolver field for brands in SearchResponseDto
  @ResolveField(() => [BrandSearchResult], { nullable: true })
  brands(@Parent() searchResponse: SearchResponseDto): BrandSearchResult[] {
    return searchResponse.brands;
  }

  // Resolver field for pagination in SearchResponseDto
  @ResolveField(() => PaginationInfo)
  pagination(@Parent() searchResponse: SearchResponseDto): PaginationInfo {
    return searchResponse.pagination;
  }

  // Resolver field for facets in SearchResponseDto
  @ResolveField(() => SearchFacets)
  facets(@Parent() searchResponse: SearchResponseDto): SearchFacets {
    return searchResponse.facets;
  }
}
