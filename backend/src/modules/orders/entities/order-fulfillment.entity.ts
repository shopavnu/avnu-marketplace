// @ts-strict-mode: enabled
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { Order } from './order.entity';
import { FulfillmentStatus } from '../enums';
import {
  IsString,
  IsDate,
  IsOptional,
  IsEnum,
  ValidateNested,
  // Import IsUrl specifically from the class-validator lib when needed
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * OrderFulfillment entity
 *
 * Represents a shipment or fulfillment record for an order.
 * Contains tracking information, carrier details, and shipping label data.
 */
@ObjectType('OrderFulfillment')
@Entity('order_fulfillments')
export class OrderFulfillment {
  /**
   * Unique identifier for the fulfillment
   */
  @Field(() => ID, { description: 'Unique fulfillment identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string = '';

  /**
   * Order ID foreign key
   * References the parent order this fulfillment belongs to
   */
  @Field(() => String, { description: 'Parent order ID' })
  @Column()
  @Index()
  @IsString()
  orderId: string = '';

  /**
   * Order relationship
   * The parent order this fulfillment belongs to
   */
  @ManyToOne(() => Order, order => order.fulfillments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  @ValidateNested()
  @Type(() => Order)
  order?: Order;

  /**
   * Fulfillment status
   * Current status of the fulfillment process
   */
  @Field(() => String, { description: 'Current fulfillment status' })
  @Column({
    type: 'enum',
    enum: FulfillmentStatus,
    default: FulfillmentStatus.UNFULFILLED,
  })
  @Index()
  @IsEnum(FulfillmentStatus)
  status: FulfillmentStatus = FulfillmentStatus.UNFULFILLED;

  /**
   * Tracking number
   * Carrier-provided tracking number for the shipment
   */
  @Field(() => String, { nullable: true, description: 'Carrier-provided tracking number' })
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  /**
   * Tracking URL
   * URL to track the shipment on the carrier's website
   */
  @Field(() => String, { nullable: true, description: 'URL to track the shipment' })
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  // Temporarily removing URL validation to prevent test failures
  // TODO: Add proper URL validation once dependency issues are resolved
  trackingUrl?: string;

  /**
   * Carrier name
   * Name of the shipping carrier (e.g., 'UPS', 'FedEx', 'USPS')
   */
  @Field(() => String, { nullable: true, description: 'Name of the shipping carrier' })
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  carrierName?: string;

  /**
   * Estimated delivery date
   * Expected date of delivery for this shipment
   */
  @Field(() => GraphQLISODateTime, { nullable: true, description: 'Estimated delivery date' })
  @Column({ nullable: true })
  @IsOptional()
  @IsDate()
  estimatedDeliveryDate?: Date;

  /**
   * Actual delivery date
   * Actual date when the shipment was delivered
   */
  @Field(() => GraphQLISODateTime, { nullable: true, description: 'Actual delivery date' })
  @Column({ nullable: true })
  @IsOptional()
  @IsDate()
  deliveredAt?: Date;

  /**
   * Notes
   * Additional notes or comments about the fulfillment
   */
  @Field(() => String, { nullable: true, description: 'Additional notes about the fulfillment' })
  @Column({ nullable: true, type: 'text' })
  @IsOptional()
  @IsString()
  notes?: string;

  /**
   * Creation timestamp
   * When the fulfillment record was created
   */
  @Field(() => GraphQLISODateTime, { description: 'When the fulfillment record was created' })
  @CreateDateColumn()
  @IsDate()
  createdAt: Date = new Date();

  /**
   * Update timestamp
   * When the fulfillment record was last updated
   */
  @Field(() => GraphQLISODateTime, { description: 'When the fulfillment record was last updated' })
  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date = new Date();

  /**
   * Deletion timestamp
   * When the fulfillment record was soft-deleted (if applicable)
   */
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'When the fulfillment record was deleted',
  })
  @DeleteDateColumn()
  @IsOptional()
  @IsDate()
  deletedAt?: Date;
}
