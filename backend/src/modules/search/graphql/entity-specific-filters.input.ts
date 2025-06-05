import { InputType, Field, Int, Float /* registerEnumType */ } from '@nestjs/graphql';
import { SortOrder } from '../dto/search-options.dto';

/**
 * Input type for product-specific filters
 */
@InputType()
export class ProductFilterInput {
  @Field(() => [String], { nullable: true })
  categories?: string[];

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => [String], { nullable: true })
  values?: string[];

  @Field(() => [String], { nullable: true })
  brandIds?: string[];

  @Field(() => [String], { nullable: true })
  merchantIds?: string[];

  @Field(() => Float, { nullable: true })
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  maxPrice?: number;

  @Field(() => Float, { nullable: true })
  minRating?: number;

  @Field(() => Boolean, { nullable: true })
  inStock?: boolean;

  @Field(() => Boolean, { nullable: true })
  onSale?: boolean;

  @Field(() => [String], { nullable: true })
  colors?: string[];

  @Field(() => [String], { nullable: true })
  sizes?: string[];

  @Field(() => [String], { nullable: true })
  materials?: string[];
}

/**
 * Input type for merchant-specific filters
 */
@InputType()
export class MerchantFilterInput {
  @Field(() => [String], { nullable: true })
  categories?: string[];

  @Field(() => [String], { nullable: true })
  values?: string[];

  @Field(() => [String], { nullable: true })
  locations?: string[];

  @Field(() => Float, { nullable: true })
  minRating?: number;

  @Field(() => Boolean, { nullable: true })
  verifiedOnly?: boolean;

  @Field(() => Boolean, { nullable: true })
  activeOnly?: boolean;

  @Field(() => Int, { nullable: true })
  minProductCount?: number;
}

/**
 * Input type for brand-specific filters
 */
@InputType()
export class BrandFilterInput {
  @Field(() => [String], { nullable: true })
  categories?: string[];

  @Field(() => [String], { nullable: true })
  values?: string[];

  @Field(() => [String], { nullable: true })
  locations?: string[];

  @Field(() => Boolean, { nullable: true })
  verifiedOnly?: boolean;

  @Field(() => Boolean, { nullable: true })
  activeOnly?: boolean;

  @Field(() => Int, { nullable: true })
  minFoundedYear?: number;

  @Field(() => Int, { nullable: true })
  maxFoundedYear?: number;

  @Field(() => Int, { nullable: true })
  minProductCount?: number;
}

@InputType()
export class EntitySortOptionInput {
  @Field()
  field: string;

  @Field(() => SortOrder, { defaultValue: SortOrder.DESC })
  order: SortOrder = SortOrder.DESC;
}

/**
 * Input type for entity boosting
 */
@InputType()
export class EntityBoostingInput {
  @Field(() => Float, { defaultValue: 1.0 })
  productBoost: number = 1.0;

  @Field(() => Float, { defaultValue: 1.0 })
  merchantBoost: number = 1.0;

  @Field(() => Float, { defaultValue: 1.0 })
  brandBoost: number = 1.0;
}

/**
 * Input type for price range filter
 */
@InputType()
export class PriceRangeInput {
  @Field(() => Float, { nullable: true })
  min?: number;

  @Field(() => Float, { nullable: true })
  max?: number;
}

/**
 * Input type for search filters used in optimized search
 */
@InputType()
export class SearchFiltersInput {
  @Field(() => [String], { nullable: true })
  categories?: string[];

  @Field(() => String, { nullable: true })
  brandName?: string;

  @Field(() => String, { nullable: true })
  merchantId?: string;

  @Field(() => PriceRangeInput, { nullable: true })
  priceRange?: PriceRangeInput;

  @Field(() => [String], { nullable: true })
  values?: string[];

  @Field(() => Boolean, { nullable: true })
  inStock?: boolean;

  @Field(() => String, { nullable: true })
  sortBy?: string;

  @Field(() => String, { nullable: true })
  sortDirection?: string;
}

/**
 * Input type for enhanced search options
 */
@InputType()
export class EnhancedSearchInput {
  @Field({ nullable: true })
  query?: string;

  @Field(() => Int, { defaultValue: 0 })
  page: number = 0;

  @Field(() => Int, { defaultValue: 20 })
  limit: number = 20;

  @Field({ defaultValue: false })
  enableNlp: boolean = false;

  @Field({ defaultValue: true })
  personalized: boolean = true;

  @Field(() => ProductFilterInput, { nullable: true })
  productFilters?: ProductFilterInput;

  @Field(() => MerchantFilterInput, { nullable: true })
  merchantFilters?: MerchantFilterInput;

  @Field(() => BrandFilterInput, { nullable: true })
  brandFilters?: BrandFilterInput;

  @Field(() => EntityBoostingInput, { nullable: true })
  entityBoosting?: EntityBoostingInput;

  @Field(() => [EntitySortOptionInput], { nullable: true })
  sortOptions?: EntitySortOptionInput[];

  @Field({ defaultValue: false })
  boostByValues: boolean = false;

  @Field({ defaultValue: true })
  includeSponsoredContent: boolean = true;

  @Field({ nullable: true })
  experimentId?: string;

  @Field({ defaultValue: false, nullable: true })
  enableHighlighting?: boolean = false;

  @Field(() => [String], { nullable: true })
  highlightFields?: string[];

  @Field({ nullable: true, defaultValue: '<em>' })
  highlightPreTag?: string = '<em>';

  @Field({ nullable: true, defaultValue: '</em>' })
  highlightPostTag?: string = '</em>';

  @Field(() => Int, { nullable: true, defaultValue: 150 })
  highlightFragmentSize?: number = 150;
}
