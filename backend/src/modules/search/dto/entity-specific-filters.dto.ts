import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsArray,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Field, InputType, Int, Float } from '@nestjs/graphql';
import { FilterOption, RangeFilterOption, SortOption } from './search-options.dto';

/**
 * Product-specific filter options
 */
@InputType('ProductFilterInput')
export class ProductFilterDto {
  @ApiProperty({
    description: 'Filter by categories',
    type: [String],
    required: false,
  })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @ApiProperty({
    description: 'Filter by tags',
    type: [String],
    required: false,
  })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Filter by values (e.g., sustainable, eco-friendly)',
    type: [String],
    required: false,
  })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  values?: string[];

  @ApiProperty({
    description: 'Filter by brand IDs',
    type: [String],
    required: false,
  })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  brandIds?: string[];

  @ApiProperty({
    description: 'Filter by merchant IDs',
    type: [String],
    required: false,
  })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  merchantIds?: string[];

  @ApiProperty({
    description: 'Filter by minimum price',
    required: false,
  })
  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @ApiProperty({
    description: 'Filter by maximum price',
    required: false,
  })
  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @ApiProperty({
    description: 'Filter by minimum rating',
    required: false,
  })
  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  minRating?: number;

  @ApiProperty({
    description: 'Filter by product availability',
    required: false,
  })
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @ApiProperty({
    description: 'Filter by products on sale',
    required: false,
  })
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  onSale?: boolean;

  @ApiProperty({
    description: 'Filter by new arrivals (products added in the last X days)',
    required: false,
  })
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  newArrivalsWithinDays?: number;

  @ApiProperty({
    description: 'Filter by color',
    type: [String],
    required: false,
  })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  colors?: string[];

  @ApiProperty({
    description: 'Filter by size',
    type: [String],
    required: false,
  })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sizes?: string[];

  @ApiProperty({
    description: 'Filter by material',
    type: [String],
    required: false,
  })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  materials?: string[];

  /**
   * Convert product-specific filters to generic filter and range filter options
   */
  toGenericFilters(): { filters: FilterOption[]; rangeFilters: RangeFilterOption[] } {
    const filters: FilterOption[] = [];
    const rangeFilters: RangeFilterOption[] = [];

    // Add category filters
    if (this.categories?.length) {
      filters.push({
        field: 'categories',
        values: this.categories,
        exact: false,
      });
    }

    // Add tag filters
    if (this.tags?.length) {
      filters.push({
        field: 'tags',
        values: this.tags,
        exact: false,
      });
    }

    // Add value filters
    if (this.values?.length) {
      filters.push({
        field: 'values',
        values: this.values,
        exact: false,
      });
    }

    // Add brand filters
    if (this.brandIds?.length) {
      filters.push({
        field: 'brandId',
        values: this.brandIds,
        exact: true,
      });
    }

    // Add merchant filters
    if (this.merchantIds?.length) {
      filters.push({
        field: 'merchantId',
        values: this.merchantIds,
        exact: true,
      });
    }

    // Add price range filter
    if (this.minPrice !== undefined || this.maxPrice !== undefined) {
      rangeFilters.push({
        field: 'price',
        min: this.minPrice,
        max: this.maxPrice,
      });
    }

    // Add rating filter
    if (this.minRating !== undefined) {
      rangeFilters.push({
        field: 'rating',
        min: this.minRating,
      });
    }

    // Add availability filter
    if (this.inStock !== undefined) {
      filters.push({
        field: 'inStock',
        values: [this.inStock.toString()],
        exact: true,
      });
    }

    // Add sale filter
    if (this.onSale !== undefined) {
      filters.push({
        field: 'onSale',
        values: [this.onSale.toString()],
        exact: true,
      });
    }

    // Add new arrivals filter
    if (this.newArrivalsWithinDays !== undefined) {
      const date = new Date();
      date.setDate(date.getDate() - this.newArrivalsWithinDays);
      rangeFilters.push({
        field: 'createdAt',
        min: date.getTime(),
      });
    }

    // Add color filter
    if (this.colors?.length) {
      filters.push({
        field: 'colors',
        values: this.colors,
        exact: false,
      });
    }

    // Add size filter
    if (this.sizes?.length) {
      filters.push({
        field: 'sizes',
        values: this.sizes,
        exact: false,
      });
    }

    // Add material filter
    if (this.materials?.length) {
      filters.push({
        field: 'materials',
        values: this.materials,
        exact: false,
      });
    }

    return { filters, rangeFilters };
  }
}

/**
 * Merchant-specific filter options
 */
