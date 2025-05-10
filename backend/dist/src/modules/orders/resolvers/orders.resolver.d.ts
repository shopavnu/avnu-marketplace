import { OrdersService } from '../services/orders.service';
import { CreateOrderInput, UpdateOrderInput, PaginationInput } from '../dto/order.inputs';
import { OrderStatus, PaymentStatus, FulfillmentStatus, SyncStatus } from '../enums';
export declare class OrdersResolver {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findAll(pagination?: PaginationInput): Promise<import("..").Order[]>;
    findOne(id: string): Promise<import("..").Order>;
    findByCustomer(customerId: string, pagination?: PaginationInput): Promise<any>;
    findByMerchant(merchantId: string, pagination?: PaginationInput): Promise<any>;
    create(createOrderInput: CreateOrderInput): Promise<import("..").Order>;
    update(id: string, updateOrderInput: UpdateOrderInput): Promise<import("..").Order>;
    updateStatus(id: string, status: OrderStatus): Promise<import("..").Order>;
    updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<import("..").Order>;
    updateFulfillmentStatus(id: string, fulfillmentStatus: FulfillmentStatus): Promise<any>;
    cancelOrder(id: string, reason?: string): Promise<any>;
    refundOrder(id: string, amount?: number, reason?: string): Promise<any>;
    syncWithPlatform(id: string): Promise<any>;
    updateSyncStatus(id: string, syncStatus: SyncStatus): Promise<import("..").Order>;
    remove(id: string): Promise<boolean>;
}
