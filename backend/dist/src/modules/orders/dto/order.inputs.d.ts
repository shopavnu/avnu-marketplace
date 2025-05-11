import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
export declare class ShippingAddressInput {
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
export declare class OrderItemInput {
  productId: string;
  quantity: number;
  price: number;
  variantId?: string;
  options?: string[];
}
export declare class CreateOrderInput {
  userId: string;
  items: OrderItemInput[];
  shippingAddress: ShippingAddressInput;
  notes?: string;
  isPriority?: boolean;
}
export declare class UpdateOrderInput {
  userId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  isPriority?: boolean;
  shippingAddress?: ShippingAddressInput;
}
export declare class PaginationInput {
  page: number;
  limit: number;
}
