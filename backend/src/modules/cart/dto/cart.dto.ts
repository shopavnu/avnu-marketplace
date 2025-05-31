import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { CartItemDto } from './cart-item.dto';

@ObjectType('Cart')
export class CartDto {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => [CartItemDto])
  items: CartItemDto[];

  @Field(() => Float)
  subtotal: number;

  @Field(() => Float, { nullable: true })
  tax?: number;

  @Field(() => Float)
  total: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  lastActive?: Date;
}
