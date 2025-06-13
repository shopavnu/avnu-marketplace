// @ts-strict-mode: enabled
import { IsInt, IsString, IsOptional, IsEmail, Min, IsNotEmpty } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsInt()
  @Min(1) // Smallest currency unit, e.g., 1 cent
  @IsNotEmpty()
  amount!: number;

  @IsString()
  @IsOptional()
  currency?: string; // e.g., 'usd', 'eur'. Defaults to 'usd' in controller if not provided.

  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @IsString()
  @IsOptional()
  orderId?: string;

  @IsEmail()
  @IsOptional()
  receiptEmail?: string; // Email for Stripe to send receipt to
}
