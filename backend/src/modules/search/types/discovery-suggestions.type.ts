import { ObjectType, Field } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class DiscoverySuggestionsType {
  @Field(() => [String])
  suggestions: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;
}
