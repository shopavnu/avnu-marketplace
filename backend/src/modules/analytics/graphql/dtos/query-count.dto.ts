import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType('QueryCount') // Explicitly name the GraphQL type
export class QueryCountDto {
  @Field()
  query: string;

  @Field(() => Int)
  count: number;
}
