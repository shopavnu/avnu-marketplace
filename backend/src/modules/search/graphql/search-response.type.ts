import { ObjectType, Field, Int, Float, createUnionType } from '@nestjs/graphql';
// These types are imported from highlight.dto but not used directly in this file
import {} from '../dto/highlight.dto';

/**
 * Type for pagination information
 */
@ObjectType()
export class PaginationType {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPages: number;
}

/**
 * Type for facet value
 */
@ObjectType()
export class FacetValueType {
  @Field()
  value: string;

  @Field(() => Int)
  count: number;

  @Field(() => Boolean, { nullable: true })
  selected?: boolean;
}

/**
 * Type for facet
 */
@ObjectType()
export class FacetType {
  @Field()
  name: string;

  @Field()
  displayName: string;

  @Field(() => [FacetValueType])
  values: FacetValueType[];
}

/**
 * Type for highlighting fields
 */
@ObjectType()
export class HighlightFieldType {
  @Field()
  field: string;

  @Field(() => [String])
  snippets: string[];
}

/**
 * Type for highlighting result
 */
@ObjectType()
export class HighlightResultType {
  @Field(() => [HighlightFieldType])
  fields: HighlightFieldType[];

  @Field(() => [String], { nullable: true })
  matchedTerms?: string[];
}

/**
 * Type for product result
 */
@ObjectType()
export class ProductResultType {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => HighlightResultType, { nullable: true })
  highlights?: HighlightResultType;

  @Field(() => Float)
  price: number;

  @Field(() => Float, { nullable: true })
  salePrice?: number;

  @Field(() => Boolean)
  inStock: boolean;

  @Field(() => Boolean, { nullable: true })
  onSale?: boolean;

  @Field(() => Float, { nullable: true })
  rating?: number;

  @Field(() => Int, { nullable: true })
  reviewCount?: number;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field({ nullable: true })
  thumbnailImage?: string;

  @Field(() => [String], { nullable: true })
  categories?: string[];

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => [String], { nullable: true })
  values?: string[];

  @Field({ nullable: true })
  brandId?: string;

  @Field({ nullable: true })
  brandName?: string;

  @Field({ nullable: true })
  merchantId?: string;

  @Field({ nullable: true })
  merchantName?: string;

  @Field(() => [String], { nullable: true })
  colors?: string[];

  @Field(() => [String], { nullable: true })
  sizes?: string[];

  @Field(() => [String], { nullable: true })
  materials?: string[];

  @Field(() => Float, { nullable: true })
  relevanceScore?: number;

  @Field(() => Boolean, { nullable: true })
  sponsored?: boolean;
}

/**
 * Type for merchant result
 */
@ObjectType()
export class MerchantResultType {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => HighlightResultType, { nullable: true })
  highlights?: HighlightResultType;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  coverImage?: string;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field(() => [String], { nullable: true })
  categories?: string[];

  @Field(() => [String], { nullable: true })
  values?: string[];

  @Field({ nullable: true })
  location?: string;

  @Field(() => Float, { nullable: true })
  rating?: number;

  @Field(() => Int, { nullable: true })
  reviewCount?: number;

  @Field(() => Boolean, { nullable: true })
  verified?: boolean;

  @Field(() => Boolean, { nullable: true })
  active?: boolean;

  @Field(() => Int, { nullable: true })
  productCount?: number;

  @Field(() => Float, { nullable: true })
  relevanceScore?: number;

  @Field(() => Boolean, { nullable: true })
  sponsored?: boolean;
}

/**
 * Type for brand result
 */
@ObjectType()
export class BrandResultType {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => HighlightResultType, { nullable: true })
  highlights?: HighlightResultType;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  coverImage?: string;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field(() => [String], { nullable: true })
  categories?: string[];

  @Field(() => [String], { nullable: true })
  values?: string[];

  @Field({ nullable: true })
  location?: string;

  @Field(() => Int, { nullable: true })
  foundedYear?: number;

  @Field({ nullable: true })
  story?: string;

  @Field(() => Boolean, { nullable: true })
  verified?: boolean;

  @Field(() => Boolean, { nullable: true })
  active?: boolean;

  @Field(() => Int, { nullable: true })
  productCount?: number;

  @Field(() => Float, { nullable: true })
  relevanceScore?: number;

  @Field(() => Boolean, { nullable: true })
  sponsored?: boolean;
}

/**
 * Union type for search results
 */
export const SearchResultUnion = createUnionType({
  name: 'SearchResult',
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
 * Type for entity relevance scores
 */
@ObjectType()
export class EntityRelevanceScoresType {
  @Field(() => Float)
  products: number;

  @Field(() => Float)
  merchants: number;

  @Field(() => Float)
  brands: number;
}

/**
 * Type for entity distribution
 */
@ObjectType()
export class EntityDistributionType {
  @Field(() => Float)
  products: number;

  @Field(() => Float)
  merchants: number;

  @Field(() => Float)
  brands: number;
}

/**
 * Type for search response
 */
@ObjectType()
export class SearchResponseType {
  @Field({ nullable: true })
  query?: string;

  @Field(() => PaginationType)
  pagination: PaginationType;

  @Field(() => [SearchResultUnion])
  results: (typeof SearchResultUnion)[];

  @Field(() => Boolean, { defaultValue: false })
  highlightsEnabled: boolean = false;

  @Field(() => [FacetType], { nullable: true })
  facets?: FacetType[];

  @Field(() => EntityRelevanceScoresType, { nullable: true })
  relevanceScores?: EntityRelevanceScoresType;

  @Field(() => EntityDistributionType, { nullable: true })
  entityDistribution?: EntityDistributionType;

  @Field(() => Boolean, { nullable: true })
  isNlpEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  isPersonalized?: boolean;

  @Field({ nullable: true })
  experimentId?: string;

  @Field(() => [String], { nullable: true })
  appliedFilters?: string[];
}
