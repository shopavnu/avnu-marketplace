// @ts-strict-mode: enabled
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

/**
 * GraphQL input type for search options
 */
@InputType()
export class SearchOptionsInput {
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  types?: string[];

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  facets?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  sort?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  order?: 'asc' | 'desc';
}
