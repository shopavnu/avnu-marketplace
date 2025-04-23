import { Field, InputType, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';

/**
 * Input type for search suggestions
 */
@InputType()
export class SearchSuggestionInput {
  @Field()
  @IsString()
  query: string;

  @Field(() => Int, { defaultValue: 5 })
  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  limit: number = 5;

  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  @IsOptional()
  includePopular: boolean = true;

  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  @IsOptional()
  includePersonalized: boolean = true;

  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  @IsOptional()
  includeCategoryContext: boolean = true;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  categories?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  types?: string[];
}
