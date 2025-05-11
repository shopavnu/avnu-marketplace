import { OrdersService } from '../services/orders.service';
import { CreateOrderInput, UpdateOrderInput, PaginationInput } from '../dto/order.inputs';
import { OrderStatus, PaymentStatus, FulfillmentStatus, SyncStatus } from '../enums';
export declare class OrdersResolver {
  private readonly ordersService;
  constructor(ordersService: OrdersService);
  findAll(pagination?: PaginationInput): Promise<{
    items: import('..').Order[];
    total: number;
    page: number;
    pageSize: number;
  }>;
  findOne(id: string): Promise<import('..').Order>;
  findByCustomer(
    customerId: string,
    pagination?: PaginationInput,
  ): Promise<{
    items: import('..').Order[];
    total: number;
    page: number;
    pageSize: number;
  }>;
  findByMerchant(
    merchantId: string,
    pagination?: PaginationInput,
  ): Promise<{
    items: import('..').Order[];
    total: number;
    page: number;
    pageSize: number;
  }>;
  create(createOrderInput: CreateOrderInput): Promise<import('..').Order>;
  update(id: string, updateOrderInput: UpdateOrderInput): Promise<import('..').Order>;
  updateStatus(id: string, status: OrderStatus): Promise<import('..').Order>;
  updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<import('..').Order>;
  updateFulfillmentStatus(id: string, status: FulfillmentStatus): Promise<import('..').Order>;
  cancelOrder(id: string, reason?: string): Promise<import('..').Order>;
  refundOrder(id: string, amount?: number, reason?: string): Promise<import('..').Order>;
  syncWithPlatform(id: string): Promise<import('..').Order>;
  updateSyncStatus(id: string, syncStatus: SyncStatus): Promise<import('..').Order>;
  remove(id: string): Promise<boolean>;
}
