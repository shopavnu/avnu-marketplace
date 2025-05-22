import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PlatformType } from '../../shared';

/**
 * Entity representing an order in the system
 */
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  merchantId: string;

  @Column({ name: 'external_id' })
  externalId: string;

  @Column({ name: 'platform_type', type: 'enum', enum: PlatformType })
  platformType: PlatformType;

  @Column({ name: 'order_status' })
  orderStatus: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'currency_code', length: 3 })
  currencyCode: string;

  @Column({ name: 'customer_email', nullable: true })
  customerEmail?: string;

  @Column({ name: 'customer_name', nullable: true })
  customerName?: string;

  @Column({ name: 'shipping_address', type: 'json', nullable: true })
  shippingAddress?: Record<string, unknown>;

  @Column({ name: 'billing_address', type: 'json', nullable: true })
  billingAddress?: Record<string, unknown>;

  @Column({ name: 'line_items', type: 'json' })
  lineItems: Record<string, unknown>[];

  @Column({ name: 'external_created_at', type: 'timestamp' })
  externalCreatedAt: Date;

  @Column({ name: 'external_updated_at', type: 'timestamp', nullable: true })
  externalUpdatedAt?: Date;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
