import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class ProductInteractionCount {
  @Field()
  productId: string;

  @Field()
  productName: string;

  @Field(() => Int)
  count: number;
}
