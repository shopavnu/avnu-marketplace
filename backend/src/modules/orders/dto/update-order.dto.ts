// @ts-strict-mode: enabled
import { IsString, IsOptional, ValidateNested, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { ShippingAddressDto } from './create-order.dto';

export class UpdateOrderDto {
  @ApiPropertyOptional({ description: 'ID of the user who placed the order' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Current status of the order', enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Current payment status of the order', enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Tracking number for the shipment' })
  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @ApiPropertyOptional({ description: 'URL to track the shipment' })
  @IsString()
  @IsOptional()
  trackingUrl?: string;

  @ApiPropertyOptional({ description: 'Additional notes for the order' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Whether the order should be prioritized' })
  @IsBoolean()
  @IsOptional()
  isPriority?: boolean;

  @ApiPropertyOptional({
    description: 'Updated shipping address for the order',
    type: ShippingAddressDto,
  })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsOptional()
  shippingAddress?: ShippingAddressDto;

  @ApiPropertyOptional({ description: 'Stripe Payment Intent ID associated with the order' })
  @IsString()
  @IsOptional()
  stripePaymentIntentId?: string;
}
