// @ts-strict-mode: enabled
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  ValidateNested,
  IsBoolean,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShippingAddressDto {
  @ApiProperty({ description: 'First name of the recipient' })
  @IsString()
  firstName: string = '';

  @ApiProperty({ description: 'Last name of the recipient' })
  @IsString()
  lastName: string = '';

  @ApiProperty({ description: 'First line of the shipping address' })
  @IsString()
  addressLine1: string = '';

  @ApiPropertyOptional({ description: 'Second line of the shipping address' })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ description: 'City of the shipping address' })
  @IsString()
  city: string = '';

  @ApiProperty({ description: 'State/province of the shipping address' })
  @IsString()
  state: string = '';

  @ApiProperty({ description: 'Postal/zip code of the shipping address' })
  @IsString()
  postalCode: string = '';

  @ApiProperty({ description: 'Country of the shipping address' })
  @IsString()
  country: string = '';

  @ApiPropertyOptional({ description: 'Phone number of the recipient' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Email of the recipient' })
  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;
}

export class CreateOrderItemDto {
  @ApiProperty({ description: 'ID of the product being ordered' })
  @IsString()
  productId: string = '';

  @ApiProperty({ description: 'Quantity of the product being ordered' })
  @IsNumber()
  quantity: number = 1;

  @ApiProperty({ description: 'Price per unit of the product' })
  @IsNumber()
  price: number = 0;

  @ApiPropertyOptional({ description: 'ID of the product variant if applicable' })
  @IsString()
  @IsOptional()
  variantId?: string;

  @ApiPropertyOptional({ description: 'Additional options for the product' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];
}

export class CreateOrderDto {
  @ApiProperty({ description: 'ID of the user placing the order' })
  @IsString()
  userId: string = '';

  @ApiProperty({ description: 'Items included in the order', type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[] = [];

  @ApiProperty({ description: 'Shipping address for the order', type: ShippingAddressDto })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto = new ShippingAddressDto();

  @ApiPropertyOptional({ description: 'Additional notes for the order' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Whether the order should be prioritized', default: false })
  @IsBoolean()
  @IsOptional()
  isPriority?: boolean;
}
