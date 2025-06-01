import { Field, Float, ID, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

@ObjectType('CartItem')
export class CartItemDto {
  @Field(() => ID)
  productId: string;

  @Field(() => String, { nullable: true })
  variantId?: string;

  @Field(() => Float)
  price: number;

  @Field(() => Number)
  quantity: number;

  @Field(() => Date)
  addedAt: Date;
}

@InputType()
export class CartItemInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  variantId?: string;

  @Field(() => Number)
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;
}
