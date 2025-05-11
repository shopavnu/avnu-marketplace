import { Order } from './order.entity';
export declare class OrderItem {
  id: string;
  orderId: string;
  order?: Order;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  options?: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
