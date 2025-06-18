import { Field, InputType, ID } from '@nestjs/graphql';

// Retain enum for downstream services even though it is no longer used in SDL
export enum SearchEventType {
  SEARCH_QUERY = 'SEARCH_QUERY',
  SUGGESTION_CLICK = 'SUGGESTION_CLICK',
  SUGGESTION_IMPRESSION = 'SUGGESTION_IMPRESSION',
  SEARCH_RESULT_CLICK = 'SEARCH_RESULT_CLICK',
  PRODUCT_VIEW = 'PRODUCT_VIEW',
  FILTER_APPLY = 'FILTER_APPLY',
  SORT_APPLY = 'SORT_APPLY',
}
import GraphQLJSON from 'graphql-type-json';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsObject,
} from 'class-validator';

/**
 * Input type for tracking search events (flat payload aligned with SDL)
 */
@InputType()
export class SearchEventInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  sessionId!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  query!: string;

  // New field: type of search event (e.g. SEARCH_QUERY, SEARCH_RESULT_CLICK)
  @Field(() => SearchEventType)
  @IsNotEmpty()
  eventType!: SearchEventType;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @Field(() => Number)
  @IsNotEmpty()
  @IsInt()
  resultsCount!: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsInt()
  page?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  deviceType?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  platform?: string;
}
