import { ObjectType, Field } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class SuggestionType {
  @Field()
  text: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  prefix?: string;

  @Field({ nullable: true })
  highlighted?: string;
}

@ObjectType()
export class AutocompleteSuggestionsType {
  @Field(() => [SuggestionType])
  suggestions: SuggestionType[];

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;
}
