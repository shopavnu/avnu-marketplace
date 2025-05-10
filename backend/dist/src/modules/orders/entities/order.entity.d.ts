import { OrderItem } from './order-item.entity';
import { OrderFulfillment } from './order-fulfillment.entity';
import { OrderStatus, PaymentStatus, SyncStatus } from '../enums';
export declare class ShippingAddress {
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
export declare class PlatformActions {
    canCancel: boolean;
    canRefund: boolean;
    canFulfill: boolean;
}
export declare class Order {
    id: string;
    userId: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    shippingAddress: ShippingAddress;
    items: OrderItem[];
    fulfillments?: OrderFulfillment[];
    notes?: string;
    isPriority: boolean;
    syncStatus: SyncStatus;
    platformActions?: PlatformActions;
    customerEmail: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    get canCancel(): boolean;
    get canRefund(): boolean;
    get canFulfill(): boolean;
}
