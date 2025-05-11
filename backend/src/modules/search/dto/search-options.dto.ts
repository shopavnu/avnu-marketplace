import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsInt, Min, Max, IsString, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { Field, InputType, Int, Float, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { SearchEntityType } from '../enums/search-entity-type.enum';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

registerEnumType(SortOrder, {
  name: 'SortOrder',
  description: 'Sort order direction',
});

@InputType('SortOptionInput')
export class SortOption {
  @ApiProperty({
    description: 'Field to sort by',
    example: 'createdAt',
  })
  @Field()
  @IsString()
  field: string;

  @ApiProperty({
    description: 'Sort order (asc or desc)',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @Field(() => SortOrder)
  @IsEnum(SortOrder)
  @IsOptional()
  order?: SortOrder = SortOrder.DESC;
}

@InputType('FilterOptionInput')
export class FilterOption {
  @ApiProperty({
    description: 'Field to filter by',
    example: 'category',
  })
  @Field()
  @IsString()
  field: string;

  @ApiProperty({
    description: 'Value to filter by',
    example: 'clothing',
  })
  @Field(() => [String])
  @IsArray()
  values: string[];

  @ApiProperty({
    description: 'Whether to use exact match (false for partial/fuzzy matching)',
    default: false,
  })
  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  exact?: boolean = false;
}

@InputType('RangeFilterOptionInput')
export class RangeFilterOption {
  @ApiProperty({
    description: 'Field to filter by range',
    example: 'price',
  })
  @Field()
  @IsString()
  field: string;

  @ApiProperty({
    description: 'Minimum value (inclusive)',
    example: 10,
    required: false,
  })
  @Field(() => Number, { nullable: true })
  @IsOptional()
  min?: number;

  @ApiProperty({
    description: 'Maximum value (inclusive)',
    example: 100,
    required: false,
  })
  @Field(() => Number, { nullable: true })
  @IsOptional()
  max?: number;
}

// Note: Renamed from SearchOptionsInput to avoid conflict with the actual InputType
// which should ideally be defined closer to its usage (e.g., resolver or specific input file).
@InputType('SearchOptionsInput') // Explicitly name the InputType
export class SearchOptionsInput {

  // Renamed class to align with InputType convention
  @ApiProperty({
    description: 'Search query',
    required: false,
  })
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiProperty({
    description: 'Entity type to search',
    enum: SearchEntityType,
    default: SearchEntityType.PRODUCT,
  })
  @Field(() => SearchEntityType, {
    nullable: true,
    defaultValue: SearchEntityType.PRODUCT,
    description: 'Specifies the primary entity type for the search',
  })
  @IsEnum(SearchEntityType)
  @IsOptional()
  entityType?: SearchEntityType = SearchEntityType.PRODUCT;

  @ApiProperty({
    description: 'Page number (0-indexed)',
    minimum: 1,
    default: 1,
  })
  @Field(() => Int, { defaultValue: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

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
    description: 'Sort options',
    type: [SortOption],
    required: false,
  })
  @Field(() => [SortOption], { nullable: true })
  @Type(() => SortOption)
  @IsOptional()
  sort?: SortOption[];

  @ApiProperty({
    description: 'Filter options',
    type: [FilterOption],
    required: false,
  })
  @Field(() => [FilterOption], { nullable: true })
  @Type(() => FilterOption)
  @IsOptional()
  filters?: FilterOption[];

  @ApiProperty({
    description: 'Range filter options',
    type: [RangeFilterOption],
    required: false,
  })
  @Field(() => [RangeFilterOption], { nullable: true })
  @Type(() => RangeFilterOption)
  @IsOptional()
  rangeFilters?: RangeFilterOption[];

  @ApiProperty({
    description: 'Include personalized results',
    default: true,
  })
  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  personalized?: boolean = true;

  @ApiProperty({
    description: 'Enable personalization based on user preferences',
    default: false,
  })
  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  enablePersonalization?: boolean = false;

  @ApiProperty({
    description: 'Personalization strength (0.0 to 2.0)',
    default: 1.0,
    minimum: 0.0,
    maximum: 2.0,
  })
  @Field(() => Float, { defaultValue: 1.0 })
  @IsOptional()
  personalizationStrength?: number = 1.0;

  @ApiProperty({
    description: 'Enable natural language processing for the query',
    default: false,
  })
  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  enableNlp?: boolean = false;

  @ApiProperty({
    description: 'NLP data for the query (entities, intent, etc.)',
    required: false,
  })
  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  nlpData?: {
    intent: string;
    entities: Array<{ type: string; value: string; confidence: number }>;
    expandedTerms?: string[];
  };

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

  @ApiProperty({
    description: 'Enable A/B testing for search relevance',
    default: false,
  })
  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  enableABTesting?: boolean = false;

  @ApiProperty({
    description: 'Enable analytics tracking',
    default: false,
  })
  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  enableAnalytics?: boolean = false;

  @ApiProperty({
    description: 'Client ID for analytics tracking',
    required: false,
  })
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiProperty({
    description: 'Metadata for internal use',
    required: false,
  })
  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Enable highlighting in search results',
    default: false,
  })
  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  enableHighlighting?: boolean = false;

  @ApiProperty({
    description: 'Fields to highlight',
    type: [String],
    example: ['title', 'description'],
    required: false,
  })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  highlightFields?: string[];

  @ApiProperty({
    description: 'Pre-tag for highlighting',
    example: '<em>',
    default: '<em>',
    required: false,
  })
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  highlightPreTag?: string = '<em>';

  @ApiProperty({
    description: 'Post-tag for highlighting',
    example: '</em>',
    default: '</em>',
    required: false,
  })
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  highlightPostTag?: string = '</em>';

  @ApiProperty({
    description: 'Number of characters to include in highlighted snippets',
    example: 150,
    default: 150,
    required: false,
  })
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  highlightFragmentSize?: number = 150;
}

// Export SearchOptionsInput as SearchOptions for backward compatibility
export { SearchOptionsInput as SearchOptions };
