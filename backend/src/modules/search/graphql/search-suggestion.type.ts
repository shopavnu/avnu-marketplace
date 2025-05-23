import { Field, ObjectType, Int } from '@nestjs/graphql';

/**
 * Type for a single search suggestion
 */
@ObjectType()
export class SearchSuggestionType {
  @Field()
  text: string;

  @Field(() => Int)
  score: number;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  type?: string;

  @Field(() => Boolean, { defaultValue: false })
  isPopular: boolean = false;

  @Field(() => Boolean, { defaultValue: false })
  isPersonalized: boolean = false;
}

/**
 * Type for search suggestion response
 */
@ObjectType()
export class SearchSuggestionsResponseType {
  @Field(() => [SearchSuggestionType])
  suggestions: SearchSuggestionType[];

  @Field(() => Int)
  total: number;

  @Field(() => Boolean, { defaultValue: false })
  isPersonalized: boolean = false;

  @Field({ nullable: true })
  originalQuery?: string;

  @Field({ nullable: true })
  error?: string;
}
