import { Field, InputType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

/**
 * Enum representing different types of search-related events
 */
export enum SearchEventType {
  SEARCH_QUERY = 'SEARCH_QUERY',
  SUGGESTION_CLICK = 'SUGGESTION_CLICK',
  SUGGESTION_IMPRESSION = 'SUGGESTION_IMPRESSION',
  SEARCH_RESULT_CLICK = 'SEARCH_RESULT_CLICK',
}

/**
 * Input type for tracking search events
 */
@InputType()
export class SearchEventInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsEnum(SearchEventType)
  eventType: SearchEventType;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  timestamp: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}
