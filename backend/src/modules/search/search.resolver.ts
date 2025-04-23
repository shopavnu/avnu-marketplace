import {
  Resolver,
  Query,
  Args,
  Int,
  ID,
  ObjectType,
  Field,
  InputType,
  Float,
  GraphQLISODateTime as _GraphQLISODateTime,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';
import {
  ProductSearchResult,
  MerchantSearchResult,
  BrandSearchResult,
} from './dto/search-response.dto';
import { ProductPaginatedResponse } from '../products/dto/product-paginated.dto';

@InputType()
class SearchFiltersInput {
  @Field(() => [String], { nullable: true })
  categories?: string[];

  @Field(() => Float, { nullable: true })
  priceMin?: number;

  @Field(() => Float, { nullable: true })
  priceMax?: number;

  @Field({ nullable: true })
  merchantId?: string;

  @Field({ nullable: true })
  inStock?: boolean;

  @Field(() => [String], { nullable: true })
  values?: string[];

  @Field({ nullable: true })
  brandName?: string;
}

@InputType()
class SortInput {
  @Field()
  field: string;

  @Field()
  order: 'asc' | 'desc';
}

@ObjectType()
class MerchantPaginatedResponse {
  @Field(() => [MerchantSearchResult])
  items: MerchantSearchResult[];

  @Field(() => Int)
  total: number;
}

@ObjectType()
class BrandPaginatedResponse {
  @Field(() => [BrandSearchResult])
  items: BrandSearchResult[];

  @Field(() => Int)
  total: number;
}

@ObjectType()
class AllSearchResults {
  @Field(() => ProductPaginatedResponse)
  products: ProductPaginatedResponse;

  @Field(() => MerchantPaginatedResponse)
  merchants: MerchantPaginatedResponse;

  @Field(() => BrandPaginatedResponse)
  brands: BrandPaginatedResponse;
}

@Resolver()
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}

  @Query(() => ProductPaginatedResponse, { name: 'searchProducts' })
  searchProducts(
    @Args('query', { nullable: true }) query: string,
    @Args('pagination', { nullable: true }) paginationDto: PaginationDto,
    @Args('filters', { nullable: true }) filters?: SearchFiltersInput,
    @Args('sort', { nullable: true }) sort?: SortInput,
  ) {
    return this.searchService.searchProducts(
      query,
      paginationDto || { page: 1, limit: 10 },
      filters,
      sort,
    );
  }

  @Query(() => [String], { name: 'productSuggestions' })
  getProductSuggestions(
    @Args('query') query: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.searchService.getProductSuggestions(query, limit);
  }

  @Query(() => [ProductSearchResult], { name: 'relatedProducts' })
  getRelatedProducts(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.searchService.getRelatedProducts(productId, limit);
  }

  @Query(() => [ProductSearchResult], { name: 'trendingProducts' })
  getTrendingProducts(@Args('limit', { type: () => Int, nullable: true }) limit?: number) {
    return this.searchService.getTrendingProducts(limit);
  }

  @Query(() => [ProductSearchResult], { name: 'discoveryProducts' })
  getDiscoveryProducts(
    @Args('userId', { nullable: true }) userId?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('values', { type: () => [String], nullable: true }) values?: string[],
  ) {
    return this.searchService.getDiscoveryProducts(userId, limit, values);
  }

  @Query(() => ProductPaginatedResponse, { name: 'naturalLanguageSearch' })
  naturalLanguageSearch(
    @Args('query') query: string,
    @Args('pagination', { nullable: true }) paginationDto: PaginationDto,
  ) {
    return this.searchService.naturalLanguageSearch(query, paginationDto || { page: 1, limit: 10 });
  }

  @Query(() => AllSearchResults, { name: 'searchAll' })
  searchAll(
    @Args('query') query: string,
    @Args('pagination', { nullable: true }) paginationDto: PaginationDto,
  ) {
    return this.searchService.searchAll(query, paginationDto || { page: 1, limit: 10 });
  }

  @Query(() => Boolean, { name: 'reindexAllProducts' })
  @UseGuards(GqlAuthGuard)
  async reindexAllProducts() {
    await this.searchService.reindexAllProducts();
    return true;
  }
}
