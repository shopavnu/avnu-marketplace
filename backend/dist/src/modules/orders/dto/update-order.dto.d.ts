import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { ShippingAddressDto } from './create-order.dto';
export declare class UpdateOrderDto {
    userId?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    trackingNumber?: string;
    trackingUrl?: string;
    notes?: string;
    isPriority?: boolean;
    shippingAddress?: ShippingAddressDto;
}
