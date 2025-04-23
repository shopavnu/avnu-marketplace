import { ObjectType, Field, createUnionType } from '@nestjs/graphql';
import {
  ProductResultType,
  MerchantResultType,
  BrandResultType,
  FacetType,
} from './search-response.type';
import { CursorPaginationType } from './cursor-pagination.type';

/**
 * Union type for search results
 */
export const CursorSearchResultUnion = createUnionType({
  name: 'CursorSearchResult',
  types: () => [ProductResultType, MerchantResultType, BrandResultType],
  resolveType(value) {
    if (value.title) {
      return ProductResultType;
    }
    if (value.foundedYear) {
      return BrandResultType;
    }
    return MerchantResultType;
  },
});

/**
 * Type for cursor-based search response
 */
@ObjectType()
export class CursorSearchResponseType {
  @Field({ nullable: true })
  query?: string;

  @Field(() => CursorPaginationType)
  pagination: CursorPaginationType;

  @Field(() => [CursorSearchResultUnion])
  results: (typeof CursorSearchResultUnion)[];

  @Field(() => Boolean, { defaultValue: false })
  highlightsEnabled: boolean = false;

  @Field(() => [FacetType], { nullable: true })
  facets?: FacetType[];

  @Field(() => Boolean, { nullable: true })
  isPersonalized?: boolean;

  @Field({ nullable: true })
  experimentId?: string;

  @Field(() => [String], { nullable: true })
  appliedFilters?: string[];
}
