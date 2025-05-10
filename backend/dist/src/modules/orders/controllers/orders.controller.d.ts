import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrderStatus, PaymentStatus, FulfillmentStatus, SyncStatus } from '../enums';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';
import { Order } from '../entities/order.entity';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    findAll(paginationDto: PaginationDto): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    findByCustomer(customerId: string, paginationDto: PaginationDto): Promise<any>;
    findByMerchant(merchantId: string, paginationDto: PaginationDto): Promise<any>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order>;
    updateStatus(id: string, status: OrderStatus): Promise<Order>;
    updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order>;
    updateFulfillmentStatus(id: string, fulfillmentStatus: FulfillmentStatus): Promise<any>;
    cancelOrder(id: string, reason?: string): Promise<any>;
    refundOrder(id: string, amount?: number, reason?: string): Promise<any>;
    syncWithPlatform(id: string): Promise<any>;
    updateSyncStatus(id: string, syncStatus: SyncStatus): Promise<Order>;
    remove(id: string): Promise<void>;
}