@InputType('MerchantFilterInput')
export class MerchantFilterDto {
  @ApiProperty({
    description: 'Filter by categories',
    type: [String],
    required: false,
  })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @ApiProperty({
    description: 'Filter by values (e.g., sustainable, eco-friendly)',
    type: [String],
    required: false,
  })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  values?: string[];

  @ApiProperty({
    description: 'Filter by location',
    type: [String],
    required: false,
  })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  locations?: string[];

  @ApiProperty({
    description: 'Filter by minimum rating',
    required: false,
  })
  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  minRating?: number;

  @ApiProperty({
    description: 'Filter by verified merchants only',
    required: false,
  })
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  verifiedOnly?: boolean;

  @ApiProperty({
    description: 'Filter by active merchants only',
    required: false,
  })
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  activeOnly?: boolean;

  @ApiProperty({
    description: 'Filter by new merchants (added in the last X days)',
    required: false,
  })
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  newMerchantsWithinDays?: number;

  @ApiProperty({
    description: 'Filter by minimum product count',
    required: false,
  })
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  minProductCount?: number;

  /**
   * Convert merchant-specific filters to generic filter and range filter options
   */
  toGenericFilters(): { filters: FilterOption[]; rangeFilters: RangeFilterOption[] } {
    const filters: FilterOption[] = [];
    const rangeFilters: RangeFilterOption[] = [];

    // Add category filters
    if (this.categories?.length) {
      filters.push({
        field: 'categories',
        values: this.categories,
        exact: false,
      });
    }

    // Add value filters
    if (this.values?.length) {
      filters.push({
        field: 'values',
        values: this.values,
        exact: false,
      });
    }

    // Add location filters
    if (this.locations?.length) {
      filters.push({
        field: 'location',
        values: this.locations,
        exact: false,
      });
    }

    // Add rating filter
    if (this.minRating !== undefined) {
      rangeFilters.push({
        field: 'rating',
        min: this.minRating,
      });
    }

    // Add verified filter
    if (this.verifiedOnly !== undefined && this.verifiedOnly) {
      filters.push({
        field: 'isVerified',
        values: ['true'],
        exact: true,
      });
    }

    // Add active filter
    if (this.activeOnly !== undefined && this.activeOnly) {
      filters.push({
        field: 'isActive',
        values: ['true'],
        exact: true,
      });
    }

    // Add new merchants filter
    if (this.newMerchantsWithinDays !== undefined) {
      const date = new Date();
      date.setDate(date.getDate() - this.newMerchantsWithinDays);
      rangeFilters.push({
        field: 'createdAt',
        min: date.getTime(),
      });
    }

    // Add product count filter
    if (this.minProductCount !== undefined) {
      rangeFilters.push({
        field: 'productCount',
        min: this.minProductCount,
      });
    }

    return { filters, rangeFilters };
  }
}

/**
 * Brand-specific filter options
 */
@InputType('BrandFilterInput')
export class BrandFilterDto {
  @ApiProperty({
    description: 'Filter by categories',
    type: [String],
    required: false,
  })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @ApiProperty({
    description: 'Filter by values (e.g., sustainable, eco-friendly)',
    type: [String],
    required: false,
  })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  values?: string[];

  @ApiProperty({
    description: 'Filter by location',
    type: [String],
    required: false,
  })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  locations?: string[];

  @ApiProperty({
    description: 'Filter by verified brands only',
    required: false,
  })
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  verifiedOnly?: boolean;

  @ApiProperty({
    description: 'Filter by active brands only',
    required: false,
  })
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  activeOnly?: boolean;

  @ApiProperty({
    description: 'Filter by minimum founded year',
    required: false,
  })
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  minFoundedYear?: number;

  @ApiProperty({
    description: 'Filter by maximum founded year',
    required: false,
  })
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  maxFoundedYear?: number;

  @ApiProperty({
    description: 'Filter by new brands (added in the last X days)',
    required: false,
  })
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  newBrandsWithinDays?: number;

  @ApiProperty({
    description: 'Filter by minimum product count',
    required: false,
  })
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  minProductCount?: number;

