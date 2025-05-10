import { Order } from './order.entity';
import { FulfillmentStatus } from '../enums';
export declare class OrderFulfillment {
    id: string;
    orderId: string;
    order?: Order;
    status: FulfillmentStatus;
    trackingNumber?: string;
    trackingUrl?: string;
    carrierName?: string;
    estimatedDeliveryDate?: Date;
    deliveredAt?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
