import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Variant {
  @Field(() => ID)
  id: string;

  @Field()
  optionName: string;

  @Field()
  optionValue: string;

  @Field(() => Int)
  stock: number;

  @Field()
  productId: string;

  @Field(() => Object, { nullable: true })
  product?: any;
}
