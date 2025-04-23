import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

/**
 * Input type for search filters
 */
@InputType()
export class SearchFiltersInput {
  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  filters?: Record<string, any>;
}
