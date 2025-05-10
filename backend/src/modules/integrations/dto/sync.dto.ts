import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

/**
 * Sync status enum
 */
export enum SyncStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  NEVER_SYNCED = 'never_synced',
}

/**
 * Webhook topic types for Shopify
 */
export enum ShopifyWebhookTopic {
  PRODUCTS_CREATE = 'products/create',
  PRODUCTS_UPDATE = 'products/update',
  PRODUCTS_DELETE = 'products/delete',
  ORDERS_CREATE = 'orders/create',
  ORDERS_UPDATE = 'orders/update',
  ORDERS_CANCELLED = 'orders/cancelled',
  ORDERS_FULFILLED = 'orders/fulfilled',
  FULFILLMENTS_CREATE = 'fulfillments/create',
  FULFILLMENTS_UPDATE = 'fulfillments/update',
}

/**
 * Webhook topic types for WooCommerce
 */
export enum WooCommerceWebhookTopic {
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_DELETED = 'order.deleted',
}

/**
 * DTO for Shopify webhook headers
 */
export class ShopifyWebhookHeadersDto {
  /**
   * The webhook topic
   * @example "products/create"
   */
  @ApiProperty({
    description: 'The webhook topic',
    enum: ShopifyWebhookTopic,
    example: ShopifyWebhookTopic.PRODUCTS_CREATE,
  })
  @IsEnum(ShopifyWebhookTopic)
  @IsNotEmpty()
  'x-shopify-topic': ShopifyWebhookTopic;

  /**
   * The webhook HMAC signature
   * @example "sha256=abc123..."
   */
  @ApiProperty({
    description: 'The webhook HMAC signature',
    example: 'sha256=abc123...',
  })
  @IsString()
  @IsNotEmpty()
  'x-shopify-hmac-sha256': string;

  /**
   * The shop domain
   * @example "my-store.myshopify.com"
   */
  @ApiProperty({
    description: 'The shop domain',
    example: 'my-store.myshopify.com',
  })
  @IsString()
  @IsNotEmpty()
  'x-shopify-shop-domain': string;
}

/**
 * DTO for WooCommerce webhook headers
 */
export class WooCommerceWebhookHeadersDto {
  /**
   * The webhook topic
   * @example "product.created"
   */
  @ApiProperty({
    description: 'The webhook topic',
    enum: WooCommerceWebhookTopic,
    example: WooCommerceWebhookTopic.PRODUCT_CREATED,
  })
  @IsEnum(WooCommerceWebhookTopic)
  @IsNotEmpty()
  'x-wc-webhook-topic': WooCommerceWebhookTopic;

  /**
   * The webhook signature
   * @example "abc123..."
   */
  @ApiProperty({
    description: 'The webhook signature',
    example: 'abc123...',
  })
  @IsString()
  @IsNotEmpty()
  'x-wc-webhook-signature': string;

  /**
   * The source URL
   * @example "https://my-store.com"
   */
  @ApiProperty({
    description: 'The source URL',
    example: 'https://my-store.com',
  })
  @IsString()
  @IsNotEmpty()
  'x-wc-webhook-source': string;
}

/**
 * DTO for webhook query parameters
 */
export class WebhookQueryDto {
  /**
   * Optional merchant ID
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @ApiProperty({
    description: 'Optional merchant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  merchantId?: string;
}

/**
 * DTO for sync status response
 */
export class SyncStatusResponseDto {
  /**
   * Last synced timestamp
   * @example "2023-01-01T00:00:00.000Z"
   */
  @ApiProperty({
    description: 'Last synced timestamp',
    example: '2023-01-01T00:00:00.000Z',
    nullable: true,
  })
  lastSyncedAt: Date | null;

  /**
   * Sync status
   * @example "completed"
   */
  @ApiProperty({
    description: 'Sync status',
    enum: SyncStatus,
    example: SyncStatus.COMPLETED,
  })
  status: SyncStatus;
}

/**
 * DTO for sync success response
 */
export class SyncSuccessResponseDto {
  /**
   * Success status
   * @example true
   */
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;
}

/**
 * DTO for sync count response
 */
export class SyncCountResponseDto {
  /**
   * Count of synced items
   * @example 42
   */
  @ApiProperty({
    description: 'Count of synced items',
    example: 42,
  })
  count: number;
}
