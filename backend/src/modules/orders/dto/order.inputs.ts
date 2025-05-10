// @ts-strict-mode: enabled
import { InputType, Field, ID, Int, Float } from '@nestjs/graphql';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  Min,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class ShippingAddressInput {
  @Field()
  @IsString()
  firstName: string = '';

  @Field()
  @IsString()
  lastName: string = '';

  @Field()
  @IsString()
  addressLine1: string = '';

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @Field()
  @IsString()
  city: string = '';

  @Field()
  @IsString()
  state: string = '';

  @Field()
  @IsString()
  postalCode: string = '';

  @Field()
  @IsString()
  country: string = '';

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  email?: string;
}

@InputType()
export class OrderItemInput {
  @Field(() => ID)
  @IsString()
  productId: string = '';

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity: number = 1;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price: number = 0;

  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  variantId?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];
}

@InputType()
export class CreateOrderInput {
  @Field(() => ID)
  @IsString()
  userId: string = '';

  @Field(() => [OrderItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[] = [];

  @Field(() => ShippingAddressInput)
  @ValidateNested()
  @Type(() => ShippingAddressInput)
  shippingAddress: ShippingAddressInput = new ShippingAddressInput();

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isPriority?: boolean;
}

@InputType()
export class UpdateOrderInput {
  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  userId?: string;

  @Field(() => String, { nullable: true })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @Field(() => String, { nullable: true })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  trackingUrl?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isPriority?: boolean;

  @Field(() => ShippingAddressInput, { nullable: true })
  @ValidateNested()
  @Type(() => ShippingAddressInput)
  @IsOptional()
  shippingAddress?: ShippingAddressInput;
}

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  @Min(1)
  page: number = 1;

  @Field(() => Int, { defaultValue: 10 })
  @IsNumber()
  @Min(1)
  limit: number = 10;
}
