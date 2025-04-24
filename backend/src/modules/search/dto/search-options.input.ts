import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsOptional, IsNumber, IsString, IsArray, IsBoolean } from 'class-validator';

@InputType('LegacySearchFiltersInput')
export class LegacySearchFiltersInput {
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  categories?: string[];

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  priceMin?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  priceMax?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  merchantId?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  values?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  brandName?: string;
}

@InputType('LegacySearchSortInput')
export class LegacySearchSortInput {
  @Field()
  @IsString()
  field: string;

  @Field()
  @IsString()
  order: 'asc' | 'desc';
}

@InputType('LegacySearchOptionsInput')
export class LegacySearchOptionsInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  page?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @Field(() => LegacySearchFiltersInput, { nullable: true })
  @IsOptional()
  filters?: LegacySearchFiltersInput;

  @Field(() => LegacySearchSortInput, { nullable: true })
  @IsOptional()
  sort?: LegacySearchSortInput;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  includeMetadata?: boolean;
}
