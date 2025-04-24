import { InputType, Field, ID, Int, Float } from '@nestjs/graphql';

@InputType()
export class OrderItemInput {
  @Field(() => ID)
  productId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float) // Assuming price is a float
  price: number; // Price per unit at the time of purchase

  // Add other relevant fields if known, e.g., variantId, name, etc.
  // @Field(() => ID, { nullable: true })
  // variantId?: string;
}
