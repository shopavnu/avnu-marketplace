export declare class ShippingAddressDto {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  email?: string;
}
export declare class CreateOrderItemDto {
  productId: string;
  quantity: number;
  price: number;
  variantId?: string;
  options?: string[];
}
export declare class CreateOrderDto {
  userId: string;
  items: CreateOrderItemDto[];
  shippingAddress: ShippingAddressDto;
  notes?: string;
  isPriority?: boolean;
}
