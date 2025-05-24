import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class Product {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => Float)
  price: number;

  @Field()
  imageUrl: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => String)
  brandId: string;

  @Field(() => Object, { nullable: true })
  brand?: any;

  @Field(() => [Object], { nullable: true })
  variants?: any[];
}
