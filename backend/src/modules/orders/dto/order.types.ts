// @ts-strict-mode: enabled
import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { FulfillmentStatus } from '../enums/fulfillment-status.enum';

@ObjectType()
export class ShippingAddressType {
  @Field()
  firstName: string = '';

  @Field()
  lastName: string = '';

  @Field()
  addressLine1: string = '';

  @Field({ nullable: true })
  addressLine2?: string;

  @Field()
  city: string = '';

  @Field()
  state: string = '';

  @Field()
  postalCode: string = '';

  @Field()
  country: string = '';

  @Field({ nullable: true })
  phoneNumber?: string;

  @Field({ nullable: true })
  email?: string;
}

@ObjectType()
export class OrderFulfillmentType {
  @Field(() => ID)
  id: string = '';

  @Field(() => ID)
  orderId: string = '';

  @Field(() => String)
  status: FulfillmentStatus = FulfillmentStatus.UNFULFILLED;

  @Field({ nullable: true })
  trackingNumber?: string;

  @Field({ nullable: true })
  trackingUrl?: string;

  @Field({ nullable: true })
  carrierName?: string;

  @Field(() => Date)
  createdAt: Date = new Date();

  @Field(() => Date)
  updatedAt: Date = new Date();
}

@ObjectType()
export class OrderItemType {
  @Field(() => ID)
  id: string = '';

  @Field(() => ID)
  orderId: string = '';

  @Field(() => ID)
  productId: string = '';

  @Field(() => Int)
  quantity: number = 1;

  @Field(() => Float)
  price: number = 0;

  @Field(() => ID, { nullable: true })
  variantId?: string;

  @Field(() => [String], { nullable: true })
  options?: string[];

  @Field(() => Date)
  createdAt: Date = new Date();

  @Field(() => Date)
  updatedAt: Date = new Date();
}

@ObjectType()
export class PlatformActionsType {
  @Field(() => Boolean)
  canCancel: boolean = false;

  @Field(() => Boolean)
  canRefund: boolean = false;

  @Field(() => Boolean)
  canModify: boolean = false;
}

@ObjectType()
export class OrderType {
  @Field(() => ID)
  id: string = '';

  @Field(() => ID)
  userId: string = '';

  @Field(() => String)
  status: OrderStatus = OrderStatus.PENDING;

  @Field(() => String)
  paymentStatus: PaymentStatus = PaymentStatus.PENDING;

  @Field(() => ShippingAddressType)
  shippingAddress: ShippingAddressType = new ShippingAddressType();

  @Field(() => [OrderItemType])
  items: OrderItemType[] = [];

  @Field(() => [OrderFulfillmentType], { nullable: true })
  fulfillments?: OrderFulfillmentType[];

  @Field({ nullable: true })
  notes?: string;

  @Field(() => Boolean, { defaultValue: false })
  isPriority: boolean = false;

  @Field(() => PlatformActionsType)
  platformActions: PlatformActionsType = {
    canCancel: false,
    canRefund: false,
    canModify: false,
  };

  @Field(() => Date)
  createdAt: Date = new Date();

  @Field(() => Date)
  updatedAt: Date = new Date();
}

@ObjectType()
export class PaginatedOrdersType {
  @Field(() => [OrderType])
  items: OrderType[] = [];

  @Field(() => Int)
  total: number = 0;

  @Field(() => Int)
  page: number = 1;

  @Field(() => Int)
  limit: number = 10;

  @Field(() => Int)
  totalPages: number = 0;
}
