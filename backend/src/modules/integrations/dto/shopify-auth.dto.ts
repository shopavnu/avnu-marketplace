import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ShopifyAuthorizeDto {
  @ApiProperty({ description: 'Merchant ID', example: '1' })
  @IsNotEmpty()
  @IsString()
  merchantId: string;

  @ApiProperty({ description: 'Shopify shop domain', example: 'my-store.myshopify.com' })
  @IsNotEmpty()
  @IsString()
  shopDomain: string;
}

export class ShopifyCallbackDto {
  @ApiProperty({ description: 'Authorization code from Shopify', example: '1234567890' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ description: 'State parameter for CSRF protection', example: 'state-token' })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({ description: 'Shopify shop domain', example: 'my-store.myshopify.com' })
  @IsNotEmpty()
  @IsString()
  shop: string;
}