  /**
   * Convert brand-specific filters to generic filter and range filter options
   */
  toGenericFilters(): { filters: FilterOption[]; rangeFilters: RangeFilterOption[] } {
    const filters: FilterOption[] = [];
    const rangeFilters: RangeFilterOption[] = [];

    // Add category filters
    if (this.categories?.length) {
      filters.push({
        field: 'categories',
        values: this.categories,
        exact: false,
      });
    }

    // Add value filters
    if (this.values?.length) {
      filters.push({
        field: 'values',
        values: this.values,
        exact: false,
      });
    }

    // Add location filters
    if (this.locations?.length) {
      filters.push({
        field: 'location',
        values: this.locations,
        exact: false,
      });
    }

    // Add verified filter
    if (this.verifiedOnly !== undefined && this.verifiedOnly) {
      filters.push({
        field: 'isVerified',
        values: ['true'],
        exact: true,
      });
    }

    // Add active filter
    if (this.activeOnly !== undefined && this.activeOnly) {
      filters.push({
        field: 'isActive',
        values: ['true'],
        exact: true,
      });
    }

    // Add founded year filter
    if (this.minFoundedYear !== undefined || this.maxFoundedYear !== undefined) {
      rangeFilters.push({
        field: 'foundedYear',
        min: this.minFoundedYear,
        max: this.maxFoundedYear,
      });
    }

    // Add new brands filter
    if (this.newBrandsWithinDays !== undefined) {
      const date = new Date();
      date.setDate(date.getDate() - this.newBrandsWithinDays);
      rangeFilters.push({
        field: 'createdAt',
        min: date.getTime(),
      });
    }

    // Add product count filter
    if (this.minProductCount !== undefined) {
      rangeFilters.push({
        field: 'productCount',
        min: this.minProductCount,
      });
    }

    return { filters, rangeFilters };
  }
}

/**
 * Entity-specific sort options
 */
@InputType('EntityBoostingInput')
export class EntityBoostingDto {
  @ApiProperty({
    description: 'Boost factor for products (1.0 = normal, >1.0 = boost, <1.0 = reduce)',
    default: 1.0,
  })
  @Field(() => Float, { defaultValue: 1.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  productBoost?: number = 1.0;

  @ApiProperty({
    description: 'Boost factor for merchants (1.0 = normal, >1.0 = boost, <1.0 = reduce)',
    default: 1.0,
  })
  @Field(() => Float, { defaultValue: 1.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  merchantBoost?: number = 1.0;

  @ApiProperty({
    description: 'Boost factor for brands (1.0 = normal, >1.0 = boost, <1.0 = reduce)',
    default: 1.0,
  })
  @Field(() => Float, { defaultValue: 1.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  brandBoost?: number = 1.0;
}

/**
 * Enhanced search options with entity-specific filters
 */
@InputType('EnhancedSearchOptionsInput')
export class EnhancedSearchOptionsDto {
  @ApiProperty({
    description: 'Search query',
    required: false,
  })
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiProperty({
    description: 'Page number (0-indexed)',
    minimum: 0,
    default: 0,
  })
  @Field(() => Int, { defaultValue: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  page?: number = 0;

  @ApiProperty({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @Field(() => Int, { defaultValue: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiProperty({
    description: 'Enable natural language processing',
    default: false,
  })
  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  enableNlp?: boolean = false;

  @ApiProperty({
    description: 'Include personalized results',
    default: true,
  })
  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  personalized?: boolean = true;

  @ApiProperty({
    description: 'Product-specific filters',
    type: ProductFilterDto,
    required: false,
  })
  @Field(() => ProductFilterDto, { nullable: true })
  @Type(() => ProductFilterDto)
  @IsOptional()
  productFilters?: ProductFilterDto;

  @ApiProperty({
    description: 'Merchant-specific filters',
    type: MerchantFilterDto,
    required: false,
  })
  @Field(() => MerchantFilterDto, { nullable: true })
  @Type(() => MerchantFilterDto)
  @IsOptional()
  merchantFilters?: MerchantFilterDto;

  @ApiProperty({
    description: 'Brand-specific filters',
    type: BrandFilterDto,
    required: false,
  })
  @Field(() => BrandFilterDto, { nullable: true })
  @Type(() => BrandFilterDto)
  @IsOptional()
  brandFilters?: BrandFilterDto;

  @ApiProperty({
    description: 'Sort options',
    type: [SortOption],
    required: false,
  })
  @Field(() => [SortOption], { nullable: true })
  @Type(() => SortOption)
  @IsOptional()
  sort?: SortOption[];

  @ApiProperty({
    description: 'Entity boosting factors',
    type: EntityBoostingDto,
    required: false,
  })
  @Field(() => EntityBoostingDto, { nullable: true })
  @Type(() => EntityBoostingDto)
  @IsOptional()
  entityBoosting?: EntityBoostingDto;

  @ApiProperty({
    description: 'Boost results matching user values',
    default: true,
  })
  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  boostByValues?: boolean = true;

  @ApiProperty({
    description: 'Include sponsored content',
    default: true,
  })
  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  includeSponsoredContent?: boolean = true;

  @ApiProperty({
    description: 'Experiment ID for A/B testing',
    required: false,
  })
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  experimentId?: string;
}
