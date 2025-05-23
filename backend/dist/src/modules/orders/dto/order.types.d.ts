import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { FulfillmentStatus } from '../enums/fulfillment-status.enum';
export declare class ShippingAddressType {
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
export declare class OrderFulfillmentType {
    id: string;
    orderId: string;
    status: FulfillmentStatus;
    trackingNumber?: string;
    trackingUrl?: string;
    carrierName?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class OrderItemType {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    variantId?: string;
    options?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class PlatformActionsType {
    canCancel: boolean;
    canRefund: boolean;
    canModify: boolean;
}
export declare class OrderType {
    id: string;
    userId: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    shippingAddress: ShippingAddressType;
    items: OrderItemType[];
    fulfillments?: OrderFulfillmentType[];
    notes?: string;
    isPriority: boolean;
    platformActions: PlatformActionsType;
    createdAt: Date;
    updatedAt: Date;
}
export declare class PaginatedOrdersType {
    items: OrderType[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
