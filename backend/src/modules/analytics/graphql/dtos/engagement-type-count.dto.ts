import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class EngagementTypeCount {
  @Field()
  type: string;

  @Field(() => Int)
  count: number;
}
