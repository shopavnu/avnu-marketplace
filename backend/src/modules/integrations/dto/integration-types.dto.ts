import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Integration platform types
 */
export enum IntegrationType {
  SHOPIFY = 'shopify',
  WOOCOMMERCE = 'woocommerce',
}

/**
 * DTO for integration type parameter
 */
export class IntegrationTypeParamDto {
  /**
   * Type of integration platform
   * @example "shopify"
   */
  @ApiProperty({
    description: 'Type of integration platform',
    enum: IntegrationType,
    example: IntegrationType.SHOPIFY,
  })
  @IsEnum(IntegrationType)
  @IsNotEmpty()
  type: IntegrationType;
}

/**
 * Base credentials for integration authentication
 */
export class BaseCredentialsDto {
  /**
   * API key or client ID for the integration
   * @example "your_api_key"
   */
  @ApiProperty({
    description: 'API key or client ID for the integration',
    example: 'your_api_key',
  })
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  /**
   * API secret or client secret for the integration
   * @example "your_api_secret"
   */
  @ApiProperty({
    description: 'API secret or client secret for the integration',
    example: 'your_api_secret',
  })
  @IsString()
  @IsNotEmpty()
  apiSecret: string;
}

/**
 * Shopify-specific credentials
 */
export class ShopifyCredentialsDto extends BaseCredentialsDto {
  /**
   * Shopify store domain
   * @example "your-store.myshopify.com"
   */
  @ApiProperty({
    description: 'Shopify store domain',
    example: 'your-store.myshopify.com',
  })
  @IsString()
  @IsNotEmpty()
  shopDomain: string;
}

/**
 * WooCommerce-specific credentials
 */
export class WooCommerceCredentialsDto extends BaseCredentialsDto {
  /**
   * WooCommerce store URL
   * @example "https://your-store.com"
   */
  @ApiProperty({
    description: 'WooCommerce store URL',
    example: 'https://your-store.com',
  })
  @IsString()
  @IsNotEmpty()
  storeUrl: string;
}

/**
 * DTO for authentication request
 */
export class AuthenticateRequestDto {
  /**
   * Integration credentials
   */
  @ApiProperty({
    description: 'Integration credentials',
    oneOf: [
      { $ref: getSchemaPath(ShopifyCredentialsDto) },
      { $ref: getSchemaPath(WooCommerceCredentialsDto) },
    ],
  })
  @IsObject()
  @ValidateNested()
  @Type(() => BaseCredentialsDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: ShopifyCredentialsDto, name: IntegrationType.SHOPIFY },
        { value: WooCommerceCredentialsDto, name: IntegrationType.WOOCOMMERCE },
      ],
    },
  })
  credentials: ShopifyCredentialsDto | WooCommerceCredentialsDto;
}

/**
 * DTO for sync products request
 */
export class SyncProductsRequestDto {
  /**
   * Integration credentials
   */
  @ApiProperty({
    description: 'Integration credentials',
    oneOf: [
      { $ref: getSchemaPath(ShopifyCredentialsDto) },
      { $ref: getSchemaPath(WooCommerceCredentialsDto) },
    ],
  })
  @IsObject()
  @ValidateNested()
  @Type(() => BaseCredentialsDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: ShopifyCredentialsDto, name: IntegrationType.SHOPIFY },
        { value: WooCommerceCredentialsDto, name: IntegrationType.WOOCOMMERCE },
      ],
    },
  })
  credentials: ShopifyCredentialsDto | WooCommerceCredentialsDto;

  /**
   * Merchant ID
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @ApiProperty({
    description: 'Merchant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  merchantId: string;
}

/**
 * DTO for webhook request
 */
export class WebhookRequestDto {
  /**
   * Webhook payload
   */
  @ApiProperty({
    description: 'Webhook payload',
    type: Object,
  })
  @IsObject()
  payload: unknown;

  /**
   * Webhook topic
   * @example "products/create"
   */
  @ApiProperty({
    description: 'Webhook topic',
    example: 'products/create',
  })
  @IsString()
  @IsNotEmpty()
  topic: string;

  /**
   * Merchant ID
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @ApiProperty({
    description: 'Merchant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  merchantId: string;
}
